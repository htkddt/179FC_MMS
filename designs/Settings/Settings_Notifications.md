# Settings — Notifications UX

Read with [Settings_Notifications.png](Settings_Notifications.png), [responsive references](Settings_Responsive.md), and [interaction states](Settings_States.md). This is UI design; notification delivery is not implemented by the design itself.

## Interaction

- Route: `/settings?tab=notifications`. Assistant notifications and Weekly activity summary use enabled, keyboard-operable `role="switch"` controls with clear On/Off labels and 44 px targets.
- Both switches are part of the same saved Settings draft as General. A click stages `assistant` or `summary`; Save persists through the shared settings adapter, Discard resets the draft, and failures retain it. Do not create per-tab state or make switches cosmetic.
- A visible capability notice says delivery is not connected. Saving a preference is allowed, but it must never show that a reminder, weekly report, push, or email was actually sent.
- Assistant notifications governs future proactive reminders only. It never hides the manual 179 Assist launcher or existing messages. Weekly summary must eventually use the canonical member/post/activity sources and saved time zone.

## States and accessibility

- Keep dirty, saving, failed write, conflict/reload, and saved states from General. Associate the delivery boundary with both switches without disabling their interaction.
- Tab keyboard behavior is Left/Right/Home/End with a roving tab stop. At narrow widths, retain the title and state next to each switch before wrapping the control.
- Use the common route transition from `Settings_General.md`; switch feedback is 160 ms only when motion is permitted.

## Boundary and source

The mock has no reminder dispatcher, email/push provider, or delivery audit. The UI is exported locally on 2026-11-03 with synthetic data and does not claim those services exist.
