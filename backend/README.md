# Backend

## Purpose

This directory contains the NestJS HTTP API for 179FC_MMS. The initial scaffold exposes a health endpoint and provides the module structure for future member-management APIs.

## Stack

- NestJS
- TypeScript
- Node.js
- Official MongoDB Node.js driver

## MongoDB foundation

The backend now has a local MongoDB connection foundation. It uses the official MongoDB Node.js driver in `src/database/` instead of an ODM because this ticket does not introduce a member schema, collection model, or repository contract. The driver provides one small Nest provider for connection lifecycle and leaves future domain-model choices open.

`DatabaseConfigModule` loads `backend/.env`, validates the database contract before providers are created, and reports only variable names in validation errors. `DatabaseClientService` connects with an explicit timeout, pings the configured database during startup, and closes its client when Nest shuts down. Startup fails with a safe, generic message if MongoDB is unavailable; no URI or credential is written to application logs.

## Directory Structure

~~~text
backend/
├── src/
│   ├── app.config.ts      # Shared HTTP/ValidationPipe configuration
│   ├── app.controller.ts  # Health endpoint
│   ├── app.module.ts      # Root application module
│   ├── app.service.ts     # Health service
│   └── main.ts            # HTTP server bootstrap
├── nest-cli.json
├── package.json
├── tsconfig.build.json
└── tsconfig.json
~~~

## Run Locally

MongoDB local is a trial dependency. Install or start MongoDB manually using the method appropriate to the local machine, keep the service local to the machine, and ensure the URI and database name in `backend/.env` target that local instance. This repository does not provide a container configuration or manage the MongoDB process.

~~~powershell
Copy-Item backend/.env.example backend/.env
cd backend
npm ci
npm run build
npm run start:dev
~~~

- The development server listens on `http://localhost:3000` by default. `GET /health` is a liveness response and returns `200` when the Nest process is up. `GET /health/ready` pings MongoDB and returns `200` with `database: "ready"` only when the database is usable; it returns `503` with `database: "not_ready"` or `"disabled"` otherwise. Neither response includes a URI, topology, or credential.
- `backend/.env` is intentionally ignored. Do not add secrets to `.env.example`; its local URI is `mongodb://127.0.0.1:27017` and its local-only database name is `179fc_mms_local`.
- After Kiet Huynh has started MongoDB manually and reviewed the target database name, install the Python importer dependencies with `python -m pip install pymongo quickjs`, then run `npm run database:import-mocks` to import all current synthetic exports under `frontend/src/mocks/`. It is idempotent for imported records and refuses non-loopback URIs or a database name not ending in `_local`. See [`../scripts/database/README.md`](../scripts/database/README.md) for collection mapping and manual cleanup behavior.
- The frontend is not connected to backend APIs by this ticket. It continues to read browser/module mocks even after those same synthetic datasets are imported into local MongoDB.
- The backend requires Node.js 26.x. This major exceeds the MongoDB driver's minimum baseline and is pinned in `package.json` and the pull-request workflow so local, CI, and Vercel builds use the same major while Vercel applies minor and security patch updates.
- The Nest CLI currently requires TypeScript 6, which is pinned in `package.json`.
- Use the committed `package-lock.json` for repeatable installs.
- The API uses Nest's `ValidationPipe`, so `class-transformer` and `class-validator` are runtime dependencies.

## Test Commands

Run all commands from `backend/` after `npm ci`.

~~~bash
npm run test:unit
npm run test:integration
npm test
npm run test:ci
npm run test:deployment
~~~

- `test:unit` runs isolated service checks without an HTTP server or external service.
- `test:integration` creates a Nest application and checks `GET /health` plus the production `ValidationPipe` behavior through its HTTP server. The test code does not call production `app.listen`; Supertest temporarily binds an OS-assigned loopback listener for each request and releases it when that request settles. The scripts set `DATABASE_ENABLED=false`, so the existing suite never uses the fixed production port `3000` or requires MongoDB.
- `npm test` runs both categories and returns a non-zero exit code when either suite fails.
- `test:ci` runs `npm run build` followed by the complete test suite. It is the stable command used by the Backend CI workflow.
- `test:deployment` build backend rồi kiểm tra `vercel.json`, Backend/Frontend CI, việc gỡ GitHub Pages deployment actions/permissions và artifact Vercel thực tế. Source nằm trong `../tests/deployment/`; builder `@vercel/backends@28.0.0` chỉ là devDependency phục vụ regression test.

