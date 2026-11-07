# Tests

## Purpose

This directory is the only location for test source in 179FC_MMS. Tests are separated from implementation directories so CI jobs and quality artifacts remain centralized.

## Structure

~~~text
tests/
├── backend/    # NestJS unit, integration, and end-to-end tests
├── chatbot/    # FastAPI unit, API, safety, and contract tests
├── database/   # Migration, data-integrity, and query tests
└── frontend/   # React component, interaction, and end-to-end tests
~~~

## Implemented frontend checks

- From `frontend/`, run `npm test` for Node-based post, settings, dashboard, and Organization logic checks.
- Run `npm run test:browser` for Playwright coverage of Help overview/article/adapter-backed Support related routes, compact Help-to-Organization search alignment, nested-route motion and reduced-motion behavior, Organization, Employees profile synchronization, responsive layouts, keyboard interactions, and the assistant launcher. The configuration starts Vite on port 5180 and uses installed Edge on Windows by default.
- Pull requests to `main` run these checks in the **Test** job after the frontend **Build** job succeeds. The GitHub Actions runner installs Playwright Chromium before browser checks; the **Deploy** job publishes to GitHub Pages only after both jobs succeed.
- Test source and configuration remain under `tests/frontend/`; browser artifacts go to the operating system's temporary directory. See [frontend runner setup and scope](frontend/README.md).

## Remaining plan

1. Select backend, chatbot, and database runners and define the coverage policy for each component.
2. Establish shared test-data, fixture, and environment conventions without coupling suites to production data.
3. Add smoke tests for frontend availability and backend `GET /health`.
4. Add feature tests as member-management flows are implemented.
5. Add contract tests for backend-chatbot integration and CI reporting.

## Conventions

- Use English test descriptions, fixture names, and filenames.
- Keep tests deterministic and isolated from real member data.
- Group test source by component and feature under the directories above.
- Store test-only configuration and fixture files under `tests/` as well.

## Documentation Rule

Update this README and the appropriate component README whenever test strategy, commands, coverage policy, or test scope changes. Update the root README when CI or repository-wide quality requirements change.

## Settings product coverage — 179MMS-6

`npm test` from `frontend/` now also runs `tests/frontend/settings.test.mjs` for persistence/conflict/validation, saved language/notification preferences, and shared date boundaries. `npm run test:browser` runs both Organization and `settings.spec.mjs`: actual React Settings navigation, notification persistence, Password/Two-factor/Sessions UI-only flows with companion boundary panels and 44 px action targets, focus restoration, failure recovery, canonical account/avatar, cross-tab shared shell/timezone consumers, responsive bounds and keyboard/reduced-motion behavior. Tests use synthetic local mock data. Backend authentication, security transactions and notification delivery are unavailable and are not tested as implemented services. The dependent design-only check was removed with the executable design sources; PNG/Markdown references remain in `designs/Settings/`.
