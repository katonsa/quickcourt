# P1-06 — Auth UI & Shell Layouts

## Goal

Create the minimal user-facing UI required for Phase 1 account flows and protected route shells.

## Context

Phase 1 should produce a visible vertical slice: users can interact with auth pages and land in protected shell layouts. The shells should make later milestones easy to add without redesigning route groups.

## Scope

- Auth pages:
  - sign-up, with `/register` redirect alias
  - sign-in, with `/login` redirect alias
  - forgot password
  - reset password
  - email verification status/notice
  - logout behavior
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
   - sign-up form
   - sign-in form
   - `/register` and `/login` redirect aliases
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

## Implementation Slices

P1-06 is split into implementation slices so auth routes, form behavior, and shell layouts can be reviewed independently. Do not mark P1-06 `Done` in `breakdown.md` until all acceptance criteria pass.

### Slice 0 — Route and Auth UI Planning

Goal:

- Resolve the auth page URL convention and confirm how it maps to the existing P1-05 guard constants.
- Re-read relevant local Next.js 16 docs before implementing App Router pages, route groups, redirects, proxy-adjacent behavior, or form/search-param handling.

Files likely touched:

```text
docs/phase-1/tasks/06-auth-ui-and-shell-layouts.md
docs/phase-1/decision-log.md
lib/auth/paths.ts
```

Implementation notes:

- Current P1-05 guards redirect unauthenticated users to `SIGN_IN_PATH = "/sign-in"`.
- Current `proxy.ts` redirects to `/sign-in?redirectTo=...`.
- P1-06 uses `/sign-in` and `/sign-up` as primary auth UI routes.
- Add `/login` and `/register` as redirect aliases to the canonical routes.
- Keep `SIGN_IN_PATH` aligned with the canonical `/sign-in` route.
- Do not change access policy in this slice.

Acceptance criteria:

- Canonical auth routes are documented as `/sign-in` and `/sign-up`.
- `/login` redirects to `/sign-in`; `/register` redirects to `/sign-up`.
- Guard redirects, proxy redirects, denial page links, and auth page links all point at the same canonical sign-in route.
- The redirect alias decision is captured in the decision log if treated as a project route convention.

Suggested commit:

```text
docs(auth): define auth UI route conventions
```

Verification commands:

```bash
npm run typecheck
npm run lint
```

### Slice 1 — Auth Validation and Shared Form Primitives

Goal:

- Add reusable validation schemas and small auth form UI primitives before wiring Better Auth calls.

Files likely touched:

```text
lib/validation/auth.ts
components/auth/auth-card.tsx
components/auth/form-message.tsx
components/auth/submit-button.tsx
components/ui/*
```

Implementation notes:

- Match Better Auth password bounds already configured in `lib/auth.ts`: minimum 8 and maximum 128 characters.
- Keep validation generic and client-safe; do not import server-only auth modules into client components.
- Reuse existing `components/ui` primitives (`Button`, `Input`, `Field`, `Card`, `Spinner`) instead of introducing a new design system.
- Keep error messages user-safe and avoid exposing raw Better Auth errors, token values, or internal stack traces.

Acceptance criteria:

- Shared auth validation exists for sign-in, sign-up, forgot password, reset password, and change password input shapes.
- Form primitives support accessible labels, field errors, pending state, and generic form-level errors.
- No server-only module is imported into client components.

Suggested commit:

```text
feat(auth): add shared auth form primitives
```

Verification commands:

```bash
npm run typecheck
npm run lint
npm run test
```

### Slice 2 — Auth Route Shell and Page Skeletons

Goal:

- Add the visible auth route surfaces without fully wiring every mutation path.

Files likely touched:

```text
app/(auth)/layout.tsx
app/(auth)/sign-in/page.tsx
app/(auth)/sign-up/page.tsx
app/(auth)/forgot-password/page.tsx
app/(auth)/reset-password/page.tsx
app/(auth)/verify-email/page.tsx
app/(auth)/login/page.tsx
app/(auth)/register/page.tsx
components/auth/*
```

Implementation notes:

