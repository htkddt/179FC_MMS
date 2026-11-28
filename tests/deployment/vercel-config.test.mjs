import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const vercelConfigUrl = new URL('../../vercel.json', import.meta.url);
const backendWorkflowUrl = new URL(
  '../../.github/workflows/backend-ci.yml',
  import.meta.url,
);
const frontendWorkflowUrl = new URL(
  '../../.github/workflows/frontend-ci.yml',
  import.meta.url,
);
const runsWorkflowUrl = new URL(
  '../../.github/workflows/runs.yml',
  import.meta.url,
);
const backendPackageUrl = new URL('../../backend/package.json', import.meta.url);
const frontendPackageUrl = new URL('../../frontend/package.json', import.meta.url);
const backendPackageLockUrl = new URL('../../backend/package-lock.json', import.meta.url);
const frontendPackageLockUrl = new URL('../../frontend/package-lock.json', import.meta.url);

async function readVercelConfig() {
  return JSON.parse(await readFile(vercelConfigUrl, 'utf8'));
}

async function readNormalizedFile(url) {
  return (await readFile(url, 'utf8')).replace(/\r\n/g, '\n');
}

async function readPackageJson(url) {
  return JSON.parse(await readFile(url, 'utf8'));
}

test('routes API traffic to NestJS before the Vite frontend catch-all', async () => {
  const config = await readVercelConfig();

  assert.deepEqual(config.rewrites, [
    {
      source: '/api/(.*)',
      destination: { service: 'backend' },
    },
    {
      source: '/(.*)',
      destination: { service: 'frontend' },
    },
  ]);
  assert.equal(config.services.backend.root, 'backend');
  assert.equal(config.services.backend.framework, 'nestjs');
  assert.deepEqual(config.services.backend.routes, [
    {
      src: '/api/(.*)',
      transforms: [
        {
          type: 'request.path',
          op: 'set',
          args: '/$1',
        },
      ],
    },
  ]);
  assert.equal(config.services.frontend.root, 'frontend');
  assert.equal(config.services.frontend.framework, 'vite');
  assert.deepEqual(config.services.frontend.rewrites, [
    {
      source: '/(.*)',
      destination: '/index.html',
    },
  ]);
});

test('does not declare a binding without a runtime service-to-service caller', async () => {
  const config = await readVercelConfig();

  assert.equal(config.services.backend.bindings, undefined);
  assert.equal(config.services.frontend.bindings, undefined);
});

test('runs backend and frontend CI from committed lockfiles without a GitHub Pages deploy', async () => {
  const [caller, backendWorkflow, frontendWorkflow] = await Promise.all([
    readNormalizedFile(runsWorkflowUrl),
    readNormalizedFile(backendWorkflowUrl),
    readNormalizedFile(frontendWorkflowUrl),
  ]);

  assert.match(
    caller,
    /pull_request:\n    branches:\n      - main\n    types: \[opened, synchronize, reopened\]/,
  );
  assert.match(caller, /\n    uses: \.\/\.github\/workflows\/backend-ci\.yml/);
  assert.match(caller, /\n    uses: \.\/\.github\/workflows\/frontend-ci\.yml/);
  for (const callee of [backendWorkflow, frontendWorkflow]) {
    assert.match(callee, /on:\n  workflow_call:\n\n/);
    assert.doesNotMatch(callee, /\n  pull_request:|\bconcurrency:/);
  }
  assert.match(backendWorkflow, /cache-dependency-path: backend\/package-lock\.json/);
  assert.match(backendWorkflow, /working-directory: backend\n        run: npm ci/);
  assert.match(backendWorkflow, /working-directory: backend\n        run: npm run build/);
  assert.match(backendWorkflow, /working-directory: backend\n        run: npm test/);
  assert.match(backendWorkflow, /working-directory: backend\n        run: npm run test:deployment/);
  assert.match(frontendWorkflow, /cache-dependency-path: frontend\/package-lock\.json/);
  assert.match(frontendWorkflow, /working-directory: frontend\n        run: npm ci/);
  assert.match(frontendWorkflow, /working-directory: frontend\n        run: npm run build/);
  assert.match(frontendWorkflow, /working-directory: frontend\n        run: npm test/);
  assert.match(
    frontendWorkflow,
    /working-directory: frontend\n        env:\n          PLAYWRIGHT_CHANNEL: chromium\n        run: npm run test:browser/,
  );
  for (const workflow of [caller, backendWorkflow, frontendWorkflow]) {
    assert.doesNotMatch(workflow, /actions\/(configure-pages|upload-pages-artifact|deploy-pages)@/);
    assert.doesNotMatch(workflow, /\bpages:\s*write|github-pages|VITE_BASE_PATH/);
    assert.match(workflow, /permissions:\n  contents: read\n\n/);
  }
});

test('pins Node.js 26 across Vercel services, lockfiles, and pull-request CI', async () => {
  const [backendPackage, frontendPackage, backendPackageLock, frontendPackageLock, backendWorkflow, frontendWorkflow] = await Promise.all([
    readPackageJson(backendPackageUrl),
    readPackageJson(frontendPackageUrl),
    readPackageJson(backendPackageLockUrl),
    readPackageJson(frontendPackageLockUrl),
    readNormalizedFile(backendWorkflowUrl),
    readNormalizedFile(frontendWorkflowUrl),
  ]);

  assert.equal(backendPackage.engines.node, '26.x');
  assert.equal(frontendPackage.engines.node, '26.x');
  assert.equal(backendPackageLock.packages[''].engines.node, '26.x');
  assert.equal(frontendPackageLock.packages[''].engines.node, '26.x');
  assert.match(backendWorkflow, /node-version: 26/);
  assert.match(frontendWorkflow, /node-version: 26/g);
});
