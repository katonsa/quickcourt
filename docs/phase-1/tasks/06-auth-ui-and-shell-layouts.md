# P1-06 — Auth UI & Shell Layouts

## Goal

Create the minimal user-facing UI required for Phase 1 account flows and protected route shells.

## Context

Phase 1 should produce a visible vertical slice: users can interact with auth pages and land in protected shell layouts. The shells should make later milestones easy to add without redesigning route groups.

## Scope

- Auth pages:
  - register
  - login
  - forgot password
  - reset password
  - email verification status/notice
  - logout behavior if needed
- Account settings placeholder for change password.
- Public marketplace shell.
- User dashboard shell.
- Venue dashboard shell.
- Admin dashboard shell.
- Forbidden/unauthorized UI.
- Loading and error states for auth forms.
- Basic form validation and accessible UI.

P1-06 owns the UI and shell implementation. P1-08 owns the final shared smoke coverage for auth pages and protected shells.

## Out of Scope

- Full marketplace landing page design.
- Venue search UI beyond placeholder.
- Venue onboarding UI.
- Staff management UI.
- Booking/payment UI.
- Complex design system customization.

## Dependencies

- P1-04 Auth & Account Foundation.
- P1-05 Organization Access & Route Guards.

## Implementation Steps

1. Define route groups, for example:
   - public routes
   - auth routes
   - user dashboard routes
   - venue dashboard routes
   - admin routes
2. Build auth pages:
   - register form
   - login form
   - forgot password form
   - reset password form
   - email verification notice/status page
3. Build settings placeholder with change password form or link to implemented change password behavior.
4. Build shell layouts:
   - public header/nav placeholder
   - user dashboard sidebar/header
   - venue dashboard sidebar/header
   - admin dashboard sidebar/header
5. Add forbidden/unauthorized pages.
6. Add loading/error states.
7. Ensure forms use shared validation schemas where possible.
8. Ensure UI does not expose internal errors or token details.

## Files / Modules

Likely touched:

```text
app/(auth)/login/page.tsx
app/(auth)/register/page.tsx
app/(auth)/forgot-password/page.tsx
app/(auth)/reset-password/page.tsx
app/(auth)/verify-email/page.tsx
app/(dashboard)/dashboard/page.tsx
app/(dashboard)/dashboard/settings/page.tsx
app/(venue-dashboard)/dashboard/venue/page.tsx
app/(admin)/admin/page.tsx
components/layouts/*
components/auth/*
components/forms/*
lib/validation/auth.ts
```

## Acceptance Criteria

- [ ] Register page exists and connects to auth flow.
- [ ] Login page exists and connects to auth flow.
- [ ] Forgot password page exists and triggers recovery flow.
- [ ] Reset password page exists and handles reset token flow.
- [ ] Change password entry point exists for authenticated user.
- [ ] Email verification notice/status exists.
- [ ] `/venues` public shell exists.
- [ ] `/dashboard` user shell exists and is protected.
- [ ] `/dashboard/venue` venue shell exists and is protected by organization membership.
- [ ] `/admin` admin shell exists and is protected by admin role.
- [ ] Forbidden/unauthorized pages are user-safe.
- [ ] No venue onboarding, booking, or payment UI is implemented.

## Test Plan

- Manual auth flow smoke test.
- Component tests for validation behavior if available.
- Route smoke tests if Playwright or equivalent is available.
- Accessibility sanity check for form labels, buttons, and error messages.
- Final shared page and shell smoke coverage is completed in P1-08.

## Edge Cases

- Reset password with invalid/expired token.
- User navigates to auth page while already logged in.
- User tries to access venue shell without organization membership.
- Auth error from server should show generic message where appropriate.

## Risks

- Overdesigning shells before product flows exist.
- Building self-service owner organization setup despite Phase 1 non-goal.
- Duplicating validation logic between client and server.

## Done When

Users can interact with Phase 1 auth screens and protected shell routes exist for later milestone features.
