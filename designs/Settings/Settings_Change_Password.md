# Settings — Change Password UX

Read with [Settings_Change_Password.png](Settings_Change_Password.png) and [Settings_Security.md](Settings_Security.md).

## Route and layout

- Route: `/settings/password`. Use the shared TopBar title scale with no subtitle, a visible **Back to Security** link, form card, and small boundary panel.
- Fields are Current password, New password, and Confirm new password. Buttons are Cancel and Continue; each is keyboard reachable and at least 44 px high.

## UI-only workflow

1. Validate required fields, a 12-character minimum, and matching confirmation. Announce an error and focus the first invalid field.
2. Continue can show a short in-progress state while checking the UI boundary, but it must end in a service-unavailable/error state until the server is connected. It must never show “password changed”.
3. Do not persist, log, prefill, or expose password values through Settings/local storage. Cancel/Back clears local form fields and restores focus to its Security trigger.
4. A connected implementation must require fresh authentication and obey the server-returned session policy.

At mobile width, fields remain one column and Cancel/Continue stack. Respect reduced motion and the common route transition described in `Settings_General.md`.
