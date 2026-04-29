# QuickCourt Phase 2 — Organization & Venue Profile Onboarding

## Purpose

Phase 2 turns the Phase 1 identity, organization, and route-guard foundation into the first venue-owner onboarding workflow.

QuickCourt does not allow users to self-promote into venue owners. Super Admin creates the Organization, invites an already-registered user as owner, and the owner completes the first venue draft profile.

## Phase Objective

By the end of Phase 2, the app must support this vertical slice:

```text
Super Admin can create a venue Organization and invite a registered user as owner.
The owner can accept the invitation and access /dashboard/venue.
The owner can create and maintain a draft venue profile with one default branch.
The owner can upload venue photos, select sports/facilities, and manage bank accounts.
Super Admin can manually verify or reject venue bank accounts.
The system keeps sensitive bank account data masked at app boundaries and audit logs.
```

## Scope

Phase 2 includes:

- Super Admin organization creation for venue onboarding.
- Owner invitation for already-registered users.
- Owner invitation service event; email template/provider wiring is owned by P2-13.
- Owner access to `/dashboard/venue` after invitation acceptance.
- Venue draft creation and update.
- Default branch auto-creation and update.
- Venue onboarding UI at `/dashboard/venue/onboarding`.
- Venue photos through Uploadthing.
- Read-only seeded master data selection for `Sport`, `City`, and `Facility`.
- Venue sport and facility mapping.
- Venue bank account create/update/soft-delete behavior.
- One primary bank account per active venue.
- `accountNumberLast4` persistence for masked display and audit.
- Bank account masking in service/API/UI/audit payloads.
- Manual bank account verification by Super Admin.
- Minimal onboarding status email where useful.
- Unit and DB integration tests for Phase 2 service-layer behavior.

## Out of Scope

Phase 2 does not include:

- Venue approval or publish to marketplace.
- Public marketplace visibility for draft venues.
- Court CRUD.
- Operating hours, pricing, slot calculation, and availability blocks.
- Booking, payment, webhook, ledger, refund, withdrawal, or support workflows.
- Staff invitation and branch permission editor.
- Super Admin CRUD for master data.
- Self-service venue-owner registration.
- Full bank account encryption.

## Key Decisions

See [`decision-log.md`](./decision-log.md).

Important Phase 2 decisions:

- Owner invitation supports already-registered users only.
- Admin onboarding entry point lives under `/admin/venues`.
- `Sport`, `City`, and `Facility` are seeded/read-only in Phase 2.
- Venue onboarding completeness requires at least one venue-level photo.
- Branch photo is optional in Phase 2.
- `VenueBankAccount.accountNumberLast4` is stored for masked display, censored audit, and manual verification.
- Full bank account encryption is deferred, but full account numbers must not cross normal service/API/UI/audit boundaries.
- Phase 2 ends at draft venue onboarding and bank verification, not approval or publish.

## Status Workflow

Phase 2 task status uses the same engineering-board workflow as Phase 1:

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

1. [`P2-01 Phase 2 Docs & Decision Log`](./tasks/01-phase-2-docs-and-decision-log.md)
2. [`P2-02 Organization Admin Service`](./tasks/02-organization-admin-service.md)
3. [`P2-03 Owner Invitation Flow`](./tasks/03-owner-invitation-flow.md)
4. [`P2-04 Admin Venue Onboarding UI`](./tasks/04-admin-venue-onboarding-ui.md)
5. [`P2-05 Venue Draft Service`](./tasks/05-venue-draft-service.md)
6. [`P2-06 Default Branch Draft`](./tasks/06-default-branch-draft.md)
7. [`P2-07 Venue Onboarding UI`](./tasks/07-venue-onboarding-ui.md)
8. [`P2-08 Uploadthing Venue Photos`](./tasks/08-uploadthing-venue-photos.md)
9. [`P2-09 Sport & Facility Mapping`](./tasks/09-sport-facility-mapping.md)
10. [`P2-10 Bank Account Management`](./tasks/10-bank-account-management.md)
11. [`P2-11 Manual Bank Verification`](./tasks/11-manual-bank-verification.md)
12. [`P2-12 Onboarding Status Service`](./tasks/12-onboarding-status-service.md)
13. [`P2-13 Minimal Onboarding Emails`](./tasks/13-minimal-onboarding-emails.md)
14. [`P2-14 Phase 2 Behavior Test Coverage`](./tasks/14-phase-2-behavior-test-coverage.md)

Some service work can run in parallel after P2-02/P2-03, but UI should remain dependency-aware. Bank account management and verification should not start until the bank-account masking contract is agreed and documented.
Implementation work after P2-01 should not begin until Phase 1 is fully `Done`, including P1-08 behavior coverage, unless a decision-log entry explicitly allows a narrow exception.

## Definition of Done for Phase 2

Phase 2 is done when:

- All task specs in [`breakdown.md`](./breakdown.md) are `Done`.
- Phase 1 is `Done`, including P1-08 behavior coverage.
- Typecheck, lint, unit tests, DB integration tests, migration verification, and relevant smoke checks pass.
- Super Admin can create a venue Organization and invite an already-registered owner.
- Owner invitation acceptance grants venue dashboard access through Organization membership.
- Owner can create/update a draft venue and default branch.
- Owner can select seeded sports and facilities.
- Owner can upload and manage at least one venue photo.
- Owner can add/update/soft-delete bank accounts and set one active primary account.
- Bank account responses, UI state, logs, and audit payloads never expose full account numbers.
- Super Admin can manually verify or reject bank accounts with audit logs.
- Phase 2 onboarding status is computable and excludes Phase 3 operational requirements.
- No Phase 3+ feature is implemented accidentally.
