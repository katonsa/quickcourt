# P1-02 — Env, Config, Observability, Error Handling

## Goal

Create safe configuration loading, environment validation, structured logging, and baseline error handling for Phase 1 and later marketplace workflows.

## Context

QuickCourt will handle authentication, payment, booking, and finance operations. Misconfigured env variables or unsafe logging can create security and operational issues. Phase 1 should establish the pattern before critical workflows exist.

## Scope

- Centralized env validation.
- Separate server-only and public env handling.
- Document required env variables.
- Structured logging setup.
- Global error boundary and route-group error pages.
- Production vs development behavior for email configuration.
- Safe defaults for local development.

P1-02 owns environment validation and production fail-fast rules. P1-04 owns the actual email sender implementations, and P1-08 owns final email sender behavior coverage.

## Out of Scope

- Payment/Xendit env variables beyond documenting future placeholders.
- Custom app-level rate limiting.
- Full monitoring platform integration.
- Alerting and dashboards.

## Dependencies

- P1-01 App Foundation.

## Implementation Steps

1. Create env validation module using Zod or equivalent.
2. Split env into server-only and client-safe exports.
3. Add `.env.example` with Phase 1 variables.
4. Validate core variables:
   - `DATABASE_URL`
   - `BETTER_AUTH_SECRET`
   - `BETTER_AUTH_URL`
   - `APP_URL`
   - `RESEND_API_KEY`
   - `EMAIL_FROM`
5. Apply environment-specific email rules:
   - Development: `RESEND_API_KEY` and `EMAIL_FROM` may be optional if console email fallback is enabled.
   - Production/staging: `RESEND_API_KEY` and `EMAIL_FROM` are required.
6. Add structured logger module using Pino or documented logging choice.
7. Define logging redaction rules for secrets, auth tokens, cookies, reset tokens, and passwords.
8. Add global error handling:
   - `global-error.tsx` if applicable.
   - route group `error.tsx` files where useful.
   - `not-found.tsx`.
9. Add simple server-side error normalization helper if needed.

## Files / Modules

Likely touched:

```text
.env.example
config/env.ts
lib/logger.ts
lib/errors.ts
app/global-error.tsx
app/error.tsx
app/not-found.tsx
app/(dashboard)/error.tsx
app/(admin)/error.tsx
```

## Acceptance Criteria

- [ ] Env variables are validated at startup or import boundary.
- [ ] Client code cannot import server-only secrets.
- [ ] Missing production `RESEND_API_KEY` or `EMAIL_FROM` fails fast.
- [ ] Development can run without final email domain by using console email fallback.
- [ ] Logger is configured with secret redaction.
- [ ] Error pages do not expose stack traces to end users.
- [ ] `.env.example` documents all Phase 1 env variables.
- [ ] No custom app-level rate limiting is added.

## Test Plan

- Unit test env validation for development mode.
- Unit test env validation for production mode missing Resend env.
- Leave email sender selection behavior tests to P1-08.
- Unit test or smoke test logger redaction config if feasible.
- Manual check error pages render safely.

## Edge Cases

- `NEXT_PUBLIC_*` variables are public; do not place secrets there.
- Avoid logging full request headers because cookies may be included.
- Avoid allowing development fallback in production through loose `NODE_ENV` checks.

## Risks

- Accidentally making Resend optional in production.
- Importing server env into client components.
- Logging sensitive auth recovery links in production.

## Done When

The app has centralized, tested configuration behavior and safe logging/error-handling patterns for later milestone features.
