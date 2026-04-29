# Testing Strategy

> [!NOTE]
> Dokumen ini menjabarkan strategi, framework, dan panduan testing QuickCourt MVP.
> Untuk spesifikasi teknis, lihat [Technical Spec](./technical-spec.md).
> Untuk roadmap dan milestone, lihat [Project Plan](./project-plan.md).

---

## 1. Principles

QuickCourt is a transactional marketplace. Bugs in booking, payment, ledger, or access control can affect money, operational trust, and user data. Tests should prioritize critical behavior over high coverage numbers.

Core rules:

1. Prefer user-visible behavior over implementation details.
2. Keep `npm run test` fast and DB-free.
3. Use real PostgreSQL for DB-backed integration and protected E2E tests.
4. Keep public E2E fast and DB-free.
5. Do not weaken assertions to make tests pass.
6. Avoid large snapshots and snapshot-only tests.
7. Avoid arbitrary sleeps, `waitForTimeout`, manual polling, and retry-based flakiness fixes.
8. Use accessible queries before `data-testid`.
9. Keep mocks minimal and local; do not mock the component under test.

---

## 2. Testing Layers

| Layer | Tools | Purpose |
| --- | --- | --- |
| Unit tests | Vitest | Pure logic, validators, utilities, formatting, policy functions |
| Component tests | Vitest + React Testing Library + `@testing-library/jest-dom` | Synchronous React component behavior and DOM assertions |
| Integration tests | Vitest + real PostgreSQL test DB | Service/database behavior, constraints, transactions, auth/organization data rules |
| Public E2E | Playwright | Browser-level public route/query behavior without DB state |
| Protected E2E | Playwright + PostgreSQL test DB | Real browser/session/protected-route behavior using `DATABASE_URL_TEST` |

### What Belongs In Vitest

- Pure functions and validation.
- Utility behavior, formatting, policy evaluation, state transitions.
- Synchronous React components using React Testing Library.
- DB-backed integration tests that intentionally use `DATABASE_URL_TEST`.

### What Should Not Be Forced Into Vitest

- Async Server Components.
- Async App Router pages.
- Async App Router layouts.
- Redirect/session behavior that depends on real Next.js routing and browser state.
- Auth cookie/session flows.

Use Playwright for those surfaces instead. This keeps Vitest focused and avoids unsupported App Router patterns in unit tests.

---

## 3. Commands

| Command | Purpose |
| --- | --- |
| `npm run test` | Runs Vitest unit/component tests with `vitest.config.unit.ts`. DB-free. |
| `npm run test:watch` | Runs unit/component tests in watch mode. |
| `npm run test:coverage` | Runs unit/component coverage. |
| `npm run test:db:up` | Starts the PostgreSQL test database. |
| `npm run test:db:migrate` | Applies migrations to the test database. |
| `npm run test:integration` | Runs DB-backed Vitest integration tests. |
| `npm run test:e2e` | Runs public Playwright E2E tests only. DB-free. Currently targets `e2e/public-auth.spec.ts`. |
| `npm run test:e2e:protected` | Runs protected DB-backed Playwright E2E through `scripts/run-protected-e2e.ts`. Requires `DATABASE_URL_TEST`. |
| `npm run test:all` | Runs unit tests, then integration tests. It does not run E2E. |

Protected E2E local flow:

```bash
npm run test:db:up
npm run test:db:migrate
npm run test:e2e:protected
```

Fresh machines or CI may need Playwright browsers installed:

```bash
npx playwright install chromium
```

Linux CI may need browser system dependencies too:

```bash
npx playwright install --with-deps chromium
```

---

## 4. Vitest Guidance

Unit/component tests use `vitest.config.unit.ts`.

- `npm run test` must remain DB-free.
- `e2e/**` is excluded so Vitest does not collect Playwright specs.
- `*.integration.test.ts` is excluded from unit tests.
- Use `@testing-library/jest-dom` matchers for explicit DOM assertions.
- Keep module mocks local to the test file unless there is a clear shared helper.
- Do not mock the component under test.
- Avoid asserting private implementation details such as internal hook calls when user-visible output or effects are available.

