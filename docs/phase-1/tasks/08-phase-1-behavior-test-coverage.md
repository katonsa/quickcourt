# P1-08 — Phase 1 Behavior Test Coverage

## Goal

Add the final Phase 1 behavior coverage for auth, email sender selection, access helpers, route guards, and shell smoke paths after the underlying Phase 1 features exist.

## Context

P1-07 creates the test runner, database convention, scripts, and CI pipeline. This task uses that harness to cover the behavior introduced by P1-04, P1-05, and P1-06 without blocking earlier CI setup work.

P1-06 added focused validation and component smoke coverage for stable auth UI pieces, but intentionally deferred broader auth page, protected shell, and browser/E2E behavior coverage to P1-08.

P1-08 may start locally before the P1-07 CI workflow slice is complete. It must not be marked `Done` until P1-07 CI is complete and the P1-08 coverage has been verified through the final required commands.

## Scope

- Auth config smoke tests.
- Email sender selection tests.
- Email template render tests where templates exist.
- Access helper tests.
- Route guard behavior tests where feasible.
- Auth page and protected shell smoke tests where feasible.
- Local Vitest unit and DB integration coverage only.
- Documentation of browser/E2E behavior coverage intentionally deferred because full E2E infrastructure is not part of this pass.

## Out of Scope

- Full booking E2E tests.
- Payment, webhook, ledger, refund, or withdrawal tests.
- Browser matrix testing.
- Browser/E2E implementation in this pass.
- Load testing.
- Milestone 2 organization invitation acceptance tests.

## Dependencies

- P1-04 Auth & Account Foundation.
- P1-05 Organization Access & Route Guards.
- P1-06 Auth UI & Shell Layouts.
- P1-07 Testing & CI Harness.

## Reviewable Implementation Slices

### Slice 1 — Auth Config Unit Smoke

- Goal: cover QuickCourt's Better Auth configuration contract without testing Better Auth internals.
- Likely files: `lib/auth.test.ts`, `lib/auth.ts` only if a small testability export is unavoidable.
- Acceptance criteria:
  - Confirms QuickCourt app/base path, trusted origins, email/password verification settings, admin plugin intent, organization plugin intent, and hosted-environment rate limit intent.
  - Confirms reset and verification email hooks call the local email sender abstraction.
  - Does not connect to Prisma or load a real database.
  - Does not require production secrets.
- Verification commands:
  - `npm run test -- lib/auth.test.ts`
  - `npm run test`
- Suggested commit message: `test(auth): add auth config smoke coverage`
- Safe before P1-07 CI completion: yes, if it remains unit-only and DB-free.
- Stop point: pause for review after this slice because auth config mocking can become brittle if it over-asserts Better Auth internals.

### Slice 2 — Email Sender and Template Unit Coverage

- Goal: cover sender selection and auth email rendering without calling Resend.
- Likely files: `lib/email/email-sender.test.ts`, `lib/email/templates/auth-email-templates.test.ts`, optionally `lib/email/resend-sender.test.ts` with the `resend` package mocked.
- Acceptance criteria:
  - Development/local console sender behavior is covered.
  - Hosted app environments reject console email sending.
  - Resend selection requires `RESEND_API_KEY` and `EMAIL_FROM`.
  - Resend tests mock the SDK and never call external services.
  - Verification and password reset templates include expected subject/text/html, escape unsafe user input, and do not expose extra token data beyond the intended URL.
- Verification commands:
  - `npm run test -- lib/email`
  - `npm run test`
- Suggested commit message: `test(email): cover auth sender selection and templates`
- Safe before P1-07 CI completion: yes.
- Stop point: pause for review after this slice to confirm no production email or secret assumptions leaked into tests.

### Slice 3 — Access and Route Guard Gap Fill

- Goal: fill any remaining local unit gaps around QuickCourt access policy and route guard mapping.
- Likely files: `lib/auth/access.test.ts`, `lib/auth/guards.test.ts`, `proxy.test.ts`, `test/auth/protected-layouts.test.ts`.
- Acceptance criteria:
  - Existing coverage is reviewed before adding tests to avoid duplicates.
  - `/dashboard/*` remains authenticated-user access.
  - `/dashboard/venue/*` remains organization membership-based and never granted by `User.role`.
  - `/admin/*` remains admin role-based.
  - Authentication failures redirect to sign-in and authorization failures redirect to forbidden.
  - `npm run test` remains DB-free.
- Verification commands:
  - `npm run test -- lib/auth proxy.test.ts test/auth/protected-layouts.test.ts`
  - `npm run test`
- Suggested commit message: `test(auth): strengthen access guard behavior coverage`
- Safe before P1-07 CI completion: yes.
- Stop point: pause for review after this slice because it defines the policy boundary P1-08 should not change.

### Slice 4 — DB Integration Membership Behavior

- Goal: prove the access helpers work against migrated PostgreSQL schema for organization membership behavior.
- Likely files: `test/integration/auth-access.integration.test.ts`, `test/integration/db.ts`, optional focused test factories under `test/integration/`.
- Acceptance criteria:
  - Tests are named `*.integration.test.ts`.
  - Tests use `DATABASE_URL_TEST` through the P1-07 integration harness.
  - Tests mock session resolution only, while using the real test database for membership queries.
  - Admin role without organization membership is denied venue dashboard access.
  - Organization member and owner records grant the expected organization access.
  - Non-member users are denied organization access.
  - Test data is isolated and does not truncate or seed the development database.
