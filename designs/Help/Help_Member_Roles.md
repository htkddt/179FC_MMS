# Help Article — Understanding member roles

Read with `Help_Member_Roles.png`, `../Organization/Organization.md`, and the Employees/profile references.

## Route and purpose

- Route: `/help/articles/member-roles`.
- Help readers understand where a displayed member role and team context appear, and make clear that role/permission changes require an authorized process.
- Reuse the exact guest-capable shared shell from `Help.png`, including sidebar/logo/nav/icon set, TopBar position, guest Sign up/Log in actions (or the avatar menu after mock sign-in), page gutter, and 179 Assist launcher. Only the content region changes.
- The compact shared **Help Center** TopBar is the route `h1`; the article title is a content `h2`. Breadcrumb is 13 px, category/TOC label 12–13 px, article `h2` 22–24 px, step/TOC headings 16–17 px, and body/callout/related rows 14 px.

## Article structure

- Use the common article template from `Help.md`: burgundy Help Center breadcrumb; simple white header with an ordinary uppercase-gray category label; narrow **On this page** card; numbered step card with the callout inside after the last divider; full-width two-row related card; burgundy Back.
- The TOC anchors exactly match the steps: **Review the member role** (`#review-member-role`), **Check the team context** (`#check-team-context`), and **Request a role change** (`#request-role-change`). They reference the member profile and Organization workspace but do not invent an editable role control. The shown first target has `aria-current="location"`, a pale-pink row background, and the common burgundy leading indicator.
- The boundary callout reads: **Permissions are not connected to a server-authorized role service in this demo.**
- Related articles link to invite members and club profile. The article title, step headings, body, and callout preserve the reduced Help type scale and clear reading rhythm.

## States and accessibility

- Preserve breadcrumb/title layout while loading. Missing/unknown article content offers a short status and an accessible Back to Help Center route.
- The shared TopBar supplies the one semantic `h1`; the article title is `h2`. Use an ordered instructional sequence. Table-of-contents and related links have visible focus, descriptive labels, and 44 px minimum targets.
- On narrow viewports, stack navigation before the article body and retain the safe readable line length. Optional arrivals are removed under `prefers-reduced-motion`.

## Boundary

Displayed roles are not a permission system. Future role changes must be authorized and persisted by backend contracts; the UI must not indicate that a permission was changed until that service confirms it.
