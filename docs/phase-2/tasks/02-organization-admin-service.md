# P2-02 — Organization Admin Service

## Goal

Implement the service-layer foundation for Super Admin-created venue Organizations.

## Context

QuickCourt does not allow self-service owner registration. A Super Admin creates an Organization for a venue onboarding flow, then invites an already-registered user as owner in P2-03.

## Scope

- Super Admin-only service for creating a venue Organization.
- Validation for required organization display/name fields.
- Duplicate prevention where possible.
- Audit log for organization creation.
- Return DTO suitable for admin UI without leaking internal auth details.

## Out of Scope

- Owner invitation acceptance.
- Admin UI.
- Venue draft creation.
- Staff Organizations or branch permission management.
- Self-service Organization creation.

## Dependencies

- P1-04 Auth & Account Foundation.
- P1-05 Organization Access & Route Guards.
- Phase 1 fully `Done`, including P1-07 Testing & CI Harness and P1-08 Phase 1 Behavior Test Coverage.

## Implementation Steps

1. Review Better Auth Organization Plugin APIs used in Phase 1.
2. Define a service function for Super Admin-created venue Organizations.
3. Validate caller access with admin access helpers.
4. Create the Organization through the Better Auth-compatible path.
5. Avoid ordinary-user Organization creation paths.
6. Add an `AuditLog` entry with safe metadata.
7. Return a minimal admin DTO.

## Acceptance Criteria

- Super Admin can create an Organization for a future venue.
- Regular users cannot create Organizations through this service.
- Organization creation is idempotent or duplicate-safe according to documented validation.
- Audit log records actor, action, entity type, entity id, and censored metadata.
- No Venue is required yet unless the service explicitly creates only the Organization boundary.

## Test Requirements

- Unit tests for validation and permission checks where DB-free.
- DB integration tests for Organization creation and audit log persistence.

## Definition of Done

The service layer can create the Organization boundary needed for venue onboarding without exposing self-service owner creation.
