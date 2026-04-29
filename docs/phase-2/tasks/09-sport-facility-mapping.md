# P2-09 — Sport & Facility Mapping

## Goal

Allow owners to select seeded sports and facilities for their draft Venue.

## Context

Phase 2 master data is read-only. Owners only map existing `Sport` and `Facility` records to their Venue.

## Scope

- Read seeded sports and facilities.
- Update `VenueSport` mappings.
- Update `VenueFacility` mappings.
- Owner-only mutation checks.
- Onboarding UI selectors if not already included in P2-07.

## Out of Scope

- Super Admin master data CRUD.
- Custom owner-created sports/facilities.
- Court-level sport assignment.
- Marketplace filtering behavior.

## Dependencies

- P2-05 Venue Draft Service.

## Implementation Steps

1. Define service functions to list active/reference sports and facilities.
2. Define validation for selected IDs.
3. Require owner access to the Venue.
4. Replace mappings transactionally.
5. Reject unknown or inactive reference IDs where applicable.
6. Return selected and available options for UI.

## Acceptance Criteria

- Owner can select one or more sports for the draft Venue.
- Owner can select zero or more facilities for the draft Venue.
- Unknown reference IDs are rejected.
- Unrelated users cannot mutate mappings.
- Master data remains read-only in Phase 2.

## Test Requirements

- Unit tests for validation where DB-free.
- DB integration tests for mapping replacement, owner access, and reference validation.

## Definition of Done

Venue draft can be categorized by seeded sports and facilities without introducing master-data management.
