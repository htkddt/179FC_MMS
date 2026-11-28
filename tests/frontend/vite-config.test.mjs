import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  FRONTEND_ENVIRONMENTS,
  resolveFrontendEnvironment,
} from '../../frontend/vite.config.js';

const viteConfigUrl = new URL('../../frontend/vite.config.js', import.meta.url);

test('uses the root path for the LocalHost environment', () => {
  assert.equal(resolveFrontendEnvironment('development'), FRONTEND_ENVIRONMENTS.localHost);
});

test('identifies Production builds without a deployment-specific base path', () => {
  assert.equal(resolveFrontendEnvironment('production'), FRONTEND_ENVIRONMENTS.production);
});

test('relies on Vite default root base path instead of GitHub Pages configuration', async () => {
  const source = await readFile(viteConfigUrl, 'utf8');

  assert.doesNotMatch(source, /VITE_BASE_PATH/);
  assert.doesNotMatch(source, /^\s*base:/m);
});
