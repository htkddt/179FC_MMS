# Frontend Tests

All frontend test source lives here. Run commands from `frontend/` after `npm ci`.

## Logic checks

Run `npm test` (Node's built-in test runner).

- `portal.test.mjs`: existing post, settings, and dashboard workflows.
- `organization.test.mjs`: member slots below team headers, responsive/scaled layouts, collapse/hide/empty states, drop hit testing, normalized offsets, independent layout/view persistence, invalid storage, canonical team transfers, preserved profile fields and failed-write rejection.
- `help.test.mjs`: normalized guide/article filtering with synthetic mock content and non-mutating result handling.
- `vite-config.test.mjs`: LocalHost root-path behavior and Production GitHub Pages base-path normalization, including the current `/179FC_MMS/` project-site sample. The workflow itself receives its path from `actions/configure-pages`, so a future repository rename does not require a workflow constant.
- `ci-workflow.test.mjs`: active pull-request trigger, Build → Test → Deploy dependency, GitHub Pages deploy action configuration, and LF/CRLF-compatible workflow parsing.

## Help, Organization and Settings browser checks

Run `npm run test:browser`. Playwright starts a local Vite server on `127.0.0.1:5180` automatically; a running server at that address is reused outside CI.

- Windows defaults to the installed Microsoft Edge browser, so no browser download is required when Edge is available.
- Other platforms default to bundled Chromium: install it with `npx playwright install chromium` first. To use bundled Chromium on Windows, run `$env:PLAYWRIGHT_CHANNEL='chromium'` before the test command. Use `PLAYWRIGHT_CHANNEL=chrome` for an installed Chrome browser.
- `playwright.config.mjs` resolves dependencies from `frontend/package.json`, keeping test source out of the application directory.
- `organization.spec.mjs` covers the simplified toolbar/plain canvas, ellipsis-only actions, search/filter, persistent team zoom/collapse/hide, expanded chart, zoom-aware positioning and cross-team drops (including collapsed targets), membership synchronization with Employees/Profile and another open tab, preserved avatar/phone, empty-team recovery, failed writes, keyboard/cancel/reset behavior, mobile bounds, reduced motion and the assistant.
- `help.spec.mjs` covers the subtitle-free shared header, labelled search, quick-guide/article destinations, 44 px actions, filtered empty recovery with Contact support, 390 px layout/drawer bounds, and both reduced-motion and enabled page/card arrival behavior.
- Screenshots and failure traces are written to `179fc-organization-test-results` under the operating system's temporary directory. Successful screenshot cases include desktop, member menu, and mobile layouts. Open a retained trace with `npx playwright show-trace <path-to-trace.zip>`.

These checks cover the local mock-data workflow; they do not verify backend authorization or shared persistence. Extend coverage when those contracts become available.

## Settings product checks

- `settings.test.mjs` is included in `npm test`: absent versus malformed/denied storage, typed patches, name normalization, saved Vietnamese/notification preferences, unrelated/legacy key preservation, snapshot conflicts, failed writes without success events, timezone conversion, event rollover and date-only stability.
- `settings.spec.mjs` is included alongside Organization in `npm run test:browser`: save-before-shell-update, route/reload persistence, validation/focus, tab/Profile/sidebar/logout dirty guards, Escape/discard, Back/Forward, saved notification switches and manual assistant, Password/Two-factor/Sessions UI-only routes with companion boundary panels and 44 px action targets, unavailable-service outcomes without false success, failed read/write recovery, cross-tab pristine refresh/conflict, shared Posts/Dashboard time formatting, canonical avatar/ID, Post Create/Edit timezone labels and schedule preservation, Vietnamese fallback and responsive bounds at 320/390/768/1024/1440 px.
- The responsive case also checks enlarged root text, reduced-motion computed animation and mobile drawer focus restoration. Enlarged text/viewport automation is not a complete manual accessibility audit or browser-specific native 200% zoom audit.
- Screenshots include General/Notifications/Security/mobile; retained traces and screenshots use the configured temporary `179fc-organization-test-results` directory for both suites. Tests close their browser/server on completion. Each case has isolated synthetic browser storage. No delivery/security/backend QA is claimed.

Design references are paired [PNG images and Markdown UX](../../designs/Settings/Settings_General.md), including the Settings subpages and state boards. Their executable authoring/export sources and dependent design-only check were removed at the owner's request. Product assertions run against React routes and actual mock adapters. Local self-checks do not replace Tester QA/review on the candidate SHA or any applicable CI requirement.
