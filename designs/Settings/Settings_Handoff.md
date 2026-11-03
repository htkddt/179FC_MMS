# Settings design handoff — 179MMS-6

Revision: **2026-11-03**. Phase: **DESIGN_REVIEW**, Designer → Leader. This package changes designs and guidance only. Product implementation, Tester QA, push, PR and CI remain later phases on this ticket.

## Package and provenance

| File | Purpose |
| --- | --- |
| `Settings_Prototype.html` | Editable offline HTML/CSS/JavaScript; inline SVG icons; synthetic account; no product reads/writes. |
| `Settings_General.png` + `.md` | General desktop reference and UX. |
| `Settings_Notifications.png` + `.md` | Notification capability/choice reference and UX. |
| `Settings_Security.png` + `.md` | Unconnected security reference and future action contracts. |
| `Settings_Responsive.png` | All tabs at 390 px; General at 768/1024 px. |
| `Settings_States.png` | Dirty, save error, invalid input, loading, load error, empty, conflict, confirmation, saving and saved. |
| `render-settings.mjs` | Repeatable browser exports from the source. |
| `tests/frontend/settings-design-review.mjs` | Prototype checks, not product QA. |

The original three PNGs/UX files and current React UI at 1440 px were read together. Old PNGs had no Figma URL or known export date. Replacement PNGs were exported locally from the HTML on **2026-11-03**; no Figma edits are claimed. The HTML, rather than PNGs alone, is the editable source.

## Acceptance mapping

| Request | Design response / implementation verification |
| --- | --- |
| Improve Settings | Grouped forms, aligned Account, icon tabs, consistent spacing and explicit states. Compare all three tabs at 320/390/768/1024/1440 px; no clipped controls, unreachable actions or page overflow. |
| Remove small text under titles | Remove Settings subtitle and descriptions beneath section/preference titles. Keep real data, field labels/errors, time example and functional notices/status. Remove Settings `PAGE_META.subtitle`; do not globally hide unrelated page descriptions. |
| Component animation | Panel, underline, switch, field/button, dialog and saved-shell transitions below. Keyboard/focus/data updates never wait for animation; honor reduced motion. |
| Link related settings | One saved source and subscriptions, consumer map below. Verify save → navigation/reload/second tab, canonical profile edits, persistence failure and external-update conflict. |

## Reuse and boundaries

Use existing `AppShell`, `Sidebar`, `TopBar`, `Tabs`, `Card`, `Avatar`, `Button`, `Icon`, `useUrlTab`, `useAuth`, member adapters/hooks and `settingsApi`. The prototype's shell, icons, fixture account, fake navigation, synthetic time, ready-capability query and 650 ms in-memory timer are illustrative. Do not copy them as independent React infrastructure.

`SettingsPage` owns draft, saved snapshot, validation, load/save states and navigation coordination. Presentational fields/preference/account components receive data/callbacks and never fetch. The feature adapter owns persistence/validation; a shared hook/provider supplies **saved** settings and subscriptions to consumers. Preserve React, JavaScript/JSX/CSS and the feature layout.

## Canonical consumer map — required implementation

Baseline persistence is browser-local mock storage. Keep `179fc-demo-settings` and `179fc-settings-changed` compatible; add the browser `storage` listener for that key and refresh-on-focus as appropriate. Emit changes only after successful writes. Never create separate per-page preferences or a Settings-owned profile.

