# P1-03 — Database, Prisma, Migration Foundation

## Goal

Establish PostgreSQL and Prisma foundations, apply the QuickCourt schema, and preserve database-level constraints needed for later booking, payment, and ledger correctness.

## Context

QuickCourt's future booking flow relies on database-level correctness, especially anti-double-booking constraints. Phase 1 must set up migration discipline even before booking UI exists.

## Scope

- PostgreSQL 17 local setup documentation/config.
- Prisma v7 setup.
- Create or verify the initial Prisma schema from the product and technical specs.
- SQL migration for PostgreSQL-specific constraints.
- Constraint verification script.
- Seed script foundation.
- Development/test database conventions.
- Optional development sample data for admin and organization access tests.

## Out of Scope

- Changing booking/payment/ledger business logic.
- Venue onboarding data entry UI.
- Court/schedule/pricing implementation.
- Production migration automation beyond scripts and docs.

## Dependencies

- P1-01 App Foundation.
- P1-02 Env, Config, Observability, Error Handling.

## Implementation Steps

1. Create or verify `prisma/schema.prisma` from the technical spec and any existing schema docs.
2. Ensure the schema aligns with Better Auth core, Admin Plugin, and Organization Plugin models.
3. Configure Prisma dependencies and client generation.
4. Configure local PostgreSQL connection via `DATABASE_URL`.
5. Apply initial schema migration.
6. Apply PostgreSQL-specific constraint migration, including booking slot exclusion constraints if already present in docs/migrations.
7. Ensure `prisma/verify-db-constraints.sql` can verify required constraints.
8. Create idempotent seed script foundation:
   - Admin bootstrap user path.
   - Optional development/test organization and member data.
   - No production sample data by default.
9. Add database reset/setup scripts if appropriate.
10. Document migration workflow:

- create migration
- apply migration
- verify constraints
- generate client

## Files / Modules

Likely touched:

```text
prisma/schema.prisma
prisma/migrations/**
prisma/verify-db-constraints.sql
prisma/seed.ts
server/db.ts
package.json
.env.example
```

## Data Model / Migration

- Keep Better Auth model compatibility.
- Keep `User.role` for Super Admin role logic if already defined.
- Keep Organization/Member/Invitation models compatible with Better Auth Organization Plugin.
- Do not weaken existing booking slot constraints.
- Do not convert money fields to floating point.

## Acceptance Criteria

- [ ] Prisma client can be generated.
- [ ] Prisma dependencies and schema files exist if they were missing.
- [ ] Database schema can be applied to a clean local DB.
- [ ] PostgreSQL-specific constraints can be applied.
- [ ] Constraint verification script passes.
- [ ] Seed script is idempotent.
- [ ] Admin bootstrap path is documented.
- [ ] Optional sample organization/member seed is development/test-only.
- [ ] Migration workflow is documented.

## Test Plan

- Run migration on clean local/test DB.
- Run Prisma generate.
- Run constraint verification SQL.
- Run seed twice and confirm idempotency.
- Run minimal DB connectivity smoke test.

## Edge Cases

- Better Auth IDs may be strings, not database UUIDs; do not force UUID type if plugin expects strings.
- Prisma may not express all PostgreSQL constraints; keep raw SQL migrations where needed.
- Seed script must not create duplicate admin or duplicate organization/member rows.

## Risks

- Breaking Better Auth plugin compatibility through schema edits.
- Losing anti-double-booking constraints during migration refactor.
- Accidentally seeding sample development data in production.

## Done When

A clean developer/test database can be created, migrated, verified, seeded idempotently, and used by later auth/access tasks.
