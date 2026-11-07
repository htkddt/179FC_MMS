# Help Center — UX Description

## Scope

`Help.png` is the revised desktop reference for authenticated `/help` in 179MMS-9. It now normalizes the full Help text hierarchy and introduces the companion article and Support references in this folder. The PNG was revised locally on 2026-11-06; no Figma source or export date was supplied.

## Typography and hierarchy

- Reuse the shared `TopBar` title treatment for **Help Center** with no subtitle or Help-only hero styling. The title is visually aligned with Dashboard, Posts, Employees, Organization, and Settings.
- At the desktop reference scale, use approximately 28–30 px for the shared page title, 20–22 px for section headings, 17–18 px for guide titles, and 14–15 px for body copy, article rows, and search text. The responsive implementation may use shared tokens/clamps but must preserve this hierarchy.
- Keep search as the first content control; it is wide, capped, labelled, and separated from the compact title by stable whitespace.
- Quick-guide cards, article rows, and the support card use the existing white-surface/card pattern with burgundy accents, cool-gray dividers, and readable near-black text. Do not introduce a new Help-specific visual system.

## Shared nested-route contract

- `Help.png`, all article references, and `Help_Support.png` reuse one identical authenticated shell: the existing sidebar width, 179FC logo, navigation/icon set, active Help item, TopBar alignment, TK avatar trigger, page gutter, and 179 Assist launcher. Nested routes change only the content region.
- The nested article routes use one layout template: burgundy **Help Center** breadcrumb; simple white article header card with an ordinary uppercase-gray category label (never a pill); narrow **On this page** card; numbered step card with its boundary callout inside it after the last divider; full-width two-row **Related articles** card; and burgundy **Back to Help Center**. Category text, article title, steps, callout copy, and related routes are the only content variants.
- Heading ownership is explicit. On `/help` and `/help/articles/*`, the shared TopBar **Help Center** is the sole page `h1`; an article title is a content `h2`. On `/help/support`, the shared TopBar **Contact support** is the sole `h1`; content starts with the `h2` **Tell us how we can help**, never a second `Contact support` heading.
- Every desktop article reference shows the first TOC target as the current location: a pale-pink row background and burgundy leading indicator. This common active state is used for `Open Employees`, `Open Settings`, and `Review the member role`.
- Nested-route scale: breadcrumb 13 px; category/TOC label 12–13 px; content `h2` 22–24 px; TOC and step headings 16–17 px; body, related rows, form labels, and callouts 14 px. Related/article content must not exceed the scale of the Help overview.
- A TOC item’s text exactly matches its target step heading. Selecting it moves to the matching anchor (for example `#open-employees`); the current target has `aria-current="location"` plus the burgundy active indicator.

## Self-service and escalation

The primary Help journey is search → quick guide or popular article. **Need more help?** remains necessary as an escalation when a search/article cannot resolve an account, permission, or operational question, but it is intentionally secondary:

- It is a quiet white outlined card, not the previous oversized burgundy feature panel.
- Its short copy sets the expectation that an article should be tried first; **Contact support** is the single secondary action.
- `/help/support` is designed in `Help_Support.png` and `Help_Support.md`. The current product has no support backend, so this route must not claim a request was sent.

## Content, states, and navigation

- Search filters the three quick guides and article records by task/keyword. Guide and article targets remain unambiguous and whole rows/actions are keyboard accessible.
- Popular articles route to `/help/articles/invite-members`, `/help/articles/club-profile`, and `/help/articles/member-roles`. Their references are `Help_Invite_Members.*`, `Help_Club_Profile.*`, and `Help_Member_Roles.*`.
- Loading keeps the title/search stable and uses card/row skeletons without layout shift. Search is disabled only while filtering cannot be evaluated, with a concise assistive status.
- Empty results preserve search and the support recovery route, with: **No help articles match your search. Try another keyword or contact support.**
- Error preserves the title/search and provides an explicit **Retry** action. Focus stays predictable: on an unsuccessful retry it returns to Retry; after a successful retry it returns to the enabled search field.

## Responsive, motion, and accessibility

- Desktop uses three quick-guide cards and a lower two-column section. At medium width, guides use two columns and the lower section stacks; at narrow width, the existing sidebar drawer and one-column content layout apply.
- Interactive targets are at least 44 px. Visible `:focus-visible` treatment is required for search, guide actions, article rows, support action, menu toggle, and assistant launcher.
- Use the portal’s 350 ms opacity/8–10 px page arrival; quick guides may enter in DOM order with a 40–50 ms stagger. Query edits must not replay entrance motion.
- `prefers-reduced-motion: reduce` removes page, card, hover-transform, and skeleton movement without removing focus or controls.

## Implementation boundary

These PNG and Markdown files are design references only. Help articles, invitation delivery, server-authorized roles, and support messaging require future frontend/backend work; browser-local demo state must be labelled honestly.