| Value | Owner / validation | Shared consumer / outcome |
| --- | --- | --- |
| `clubName` | Settings adapter; trimmed, nonempty, proposed limit 80 characters; preserve unrelated keys. | Shared Sidebar brand and accessible portal name on all private routes. Keep `179` logo mark; ellipsize long names accessibly. |
| `compactNavigation` | Settings adapter; boolean. | `AppShell` on all routes, only after successful save. Mobile drawer keeps full labels; compact desktop retains accessible names. |
| `language` | Adapter; supported translation catalogs; existing values English/Vietnamese, locale mapping `en-GB`/`vi-VN`. | Shared UI copy and formatting must agree. English is currently complete; Vietnamese is unavailable until full consumers/catalog exist. Preserve legacy unsupported values with explicit fallback. User-written content/names and team IDs are not translated. A full localization project is not silently authorized here. |
| `timeZone` | Adapter; allow `Asia/Ho_Chi_Minh` and `UTC`. | Common `Intl.DateTimeFormat` consumer for Posts metadata/activity, timestamped Dashboard content and genuine timestamps elsewhere. Saved changes refresh consumers, including a second open tab. Example `2026-11-03T02:00:00Z`: 09:00 HCM / 02:00 UTC. |
| `assistant` | Preference plus independently verified reminder capability; currently unavailable. | Proactive reminders use shared portal activity; Off suppresses reminders, while launcher/manual chat/security notices remain available. Without a real consumer, retain saved choice and show Unavailable. |
| `summary` | Preference plus verified delivery capability; currently unavailable. | When authorized, summary generation reads the same Dashboard/member/post data. Backend must define recipient verification, channel, cadence and timezone policy. No fake emailed report or duplicate local activity dataset. |
| Account identity/avatar | `useAuth().user.id` joined to canonical member/profile via `membersApi` and profile subscription. | Account, TopBar, Sidebar, Employees and Organization agree; avatar edits propagate. View profile uses `/employees/:user.id`. Missing profile/email/avatar uses honest fallback; email/name/role remain read-only here. |
| Password, two-factor, sessions | Auth/security backend only; current state unknown/unavailable. Ignore legacy settings `twoFactor` as enrollment proof. | Existing `/settings/password`, `/settings/sessions`, shared auth/session provider. No security success from mock settings writes. |

### Dates and scheduling

- `formatPostDate` currently hardcodes locale and implicitly uses browser zone. Genuine instants should use common locale/zone formatting without rewriting ISO data; malformed dates need a fallback.
- Existing Dashboard event `date`/`time` and some post fixtures have no offset. Treat existing club events as **Asia/Ho_Chi_Minh wall-clock values** for display conversion, and document the assumption during implementation. Birthday, joined date, month and other date-only values stay calendar dates and never shift with viewer timezone.
- Keep current scheduled publication semantics: publication happens on a later collection read, not a background scheduler. Display preferences must not reschedule, rewrite or republish posts/events. If an editor value lacks enough timezone information, label its club-time basis explicitly; ask Leader before expanding into a schema migration.
- Do not parse mock “2 days ago” labels as absolute timestamps. Prefer genuine timestamps when present; otherwise retain the honest fixture text.

### Save, concurrency and capability behavior

1. Validate types/enums. Missing storage initializes defaults; malformed/unreadable storage shows recoverable feedback instead of false success. This mock has no server permissions or cross-device synchronization.
2. Patch only changed supported keys in the active tab; exclude `twoFactor`. Preserve unrelated fields from the latest snapshot. Failed persistence must not emit success events or update effective shell values.
3. Same-window custom events and cross-window `storage` events refresh shared consumers. Refresh pristine forms; preserve dirty drafts and show a conflict/reload notice. Guard Reload latest with discard confirmation. Save must not blindly overwrite a newer snapshot: compare a snapshot/revision, with future ETag/version handling for backend APIs.
4. Keep one mutation in flight; lock controls/duplicate actions that could be overwritten by its result. Restore editing on failure and retain draft. Explicit Discard restores the saved snapshot; cancelling navigation changes neither draft nor effective values.
5. Capability availability is separate from the saved preference. Disabled notification switches retain persisted checked values but say Unavailable. Security enrollment stays Not connected. Capability flags come from implemented services/adapters, never a design URL parameter. Do not silently add backend scope.

## Responsive and visual values

