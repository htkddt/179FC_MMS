# Settings — General UX

Read with [Settings_General.png](Settings_General.png), [responsive references](Settings_Responsive.md), and [interaction states](Settings_States.md). This is the approved UI direction for 179MMS-6; the application implementation follows in a later phase.

## Layout and title

- Route: `/settings?tab=general`. Keep the Settings TopBar subtitle absent.
- The Settings title uses the same shared TopBar `h1` scale as Dashboard, Posts, Employees, and Organization at desktop, mobile, and enlarged text. Do not apply a Settings-only font-size override.
- Keep the existing shell, tabs, Account card, field labels, native selects, and visible save feedback. Do not add descriptive copy beneath section or preference headings.

## Editable controls

- Club name, Workspace language, Time zone, and Compact navigation are a single page-owned draft. Save only changed values through the shared settings adapter; consumers change only after a successful write.
- English and Vietnamese are selectable UI preferences. Persist the selection with the same saved snapshot; an incomplete product translation must visibly retain its safe fallback rather than imply every portal page is already translated.
- Retain the 80-character, trimmed Club name validation; use `Asia/Ho_Chi_Minh` and `UTC` for time zone. Time zone changes formatting, never stored event instants or date-only values.
- Preserve dirty/discard, conflict, retry, navigation guard, Back/Forward, and canonical Account behavior from the existing Settings flow.

## Motion, responsive, and accessibility

- Route entry follows the common portal page-transition pattern: opacity plus `translateY(9px)` for 350 ms `ease-out`, disabled under `prefers-reduced-motion`. It is separate from tab-panel and control feedback.
- A tab panel may enter for 180 ms and switches may move for 160 ms; focus, save status, and security/delivery outcomes appear immediately. Do not let a Settings rule animate the shared sidebar, main shell, or assistant panel.
- At 1024 px retain two columns; below it place Account after the form. At 320–390 px stack fields/footer actions and allow tabs to scroll without page overflow. Controls have 44 px targets and visible keyboard focus.

## Source and boundary

Exported from a local browser mock with a synthetic account on 2026-11-03. No Figma source was supplied and no Figma edit is claimed. The Settings package retains PNG UI references and Markdown UX only.
