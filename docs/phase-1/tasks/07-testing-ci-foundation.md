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
- Required DB integration test harness convention.
- Basic unit test examples.
- Env validation tests that prove config parsing works in the test harness.
- Migration/constraint verification command.
- CI workflow for typecheck, lint, unit tests, and DB integration harness tests.
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

1. Install and configure Vitest and coverage tooling.
2. Create shared `vitest.config.ts`.
3. Create unit `vitest.config.unit.ts`.
4. Create DB integration `vitest.config.integration.ts`.
5. Create `test/setup.ts` and `test/integration/setup.ts`.
6. Define test naming and folder convention.
7. Update npm scripts:
   - `test`
   - `test:watch`
   - `test:coverage`
   - `test:db:migrate`
   - `test:integration`
   - `test:all`
8. Add unit tests for env validation:
   - development fallback behavior
   - production required env behavior
   - `DATABASE_URL_TEST` must differ from `DATABASE_URL`
9. Add at least one basic harness test for a small foundation unit, such as public env parsing or logger redaction config.
10. Add a required DB integration harness convention and minimal DB smoke test.
11. Keep migration/constraint verification command documented.
12. Add CI workflow:
   - install dependencies
   - typecheck
   - lint
   - unit test
   - DB integration harness test with PostgreSQL service
   - optional build
13. Document local test commands.
14. Document that auth, email sender, access helper, guard, and shell behavior tests are completed in P1-08.

## Implementation Slices

P1-07 should be implemented in small slices because it touches tooling, scripts, CI, docs, and early tests. Keep this task focused on the reusable harness. Do not pull full auth/access/shell behavior coverage forward from P1-08.

### Slice 1 — Vitest Harness

- Install `vitest` and `@vitest/coverage-v8`.
- Add `vitest.config.ts` for shared Vitest settings.
- Add `vitest.config.unit.ts` for unit tests.
- Add `test/setup.ts`.
- Configure unit test includes for `*.test.ts` and `*.spec.ts`, excluding `*.integration.test.ts` from the unit config.
- Keep default environment as `node`.
- Put shared settings such as `environment: "node"`, path aliases, and `pool: "forks"` or equivalent isolation in the base config when supported by the installed Vitest version.
- Update npm scripts:
  - `test`: run unit tests once through `vitest.config.unit.ts`.
  - `test:watch`: run unit tests in watch mode through `vitest.config.unit.ts`.
  - `test:coverage`: run unit tests with coverage through `vitest.config.unit.ts`.

Suggested commit:

```text
test: add Vitest harness
```

### Slice 2 — Foundation Tests

- Add env validation tests for:
  - development or test mode allowing console email fallback without Resend config.
  - staging or production requiring Resend config.
  - explicit `EMAIL_PROVIDER=resend` requiring `RESEND_API_KEY` and `EMAIL_FROM`.
  - `DATABASE_URL_TEST` rejecting the same value as `DATABASE_URL`.
- Add one basic example test that proves the harness works without external services.
- Prefer tests against exported parse/config helpers, such as `createEnv` and `createPublicEnv`, instead of mutating global `process.env`.
- Logger redaction config may be tested here if it does not force unrelated server-only imports to load external dependencies.

Suggested commit:

```text
test: cover foundation environment behavior
```

### Slice 3 — DB Integration Harness

- Document `DATABASE_URL_TEST` as the canonical DB integration test database URL.
- Ensure documentation states `DATABASE_URL_TEST` must never point to the same database as `DATABASE_URL`.
- Use `*.integration.test.ts` for DB-backed integration tests.
- Add `vitest.config.integration.ts` that extends shared `vitest.config.ts`.
- Add `test/integration/setup.ts` for integration-only setup and `DATABASE_URL_TEST` validation.
- Add `test:db:migrate` to apply migrations to `DATABASE_URL_TEST`.
- Add `test:integration` to run only `*.integration.test.ts` through `vitest.config.integration.ts`.
- Add `test:all` to run both unit tests and integration tests.
- `npm run test` and `npm run test:coverage` must use the unit config and exclude `*.integration.test.ts`.
- Add a minimal DB integration smoke test that proves the harness can connect to the test database and see the migrated schema.
- `test:integration` should fail clearly when `DATABASE_URL_TEST` is missing because DB integration harness coverage is required for P1-07 completion.
- DB-backed tests must not truncate, reset, migrate, seed, or otherwise mutate the development database behind `DATABASE_URL`.
- Migration setup for integration tests must use `test:db:migrate`, which maps Prisma's active `DATABASE_URL` to `DATABASE_URL_TEST` only for that subprocess.
- Test subprocesses that need Prisma's active datasource may map `DATABASE_URL` to `DATABASE_URL_TEST` only for that subprocess.
- Keep `npm run db:verify-constraints` as the migration/constraint verification command.

Suggested commit:

```text
test: add database integration harness
```

### Slice 4 — CI Workflow

- Add `.github/workflows/ci.yml`.
- Minimum CI steps:
  - `npm ci`
  - `npm run typecheck`
  - `npm run lint`
  - `npm run test`
  - prepare PostgreSQL test database
  - `npm run test:integration`
- CI env must use non-production values and no production secrets.
- Add a PostgreSQL service for the required DB integration harness job.
- Migration and constraint verification may run in the same DB job or a separate DB verification job.
- `npm run build` may be optional or a separate job because the app uses `next/font/google` and build requires network access for font fetching.

