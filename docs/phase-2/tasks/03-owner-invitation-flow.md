# P2-03 — Owner Invitation Flow

## Goal

Allow Super Admin to invite an already-registered user as venue owner for an Organization and ensure accepted invitations grant venue dashboard access.

## Context

Venue Owner access is Organization membership with role `owner`. Phase 2 invitation is admin-controlled and does not support inviting unknown emails into account creation.

## Scope

- Invite an existing user account as Organization owner.
- Owner invitation service event and email payload data.
- Invitation acceptance path using Better Auth Organization invitation behavior where practical.
- Access verification after acceptance.
- Audit logs for invite and acceptance where feasible.

## Out of Scope

- Inviting unregistered emails.
- Staff invitation.
- Branch permission assignment.
- Owner self-service Organization creation.
- Admin UI.

## Dependencies

- P2-02 Organization Admin Service.

## Implementation Steps

1. Confirm the installed Better Auth Organization invitation API and local conventions.
2. Validate Super Admin actor.
3. Validate invited user exists.
4. Prevent duplicate active owner invitations where practical.
5. Emit or call the owner invitation email path owned by P2-13 without owning template/provider implementation here.
6. Ensure accepted invitation creates `Member.role === "owner"`.
7. Verify owner access to `/dashboard/venue` uses Organization membership.
8. Add audit logs for invite and acceptance events where available.

## Acceptance Criteria

- Super Admin can invite an existing user as owner.
- Inviting an unknown email returns a safe validation error.
- Invitation acceptance grants Organization owner membership.
- Accepted owner can pass venue dashboard access checks.
- Regular users cannot invite owners.
- Invitation payloads do not expose sensitive tokens outside intended links.

## Test Requirements

- Unit tests for validation and access checks.
- DB integration tests for invitation creation/acceptance membership behavior where feasible.
- Tests for owner invitation event/payload routing; template/provider tests are owned by P2-13.

## Definition of Done

Owner invitation is an admin-controlled flow that produces an Organization owner membership and unlocks venue onboarding access.
