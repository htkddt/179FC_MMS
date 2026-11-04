import assert from 'node:assert/strict';
import test from 'node:test';
import {
  FRONTEND_ENVIRONMENTS,
  normalizeBasePath,
  resolveAppBasePath,
  resolveFrontendEnvironment,
} from '../../frontend/vite.config.js';

test('uses the root path for the LocalHost environment', () => {
  assert.equal(resolveFrontendEnvironment('development'), FRONTEND_ENVIRONMENTS.localHost);
  assert.equal(resolveAppBasePath('development', '/Vibe_Coding/'), '/');
});

test('uses a normalized GitHub Pages path for the Production environment', () => {
  assert.equal(resolveFrontendEnvironment('production'), FRONTEND_ENVIRONMENTS.production);
  assert.equal(normalizeBasePath('Vibe_Coding'), '/Vibe_Coding/');
  assert.equal(resolveAppBasePath('production', '/Vibe_Coding'), '/Vibe_Coding/');
});