- Use canonical `/sign-in` and `/sign-up` for primary form implementations.
- Add `/login` and `/register` only as small redirect aliases.
- Use Next.js route groups only for organization; `(auth)` must not appear in URLs.
- For pages that need query strings, use Next.js 16 async `searchParams` on the page and pass sanitized values into client components.

Acceptance criteria:

- Sign-in, sign-up, forgot password, reset password, and verify-email pages render.
- Optional alias routes redirect to canonical routes without duplicating form implementation.
- Auth pages provide clear navigation between related auth flows.
- No protected shell, venue onboarding, booking, payment, or invitation UI is added in this slice.

Suggested commit:

```text
feat(auth): add auth route page skeletons
```

Verification commands:

```bash
npm run typecheck
npm run lint
```

### Slice 3 — Sign-In and Sign-Up Form Behavior

Goal:

- Wire email/password sign-in and sign-up UI to the existing Better Auth client.

Files likely touched:

```text
components/auth/sign-in-form.tsx
components/auth/sign-up-form.tsx
components/auth/auth-redirect.ts
lib/auth-client.ts
lib/auth/paths.ts
app/(auth)/sign-in/page.tsx
app/(auth)/sign-up/page.tsx
```

Implementation notes:

- Use `authClient` from `lib/auth-client.ts`; do not call Better Auth server APIs directly from client components.
- Preserve the P1-05 `redirectTo` behavior by accepting only same-origin relative paths, defaulting to `/dashboard`.
- Preserve `redirectTo` across the `/login` alias redirect into canonical `/sign-in`.
- Use `redirectTo` only for sign-in. Do not carry the original target through sign-up or email verification in Phase 1.
- Pass a safe Better Auth email verification `callbackURL` that lands on the app's `/verify-email` status page after sign-up or resend-verification flows.
- After sign-up, account for `requireEmailVerification: true` and `autoSignIn: false`; send users to a verification notice rather than assuming an authenticated session.
- After sign-in, route to a sanitized `redirectTo` when present.
- Do not add social auth, MFA, passwordless auth, or custom rate limiting.

Acceptance criteria:

- Users can submit email/password sign-in and receive pending, success, and generic error states.
- Users can submit email/password sign-up and receive an email verification notice/status.
- Invalid client input is blocked with accessible field errors.
- `redirectTo` cannot be used for external redirects.
- `redirectTo` affects sign-in only; sign-up and verification completion use the standard app destination instead of preserving the original protected target.
- Sign-up verification callbacks return users to the app's verification status page instead of the root placeholder.

Suggested commit:

```text
feat(auth): wire sign-in and sign-up forms
```

Verification commands:

```bash
npm run typecheck
npm run lint
npm run test
```

### Slice 4 — Recovery and Email Verification UI

Goal:

- Wire forgot password, reset password, and email verification status UI to the existing Better Auth flow.

Files likely touched:

```text
components/auth/forgot-password-form.tsx
components/auth/reset-password-form.tsx
components/auth/verify-email-status.tsx
app/(auth)/forgot-password/page.tsx
app/(auth)/reset-password/page.tsx
app/(auth)/verify-email/page.tsx
lib/validation/auth.ts
```

Implementation notes:

- Forgot password responses must not reveal whether an email exists.
- Forgot password must pass a Better Auth `redirectTo` value pointing at the app's `/reset-password` page so emailed reset links return with `?token=...` or `?error=...`.
- Reset password pages should handle missing, invalid, or expired tokens with a safe generic state and a path back to forgot password.
- Treat token and callback query values as sensitive; never render token values into visible copy or logs.
- Prefer page-level async `searchParams` for token/status/error values and pass only the minimal data needed to client components.
- Keep final shared behavior coverage in P1-08; P1-06 may add focused validation tests if useful.

Acceptance criteria:

- Forgot password form triggers the recovery flow and always shows a privacy-preserving completion message.
- Reset password form handles token-present, token-missing, and provider error states safely.
- Email verification notice/status page exists and can explain next steps without exposing internals.
- All recovery forms show accessible pending and error states.
- Reset and verification UI never renders token values or logs token-bearing URLs.

Suggested commit:

```text
feat(auth): add recovery and verification UI
```

Verification commands:

```bash
npm run typecheck
npm run lint
npm run test
```

### Slice 5 — Logout and Account Settings Password Entry Point

