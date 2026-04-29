# P2-05 — Venue Draft Service

## Goal

Implement the service layer for creating and updating a draft Venue owned by an Organization.

## Context

After accepting owner invitation, the owner needs a draft Venue record tied to their Organization. The Venue remains `draft` throughout Phase 2.

## Scope

- Create draft Venue for an owner Organization.
- Update venue profile fields:
  - name
  - slug
  - description
  - legal business name
  - tax number if retained for MVP
- Enforce one Venue per Organization.
- Owner-only mutation checks.
- Audit important profile changes.

## Out of Scope

- Venue approval.
- Marketplace visibility.
- Court, pricing, schedule, availability.
- Public venue listing/detail.
- Multi-venue per Organization.

## Dependencies

- P2-03 Owner Invitation Flow.

## Implementation Steps

1. Define validation schemas for draft venue profile input.
2. Require Organization owner membership for create/update.
3. Create Venue with `status = draft`.
4. Generate or validate unique slug.
5. Prevent creating a second Venue for the same Organization.
6. Update allowed draft fields.
7. Write audit logs for create/update with safe before/after data.
8. Return owner-facing DTOs.

## Acceptance Criteria

- Owner can create one draft Venue for their Organization.
- Owner can update draft profile fields.
- Unrelated users and staff cannot mutate owner-only draft profile data.
- Venue status remains `draft`.
- Duplicate Venue per Organization is rejected safely.
- Audit logs exist for create/update.

## Test Requirements

- Unit tests for validation and slug behavior where DB-free.
- DB integration tests for owner access, one Venue per Organization, status, and audit logs.

## Definition of Done

Owners can persist and update the core draft Venue profile required for Phase 2 onboarding.
