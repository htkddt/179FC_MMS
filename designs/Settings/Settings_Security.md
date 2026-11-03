# Settings — Security UX

Read with [Settings_Security.png](Settings_Security.png), [Settings_Change_Password.md](Settings_Change_Password.md), [Settings_Two_Factor.md](Settings_Two_Factor.md), and [Settings_Sessions.md](Settings_Sessions.md).

## Security tab

- Route: `/settings?tab=security`. Keep the shared Settings heading, tabs, Account card, and no subtitle or descriptive copy beneath row titles.
- Password, Two-factor authentication, and Active sessions have enabled buttons. They open their UI-only destinations instead of appearing permanently disabled.
- The visible notice makes the boundary explicit: no local preference write changes a password, enrollment, session list, or revoke action. Two-factor remains `Not set up` until a server verifies enrollment.
- The Security tab has no Settings Save footer. Sensitive actions are individual transactions and never report a local success.

## Destinations

| Row | Destination | UI-only behavior |
| --- | --- | --- |
| Change password | `/settings/password` | Opens validation and service-boundary UI; no password is stored in browser settings. |
| Two-factor authentication | `/settings/two-factor` | Opens method selection and an explicit unconnected outcome. |
| Active sessions | `/settings/sessions` | Opens loading, empty, and error/retry UI without inventing a device or location. |

Buttons, links, notices, and any dialog must work by pointer and keyboard, show focus, restore focus on Back/Cancel, and stack at narrow widths. Use the common page transition and reduced-motion rule in `Settings_General.md`.

## Source

Exported locally with synthetic identity on 2026-11-03. The reference specifies frontend UI only; authentication, fresh verification, session authority, and notification delivery need a backend integration.