Tests use Node's built-in test runner with `ts-node/register` in transpile-only runtime mode, using the test-only compiler configuration. `test:ci` still runs the Nest production build before the suites. The integration script uses `cross-env` to expose `backend/node_modules` to the centralized test directory on Windows and CI. `supertest` sends requests through a temporary OS-assigned loopback listener and releases that listener when each request settles. The production bootstrap and integration suite share `src/app.config.ts`, preventing the test from silently using a different `ValidationPipe` setup.

The integration suite has a ten-second suite timeout and always calls `app.close()` after its cases. Supertest releases each temporary loopback listener when its request settles; the `after` hook's `app.close()` call closes the Nest application and remaining Nest handles. No fixed test port, database, production credential, or member record is used. Node's runner writes failures to standard output and creates no repository artifact. There is no coverage threshold or coverage claim yet because no coverage baseline has been established. Database integration testing is intentionally deferred and is not represented as passing by these commands.

## Vercel Services and CI configuration

`../vercel.json` defines this directory as the `backend` NestJS Vercel service. Its public ingress is `/api/(.*)`, and a service-scoped `request.path` transform removes that prefix before NestJS receives the request. Therefore `/api/health` maps to the implemented `GET /health` route and `/api/health/ready` maps to `GET /health/ready`. No service binding is declared because this backend does not make a runtime call to another Vercel service, and the frontend has no API integration yet.

