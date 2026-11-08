import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const require = createRequire(new URL('../../frontend/package.json', import.meta.url));
const { defineConfig } = require('@playwright/test');

export default defineConfig({
  testDir: '.',
  testMatch: ['organization.spec.mjs', 'settings.spec.mjs', 'help.spec.mjs', 'help-retry.spec.mjs', 'guest-access.spec.mjs'],
  outputDir: join(tmpdir(), '179fc-organization-test-results'),
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5180',
    browserName: 'chromium',
    channel: process.env.PLAYWRIGHT_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined),
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5180 --strictPort',
    cwd: fileURLToPath(new URL('../../frontend', import.meta.url)),
    url: 'http://127.0.0.1:5180',
    reuseExistingServer: !process.env.CI,
  },
});
