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

## Implementation Notes

- Implemented in `lib/organizations/owner-invitation-service.ts`.
- The installed Better Auth Organization plugin exposes `createInvitation` at `/organization/invite-member`, but that create endpoint requires the caller to already be an Organization member with invitation permissions. QuickCourt's P2-03 service keeps the invite action Super Admin-controlled by validating the Super Admin actor itself and writing a Better Auth-compatible pending `Invitation` row.
- Acceptance uses Better Auth's `acceptInvitation` behavior, which updates invitation status and creates the `Member` row from the invitation role. DB integration coverage verifies accepted owner invitations create `Member.role === "owner"` and are visible through existing Organization membership access helpers.
- Better Auth's observed default invitation expiration is 48 hours (`60 * 60 * 48` seconds); P2-03 mirrors that default.
- Duplicate safety is enforced by `member(organizationId, userId)` uniqueness and a partial unique index on pending owner invitations per Organization/email. The service cancels expired pending owner invitations before creating a fresh one.
- P2-03 emits owner invitation email payload data with an accept URL, but final templates/provider dispatch remain in P2-13. The invitation id is only present inside the accept URL, not as a separate payload field.
- Audit logs are written for owner invitation creation and the service acceptance wrapper. Invitation audit metadata hashes the email and invitation id, and stores the email domain rather than the full address.

## Definition of Done

Owner invitation is an admin-controlled flow that produces an Organization owner membership and unlocks venue onboarding access.
