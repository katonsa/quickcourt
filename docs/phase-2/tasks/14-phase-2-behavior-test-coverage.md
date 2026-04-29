# P2-14 — Phase 2 Behavior Test Coverage

## Goal

Add the final Phase 2 behavior coverage after the underlying services and UI exist.

## Context

Each Phase 2 task should add focused tests while implementing service behavior. P2-14 is the final coverage pass to catch cross-task gaps and document any remaining browser/E2E limitations.

## Scope

- Organization creation coverage.
- Owner invitation and acceptance coverage.
- Venue draft and default branch coverage.
- Sport/facility mapping coverage.
- Venue photo coverage where feasible.
- Bank account masking, `accountNumberLast4`, primary account, verification, and audit coverage.
- Permission boundary coverage.
- Page/component smoke tests where feasible.

## Out of Scope

- Full Playwright E2E journey unless the project enables it early.
- Booking/payment/ledger/refund/withdrawal coverage.
- Phase 3 approval workflow coverage.

## Dependencies

- P2-02 through P2-13.

## Implementation Steps

1. Review tests added by each Phase 2 task.
2. Identify missing behavior coverage against Phase 2 acceptance criteria.
3. Add unit tests for pure helpers and validation gaps.
4. Add DB integration tests for membership, ownership, persistence, masking, and audit gaps.
5. Add page/component smoke tests where useful and stable.
6. Document browser/E2E gaps if they remain deferred.
7. Run typecheck, lint, unit tests, and DB integration tests.

## Acceptance Criteria

- Phase 2 critical service behavior is covered.
- Permission boundaries are tested for admin, owner, regular user, and unrelated member cases.
- Bank account full-number leakage is tested at DTO/audit boundaries.
- `accountNumberLast4` derivation and persistence are tested.
- Remaining E2E/browser gaps are documented.

## Test Requirements

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run test:integration`
- Migration/constraint verification where schema or constraints changed.

## Definition of Done

Phase 2 has reliable automated coverage for its onboarding, invitation, access, and bank-account security behavior.
