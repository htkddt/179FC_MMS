# Design handoff — 179FC Member Management Portal

## Purpose and scope

This directory contains desktop design references and their accompanying UX descriptions. Each screen or state has a PNG export and a Markdown file covering its user goal, core experience, expected behavior, and navigation. The UX descriptions capture design intent; they do not imply that every flow is implemented. APIs, permissions, and copy that are not visible in a reference still require product/backend confirmation.

## Design files and routes

| Screen or state | Image | UX description | Route or state |
| --- | --- | --- | --- |
| Sign-in | [PNG](Sign-in/Sign-in.png) | [UX](Sign-in/Sign-in.md) | `/sign-in` |
| Dashboard | [PNG](Dashboard/Dashboard.png) | [UX](Dashboard/Dashboard.md) | `/dashboard` |
| Employees | [PNG](Employees/Employees.png) | [UX](Employees/Employees.md) | `/employees` |
| Organization | [PNG](Organization/Organization.png) | [UX](Organization/Organization.md) | `/organization` |
| Posts: All | [PNG](Posts/Post_All.png) | [UX](Posts/Post_All.md) | `/posts?tab=all` |
| Posts: Published | [PNG](Posts/Post_Published.png) | [UX](Posts/Post_Published.md) | `/posts?tab=published` |
| Posts: Drafts | [PNG](Posts/Post_Drafts.png) | [UX](Posts/Post_Drafts.md) | `/posts?tab=drafts` |
| Post details | [PNG](Posts/Post_Details.png) | [UX](Posts/Post_Details.md) | `/posts/:postId` |
| Create post | [PNG](Posts/Post_Creations.png) | [UX](Posts/Post_Creations.md) | `/posts/new` |
| Edit draft | [PNG](Posts/Post_Editor.png) | [UX](Posts/Post_Editor.md) | `/posts/:postId/edit` |
| Settings: General | [PNG](Settings/Settings_General.png) | [UX](Settings/Settings_General.md) | `/settings?tab=general` |
| Settings: Notifications | [PNG](Settings/Settings_Notifications.png) | [UX](Settings/Settings_Notifications.md) | `/settings?tab=notifications` |
| Settings: Security | [PNG](Settings/Settings_Security.png) | [UX](Settings/Settings_Security.md) | `/settings?tab=security` |
| Settings: responsive | [PNG](Settings/Settings_Responsive.png) | [Handoff](Settings/Settings_Handoff.md) | All tabs at 390 px; General at 768/1024 px |
| Settings: interaction states | [PNG](Settings/Settings_States.png) | [Editable HTML](Settings/Settings_Prototype.html) | Load/save/error/empty/conflict/confirmation states |
| Help | [PNG](Help/Help.png) | [UX](Help/Help.md) | `/help` |
| Assist | [PNG](Assist/Assist.png) | [UX](Assist/Assist.md) | Shared assistant panel, no dedicated route |

```text
designs/
|-- Assist/           Assist.png, Assist.md
|-- Dashboard/        Dashboard.png, Dashboard.md
|-- Employees/        Employees.png, Employees.md
|-- Help/             Help.png, Help.md
|-- Organization/     Organization.png, Organization.md
|-- Posts/            Post_All, Post_Published, Post_Drafts,
|                     Post_Details, Post_Creations, Post_Editor (.png and .md)
|-- Settings/         Settings_General, Settings_Notifications,
|                     Settings_Security (.png and .md)
|                     Settings_Prototype.html, Settings_Handoff.md,
|                     Settings_Responsive.png, Settings_States.png,
|                     render-settings.mjs
|-- Sign-in/          Sign-in.png, Sign-in.md
+-- README.md
```

The Posts and Settings tab files represent states of their respective pages, not separate sidebar destinations. The active tab must be represented in the URL so that refresh, browser navigation, and a copied link restore the same view. Post details, creation, and editing are separate screens reached from the posts list or details page.

Historical exports do not include a Figma source URL or known export date. The Settings revision for **179MMS-6** was exported from its editable local HTML on **2026-11-03**, including responsive/state boards; no Figma edits are claimed. Other PNGs remain desktop references. Design proposals do not imply their responsive/interactive behavior is implemented in the frontend.