Suggested commit:

```text
ci: add foundation validation workflow
```

### Slice 5 — Docs and Status

- Update local testing documentation with:
  - unit test commands.
  - required DB integration harness commands.
  - migration/constraint verification command.
  - CI behavior.
- Document clearly that P1-08 owns final behavior coverage for auth config, email sender selection, access helpers, route guards, and shell smoke paths.
- Update `breakdown.md` only after acceptance criteria and verification pass.

Suggested commit:

```text
docs: mark testing CI foundation complete
```

## Boundary With P1-08

P1-07 owns the runner, conventions, foundational env/config tests, required DB integration harness, and CI pipeline.

P1-08 owns the final behavior coverage for:

- auth configuration smoke tests.
- email sender selection behavior.
- email template behavior beyond minimal harness examples.
- access helper behavior.
- route guard behavior.
- auth page and protected shell smoke tests.

Do not block P1-07 on P1-05 or P1-06 behavior that does not exist yet.

## Test Database Convention

- `DATABASE_URL` is the active app and Prisma datasource.
- `DATABASE_URL_TEST` is the canonical DB integration test database URL.
- If both are set, they must reference different databases.
- Unit tests should not require a database.
- Unit tests must use `vitest.config.unit.ts`.
- DB integration tests must use `vitest.config.integration.ts`.
- DB-backed tests must be named `*.integration.test.ts`.
- `npm run test` must run unit tests only and exclude integration tests.
- `npm run test:db:migrate` must migrate the test database by mapping `DATABASE_URL` to `DATABASE_URL_TEST` for that subprocess.
- `npm run test:integration` must run DB-backed integration tests only.
- `npm run test:integration` must fail clearly when `DATABASE_URL_TEST` is missing.
- Any command that applies migrations, seeds, truncates, or resets data for tests must target the test database, not the development database.
- Commands that target the integration test database may map `DATABASE_URL` to `DATABASE_URL_TEST` only for that subprocess.

## CI Design Notes

The required CI foundation is:

```text
npm ci
npm run typecheck
npm run lint
npm run test
npm run test:integration
```

Required DB CI additions:

- PostgreSQL service for constraint verification and DB-backed tests.
- `npm run db:generate`.
- `npm run test:db:migrate`.
- `npm run db:verify-constraints`.

Optional CI additions:

- `npm run build`.

`npm run build` should remain optional or isolated because it fetches Google fonts through `next/font/google`.

## Files / Modules

Likely touched:

```text
vitest.config.ts
vitest.config.unit.ts
vitest.config.integration.ts
test/setup.ts
test/integration/setup.ts
**/*.test.ts
**/*.integration.test.ts
.github/workflows/ci.yml
package.json
prisma/verify-db-constraints.sql
docs/testing-strategy.md
```

## Acceptance Criteria

- [ ] `npm run test` runs Vitest.
- [ ] `npm run test:watch` runs Vitest watch mode.
- [ ] `npm run test:coverage` runs Vitest coverage.
- [ ] Shared Vitest settings live in `vitest.config.ts`.
- [ ] Unit tests use `vitest.config.unit.ts`.
- [ ] DB integration tests use `vitest.config.integration.ts`.
- [ ] `npm run test` and `npm run test:coverage` exclude integration tests.
- [ ] `npm run test:db:migrate` applies migrations to `DATABASE_URL_TEST`.
- [ ] `npm run test:integration` runs DB-backed integration tests.
- [ ] `npm run test:all` runs unit tests and integration tests.
- [ ] `npm run typecheck` runs in CI.
- [ ] `npm run lint` runs in CI.
- [ ] DB integration harness runs in CI with a PostgreSQL service.
- [ ] Env validation tests exist.
- [ ] Basic example tests prove the harness works.
- [ ] Test DB convention is documented.
- [ ] Minimal DB integration smoke test exists and uses `DATABASE_URL_TEST`.
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
npm run test:integration
npm run build
```

Prepare and verify the test database before running DB integration tests:

```text
npm run db:generate
npm run test:db:migrate
DATABASE_URL=$DATABASE_URL_TEST npm run db:verify-constraints
npm run test:integration
```

## Verification Results

Fill this section when implementation is complete:

```text
npm run typecheck
npm run lint
npm run test
npm run test:integration
```

Conditional verification:

```text
npm run build
npm run db:generate
npm run test:db:migrate
DATABASE_URL=$DATABASE_URL_TEST npm run db:verify-constraints
```

## Edge Cases

- CI may not have a PostgreSQL service by default.
- DB integration tests must run separately from unit tests.
- Environment variables in CI must not use production secrets.
- P1-03 reserves `DATABASE_URL_TEST` for the DB integration test harness. Do not configure it to the same database as `DATABASE_URL`.
- This task can be `Done` before auth/access/page behavior exists, as long as P1-08 remains open for that coverage.

## Risks

- Pulling behavior tests that depend on P1-04/P1-05/P1-06 into the harness task too early.
- Making DB tests flaky due to shared state.
- Skipping CI until later, causing early regressions.

## Done When

The repository has a working test runner, documented local test flow, required DB integration harness, and CI that validates the Phase 1 foundation harness.
