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
- Route guards/proxy as needed for:
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

## Implementation Slices

P1-05 is split into implementation slices so access policy, route behavior, and verification can be reviewed independently. Do not mark P1-05 `Done` in `breakdown.md` until all acceptance criteria pass.

### Slice 0 — Planning and Guard Strategy

- Review this task spec, P1-04 auth helpers, Prisma `User`/`Organization`/`Member` models, and current route groups.
- Read relevant local Next.js 16 docs before adding route guards or proxy behavior.
- Use server-side layouts/helpers as the source of truth for authorization.
- Treat `proxy.ts` as optional optimistic routing only; do not rely on it for database-backed authorization.
- Note that Next.js 16 renamed `middleware.ts` to `proxy.ts`; do not add a new `middleware.ts`.

Suggested commit: none unless intentional docs-only planning notes are added.

### Slice 1 — Access Helper Consolidation

- Add or consolidate access helpers in `lib/auth/access.ts`.
- Provide reusable helpers:
  - `requireUser()`
  - `requireAdmin()`
  - `getOrganizationMembershipsForUser(userId)`
  - `requireAnyOrganizationMember()`
  - `requireOrganizationOwner()` for later owner-only flows.
- Preserve the access boundary:
  - Super Admin access uses `User.role === "admin"` or the Better Auth Admin Plugin role field.
  - Venue dashboard access uses Organization membership, not `User.role`.
- Keep helper return values useful for later service/page code, including the current user and membership data where appropriate.

Suggested commit:

```text
feat(auth): add reusable access helpers
```

### Slice 2 — Guard Response Helpers

- Add `lib/auth/guards.ts` for route-level guard behavior shared by layouts and future pages.
- Centralize unauthenticated behavior as redirect-to-sign-in.
- Keep the sign-in path configurable or centralized because P1-06 owns the final auth UI route.
- Centralize authenticated-but-insufficient-access behavior as forbidden.
- Prefer stable route redirects such as `/forbidden` unless the project intentionally enables and adopts Next.js experimental auth interrupts.

Suggested commit:

```text
feat(auth): add route guard response helpers
```

### Slice 3 — Minimal Protected Route Surfaces

- Add minimal protected route placeholders if the route files do not already exist:
  - `/dashboard`
  - `/dashboard/venue`
  - `/admin`
- Keep these pages intentionally small so P1-06 can own final shell layout and UI polish.
- Do not add auth forms, organization creation UI, owner invitation UI, or staff invitation UI.

Suggested commit:

```text
feat(routes): add protected shell route placeholders
```

### Slice 4 — Server Layout Guards

- Guard the user dashboard layout/route with authenticated user access.
- Guard the admin route group with admin role access.
- Guard the venue dashboard route or nested layout with Organization membership access.
- Ensure `/dashboard/venue/*` checks `Member` records and does not infer venue access from `User.role`.
- Keep the admin-with-membership edge case valid: admin access and venue membership access remain separate grants.

Suggested commit:

```text
feat(auth): enforce dashboard route guards
```

### Slice 5 — Minimal Unauthorized and Forbidden Pages

- Add minimal placeholder pages:
  - `app/unauthorized/page.tsx`
  - `app/forbidden/page.tsx`
- Keep copy and layout basic; P1-06 owns final UI presentation.
- Use these placeholders to make guard behavior testable in P1-05.
- Trade-off accepted for P1-05:
  - Benefit: route guard behavior can be verified now without waiting for P1-06.
  - Cost: P1-06 may replace or restyle these pages later.

Suggested commit:

```text
feat(auth): add access denial pages
```

### Slice 6 — Optional Proxy Optimistic Redirect

- Add `proxy.ts` only if an early request-level session presence check is useful.
- Match only protected paths:
  - `/dashboard/:path*`
  - `/admin/:path*`
- Do not perform Prisma membership lookups or full authorization in proxy.
- Keep final authorization inside server layouts/helpers so client navigation, Server Functions, and future service code are still protected.

Suggested commit, only if proxy is added:

```text
feat(auth): add protected route proxy redirect
```

### Slice 7 — Development/Test Seed Support

- Review the existing development/test seed organization membership before adding new seed data.
- Add or adjust seed data only if needed to verify:
  - admin access,
  - regular authenticated user access,
  - organization member venue access,
  - non-member venue denial.
- Do not raw-seed Better Auth password credentials.

Suggested commit, only if seed data changes:

```text
chore(seed): support access guard verification users
```

### Slice 8 — Focused Tests

- Add focused unit tests for access helper logic now, especially:
  - unauthenticated user behavior,
  - admin role behavior,
  - regular user admin denial,
  - organization member access,
  - non-member venue denial,
  - owner membership helper behavior.
- Add route guard behavior tests where feasible with the current test harness.
- Keep final cross-feature shared behavior coverage in P1-08.

Suggested commit:

```text
test(auth): cover access helper behavior
```

### Slice 9 — Verification

Run after relevant slices:

```bash
npm run typecheck
npm run lint
npm run test
```

Run final verification where environment access allows:

```bash
npm run db:migrate
npm run db:verify-constraints
npm run db:seed
npm run typecheck
npm run lint
npm run test
npm run build
```

### Slice 10 — Documentation and Status

