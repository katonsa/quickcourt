# P2-10 — Bank Account Management

## Goal

Implement owner-managed venue bank accounts with strict masking, `accountNumberLast4`, primary-account rules, soft delete, and audit.

## Context

Venue bank account data is sensitive. The schema stores `accountNumber` and `accountNumberLast4`; Phase 2 must ensure normal app boundaries use masked data.

## Scope

- Owner can create bank account.
- Owner can update bank account.
- Owner can soft-delete bank account.
- Owner can set one primary active bank account.
- Derive and persist `accountNumberLast4`.
- Return masked bank account DTOs.
- Audit create/update/delete/primary changes with censored before/after data.

## Out of Scope

- Full bank account encryption.
- Withdrawal.
- Xendit payout account validation.
- Automatic bank verification.

## Dependencies

- P2-05 Venue Draft Service.

## Implementation Steps

1. Define bank account input validation.
2. Add a helper to derive last four digits from the normalized account number.
3. Add a helper to return masked display values.
4. Require Organization owner access to the Venue.
5. Create/update `VenueBankAccount` and persist `accountNumberLast4`.
6. Enforce one active primary account per Venue.
7. Soft-delete accounts instead of hard delete.
8. Reset `isVerified` when sensitive account fields change.
9. Write audit logs with censored data only.

## Acceptance Criteria

- Owner can add a bank account.
- Owner can update non-deleted bank accounts for their Venue.
- `accountNumberLast4` is persisted on create/update.
- Service/API DTOs do not expose full account numbers.
- Only one active primary bank account exists per Venue.
- Sensitive bank account changes reset verification where appropriate.
- Audit logs do not contain full account numbers.

## Test Requirements

- Unit tests for normalization, last-four derivation, masking, and audit censoring.
- DB integration tests for owner access, primary uniqueness, soft delete, verification reset, and audit logs.

## Definition of Done

Owners can manage bank accounts safely enough for Phase 2, with full account numbers contained behind service boundaries.