Goal:

- Add minimal authenticated account controls: logout behavior and a `/dashboard/settings` change-password entry point.

Files likely touched:

```text
components/auth/sign-out-button.tsx
components/auth/change-password-form.tsx
app/(dashboard)/dashboard/settings/page.tsx
app/(dashboard)/layout.tsx
components/layouts/*
lib/validation/auth.ts
```

Implementation notes:

- Logout should use Better Auth client behavior and route the user to the public or sign-in surface after session invalidation.
- Change password UI belongs at `/dashboard/settings` per the technical spec.
- Require current password plus new password confirmation, unless Better Auth requires a different fresh-session pattern.
- Do not add profile editing, notification settings, staff permissions, or organization settings.

Acceptance criteria:

- Authenticated users can discover a logout control from protected shells.
- Logout invalidates the session and returns the user to a safe public/auth route.
- `/dashboard/settings` exists and provides a minimal change-password form or implemented entry point.
- Change password form has validation, pending state, and generic success/error feedback.

Suggested commit:

```text
feat(auth): add logout and password settings UI
```

Verification commands:

```bash
npm run typecheck
npm run lint
npm run test
```

### Slice 6 — Public Marketplace Shell

Goal:

- Replace the public placeholders with a minimal public shell that supports Phase 1 navigation without building marketplace search.

Files likely touched:

```text
components/layouts/public-shell.tsx
app/page.tsx
app/venues/page.tsx
```

Implementation notes:

- Keep `/venues` public.
- Keep public pages in the existing `app/page.tsx` and `app/venues/page.tsx` files; do not move them into an `app/(public)` route group for P1-06.
- Use a shared `PublicShell` component directly from those existing pages if shared public chrome is needed.
- Include restrained navigation to `/venues`, sign-in/sign-up, and dashboard where appropriate.
- Do not build venue search, venue detail pages beyond existing placeholders, booking, availability, or payment UI.
- Avoid a marketing-heavy landing page; Phase 1 only needs a usable public shell.

Acceptance criteria:

- Public pages share a consistent header/nav and responsive page structure.
- `/venues` remains public and clearly communicates that search/booking arrive later.
- Auth route links use the canonical paths from Slice 0.
- No marketplace feature implementation leaks into this task.

Suggested commit:

```text
feat(layout): add public marketplace shell
```

Verification commands:

```bash
npm run typecheck
npm run lint
```

### Slice 7 — User Dashboard Shell

Goal:

- Turn the P1-05 `/dashboard` placeholder into a minimal protected user dashboard shell.

Files likely touched:

```text
app/(dashboard)/layout.tsx
app/(dashboard)/dashboard/page.tsx
app/(dashboard)/dashboard/settings/page.tsx
app/(dashboard)/dashboard/bookings/page.tsx
app/(dashboard)/dashboard/profile/page.tsx
app/(dashboard)/dashboard/support/page.tsx
components/layouts/dashboard-shell.tsx
components/layouts/dashboard-nav.tsx
```

Implementation notes:

- Keep `requireUserForRoute()` in the server layout as the source of truth.
- The shell can render the current user's name/email if already returned by the guard helper, but must not fetch unrelated data.
- Add minimal authenticated placeholder routes for `/dashboard/bookings`, `/dashboard/profile`, and `/dashboard/support`.
- Include nav entries for `/dashboard`, `/dashboard/bookings`, `/dashboard/profile`, `/dashboard/settings`, and `/dashboard/support`.
- Placeholder routes must remain small and authenticated-user scoped.

Acceptance criteria:

- `/dashboard` renders inside a protected user shell.
- `/dashboard/bookings`, `/dashboard/profile`, and `/dashboard/support` exist as protected placeholders.
- Authenticated user shell includes stable navigation and a logout entry point.
- Unauthenticated access still redirects through P1-05 guard behavior.
- No booking, support workflow, or profile editing functionality is implemented.

Suggested commit:

```text
feat(layout): add protected user dashboard shell
```

Verification commands:

```bash
npm run typecheck
npm run lint
npm run test
```

### Slice 8 — Venue Dashboard Shell

Goal:

- Turn `/dashboard/venue` into a minimal protected venue workspace shell for organization members.

