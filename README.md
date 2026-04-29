# QuickCourt

QuickCourt is a sports venue booking marketplace for Indonesia. The current codebase is a Next.js 16 App Router application with React 19, TypeScript, Tailwind CSS, shadcn/ui, Better Auth, Prisma 7, PostgreSQL 17, Pino, and Vitest.

## Current Status

- Phase 1 Foundation is implemented and tested locally.
- Phase 2 planning docs are present. Implementation tasks P2-02 through P2-14 are still planned unless their task status changes.
- Booking, payment, ledger, refund, withdrawal, staff, and public marketplace completion remain later milestone work.

For maintainer workflows, start with [docs/maintainer-guide.md](./docs/maintainer-guide.md). For the full documentation index, start with [docs/README.md](./docs/README.md).

## Project Structure

| Path | Purpose |
| --- | --- |
| `app/` | Next.js App Router routes, route groups, layouts, error/loading UI, and route handlers. The project uses root `app/` and does not use `/src`. |
| `components/` | Shared UI and feature components. |
| `config/` | Server and client environment validation. |
| `lib/` | Auth, database, logging, validation, email, access, and shared utilities. |
| `prisma/` | Prisma schema, migrations, seed, and constraint verification SQL. |
| `scripts/` | Operational and database helper scripts. |
| `test/` | Unit/integration test setup and cross-cutting test suites. |
| `docs/` | Product, technical, maintainer, testing, and phase implementation documentation. |

## First-Time Setup

```bash
npm ci
cp .env.example .env
npm run db:up
npm run db:generate
npm run db:migrate
npm run db:verify-constraints
npm run db:seed
npm run dev
```

Open `http://localhost:3000` after the dev server starts.

## Common Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local Next.js dev server. Next.js 16 uses Turbopack by default. |
| `npm run build` | Create a production build. Requires network access because the app uses `next/font/google`. |
| `npm run start` | Start the production server after a build. |
| `npm run lint` | Run ESLint. Next.js 16 does not run lint automatically during `next build`. |
| `npm run typecheck` | Run TypeScript type checking. |
| `npm run format` | Format TypeScript and TSX files with Prettier. |
| `npm run test` | Run unit tests with `vitest.config.unit.ts`; DB-free by design. |
| `npm run test:watch` | Run unit tests in watch mode. |
| `npm run test:coverage` | Run unit tests with V8 coverage. |
| `npm run test:integration` | Run DB-backed integration tests with `vitest.config.integration.ts`. |
| `npm run test:all` | Run unit tests and integration tests. Migrate the test DB first. |

## Database Commands

| Command | Purpose |
| --- | --- |
| `npm run db:up` | Start the local PostgreSQL 17 development service. |
| `npm run db:down` | Stop the local development database service. |
| `npm run db:generate` | Generate the Prisma client into `generated/prisma`. |
| `npm run db:migrate` | Apply local development migrations to `DATABASE_URL`. |
| `npm run db:migrate:deploy` | Apply migrations in deployed environments. |
| `npm run db:reset` | Reset the local development database through Prisma. |
| `npm run db:verify-constraints` | Verify required extensions, generated range columns, partial indexes, exclusion constraints, and check constraints. |
| `npm run db:seed` | Seed platform defaults and development/test-only organization membership data. |
| `npm run db:smoke` | Run a minimal database connectivity check. |
| `npm run test:db:up` | Start the local integration test PostgreSQL service. |
| `npm run test:db:migrate` | Apply migrations to `DATABASE_URL_TEST`. |
| `npm run test:db:down` | Stop the integration test database service. |

Development database defaults:

- Service: `postgres`
- Database: `quickcourt`
- URL: `postgresql://postgres:postgres@localhost:5432/quickcourt`

Integration test database defaults:

- Service: `postgres-test`
- Database: `quickcourt_test`
- URL: `postgresql://postgres:postgres@localhost:5433/quickcourt_test`

`DATABASE_URL_TEST` must not point to the same database as `DATABASE_URL`.

## Verification

Fast local check:

```bash
npm run typecheck
npm run lint
npm run test
```

Database-backed check:

```bash
npm run test:db:up
npm run test:db:migrate
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/quickcourt_test npm run db:verify-constraints
npm run test:integration
```

Full pre-merge check for meaningful changes:

```bash
npm run typecheck
npm run lint
npm run test
npm run test:db:up
npm run test:db:migrate
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/quickcourt_test npm run db:verify-constraints
npm run test:integration
npm run build
```

In restricted sandboxes, request network permission before `npm run build` and before database-backed commands that connect to PostgreSQL through the local network stack.

## Environment

Copy `.env.example` to `.env` for local development. Real `.env` files are ignored and must not be committed.

Server-only env is validated in `config/env.ts`; Client Components must use `config/public-env.ts` and only `NEXT_PUBLIC_*` values. `APP_ENV` controls the deployment stage separately from `NODE_ENV`.

Required server env:

- `APP_ENV`
- `APP_URL`
- `LOG_LEVEL`
- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `EMAIL_PROVIDER`

Optional or environment-dependent server env:

- `DATABASE_URL_TEST`
- `ADMIN_BOOTSTRAP_EMAIL`
- `RESEND_API_KEY`
- `EMAIL_FROM`

Client-safe env:

- `NEXT_PUBLIC_APP_ENV`
- `NEXT_PUBLIC_APP_URL`

Development and test may use `EMAIL_PROVIDER=console` without Resend credentials. Staging and production require `EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, and `EMAIL_FROM`.

## Auth And Admin Bootstrap

Better Auth owns user registration and password credentials. The seed script does not create Better Auth password credentials.

Admin bootstrap:

1. Create the user through the Better Auth email/password registration flow.
2. Set `ADMIN_BOOTSTRAP_EMAIL` to that user's email.
3. Run `npm run auth:bootstrap-admin`.

The bootstrap command is idempotent and only promotes an existing Better Auth user to `User.role = "admin"`.

## Documentation

- [Maintainer Guide](./docs/maintainer-guide.md)
- [Documentation Index](./docs/README.md)
- [Testing Strategy](./docs/testing-strategy.md)
- [Phase 1 Docs](./docs/phase-1/README.md)
- [Phase 2 Docs](./docs/phase-2/README.md)
