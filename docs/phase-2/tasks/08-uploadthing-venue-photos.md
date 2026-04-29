# P2-08 — Uploadthing Venue Photos

## Goal

Add venue-level photo upload and management through Uploadthing.

## Context

Technical Spec selects Uploadthing for MVP image upload. Phase 2 should exercise venue photo upload before approval and marketplace publishing.

## Scope

- Uploadthing route/config for venue images.
- Uploadthing dependency and env documentation if missing.
- Owner-only upload authorization.
- Store uploaded URLs in `VenuePhoto`.
- Venue-level photo list.
- Set one venue-level cover photo.
- Remove photo row from the database using current schema.
- Require at least one venue-level photo for Phase 2 completeness.

## Out of Scope

- Court photos.
- Remote file lifecycle cleanup.
- Image editing/cropping.
- Marketplace gallery.

## Dependencies

- P2-05 Venue Draft Service.

## Implementation Steps

1. Install Uploadthing if missing.
2. Add Uploadthing env variables to `.env.example` if missing and document server/client exposure boundaries.
3. Configure image upload constraints:
   - JPEG, PNG, WebP.
   - 4MB max per file.
4. Authorize upload by Organization owner membership.
5. Persist `VenuePhoto` rows with public image URL.
6. Support cover photo selection while preserving unique cover constraints.
7. Delete `VenuePhoto` rows for removal; do not imply soft delete unless a migration adds `deletedAt`.
8. Return photo DTOs for onboarding UI.
9. Add safe error handling for upload failures.

## Acceptance Criteria

- Owner can upload venue-level photos for their draft Venue.
- Owner cannot upload photos for unrelated venues.
- At most one venue-level cover photo is active.
- Photo removal deletes the `VenuePhoto` row and does not require remote Uploadthing cleanup in Phase 2.
- At least one venue-level photo is counted as required for Phase 2 onboarding completeness.
- Full Uploadthing secrets are not exposed to client code.

## Test Requirements

- Unit tests for photo DTO/validation logic where DB-free.
- DB integration tests for photo persistence, ownership, and cover uniqueness where feasible.
- Upload handler smoke tests where feasible.

## Definition of Done

Venue photo upload is wired into onboarding and ready to support future marketplace gallery work.