Files likely touched:

```text
app/(dashboard)/dashboard/venue/layout.tsx
app/(dashboard)/dashboard/venue/page.tsx
components/layouts/venue-dashboard-shell.tsx
components/layouts/venue-dashboard-nav.tsx
```

Implementation notes:

- Keep `requireAnyOrganizationMemberForRoute()` in the server layout as the source of truth.
- The shell may show membership/organization context returned by P1-05 helpers, but must not add owner invitation, staff invitation, staff permission editing, or venue onboarding UI.
- Include only navigation placeholders for future venue sections such as bookings, staff, finance, and settings.
- Do not infer venue access from `User.role`.

Acceptance criteria:

- `/dashboard/venue` renders inside a protected venue shell for organization members.
- Non-members remain forbidden through existing P1-05 guard behavior.
- The shell makes future venue sections discoverable without implementing them.
- No organization creation, invitation, onboarding, booking, payment, finance, or staff permission editor UI is added.

Suggested commit:

```text
feat(layout): add protected venue dashboard shell
```

Verification commands:

```bash
npm run typecheck
npm run lint
npm run test
```

### Slice 9 — Admin Dashboard Shell

Goal:

- Turn `/admin` into a minimal protected admin shell.

Files likely touched:

```text
app/(admin)/layout.tsx
app/(admin)/admin/page.tsx
components/layouts/admin-shell.tsx
components/layouts/admin-nav.tsx
```

Implementation notes:

- Keep `requireAdminForRoute()` in the server layout as the source of truth.
- Admin access remains based on Better Auth admin role / `User.role === "admin"`.
- Include only Phase 1 placeholder navigation for future admin areas.
- Do not add Super Admin organization creation UI or venue approval workflows.

Acceptance criteria:

- `/admin` renders inside a protected admin shell for admins.
- Non-admin authenticated users remain forbidden through existing guard behavior.
- The admin shell is visually distinct enough from user/venue shells to reduce role confusion.
- No admin operational workflow is implemented.

Suggested commit:

```text
feat(layout): add protected admin shell
```

Verification commands:

```bash
npm run typecheck
npm run lint
npm run test
```

### Slice 10 — Denial, Loading, and Error UI Polish

Goal:

- Replace P1-05 minimal denial pages and route error/loading states with user-safe Phase 1 UI.

Files likely touched:

```text
app/unauthorized/page.tsx
app/forbidden/page.tsx
app/(auth)/loading.tsx
app/(dashboard)/loading.tsx
app/(admin)/loading.tsx
app/(dashboard)/error.tsx
app/(admin)/error.tsx
components/layouts/*
```

Implementation notes:

- Keep denial UI safe and generic; do not reveal whether a user, organization, or admin account exists.
- Do not adopt Next.js experimental `authInterrupts` unless a separate decision explicitly enables it.
- Ensure loading states use existing spinner/structure and do not cause layout jumps.
- Error UI should avoid internal stack traces and align with existing global error boundaries.

Acceptance criteria:

- Unauthorized and forbidden pages are consistent with auth routes and shells.
- Protected route loading and error states are present where useful.
- Denial pages link to appropriate canonical routes.
- No internal implementation detail or sensitive data is exposed.

Suggested commit:

```text
feat(ui): polish access denial and route states
```

Verification commands:

```bash
npm run typecheck
npm run lint
```

### Slice 11 — Focused P1-06 Smoke Tests

Goal:

- Add focused tests only where they provide stable value before P1-08 final shared coverage.

Files likely touched:

```text
lib/validation/auth.test.ts
components/auth/*.test.ts
components/auth/*.test.tsx
vitest.config.unit.ts
docs/testing-strategy.md
```

Implementation notes:

- Prefer pure validation tests because they are stable and fit the current unit harness.
- Component rendering tests are allowed in P1-06.
- Update `vitest.config.unit.ts` so `*.test.tsx` files are included by `npm run test` before adding component tests.
- Do not attempt full auth E2E in P1-06 unless the project explicitly adds E2E tooling now.
- P1-08 remains responsible for final auth page and protected shell smoke coverage.

Acceptance criteria:

