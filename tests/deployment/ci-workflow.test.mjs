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