- Verification commands:
  - `npm run test:db:up`
  - `npm run db:generate`
  - `npm run test:db:migrate`
  - `DATABASE_URL=$DATABASE_URL_TEST npm run db:verify-constraints`
  - `npm run test:integration`
  - `npm run test:db:down`
- Environment:
  - `DATABASE_URL_TEST` must point at the local test database.
  - `DATABASE_URL` must not equal `DATABASE_URL_TEST`.
- Suggested commit message: `test(auth): add organization access integration coverage`
- Safe before P1-07 CI completion: yes for local development, but do not treat CI coverage as satisfied until P1-07 CI lands.
- Stop point: pause for review after this slice before adding more integration tests, because DB fixture shape and cleanup strategy should stay stable.

### Slice 5 — Auth Pages and Shell Smoke Coverage

- Goal: add stable local smoke coverage for auth pages and protected shells that can be rendered in Vitest without browser automation.
- Likely files: `components/auth/auth-ui.test.tsx`, optional page smoke tests under `test/auth/`.
- Acceptance criteria:
  - Covers canonical auth pages and shell states that are stable after P1-06.
  - Does not duplicate protected layout guard-call assertions owned by Slice 3.
  - Avoids brittle visual/layout assertions.
  - Does not add Playwright or browser E2E tooling.
  - Documents any page behavior that needs a real browser as deferred.
- Verification commands:
  - `npm run test -- components/auth test/auth`
  - `npm run test`
- Suggested commit message: `test(auth): add auth page and shell smoke coverage`
- Safe before P1-07 CI completion: yes.
- Stop point: pause for review after this slice before final documentation/status updates.

### Slice 6 — Coverage Documentation and P1-08 Status

- Goal: document completed local coverage and explicitly list deferred browser/E2E behavior.
- Likely files: `docs/testing-strategy.md`, `docs/phase-1/tasks/08-phase-1-behavior-test-coverage.md`, `docs/phase-1/breakdown.md`.
- Acceptance criteria:
  - Documents local Vitest coverage added in P1-08.
  - Documents browser/E2E auth flows as deferred to the E2E milestone unless the project later enables E2E earlier.
  - Keeps P1-08 from being marked `Done` while P1-07 CI is incomplete.
  - Marks P1-08 complete only after P1-07 CI is complete and all final verification commands pass.
- Verification commands:
  - `npm run test`
  - `npm run typecheck`
  - `npm run lint`
  - `npm run test:db:up`
  - `npm run db:generate`
  - `npm run test:db:migrate`
  - `DATABASE_URL=$DATABASE_URL_TEST npm run db:verify-constraints`
  - `npm run test:integration`
  - `npm run test:db:down`
- Suggested commit message: `docs(testing): document P1-08 behavior coverage`
- Safe before P1-07 CI completion: partial. Coverage notes are safe; final `Done` status is deferred.
- Stop point: final review before any status change in `breakdown.md`.

## Files / Modules

Likely touched:

```text
lib/auth.test.ts
lib/auth/access.test.ts
lib/auth/guards.test.ts
lib/email/email-sender.test.ts
lib/email/templates/auth-email-templates.test.ts
components/auth/auth-ui.test.tsx
proxy.test.ts
test/auth/*
test/integration/*.integration.test.ts
docs/testing-strategy.md
docs/phase-1/tasks/08-phase-1-behavior-test-coverage.md
docs/phase-1/breakdown.md
```

## Acceptance Criteria

- [ ] Auth config smoke tests exist.
- [ ] Email sender selection tests exist.
- [ ] Access helper tests exist.
- [ ] Route guard behavior tests exist where feasible.
- [ ] Auth page and shell smoke tests exist where feasible in Vitest.
- [ ] Tests do not call external Resend services.
- [ ] Tests do not require production secrets.
- [ ] Any deferred behavior coverage is documented with a reason.
- [ ] `npm run test` remains DB-free.
- [ ] DB-backed tests, if added, are `*.integration.test.ts` and pass through `npm run test:integration`.
- [ ] P1-08 is not marked `Done` before P1-07 CI is complete unless project sequencing is explicitly changed.

## Test Plan

Run:

```text
npm run test
npm run typecheck
npm run lint
```

If DB-backed behavior tests are enabled:

```text
npm run test:db:up
npm run db:generate
npm run test:db:migrate
DATABASE_URL=$DATABASE_URL_TEST npm run db:verify-constraints
npm run test:integration
npm run test:db:down
```

Set `DATABASE_URL_TEST` to the local test database before running DB-backed tests. `DATABASE_URL` must not equal `DATABASE_URL_TEST`.

## Edge Cases

- Better Auth integration tests should use the P1-07 DB integration harness when they need a real database instead of mocked Prisma.
- `DATABASE_URL_TEST` is the canonical DB integration test URL; avoid pointing it at the same database as `DATABASE_URL`.
- P1-08 DB integration should mock session resolution and use the real test DB only for QuickCourt membership/access behavior.
- Route guard tests may need to mock session resolution if full request integration is not practical in Vitest.
- UI smoke tests should assert user-safe states without depending on unstable implementation details.
- Browser/E2E auth flow coverage is deferred in this pass; document the gap rather than adding new browser tooling.

## Risks

- Re-testing Better Auth internals instead of QuickCourt integration behavior.
- Making tests flaky by depending on external email services.
- Confusing organization owner/staff membership access with `User.role`.

## Done When

Phase 1 has local Vitest behavior coverage for auth, email sender selection, access helpers, guards, and shell smoke paths where feasible; DB-backed membership behavior uses the integration harness; browser/E2E gaps are explicitly documented; and P1-07 CI is complete.
