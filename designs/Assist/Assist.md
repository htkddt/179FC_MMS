# Assist — UX Description

## User goal

Receive quick, contextual help without leaving the current task.

## Core experience

- The floating icon button opens a compact chat panel. It retains an accessible **Open 179 Assist** / **Close 179 Assist** name, without a visible tooltip or text pill (updated with the Organization redesign on 2026-11-02).
- A short welcome asks what the user needs help with and offers a suggested prompt.
- The user enters a question in the message field and sends it with the send icon.
- The panel should preserve the current page context so answers can point to relevant actions or help articles.

## Expected behavior

- Show a typing/loading state while an answer is being prepared.
- Keep the conversation readable with timestamps or clear message grouping.
- If the question cannot be answered, offer a link to Help or a contact-support action.
- Closing the panel must not discard the draft message unless the user confirms.

## Navigation

Available as a global utility from every authenticated screen.
