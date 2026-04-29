# P2-07 — Venue Onboarding UI

## Goal

Create `/dashboard/venue/onboarding` for owners to complete the Phase 2 venue profile and default branch draft.

## Context

Phase 1 provides the venue dashboard shell and membership guard. Phase 2 adds the first real owner workflow inside that shell.

## Scope

- Owner-only onboarding page.
- Venue profile form.
- Default branch form.
- Read-only city selector from seeded data.
- Save states, validation messages, and safe errors.
- Onboarding progress summary based on available service data.

## Out of Scope

- Court setup.
- Schedule/pricing setup.
- Submit for approval.
- Venue preview in marketplace.
- Multi-branch management.

## Dependencies

- P2-05 Venue Draft Service.
- P2-06 Default Branch Draft.

## Implementation Steps

1. Review existing venue dashboard shell and UI conventions.
2. Add route/page for `/dashboard/venue/onboarding`.
3. Load owner Organization and existing draft Venue/default branch.
4. Add forms using shared validation schemas.
5. Wire save actions to service layer.
6. Render status/progress without implying Phase 3 approval readiness.
7. Keep layout production-presentable and workflow-focused.

## Acceptance Criteria

- Owner can open onboarding page after accepting invitation.
- Owner can create/update venue profile and default branch from the UI.
- Regular users and unrelated Organization members cannot access or mutate the flow.
- UI does not include approval/publish, court, pricing, or schedule controls.
- Errors avoid leaking internal authorization details.

## Test Requirements

- Component/page smoke tests where feasible.
- Service tests from P2-05 and P2-06 remain the source of truth.
- Access smoke for owner-only behavior where feasible.

## Definition of Done

Owners have a usable onboarding page for Phase 2 profile and default branch data entry.