- Validation tests cover important input behavior if validation schemas were added.
- `npm run test` includes `*.test.tsx` files if component tests are added.
- Any component/page smoke tests added are deterministic, do not hit external services, and do not require production secrets.
- Deferred UI/E2E coverage is documented for P1-08 rather than hidden.

Suggested commit:

```text
test(auth): add focused auth UI smoke coverage
```

Verification commands:

```bash
npm run test
npm run typecheck
npm run lint
```

### Slice 12 — Final Verification

Goal:

- Verify the whole P1-06 implementation against the Phase 1 acceptance criteria.

Files likely touched:

```text
docs/phase-1/tasks/06-auth-ui-and-shell-layouts.md
docs/phase-1/breakdown.md
```

Implementation notes:

- Run the non-network checks first.
- `npm run build` requires network access because `next/font/google` fetches fonts.
- Database-backed commands require network access to local PostgreSQL and are usually not necessary for UI-only changes unless the implementation touched auth/session/database behavior.
- Manual smoke should cover sign-in, sign-up, forgot password, reset password token handling, verification notice/status, logout, `/dashboard`, `/dashboard/settings`, `/dashboard/bookings`, `/dashboard/profile`, `/dashboard/support`, `/dashboard/venue`, `/admin`, `/unauthorized`, and `/forbidden`.

Acceptance criteria:

- All P1-06 behavior and UI acceptance criteria are satisfied.
- Any remaining shared behavior coverage is explicitly documented for P1-08.
- Typecheck and lint pass.
- Focused tests pass if added.
- Production build passes when network access is available.
- Manual smoke confirms protected shells still rely on P1-05 guards.

Suggested commit:

```text
chore(auth): verify auth UI and shell layouts
```

Verification commands:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Optional database-backed verification if auth/session behavior or seed assumptions changed:

```bash
npm run db:migrate
npm run db:verify-constraints
npm run db:seed
```

### Slice 13 — Documentation and Status

Goal:

- Close P1-06 by documenting implementation notes, remaining coverage ownership, and task status.

Files likely touched:

```text
docs/phase-1/tasks/06-auth-ui-and-shell-layouts.md
docs/phase-1/tasks/08-phase-1-behavior-test-coverage.md
docs/phase-1/breakdown.md
docs/phase-1/decision-log.md
docs/testing-strategy.md
```

Implementation notes:

- Update this task doc if actual route names, aliases, component boundaries, or verification differ from this plan.
- Update P1-08 only for shared coverage expectations or explicit deferrals.
- Update `breakdown.md` status only after acceptance criteria and verification pass.
- Add decision-log entries for route conventions, E2E scope, or auth interruption behavior if they become architecture/project decisions.

Acceptance criteria:

- P1-06 docs describe what was implemented and what remains out of scope.
- P1-08 has clear ownership of any final shared behavior coverage.
- `breakdown.md` status reflects the verified state.
- No Phase 1 non-goal is documented as implemented.

Suggested commit:

```text
docs(auth): document P1-06 auth UI completion
```

Verification commands:

```bash
npm run typecheck
npm run lint
```

## Resolved Decisions

- Exact auth route paths:
  - Decision: use `/sign-in` and `/sign-up` as canonical routes because P1-05 already uses `SIGN_IN_PATH = "/sign-in"` and Better Auth endpoint names use sign-in/sign-up language.
  - Decision: add `/login` and `/register` as redirect aliases.
- Guard path alignment:
  - Decision: keep `SIGN_IN_PATH = "/sign-in"` and keep guard/proxy/denial links aligned to that canonical route.
- `redirectTo` from proxy:
  - Decision: preserve the current query param and sanitize it to same-origin relative paths before sign-in navigation.
  - Decision: use `redirectTo` only for sign-in; do not carry it through sign-up or verification notice flows in P1-06.
- Public shell routing:
  - Decision: keep public pages in existing `app/page.tsx` and `app/venues/page.tsx`; do not move them into `app/(public)` for P1-06.
- Visual polish:
  - Recommended: keep Phase 1 shells clean, responsive, and production-presentable, but avoid full marketplace marketing polish or complex dashboard design until workflows exist.
- Logout UI/behavior:
  - Recommended: include logout in P1-06 because P1-04 implemented logout/session handling and protected shells need a visible way to leave a session.
