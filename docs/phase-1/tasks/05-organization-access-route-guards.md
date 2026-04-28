# P1-05 — Organization Access & Route Guards

## Goal

Implement access helper foundations and route guards for user dashboard, venue dashboard, and admin dashboard without implementing full venue onboarding or owner invitation UI.

## Context

QuickCourt uses different access boundaries:

- Customer/user dashboard access is based on authenticated session.
- Super Admin access is based on admin role.
- Venue Owner/Staff access is based on Organization membership.

Phase 1 must establish these access checks so later venue onboarding and management features do not invent inconsistent authorization logic.

## Scope

- Helper to require authenticated user.
- Helper to check admin role.
- Helper to check organization membership.
- Helper to check venue dashboard access.
- Route guards/middleware for:
  - `/dashboard/*`
  - `/dashboard/venue/*`
  - `/admin/*`
- Unauthorized and forbidden behavior.
- Development/test seed organization support for guard verification.

P1-05 owns access helper and guard implementation. P1-08 owns the final shared behavior coverage for these helpers and guards.

## Out of Scope

- Super Admin create Organization UI.
- Owner invitation UI.
- Staff invitation UI.
- Branch-level permission editor.
- Per-feature venue permissions.
- Venue onboarding forms.

## Dependencies

- P1-04 Auth & Account Foundation.

## Implementation Steps

1. Define access model helpers:
   - `requireUser()`
   - `requireAdmin()`
   - `getOrganizationMembershipsForUser()`
   - `requireAnyOrganizationMember()`
   - `requireOrganizationOwner()` where needed for future use.
2. Implement route guard behavior:
   - Unauthenticated user to `/dashboard/*` redirects to login.
   - Authenticated user can access base `/dashboard`.
   - `/admin/*` requires admin role.
   - `/dashboard/venue/*` requires organization membership.
3. Ensure venue dashboard access checks membership, not `User.role`.
4. Add unauthorized/forbidden pages or response patterns:
   - unauthenticated: redirect to login.
   - authenticated but insufficient access: forbidden page.
5. Add development/test seed organization membership if needed to test owner/staff access.
6. Document future Milestone 2 integration points for owner invitation and staff permissions.

## Files / Modules

Likely touched:

```text
lib/auth/access.ts
lib/auth/guards.ts
middleware.ts
app/(dashboard)/layout.tsx
app/(venue-dashboard)/layout.tsx
app/(admin)/layout.tsx
app/unauthorized/page.tsx
app/forbidden/page.tsx
prisma/seed.ts
```

## Access Rules

| Area               | Route                                    | Required Access     |
| ------------------ | ---------------------------------------- | ------------------- |
| Public marketplace | `/venues`, `/venues/*`                   | Public              |
| User dashboard     | `/dashboard`, `/dashboard/*`             | Authenticated user  |
| Venue dashboard    | `/dashboard/venue`, `/dashboard/venue/*` | Organization member |
| Admin dashboard    | `/admin`, `/admin/*`                     | Admin role          |

## Acceptance Criteria

- [ ] Unauthenticated users cannot access `/dashboard/*`, `/dashboard/venue/*`, or `/admin/*`.
- [ ] Authenticated users can access `/dashboard`.
- [ ] Non-admin users cannot access `/admin`.
- [ ] Admin users can access `/admin`.
- [ ] Users without organization membership cannot access `/dashboard/venue`.
- [ ] Users with organization membership can access `/dashboard/venue`.
- [ ] Venue access does not rely on `User.role`.
- [ ] Helper functions are reusable by later service/page code.
- [ ] No owner invitation or organization creation UI is added.

## Test Plan

- Unit test access helper logic with mocked session/user/member data.
- Integration test route guard behavior if feasible.
- Seed/test admin user can access admin shell.
- Seed/test organization member can access venue shell.
- Regular user receives forbidden/redirect for venue/admin shells.
- Final shared behavior coverage is completed in P1-08.

## Edge Cases

- User has multiple organization memberships.
- User has inactive/suspended account in later milestone.
- Organization membership exists but organization is later disabled/suspended.
- Admin user also has organization membership.

## Risks

- Confusing `User.role` admin access with organization owner access.
- Implementing staff permission system too early.
- Blocking future Better Auth Organization Plugin invitation flow by hardcoding custom membership logic.

## Done When

Access helpers and route guards enforce Phase 1 route boundaries and are ready to support Milestone 2 organization invitation and venue onboarding.