- Update this task doc with implementation notes if the final implementation differs from these slices.
- Document Milestone 2 integration points:
  - owner invitation should create Organization membership;
  - staff invitation should create Organization membership plus future branch permissions;
  - branch-level staff permissions should use `MemberBranchAccess`;
  - venue onboarding should create or link the `Organization -> Venue` relationship.
- Update `breakdown.md` only after acceptance criteria and verification pass.

Suggested commit:

```text
docs(auth): document organization access guards
```

## Implementation Notes

- Access helpers live in `lib/auth/access.ts`.
  - `requireUser()` resolves the current Better Auth session user.
  - `requireAdmin()` grants admin access from `User.role === "admin"`.
  - `getOrganizationMembershipsForUser(userId)` loads Organization membership records with `organization.venue` and `branchAccess` for later venue workflows.
  - `requireAnyOrganizationMember()` grants venue dashboard access from `Member` records, not `User.role`.
  - `requireOrganizationOwner()` is available for later owner-only flows.
- Route guard response helpers live in `lib/auth/guards.ts`.
  - Unauthenticated route access redirects to `/sign-in`.
  - Authenticated-but-insufficient access redirects to `/forbidden`.
  - Shared route constants live in `lib/auth/paths.ts` so server guards and `proxy.ts` can share stable paths without importing `server-only` modules into proxy.
- Protected route guards are enforced by server layouts.
  - `app/(dashboard)/layout.tsx` requires an authenticated user for `/dashboard/*`.
  - `app/(dashboard)/dashboard/venue/layout.tsx` requires Organization membership for `/dashboard/venue/*`.
  - `app/(admin)/layout.tsx` requires admin role for `/admin/*`.
- Minimal protected placeholder pages exist for `/dashboard`, `/dashboard/venue`, and `/admin`.
  - These pages intentionally avoid auth forms, organization creation UI, owner invitation UI, staff invitation UI, venue onboarding, booking, or payment flows.
- Minimal access denial route pages exist at `/unauthorized` and `/forbidden`.
  - These are placeholders for P1-05 verification and may be restyled or replaced by P1-06.
- `proxy.ts` is implemented as an optional optimistic request-level check.
  - It matches only `/dashboard/:path*` and `/admin/:path*`.
  - It checks only for a Better Auth session cookie and redirects unauthenticated requests to `/sign-in?redirectTo=...`.
  - It does not perform Prisma queries, admin checks, or Organization membership checks.
  - Server layouts remain the source of truth for all authorization.
- Development/test seed support creates guard verification identities without raw-seeding Better Auth password credentials:
  - admin user,
  - regular non-member user,
  - venue owner user with `Member.role === "owner"`,
  - venue staff user with `Member.role === "member"`.

## Milestone 2 Integration Points

- Owner invitation should create or activate an Organization `Member` record with `role: "owner"`.
- Staff invitation should create or activate an Organization `Member` record with `role: "member"`.
- Staff branch-level permissions should use `MemberBranchAccess`; P1-05 only grants broad venue dashboard access from Organization membership.
- Venue onboarding should create or link the `Organization -> Venue` relationship so membership-derived access can resolve the related venue context.
- Future owner-only screens should use `requireOrganizationOwner()` or `requireOrganizationOwnerForRoute()`.
- Future service-layer mutations must call access helpers directly and must not rely on `proxy.ts`.

## Completed Verification

```bash
npm run db:migrate
npm run db:verify-constraints
npm run db:seed
npm run typecheck
npm run lint
npm run test
npm run build
```

Verification result:

- Database migrations were already in sync.
- Database constraints verified successfully.
- Seed completed successfully with idempotent guard fixtures.
- Unit tests passed: 7 files, 46 tests.
- Production build passed and included protected dynamic routes plus `Proxy (Middleware)`.

## Files / Modules

Likely touched:

```text
lib/auth/access.ts
lib/auth/guards.ts
proxy.ts
app/(dashboard)/layout.tsx
app/(dashboard)/dashboard/page.tsx
app/(dashboard)/dashboard/venue/layout.tsx
app/(dashboard)/dashboard/venue/page.tsx
app/(admin)/layout.tsx
app/(admin)/admin/page.tsx
app/unauthorized/page.tsx
app/forbidden/page.tsx
prisma/seed.ts
**/*.test.ts
```

## Access Rules

| Area               | Route                                    | Required Access     |
| ------------------ | ---------------------------------------- | ------------------- |
| Public marketplace | `/venues`, `/venues/*`                   | Public              |
| User dashboard     | `/dashboard`, `/dashboard/*`             | Authenticated user  |
| Venue dashboard    | `/dashboard/venue`, `/dashboard/venue/*` | Organization member |
| Admin dashboard    | `/admin`, `/admin/*`                     | Admin role          |

## Acceptance Criteria

- [x] Unauthenticated users cannot access `/dashboard/*`, `/dashboard/venue/*`, or `/admin/*`.
- [x] Authenticated users can access `/dashboard`.
- [x] Non-admin users cannot access `/admin`.
- [x] Admin users can access `/admin`.
- [x] Users without organization membership cannot access `/dashboard/venue`.
- [x] Users with organization membership can access `/dashboard/venue`.
- [x] Venue access does not rely on `User.role`.
- [x] Helper functions are reusable by later service/page code.
- [x] No owner invitation or organization creation UI is added.

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
