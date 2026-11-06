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
| API | NestJS, TypeScript | Initial scaffold |
| Virtual assistant | Python, FastAPI | Planned |
| Testing | Node logic checks and Playwright Organization flows under `tests/frontend/` | Initial coverage |
| Automation | PowerShell and/or Node.js scripts | Planned |

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

### Temporary frontend demo access

- The GitHub Pages URL is a public static **demo/preview** of the frontend, not an operational production service.
- The frontend currently bypasses account authentication so a reviewer without an account can enter the portal. Clicking Sign in to 179FC creates a mock Club Admin session in the browser tab?s `sessionStorage`; email and password values are not validated or transmitted.
- The Pages demo has no real authentication, authorization, backend persistence, or access boundary. Do not enter real account credentials, member data, or other personal/sensitive information there.
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

### Frontend CI/CD and GitHub Pages

- `.github/workflows/frontend-pages.yml` runs only for active pull requests targeting `main` (opened, synchronized, and reopened).
- The workflow has sequential **Build**, **Test**, and **Deploy** jobs. Test requires a successful Build; Deploy requires successful Build and Test and then publishes the qualifying pull-request revision to the public GitHub Pages demo. Its `github-pages` environment exposes the Pages URL from `steps.deployment.outputs.page_url` in the workflow run.
- Build installs from `frontend/package-lock.json`, receives the repository-aware base path from `actions/configure-pages`, builds `frontend/dist`, and uploads it as the GitHub Pages artifact. Test runs `npm test`, installs Playwright Chromium, then runs `npm run test:browser`.
- The deploy job publishes the Pages artifact through the `github-pages` environment. The repository Pages source must remain set to **GitHub Actions**. Each passed qualifying PR refreshes the default public Pages demo URL; hosting a build there does not make the mock authentication or browser-local data production-ready.
- The current public Pages demo URL is `https://htkddt.github.io/179FC_MMS/`. Its project-site base path is supplied to CI by `actions/configure-pages`; do not substitute the former `/Vibe_Coding/` path in workflow configuration.

- Backend

   ~~~powershell
   cd backend
   npm ci
   npm run build
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

   ~~~powershell
   Invoke-WebRequest http://127.0.0.1:3000/health -UseBasicParsing
   ~~~

   A healthy API returns status `200` and the JSON body `{"service":"179fc-mms-backend","status":"ok"}`.

### Local development

- Use a supported Node.js release: 20.19+ (or 22.12+) for the React JavaScript client, and 20.11+ for the NestJS API. Reopen the terminal after upgrading Node.js so that `node --version` reports the new release.
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
| Frontend | Complete | Complete | In progress | Initial coverage | Responsive React portal with temporary demo sign-in, dashboard, member directory/profile, interactive organization chart, posts, settings, help, and 179 Assist |
| Backend | Complete | Complete | Not started | Planned | NestJS API shell with `GET /health` |
| Chatbot | Complete | Not started | Not started | Planned | FastAPI delivery plan |
| Designs | Complete | Not started | Not started | Not started | Asset and handoff plan |
| Scripts | Complete | Not started | Not started | Not started | Automation plan and component folders |
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