## UI and component overview

### Shared authenticated shell

`AppShell` wraps all private pages and owns the desktop layout: a fixed sidebar, page header, and content area. Dashboard, Employees, and Organization all share this shell.

| Component | Responsibility | Used by |
| --- | --- | --- |
| `AppShell` | Composes `Sidebar`, `TopBar`, page content, and the assistant launcher; handles shared responsive/layout behavior. | Every private page |
| `Sidebar` | Brand/logo, `NavItem`s, bottom user summary, and the active navigation state derived from the URL. | `AppShell` |
| `TopBar` | Page title, optional context, and avatar-based `UserMenu`. Settings revision removes its subtitle. Open menus in historical references are interaction states, not permanent cards. | `AppShell` |
| `PageHeader` | Standardizes titles, subtitles, and page actions. | Private pages |
| `Tabs` | Accessible tab list with an active underline. Keeps its selected value in the page URL, supports keyboard navigation, and becomes horizontally scrollable rather than wrapping on narrow screens. | Posts, Settings |
| `Avatar` | Renders an image or colored-initials fallback. | Header, cards, organization nodes |
| User menu | Toggleable account popover implemented within `TopBar`, with Profile, Settings, Help center, and Log out actions. Closes on outside click, Escape, and navigation. | `TopBar` |
| `AssistantLauncher` | Persistent icon button with an accessible name, plus an expandable chat panel with a close action, message history, prompt suggestion, and submit input. The launcher tooltip has been removed. | `AppShell` |
| Loading, empty, and error states | Required for integration; Settings now includes a state board. Use shared `EmptyState` and appropriate page-level states. | Per feature |

### Sign-in

`SignInPage` sits outside `AppShell` and uses a split layout: a brand/message area on the left and a form on the right. The form includes email and password fields, a “forgot password” action, submit button, and an administrator-contact help message. It should use a real `<form>`, labels bound to inputs, and field-level error messages. The current sign-in is a demo session, not real authentication.

### Dashboard

| Component | Content represented in the design |
| --- | --- |
| `StatCard` | Active members, posts this week, and drafts in the UX description. The current frontend mock displays Teams instead of Drafts. |
| `StatsGrid` | Responsive grid containing `StatCard`s. |
| `TeamFeed` / `PostCard` | Author avatar, team, timestamp, content, tag, and action/statistics area (like/comment). |
| `UpcomingPanel` / `UpcomingEventItem` | Event list with a date badge, title, and time/location metadata. |

### Employees

`EmployeesPage` includes search, sorting, member statistics, and `EmployeeGrid`. Each `EmployeeCard` contains an avatar, team, name, role, and profile link to `/employees/:memberId`. The implemented profile supports avatar, team, birth date, and phone edits in browser storage. `useMembers` supplies the same current member records to Employees and Organization, including saved profile edits.

### Organization

The [Organization reference](Organization/Organization.png) is the visual starting point. The interaction refinements reviewed on **2026-11-02** supersede its older toolbar/diagram details: the Search field now spans the space before the team filter; view tabs, dotted grid, Team connections caption, title subtitle and application right-click behavior are removed. The supplied PNG is retained; its export date and Figma source URL are unknown.

`OrganizationPage` owns the shared member subscription, filtering, per-team preferences and expanded canvas. `OrganizationChart` composes `OrganizationTeam` frames, individually movable `OrganizationNode` cards and SVG membership connections. Each team header reserves separate title and control rows above its connectors; the Club Admin appears in the Management frame like every other team member. Current records do not define a reporting hierarchy.

Per-team controls zoom card size (75–125%), collapse/expand members, hide/restore the frame, or open an enlarged focused chart. The sidebar eye buttons and Show chips restore hidden teams. Global zoom/fit/expand and Reset layout remain available. Layout and team views are personal browser preferences; neither hiding nor resetting changes employee membership.

