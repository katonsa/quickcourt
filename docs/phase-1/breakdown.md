# QuickCourt Phase 1 Breakdown

## Status Legend

| Status        | Meaning                                                   |
| ------------- | --------------------------------------------------------- |
| `Todo`        | Planned but not ready or still dependent on another task. |
| `Ready`       | Ready to implement.                                       |
| `In Progress` | Currently being implemented.                              |
| `In Review`   | Implementation complete, pending review/tests.            |
| `Blocked`     | Cannot proceed due to dependency or unresolved decision.  |
| `Done`        | Acceptance criteria and tests are satisfied.              |

## Master Task Board

| ID    | Task                                       | Priority | Status      | Depends On                 | Spec                                                                                                   | Acceptance Summary                                                                                 | Test Required                             |
| ----- | ------------------------------------------ | -------: | ----------- | -------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| P1-01 | App Foundation                             |       P0 | Done        | -                          | [01-app-foundation.md](./tasks/01-app-foundation.md)                                                   | Next.js app, strict TypeScript, base structure, package scripts, UI baseline                       | Typecheck, lint smoke                     |
| P1-02 | Env, Config, Observability, Error Handling |       P0 | Done        | P1-01                      | [02-env-config-observability-error-handling.md](./tasks/02-env-config-observability-error-handling.md) | Env validation, logging, error boundaries, safe config loading                                     | Typecheck, lint, build, smoke checks      |
| P1-03 | Database, Prisma, Migration Foundation     |       P0 | Done        | P1-01, P1-02               | [03-database-prisma-migration-foundation.md](./tasks/03-database-prisma-migration-foundation.md)       | PostgreSQL + Prisma ready, schema applied, constraints verified, migration discipline documented   | Migration verification, DB smoke test     |
| P1-04 | Auth & Account Foundation                  |       P0 | Done        | P1-02, P1-03               | [04-auth-account-foundation.md](./tasks/04-auth-account-foundation.md)                                 | Better Auth email/password, admin plugin, org plugin, account recovery, Resend fallback, rateLimit | Auth config smoke, P1-08 behavior tests   |
| P1-05 | Organization Access & Route Guards         |       P0 | Done        | P1-04                      | [05-organization-access-route-guards.md](./tasks/05-organization-access-route-guards.md)               | Access helpers and route guards for user, venue org member, and admin                              | Access helper tests, guard behavior tests |
| P1-06 | Auth UI & Shell Layouts                    |       P0 | In Progress | P1-04, P1-05               | [06-auth-ui-and-shell-layouts.md](./tasks/06-auth-ui-and-shell-layouts.md)                             | Auth pages, dashboard shells, forbidden/unauthorized/error UI                                      | Component/page smoke tests where feasible |
| P1-07 | Testing & CI Harness                       |       P0 | In Progress | P1-01, P1-02, P1-03        | [07-testing-ci-foundation.md](./tasks/07-testing-ci-foundation.md)                                     | Vitest, unit test scripts, required DB integration harness, CI pipeline                            | CI passes typecheck/lint/unit/integration |
| P1-08 | Phase 1 Behavior Test Coverage             |       P0 | Todo        | P1-04, P1-05, P1-06, P1-07 | [08-phase-1-behavior-test-coverage.md](./tasks/08-phase-1-behavior-test-coverage.md)                   | Auth, email, access guard, and shell smoke coverage for Phase 1 behavior                           | Auth/access/page smoke tests              |

## Workstream View

### Foundation

- P1-01 App Foundation
- P1-02 Env, Config, Observability, Error Handling
- P1-07 Testing & CI Harness
- P1-08 Phase 1 Behavior Test Coverage

### Data

- P1-03 Database, Prisma, Migration Foundation

### Identity & Access

- P1-04 Auth & Account Foundation
- P1-05 Organization Access & Route Guards
- P1-06 Auth UI & Shell Layouts

## Phase 1 Non-Goals Checklist

These items must not be implemented in Phase 1 unless a decision-log entry explicitly moves them forward:

- Super Admin create Organization UI.
- Owner invitation UI.
- Venue onboarding form.
- Venue approval workflow.
- Staff invitation and branch permission editor.
- Court management.
- Schedule/pricing/availability management.
- Booking and payment flow.
- Ledger/withdrawal/refund flow.

## Review Checklist

Before marking Phase 1 as `Done`, confirm:

- [ ] No milestone 2+ feature leaked into implementation.
- [x] All env variables are documented.
- [x] Production-required env vars fail fast when missing.
- [x] Development-only fallbacks are impossible to accidentally use in production.
- [x] Database constraints are applied and verifiable.
- [x] Auth endpoints use Better Auth rate limiting.
- [x] Resend is behind an email sender abstraction.
- [x] Organization access checks use membership, not `User.role`.
- [x] Admin access uses `User.role === "admin"` or equivalent Better Auth Admin Plugin role field.
- [ ] Tests and CI pass.

## Status and Dependency Notes

- `Ready` means all listed dependencies are satisfied.
- Tasks may be partially started only when their task spec explicitly says so.
- P1-02 is `Done` based on acceptance criteria, typecheck/lint/build, and smoke verification. Formal env/logger unit tests remain part of P1-07/P1-08 when the test harness exists.
- P1-03 is `Done` based on Prisma validation/generation, local PostgreSQL migration, constraint verification, idempotent seed, DB smoke, typecheck, lint, and build. The accepted migration sequence is `init_extensions`, `init_domain_schema`, then `add_database_constraints`.
- P1-05 is `Done` based on access helper and route guard implementation, protected route placeholders, minimal access denial pages, optional optimistic `proxy.ts`, development/test guard seed fixtures, focused unit coverage, DB verification, typecheck, lint, tests, and build.
- P1-06 Slice 0 is complete with canonical auth UI routes documented as `/sign-in` and `/sign-up`; `/login` and `/register` are documented as redirect aliases for the upcoming auth route implementation.
- P1-06 Slice 1 has added client-safe auth validation schemas, small shared auth form primitives, and focused validation tests. Route pages and Better Auth client wiring remain in later slices.
- P1-07 has completed the local Vitest, foundation env tests, and DB integration harness slices. CI workflow work is deferred, so P1-07 remains `In Progress` until CI is added and verified.
- Testing harness work can start before all Phase 1 behavior exists, but Phase 1 behavior coverage cannot be marked `Done` until the auth, access, and shell tasks it covers are implemented.