Integration tests use `vitest.config.integration.ts`.

- Integration tests are intentionally DB-backed.
- They must use the test database via `DATABASE_URL_TEST`.
- They should clean only records they create.
- They should prove database behavior that cannot be trusted to mocks, such as constraints, transactions, access relationships, and idempotency.

---

## 5. React Testing Library Guidance

Use React Testing Library for synchronous component behavior.

Preferred query order:

1. `getByRole` with accessible name.
2. `getByLabelText`.
3. `getByText` for stable user-facing copy.
4. `data-testid` only when no accessible query represents the behavior.

Good RTL targets:

- Form field presence and labels.
- Buttons and links with stable accessible names.
- Error/success states rendered by a component.
- Component-level routing links.
- Stable shell/navigation rendering.

Avoid RTL for:

- Full App Router redirect behavior.
- Async Server Component/page/layout invocation.
- Auth session and cookie persistence.
- Browser navigation flows.

---

## 6. Playwright E2E

Playwright is configured in `playwright.config.ts`.

- `testDir` is `./e2e`.
- Chromium is the configured browser project.
- The dev server is started with `npm run dev`.
- Screenshots are captured on failure.
- Traces are captured on first retry.
- CI retries are enabled.

Use Playwright for browser-level behavior:

- App Router route behavior.
- Redirects and query sanitization.
- Auth/session behavior.
- Protected route access.
- Async Server Component/page/layout behavior.

Do not use arbitrary sleeps or `waitForTimeout`. Rely on Playwright's auto-waiting and web-first assertions.

### Public E2E

Public E2E is DB-free and currently lives in `e2e/public-auth.spec.ts`.

Current coverage:

- `/register` redirects to `/sign-up`.
- `/login` alias preserves safe redirect targets.
- External redirect targets are sanitized.
- Reset-password token, missing-token, and invalid-token states.
- Verify-email success/error states.

Rules:

- Keep public E2E DB-free.
- Prefer public route/query behavior that can run without fixtures.
- Keep these tests fast and stable.

### Protected E2E

Protected E2E is DB-backed and currently lives in `e2e/protected-auth.spec.ts`.

Current coverage:

- Unauthenticated `/dashboard` redirects to sign-in.
- Verified regular user can access `/dashboard`.
- Verified admin can access `/admin`.
- Verified regular user is denied `/admin`.
- Verified venue owner can access `/dashboard/venue`.
- Admin without organization membership is denied `/dashboard/venue`.

Rules:

- Use `npm run test:e2e:protected`.
- Keep protected E2E using `DATABASE_URL_TEST`.
- Do not run protected E2E against dev or production databases.
- Keep protected E2E serial unless test data isolation is proven safe.
- Create only test-owned records.
- Clean only test-owned records.

---

## 7. Protected E2E Database Rules

`scripts/run-protected-e2e.ts` owns protected E2E environment setup.

It:

- Requires `DATABASE_URL_TEST`.
- Validates that the URL is PostgreSQL.
- Rejects `DATABASE_URL_TEST` when it points to the same database as `DATABASE_URL`.
- Runs Playwright against `e2e/protected-auth.spec.ts` with `--workers=1`.
- Starts the app with test DB environment variables.

Database setup remains explicit. Do not hide migrations in Playwright global setup.

Required local setup:

```bash
npm run test:db:up
npm run test:db:migrate
npm run test:e2e:protected
```

Cleanup guidance:

- Track IDs for records created by E2E tests.
- Delete created organizations first so organization-owned venue/member records cascade.
- Delete created users after organizations.
- Delete related verification rows by created email.
- Do not truncate or reset the whole test DB from E2E cleanup.

---

## 8. Critical Domain Scenarios

The following areas remain the highest-value DB integration or E2E targets as the product grows.

### Anti Double-Booking

This is the highest marketplace risk. Test with real database behavior.

- Reject a booking for an already occupied slot.
- Reject partial overlaps.
- Allow the same time on different courts.
- Allow rebooking after cancellation when the slot is released.
- Prove race-condition handling with concurrent requests.

