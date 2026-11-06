# Help Article — How to invite new members

Read with `Help_Invite_Members.png`.

## Route and purpose

- Route: `/help/articles/invite-members`.
- Help an administrator prepare for an invitation from the Employees workflow without representing an email/invitation as already delivered.
- Keep the shared compact **Help Center** TopBar, breadcrumb **Help Center / Member management**, article category, and an explicit **Back to Help Center** link.

## Article structure

- The desktop reference uses a narrow **In this article** list alongside the readable article body. The selected item is clear by text and a burgundy leading indicator, not color alone.
- Present three easy-to-scan steps: **Open Employees**, **Prepare member details**, and **Review the invitation**. Each step is numbered, has a concise action-focused heading, and links only to a real or clearly proposed destination.
- Related articles link to club profile and member roles. Each is a complete keyboard target with a visible destination affordance.
- The boundary callout reads: **Invitation delivery is not connected in this demo.** It is warning/information, not an error or a promise of an email.

## States and accessibility

- While article content is loading, retain breadcrumb/header geometry and display text-line and step skeletons. An unavailable or unknown article provides a concise message, Retry when applicable, and a Back to Help Center recovery action.
- The article has a semantic `h1`, ordered steps, and a navigable table of contents. Focus target, heading, callout, related links, and Back remain usable with keyboard and at 44 px minimum target sizing.
- On smaller widths, the article navigation precedes the body and every section becomes one column. Optional page/section motion follows the Help reduced-motion rule.

## Boundary

Member data and invitation delivery are not implemented server operations. A future flow must authorize the sender, validate recipient data, and only show a sent/delivered outcome from a server response.
