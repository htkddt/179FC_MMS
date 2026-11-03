# Settings — Responsive UX

Read with [Settings_Responsive.png](Settings_Responsive.png). The board shows General, Security, and Change password at a 390 px reference width.

- The shared Settings title uses the normal TopBar responsive scale: no Settings-only size override at desktop, mobile, or enlarged text.
- At 1024 px the Settings form and Account card use two columns; below 1024 px Account follows the primary panel. At 768 px and below, use the existing drawer, one-column fields, and scrollable tab row.
- At 320–390 px, footer actions stack, labels stay visible, buttons/switch targets remain at least 44 px, and no page-level horizontal overflow is introduced.
- Subpages preserve Back, primary action, Cancel/Retry, keyboard focus, and a one-column layout. No security/delivery UI claims a completed remote action solely because it fits on mobile.

The reference was rendered from a local mock with synthetic data on 2026-11-03.
