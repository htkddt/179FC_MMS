# Frontend

## Purpose

This directory contains the React single-page application for 179FC_MMS. It implements the approved 179FC portal reference with a mocked sign-in flow, responsive authenticated shell, and the Dashboard, Employees, Organization, Settings, Help, and 179 Assist experiences.

## Stack

- React
- React Router
- JavaScript
- JSX
- CSS
- Vite

## Directory Structure

The following tree shows the project source and assets. Generated `node_modules/` and `dist/` directories are omitted.

~~~text
frontend/
|-- public/
|   +-- images/
|       |-- dashboard/
|       |   |-- quan-khu-7.jpg
|       |   +-- thong-nhat.jpg
|       +-- posts/
|           |-- training-calendar.svg
|           +-- volunteer-team.svg
|-- src/
|   |-- app/
|   |   |-- App.jsx
|   |   |-- router.jsx
|   |   +-- routes.js
|   |-- components/
|   |   |-- assistant/
|   |   |   |-- assistantApi.js
|   |   |   +-- AssistantLauncher.jsx
|   |   |-- layout/
|   |   |   |-- AppShell.jsx
|   |   |   |-- Sidebar.jsx
|   |   |   +-- TopBar.jsx
|   |   +-- ui/
|   |       |-- states/
|   |       |   +-- EmptyState.jsx
|   |       |-- Avatar.jsx
|   |       |-- Button.jsx
|   |       |-- Card.jsx
|   |       |-- Icon.jsx
|   |       |-- PageHeader.jsx
|   |       |-- Tabs.jsx
|   |       +-- TextField.jsx
|   |-- features/
|   |   |-- auth/
|   |   |   |-- components/
|   |   |   |   +-- SignInForm.jsx
|   |   |   |-- pages/
|   |   |   |   +-- SignInPage.jsx
|   |   |   +-- authStore.jsx
|   |   |-- dashboard/
|   |   |   |-- components/
|   |   |   |   |-- PostCard.jsx
|   |   |   |   |-- SessionDetails.jsx
|   |   |   |   |-- StatCard.jsx
|   |   |   |   |-- TeamFeed.jsx
|   |   |   |   +-- UpcomingPanel.jsx
|   |   |   |-- pages/
|   |   |   |   +-- DashboardPage.jsx
|   |   |   +-- dashboardStore.js
|   |   |-- employees/
|   |   |   |-- api/
|   |   |   |   +-- membersApi.js
|   |   |   |-- components/
|   |   |   |   |-- EmployeeCard.jsx
|   |   |   |   |-- EmployeeGrid.jsx
|   |   |   |   +-- MemberSearch.jsx
|   |   |   |-- pages/
|   |   |   |   |-- EmployeeProfilePage.jsx
|   |   |   |   +-- EmployeesPage.jsx
|   |   |   |-- memberProfileStore.js
|   |   |   +-- useMembers.js
|   |   |-- help/
|   |   |   |-- api/
|   |   |   |   +-- helpApi.js
|   |   |   +-- pages/
|   |   |       +-- HelpPage.jsx
|   |   |-- organization/
|   |   |   |-- components/
|   |   |   |   |-- OrganizationChart.jsx
|   |   |   |   |-- OrganizationMemberMenu.jsx
|   |   |   |   |-- OrganizationNode.jsx
|   |   |   |   +-- OrganizationTeam.jsx
|   |   |   |-- pages/
|   |   |   |   +-- OrganizationPage.jsx
|   |   |   +-- organizationLayout.js
|   |   |-- posts/
|   |   |   |-- api/
|   |   |   |   +-- postsApi.js
|   |   |   |-- pages/
|   |   |   |   |-- PostDetailsPage.jsx
|   |   |   |   |-- PostEditorPage.jsx
|   |   |   |   +-- PostsPage.jsx
|   |   |   |-- postContent.js
|   |   |   |-- postFilters.js
|   |   |   +-- postFormat.js
|   |   |-- settings/
|   |   |   |-- api/
|   |   |   |   +-- settingsApi.js
|   |   |   +-- pages/
|   |   |       +-- SettingsPage.jsx
|   |   +-- shared/
|   |       +-- pages/
|   |           +-- PlaceholderPage.jsx
|   |-- hooks/
|   |   +-- useUrlTab.js
|   |-- mocks/
|   |   |-- dashboard.js
|   |   |-- help.js
|   |   |-- members.js
|   |   |-- posts.js
|   |   +-- settings.js
|   |-- styles/
|   |   |-- globals.css
|   |   |-- organization.css
|   |   |-- post-workflow.css
|   |   +-- tokens.css
|   |-- App.jsx
|   +-- main.jsx
|-- index.html
|-- package-lock.json
|-- package.json
|-- README.md
+-- vite.config.js
~~~

