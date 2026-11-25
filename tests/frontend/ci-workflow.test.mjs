import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const workflowUrl = new URL(
  "../../.github/workflows/frontend-pages.yml",
  import.meta.url,
);

function normalizeWorkflowLineEndings(source) {
  return source.replace(/\r\n/g, "\n");
}

test("keeps frontend quality checks for active pull requests without deploying GitHub Pages", async () => {
  const workflow = normalizeWorkflowLineEndings(
    await readFile(workflowUrl, "utf8"),
  );

  assert.match(
    workflow,
    /pull_request:\n    branches:\n      - main\n    types: \[opened, synchronize, reopened\]/,
  );
  assert.match(workflow, /\n  build:\n    name: Build/);
  assert.match(workflow, /\n  test:\n    name: Test\n    needs: build/);
  assert.match(workflow, /working-directory: frontend\n        run: npm run build/);
  assert.match(workflow, /working-directory: frontend\n        run: npm test/);
  assert.match(
    workflow,
    /working-directory: frontend\n        env:\n          PLAYWRIGHT_CHANNEL: chromium\n        run: npm run test:browser/,
  );
  assert.doesNotMatch(workflow, /actions\/(configure-pages|upload-pages-artifact|deploy-pages)@/);
  assert.doesNotMatch(workflow, /\n      pages: write/);
  assert.doesNotMatch(workflow, /github-pages/);
  assert.doesNotMatch(workflow, /VITE_BASE_PATH/);
  assert.doesNotMatch(workflow, /github\.event\.pull_request\.merged/);
});

test("reads workflow rules from CRLF source files", async () => {
  const source = await readFile(workflowUrl, "utf8");
  const workflow = normalizeWorkflowLineEndings(
    source.replace(/\r?\n/g, "\r\n"),
  );

  assert.match(
    workflow,
    /\n  test:\n    name: Test\n    needs: build/,
  );
});
