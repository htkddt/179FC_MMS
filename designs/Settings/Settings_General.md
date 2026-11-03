# Settings — General UX Description

Design revision: **179MMS-6, 2026-11-03**. Read with [General PNG](Settings_General.png), [responsive references](Settings_Responsive.png), [interaction states](Settings_States.png), and the [handoff](Settings_Handoff.md). This is proposed UI, not implemented product behavior.

## User goal

Change workspace preferences once and see the same saved values throughout the portal.

## Layout and copy

- Retain the existing burgundy navigation, red underline, white cards, typography and shared shell. The HTML shell is illustrative; reuse `AppShell` rather than copying it.
- Show **Settings** without its previous subtitle. Remove descriptions beneath section/preference titles, including Compact navigation. Preserve real account data, labels, errors, the formatted time example and action feedback.
- Use icon tabs, a grouped main card and a top-aligned Account card. Workspace has Club name and Workspace language; Preferences has Time zone and Compact navigation with explicit On/Off state.
- Field labels sit above controls. Club name is trimmed, required and proposed to have an 80-character limit. Ellipsize long names in the brand while exposing their full accessible text.
- English is currently available; Vietnamese remains a disabled option until complete shared translation consumers exist. Preserve unsupported legacy selections with explicit fallback/availability feedback; do not silently rewrite them or claim localization works.
- Retain `Asia/Ho_Chi_Minh` and `UTC`. The example below the control formats a synthetic instant. A display zone does not rewrite an event or scheduled post.

## Form and navigation

1. Load the shared saved snapshot. Missing storage uses defaults; failed reads offer Retry rather than enabling a destructive default overwrite.
2. Stage changes in a page-owned draft. Show Unsaved changes, Discard and Save changes when an editable field differs. Other pages keep using saved values.
3. Validate on submit and focus the invalid input. Lock duplicate submissions with Saving…; patch only changed keys of this tab through `settingsApi`.
4. Successful persistence updates the shared snapshot/consumers and shows Changes saved. Failure retains the draft and effective saved values, with Retry save.
5. Discard, tab/route navigation, Profile, sidebar and Log out use the dirty guard. Default dialog focus is Keep editing; Escape keeps the draft and restores trigger focus. Discard changes actually resets the draft before leaving; no hidden dirty tab remains.
6. Browser Back/Forward restore the URL tab. Refresh/close use the native unload guard. Another tab's update refreshes pristine forms; a dirty form retains input and shows a conflict with guarded Reload latest before saving.

## Connected data

- Club name updates the shared brand and accessible portal name throughout private routes after save; the `179` mark stays the project logo.
- Compact navigation updates the whole `AppShell` after save. Mobile keeps full drawer labels.
- Language/time zone use shared formatting consumers in Dashboard, Posts and genuine timestamped metadata. Date-only member data must not shift. See the handoff for naive club-time values and scheduling boundaries.
- Account joins the authenticated user ID with the canonical member profile, also used by TopBar, Sidebar, Employees and Organization. View profile opens `/employees/:user.id`; no second editable account record.

## Responsive, motion and accessibility

- At ≥1024 px use two cards; below that Account follows the form. At <768 px use the existing navigation drawer and single-column fields. At constrained desktop widths stack fields before compressing controls.
- At 320–390 px wrap preference actions and stack footer status/actions. Tabs may scroll internally; the page must not overflow. Footer stays in normal flow and remains reachable with a soft keyboard.
- Buttons/fields are ≥44 px high; the visual switch has an extended 44 px target. Labels, errors and polite save status are programmatic; focus remains visible.
- Tabs use Left/Right/Home/End, one roving tab stop and linked tab/panel IDs. Selects remain native.
- Panel entrance 180 ms, switch 160 ms, controls 140 ms, saved-shell reflow 200 ms; reduced motion disables optional movement. See the handoff for all component timings and contrast.

## Source and export

Editable source: `Settings_Prototype.html`, local HTML/CSS/JavaScript with inline vectors and synthetic Demo Admin identity. Open `?tab=general`; saves are in memory only and do not call product adapters. PNG exported locally on **2026-11-03**. The old reference had no known Figma source URL or export date; no Figma edits are claimed.
