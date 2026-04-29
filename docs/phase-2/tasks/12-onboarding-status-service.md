# P2-12 — Onboarding Status Service

## Goal

Compute Phase 2 onboarding completeness for a draft Venue without including Phase 3 operational readiness.

## Context

Phase 2 needs to show owners what profile onboarding data is complete. Phase 3 will add court, schedule, pricing, and approval readiness.

## Scope

- Service to compute Phase 2 status sections:
  - Organization owner exists.
  - Venue profile complete.
  - Default branch complete.
  - At least one venue photo exists.
  - At least one sport selected.
  - Facilities selected where optional.
  - Primary bank account exists.
  - Primary bank account verified.
- Owner/admin-readable DTO.
- UI-ready labels/status values.

## Out of Scope

- Operational readiness validation.
- Submit for approval.
- Court/schedule/pricing completeness.
- Marketplace publish eligibility.

## Dependencies

- P2-05 Venue Draft Service.
- P2-06 Default Branch Draft.
- P2-08 Uploadthing Venue Photos.
- P2-09 Sport & Facility Mapping.
- P2-10 Bank Account Management.
- P2-11 Manual Bank Verification.

## Implementation Steps

1. Define Phase 2 completeness criteria explicitly.
2. Implement a pure status calculator where possible.
3. Add DB-backed loader to gather required counts and flags.
4. Return stable status keys for UI.
5. Avoid names like `approvalReady` unless Phase 3 explicitly owns them.

## Acceptance Criteria

- Status service reports completed/missing sections for Phase 2.
- It does not require courts, operating hours, pricing, or approval request data.
- It can be used by owner onboarding UI and admin review UI.
- It uses masked bank data only.

## Test Requirements

- Unit tests for pure status calculation.
- DB integration tests for representative complete/incomplete draft states where useful.

## Definition of Done

The app can communicate Phase 2 onboarding progress without implying final marketplace readiness.
