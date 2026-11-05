# Settings — Two-Factor Authentication UX

Read with [Settings_Two_Factor.png](Settings_Two_Factor.png), [Settings_Security.md](Settings_Security.md), and [Settings_States.md](Settings_States.md).

## Route and setup UI

- Route: `/settings/two-factor`; Back returns to Security with focus restored to **Set up**.
- Show the verified-status placeholder `Not set up`, method choices for Authenticator app and Security key, Cancel, and Start setup. Use native radio controls, labelled groups, and an explicit focus order.
- Selecting a method is locally interactive, but Start setup cannot claim enrollment. While the service is missing, present the visible unconnected/error state shown in the states board; do not render a fake QR code, recovery code, or enabled status.

## Connected-flow contract

The later service must require fresh authentication, create a server challenge, verify the factor, and expose recovery codes only after confirmation. If enrollment already exists, this same destination becomes its management UI: show the server-confirmed factor and require a separate authenticated confirmation before disabling it. Cancel, loading, verification error, and session-expiry outcomes preserve the last verified status.

At constrained widths, method cards and footer actions stack. Optional page/control motion follows `Settings_General.md` and is disabled for reduced motion.
