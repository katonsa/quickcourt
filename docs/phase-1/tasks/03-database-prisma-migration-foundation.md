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
lib/db.ts
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

- [x] Prisma client can be generated.
- [x] Prisma dependencies and schema files exist if they were missing.
- [x] Database schema can be applied to a clean local DB.
- [x] PostgreSQL-specific constraints can be applied.
- [x] Constraint verification script passes.
- [x] Seed script is idempotent.
- [x] Admin bootstrap path is documented.
- [x] Optional sample organization/member seed is development/test-only.
- [x] Migration workflow is documented.

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

## Implementation Notes

- Use the existing full Prisma schema as the P1-03 baseline.
- The runtime Prisma client lives in `lib/db.ts`, not `server/db.ts`.
- Prisma client output is `generated/prisma`; importing from `@prisma/client` is not valid for the generated runtime client in this app.
- `DATABASE_URL` is the active app and Prisma database URL.
- `DATABASE_URL_TEST` is reserved as the canonical DB integration test database URL, must not point at the same database as `DATABASE_URL`, and becomes required for the P1-07 DB integration harness.
- Do not raw-seed Better Auth password/account credentials in P1-03. Admin bootstrap is documented as a later auth-aware promotion path after a user exists through Better Auth.

### Implemented Artifacts

- `docker-compose.yml` provides local PostgreSQL 17.
- `prisma.config.ts` points Prisma to `prisma/schema.prisma` and `prisma/migrations`.
- `prisma/schema.prisma` contains Better Auth-compatible core/admin/organization models plus the full current QuickCourt domain schema.
- `prisma/migrations/20260428000100_init_extensions/migration.sql` creates required PostgreSQL extensions.
- `prisma/migrations/20260428000200_init_domain_schema/migration.sql` creates the full schema generated from Prisma.
- `prisma/migrations/20260428000300_add_database_constraints/migration.sql` applies PostgreSQL-specific constraints.
- `prisma/verify-db-constraints.sql` fails when required DB constraints or extensions are missing.
- `prisma/seed.ts` is idempotent and avoids production sample data.
- `scripts/verify-db-constraints.ts` and `scripts/db-smoke.ts` provide scriptable DB verification.
- `lib/db.ts` exposes the server-only Prisma runtime client.

### Migration Workflow

Migrations are intentionally split into three reviewable steps:

1. `init_extensions`
   - `pgcrypto`
   - `citext`
   - `btree_gist`
2. `init_domain_schema`
   - Prisma-generated full current domain schema.
   - Includes Better Auth-compatible core/admin/organization models and QuickCourt domain models.
3. `add_database_constraints`
   - Final authority for generated `time_range` columns.
   - Adds exclusion constraints, partial unique indexes, and check constraints.

Run locally:

```bash
npm run db:up
npm run db:generate
npm run db:migrate
npm run db:verify-constraints
npm run db:seed
npm run db:smoke
```

Run deployment migrations:

```bash
npm run db:migrate:deploy
```

Reset local development data:

```bash
npm run db:reset
```

`db:reset` is destructive and must only be used against a disposable local development database.

### Verification Evidence

P1-03 was marked `Done` after these commands passed:

```bash
npx prisma validate
npm run db:generate
npm run db:migrate
npm run db:verify-constraints
npm run db:seed
npm run db:seed
npm run db:smoke
npm run typecheck
npm run lint
npm run build
```
