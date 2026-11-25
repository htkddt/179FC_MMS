# 179FC Member Management System

## Overview

179FC Member Management System (179FC_MMS) is a web application for managing members in the 179FC organization. The repository is organized as a small multi-service workspace so that the user interface, API, virtual-assistant service, automation, designs, and test assets can evolve independently.

## Repository Layout

~~~text
179FC_MMS/
├── frontend/           # React web application
├── backend/            # NestJS API
├── chatbot/            # Planned FastAPI virtual-assistant service
├── designs/            # Figma exports and design assets
├── scripts/            # Project automation
└── tests/              # All test source, grouped by component
~~~

## Tech Stack

| Area | Technology | Status |
| --- | --- | --- |
| Web client | React, React Router, JavaScript, JSX, CSS, Vite | Feature development |
| API | NestJS, TypeScript, official MongoDB Node.js driver | Local MongoDB foundation; feature APIs not implemented |
| Virtual assistant | Python, FastAPI | Planned |
| Testing | Node test-runner checks under `tests/frontend/`, `tests/backend/`, and `tests/deployment/`, plus Playwright Organization flows under `tests/frontend/` | Initial coverage; frontend and backend CI run on pull requests |
| Automation | Python scripts for new or modified automation | Planned |

## References

- [React documentation](https://react.dev/)
- [Vite documentation](https://vite.dev/)
- [NestJS documentation](https://docs.nestjs.com/)
- [FastAPI documentation](https://fastapi.tiangolo.com/)

## Operations

### Organization workspace

- `/organization` has a full-width Search field beside the team filter, a plain chart canvas, per-team headers/controls, overview counts and a Teams panel. The two view tabs, Team connections caption, dotted grid, subtitle and application right-click menu are removed.
- Every member is a draggable component. The ellipsis button opens **Profile**, **View team**, **Move to team**, and **Reset position**. Profile opens `/employees/:memberId`.
- Each team supports card zoom, collapse/expand, hide/show and an enlarged focused chart. Global zoom/fit/expand and Reset layout are also available. Hidden/collapsed teams retain their members and counts; empty teams remain valid destinations.
- Dropping a member on a different team or choosing Move to team updates the shared member record. Organization, Employees and Employee profile read that same `team`, including across open directory tabs. Other profile fields and the role/job title are preserved. A failed save leaves the old team intact and shows an error. Dragging within the same team changes only chart placement.
- Current persistence is browser-local: canonical profile/team fields, chart offsets and personal team-view preferences are stored separately. Resetting/hiding/zooming the chart never reverses membership changes. The assistant remains a labelled icon and chat panel without a launcher tooltip.
- The [Organization implementation and proposed backend contracts](frontend/README.md#organization-implementation) document all interactions, state keys, the shared transfer adapter, proposed APIs, concurrency/error handling and required cache updates for future integration. No membership API has been implemented on the backend yet.
- Run `npm test` and `npm run test:browser` from `frontend/`. See [frontend test setup](tests/frontend/README.md) and [Organization UX](designs/Organization/Organization.md).

### MongoDB local trial, backend, and frontend

MongoDB local is a trial foundation. This repository does not provide a container configuration or another managed database runtime. Kiet Huynh must install or start a local MongoDB instance using the method appropriate to the machine, keep it local to the machine, and configure `backend/.env` before starting the backend.

Create the ignored backend environment file, review its local-only values, and start the backend and frontend in separate terminals:

~~~powershell
Copy-Item backend/.env.example backend/.env
cd backend
npm ci
npm run start:dev
~~~

~~~powershell
cd frontend
npm ci
npm run dev -- --host 127.0.0.1 --port 5173
~~~

Verify the API liveness at `GET http://127.0.0.1:3000/health` and database readiness at `GET http://127.0.0.1:3000/health/ready`. The former shows the Nest process is up; the latter returns `200` only when MongoDB can be pinged and otherwise returns `503` without exposing connection information.

After Kiet Huynh has started MongoDB manually and reviewed the target database name, install the Python importer dependencies with `python -m pip install pymongo quickjs`, then run the optional `npm run database:import-mocks` command from `backend/`. It copies synthetic mock datasets into local collections with guarded, repeatable upserts. It does not connect the frontend to the backend: the frontend remains mock/localStorage-based until a future API integration feature changes it. See `backend/README.md` and `scripts/database/README.md` for the complete environment contract, collection mapping, and manual cleanup warning.

Stop MongoDB with the service manager or console process used for Kiet Huynh's manual installation. To destroy trial data, first confirm the intended local `DATABASE_NAME`, then use the MongoDB shell or administration tool to run `db.dropDatabase()` against that database. This operation is destructive and is not performed by this repository.

### Temporary frontend demo access

- Vercel is the configured production deployment target for the frontend and backend services. This configuration does not make the application an operational production service.
- Guest access is the default: `/dashboard`, Posts, Settings, Help, and 179 Assist remain visible without a session. `/employees`, `/employees/:memberId`, and `/organization` redirect guests to Sign-in and retain the intended internal destination. Clicking **Sign in to 179FC** creates a mock Club Admin session in the browser tab?s `sessionStorage`; email and password values are not validated or transmitted. Logout clears that session and returns to the guest Dashboard.
- The Vercel target has no real authentication, authorization, backend persistence, or access boundary yet. Do not enter real account credentials, member data, or other personal/sensitive information there.
- Before using the application operationally or with real accounts/member data, replace demo access with real account lookup, credential verification, session handling, authorization, role/permission enforcement, and server-side persistence.

### Where Post Create is implemented

- Post Create and Post Edit share [`frontend/src/features/posts/pages/PostEditorPage.jsx`](frontend/src/features/posts/pages/PostEditorPage.jsx).
- There is no separate `PostCreatePage.jsx`. [`frontend/src/app/router.jsx`](frontend/src/app/router.jsx) routes `/posts/new` and `/posts/:postId/edit` to that component. 
- It uses `isNew = !postId` to select Create when the route has no post ID, or Edit when an ID is present. - Post Details uses the separate [`PostDetailsPage.jsx`](frontend/src/features/posts/pages/PostDetailsPage.jsx).
- The shared editor contains the form and `submit(mode)` logic.
- Its mock persistence is in [`postsApi.js`](frontend/src/features/posts/api/postsApi.js), editor content handling is in [`postContent.js`](frontend/src/features/posts/postContent.js), and styles are in [`post-workflow.css`](frontend/src/styles/post-workflow.css).
- The adapter stores posts in the current browser's `localStorage`, scheduled publication occurs on the next collection read after the scheduled time, and visibility is not enforced by a backend.
- See [Post Create and Post Edit implementation](frontend/README.md#post-create-and-post-edit-implementation) for the route, design, and file map.
- Changes to the shared editor should be checked in both Create and Edit modes.

### Build

- Frontend

   ~~~powershell
   cd frontend
   npm ci
   npm run build
   ~~~

### Frontend CI

- `.github/workflows/frontend-pages.yml` runs only for active pull requests targeting `main` (opened, synchronized, and reopened).
- The workflow has sequential **Build** and **Test** jobs. Test requires a successful Build. Build installs from `frontend/package-lock.json` and produces the root-path Vite production build; Test runs `npm test`, installs Playwright Chromium, then runs `npm run test:browser`.
- The workflow is CI-only: It contains no GitHub Pages action, Pages permission, `github-pages` environment, artifact upload, deployment job, or `VITE_BASE_PATH` assumption. It does not modify GitHub Pages site, custom-domain, or repository settings outside this codebase.

### Vercel Services and CI configuration

- `vercel.json` configures the repository as a Vercel Services deployment (a Vercel Beta capability) with independent `frontend` Vite and `backend` NestJS services. The public `/api/(.*)` rewrite is evaluated before the frontend catch-all. The backend service uses a service-scoped `request.path` transform to strip `/api`, so public `GET /api/health` reaches the implemented NestJS `GET /health` route; the frontend service rewrites deep links to `index.html` for SPA refreshes.
- No service binding is configured: the frontend currently uses browser-local mocks and contains no runtime request to the backend. Browser traffic must continue through the public `/api` route; a binding may be added only when a service-to-service caller exists.
- `.github/workflows/backend-ci.yml` runs on active pull requests to `main`, installs from `backend/package-lock.json`, runs `npm run test:ci`, and validates the Vercel/CI deployment contract with `npm run test:deployment`. It contains no deployment token, secret, or production environment variable.
- Both service `engines.node` values and all pull-request workflow Node versions are pinned to `26.x`/`26`, preventing Vercel from automatically moving a deployment to a new Node major. The Vercel builder's `Unknown env config "cache-dir"` warning has no source in this repository (`.npmrc`, project environment variables, and Build/Install Commands are absent), so no speculative repository workaround is applied.
- GitHub Pages deployment has been removed from `.github/workflows/frontend-pages.yml` in Stage 2. Frontend CI remains active, while `vercel.json` remains the implemented Vercel Services deployment configuration. This code change does not remove a GitHub Pages site, custom domain, or repository setting outside the codebase.
- Before operational use, Kiet Huynh must confirm Vercel service names, public/internal paths, the `/api` prefix decision, any future bindings, production data/secrets readiness, and the release strategy. The committed configuration does not itself prove a Vercel deployment or establish authentication/data readiness.

- Backend

   ~~~powershell
   cd backend
   npm ci
   npm run build
   npm run test:ci
   ~~~

### Run

- Frontend

   ~~~powershell
   npm run dev -- --host 127.0.0.1 --port 5173
   ~~~
   Open: `http://127.0.0.1:5173/`

- Backend

   ~~~powershell
   npm run start:dev
   ~~~

### Test

- Frontend

   ~~~powershell
   npm run preview -- --host 127.0.0.1 --port 4173
   ~~~
   Open: `http://127.0.0.1:4173/`

   The CI workflow also runs `npm test` and `npm run test:browser` after Build succeeds.

- Backend

   From `backend/`, run `npm test` for the Node/`ts-node` unit and Nest integration checks, or `npm run test:ci` to build then run both suites. The integration test checks `GET /health` and the global `ValidationPipe`; Supertest temporarily binds an OS-assigned loopback listener for each request and releases it when that request settles. The scripts set `DATABASE_ENABLED=false`, and the `after` hook calls `app.close()` to close the Nest application and remaining handles, so the suite never uses the fixed production port `3000` or MongoDB. A failed check returns a non-zero exit code. Database integration testing is deferred.

   To manually inspect a running API, `Invoke-WebRequest http://127.0.0.1:3000/health -UseBasicParsing` returns status `200` and JSON `{"service":"179fc-mms-backend","status":"ok"}`.

### Local development

- Use Node.js 26.x for the React JavaScript client and NestJS API. Both service `package.json` files and pull-request workflows pin this major so Vercel cannot silently move a build to a later major; Vercel continues to provide minor and security patch updates within 26.x. Reopen the terminal after upgrading Node.js so that `node --version` reports the 26.x release.
- The frontend development server uses port `5173`, the backend uses port `3000`. Make sure both ports are available before starting the services.
- The chatbot service is intentionally not runnable yet, its delivery plan is in `chatbot/README.md`.

### Documentation rule

- Update the `README.md` in the affected top-level component directory whenever its code, configuration, flow, or architecture changes.
- Update this root README whenever a change affects repository-wide architecture, shared workflows, technology choices, or operations.

### Test placement rule

- Place all test source exclusively under `tests/`.
- Use `tests/frontend/` for frontend tests, `tests/backend/` for backend tests, `tests/chatbot/` for chatbot tests, and `tests/database/` for database tests.
- Do not place test source files in application directories.

## Current Status

| Workstream | Planning | Foundation | Feature Development | Test Coverage | Current Result |
| --- | --- | --- | --- | --- | --- |
| Frontend | Complete | Complete | In progress | Initial coverage | Responsive guest-capable React portal with mock sign-in for protected Employees/Organization, dashboard, member directory/profile, interactive organization chart, posts, settings, help, and 179 Assist |
| Backend | Complete | MongoDB local trial foundation | Feature APIs not started | Initial unit/integration coverage; database integration deferred | NestJS API with liveness/readiness endpoints, guarded local MongoDB lifecycle, and a synthetic mock importer; frontend is not yet wired to API data |
| Chatbot | Complete | Not started | Not started | Planned | FastAPI delivery plan |
| Designs | Complete | Not started | Not started | Not started | Asset and handoff plan |
| Scripts | Complete | Local mock importer complete | In progress | No script test runner | Guarded local MongoDB mock-data import script and component folders |
| Tests | Complete | In progress | In progress | Initial coverage | Centralized Node logic checks and Playwright Organization/profile interaction coverage |

## Next Actions

| Order | Workstream | Planned Action | Expected Outcome |
| --- | --- | --- | --- |
| 1 | Product and security | Define member data, authentication, roles, permissions, and chatbot access boundaries. | A shared domain and authorization baseline for all services. |
| 2 | Backend | Implement versioned member, role, and organization administration modules with persistence and API documentation. | Secure member-management API endpoints. |
| 3 | Designs | Produce approved responsive flows for sign-in, member directory, member profile, administration, and assistant interactions. | Implementation-ready design handoff. |
| 4 | Frontend | Remove the temporary demo sign-in bypass, then connect the portal to backend/database authentication and member APIs; add the approved profile and administration designs and connect the mock post workflows. | Usable member-management web experience with real access control and live data. |
| 5 | Tests and CI | Add component test runners, smoke tests, member-flow coverage, API contracts, and CI reporting under `tests/`. | Repeatable quality checks with centralized test source. |
| 6 | Chatbot | Create the FastAPI service, integrate it with authenticated backend APIs, and add guardrails, audit logging, and observability. | Secure virtual-assistant capability. |

## Shared Settings preferences

Settings now shares saved club name, language, notification preferences, compact navigation, canonical account/profile data, and display-time formatting across the portal. Persistence remains a browser-local mock; writes must succeed before consumers change. Dirty drafts and cross-tab conflicts are guarded. Notification delivery and security services are unavailable, but their Settings UI is interactive and explicitly does not claim a remote action completed. Existing offset-free event/post timestamps are interpreted as Ho Chi Minh City wall-clock time; date-only fields and publication schedules are preserved. See [implemented behavior and boundaries](frontend/README.md#settings-implementation--179mms-6).

Run `npm test`, `npm run test:browser` and `npm run build` from `frontend/`. The browser suite includes Help, Settings and Organization, using synthetic local data; it does not verify backend services.
