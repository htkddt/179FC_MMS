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

## Implemented routes and flow

- `/sign-in` uses an explicit demo-access flow. Any sign-in creates a mock Club Admin session in `sessionStorage`; credentials are neither validated nor sent. The session survives refresh in the same browser tab and is cleared on logout.
- `/dashboard`, `/employees`, `/organization`, `/posts`, `/settings`, and `/help` use the authenticated shell.
- `/employees` is a responsive directory of 30 mock members. It has Total, Online, Offline, and Team summary statistics; instant search across name, role, team, and email; and sorting by name, team, or most recently joined. Each member card has an accessible profile link plus entrance and hover motion that respects the user's reduced-motion preference.
- `/employees/:memberId` provides a working member profile. Users can upload or remove a PNG, JPG, or WebP avatar (up to 1.5 MB), select a team, and edit date of birth and phone number. Changes are stored only in the current browser's `localStorage` and are reflected in the directory; they are mock data, not server-side member records.
- `/dashboard` includes a mock team feed with updates, likes and comments, plus an upcoming session list. Users can add feed updates and scheduled sessions; these changes and interactions are stored in the current browser's `localStorage` and are not shared with other users.
- Example training and match sessions include venue photos, addresses and Google Maps search links. The dates and events are illustrative. New sessions can include an optional address (which generates a Maps search link) and image URL. The bundled, cropped sample photos are [Quân khu 7 by ThoseDaysAreGone](https://commons.wikimedia.org/wiki/File:S%C3%A2n_v%E1%BA%ADn_%C4%91%E1%BB%99ng_Qu%C3%A2n_khu_7.jpg) and [Thống Nhất by Yanee134](https://commons.wikimedia.org/wiki/File:20180909_Th%E1%BB%91ng_Nh%E1%BA%A5t_Stadium.jpg), both [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
- Dashboard cards, forms, and feed actions use short entrance and interaction animations. These animations are disabled when the system requests reduced motion.
- `/posts?tab=all|published|drafts` provides URL-backed tabs, search, sorting, status counts, draft edit links, and loading/empty/error states. `/posts/:postId` displays post content, actions, and available mock performance data; `/posts/new` and `/posts/:postId/edit` provide creation and editing, image attachments, formatting, draft auto-save, review, publication, and unpublishing. The mock posts adapter stores changes and images in this browser's `localStorage`, so they are not shared across users or devices. Images are limited to 2 MB. Scheduled posts stay in drafts and are marked published when the collection is next read after the chosen time; this is not a background publishing service. Visibility is stored as a preference but is not enforced by a server.
- `/settings?tab=general|notifications|security` provides URL-backed tabs, shared saved settings, guarded drafts/conflicts and canonical Account data. Saved club name/compact navigation update the shell; time zone updates Posts/Dashboard formatters. The current build keeps notification and security services unavailable; the newer PNG/UX design package specifies their planned interactive UI without claiming backend delivery or security operations.
- Password and session management, help articles, and support have clearly labeled placeholder routes in the current build. The Settings design update defines the planned Password, Two-factor, and Sessions UI before implementation; server-authorized operations still require backend work. The help guides navigate to relevant routes. 179 Assist uses a mock reply adapter and keeps conversation history while the shell remains mounted. The icon button toggles the chat panel and retains its accessible label; the launcher tooltip has been removed.
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

## Settings implementation — 179MMS-6

`/settings?tab=general|notifications|security` implements the previously reviewed Settings baseline. The design update is documented in the paired [General](../designs/Settings/Settings_General.md), [Notifications](../designs/Settings/Settings_Notifications.md), [Security](../designs/Settings/Settings_Security.md), [Change password](../designs/Settings/Settings_Change_Password.md), [Two-factor](../designs/Settings/Settings_Two_Factor.md), and [Sessions](../designs/Settings/Settings_Sessions.md) references. It is pending application implementation; the notes below accurately describe the current build, not planned UI.

- `SettingsProvider` supplies one saved snapshot through the shell. `settingsApi` retains `179fc-demo-settings` and emits `179fc-settings-changed` only after persistence succeeds. Same-window events, matching browser storage events (including clear) and window focus refresh consumers. Bad JSON/types and unavailable storage show Retry and prevent saving; missing storage uses defaults.
- `SettingsPage` owns the draft, validation, feedback and navigation guard; presentational controls, Account and discard dialog receive data/callbacks. Only changed General keys are patched. Club name is trimmed, required and limited to 80 characters. Duplicate submits and conflicting navigation are locked while saving; failures retain the draft and last effective values. Discard resets the draft. Tab/route/Profile/sidebar/Log out changes open a native modal focused on Keep editing; Escape cancels and restores focus. Refresh/close use the native unload guard.
- Saved club name updates the accessible Sidebar brand throughout private routes; the 179 logo remains. Long names ellipsize visually while retaining full accessible text. Compact navigation applies after saving, retains accessible link names, and preserves full mobile drawer labels. Drawer and assistant close restore trigger focus.
- A pristine form refreshes after external saves. A dirty form keeps its draft, shows a conflict and disables Save until guarded Reload latest/Discard. Save compares the exact storage snapshot before writing and preserves unrelated/legacy keys. Browser storage is a local mock, not an atomic multi-process database: simultaneous cross-process compare/write races ultimately require backend versions/ETags.
- In the current build, English is the only available language. Vietnamese is disabled; unsupported saved language choices remain stored with explicit English fallback until the user chooses English. The design update adds selectable UI and an honest incomplete-translation boundary, but does not itself implement a translation catalog.
- In the current build, notification switches retain saved choices but are disabled because reminder and summary delivery capabilities are unavailable. Manual 179 Assist still works. Security actions are disabled and two-factor status is Not connected; legacy `twoFactor` never establishes enrollment. The design update requires clickable preference/security UI with explicit UI-only boundaries; it does not authorize a local success claim for password changes, session revocation, enrollment, or delivery.
- `CurrentAccountProvider` joins `useAuth().user.id` to the canonical `useMembers` profile used by Employees/Organization. Account, TopBar and Sidebar share name/role/avatar/email and refresh after profile changes, including another tab. View profile and the user menu target that user ID. Missing email/profile data has an honest fallback.

### Shared dates and scheduling

`features/shared/dateFormat.js` formats genuine timestamps for Posts list/details/activity/scheduled-note and Dashboard feed/session views using the saved display zone (Asia/Ho_Chi_Minh or UTC). Settings changes rerender consumers across open tabs. Malformed dates show Date unavailable. Unsupported saved languages use the same English formatting fallback as UI copy.

Existing Dashboard event date/time pairs and legacy offset-free post timestamps are interpreted as **Ho Chi Minh City club wall-clock time (UTC+07:00)** for display. Upcoming day badges and event times use that same instant, including previous-day rollover in UTC. Date-only birthdays/join dates/calendar labels never shift. Fixture relative labels such as 2 days ago remain literal; no absolute timestamp is invented.

Display preferences never rewrite stored events or scheduled publication instants. The Post Create datetime input retains its existing **device time zone** interpretation, now explicitly labelled; Dashboard session input is labelled Ho Chi Minh City time. Existing publication-on-next-collection-read semantics are unchanged. No schema migration, backend scheduler, auth API or notification service is implemented.

### Verification

From `frontend/`, run `npm ci`, `npm test`, `npm run test:browser` and `npm run build`. Logic checks include settings validation/persistence/conflict/date boundaries. Playwright currently covers the existing Settings flows and shared consumers as well as Organization regressions; Developer must extend it for the approved design update. See [test scope and setup](../tests/frontend/README.md). Authoring/export sources and their dependent design-only test were removed when the design package was restricted to PNG/Markdown; product tests remain unchanged until that implementation lands. Local self-checks are separate from Tester QA and CI.

## Planned integration

1. Replace demo access and browser storage with backend authentication, account settings, session validation, and the finalized permission model before production. The current flow does not protect real data.
2. Connect server-authorized post, settings, help, support, assistant, and member-profile APIs, including server-side visibility and scheduled publication. Replace browser-backed profile edits with validated, permission-aware member records once the contracts are approved.
3. Extend the Organization and Settings browser interaction checks to the remaining features and add broader accessibility and visual regression coverage across desktop and mobile viewports.

## Temporary demo-access workaround

Clicking Sign in to 179FC creates a mock Club Admin session without checking credentials. The session is stored in the browser tab's `sessionStorage` and is not an authentication or authorization boundary. Replace it before using real accounts or member data.

## Test Location

Do not add test source to this directory. Frontend tests live in `../tests/frontend/`. Run logic checks with `npm test`, and Settings/Organization browser checks with `npm run test:browser`. Playwright is a development dependency; its config starts Vite automatically on port 5180. Windows uses installed Microsoft Edge by default. See [runner setup and coverage](../tests/frontend/README.md).

## Documentation Rule

Update this README whenever frontend code, dependencies, routes, data flows, commands, or architecture changes. Also update the root README when the change affects the entire repository.
