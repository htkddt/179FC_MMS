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

test("deploys GitHub Pages after Build and Test for an active pull request", async () => {
  const workflow = normalizeWorkflowLineEndings(
    await readFile(workflowUrl, "utf8"),
  );
  const deployJob = workflow.split("\n  deploy:")[1];

  assert.match(
    workflow,
    /pull_request:\n    branches:\n      - main\n    types: \[opened, synchronize, reopened\]/,
  );
  assert.match(workflow, /\n  test:\n    name: Test\n    needs: build/);
  assert.match(deployJob, /name: Deploy\n    needs: \[build, test\]/);
  assert.match(deployJob, /uses: actions\/deploy-pages@v4/);
  assert.doesNotMatch(workflow, /github\.event\.pull_request\.merged/);
});

test("reads workflow rules from CRLF source files", async () => {
  const source = await readFile(workflowUrl, "utf8");
  const workflow = normalizeWorkflowLineEndings(
    source.replace(/\r?\n/g, "\r\n"),
  );

  assert.match(
    workflow,
    /\n  deploy:\n    name: Deploy\n    needs: \[build, test\]/,
  );
});
