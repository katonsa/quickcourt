# P1-04 — Auth & Account Foundation

## Goal

Implement QuickCourt's Phase 1 account foundation with Better Auth, including email/password auth, account recovery, email verification, admin plugin, organization plugin, Resend integration, development email fallback, and Better Auth rate limiting.

## Context

All QuickCourt roles use account identity. Customer, venue owner, venue staff, and super admin access all depend on correct auth/session behavior. Phase 1 must make account flows usable before marketplace features are built.

## Scope

- Configure Better Auth core.
- Configure email/password sign-up and sign-in.
- Configure logout/session handling.
- Configure email verification.
- Configure forgot/reset password.
- Configure change password.
- Configure Better Auth Admin Plugin.
- Configure Better Auth Organization Plugin.
- Configure Better Auth built-in `rateLimit` for auth endpoints.
- Implement email sender abstraction.
- Implement Resend email sender.
- Implement console/dev email sender fallback.
- Add minimal email templates for verification and password reset.
- Ensure auth events can be audited/logged where feasible without leaking secrets.

P1-04 owns the auth and email implementation. P1-08 owns the final behavior coverage for email sender selection, auth smoke tests, and access-related behavior.

## Out of Scope

- Social login.
- Passwordless login.
- MFA.
- Owner invitation UI.
- Staff invitation UI.
- Super Admin organization creation UI.
- Custom app-level rate limiting middleware.
- Notification center UI.

## Dependencies

- P1-02 Env, Config, Observability, Error Handling.
- P1-03 Database, Prisma, Migration Foundation.

## Implementation Steps

1. Configure Better Auth with Prisma/database adapter according to chosen package conventions.
2. Enable email/password sign-up and sign-in.
3. Enable email verification.
4. Enable forgot/reset password.
5. Enable change password from authenticated settings route/service.
6. Add Admin Plugin configuration.
7. Add Organization Plugin configuration.
8. Configure Better Auth `rateLimit`:
   - production enabled
   - stricter auth endpoint limits where supported
   - development behavior documented
9. Create `EmailSender` abstraction, for example:
   - `sendVerificationEmail(input)`
   - `sendPasswordResetEmail(input)`
10. Implement Resend sender using `RESEND_API_KEY` and `EMAIL_FROM`.
11. Implement development console sender fallback:
    - logs verification/reset links only in development.
    - never logs links in production.

12. Add minimal email templates:
    - verification email.
    - password reset email.

13. Add auth utility helpers:
    - get current session/user.
    - require authenticated user.

14. Document local development behavior.

## Implementation Slices

P1-04 is split into implementation slices so each change remains small, reviewable, and easy to commit independently. Do not mark P1-04 `Done` in `breakdown.md` until all acceptance criteria pass.

### Slice 0 — Planning and Dependency Audit

- Review this task spec, Phase 1 implementation rules, decision log, current Prisma schema, `lib/db.ts`, env config, logger, and error helpers.
- Read official Better Auth documentation for the exact package/API conventions being installed.
- Read relevant local Next.js docs in `node_modules/next/dist/docs/` before adding route handlers or server-only modules.
- Identify required Better Auth and email dependencies before installation.

Suggested commit: none unless intentional docs-only planning notes are added.

### Slice 1 — Dependencies and Env Foundation

- Install Better Auth and email provider dependencies after requesting network permission.
- Add required auth/email env vars to `.env.example`.
- Update `config/env.ts` validation.
- Keep secrets server-only and do not expose non-`NEXT_PUBLIC_*` values through client config.

Implementation note:

- Installed `better-auth` and `resend`. The installed Better Auth package exports `better-auth/adapters/prisma`, so no separate Prisma adapter package is required.
- Added optional `ADMIN_BOOTSTRAP_EMAIL` for the promotion-only admin bootstrap script.

Suggested commit:

```text
feat(auth): add auth dependencies and env foundation
```

### Slice 2 — Email Sender Abstraction

- Add an `EmailSender` abstraction for verification and password reset emails.
- Add development/test console sender fallback.
- Add Resend sender for staging/production.
- Ensure production fails fast when Resend config is missing.
- Do not log verification/reset links in production.

Implementation note:

- `lib/email/email-sender.ts` selects Resend or console based on validated server env.
- Console sender prints auth links only when `APP_ENV=development`; test logs do not include links and hosted environments cannot select the console sender.
- Resend sender uses minimal plain text and HTML templates from `lib/email/templates/`.

Suggested commit:

```text
feat(email): add transactional email sender abstraction
```

### Slice 3 — Better Auth Core Configuration

- Configure Better Auth email/password auth.
- Wire the Prisma/database adapter using current Prisma v7 and generated client conventions.
- Configure Better Auth built-in `rateLimit`.
- Add server-side auth module(s).
- Do not add route guards, auth UI pages, or dashboard protection here; those belong to later tasks.

Implementation note:

- `lib/auth.ts` configures email/password, email verification, password reset, change-password endpoint support, Prisma adapter wiring through `lib/db.ts`, Better Auth Admin Plugin, Better Auth Organization Plugin, and built-in `rateLimit`.
- Organization self-service creation is disabled for ordinary users to preserve the Phase 1 access model.
- Rate limiting is enabled for hosted environments and remains off for local development/test unless the environment is hosted.

Suggested commit:

```text
feat(auth): configure Better Auth core
```

### Slice 4 — Better Auth Route Handler

- Add the auth API route under the root `app/` directory.
- Follow Next.js 16 App Router route handler conventions from local docs.
- Keep route handler implementation server-only.
- Verify the route path matches Better Auth client/server expectations.

