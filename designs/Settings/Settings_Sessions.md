# Settings — Active Sessions UX

Read with [Settings_Sessions.png](Settings_Sessions.png), [Settings_Security.md](Settings_Security.md), and [Settings_States.md](Settings_States.md).

## Route and states

- Route: `/settings/sessions`; Back returns to Security and restores focus to **Manage sessions**.
- Initial loading reserves rows with skeletons and `aria-busy`. A successful connected list distinguishes the current session from other sessions using server-authoritative information only.
- The UI-only preview shows a clear load/unavailable state with Back and Retry, rather than fabricated browser, device, time, or location data. Empty and retry-error states keep the page scaffold and explain the next action.

## Actions and security boundary

- A future session row includes a keyboard-operable **Revoke** action and confirmation naming the selected session. Lock duplicates, keep the list after a failed request, and refresh authoritative results after success.
- Revoking the current session uses the shared sign-out path. No mock/local Settings value may remove sessions or report a revoke success.
- At mobile width, row metadata/actions stack without hiding the current-session indicator. Respect visible focus, reduced motion, and the shared route transition.
