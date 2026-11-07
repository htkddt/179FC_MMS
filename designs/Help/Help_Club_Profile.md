# Help Article — How to update your club profile

Read with `Help_Club_Profile.png` and `../Settings/Settings_General.md`.

## Route and purpose

- Route: `/help/articles/club-profile`.
- Explain the existing Settings → General journey for reviewing and saving club-profile preferences without presenting browser-local persistence as a shared server update.
- Reuse the exact guest-capable shared shell from `Help.png`, including sidebar/logo/nav/icon set, TopBar position, guest Sign up/Log in actions (or the avatar menu after mock sign-in), page gutter, and 179 Assist launcher. Only the content region changes.
- The compact shared **Help Center** TopBar is the route `h1`; the article title is a content `h2`. Breadcrumb is 13 px, category/TOC label 12–13 px, article `h2` 22–24 px, step/TOC headings 16–17 px, and body/callout/related rows 14 px.

## Article structure

- Use the common article template from `Help.md`: burgundy Help Center breadcrumb; simple white header with an ordinary uppercase-gray category label; narrow **On this page** card; numbered step card with the callout inside after the last divider; full-width two-row related card; burgundy Back.
- The TOC anchors exactly match the steps: **Open Settings** (`#open-settings`), **Update club details** (`#update-club-details`), and **Save your changes** (`#save-your-changes`). Use direct, scannable copy that corresponds to the Settings General UI rather than duplicating its form. The shown first target has `aria-current="location"`, a pale-pink row background, and the common burgundy leading indicator.
- Display this honest boundary callout: **Settings are browser-local in this demo and are not shared with a server.**
- Related links lead to invite members and member roles; their entire row/card is interactive and exposes a visible focus treatment.

## States and accessibility

- Loading keeps the header and document outline stable. Error/unknown-article state retains Help Center recovery and does not replace the whole guest-capable shell.
- The shared TopBar supplies the one semantic `h1`; the article title is `h2`. Use ordered instructions, an announced information callout, descriptive navigation labels, and 44 px targets for each navigational action.
- Keep the desktop reading width comfortable; stack the article navigation, steps, boundary, and related content below tablet width. All optional motion honours `prefers-reduced-motion`.

## Boundary

The article does not create a club profile service or change Settings persistence. A connected implementation must use authorized backend validation and report the save result received from that service.