## Run Locally

~~~bash
npm ci
npm run dev
~~~

Use npm run build for a production build and npm run preview to preview it locally.

The application requires Node.js 20.19 or newer (or Node.js 22.12 or newer).

## Environments and GitHub Pages base path

- **LocalHost**: `npm run dev` serves the application from `/`. `vite.config.js` always uses this root path outside Production, so the local Vite and Playwright URLs remain `http://127.0.0.1:<port>/`.
- **Production**: `npm run build` uses `VITE_BASE_PATH` when set. The GitHub Actions workflow receives the repository-aware value from `actions/configure-pages`, which produces a GitHub Pages-compatible build for this project site, then deploys it after Build and Test succeed for a qualifying pull request. The router uses Vite's `BASE_URL` as its basename, so app routes stay relative to that production path.
- **Public GitHub Pages demo**: `https://htkddt.github.io/Vibe_Coding/` hosts the static demo/preview build. “Production” in the Vite build mode and base-path configuration does not mean this public demo has production authentication, authorization, backend persistence, or real-data safeguards.
- Copy the documented value in `.env.example` only when a local production build needs to emulate the GitHub Pages subpath. Do not commit an environment file containing credentials or other secrets.

## Implemented routes and flow

- `/sign-in` uses an explicit demo-access flow. Any sign-in creates a mock Club Admin session in `sessionStorage`; credentials are neither validated nor sent. The session survives refresh in the same browser tab and is cleared on logout. This is also true on the public GitHub Pages demo, so it must not be used with real account credentials or member/personal data.
- `/dashboard`, `/employees`, `/organization`, `/posts`, `/settings`, and `/help` use the authenticated shell.
- `/employees` is a responsive directory of 30 mock members. It has Total, Online, Offline, and Team summary statistics; instant search across name, role, team, and email; and sorting by name, team, or most recently joined. Each member card has an accessible profile link plus entrance and hover motion that respects the user's reduced-motion preference.
- `/employees/:memberId` provides a working member profile. Users can upload or remove a PNG, JPG, or WebP avatar (up to 1.5 MB), select a team, and edit date of birth and phone number. Changes are stored only in the current browser's `localStorage` and are reflected in the directory; they are mock data, not server-side member records.
- `/dashboard` includes a mock team feed with updates, likes and comments, plus an upcoming session list. Users can add feed updates and scheduled sessions; these changes and interactions are stored in the current browser's `localStorage` and are not shared with other users.
- Example training and match sessions include venue photos, addresses and Google Maps search links. The dates and events are illustrative. New sessions can include an optional address (which generates a Maps search link) and image URL. The bundled, cropped sample photos are [Quân khu 7 by ThoseDaysAreGone](https://commons.wikimedia.org/wiki/File:S%C3%A2n_v%E1%BA%ADn_%C4%91%E1%BB%99ng_Qu%C3%A2n_khu_7.jpg) and [Thống Nhất by Yanee134](https://commons.wikimedia.org/wiki/File:20180909_Th%E1%BB%91ng_Nh%E1%BA%A5t_Stadium.jpg), both [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
- Dashboard cards, forms, and feed actions use short entrance and interaction animations. These animations are disabled when the system requests reduced motion.
- `/posts?tab=all|published|drafts` provides URL-backed tabs, search, sorting, status counts, draft edit links, and loading/empty/error states. `/posts/:postId` displays post content, actions, and available mock performance data; `/posts/new` and `/posts/:postId/edit` provide creation and editing, image attachments, formatting, draft auto-save, review, publication, and unpublishing. The mock posts adapter stores changes and images in this browser's `localStorage`, so they are not shared across users or devices. Images are limited to 2 MB. Scheduled posts stay in drafts and are marked published when the collection is next read after the chosen time; this is not a background publishing service. Visibility is stored as a preference but is not enforced by a server.
- `/settings?tab=general|notifications|security` provides URL-backed tabs, local form state, dirty-navigation confirmation, validation, and save feedback. The mock settings adapter stores preferences in browser `localStorage`; compact navigation applies after saving. These controls do not change server-side security or account settings.
- Password and session management, help articles, and support have clearly labeled placeholder routes until their designs and server-authorized APIs are available. The help guides navigate to relevant routes. 179 Assist uses a mock reply adapter and keeps conversation history while the shell remains mounted. The icon button toggles the chat panel and retains its accessible label; the launcher tooltip has been removed.
- Feature adapters isolate mock dashboard, posts, settings, help, assistant, and member-profile behavior from their UI. Member directory data is mocked in [`src/mocks/members.js`](src/mocks/members.js); [`memberProfileStore.js`](src/features/employees/memberProfileStore.js) persists the editable profile fields locally.

## Organization implementation

`/organization` is a team-based canvas backed by the same member records as Employees and Employee profile. The toolbar has a flexible Search field and a team combobox; the Organization chart/Member directory tabs, dotted grid, Team connections caption, and application right-click menu are removed. Team names and controls occupy a separate header above every connector.

| Action | Current behavior | Data affected |
| --- | --- | --- |
| Search / filter | Match name, role, team, or email; All teams clears filters. Empty search results offer Clear filters. | Transient page state |
| Member left drag | Move an individual card with zoom-aware pointer coordinates; Escape/pointer cancellation restores it. Dropping on blank space or its own team saves its relative position. | Personal chart offsets |
| Drop onto another team | Highlight the destination frame, including collapsed/empty teams. Commit membership on release after a real drag; a click alone never transfers. | Canonical member `team` |
| Member ellipsis | Opens Profile, View team, Move to team, and Reset position. Right-click/Shift+F10 never opens the application menu. Tab to ellipsis and Enter/Space provide keyboard access; arrows/Home/End navigate the popup. | Navigation, membership, or offsets according to action |
| Move to team | Choose a different team from the menu, including empty/hidden teams. Uses exactly the same mutation as drag/drop. | Canonical member `team` |
| Per-team minus / plus | Scale that team's cards from 75% to 125%, with layout height and connectors recalculated. | Personal team view |
| Per-team chevron | Collapse/expand members while retaining the frame, count, and transfer destination. | Personal team view |
| Per-team eye | Hide the frame and its members; Show chips or the sidebar eye restore it. Hiding every team has a recoverable empty state. | Personal team view |
| Per-team expand | Filter to that team and enlarge the chart overlay; All teams restores other teams, Exit/Escape closes the overlay. | Transient page state |
| Global zoom / expand | Zoom the canvas from 45% to 140%, fit its width, or enlarge the entire chart. | Transient page state |
| Reset position / Reset layout | Reset position clears one member's offset. Reset layout clears all offsets and saved team view settings and restores automatic zoom; memberships are retained. | Personal chart settings only |

Team counts and overview statistics always use the canonical records, including collapsed/hidden members. The catalog retains all eight existing teams when a team becomes empty. A successful transfer clears the moved member's old chart offset, reveals and expands the destination, clears search/team filters, and recalculates both teams. It preserves name, avatar, phone, birth date, email, role, and membership/availability status. The `role` job title is independent of `team`; a transfer does not assign a new job title.

The current schema has no manager IDs. Each member, including Club Admin, appears in their team frame; connectors indicate membership and never assert reporting lines. Desktop uses up to four team columns; narrow screens retain readable cards, their own chart scrolling, and stacked summary panels. Card arrival, team reflow/scale, hover/drag feedback, and popup animations respect reduced motion. Drag tracking has no position transition lag. The shared assistant remains an icon/chat panel without a launcher tooltip.

### Organization file and state map

- [OrganizationPage.jsx](src/features/organization/pages/OrganizationPage.jsx): shared member subscription, search/filter, team view preferences, expanded chart, and the transfer callback.
- [OrganizationChart.jsx](src/features/organization/components/OrganizationChart.jsx): pointer capture, drop hit testing, global zoom, preview/cancellation, pending mutation lock, success/error feedback, and layout persistence.
- [OrganizationTeam.jsx](src/features/organization/components/OrganizationTeam.jsx): team headers, counts, scale/collapse/hide/expand controls, and drop feedback. [OrganizationNode.jsx](src/features/organization/components/OrganizationNode.jsx): one draggable member and its ellipsis trigger. [OrganizationMemberMenu.jsx](src/features/organization/components/OrganizationMemberMenu.jsx): viewport-clamped actions and destination-team picker. Menus close on outside click, actual scrolling, resize, or Escape and restore focus on Escape.
- [organizationLayout.js](src/features/organization/organizationLayout.js): catalog grouping, frame/slot layout, bounds for scaled cards, drop target lookup, and storage validation. `179fc-organization-layout-v2` stores offsets by member ID as `{ team, dx, dy }` relative to the automatic slot at 100% team scale; an offset applies only while its stored team matches the member. `179fc-organization-view-v1` stores `{ [teamName]: { scale, collapsed, hidden } }`. Old v1 absolute chart coordinates are superseded by automatic team layout; member/profile data is retained.
- [membersApi.js](src/features/employees/api/membersApi.js): the single async `transferMemberTeam({ memberId, targetTeam })` adapter for both drag/drop and the menu. Its catalog is separate from filtered membership so empty teams remain destinations.
- [memberProfileStore.js](src/features/employees/memberProfileStore.js): merges only editable profile fields. Team changes require a successful write to `179fc-member-profiles-v1` before emitting `179fc-member-profile-changed`. Failure rejects the mutation and preserves the old team; unrelated fields are retained.
- [useMembers.js](src/features/employees/useMembers.js): merges base records and saved profile fields for both Organization and Employees, and refreshes on same-tab profile events and cross-tab storage events. Opening `/employees/:memberId` reads that same canonical data. [organization.css](src/styles/organization.css): team canvas, overlay, responsive layout, and motion.

### Organization backend integration contract (proposed; not implemented)

The backend currently exposes only its scaffold/health endpoint. The routes and payloads below are a handoff contract for future implementation, not existing APIs.

| Boundary | Proposed contract | Required behavior |
| --- | --- | --- |
| Team catalog | `GET /v1/teams?includeEmpty=true` | Return stable team IDs/names and current counts, including empty teams. Replace the mock name-based catalog; never infer teams only from the filtered member list. |
| Member reads | `GET /v1/members` and `GET /v1/members/:memberId` | Return canonical `id`, `teamId`, team label, role/profile fields, and a record `version`/ETag. Use these records in both Employees and Organization. |
| Team transfer | `PATCH /v1/members/:memberId/team`, body `{ "teamId": "media", "expectedVersion": 3 }` | Validate member, destination, workspace access and transfer permission. In one transaction update membership, revision, timestamps, source/destination counts, and audit details. Return the complete updated member plus affected team IDs/counts. A no-op transfer to its current team is idempotent. |
| Personal chart preferences | `GET/PATCH /v1/me/preferences/organization` | Persist versioned per-user offsets and team view settings using stable member/team IDs; keep these settings separate from membership. Global zoom, filters, and the enlarged overlay are currently transient. |

Example successful transfer response (illustrative IDs):

```json
{
  "member": { "id": "thu-le", "teamId": "media", "team": "Media", "role": "Operations Lead", "version": 4 },
  "affectedTeams": [{ "id": "management", "memberCount": 2 }, { "id": "media", "memberCount": 4 }]
}
```

The actual member response must also retain the existing profile fields; this abbreviated example shows the mutation-relevant fields only. The client sequence must remain:

1. Preview card movement without writing employee data. On a valid cross-team drop/menu selection, lock duplicate transfers and call the shared adapter once; pure card movement/view controls never call membership APIs.
2. Keep canonical membership unchanged until persistence succeeds. Replace the adapter's local-storage write with the awaited server mutation. Treat the returned member as authoritative; do not issue a full profile replacement that could erase avatar, phone, or other concurrent edits.
3. On success, update/invalidate the shared member collection, member detail, organization groups, both teams/counts, and any filtered Employee view. Clear the transferred card's stale offset and reveal the destination. Other active clients need server events/subscriptions or refetch on focus; the browser-only custom/storage events are not a server synchronization mechanism.
4. On validation/auth/network errors keep the previous member/team and layout, unlock interaction, and show a retryable error. On version conflict (`409`/`412`) refetch authoritative member/team data before retry. Ensure profile saves also use version checks so an older open profile form cannot overwrite a more recent transfer. The current local mock remains last-write-wins across concurrent profile forms.
5. Make retries safe with an idempotency key or equivalent server policy. Record actor, member, source/destination IDs and time in the audit trail. Recalculate/filter totals from authoritative data and support pagination/server search when the directory grows.

Backend tests should verify atomicity, authorization, invalid/deleted teams or members, concurrent edits, idempotency, preserved profile fields, empty-team destinations, and consistent member/detail/team-count responses. Frontend coverage is documented in [tests/frontend/README.md](../tests/frontend/README.md).

## Post Create and Post Edit implementation

**Post Create does not have a separate `PostCreatePage.jsx` file.** Both Create and Edit use [`PostEditorPage.jsx`](src/features/posts/pages/PostEditorPage.jsx), which contains their shared form and their mode-specific controls. When changing this file, check both flows: changes to shared fields, formatting, attachments, validation, and submission can affect both pages.

| Route | Component mode | Design reference |
| --- | --- | --- |
| `/posts/new` | Create: no `postId` is present, so `isNew = !postId` is `true` and the form starts with `emptyPost()` | [`Post_Creations.png`](../designs/Post_Creations.png) |
| `/posts/:postId/edit` | Edit: `postId` is present, so `isNew` is `false` and the existing post is loaded; the heading and actions depend on whether it is a draft or published | [`Post_Editor.png`](../designs/Post_Editor.png) |
| `/posts/:postId` | Details: rendered separately by `PostDetailsPage` | [`Post_Details.png`](../designs/Post_Details.png) |

The code is organized as follows:

- [`src/app/router.jsx`](src/app/router.jsx) maps both `/posts/new` and `/posts/:postId/edit` to `PostEditorPage`. The Create post link is in [`PostsPage.jsx`](src/features/posts/pages/PostsPage.jsx).
- [`PostEditorPage.jsx`](src/features/posts/pages/PostEditorPage.jsx) defines `isNew`, initializes the blank post, renders the form, and branches for create and edit settings and buttons. Its `submit(mode)` handles saving a draft, publishing, scheduling, and review. Existing drafts auto-save; the Create form is saved through its action buttons.
- [`postsApi.js`](src/features/posts/api/postsApi.js) implements `getPosts`, `savePost`, `unpublishPost`, and `restorePost`. This is a mock adapter backed by browser `localStorage`, not the backend API. Scheduled posts become published when the collection is next read after their scheduled time; visibility is not enforced by a server.
- [`postContent.js`](src/features/posts/postContent.js) handles conversion and sanitization of the editor's content. [`post-workflow.css`](src/styles/post-workflow.css) contains the post details and editor styles and is imported by [`main.jsx`](src/main.jsx).
- [`PostDetailsPage.jsx`](src/features/posts/pages/PostDetailsPage.jsx) renders the separate details page, including its link to edit. Post workflow logic tests are in [`tests/frontend/portal.test.mjs`](../tests/frontend/portal.test.mjs).

## Responsive behavior

- Layout dimensions use fluid CSS sizing (clamp, percentages, and auto-fitting grids), so spacing, cards, sidebars, type, and panels scale with the available viewport instead of reproducing one fixed design resolution.
- Desktop retains the burgundy sidebar and floating 179 Assist launcher, both sized relative to the viewport.
- The layout changes structure only when necessary: the dashboard column collapses, the sidebar becomes an accessible drawer, grids adapt to their available width, and the organization chart remains horizontally scrollable on narrow screens rather than clipping content.

## Planned integration

1. Replace demo access and browser storage with backend authentication, account settings, session validation, and the finalized permission model before operational production use or processing real data. The current flow does not protect real data.
2. Connect server-authorized post, settings, help, support, assistant, and member-profile APIs, including server-side visibility and scheduled publication. Replace browser-backed profile edits with validated, permission-aware member records once the contracts are approved.
3. Extend the Organization browser interaction checks to the other features and add broader accessibility and visual regression coverage across desktop and mobile viewports.

## Temporary demo-access workaround

Clicking Sign in to 179FC creates a mock Club Admin session without checking credentials. The session is stored in the browser tab's `sessionStorage` and is not an authentication or authorization boundary. The public GitHub Pages URL is a demo/preview host only: do not enter real credentials, member records, or other personal/sensitive data. Replace this flow with real authentication, authorization, server-side persistence, and data protections before operational production use.

## Test Location

Do not add test source to this directory. Frontend tests live in `../tests/frontend/`. Run logic checks with `npm test`, and Organization browser checks with `npm run test:browser`. Playwright is a development dependency; its config starts Vite automatically on port 5180. Windows uses installed Microsoft Edge by default. See [runner setup and coverage](../tests/frontend/README.md).

## Documentation Rule

Update this README whenever frontend code, dependencies, routes, data flows, commands, or architecture changes. Also update the root README when the change affects the entire repository.
