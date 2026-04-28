# QuickCourt

QuickCourt is a sports venue booking marketplace built with Next.js 16, React 19, TypeScript, Tailwind CSS, and shadcn/ui.

## Project Structure

- `app/` — App Router routes and layouts. This project uses the root `app` directory and does not use `/src`.
- `components/` — Shared UI components.
- `config/` — Configuration modules.
- `lib/` — Shared utilities and future server/client helpers.
- `docs/` — Product, technical, testing, and Phase 1 implementation documentation.

## Commands

```bash
npm run dev
```

Start the local development server.

```bash
npm run build
```

Create a production build.

```bash
npm run start
```

Start the production server after a build.

```bash
npm run lint
```

Run ESLint.

```bash
npm run typecheck
```

Run TypeScript type checking.

```bash
npm run format
```

Format TypeScript and TSX files with Prettier.

```bash
npm run test
```

Run the Slice 1 Vitest unit harness once. This command uses `vitest.config.unit.ts`, runs in the Node environment, and stays DB-free.

```bash
npm run test:watch
```

Run the Slice 1 Vitest unit harness in watch mode.

```bash
npm run test:coverage
```

Run the Slice 1 Vitest unit harness with V8 coverage.

```bash
npm run test:db:up
npm run test:db:migrate
npm run test:integration
```

Start the test PostgreSQL service, apply migrations to `DATABASE_URL_TEST`, then run DB-backed integration tests through `vitest.config.integration.ts`. `test:db:migrate` maps Prisma's active `DATABASE_URL` to `DATABASE_URL_TEST` only for that subprocess.

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/quickcourt_test npm run db:verify-constraints
```

Verify database constraints against the migrated test database.

```bash
npm run test:db:down
```

Stop the test PostgreSQL service.

```bash
npm run test:all
```

Run unit tests and DB integration tests. `npm run test` remains unit-only and DB-free.

### Database Commands

```bash
npm run db:up
```

Start the local PostgreSQL 17 service defined in `docker-compose.yml`.

```bash
npm run db:generate
```

Generate the Prisma client into `generated/prisma`.

```bash
npm run db:migrate
```

Apply local development migrations to `DATABASE_URL`.

```bash
npm run db:verify-constraints
```

Verify required PostgreSQL extensions, generated range columns, partial indexes, exclusion constraints, and check constraints.

```bash
npm run db:seed
```

Seed platform defaults and development/test-only organization membership data.

```bash
npm run db:smoke
```

Run a minimal database connectivity check.

## Environment

Copy `.env.example` to `.env` for local development. Real `.env` files are ignored and must not be committed.

Server-only env is validated in `config/env.ts`; Client Components must use `config/public-env.ts` and only `NEXT_PUBLIC_*` values. `APP_ENV` controls the deployment stage separately from `NODE_ENV`.

Required Phase 1 env includes:

- `APP_ENV`
- `APP_URL`
- `LOG_LEVEL`
- `NEXT_PUBLIC_APP_ENV`
- `NEXT_PUBLIC_APP_URL`
- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `EMAIL_PROVIDER`
- `RESEND_API_KEY`
- `EMAIL_FROM`

Development and test may use `EMAIL_PROVIDER=console` without Resend credentials. Staging and production require `RESEND_API_KEY` and `EMAIL_FROM`.

Local/test env:

- `DATABASE_URL_TEST`
- `ADMIN_BOOTSTRAP_EMAIL`

## Database

Prisma v7 is configured through `prisma.config.ts` and uses the generated client in `generated/prisma`. Runtime access lives in `lib/db.ts`.

Local PostgreSQL defaults:

- Docker service: `postgres`
- Image: `postgres:17-alpine`
- Database: `quickcourt`
- User/password: `postgres` / `postgres`
- Port: `5432`

Local test PostgreSQL defaults:

- Docker service: `postgres-test`
- Image: `postgres:17-alpine`
- Database: `quickcourt_test`
- User/password: `postgres` / `postgres`
- Port: `5433`
- `DATABASE_URL_TEST`: `postgresql://postgres:postgres@localhost:5433/quickcourt_test`

Local workflow:

```bash
npm run db:up
npm run db:generate
npm run db:migrate
npm run db:verify-constraints
npm run db:seed
npm run db:smoke
```

`DATABASE_URL` is the active app and Prisma database URL. `DATABASE_URL_TEST` is the canonical DB integration test URL for the Phase 1 test harness and must not point at the same database as `DATABASE_URL`. P1-07 keeps unit tests DB-free; DB-backed tests use `*.integration.test.ts` and run through `npm run test:integration`. Prepare the test database with `npm run test:db:migrate` before running DB integration tests.

P1-07 currently has the local Vitest, foundation env, and DB integration harness slices in place. The CI workflow slice is deferred, and P1-08 owns final behavior coverage for auth config, email sender selection, access helpers, route guards, and shell smoke paths.

P1-03 seeds platform settings in all environments and sample organization/member data only in development or test. It does not seed Better Auth password credentials; create the first admin user through Better Auth, then promote that user to `role = "admin"` through an auth-aware bootstrap step.

Admin bootstrap:

1. Create the user through Better Auth email/password registration.
2. Set `ADMIN_BOOTSTRAP_EMAIL` to that user email.
3. Run `npm run auth:bootstrap-admin`.

The bootstrap command is idempotent and only promotes an existing Better Auth user to `User.role = "admin"`. It does not create users or credentials.

Migration structure:

- `20260428000100_init_extensions` creates `pgcrypto`, `citext`, and `btree_gist`.
- `20260428000200_init_domain_schema` creates the full Prisma schema.
- `20260428000300_add_database_constraints` is the source of truth for generated `time_range` columns and PostgreSQL-specific constraints.

## Observability and Errors

Server logs use Pino through `lib/logger.ts`. Sensitive fields are redacted by default, including secrets, auth tokens, cookies, reset/session tokens, contact details, IP/user agent, OTP/MFA values, and payment-sensitive identifiers. Keep sensitive values in structured log fields rather than message strings so redaction can apply.

Baseline error handling lives in:

- `app/error.tsx`
- `app/global-error.tsx`
- `app/not-found.tsx`
- `app/(dashboard)/error.tsx`
- `app/(admin)/error.tsx`
- `lib/errors.ts`

Error pages use generic copy and do not render stack traces, raw error messages, or internal details.

## Documentation

Start with [docs/README.md](./docs/README.md). Phase 1 implementation tasks live in [docs/phase-1/README.md](./docs/phase-1/README.md).