Service dùng `entrypoint: "vercel.mjs"` và `outputDirectory: "."`. Entrypoint `.mjs` nhập `src/main.ts` để Vercel phát artifact ESM, giữ decorator metadata từ `tsconfig.json` và trace production dependencies trong layout theo repository. `nest build`, `start:prod`, CommonJS build local và business/bootstrap logic vẫn như trước. Nếu để builder tự dò `dist/`, output có thể bị flatten thành `/var/task/main.js` nhưng dependencies vẫn ở `/var/task/backend/node_modules/`, khiến Node không tìm được `@nestjs/common`. Chỉ giữ layout chưa đủ: CJS output có thể báo `ERR_REQUIRE_ESM` khi nạp NestJS 12 trên runtime không hỗ trợ `require(ESM)`. Entrypoint ESM giải quyết tương thích này mà không đổi package versions, Node pin, settings hoặc environment. Đối chiếu logic tại [build output selection](https://github.com/vercel/vercel/blob/main/packages/backends/src/build.ts) và [dependency tracing](https://github.com/vercel/vercel/blob/main/packages/backends/src/rolldown/nft.ts).

Regression test tạo fixture tạm chỉ gồm source, `dist/`, Vercel entrypoint, package metadata và production packages từ lockfile, gọi builder thật rồi kiểm tra resolve toàn bộ direct production dependencies từ handler. Trên Linux, test khởi động artifact bằng `--no-require-module`, không có `NODE_PATH`, dùng `DATABASE_ENABLED=false`, kiểm tra `/health` trả `200` với payload hiện hành và `/health/ready` trả `503` với `database: "disabled"`. Flag test tái hiện việc từ chối CJS `require(ESM)` đã quan sát trên Preview; không giả định hay thay đổi `NODE_OPTIONS` của deployment. Với cấu hình CJS cũ, smoke-test này phải FAIL `ERR_REQUIRE_ESM`. Listener dùng port loopback do OS cấp và luôn được dừng; fixture được dọn sau test. Windows chạy kiểm tra layout nhưng bỏ riêng smoke-test vì upstream builder `28.0.0` tạo đường dẫn CJS shim sai separator; dùng WSL hoặc Backend CI để chạy phần đó. Ý nghĩa flag được mô tả trong [Node.js CLI](https://nodejs.org/api/cli.html#--no-require-module).

Preview lỗi đầu vào: `dpl_CgH2dkwH2KdqoasByxe9qgkJRg62`, SHA `3ed7e26dc8c1dc6d2786ff306a14ed192096e292`; build log xác nhận `nest build` thành công. Preview của fix chỉ được ghi PASS khi QA/CI xác minh cùng URL/full head SHA: Backend CI, Vercel checks và `/`, `/help`, `/api/health` đều đạt yêu cầu. Local artifact test không xác nhận deployment hay database production. Không đưa `.env` vào artifact; production cần cấu hình database hợp lệ, còn Preview health cô lập có thể dùng cấu hình `DATABASE_ENABLED=false` đã được chủ dự án cấp. Rollback về deployment đã xác minh; bỏ thuộc tính output trên có thể tái mở lỗi nên giữ gate cutover 179FC-53 đến khi smoke-test PASS.

Retest tại SHA `84ef59f3ff799dd0496d643a9a0574c43d0b4a86`, deployment `dpl_D5CgF5KuKZktwXVH7Mtx7mZi6PDR`: cả 6 checks SUCCESS nhưng `/api/health` trả `500 FUNCTION_INVOCATION_FAILED`; runtime ngày `2026-11-28T02:52:58Z` báo `ERR_REQUIRE_ESM` từ `backend/src/app.config.cjs` nạp `@nestjs/common/index.js`. `/` và `/help` trả `200`. Entrypoint ESM xử lý finding này; bỏ entrypoint có thể tái mở lỗi loader, nên rollback vẫn cần deployment đã xác minh và candidate mới phải qua QA/CI trên cùng PR #14.

`.github/workflows/backend-ci.yml` runs for active pull requests to `main`. It installs only from `backend/package-lock.json`, then runs `npm run test:ci` and `npm run test:deployment`; it has no production deployment, secret, or environment-variable setup. GitHub Pages deployment has been removed in Stage 2 while Frontend CI remains active. Vercel Services is Beta, and Kiet Huynh must confirm the final service names, public/internal paths, `/api` contract, bindings, production data/secrets readiness, and release strategy before operational use.

## Stop and clean up local MongoDB

Stop MongoDB using the service manager or console process selected during manual installation. The repository does not manage this lifecycle.

To destructively clear trial data, first verify that the local `DATABASE_NAME` is the intended target. Then use the MongoDB shell or administration tool to run `db.dropDatabase()` against that database. This removes all data in the selected database; start MongoDB manually again and optionally rerun `npm run database:import-mocks` when a fresh synthetic dataset is needed.

## Planned Flow

1. Define the member domain model, authentication model, and permissions.
2. Add versioned modules for members, roles, and organization administration on the MongoDB foundation.
3. Integrate request validation, observability, and OpenAPI documentation.
4. Expose an authenticated integration boundary for the chatbot service.

## Organization and Employees integration handoff

The frontend now supports cross-team member transfers from the Organization canvas and the member ellipsis menu. Both use the async `transferMemberTeam({ memberId, targetTeam })` adapter in `frontend/src/features/employees/api/membersApi.js`. It currently writes a partial team update to the shared browser profile store; this backend still exposes only its health/scaffold endpoint.

The full [proposed contracts and client synchronization sequence](../frontend/README.md#organization-backend-integration-contract-proposed-not-implemented) define future team/member reads, `PATCH /v1/members/:memberId/team`, and personal chart preferences. These are proposed endpoints, not implemented routes.

Implementation requirements:

1. Return a stable team catalog including empty teams. Use team IDs in persisted membership and API payloads instead of mutable display names.
2. Authorize and validate transfers on the server, check the expected record revision, and atomically update membership, source/destination counts, revision, timestamps and an audit entry. Return the authoritative member and affected team counts. Preserve avatar, phone, birth date, role and unrelated fields; a transfer is a partial mutation.
3. Have Organization, Employees and Employee profile consume the same canonical member store. Invalidate/update list/detail/team/group caches after success and broadcast/refetch changes for other active clients. Reject stale profile saves rather than silently overwriting a newer transfer.
4. Keep personal chart positions, scale/collapse/hidden preferences and Reset layout separate from membership. Hiding/collapsing/resetting the diagram must never delete a team, remove members or revert a transfer.
5. Support idempotent retries, invalid/deleted destination handling, failed-write rollback and conflict refetch. Add transaction, authorization, concurrency, preserved-field, empty-team and response-consistency tests under `tests/backend/`.

## Test Location

Do not add test source to this directory. All backend unit, integration, and end-to-end tests must be created in `../tests/backend/`.

See [`../tests/backend/README.md`](../tests/backend/README.md) for test categories, lifecycle, synthetic-data policy, artifact policy, and the planned MongoDB extension. MongoDB integration coverage is not implemented by the current suites.

## Documentation Rule

Update this README whenever backend code, endpoints, dependencies, environment variables, commands, or data flows change. Also update the root README when the change affects the entire repository.