Implementation note:

- Auth is mounted at `app/api/auth/[...all]/route.ts` using `toNextJsHandler(auth)` with Node.js runtime.

Suggested commit:

```text
feat(auth): expose Better Auth route handler
```

### Slice 5 — Admin and Organization Plugins

- Enable Better Auth Admin Plugin.
- Enable Better Auth Organization Plugin.
- Preserve role boundaries:
  - Super Admin uses Better Auth admin role, expected as `User.role === "admin"`.
  - Venue owner/staff access is organization membership based, not `User.role`.
- Do not implement organization creation UI, owner invitation UI, or staff management UI.

Suggested commit:

```text
feat(auth): enable admin and organization plugins
```

### Slice 6 — Admin Bootstrap Support

- Document the admin bootstrap path.
- Add an idempotent script/command if appropriate:
  - the user must already exist through Better Auth;
  - the script promotes a configured email/user to `User.role = "admin"`.
- Recommended env name: `ADMIN_BOOTSTRAP_EMAIL`.
- Do not raw-seed Better Auth password credentials.

Implementation note:

- `npm run auth:bootstrap-admin` promotes an existing Better Auth user identified by `ADMIN_BOOTSTRAP_EMAIL`.
- The script does not create users, accounts, sessions, or password credentials.

Suggested commit:

```text
feat(auth): add admin bootstrap support
```

### Slice 7 — Server Auth Helpers

- Add minimal helpers needed by P1-05:
  - get current session/user;
  - require authenticated user;
  - identify admin role;
  - expose organization membership/session shape if available.
- Keep authorization policy minimal. Full route guards belong to P1-05.

Implementation note:

- `lib/auth/require-user.ts` exposes `getCurrentSession`, `getCurrentUser`, `requireAuthenticatedUser`, `isAdminUser`, and membership loading for later P1-05 route guard work.

Suggested commit:

```text
feat(auth): add server auth helpers
```

### Slice 8 — Documentation and Status

- Update this task doc with implementation notes if the final implementation differs from the plan.
- Update `decision-log.md` for choices that affect architecture, security, or operations.
- Update `breakdown.md` only after acceptance criteria and verification pass.

Suggested commit:

```text
docs(auth): document P1-04 auth foundation
```

### Slice 9 — Verification

Run after each relevant slice where possible:

```bash
npm run typecheck
npm run lint
```

Run final verification:

```bash
npm run db:migrate
npm run db:verify-constraints
npm run db:seed
npm run typecheck
npm run lint
npm run build
```

In restricted sandboxes, follow `AGENTS.md` and request permission before package installation, build, or database-backed commands.

## Files / Modules

Likely touched:

```text
lib/auth.ts
lib/auth-client.ts
lib/email/email-sender.ts
lib/email/resend-sender.ts
lib/email/console-sender.ts
lib/email/templates/*
lib/auth/require-user.ts
config/env.ts
.env.example
package.json
```

## Validation Rules

- Password rules should follow Better Auth configuration and product security requirements.
- Forgot password response must not reveal whether an email exists.
- Reset/verification tokens must not be stored or logged in plaintext by custom code.
- Production requires Resend env variables.
- Development fallback must be unavailable in production.

## Acceptance Criteria

- [x] User can register with email/password.
- [x] User can login with email/password.
- [x] User can logout.
- [x] User can trigger email verification flow.
- [x] User can trigger forgot/reset password flow.
- [x] User can change password while authenticated.
- [x] Better Auth Admin Plugin is configured.
- [x] Better Auth Organization Plugin is configured.
- [x] Better Auth rate limiting is configured for auth endpoints.
- [x] Resend sender exists behind an abstraction.
- [x] Development console fallback logs auth links only in development.
- [x] Production fails fast without required Resend env variables.
- [x] No custom app-level rate limiter is implemented for auth.

## Verification Results

Completed on 2026-04-28:

- `npm run db:migrate` — pass, schema already in sync.
- `npm run db:verify-constraints` — pass.
- `npm run db:seed` — pass.
- `npm run db:smoke` — pass.
- `npm run typecheck` — pass.
- `npm run lint` — pass.
- `npm run test` — pass placeholder (`No tests configured yet`).
- `npm run build` — pass.
- Local Better Auth HTTP smoke against the running dev server — pass:
  - `GET /api/auth/ok`
  - email/password sign-up
  - email verification
  - email/password sign-in
  - authenticated change password
  - forgot/reset password
  - forgot-password privacy response for a missing email
  - logout

Disposable auth smoke user data was removed after verification.

## Test Plan

- Smoke test Better Auth config loads.
- Verify auth and email modules expose testable seams for P1-08.
- Add focused unit tests during implementation if P1-07 is already available.
- Final shared behavior coverage for email sender selection, auth flows, and forgot password privacy is completed in P1-08.

## Edge Cases

- User tries forgot password before email verification.
- User requests multiple reset links.
- Expired reset link.
- Already verified email.
- Missing `BETTER_AUTH_URL` or mismatched `APP_URL`.
- Resend API failure.

## Risks

- Misconfiguring Better Auth plugin models against Prisma schema.
- Accidentally logging auth links in production.
- Treating organization owner as `User.role` instead of membership.
- Duplicating Better Auth rate limiting with custom middleware.

## Done When

Core account flows are usable, email delivery is abstracted with Resend/dev fallback, Better Auth plugins are configured, and later access-control tasks can rely on authenticated sessions and organization membership data.
