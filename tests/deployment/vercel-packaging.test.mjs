import assert from 'node:assert/strict';
import { fork } from 'node:child_process';
import { once } from 'node:events';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('../../', import.meta.url));
const backend = join(root, 'backend');
const require = createRequire(join(backend, 'package.json'));
const { build } = await import(pathToFileURL(require.resolve('@vercel/backends')));
const readJson = async path => JSON.parse(await readFile(path, 'utf8'));

test('Vercel artifact resolves production dependencies from its handler', { timeout: 120_000 }, async t => {
  const temporary = await mkdtemp(join(tmpdir(), '179fc-vercel-'));
  t.after(() => rm(temporary, { recursive: true, force: true }));
  const fixture = join(temporary, 'repo', 'backend');
  await mkdir(fixture, { recursive: true });
  const [config, pkg, lock] = await Promise.all([
    readJson(join(root, 'vercel.json')),
    readJson(join(backend, 'package.json')),
    readJson(join(backend, 'package-lock.json')),
  ]);

  // Copy only synthetic application code, compiled output and locked production
  // packages. Never copy local env files, credentials or the rest of the repo.
  await Promise.all(['src', 'dist'].map(path => cp(join(backend, path), join(fixture, path), { recursive: true })));
  await cp(join(backend, 'tsconfig.json'), join(fixture, 'tsconfig.json'));
  await writeFile(join(fixture, 'package.json'), JSON.stringify({
    name: pkg.name, private: true, engines: pkg.engines, dependencies: pkg.dependencies,
  }));
  const packages = Object.entries(lock.packages)
    .filter(([path, metadata]) => path.startsWith('node_modules/') && !metadata.dev)
    .map(([path]) => path)
    .filter((path, _, paths) => !paths.some(parent => path.startsWith(`${parent}/`)));
  for (const path of packages) {
    await cp(join(backend, path), join(fixture, path), { recursive: true });
  }

  // The build has already run via test:deployment. Mark it successful so the
  // real builder selects its normal user-build-output path, without reinstalling.
  const service = config.services.backend;
  const result = await build({
    files: {},
    entrypoint: service.entrypoint ?? 'src/main.ts',
    workPath: fixture,
    repoRootPath: dirname(fixture),
    config: {
      ...service,
      serviceName: 'backend',
      projectSettings: { installCommand: '', buildCommand: 'node -e ""' },
    },
    meta: { skipDownload: true },
  });
  const functions = Object.values(result.output).filter(output => output.type === 'Lambda');
  assert.equal(functions.length, 1);
  const lambda = functions[0];
  const artifact = join(temporary, 'artifact');
  for (const [path, file] of Object.entries(lambda.files)) {
    const destination = resolve(artifact, path);
    assert.ok(relative(artifact, destination) && !relative(artifact, destination).startsWith('..'));
    assert.doesNotMatch(path, /(?:^|[/\\])\.env(?:[./\\]|$)/);
    assert.notEqual(file.mode & 0o170000, 0o120000, `Unexpected symlink: ${path}`);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, file.type === 'FileFsRef' ? await readFile(file.fsPath) : file.data);
  }
  const handler = resolve(artifact, lambda.handler);
  const runtimeRequire = createRequire(handler);
  for (const dependency of Object.keys(pkg.dependencies)) {
    const resolved = runtimeRequire.resolve(dependency);
    assert.ok(resolved.startsWith(`${artifact}/`) || resolved.startsWith(`${artifact}\\`), dependency);
  }
  t.diagnostic(`handler=${lambda.handler}; ${Object.keys(pkg.dependencies).length} production dependencies resolve inside artifact`);

  await t.test('isolated Linux function serves the current health payload', {
    // Vercel runs Linux. Upstream 28.0.0 emits malformed CJS shim separators on
    // Windows; the dependency-layout assertion above still runs on every OS.
    skip: process.platform === 'win32' && 'Upstream Vercel CJS shims require Linux; run in WSL or Backend CI',
    timeout: 15_000,
  }, async () => {
    const child = fork(handler, [], {
      cwd: artifact,
      execArgv: ['--require', fileURLToPath(new URL('./fixtures/ephemeral-listener.cjs', import.meta.url))],
      env: { ...process.env, DATABASE_ENABLED: 'false', NODE_PATH: '', NODE_ENV: 'production' },
      silent: true,
    });
    let output = '';
    child.stdout.on('data', chunk => { output += chunk; });
    child.stderr.on('data', chunk => { output += chunk; });
    const exited = once(child, 'exit');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    try {
      const [message] = await Promise.race([
        once(child, 'message', { signal: controller.signal }),
        exited.then(([code]) => { throw new Error(`Function exited (${code}): ${output}`); }),
      ]);
      const response = await fetch(`${message.url}/health`);
      assert.equal(response.status, 200, output);
      assert.deepEqual(await response.json(), { service: '179fc-mms-backend', status: 'ok' });
      const readiness = await fetch(`${message.url}/health/ready`);
      assert.equal(readiness.status, 503);
      assert.deepEqual(await readiness.json(), {
        service: '179fc-mms-backend', status: 'not_ready', database: 'disabled',
      });
    } finally {
      clearTimeout(timer);
      controller.abort();
      child.kill();
      await exited;
    }
  });
});
