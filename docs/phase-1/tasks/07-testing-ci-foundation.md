# P1-07 — Testing & CI Harness

## Goal

Set up the reusable testing harness and CI pipeline so Phase 1 behavior tests and later transactional marketplace features can be implemented safely.

## Context

QuickCourt's later milestones include concurrency-sensitive booking, payment webhooks, ledger entries, refund handling, and authorization rules. Phase 1 should establish the test runner, database testing convention, and CI structure before those critical paths are built.

This task owns the harness. P1-08 owns the final Phase 1 behavior coverage for auth, email sender selection, access helpers, route guards, and shell smoke paths.

## Scope

- Vitest setup.
- Test environment configuration.
- Test database convention.
- Basic unit test examples.
- Env validation tests that prove config parsing works in the test harness.
- Migration/constraint verification command.
- CI workflow for typecheck, lint, and tests.
- Documentation for running tests locally.

## Out of Scope

- Full E2E booking tests.
- Payment webhook tests.
- Ledger accuracy tests.
- Browser matrix testing.
- Load testing.
- Production monitoring.
- Final auth/access/shell behavior coverage.

## Dependencies

- P1-01 App Foundation.
- P1-02 Env, Config, Observability, Error Handling.
- P1-03 Database, Prisma, Migration Foundation.

Can be partially started after P1-01 and completed after P1-03.

## Implementation Steps

1. Install/configure Vitest and test utilities.
2. Create test setup file.
3. Define test naming and folder convention.
4. Add unit tests for env validation:
   - development fallback behavior
   - production required env behavior
5. Add DB smoke test if test DB is available.
6. Add script for migration/constraint verification.
7. Add CI workflow:
   - install dependencies
   - typecheck
   - lint
   - test
   - optional build
8. Document local test commands.
9. Document that auth, email sender, access helper, guard, and shell behavior tests are completed in P1-08.

## Files / Modules

Likely touched:

```text
vitest.config.*
test/setup.ts
**/*.test.ts
.github/workflows/ci.yml
package.json
prisma/verify-db-constraints.sql
docs/testing-strategy.md
```

## Acceptance Criteria

- [ ] `npm run test` or equivalent runs Vitest.
- [ ] `npm run typecheck` runs in CI.
- [ ] `npm run lint` runs in CI.
- [ ] Env validation tests exist.
- [ ] Basic example tests prove the harness works.
- [ ] Migration/constraint verification command is documented.
- [ ] CI workflow is documented and committed.
- [ ] Phase 1 docs explain how to run tests locally.
- [ ] P1-08 behavior coverage dependency is documented.

## Test Plan

This task is the test plan foundation. Verify by running:

```text
npm run typecheck
npm run lint
npm run test
npm run build
```

If DB is available:

```text
npm run db:migrate
npm run db:verify-constraints
npm run db:seed
```

## Edge Cases

- CI may not have a PostgreSQL service by default.
- Some DB tests may need to be marked integration and run separately.
- Environment variables in CI must not use production secrets.
- This task can be `Done` before auth/access/page behavior exists, as long as P1-08 remains open for that coverage.

## Risks

- Pulling behavior tests that depend on P1-04/P1-05/P1-06 into the harness task too early.
- Making DB tests flaky due to shared state.
- Skipping CI until later, causing early regressions.

## Done When

The repository has a working test runner, documented local test flow, and CI that validates the Phase 1 foundation harness.
