# P2-11 — Manual Bank Verification

## Goal

Allow Super Admin to manually verify or reject venue bank accounts using the current boolean verification schema.

## Context

Phase 2 does not integrate automated bank verification. Super Admin review is enough for MVP onboarding, provided actions are audited and account numbers stay masked. Current schema only has `isVerified Boolean`, so rejection is represented by `isVerified = false` plus audit metadata.

## Scope

- Admin service to mark bank account verified.
- Admin service to reject/unverify bank account by setting `isVerified = false`.
- Rejection reason in audit metadata.
- Admin UI surface under `/admin/venues` or venue detail/admin panel.
- Censored audit logs.

## Out of Scope

- Automated bank account validation.
- Withdrawal enablement.
- Payout processing.
- Approval/publish workflow.

## Dependencies

- P2-10 Bank Account Management.

## Implementation Steps

1. Define verification service functions.
2. Require Super Admin access.
3. Load bank account with Venue context.
4. Mark `isVerified = true` or `false` according to action.
5. Record rejection reason in audit metadata when rejecting.
6. Return masked DTOs.
7. Add minimal admin UI controls if in scope for the implementation slice.

## Acceptance Criteria

- Super Admin can verify a bank account.
- Super Admin can reject or unverify a bank account by setting `isVerified = false`.
- Rejected and unverified are not separate persisted states in Phase 2.
- Non-admin users cannot verify bank accounts.
- Verification actions are audited.
- Audit and UI payloads do not expose full account numbers.

## Test Requirements

- Unit tests for validation where DB-free.
- DB integration tests for admin-only access, status changes, masked DTOs, and audit logs.
- Page/component smoke tests where admin UI is added.

## Definition of Done

Manual bank verification is available to Super Admin and remains isolated from withdrawal and venue approval behavior.
