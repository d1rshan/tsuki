# Auth dialogs

Sign in, account creation, password recovery, password reset, and email verification notices are views in a shared client dialog. Navbar and media actions open it through `useAuthDialog`; switching views and closing the dialog preserve the current page and URL. There are no dedicated auth page routes or intercepted auth slots.

Auth views use the shared Dialog, Field, Input, Button, and DialogFooter components. The footer has a transparent background to match the rest of the dialog. Form labels remain available to screen readers while placeholders identify the fields visually.

Password-reset email callbacks return to `/?auth=reset-password`. The auth provider consumes Better Auth's token or error, opens the corresponding dialog, and replaces the current history entry to remove the callback parameters while preserving other query values. Email verification continues through the auth API and returns to the home page with automatic sign-in.

Former auth route names remain reserved as Usernames to avoid giving account-related names to public Profiles.
