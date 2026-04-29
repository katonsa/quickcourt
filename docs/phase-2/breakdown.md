# QuickCourt Phase 2 Breakdown

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

| ID    | Task                         | Priority | Status | Depends On          | Spec                                                                                  | Acceptance Summary                                                                                | Test Required                                  |
| ----- | ---------------------------- | -------: | ------ | ------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| P2-01 | Phase 2 Docs & Decision Log  |       P0 | Done   | Phase 1 docs        | [01-phase-2-docs-and-decision-log.md](./tasks/01-phase-2-docs-and-decision-log.md)    | Phase 2 docs, rules, decisions, task board, and task specs exist                                  | Doc review                                     |
| P2-02 | Organization Admin Service   |       P0 | Done   | Phase 1 Done        | [02-organization-admin-service.md](./tasks/02-organization-admin-service.md)           | Super Admin can create venue Organization through service layer with audit                        | Unit + DB integration                          |
| P2-03 | Owner Invitation Flow        |       P0 | Todo   | P2-02               | [03-owner-invitation-flow.md](./tasks/03-owner-invitation-flow.md)                    | Super Admin can invite an already-registered user as owner; acceptance grants venue access        | Unit + DB integration                          |
| P2-04 | Admin Venue Onboarding UI    |       P0 | Todo   | P2-02, P2-03        | [04-admin-venue-onboarding-ui.md](./tasks/04-admin-venue-onboarding-ui.md)            | `/admin/venues` supports organization creation and owner invitation                               | Page/component smoke + service tests           |
| P2-05 | Venue Draft Service          |       P0 | Todo   | P2-03               | [05-venue-draft-service.md](./tasks/05-venue-draft-service.md)                        | Owner can create/update one draft Venue for their Organization                                    | Unit + DB integration                          |
| P2-06 | Default Branch Draft         |       P0 | Todo   | P2-05               | [06-default-branch-draft.md](./tasks/06-default-branch-draft.md)                      | Default branch is auto-created and updateable without multi-branch UI                             | Unit + DB integration                          |
| P2-07 | Venue Onboarding UI          |       P0 | Todo   | P2-05, P2-06        | [07-venue-onboarding-ui.md](./tasks/07-venue-onboarding-ui.md)                        | `/dashboard/venue/onboarding` edits venue profile and default branch draft                        | Page/component smoke + service tests           |
| P2-08 | Uploadthing Venue Photos     |       P1 | Todo   | P2-05               | [08-uploadthing-venue-photos.md](./tasks/08-uploadthing-venue-photos.md)              | Owner can upload/manage venue-level photos; at least one is required for Phase 2 completeness     | Upload handler tests where feasible            |
| P2-09 | Sport & Facility Mapping     |       P0 | Todo   | P2-05               | [09-sport-facility-mapping.md](./tasks/09-sport-facility-mapping.md)                  | Owner can map seeded sports and facilities to venue                                               | Unit + DB integration                          |
| P2-10 | Bank Account Management      |       P0 | Todo   | P2-05               | [10-bank-account-management.md](./tasks/10-bank-account-management.md)                 | Owner can manage masked bank accounts, primary account, `accountNumberLast4`, and audit           | Unit + DB integration                          |
| P2-11 | Manual Bank Verification     |       P0 | Todo   | P2-10               | [11-manual-bank-verification.md](./tasks/11-manual-bank-verification.md)              | Super Admin can verify/reject bank accounts manually with audit                                   | Unit + DB integration + page smoke             |
| P2-12 | Onboarding Status Service    |       P1 | Todo   | P2-05..P2-11        | [12-onboarding-status-service.md](./tasks/12-onboarding-status-service.md)            | Service returns Phase 2 onboarding completeness without Phase 3 operational readiness             | Unit                                           |
| P2-13 | Minimal Onboarding Emails    |       P1 | Todo   | P2-03, P2-11        | [13-minimal-onboarding-emails.md](./tasks/13-minimal-onboarding-emails.md)            | Owner invitation and minimal bank/onboarding status emails use email sender abstraction           | Email sender unit tests                        |
| P2-14 | Phase 2 Behavior Test Coverage |     P0 | Todo   | P2-02..P2-13        | [14-phase-2-behavior-test-coverage.md](./tasks/14-phase-2-behavior-test-coverage.md)  | Final behavior coverage exists for invitation, venue draft, onboarding, bank masking, permissions | Unit + DB integration + smoke where feasible   |

## Workstream View

### Admin & Organization

- P2-02 Organization Admin Service
- P2-03 Owner Invitation Flow
- P2-04 Admin Venue Onboarding UI

### Venue Onboarding

- P2-05 Venue Draft Service
- P2-06 Default Branch Draft
- P2-07 Venue Onboarding UI
- P2-08 Uploadthing Venue Photos
- P2-09 Sport & Facility Mapping
- P2-12 Onboarding Status Service

### Bank Account

- P2-10 Bank Account Management
- P2-11 Manual Bank Verification

### Communication & Testing

- P2-13 Minimal Onboarding Emails
- P2-14 Phase 2 Behavior Test Coverage

## Phase 2 Non-Goals Checklist

These items must not be implemented in Phase 2 unless a decision-log entry explicitly moves them forward:

- Venue approval/publish workflow.
- Public marketplace visibility for draft venues.
- Court management.
- Schedule/pricing/availability management.
- Booking and payment flow.
- Ledger/withdrawal/refund flow.
- Staff invitation and branch permission editor.
- Super Admin master data CRUD.
- Self-service owner onboarding.
- Full bank account encryption.

## Review Checklist

Before marking Phase 2 as `Done`, confirm:

- [ ] No Phase 3+ feature leaked into implementation.
- [ ] Owner invitation requires an already-registered user.
- [ ] Organization creation is Super Admin-only.
- [ ] Venue dashboard access still uses Organization membership, not `User.role`.
- [ ] Draft venue has exactly one Organization boundary.
- [ ] Default branch unique constraint remains enforced.
- [ ] Master data is seeded/read-only in Phase 2.
- [ ] Venue photo upload uses Uploadthing and validates file constraints.
- [ ] Bank account responses are masked and include `accountNumberLast4`.
- [ ] Audit logs for bank changes use censored before/after data.
- [ ] Manual bank verification is Super Admin-only.
- [ ] Typecheck, lint, unit tests, and DB integration tests pass.

## Status and Dependency Notes

- P2-01 is `Done` when this docs folder, task board, rules, and task specs exist.
- P2-02 is implemented by `lib/organizations/organization-admin-service.ts`; duplicate creation is prevented by normalized Organization slug, creation uses the Better Auth organization create endpoint, and no Venue row is created.
- P2-03 should reuse Better Auth Organization invitation behavior where practical, but must preserve QuickCourt's Super Admin-controlled owner model.
- P2-08 can be implemented after P2-05 because venue photos require a persisted Venue.
- P2-10 and P2-11 must preserve the `accountNumberLast4` masking contract introduced before Phase 2 implementation.
- P2-11 bank rejection uses `isVerified = false` plus audit metadata in Phase 2; rejected and unverified are not separate persisted states unless a later migration adds verification status.
- P2-14 is the final Phase 2 behavior coverage pass after the underlying services and UI exist.
