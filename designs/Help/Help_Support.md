# Help Support — UX Description

Read with `Help_Support.png`.

## Route and rationale

- Route: `/help/support`.
- Support is retained as a secondary escalation after search and relevant articles do not resolve an operational, account, or permission question. It must never visually compete with the Help Center’s self-service route.
- The page reuses the exact guest-capable shared shell from `Help.png`, including sidebar/logo/nav/icon set, TopBar position, guest Sign up/Log in actions (or the avatar menu after mock sign-in), page gutter, and 179 Assist launcher. Only the TopBar text changes to **Contact support**.
- The compact shared **Contact support** TopBar is the sole route `h1`. The content heading is the non-duplicated `h2` **Tell us how we can help**. Breadcrumb is 13 px, content `h2` 22–24 px, card headings 18 px, and labels/supporting text/callouts/related rows 14 px.

## Form and guidance

- The form asks for **Topic**, optional **Relevant page**, and **What happened?**. It advises users not to share passwords or personal/sensitive data. It explicitly calls Support a secondary escalation after self-service.
- The adjacent guidance panel prompts users to search Help first, include the page and reproduction steps, and avoid sensitive information. Related article links remain available before escalation.
- All labels are programmatically associated with controls. Topic is a real select, description is a labelled multiline field, and controls/actions have a 44 px minimum target.

## Service boundary and states

- The reference explicitly states: **Support messaging is not connected in this demo. This form will not send a request.** The submit control is disabled and labelled **Support service unavailable**.
- There is no success state, invented ticket number, delivery confirmation, agent availability, or response-time promise.
- A future connected service needs required-field validation, an in-progress state preventing duplicate submission, accessible validation errors, network/service error with Retry, and a success state only after the server returns a confirmed request identifier.
- Loading/retry/error must preserve completed local fields where safe, avoid storing sensitive free text in browser storage, and never log or prefill passwords.

## Responsive and motion

- Desktop keeps form and guidance side by side. Below tablet width, guidance and related articles stack after the form; the disabled boundary and Back action remain in view.
- Focus order follows visual reading order. Reduced motion removes optional entrance/hover transforms while retaining error/focus feedback.

## Implementation boundary

This page is design-only. No support API, queue, email, ticketing integration, persistence, or service-level agreement has been implemented.
