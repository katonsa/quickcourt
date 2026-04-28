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

1. [x] Create env validation module using Zod or equivalent.
2. [x] Split env into server-only and client-safe exports.
3. [x] Add `.env.example` with Phase 1 variables.
4. [x] Validate core variables:
   - `DATABASE_URL`
   - `BETTER_AUTH_SECRET`
   - `BETTER_AUTH_URL`
   - `APP_URL`
   - `RESEND_API_KEY`
   - `EMAIL_FROM`
5. [x] Apply environment-specific email rules:
   - Development: `RESEND_API_KEY` and `EMAIL_FROM` may be optional if console email fallback is enabled.
   - Production/staging: `RESEND_API_KEY` and `EMAIL_FROM` are required.
6. [x] Add structured logger module using Pino or documented logging choice.
7. [x] Define logging redaction rules for secrets, auth tokens, cookies, reset tokens, and passwords.
8. [x] Add global error handling:
   - `global-error.tsx` if applicable.
   - route group `error.tsx` files where useful.
   - `not-found.tsx`.
9. [x] Add simple server-side error normalization helper if needed.

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

Implemented:

```text
.env.example
config/env.ts
config/public-env.ts
lib/logger.ts
lib/errors.ts
app/error.tsx
app/global-error.tsx
app/not-found.tsx
app/(dashboard)/layout.tsx
app/(dashboard)/error.tsx
app/(admin)/layout.tsx
app/(admin)/error.tsx
```

## Implementation Notes

- `config/env.ts` is marked `server-only` and validates server env at import time through `serverEnv`.
- `config/public-env.ts` is the client-safe env surface and only exports `NEXT_PUBLIC_*` values.
- `APP_ENV` models deployment stage (`development`, `test`, `staging`, `production`) because `NODE_ENV` cannot distinguish staging from production.
- `EMAIL_PROVIDER=console` is allowed for development/test. Staging and production resolve to Resend and require `RESEND_API_KEY` plus `EMAIL_FROM`.
- `LOG_LEVEL` is validated and used by Pino.
- `lib/logger.ts` uses Pino with development `pino-pretty` output and JSON output elsewhere.
- Logger redaction includes secrets, auth tokens, cookies, reset/verification/session tokens, email, phone, name, address, IP, user agent, OTP/MFA values, and payment-sensitive identifiers.
- Error UI uses generic user-facing copy only. It does not render stack traces, raw error messages, or internal details.
- `lib/errors.ts` is server-only and provides `normalizeError` plus `logError` for server-side logging integration.
- Dashboard and admin route groups are placeholder route groups for scoped error boundaries; they do not add user-facing routes yet.

## Acceptance Criteria

- [x] Env variables are validated at startup or import boundary.
- [x] Client code cannot import server-only secrets.
- [x] Missing production `RESEND_API_KEY` or `EMAIL_FROM` fails fast.
- [x] Development can run without final email domain by using console email fallback.
- [x] Logger is configured with secret redaction.
- [x] Error pages do not expose stack traces to end users.
- [x] `.env.example` documents all Phase 1 env variables.
- [x] No custom app-level rate limiting is added.

## Test Plan

- Unit test env validation for development mode.
- Unit test env validation for production mode missing Resend env.
- Leave email sender selection behavior tests to P1-08.
- Unit test or smoke test logger redaction config if feasible.
- Manual check error pages render safely.

## Verification

Completed manually until P1-07 adds the formal test harness:

- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run build` passed with network access for Next font fetch.
- Smoke validation confirmed development console email fallback is allowed.
- Smoke validation confirmed production missing Resend env fails.
- Smoke validation confirmed logger redacts representative PII and secret fields.
- Search confirmed no custom app-level rate limiting was added.

Formal unit tests for env validation and logger redaction remain owned by P1-07/P1-08 once the test harness exists.

## Operational Notes

- Copy `.env.example` to `.env` for local development; do not commit real `.env` files.
- Use `APP_ENV=staging` or `APP_ENV=production` in deployed environments so Resend config fails fast when missing.
- Only import `config/env` from server code. Client Components must use `config/public-env`.
- Keep PII and secrets in structured fields, not log message strings, so Pino redaction can apply.
- When running `npm run build` in a restricted sandbox, request network access first because the app uses `next/font/google`.

## Commit History

- `5e1ea52 feat: add structured logger`
- `014ea94 feat: add baseline error handling`

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
