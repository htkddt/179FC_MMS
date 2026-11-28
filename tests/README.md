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

`deployment/` contains repository-level deployment and CI configuration checks.

## Implemented frontend checks

- From `frontend/`, run `npm test` for Node-based post, settings, dashboard, and Organization logic checks.
- Run `npm run test:browser` for Playwright coverage of guest/public and protected-route demo access, protected-route and TopBar Sign-in transition with reduced-motion fallback, safe fallback from malformed return state, Help overview/article/adapter-backed Support related routes, full-width Help Search, Popular article/TOC motion plus Back/Forward active-state synchronization and reduced-motion behavior, Organization, Employees profile synchronization, responsive layouts, keyboard interactions, and the assistant launcher. The configuration starts Vite on port 5180 and uses installed Edge on Windows by default.
- Pull requests to `main` enter `runs.yml`, which calls reusable `frontend-ci.yml` and `backend-ci.yml`. The frontend **Test** job follows **Build**; the runner installs Playwright Chromium before browser checks. The workflow is CI-only and does not publish a GitHub Pages artifact or deployment.
- Test source and configuration remain under `tests/frontend/`; browser artifacts go to the operating system's temporary directory. See [frontend runner setup and scope](frontend/README.md).

## Implemented backend checks

- From `backend/`, run `npm run test:unit` for the isolated `AppService` health payload check.
- Run `npm run test:integration` for the Nest application, `GET /health` response contract, and the production `ValidationPipe` success/failure behavior. Supertest temporarily binds an OS-assigned loopback listener for each request and releases it when that request settles; the `after` hook calls `app.close()` for the Nest application and remaining handles. The scripts set `DATABASE_ENABLED=false`, so the suite never uses port `3000` or requires MongoDB.
- Run `npm test` to execute both categories, or `npm run test:ci` to build then execute both categories. These commands use Node's test runner with `ts-node/register` and return non-zero on failure.
- Backend test source is under `tests/backend/`; its [runner, lifecycle, synthetic-data, artifact, and MongoDB test boundary](backend/README.md) describes the implemented boundary. `.github/workflows/backend-ci.yml` runs `npm run test:ci` when invoked by `runs.yml` for active pull requests to `main`. No database integration suite is implemented yet.

## Implemented deployment checks

- Từ `backend/`, chạy `npm run test:deployment` để build rồi kiểm tra `vercel.json`, Node.js 26 pins, `runs.yml` PR trigger và hai reusable calls, Backend/Frontend `workflow_call` cùng lockfile commands, và việc gỡ GitHub Pages deployment actions/permissions. `vercel-packaging.test.mjs` còn gọi builder Vercel `28.0.0` trên fixture cô lập, kiểm tra cả 9 production dependencies resolve từ handler trong artifact. Khi bỏ fix packaging, test phải FAIL với `MODULE_NOT_FOUND: @nestjs/common`.
- Trên Linux, artifact được khởi động với `--no-require-module` và preload `fixtures/ephemeral-listener.cjs` tại port loopback do OS cấp; `/health` phải trả `200` với payload hiện hành, `/health/ready` trả `503` khi `DATABASE_ENABLED=false`. Loader mode này phải bắt `ERR_REQUIRE_ESM` trên cấu hình CJS của SHA `84ef59f3ff799dd0496d643a9a0574c43d0b4a86`; entrypoint Vercel `.mjs` mới phải hoạt động với ESM imports. Windows chạy kiểm tra layout và skip riêng smoke-test do CJS shim của builder upstream sai separator; chạy WSL hoặc Backend CI để xác minh phần Linux. Test dừng child process và dọn fixture tạm sau khi hoàn tất.
- Source nằm dưới `tests/deployment/`; fixture chỉ sao chép source/compiled output và production packages từ lockfile, không sao chép `.env`, credentials hoặc member data. Test không cần Vercel account hay live deployment và không xác nhận Preview đã thành công; QA/CI vẫn phải kiểm tra Preview URL cùng full head SHA.

## Remaining plan

1. Select chatbot and database runners, then define their coverage policies.
2. Add feature tests as member-management flows and persistence are implemented.
3. Add contract tests for backend-chatbot integration and CI reporting.

## Conventions

- Use English test descriptions, fixture names, and filenames.
- Keep tests deterministic and isolated from real member data.
- Group test source by component and feature under the directories above.
- Store test-only configuration and fixture files under `tests/` as well.

## Documentation Rule

Update this README and the appropriate component README whenever test strategy, commands, coverage policy, or test scope changes. Update the root README when CI or repository-wide quality requirements change.

## Settings product coverage — 179MMS-6

`npm test` from `frontend/` now also runs `tests/frontend/settings.test.mjs` for persistence/conflict/validation, saved language/notification preferences, and shared date boundaries. `npm run test:browser` runs both Organization and `settings.spec.mjs`: actual React Settings navigation, notification persistence, Password/Two-factor/Sessions UI-only flows with companion boundary panels and 44 px action targets, focus restoration, failure recovery, canonical account/avatar, cross-tab shared shell/timezone consumers, responsive bounds and keyboard/reduced-motion behavior. Tests use synthetic local mock data. Backend authentication, security transactions and notification delivery are unavailable and are not tested as implemented services. The dependent design-only check was removed with the executable design sources; PNG/Markdown references remain in `designs/Settings/`.
