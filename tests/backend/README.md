# Backend Tests

This directory contains all backend unit, integration, API, and end-to-end test source. Run the commands from `backend/` after `npm ci`:

~~~bash
npm run test:unit
npm run test:integration
npm test
npm run test:ci
~~~

## Runner and Structure

The backend uses Node's built-in test runner with `ts-node/register` in transpile-only runtime mode. Its scripts set `tests/backend/tsconfig.json` as `TS_NODE_PROJECT`, which enables Nest's legacy decorator metadata while keeping test compilation separate from the production `tsconfig.json`; `test:ci` first runs the Nest production build. The integration script uses `cross-env` to expose `backend/node_modules` to this centralized test directory on Windows and CI. `supertest` drives the Nest HTTP server without opening a network port.

~~~text
tests/backend/
├── integration/
│   └── http-bootstrap.test.ts  # Health endpoint and ValidationPipe HTTP behavior
├── tsconfig.json                # Test-only TypeScript decorator settings
├── unit/
│   └── app.service.test.ts     # Service-only health response
└── README.md
~~~

`unit/` is for deterministic logic that does not construct a Nest application. `integration/` is for application-module and HTTP contract checks. The initial integration suite covers `GET /health`, its exact response shape, an accepted synthetic payload, and a rejected payload with an invalid value and a non-whitelisted property.

## Lifecycle and Data Policy

The integration suite constructs a Nest application with `@nestjs/testing`, applies the same `configureHttpApplication` function as `backend/src/main.ts`, calls `app.init()`, and calls `app.close()` in an `after` hook. The suite timeout is ten seconds. It never calls `listen`, so it does not use port `3000`, leave a process running, or require an external service.

Use English file names and test descriptions. Keep fixtures, test-only modules, and test configuration under `tests/backend/`; use synthetic data only. Do not add tests, fixtures, credentials, or member data under `backend/src` or any production directory.

## Coverage and Artifacts

There is no coverage threshold or coverage report yet: a baseline has not been established. Node test output is emitted to standard output; no test artifact is written inside the repository. A failing test makes its `node --test` command, and therefore `npm test` and `npm run test:ci`, exit non-zero.

## MongoDB Extension (Not Implemented)

MongoDB is not configured and the current suites have no database coverage. When persistence is introduced, place database-specific tests, fixtures, and test-only configuration in `tests/database/`. Those suites must use a dedicated disposable test database or equivalent isolated service, create only synthetic records, set explicit connection and test timeouts, and close all database/app handles in teardown. Do not treat this guidance as implemented MongoDB coverage.
