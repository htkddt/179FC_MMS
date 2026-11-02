# Backend

## Purpose

This directory contains the NestJS HTTP API for 179FC_MMS. The initial scaffold exposes a health endpoint and provides the module structure for future member-management APIs.

## Stack

- NestJS
- TypeScript
- Node.js

## Directory Structure

~~~text
backend/
├── src/
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

~~~bash
npm ci
npm run build
npm run start:dev
~~~

- The development server listens on `http://localhost:3000` by default, confirm availability at `GET /health`.
- The scaffold requires Node.js 20.11 or newer.
- The Nest CLI currently requires TypeScript 6, which is pinned in `package.json`.
- Use the committed `package-lock.json` for repeatable installs.
- The API uses Nest's `ValidationPipe`, so `class-transformer` and `class-validator` are runtime dependencies.

## Planned Flow

1. Define the member domain model, authentication model, and permissions.
2. Add versioned modules for members, roles, and organization administration.
3. Integrate persistence, request validation, observability, and OpenAPI documentation.
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

## Documentation Rule

Update this README whenever backend code, endpoints, dependencies, environment variables, commands, or data flows change. Also update the root README when the change affects the entire repository.