Member actions open only from the ellipsis button, including keyboard activation. `OrganizationMemberMenu` offers Profile, View team, Move to team and Reset position. Profile opens `/employees/:memberId`. Dragging onto another team or choosing a destination in the menu invokes the shared `membersApi.transferMemberTeam` mutation. A valid drop highlights the target; collapsed and empty teams are supported. Success updates both teams, the Employees card/profile and counts, preserves unrelated profile/role fields and reveals the destination. Failed saves retain the old membership and display feedback. Team catalog entries remain available when empty.

The chart has a plain background, readable adaptive columns, independent scrolling, responsive panels and motion for arrival/reflow/scale/popup feedback. Pointer dragging stays direct; reduced-motion preferences disable optional animation. See [Organization UX](Organization/Organization.md) for detailed interactions and [the frontend backend handoff](../frontend/README.md#organization-backend-integration-contract-proposed-not-implemented) for the proposed canonical membership and personal-view APIs. Export/Add member from the PNG remain outside this implementation.

### Posts (tabbed page)

`PostsPage` owns one screen with three URL-backed views. Use `/posts?tab=all` when the parameter is omitted or invalid, `/posts?tab=published` for published content, and `/posts?tab=drafts` for drafts. Do not make a route per tab or keep the tab solely in component state.

| Area | Required behavior and content |
| --- | --- |
| Page header | Render **Posts**, the subtitle “Create, publish, and manage updates for your club.”, and the shared user menu. The `Create post` action opens `/posts/new`, which has its own reference in `Post_Creations.png`. |
| Toolbar | A labelled search field filters by title, excerpt, and author; the tab list follows it; the `Newest first` control selects the ordering. Search text and sort should remain intact while changing tabs. Persist them in query parameters only if the product needs shareable filtered links. |
| Tabs | `All posts`, `Published`, and `Drafts` use `role="tablist"`, `role="tab"`, and `aria-selected`. The selected tab has burgundy/red text and a red underline. Click, Left/Right Arrow, Home, and End change the selected view without a full page reload. |
| Results panel | Its heading changes with the selection: `Recent posts`, `Published posts`, or `Draft posts`. List cards in the selected sort order. Each card shows a type icon, title, excerpt, author avatar/name, timestamp, a status chip, and an overflow menu. The all-posts list can contain both statuses. |
| Draft-only controls | Every draft card also exposes an obvious Edit button/icon in addition to its overflow menu. A published card must not show that edit affordance in the list design. |
| Overview rail | Show `Post overview` counts for published posts and drafts in every tab. The supporting campaign changes with context: `Share an update` + `Create post` for All/Published and `Ready to publish?` + `Review drafts` for Drafts. |

Use a `PostStatus` enum (`published`, `draft`) rather than display text to derive the tab filters and status chips. A post record needs at least `id`, `status`, `type`, `title`, `excerpt`, `author`, `updatedAt`, and `publishedAt` where applicable. Counts in `PostOverview` must come from the complete accessible collection, not only the currently rendered page of results.

For loading, retain the toolbar and overview-card dimensions with skeletons. For empty results, keep the active tab and filters visible, explain whether the cause is the tab or search query, and provide the relevant primary action: create a post for All/Published or create/review drafts for Drafts. Failures must preserve the selected tab and offer a retry action.

At desktop width, the results panel and overview rail form two columns; below the desktop breakpoint, place the overview after the list. On a narrow screen, the header action moves below the title if needed, the search takes a full row, the sort control remains reachable, and tab labels scroll horizontally. Do not hide a status chip, timestamp, or draft edit action merely to make a card narrower.

The table above describes the handoff intent; the current `PostsPage` groups its overview above the results and uses an inline create action and draft edit icon. The campaign and overflow menus described by the earlier handoff are not separate components in the current implementation.

### Post details, creation, and editing

| Reference | Design content and current route |
| --- | --- |
| [`Post_Details.png`](Posts/Post_Details.png) | `/posts/:postId`: back link, status, title, author and date, media and content, plus post actions, performance figures and chart, and recent activity. The current page supports editing and unpublishing published posts; sample performance and activity come from mock data. |
| [`Post_Creations.png`](Posts/Post_Creations.png) | `/posts/new`: title, rich-text update, media upload, visibility, publish-now or schedule choice, writing tips, and cancel/save-draft/publish actions. The current blank form starts with `emptyPost()` and validates title, content before publishing, image type/size, and future scheduling time. |
| [`Post_Editor.png`](Posts/Post_Editor.png) | `/posts/:postId/edit`: editable content and attachment, draft visibility and auto-save feedback, checklist, discard/save-draft/review-and-publish actions. The same route also edits published posts, with controls adapted to their status. |

Both Create and Edit are implemented in [`PostEditorPage.jsx`](../frontend/src/features/posts/pages/PostEditorPage.jsx), not in separate create and edit files. [`router.jsx`](../frontend/src/app/router.jsx) maps both routes to that component; `isNew = !postId` selects the mode. [`PostDetailsPage.jsx`](../frontend/src/features/posts/pages/PostDetailsPage.jsx) is separate. Shared post styling lives in [`post-workflow.css`](../frontend/src/styles/post-workflow.css), and the design illustrations used by the frontend live under [`public/images/posts/`](../frontend/public/images/posts/). See the [frontend implementation notes](../frontend/README.md#post-create-and-post-edit-implementation) for the file map.

Post operations currently use a mock adapter and this browser's `localStorage`: data is not shared between users or devices, and visibility is not enforced by a server. Existing drafts auto-save; a new post is saved through its action buttons. Scheduled items remain drafts until the post collection is next read after the chosen time, rather than being published by a background service. Server authorization, audience enforcement, persistent storage, and real scheduled publishing remain integration work.

### Settings (tabbed page)

The **179MMS-6 design revision (2026-11-03)** is proposed, not yet implemented. Read each updated PNG with its UX and the [Settings handoff](Settings/Settings_Handoff.md). The [editable local HTML](Settings/Settings_Prototype.html) replaces the old PNG-only source for these three tabs. It uses synthetic, in-memory fixtures and is not application code.

Use `/settings?tab=general|notifications|security`, defaulting invalid/missing tab values to General. Show Settings without its subtitle and remove small descriptions beneath section/preference titles. Keep actual profile data, labels, field validation, time examples and functional availability/save feedback. Retain the shared burgundy shell; Account reads the canonical authenticated profile and View profile uses its ID. User menu is closed by default.

| Tab | Controls and requirements |
| --- | --- |
| General | Group Club name/language and Time zone/Compact navigation. Stage a draft, save only changed keys, then update shared brand, shell and date/locale consumers. English currently available; unsupported translation options stay unavailable until their consumers exist. |
| Notifications | Assistant notifications and Weekly activity summary retain saved choices but show Unavailable while delivery capabilities are absent. Enable each only with a real shared consumer; manual chat remains available when reminders are off. |
| Security | Show account service unavailable, disabled Change password/Set up/Manage sessions and Not connected enrollment. Remove fake session metadata and the security Save footer. Future authenticated actions use existing destinations and real server status. |

The shared saved settings source must notify shell/formatting consumers in this window and other open tabs. Dirty values never apply before persistence. Failed saves retain the draft and effective values. Confirm discard when leaving; another tab's update preserves a dirty draft with a conflict/reload state. The handoff maps ownership, consumers, capability limits, date-only values and naive club-time data explicitly.

Below 1024 px move Account under the form; below 768 px use the shared drawer/single-column fields and wrap preference actions. Keep tabs internally scrollable, a normal-flow footer, native selects, visible focus and 44 px targets. Panel/underline/switch/control/saved-shell animations are short and disabled under reduced motion. [Responsive](Settings/Settings_Responsive.png) and [interaction-state](Settings/Settings_States.png) boards are part of the review.

From repo root after frontend dependencies are installed: `node tests/frontend/settings-design-review.mjs` checks the prototype, and `node designs/Settings/render-settings.mjs` re-exports the images. Windows uses installed Edge. These commands do not verify product implementation, notification delivery or backend security.

### Help Center and 179 Assist

`HelpPage` includes a help-article search input, three quick-guide cards (create a post, find a member, manage an account), a popular-article list, and a `Contact support` call to action. Cards and articles navigate to their destination or article detail; search states need loading, no-result, and error presentations.

The circular assistant trigger is present in the authenticated shell. It expands to the `AssistantPanel` reference: a header with availability message and close button, a conversation area, suggested question, and labelled text input with submit button. Opening the panel must move focus into it; closing returns focus to the launcher. Messages need their own loading/error state and must be announced accessibly.

## Minimal design system

The designs indicate a light system with thin borders and very pale pink cards, contrasted with a burgundy sidebar and red/orange/green accent colors. Before building individual pages, define CSS tokens so every component uses the same values:

```css
/* Example token names — fine-tune with DevTools or the source Figma file when available */
:root {
  --color-surface: #ffffff;
  --color-surface-subtle: #fff1f3;
  --color-sidebar: #7d2939;
  --color-primary: #db1e38;
  --color-text: #1f2430;
  --color-text-muted: #647087;
  --color-border: #e4e8ef;
  --shadow-card: 0 8px 18px rgb(31 36 48 / 0.10);
  --radius-sm: 8px;
  --radius-md: 12px;
}
```

Add spacing, font-size, font-weight, and breakpoint tokens as well. Do not scatter colors, shadows, or magic numbers throughout features. The images are desktop references, so responsive behavior should be confirmed in review: use a collapsed/drawer sidebar on mobile, make grids single-column, and allow header actions to wrap.

## Current frontend structure

The tree below reflects the current source and assets. Generated `node_modules/` and `dist/` directories are omitted. The full tree is also maintained in [frontend/README.md](../frontend/README.md#directory-structure).

```text
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
```

The frontend uses feature-based folders under `src/features/`; shared layout and UI code lives in `src/components/`. `src/App.jsx` is a compatibility re-export, while `src/main.jsx` imports `src/app/App.jsx` directly.

## Data and behavior boundaries

- A page coordinates data, loading/error states, and layout; cards, forms, and charts handle rendering and callbacks. UI components must not call `fetch` directly.
- Feature API modules currently provide mock adapters; there is no shared `lib/httpClient.js` in the current frontend. Define a shared HTTP layer and server contracts when connecting the backend.
- Mock data lives in `mocks/` and is consumed through feature adapters or directly by the features that currently have no adapter. Replace the mock paths with server-backed data as the relevant APIs become available.
- Tab values are validated by a page-level parser. Invalid or missing values canonicalize to `all` for Posts and `general` for Settings without creating a duplicate history entry. Browser Back/Forward restores the appropriate tab and its data request.
- Do not mix post, settings, help, and assistant data in a global page store. Each feature owns its loading/error/cache state; `authStore` remains limited to identity/session data and shared user-menu data.
- Production settings, post publication/editing, password and session management, and support require server-authorized feature APIs. The current mock workflows do not provide server-side authorization or shared persistence.
- The auth guard redirects unauthenticated users to `/sign-in`; `authStore` retains the current user and session. Confirm the admin permission model with the backend before restricting “Add member” or administration routes.
- Keep labels/content in constants or data models instead of duplicating strings across components; this also keeps the door open for i18n if needed.

## Current implementation and remaining integration

The shell, demo sign-in, Dashboard, post list and workflow, Settings, Employees and member profiles, Organization, Help, and Assistant have frontend implementations. Several supporting routes, including password and session management and help articles, remain placeholders. The following work is still needed:

1. Replace demo authentication and browser-only storage with server-authorized accounts, APIs, and persistence.
2. Connect post visibility, activity metrics, uploads, and scheduled publishing to backend services; keep Create and Edit aligned when changing their shared component.
3. Complete placeholder flows when their designs and service contracts are available, and connect member, settings, help, support, and assistant APIs.
4. Validate responsive layouts, accessibility, interaction behavior, and visual consistency against the references across desktop and mobile.

## Asset conventions and documentation updates

- Keep the image and UX description for each screen or state together in its feature folder, using matching base names. Existing exports retain their current names; use English, lowercase kebab-case for new assets where practical. Use SVG for icons and vectors, and optimized PNG/WebP for raster assets.
- Do not store credentials, real member data, or unlicensed assets.
- When a design changes, update its image and UX description together, and record its Figma/source link, export date, and any route/component impact here when available. For a tabbed page, record every tab state and whether it changes the shared component/API contract. Also update `frontend/README.md` when the architecture, dependency set, routes, or data flow changes.
