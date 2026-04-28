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

- [ ] User can register with email/password.
- [ ] User can login with email/password.
- [ ] User can logout.
- [ ] User can trigger email verification flow.
- [ ] User can trigger forgot/reset password flow.
- [ ] User can change password while authenticated.
- [ ] Better Auth Admin Plugin is configured.
- [ ] Better Auth Organization Plugin is configured.
- [ ] Better Auth rate limiting is configured for auth endpoints.
- [ ] Resend sender exists behind an abstraction.
- [ ] Development console fallback logs auth links only in development.
- [ ] Production fails fast without required Resend env variables.
- [ ] No custom app-level rate limiter is implemented for auth.

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
