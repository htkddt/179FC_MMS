# Frontend Tests

All frontend test source lives here. Run commands from `frontend/` after `npm ci`.

## Logic checks

Run `npm test` (Node's built-in test runner).

- `portal.test.mjs`: existing post, settings, and dashboard workflows.
- `organization.test.mjs`: member slots below team headers, responsive/scaled layouts, collapse/hide/empty states, drop hit testing, normalized offsets, independent layout/view persistence, invalid storage, canonical team transfers, preserved profile fields and failed-write rejection.

## Settings design prototype checks

From the repository root, after installing frontend dependencies, run:

```powershell
node tests/frontend/settings-design-review.mjs
```

This opens the offline `designs/Settings/Settings_Prototype.html` in headless Edge on Windows (bundled Chromium elsewhere; `PLAYWRIGHT_CHANNEL` can override). It covers pristine/dirty/save/failure/validation/conflict flows, capability gating, compact-shell apply-after-save, manual assistant access, URL tabs/Back, keyboard/focus, selected contrast color pairs, reduced motion and all three tabs at 320/390/768/1024/1440 px. Fixtures are synthetic and in memory; no production settings or member records are written. The browser closes at completion.

The prototype is proposed design, not the React Settings implementation. This command is separate from `npm test`/`npm run test:browser` and does not grant Tester QA PASS or CI PASS. Render review images with `node designs/Settings/render-settings.mjs`; details are in the [Settings handoff](../../designs/Settings/Settings_Handoff.md).

## Organization browser checks

Run `npm run test:browser`. Playwright starts a local Vite server on `127.0.0.1:5180` automatically; a running server at that address is reused outside CI.

- Windows defaults to the installed Microsoft Edge browser, so no browser download is required when Edge is available.
- Other platforms default to bundled Chromium: install it with `npx playwright install chromium` first. To use bundled Chromium on Windows, run `$env:PLAYWRIGHT_CHANNEL='chromium'` before the test command. Use `PLAYWRIGHT_CHANNEL=chrome` for an installed Chrome browser.
- `playwright.config.mjs` resolves dependencies from `frontend/package.json`, keeping test source out of the application directory.
- `organization.spec.mjs` covers the simplified toolbar/plain canvas, ellipsis-only actions, search/filter, persistent team zoom/collapse/hide, expanded chart, zoom-aware positioning and cross-team drops (including collapsed targets), membership synchronization with Employees/Profile and another open tab, preserved avatar/phone, empty-team recovery, failed writes, keyboard/cancel/reset behavior, mobile bounds, reduced motion and the assistant.
- Screenshots and failure traces are written to `179fc-organization-test-results` under the operating system's temporary directory. Successful screenshot cases include desktop, member menu, and mobile layouts. Open a retained trace with `npx playwright show-trace <path-to-trace.zip>`.

These checks cover the local mock-data workflow; they do not verify backend authorization or shared persistence. Extend coverage when those contracts become available.
