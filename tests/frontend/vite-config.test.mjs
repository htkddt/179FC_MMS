import assert from 'node:assert/strict';
import test from 'node:test';
import {
  FRONTEND_ENVIRONMENTS,
  normalizeBasePath,
  resolveAppBasePath,
  resolveFrontendEnvironment,
} from '../../frontend/vite.config.js';

const CURRENT_GITHUB_PAGES_PROJECT_PATH = '/179FC_MMS/';

test('uses the root path for the LocalHost environment', () => {
  assert.equal(resolveFrontendEnvironment('development'), FRONTEND_ENVIRONMENTS.localHost);
  assert.equal(resolveAppBasePath('development', CURRENT_GITHUB_PAGES_PROJECT_PATH), '/');
});

test('uses the current normalized GitHub Pages path for the Production environment', () => {
  assert.equal(resolveFrontendEnvironment('production'), FRONTEND_ENVIRONMENTS.production);
  assert.equal(normalizeBasePath('179FC_MMS'), CURRENT_GITHUB_PAGES_PROJECT_PATH);
  assert.equal(resolveAppBasePath('production', '/179FC_MMS'), CURRENT_GITHUB_PAGES_PROJECT_PATH);
});