### Payment Webhook Idempotency

- Payment success confirms the booking and creates ledger entries.
- Replaying the same webhook only processes once.
- Invalid callback tokens are rejected.
- Expired payment events release pending bookings correctly.

### Ledger Accuracy

- Confirmed booking records gross, commission, and net amounts correctly.
- Refunds create the correct debit entries.
- Venue balance equals the sum of ledger credits minus debits.
- Use integer/BigInt arithmetic, not floats.

### Payment Retry

- Existing active checkout URL remains available while payment is pending.
- Failed payment can be retried before booking expiry.
- Late success from an older payment attempt is ignored.

### Refund, Withdrawal, Admin Ops

- Refund success/failure affects ledger and status correctly.
- Withdrawal paid/failed behavior is idempotent.
- Manual adjustments require reasons and audit logs.
- Staff permissions are enforced after revoke.

---

## 9. Test Data

General rules:

- Prefer factories/helpers for repeated integration fixtures.
- Keep generated emails/slugs/IDs unique per test run.
- Clean records created by the test, not unrelated database state.
- Do not seed or reset the development database from tests.
- Avoid depending on global seed data unless the test is specifically validating seed behavior.

For protected E2E, keep fixture creation local and explicit unless repetition justifies a helper. The current protected auth E2E creates Better Auth users through the app auth endpoint, then prepares only the DB rows needed for the protected route under test.

---

## 10. Hybrid TDD Guidance

Use TDD where behavior is precise and high-risk:

| Area | Approach | Reason |
| --- | --- | --- |
| Service layer | TDD | Requirements are explicit and risk is high |
| Pure functions | TDD | Inputs/outputs are deterministic |
| Database constraints | TDD | Constraints must be proven against PostgreSQL |
| State transitions | TDD | Acceptance criteria map naturally to tests |
| UI composition | Test-after or E2E | Design changes frequently |
| Third-party internals | Do not test | Owned by the library/provider |

Test work is part of implementation work for service-layer behavior. It should not be deferred to a separate hardening task when the behavior affects money, booking integrity, permissions, or auditability.

---

## 11. Coverage Targets

Coverage targets are pragmatic:

| Layer | Target | Notes |
| --- | --- | --- |
| Service layer | 80%+ | Booking, payment, ledger, webhook, and permissions are most important |
| Utils and validators | 90%+ | Pure functions are cheap to test |
| API/routes with business behavior | 70%+ | Prefer integration or E2E depending on the behavior |
| UI components | No blanket target | Cover stable components and critical states |
| Overall | 60-70% | Do not chase low-value coverage |

High coverage on booking, webhook, and ledger code is more valuable than broad low-signal UI coverage.

---

## 12. CI Guidance

Recommended CI stages:

1. Install dependencies with `npm ci`.
2. Run `npm run typecheck`.
3. Run `npm run lint`.
4. Run `npm run test`.
5. Start the PostgreSQL test service.
6. Run `npm run test:db:migrate`.
7. Run `npm run test:integration`.
8. Install Playwright browsers if needed.
9. Run `npm run test:e2e`.
10. Run `npm run test:e2e:protected` when CI has a prepared isolated test DB and safe environment variables.

Browser install examples:

```bash
npx playwright install chromium
```

or, on Linux CI when browser dependencies are missing:

```bash
npx playwright install --with-deps chromium
```

Future CI should upload Playwright traces/screenshots on failure. Protected E2E must never point at a shared dev/prod database in CI.

---

## 13. Summary Decisions

| Decision | Choice |
| --- | --- |
| Unit/component framework | Vitest |
| Component assertions | React Testing Library + `@testing-library/jest-dom` |
| Browser E2E | Playwright |
| Test database | Real PostgreSQL through Docker |
| Public E2E | DB-free |
| Protected E2E | DB-backed with `DATABASE_URL_TEST` |
| App Router async route testing | Prefer Playwright, not Vitest |
| Mocking | Minimal and local |
| Snapshots | Avoid large snapshots and snapshot-only tests |
