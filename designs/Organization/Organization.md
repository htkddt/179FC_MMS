# Organization — UX Description

## User goal and reference

Explore Employees by team, control each team's chart, arrange members, and move members between teams while keeping Employees and Employee profile consistent.

Reference: [Organization.png](Organization.png). The interaction refinements below were reviewed on **2026-11-02** and supersede older details in the supplied image. Its Figma URL and export date are unknown; retain the supplied image.

## Layout

- Organization title with no subtitle, date or introductory sentence.
- One toolbar: Search fills the available width up to the team combobox. Remove the Organization chart and Member directory tabs.
- Plain white chart canvas without grid dots or the Team connections caption. Keep global zoom out/in, fit, Reset layout and Expand chart controls.
- Each team has its own frame. Reserve separate rows for its name/count and action controls, above the connection lines. Every person, including Club Admin, appears exactly once in their current team frame when expanded/visible.
- Member cards show current name, avatar/initials, role, team and availability. Counts derive from canonical member data; the catalog includes empty teams. Connectors express membership, not a manager/reporting hierarchy.
- Overview and Teams remain beside the chart on desktop and stack below it on narrow screens. The chart adapts its columns, retains readable cards and has its own scrolling. The shared assistant remains an accessible icon/chat panel without a launcher tooltip.

## Member interactions

- Hold the left button and drag a card. Pointer capture, global zoom, per-team scale and scroller offsets are accounted for. Escape/pointer cancellation restores its pre-drag placement. A simple left click never transfers or navigates.
- Dropping onto blank space or its own team saves personal chart placement. Dropping onto a different team's frame/header highlights that destination and commits a team transfer on release. Collapsed/empty frames accept drops; hidden frames can be restored first or chosen through the menu.
- Open actions using the card's top-right ellipsis. Right-click and the context-menu shortcut do not open application actions. Keyboard users Tab to the ellipsis and use Enter/Space. Menu arrows/Home/End navigate, Escape closes and restores focus; outside click, actual scrolling and resize dismiss it.
- Actions: **Profile** opens `/employees/:memberId`; **View team** filters that team; **Move to team** opens a destination picker excluding the current team; **Reset position** restores the automatic member slot. The destination picker supports touch/keyboard and includes hidden/empty teams.
- During a transfer, block duplicate member mutations. On successful persistence, update the shared employee record, both team counts and chart grouping, clear the moved member's stale offset, clear filters and reveal/expand the destination. Preserve all other member/profile fields and the job title. On failure, retain the old team/placement and show an actionable error.
- Arrow keys on a focused member move its chart placement; Shift increases the step. Keyboard movement never changes membership; use Move to team for an accessible membership change.

## Team and chart controls

| Control | Result |
| --- | --- |
| Team minus / plus | Scale that team's cards from 75% to 125% and recalculate its frame/lines. |
| Team chevron | Collapse/show member cards while preserving the frame, count and drop destination. |
| Team eye | Hide the frame and members without changing records. Show chips or the Teams sidebar eye restore it; all-hidden state stays recoverable. |
| Team expand | Focus that team in an enlarged chart; All teams restores the full chart. |
| Global minus / plus / percentage | Zoom 45–140% or fit width. |
| Global expand / exit | Enlarge or restore the chart; Escape closes the enlarged view unless a menu/drag consumes it first. |
| Reset layout | Clear personal offsets and team display preferences, restore automatic zoom, and retain all employee team changes. |

Search combines name, role, team and email with the team filter. Zero matches show Clear filters. Empty teams have a deliberate drop prompt. Hidden/collapsed members still contribute to canonical overview/team counts.

## Motion and persistence

- Use brief arrival, frame/card reflow, scaling and popup animations. Track dragging without position transition lag. Honor reduced motion for all optional movement.
- Membership/profile fields use `179fc-member-profiles-v1`. Both transfer entry points call the same async adapter; a successful durable write precedes the shared member-change event.
- Personal offsets use `179fc-organization-layout-v2`, keyed by member ID as `{ team, dx, dy }` relative to the current automatic slot and normalized team scale. Apply only when the stored team matches current membership. The older absolute-coordinate v1 layout is superseded, without changing member data.
- Personal team views use `179fc-organization-view-v1` with `{ scale, collapsed, hidden }` per team. Filter, global zoom and enlarged mode are transient. Layout/view storage failure may keep a usable view for the visit; membership write failure must reject instead of reporting a transfer.
- These are browser-local mocks. See [frontend implementation and proposed backend contract](../../frontend/README.md#organization-implementation) for canonical member/team APIs, stable IDs, transaction/version requirements, cache updates and failure behavior.

## Navigation and scope

Reach Organization from global navigation. Member Profile is reached through ellipsis → Profile; Employees remains a global navigation destination. Cross-team changes must be visible in both Employees and Employee profile after navigation/reload, and an already-open Employees tab refreshes through the current browser storage subscription.

Export/Add member, team CRUD, role editing, server persistence and server authorization are outside this frontend change.
