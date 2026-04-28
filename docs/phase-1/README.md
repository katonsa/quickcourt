# QuickCourt Phase 1 — Foundation

## Purpose

Phase 1 establishes the technical, identity, and access-control foundation for QuickCourt before venue onboarding, court management, booking, payment, and finance features are implemented.

QuickCourt is a transactional marketplace. Later milestones will depend on a reliable foundation for authentication, organization membership, route protection, database migration discipline, logging, testing, and operational guardrails.

## Phase Objective

By the end of Phase 1, the app must be able to support the following minimal vertical slice:

```text
User can register, verify/recover account, login, logout, and access protected shells.
Admin can be bootstrapped through seed/config.
Organization plugin is installed and membership-aware access helpers exist.
Route guards can distinguish user dashboard, venue dashboard, and admin dashboard access.
The app has database, logging, env validation, error handling, and CI/test foundations.
```

## Scope

Phase 1 includes:

- Next.js 16 App Router foundation with TypeScript strict mode.
- Base project structure and conventions.
- PostgreSQL + Prisma v7 setup.
- Existing QuickCourt schema and constraint migration discipline.
- Better Auth with Admin Plugin and Organization Plugin.
- Email/password account flows.
- Forgot/reset password and change password.
- Resend email integration with development console fallback.
- Better Auth built-in rate limiting for auth endpoints.
- Admin bootstrap/seed path.
- Organization plugin setup and seed/test organization support.
- Route guards and access helpers for `/dashboard`, `/dashboard/venue`, and `/admin`.
- Public, user dashboard, venue dashboard, admin, auth, and error shell layouts.
- Structured logging and global error handling.
- Testing and CI harness.
- Phase 1 behavior test coverage.

## Out of Scope

Phase 1 does not include:

- Super Admin create Organization UI.
- Owner invitation UI.
- Full venue onboarding form.
- Venue approval workflow.
- Staff invitation and branch permission editor.
- Venue/court CRUD.
- Schedule, pricing, and availability calculation.
- Booking flow.
- Payment and Xendit webhook flow.
- Ledger, withdrawal, settlement, and refund execution.
- Review, notification preference, and analytics features.

## Key Decisions

See [`decision-log.md`](./decision-log.md).

Important Phase 1 decisions:

- Organization in Phase 1 means setup plugin, access helpers, route guards, and seed/test organization only.
- Super Admin organization creation and owner invitation remain Milestone 2.
- Auth endpoint rate limiting is owned by Better Auth built-in `rateLimit`.
- Custom app-level rate limiting for non-auth endpoints is deferred.
- Resend is the selected transactional email provider.
- Because the final email domain is not ready, development may log email links to console.
- Production requires `RESEND_API_KEY`, `EMAIL_FROM`, and a verified Resend sending domain.
- Server-only env is validated through `config/env.ts`; browser-safe env is exposed separately through `config/public-env.ts`.
- Pino is the structured logger for Phase 1, with default redaction for secrets and high-risk PII.
- Error pages use generic user-facing messages; server-side helpers own normalization and logging.
- P1-03 uses PostgreSQL 17 and Prisma v7 with a three-step migration sequence: extensions, full domain schema, then PostgreSQL-specific constraints.
- Runtime Prisma access lives in `lib/db.ts`; the generated client output is `generated/prisma`.
- `DATABASE_URL_TEST` is the canonical integration test database URL and must differ from `DATABASE_URL`.
- P1-07 requires a DB integration harness: unit tests stay DB-free, DB-backed tests use `*.integration.test.ts`, and CI runs them against PostgreSQL.
- Development/test seeding may create sample organization membership data, but credential creation stays owned by Better Auth.

## Status Workflow

Phase 1 task status uses an engineering-board style workflow:

| Status        | Meaning                                                       |
| ------------- | ------------------------------------------------------------- |
| `Todo`        | Task is planned but not ready to start or has dependencies.   |
| `Ready`       | Task is ready to implement.                                   |
| `In Progress` | Task is currently being implemented.                          |
| `In Review`   | Implementation is complete and needs review/testing.          |
| `Blocked`     | Task cannot proceed due to unresolved dependency or decision. |
| `Done`        | Task satisfies acceptance criteria and test requirements.     |

## Execution Order

Recommended execution order:

1. [`P1-01 App Foundation`](./tasks/01-app-foundation.md)
2. [`P1-02 Env, Config, Observability, Error Handling`](./tasks/02-env-config-observability-error-handling.md)
3. [`P1-03 Database, Prisma, Migration Foundation`](./tasks/03-database-prisma-migration-foundation.md)
4. [`P1-04 Auth & Account Foundation`](./tasks/04-auth-account-foundation.md)
5. [`P1-05 Organization Access & Route Guards`](./tasks/05-organization-access-route-guards.md)
6. [`P1-06 Auth UI & Shell Layouts`](./tasks/06-auth-ui-and-shell-layouts.md)
7. [`P1-07 Testing & CI Harness`](./tasks/07-testing-ci-foundation.md)
8. [`P1-08 Phase 1 Behavior Test Coverage`](./tasks/08-phase-1-behavior-test-coverage.md)

Some work can run in parallel after P1-01, but auth, organization access, and UI shells should remain dependency-aware.
P1-07 may start once the database foundation exists; P1-08 is the final Phase 1 behavior coverage pass after auth, access, and shell behavior exists.

## Definition of Done for Phase 1

Phase 1 is done when:

- All task specs in [`breakdown.md`](./breakdown.md) are `Done`.
- Typecheck, lint, unit tests, DB integration harness tests, and migration verification pass locally and in CI.
- Auth account flows are implemented or explicitly mocked according to environment rules.
- Auth rate limiting is configured through Better Auth.
- Resend integration exists behind an email sender abstraction.
- Development email fallback logs verification/reset links safely.
- Admin bootstrap path is documented and idempotent.
- Route guards correctly protect user, venue, and admin shells.
- Phase 1 behavior coverage exists for auth, email sender selection, access helpers, guards, and shell smoke paths where feasible.
- No feature from later milestones is implemented accidentally.