- Dashboard placeholders:
  - Decision: add protected placeholder pages for `/dashboard/bookings`, `/dashboard/profile`, and `/dashboard/support`.
- Testing scope:
  - Decision: update Vitest so `*.test.tsx` component tests are included when P1-06 adds component smoke tests.
  - Recommended: add pure validation tests and any very small smoke tests that fit the current Vitest harness.
  - Full auth/browser E2E should remain deferred unless P1-07/P1-08 explicitly enables it.

## Files / Modules

Likely touched:

```text
app/(auth)/login/page.tsx
app/(auth)/register/page.tsx
app/(auth)/sign-in/page.tsx
app/(auth)/sign-up/page.tsx
app/(auth)/forgot-password/page.tsx
app/(auth)/reset-password/page.tsx
app/(auth)/verify-email/page.tsx
app/(dashboard)/dashboard/page.tsx
app/(dashboard)/dashboard/settings/page.tsx
app/(dashboard)/dashboard/bookings/page.tsx
app/(dashboard)/dashboard/profile/page.tsx
app/(dashboard)/dashboard/support/page.tsx
app/(dashboard)/dashboard/venue/page.tsx
app/(dashboard)/dashboard/venue/layout.tsx
app/(admin)/admin/page.tsx
components/layouts/*
components/auth/*
lib/validation/auth.ts
```

## Acceptance Criteria

- [x] Sign-up page exists and connects to auth flow.
- [x] Sign-in page exists and connects to auth flow.
- [x] `/register` and `/login` redirect aliases exist.
- [x] Forgot password page exists and triggers recovery flow.
- [x] Reset password page exists and handles reset token flow.
- [x] Change password entry point exists for authenticated user.
- [x] Email verification notice/status exists.
- [x] `/venues` public shell exists.
- [x] `/dashboard` user shell exists and is protected.
- [x] `/dashboard/bookings`, `/dashboard/profile`, and `/dashboard/support` protected placeholders exist.
- [x] `/dashboard/venue` venue shell exists and is protected by organization membership.
- [x] `/admin` admin shell exists and is protected by admin role.
- [x] Forbidden/unauthorized pages are user-safe.
- [x] No venue onboarding, booking, or payment UI is implemented.

## Test Plan

- Manual auth flow smoke test.
- Pure validation tests where schemas are added.
- Component smoke tests are allowed; if added, `vitest.config.unit.ts` must include `*.test.tsx`.
- Route smoke tests if Playwright or equivalent is available.
- Accessibility sanity check for form labels, buttons, and error messages.
- Final shared page and shell smoke coverage is completed in P1-08.

## Verification Notes

- 2026-04-29: `npm run typecheck` passed.
- 2026-04-29: `npm run lint` passed.
- 2026-04-29: `npm run test` passed with 10 test files and 59 tests.
- 2026-04-29: `npm run build` passed with network permission for `next/font/google`.
- 2026-04-29: local route smoke against the running dev server on port 3000 returned 200 for `/sign-in`, `/venues`, `/unauthorized`, and `/forbidden`; unauthenticated `/dashboard`, `/dashboard/venue`, and `/admin` returned 307 redirects to canonical `/sign-in?redirectTo=...`.
- Broader browser/E2E auth behavior coverage remains owned by P1-08.

## Completion Notes

- Auth UI routes are implemented at canonical `/sign-in` and `/sign-up`, with `/login` and `/register` redirect aliases.
- Recovery, reset password, verification notice/status, logout, and authenticated password change UI are present with generic user-safe messaging.
- Public marketplace pages remain in `app/page.tsx` and `app/venues/page.tsx`.
- User, venue, and admin shells are implemented without changing P1-05 access policy; venue access remains Organization membership-based and admin access remains admin role-based.
- Venue/admin navigation entries for future work are placeholders only.
- Forbidden, unauthorized, loading, and route error states are generic and avoid internal error details.
- P1-06 added focused validation and component smoke coverage; P1-08 owns final shared behavior/page/shell coverage and any future E2E coverage.
- No organization creation, venue onboarding, invitations, staff permission editor, booking/payment, finance, venue approval, or admin operational workflow was implemented.

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
