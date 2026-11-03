# Settings — Notifications UX Description

Design revision: **179MMS-6, 2026-11-03**. Read with [Notifications PNG](Settings_Notifications.png), [responsive references](Settings_Responsive.png), [interaction states](Settings_States.png), and the [handoff](Settings_Handoff.md). Proposed UI; delivery services are not implemented.

## User goal

Understand which notifications can be delivered and control available channels consistently.

## Layout

- Route `/settings?tab=notifications`; keep the single Settings heading, shared tabs and canonical Account card.
- Use icon rows for Assistant notifications and Weekly activity summary, aligned state/control areas and the common footer. Remove descriptive sentences beneath row titles.
- Show a separate functional notice for unavailable delivery rather than presenting a cosmetic preference as a working service.

## Availability and connected data

- Current code has a mock chat reply adapter but no proactive reminder channel, weekly dispatcher or email provider. The default design shows Unavailable, disabled switches and Notifications are not available yet. Your saved preferences will be kept. Save is disabled with No changes to save.
- A disabled switch retains the persisted checked value; availability and saved choice are different. Do not erase old preferences or claim delivery is active.
- Enable each switch independently only with an actual shared consumer/delivery capability. Then it uses On/Off, stages the draft, and commits on successful Save. This is a future interaction contract, not a claim that delivery currently works.
- Assistant notifications controls proactive reminders only. Off must not hide the launcher, disable manual chat, delete messages or suppress essential security notices.
- Weekly summary is a delivery preference. When connected, generation reads the same canonical member/post/activity sources as Dashboard/Posts. Recipient verification, channel, cadence and timezone policy remain backend work. Do not fabricate a local emailed report or a separate Dashboard data copy.
- If only one capability is available, disable only the unavailable switch, explain its availability and allow Save for the other. Error/availability changes must not reset choices.

## Interaction and accessibility

- Reuse General's draft/save/error/discard/navigation/concurrency behavior; patch only supported `assistant` and `summary` keys. Failed save preserves choices and effective delivery state.
- Switches have a programmatic name, `role="switch"`, `aria-checked`, Space/Enter support and a 44 px target. Associate disabled controls with the visible service notice; do not rely on hover explanations.
- On narrow screens wrap the state/control together beneath the title, place Account below the form and keep the footer in normal flow.
- Switch transitions use 160 ms, panel entry 180 ms, hover/focus 140 ms, with optional motion disabled for reduced motion.

## Source and export

Design artifacts are PNG references and Markdown UX only, per the owner's request on **2026-11-03**. The images were exported from a local browser rendering on that date using synthetic account data; authoring/export scripts are not retained. Historical Figma source/export date were unknown; no Figma edits are claimed. Review this UX with the PNG and use the implemented React page for interactions.
