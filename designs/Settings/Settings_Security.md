# Settings — Security UX Description

Design revision: **179MMS-6, 2026-11-03**. Read with [Security PNG](Settings_Security.png), [responsive references](Settings_Responsive.png), [interaction states](Settings_States.png), and the [handoff](Settings_Handoff.md). Proposed UI; real security services are not implemented.

## User goal

See accurate security capabilities and access verified account-security flows when available.

## Layout and current capability

- Route `/settings?tab=security`; one Settings heading without subtitle, shared tabs, Security card and canonical Account card.
- Keep Password, Two-factor authentication and Active sessions icon rows. Remove the small descriptions beneath titles and the fabricated browser/location string.
- Show a separate functional notice: Account security is not connected in this preview. These actions are unavailable.
- Disable Change password, Set up and Manage sessions until real account APIs exist. Two-factor status is Not connected, never an unverified On/Off switch. Legacy local `twoFactor: true` cannot establish enrollment.
- Omit Save changes: password, enrollment and revocation are separate authenticated transactions. Never show security success after a `localStorage` write.

## Future connected flows — contracts only

These define integration with existing destinations when backend work is authorized; they do not expand this design ticket into authentication implementation.

| Action | Required behavior |
| --- | --- |
| Change password | `/settings/password`, real account ID, fresh authentication, server validation and returned session policy; no password storage in browser preferences. |
| Set up two-factor | Fresh authentication, enrollment challenge, valid-factor confirmation and recovery-code handling before showing server-confirmed enrollment. Cancel/error preserves verified state; disabling an enrolled factor needs a separate authenticated confirmation. |
| Manage sessions | `/settings/sessions`, actual server sessions, explicit current-session identification, empty/error/retry states. Do not infer location from display time zone or a mock user agent. |
| Revoke session | Identify session in confirmation, lock duplicate requests, refresh authoritative list on success, preserve list on failure. Revoking the current session signs out through shared auth. |

## Shared data, accessibility and motion

- Account identity matches General/Notifications, header/sidebar and canonical profile. Enrollment and sessions come from auth/security services, not member fields or settings storage.
- Keep dirty-navigation protection for staged preferences. Connected sensitive actions reuse shared session-expiration handling and fresh server authorization.
- Explain availability visibly and associate disabled actions with the notice. Narrow layouts stack actions below labels; buttons stay ≥44 px high and Account moves below Security.
- Panel entrance 180 ms; future dialogs may use short opacity transitions. Focus opens immediately, Escape cancels, and closing restores trigger focus independent of animations. Reduced motion removes optional transitions. Do not animate status before confirmation.

## Source and export

Design artifacts are PNG references and Markdown UX only, per the owner's request on **2026-11-03**. Images were exported from a local browser rendering on that date using synthetic identity; authoring/export scripts are not retained. The old reference's Figma source/export date were unknown; no Figma edits are claimed. Review the PNG together with this UX; interactive verification uses the implemented React page.
