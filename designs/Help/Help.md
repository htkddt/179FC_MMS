# Help Center — UX Description

## Scope

This revision is the approved visual reference for the authenticated `/help` page in 179MMS-9. It removes the explanatory line under the page title and aligns the Help heading with the shared page-header scale used by Dashboard, Posts, Employees, Organization, and Settings.

Reference asset: `Help.png` (desktop, 1587 × 991). The reference was revised locally for 179MMS-9 on 2026-11-06; no editable Figma source or Figma export date was supplied.

## Layout and visual hierarchy

- Reuse the authenticated shell without a Help-specific header treatment: the shared top-bar title is **Help Center**. It uses the existing shared `top-bar h1` typography, alignment, and responsive sizing. Do not add a Help-only oversized hero title.
- There is no subtitle, supporting sentence, or blank replacement below **Help Center**. In the current frontend metadata this means Help must not supply `subtitle` to the shared `TopBar`.
- Keep the search field as the first content control, directly below the compact title with the same content gutter as the page grid. At desktop it is wide but capped rather than spanning the full content canvas.
- Preserve the existing content order: search; **Quick guides**; **Popular articles** beside **Still need help?**; persistent 179 Assist launcher.
- Maintain the portal’s burgundy sidebar, near-black headings, white surfaces, fine cool-gray borders, blush guide icons/action buttons, and burgundy support panel. Contrast must remain readable for text, focus indicators, and icon-only actions.

## User goal and interaction model

Help people resolve common questions independently and provide a clear human-support escalation when self-service is insufficient.

- Global search filters guides and articles by task or keyword. The visible result must retain a clear article or destination affordance.
- Quick guides take the user to the existing target flows: Create a post, Find a member, and Manage your account.
- Popular article rows are complete clickable rows with a visible trailing arrow and keyboard focus state; do not make only the icon actionable.
- **Contact support** preserves the `/help/support` destination already used by the page. If support context becomes available later, it may prefill a concise issue description; no successful support submission is implied by this reference.

## States

### Loading

- Keep the title and search field stable.
- Replace content cards/rows with matching skeleton blocks; do not shift the shell or title while data arrives.
- Search is disabled only while the page cannot evaluate a query; announce loading through a concise status message for assistive technology.

### Filtered empty state

- When no guide or article matches, retain the search field and show a polite status below the content area: **No help articles match your search. Try another keyword or contact support.**
- Keep **Contact support** available as the recovery action.

### Error

- Retain the heading and search field. Replace unavailable content with a concise error message and an explicit **Retry** control.
- Retry receives focus after activation only when the request remains unsuccessful; on success, focus stays predictable and does not jump away from the search field.

## Responsive behavior

- Desktop (reference): three equal quick-guide cards and a two-column lower section, with Popular articles wider than the support card.
- Medium widths: retain the shared shell; use two guide columns and stack the lower section when it no longer has room.
- Narrow widths: use the existing accessible sidebar drawer; stack every guide card and lower panel to one column. Search stays full available width, and the 179 Assist launcher never obscures the primary support action.
- Preserve 44 px minimum target size for search controls, guide actions, article rows, Contact support, menu toggle, and assistant launcher.

## Motion and accessibility handoff

- Match the portal page-entry convention: a short 350 ms opacity/8–10 px upward reveal after navigation, with no layout movement after the first frame.
- Reveal Quick guide cards in DOM order with a restrained 40–50 ms stagger; the lower panels may follow after the guide group. Do not animate search text or content while typing/filtering.
- On hover-capable devices, guide cards and article rows may lift 2–3 px and show the existing subtle shadow/arrow feedback. Pressed feedback is brief and never the only state signal.
- Honour `prefers-reduced-motion: reduce`: remove entry, stagger, hover-transform, and page-transition movement while preserving all controls and focus treatment.
- Use visible `:focus-visible` outlines with sufficient contrast. Search has a programmatic label; icon-only guide actions and the assistant launcher must retain accessible names.

## Implementation boundary

This is a design handoff only. `Help.png` and this file describe the desired frontend presentation; the current help data is browser-local mock content, not a support backend. Developer should reuse the shared `TopBar`, card, route, and motion patterns rather than duplicating shell styles.
