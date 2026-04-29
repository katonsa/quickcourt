# P2-04 — Admin Venue Onboarding UI

## Goal

Create the Super Admin UI entry point for starting venue onboarding from `/admin/venues`.

## Context

The admin route convention already includes `/admin/venues`. Phase 2 should use venue language in the UI while creating the underlying Better Auth Organization boundary.

## Scope

- `/admin/venues` UI for creating a venue Organization.
- Owner invitation form for already-registered users.
- Display basic created/invited state.
- Safe error and success states.
- Access restricted to Super Admin.

## Out of Scope

- Venue approval/rejection.
- Published venue management.
- Master data CRUD.
- Transaction/admin ops.
- Staff invitation.

## Dependencies

- P2-02 Organization Admin Service.
- P2-03 Owner Invitation Flow.

## Implementation Steps

1. Review existing admin shell from Phase 1.
2. Add admin page or component under `/admin/venues`.
3. Use service functions/server actions for create Organization and invite owner.
4. Validate forms with shared schemas.
5. Show safe user-facing errors for duplicate Organization, unknown invitee, and permission denial.
6. Keep UI focused on starting onboarding, not reviewing/publishing venues.

## Acceptance Criteria

- Only Super Admin can access and submit the UI.
- Admin can create a venue Organization.
- Admin can invite an existing user as owner.
- UI explains invite status without exposing tokens or internal auth data.
- No approval or publish controls exist.

## Test Requirements

- Component/page smoke tests where feasible.
- Service tests from P2-02 and P2-03 remain the source of truth.
- Access smoke for admin-only route behavior where feasible.

## Definition of Done

Super Admin has a usable Phase 2 admin entry point to create the Organization and invite the owner.
