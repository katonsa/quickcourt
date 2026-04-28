# P1-08 — Phase 1 Behavior Test Coverage

## Goal

Add the final Phase 1 behavior coverage for auth, email sender selection, access helpers, route guards, and shell smoke paths after the underlying Phase 1 features exist.

## Context

P1-07 creates the test runner, database convention, scripts, and CI pipeline. This task uses that harness to cover the behavior introduced by P1-04, P1-05, and P1-06 without blocking earlier CI setup work.

P1-06 added focused validation and component smoke coverage for stable auth UI pieces, but intentionally deferred broader auth page, protected shell, and browser/E2E behavior coverage to P1-08.

## Scope

- Auth config smoke tests.
- Email sender selection tests.
- Email template render tests where templates exist.
- Access helper tests.
- Route guard behavior tests where feasible.
- Auth page and protected shell smoke tests where feasible.
- Documentation of any behavior coverage intentionally deferred because it requires full E2E infrastructure.

## Out of Scope

- Full booking E2E tests.
- Payment, webhook, ledger, refund, or withdrawal tests.
- Browser matrix testing.
- Load testing.
- Milestone 2 organization invitation acceptance tests.

## Dependencies

- P1-04 Auth & Account Foundation.
- P1-05 Organization Access & Route Guards.
- P1-06 Auth UI & Shell Layouts.
- P1-07 Testing & CI Harness.

## Implementation Steps

1. Add auth configuration smoke tests.
2. Add email sender selection tests:
   - development with no Resend env uses console sender.
   - production with missing Resend env fails.
   - production with Resend env selects the Resend sender.
3. Add email template render tests if templates are implemented.
4. Add access helper tests:
   - unauthenticated user behavior.
   - authenticated user behavior.
   - admin role behavior.
   - organization member behavior.
   - non-member venue access denial.
5. Add route guard behavior tests where feasible:
   - `/dashboard/*` requires authenticated user.
   - `/dashboard/venue/*` requires organization membership.
   - `/admin/*` requires admin role.
6. Add auth page and shell smoke tests where the selected test tools support it.
7. Document any coverage gaps and the milestone that should close them.

## Files / Modules

Likely touched:

```text
**/*.test.ts
**/*.test.tsx
**/*.integration.test.ts
test/*
docs/testing-strategy.md
docs/phase-1/breakdown.md
```

## Acceptance Criteria

- [ ] Auth config smoke tests exist.
- [ ] Email sender selection tests exist.
- [ ] Access helper tests exist.
- [ ] Route guard behavior tests exist where feasible.
- [ ] Auth page and shell smoke tests exist where feasible.
- [ ] Tests do not call external Resend services.
- [ ] Tests do not require production secrets.
- [ ] Any deferred behavior coverage is documented with a reason.
- [ ] `npm run test` or equivalent passes.

## Test Plan

Run:

```text
npm run test
npm run typecheck
npm run lint
```

If DB-backed behavior tests are enabled:

```text
npm run db:generate
npm run test:db:migrate
DATABASE_URL=$DATABASE_URL_TEST npm run db:verify-constraints
npm run test:integration
```

## Edge Cases

- Better Auth integration tests should use the P1-07 DB integration harness when they need a real database instead of mocked Prisma.
- `DATABASE_URL_TEST` is the canonical DB integration test URL; avoid pointing it at the same database as `DATABASE_URL`.
- Route guard tests may need to mock session resolution if full request integration is not practical in Vitest.
- UI smoke tests should assert user-safe states without depending on unstable implementation details.

## Risks

- Re-testing Better Auth internals instead of QuickCourt integration behavior.
- Making tests flaky by depending on external email services.
- Confusing organization owner/staff membership access with `User.role`.

## Done When

Phase 1 has behavior coverage for auth, email sender selection, access helpers, guards, and shell smoke paths where feasible, and any remaining coverage gaps are explicitly documented.
