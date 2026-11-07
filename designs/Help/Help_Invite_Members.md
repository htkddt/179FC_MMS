# Help Article — How to invite new members

Read with `Help_Invite_Members.png`.

## Route and purpose

- Route: `/help/articles/invite-members`.
- The 179MMS-10 guest/header revision of the paired PNG was created through an image-generation workflow on 2026-11-08; no Figma source URL is supplied.
- Help an administrator prepare for an invitation from the Employees workflow without representing an email/invitation as already delivered.
- Keep the exact guest-capable shared shell from `Help.png`, including sidebar/logo/nav/icon set, TopBar position, guest Sign up/Log in actions (or the avatar menu after mock sign-in), page gutter, and 179 Assist launcher. Only the content region changes.
- The compact shared **Help Center** TopBar is the route `h1`; the article title is a content `h2`. Breadcrumb is 13 px, category/TOC label 12–13 px, article `h2` 22–24 px, step/TOC headings 16–17 px, and body/callout/related rows 14 px.

## Article structure

- Use the common article template from `Help.md`: burgundy Help Center breadcrumb; simple white header with an ordinary uppercase-gray category label; narrow **On this page** card; numbered step card with the callout inside after the last divider; full-width two-row related card; burgundy Back.
- The TOC anchors exactly match the steps: **Open Employees** (`#open-employees`), **Prepare member details** (`#prepare-member-details`), and **Review the invitation** (`#review-the-invitation`). Selecting a row keeps this article layout, pushes the matching hash to browser history, smoothly scrolls to the existing step, and changes `aria-current="location"`, the pale-pink row background, and the burgundy leading indicator.
- Related articles link to club profile and member roles in complete 44 px rows with a visible destination affordance.
- The boundary callout reads: **Invitation delivery is not connected in this demo.** It is warning/information, not an error or a promise of an email.

## States and accessibility

- While article content is loading, retain breadcrumb/header geometry and display text-line and step skeletons. An unavailable or unknown article provides a concise message, Retry when applicable, and a Back to Help Center recovery action.
- The shared TopBar supplies the one semantic `h1`; the article title is `h2`, followed by ordered steps. Focus target, TOC, callout, related links, and Back remain keyboard usable with 44 px minimum target sizing.
- On smaller widths, the article navigation precedes the body and every section becomes one column. Optional page/section motion follows the Help reduced-motion rule.

## Boundary

Member data and invitation delivery are not implemented server operations. A future flow must authorize the sender, validate recipient data, and only show a sent/delivered outcome from a server response.
