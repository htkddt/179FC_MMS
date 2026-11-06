# Help Article — Understanding member roles

Read with `Help_Member_Roles.png`, `../Organization/Organization.md`, and the Employees/profile references.

## Route and purpose

- Route: `/help/articles/member-roles`.
- Help readers understand where a displayed member role and team context appear, and make clear that role/permission changes require an authorized process.
- Reuse the common Help article composition: compact **Help Center** TopBar, breadcrumb **Help Center / Organization**, category label, table of contents, related articles, and a Back link.

## Article structure

- Steps are **Review the member role**, **Check the team context**, and **Request a role change**. They reference the member profile and Organization workspace but do not invent an editable role control.
- The boundary callout reads: **Permissions are not connected to a server-authorized role service in this demo.**
- Related articles link to invite members and club profile. The article title, step headings, body, and callout preserve the reduced Help type scale and clear reading rhythm.

## States and accessibility

- Preserve breadcrumb/title layout while loading. Missing/unknown article content offers a short status and an accessible Back to Help Center route.
- Use semantic headings and an ordered instructional sequence. Table-of-contents and related links have visible focus, descriptive labels, and 44 px minimum targets.
- On narrow viewports, stack navigation before the article body and retain the safe readable line length. Optional arrivals are removed under `prefers-reduced-motion`.

## Boundary

Displayed roles are not a permission system. Future role changes must be authorized and persisted by backend contracts; the UI must not indicate that a permission was changed until that service confirms it.
