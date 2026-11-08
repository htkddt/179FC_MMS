# Sign-in — UX Description

## User goal

Securely access the 179FC member portal with minimal friction.

## Core experience

- The split layout establishes the product value on the left and focuses the sign-in form on the right.
- User enters email and password, then selects **Sign in to 179FC**.
- **Forgot password?** starts account-recovery without leaving the task ambiguous.

## Expected behavior

- Email and password are validated inline with helpful, non-revealing error messages.
- Password input supports show/hide control and password-manager compatibility.
- Loading prevents duplicate submissions.
- Failed authentication does not indicate whether a particular account exists.
- Successful fake authentication sends the user to Dashboard, or their valid intended protected destination. Protocol-relative, backslash-containing, malformed, and encoded external-like return targets are rejected and use Dashboard instead.

## Navigation

Entry point for unauthenticated users; recovery flow returns to sign-in after completion.
