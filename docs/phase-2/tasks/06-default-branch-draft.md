# P2-06 — Default Branch Draft

## Goal

Auto-create and update the default branch for a draft Venue.

## Context

QuickCourt is branch-ready, but MVP Phase 2 UI focuses on a single default branch. The database already supports `VenueBranch.isDefault` and a partial unique index for one default branch per venue.

## Scope

- Auto-create default branch when needed for a draft Venue.
- Update default branch fields:
  - name
  - city
  - address
  - latitude/longitude if provided
  - Google Maps place/embed fields
  - timezone
  - phone/email
- Owner-only mutation checks.
- Audit important branch changes.

## Out of Scope

- Multi-branch UI.
- Branch suspension/closure workflow.
- Court creation.
- Schedule/pricing setup.

## Dependencies

- P2-05 Venue Draft Service.

## Implementation Steps

1. Define default branch validation schema.
2. Require Organization owner access to the Venue.
3. Create default branch if missing.
4. Update default branch fields.
5. Preserve partial unique index behavior for one active default branch.
6. Return branch DTO for onboarding UI.
7. Write audit logs for create/update.

## Acceptance Criteria

- Draft Venue has a default branch during onboarding.
- Owner can update default branch data.
- City must reference seeded/read-only `City`.
- Default branch uniqueness is preserved.
- No multi-branch management UI or service behavior is introduced.

## Test Requirements

- Unit tests for validation where DB-free.
- DB integration tests for auto-create, update, city relation, owner access, and unique default branch behavior.

## Definition of Done

The Phase 2 venue draft has a reliable default branch without introducing full branch management.
