import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const workflowsUrl = new URL("../../.github/workflows/", import.meta.url);

function normalizeWorkflowLineEndings(source) {
  return source.replace(/\r\n/g, "\n");
}

async function readWorkflow(name) {
  return normalizeWorkflowLineEndings(
    await readFile(new URL(name, workflowsUrl), "utf8"),
  );
}

test("runs both reusable CI workflows from the single pull-request entrypoint", async () => {
  const caller = await readWorkflow("runs.yml");

  assert.match(
    caller,
    /on:\n  pull_request:\n    branches:\n      - main\n    types: \[opened, synchronize, reopened\]/,
  );
  assert.match(caller, /\n    uses: \.\/\.github\/workflows\/backend-ci\.yml/);
  assert.match(caller, /\n    uses: \.\/\.github\/workflows\/frontend-ci\.yml/);
  assert.doesNotMatch(caller, /\n    (steps|needs|runs-on):/);
});

test("keeps reusable frontend Build and Test gates without duplicate PR triggers", async () => {
  const [frontend, backend] = await Promise.all([
    readWorkflow("frontend-ci.yml"),
    readWorkflow("backend-ci.yml"),
  ]);

  for (const callee of [frontend, backend]) {
    assert.match(callee, /on:\n  workflow_call:\n\n/);
    assert.doesNotMatch(callee, /\n  (pull_request|push|workflow_dispatch):/);
  }
  assert.match(frontend, /\n  build:\n    name: Build/);
  assert.match(frontend, /\n  test:\n    name: Test\n    needs: build/);
  assert.match(frontend, /cache-dependency-path: frontend\/package-lock\.json/);
  assert.equal((frontend.match(/run: npm ci\n/g) ?? []).length, 2);
  assert.match(frontend, /working-directory: frontend\n        run: npm run build/);
  assert.match(frontend, /working-directory: frontend\n        run: npm test/);
  assert.match(frontend, /run: npx playwright install --with-deps chromium/);
  assert.match(
    frontend,
    /working-directory: frontend\n        env:\n          PLAYWRIGHT_CHANNEL: chromium\n        run: npm run test:browser/,
  );
  assert.equal((frontend.match(/node-version: 26\n/g) ?? []).length, 2);
});

test("gates backend tests on Build and prepares each runner independently", async () => {
  const backend = await readWorkflow("backend-ci.yml");
  const jobs = [...backend.matchAll(/^  (\w+):\n    name: (.+)\n/gm)];
  assert.deepEqual(jobs.map(([, id, name]) => [id, name]), [
    ["build", "Build"], ["test", "Test"],
  ]);
  const build = backend.slice(jobs[0].index, jobs[1].index);
  const testJob = backend.slice(jobs[1].index);
  assert.match(testJob, /^  test:\n    name: Test\n    needs: build\n/);
  // Default success gating must not be bypassed at job or step level.
  assert.doesNotMatch(backend, /^\s+(if|continue-on-error):/m);
  for (const job of [build, testJob]) {
    assert.match(job, /runs-on: ubuntu-latest/);
    assert.match(job, /uses: actions\/checkout@v6/);
    assert.match(job, /uses: actions\/setup-node@v6/);
    assert.match(job, /node-version: 26\n/);
    assert.match(job, /cache-dependency-path: backend\/package-lock\.json/);
    assert.match(job, /working-directory: backend\n        run: npm ci\n/);
  }
  assert.match(build, /working-directory: backend\n        run: npm run build\n/);
  assert.doesNotMatch(build, /run: npm (?:test|run test:)/);
  assert.match(testJob, /working-directory: backend\n        run: npm test\n/);
  assert.match(testJob, /working-directory: backend\n        run: npm run test:deployment\n/);
  assert.doesNotMatch(testJob, /run: npm run test:ci/);
  const scripts = JSON.parse(await readFile(
    new URL("../../backend/package.json", import.meta.url), "utf8",
  )).scripts;
  assert.equal(scripts.test, "npm run test:unit && npm run test:integration");
  assert.equal(scripts["test:deployment"], "npm run build && node --test ../tests/deployment/*.test.mjs");
});

test("owns cancellation in the caller and grants only read permission to callees", async () => {
  const [caller, frontend, backend] = await Promise.all([
    readWorkflow("runs.yml"),
    readWorkflow("frontend-ci.yml"),
    readWorkflow("backend-ci.yml"),
  ]);

  assert.match(
    caller,
    /concurrency:\n  group: ci-\$\{\{ github.event.pull_request.number \}\}\n  cancel-in-progress: true/,
  );
  for (const workflow of [caller, frontend, backend]) {
    assert.match(workflow, /permissions:\n  contents: read\n\n/);
    assert.doesNotMatch(workflow, /:\s*write\b|secrets:\s*inherit/);
  }
  for (const callee of [frontend, backend]) {
    assert.doesNotMatch(callee, /\bconcurrency:/);
  }
});

test("has no GitHub Pages deployment or extra pull-request entrypoints", async () => {
  const files = (await readdir(workflowsUrl)).filter(name => /\.ya?ml$/.test(name));

  for (const name of files) {
    const workflow = await readWorkflow(name);
    assert.doesNotMatch(workflow, /actions\/(configure-pages|upload-pages-artifact|deploy-pages)@/);
    assert.doesNotMatch(workflow, /\bpages:\s*write|github-pages|VITE_BASE_PATH/);
    if (name !== "runs.yml") {
      assert.doesNotMatch(workflow, /\n  pull_request:/, name);
    }
  }
});

test("reads workflow rules from CRLF source files", async () => {
  const source = await readWorkflow("frontend-ci.yml");
  const workflow = normalizeWorkflowLineEndings(
    source.replace(/\r?\n/g, "\r\n"),
  );

  assert.match(workflow, /\n  test:\n    name: Test\n    needs: build/);
});
