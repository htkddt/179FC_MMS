# Guest Header States — 179MMS-10

Read with `Guest_Header_States.png`.

## Source and implementation status

- Asset source: image-generation workflow on 2026-11-08; no Figma file or source URL was supplied.
- Status: implemented by the React shared `AppShell`, `TopBar`, `Sidebar`, auth route guard, and `SignInPage`.
- The PNG is a desktop state reference. Exact card figures and navigation labels are illustrative; route/access behavior below is authoritative.

## Guest default state

- A fresh browser tab opens the guest Dashboard. Dashboard, Posts, Settings, Help (including article and Support routes), and 179 Assist remain accessible in the shared portal shell.
- The TopBar replaces the signed-in avatar trigger with distinct **Sign up** and **Log in** links. Both lead to `/sign-in`; registration is not implemented.
- Guest navigation may expose Employees and Organization destinations, but `/employees`, `/employees/:memberId`, and `/organization` are protected. Before their contents render, a guest is redirected to `/sign-in` with a valid internal return target.
- The guest sidebar has no account/avatar summary. The assistant remains available as the existing launcher.

## Fake sign-in and signed-in menu

- **Sign in to 179FC** is the sole mock authentication action. It stores the existing browser-tab demo session, then returns to the valid protected destination or `/dashboard`.
- Only a slash-prefixed internal return target is accepted. Protocol-relative, backslash-containing, malformed, and encoded external-like values fall back to `/dashboard`; they must not produce a browser navigation error.
- Once signed in, the TopBar restores the avatar trigger and its popup: identity, Profile, Settings, Help center, a horizontal divider, then **Log out**.
- **Log out** is a full-width, left-aligned 44 px minimum target below the divider. It clears the mock session and returns to guest Dashboard.
- Escape closes the menu and restores focus to its trigger. All header actions have a visible focus state and remain usable on narrow layouts.

## Responsive and accessibility contract

- Preserve the existing mobile drawer and top-bar wrapping behavior. Sign up and Log in stay individually reachable targets rather than becoming a menu-only action.
- Do not claim real registration, credential verification, authorization, or server persistence. The mock session is a UI demonstration only.
