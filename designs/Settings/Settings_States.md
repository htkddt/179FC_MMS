# Settings — Interactive States UX

Read with [Settings_States.png](Settings_States.png). The board covers the states that static page references cannot demonstrate.

- Notification switches enter a draft immediately, announce unsaved/saving/save-error/conflict state through the shared Settings form, and update consumers only after a successful persistence write.
- Password validation marks the invalid field, provides concise error text, and moves focus there. A missing security service is an error, never a password-change success.
- Two-factor setup shows `Not set up` until the service confirms enrollment. Loading, error, Cancel, Back, and focus restoration remain usable whether or not optional motion is enabled.
- Sessions use skeleton loading, an explicit empty state, and error/retry. The UI does not invent a device, session location, or a successful revoke.
- Page entry uses the common 350 ms portal transition; tab panels and switches use shorter component feedback. `prefers-reduced-motion` removes optional transform/animation without delaying focus or status.

All examples use synthetic data and describe UI behavior only; no backend security or notification service is implied.