| Area | Target |
| --- | --- |
| Palette | Existing burgundy `#7d2939`, primary `#dc1e38`, primary-dark `#bd1630`, text `#1c2431`, muted `#5e6c85`, divider `#dce3ed`, pink `#fff0f3`. Enabled control outlines/off-switch track use `#8793a6` for distinguishable boundaries. |
| Type/space | Existing Inter/system stack; title 34 px desktop / 28 mobile, panel heading 19/18, row/field text 13–14. Panel padding 28/20, card gap 24, field gap 20–24, radius 16/12 px. Reuse shell tokens/gutters rather than create a second global layout. |
| ≥1200 px | Two cards, Account about 290 px; Workspace fields share a row. |
| 1024–1199 px | Two cards, Account about 260 px; Workspace fields stack before controls become cramped. |
| 768–1023 px | Account below form, available-width field grid, existing desktop shell can remain. |
| <768 px | Existing accessible drawer; single-column fields, wrapping row actions, normal-flow footer and full-width primary action. Tabs can scroll internally at 320 px. |
| Focus/targets | Fields/buttons ≥44 px, switches have extended ≥44 px targets. Focus ring 3 px burgundy + 4 px offset; tabs use inset focus to avoid scroll-container clipping. Drawer/dialog/assistant close restore focus. |
| Contrast | Selected text/background pairs ≥4.5:1; enabled control/focus boundaries ≥3:1. Disabled controls have text explaining availability. Color-pair checks are not a whole-product WCAG audit. |

Keep the assistant as a labelled icon without a launcher tooltip. Reserve bottom space and allow focused controls/footer to scroll clear of the assistant and mobile keyboard. Email wraps; long names/labels must not cause page overflow. Review at 200% browser/text zoom as well as viewport widths.

## Motion

| Component | Timing / behavior | Reduced motion |
| --- | --- | --- |
| Active tab underline | 180 ms ease-out; URL/selection/focus update immediately. | Immediate. |
| Panel | Opacity + translateY 5→0, 180 ms ease-out; no fixed-height animation. | Immediate. |
| Switch | Thumb 18 px, color 160 ms ease; draft checked state updates immediately. | Immediate state/color. |
| Field/button/link | Border/background 140 ms, press ≤1 px; focus immediate. | No transition/transform. |
| Saved compact shell | Width/reflow 200 ms after persistence, retain focus and labels. | Immediate layout. |
| Dialog/assistant/drawer | Optional 160–180 ms opacity/panel entrance; focus open/restore independent of duration. | Immediate. |
| Loading | Optional 1400 ms opacity pulse; Loading settings label + `aria-busy`. | Static skeleton/status. |
| Save feedback | Persistent inline text/icon; no disappearing-only toast, shake or forced scroll. | Same feedback. |

## Review and reproduce

Open `Settings_Prototype.html` locally. It uses synthetic in-memory data and no storage writes. Relevant queries:

| Query | State |
| --- | --- |
| `?tab=general`, `notifications`, `security` | Replace the tab value for each main state. |
| `?tab=general&state=dirty` | Draft / Discard / enabled Save. |
| `?tab=general&failSave=1` | Submit an edit to demonstrate save failure/retry. |
| `?tab=general&state=loading` | Also supports `load-error`, `empty`, `validation`, `save-error`. |
| `?tab=general&state=confirm` | Native dirty-navigation modal. |
| `?tab=general&state=conflict` | External change, blocked save, guarded reload. |
| `?tab=notifications&capabilities=ready` | Illustrative future interactive choices; not real delivery. |

From repo root after `npm ci` in `frontend/`:

```powershell
node tests/frontend/settings-design-review.mjs
node designs/Settings/render-settings.mjs
```

Windows uses installed Microsoft Edge; other platforms need bundled Chromium. `PLAYWRIGHT_CHANNEL` selects another installed channel. Renderer accepts an optional output-directory argument. Both commands close their browser before returning; no service remains running. Tests/fixtures remain under `tests/frontend/`; renderer contains export logic only.

## Handoff checklist

- Leader reviews images together with UX, subtitle removal, capability treatment and consumer map, then assigns this same ticket to Developer. No new ticket is required.
- Developer creates one implementation branch and carries this design candidate into it (cherry-pick/equivalent). Update frontend/test READMEs for actual implemented behavior/coverage; do not mark the proposal as implemented prematurely.
- Tester checks the exact implementation candidate: tabs/URL, validation, save/failure, discard/cancel, unavailable services, storage conflicts, cross-page/cross-tab club/compact/date/profile consistency, keyboard/focus, mobile/200% zoom and reduced motion. Delivery tests require a real authorized consumer.
- Designer self-check is not QA PASS, CI PASS or merge approval. Later phases retain exact-SHA QA/CI and user approval gates.
