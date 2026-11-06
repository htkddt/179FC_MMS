# Help Article — How to update your club profile

Read with `Help_Club_Profile.png` and `../Settings/Settings_General.md`.

## Route and purpose

- Route: `/help/articles/club-profile`.
- Explain the existing Settings → General journey for reviewing and saving club-profile preferences without presenting browser-local persistence as a shared server update.
- Reuse the compact **Help Center** TopBar, breadcrumb **Help Center / Club settings**, article category, in-page navigation, related articles, and Back pattern from the Help article family.

## Article structure

- Guide the reader through **Open Settings**, **Update club details**, and **Save your changes**. Use direct, scannable copy that corresponds to the Settings General UI rather than duplicating its form.
- The in-page navigation is visible on desktop and moves above the body on narrow screens. It reflects section position and is keyboard reachable.
- Display this honest boundary callout: **Settings are browser-local in this demo and are not shared with a server.**
- Related links lead to invite members and member roles; their entire row/card is interactive and exposes a visible focus treatment.

## States and accessibility

- Loading keeps the header and document outline stable. Error/unknown-article state retains Help Center recovery and does not replace the whole authenticated shell.
- Use one semantic `h1`, ordered instructions, an announced information callout, descriptive navigation labels, and 44 px targets for each navigational action.
- Keep the desktop reading width comfortable; stack the article navigation, steps, boundary, and related content below tablet width. All optional motion honours `prefers-reduced-motion`.

## Boundary

The article does not create a club profile service or change Settings persistence. A connected implementation must use authorized backend validation and report the save result received from that service.
