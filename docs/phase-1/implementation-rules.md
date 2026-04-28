# QuickCourt Phase 1 Implementation Rules

These rules apply to all Phase 1 task specs. They are intended for both human developers and AI implementers.

## Scope Control

- Do not implement features outside the current task spec.
- Do not pull Milestone 2+ features into Phase 1 without updating `decision-log.md` first.
- If a task requires a decision not captured in the docs, add it to `decision-log.md` before implementing the behavior.
- Keep each PR/implementation focused on one task ID where possible.

## TypeScript and Code Quality

- Use TypeScript strict mode.
- Avoid `any` unless there is a narrow, documented reason.
- Validate external input with Zod or equivalent schema validation.
- Keep server-only logic out of client components.
- Avoid leaking secrets or tokens to client-side code.
- Import server secrets only through server-only modules such as `config/env.ts`.
- Import browser-safe env only through `config/public-env.ts` and only expose `NEXT_PUBLIC_*` values.

## Database and Prisma

- Do not change Prisma schema without a migration.
- Keep PostgreSQL-specific constraints in explicit SQL migrations when Prisma cannot express them.
- All migrations must be deterministic and reviewable.
- Do not use destructive migration changes without documenting the reason.
- Money fields must remain integer/BigInt rupiah fields; do not use floating point for money.
- Existing anti-double-booking constraints must not be weakened.

## Auth and Access Control

- Use Better Auth as the source of truth for auth/session handling.
- Use Better Auth Admin Plugin for admin role support.
- Use Better Auth Organization Plugin for organization membership support.
- Auth endpoint rate limiting must be configured through Better Auth `rateLimit`.
- Do not build custom auth rate limiting middleware in Phase 1.
- `/admin/*` access is based on admin role.
- `/dashboard/venue/*` access is based on Organization membership, not `User.role`.
- Venue Owner is an Organization member with role `owner`.
- Venue Staff is an Organization member with role `member` plus future branch permission data.
- Phase 1 must not implement staff management UI.

## Email

- Use an email sender abstraction.
- Resend is the production provider.
- Development may use a console sender fallback for verification/reset links.
- Production must fail fast if Resend-required env variables are missing.
- Reset/verification URLs must not be logged in production.
- Email templates must not include sensitive tokens except through intended verification/reset links.

## Logging and Error Handling

- Use structured logging for server-side logs.
- Use Pino for Phase 1 server logging unless a later decision log entry changes the logging provider.
- Do not log passwords, auth tokens, session cookies, reset tokens, verification tokens, or payment secrets.
- Keep PII and secrets in structured log fields, not message strings, so logger redaction can apply.
- Global error boundaries must avoid exposing internal stack traces to end users.
- Server errors should include enough context for debugging without leaking secrets.

## Testing

- Add or update tests when implementing behavior that can regress.
- Phase 1 tests should focus on config, env validation, auth/access helpers, email sender behavior, migration verification, and CI reliability.
- Do not add booking/payment/ledger tests in Phase 1 except as placeholders in later milestone docs.
- CI must run typecheck, lint, and tests.

## Documentation

- Update task status in `breakdown.md` as work progresses.
- Update `decision-log.md` for decisions that affect architecture, scope, security, or operations.
- If implementation differs from task spec, update the spec rather than leaving docs stale.
