# QuickCourt Maintainer Guide

This guide is the maintainer-facing operating manual for the current repository. It complements the product docs and phase task specs by documenting how to run, verify, and safely change the app as it exists today.

## Current State

QuickCourt is a Next.js 16 App Router application with React 19, TypeScript, Tailwind CSS, shadcn/ui components, Better Auth, Prisma 7, PostgreSQL 17, Pino logging, and Vitest.

Implementation status:

- Phase 1 Foundation is complete. Auth, access helpers, protected shells, env validation, logging, Prisma, migrations, seed support, and local test harnesses are present.
- Phase 2 planning docs are present. P2-01 is complete, while implementation tasks P2-02 through P2-14 are still planned unless their task status changes.
- Later marketplace, booking, payment, ledger, refund, withdrawal, staff, and release hardening work remains planned in `docs/project-plan.md`.

When task specs and code disagree, treat the code and current task status as authoritative. Update the relevant docs in the same change that changes behavior.

## Maintainer Source Map

| Need | Start here |
| --- | --- |
| Project overview | `README.md` |
| Documentation index | `docs/README.md` |
| Maintainer workflows | `docs/maintainer-guide.md` |
| Product scope | `docs/prd.md` |
| Architecture and domain rules | `docs/technical-spec.md` |
| Roadmap and milestone boundaries | `docs/project-plan.md` |
| Test policy | `docs/testing-strategy.md` |
| Phase 1 status and decisions | `docs/phase-1/README.md`, `docs/phase-1/breakdown.md`, `docs/phase-1/decision-log.md` |
| Phase 2 plan and decisions | `docs/phase-2/README.md`, `docs/phase-2/breakdown.md`, `docs/phase-2/decision-log.md` |
| Agent and sandbox rules | `AGENTS.md` |

## Prerequisites

- Node.js and npm compatible with the checked-in `package-lock.json`.
- Docker with Compose for local PostgreSQL services.
- Network access for `npm install`/`npm ci` and for `npm run build`, because `next/font/google` fetches font assets during the production build.
- Local PostgreSQL access through Docker for database-backed commands and integration tests.

The repository uses the root `app/` directory and does not use `/src`.

## First-Time Setup

1. Install dependencies:

   ```bash
   npm ci
   ```

2. Create local environment values:

   ```bash
   cp .env.example .env
   ```

3. Start the development database:

   ```bash
   npm run db:up
   ```

4. Generate the Prisma client:

   ```bash
   npm run db:generate
   ```

5. Apply local migrations:

   ```bash
   npm run db:migrate
   ```

6. Verify PostgreSQL-specific constraints:

   ```bash
   npm run db:verify-constraints
   ```

7. Seed local defaults:

   ```bash
   npm run db:seed
   ```

8. Start the development server:

   ```bash
   npm run dev
   ```

## Environment Rules

Server-only env is validated by `config/env.ts` and `config/env-core.ts`. Client-safe env is validated by `config/public-env.ts`.

Rules:

- Use `APP_ENV` for deployment stage: `development`, `test`, `staging`, or `production`.
- Do not use `NODE_ENV` as the deployment stage. Framework tooling controls it.
- Only expose browser-safe values through `NEXT_PUBLIC_*`.
- Never import `config/env.ts` from Client Components.
- Keep `DATABASE_URL_TEST` different from `DATABASE_URL`.
- Development and test may use `EMAIL_PROVIDER=console`.
- Staging and production require Resend config: `RESEND_API_KEY` and `EMAIL_FROM`.
- `BETTER_AUTH_SECRET` must be at least 32 characters.

## Database Operations

Local development database:

- Compose service: `postgres`
- Image: `postgres:17-alpine`
- Database: `quickcourt`
- Port: `5432`
- Default URL: `postgresql://postgres:postgres@localhost:5432/quickcourt`

Local integration test database:

- Compose service: `postgres-test`
- Image: `postgres:17-alpine`
- Database: `quickcourt_test`
- Port: `5433`
- Default URL: `postgresql://postgres:postgres@localhost:5433/quickcourt_test`

Useful commands:

```bash
npm run db:up
npm run db:generate
npm run db:migrate
npm run db:verify-constraints
npm run db:seed
npm run db:smoke
```

Migration rules:

- Prisma 7 config lives in `prisma.config.ts`.
- Generated Prisma client output is `generated/prisma`.
- Runtime database access goes through `lib/db.ts`.
- Review raw SQL migrations carefully before changing generated range columns, partial indexes, exclusion constraints, or booking/availability constraints.
- Keep the three Phase 1 migration responsibilities clear: extensions, domain schema, and PostgreSQL-specific constraints.
- Use `npm run db:migrate:deploy` for deployment migration application, not `npm run db:migrate`.

## Testing And Verification

Next.js 16 does not run ESLint as part of `next build`, so maintainers must run lint explicitly.

Fast local verification:

```bash
npm run typecheck
npm run lint
npm run test
```

Database-backed verification:

```bash
npm run test:db:up
npm run test:db:migrate
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/quickcourt_test npm run db:verify-constraints
npm run test:integration
```

Full local verification before merging a meaningful change:

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

Notes:

- `npm run test` is unit-only and DB-free.
- DB-backed tests use `*.integration.test.ts` and `vitest.config.integration.ts`.
- Run `npm run test:db:migrate` before integration tests when migrations change or the test DB is fresh.
- `npm run build` needs network access in restricted sandboxes because of `next/font/google`.
- Database commands also need network-stack access in restricted sandboxes because they connect to local PostgreSQL through TCP.

## Auth And Admin Bootstrap

Better Auth owns user registration and password credentials. The seed script does not create Better Auth password credentials.

To bootstrap a local admin:

1. Register the user through the app's Better Auth email/password flow.
2. Set `ADMIN_BOOTSTRAP_EMAIL` in `.env` to that email.
3. Run:

   ```bash
   npm run auth:bootstrap-admin
   ```

The bootstrap command is idempotent. It promotes an existing user to admin; it does not create users.

## Logging And Sensitive Data

Server logging uses Pino through `lib/logger.ts`.

Maintain these constraints:

- Put sensitive values in structured fields instead of message strings so redaction can apply.
- Do not log raw secrets, tokens, cookies, reset links, OTP/MFA values, IP/user-agent values, full contact details, or full bank/payment identifiers.
- Error pages must keep user-facing copy generic and must not expose stack traces or internal messages.
- Bank account work must preserve masked boundaries and use `accountNumberLast4` for normal display/audit surfaces.

## Next.js Maintenance Notes

This project intentionally follows the installed Next.js version, not assumptions from older Next.js releases.

Before changing App Router conventions, route handlers, build behavior, or font behavior, read the relevant local docs under:

```text
node_modules/next/dist/docs/
```

Important current facts from the installed docs and project setup:

- `next dev` uses Turbopack by default.
- `next build` creates the production build but does not run ESLint automatically.
- App Router routes live in `app/`.
- Browser-exposed env must be prefixed with `NEXT_PUBLIC_*` and is inlined at build time.
- `next/font/google` self-hosts Google font assets, but the production build still needs network access to fetch those assets.

## Documentation Maintenance

When behavior changes, update docs in the same change:

- Command/script changes: update `README.md`, this guide, and any relevant task docs.
- Env changes: update `.env.example`, `README.md`, this guide, and env validation tests.
- Route changes: update `docs/README.md`, route smoke tests, and relevant phase docs.
- Database/schema changes: update `docs/technical-spec.md`, migration notes, and testing instructions.
- Phase status changes: update the phase `breakdown.md`, `README.md`, and decision log if a decision changed.

Do not mark planned work as implemented. Use explicit language such as "planned", "deferred", or "implemented" so maintainers can distinguish product intent from shipped behavior.

## Deployment Checklist

For staging or production-like deployment:

1. Set production-grade env values, including `APP_ENV`, `APP_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `DATABASE_URL`, `EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, and `EMAIL_FROM`.
2. Apply migrations with:

   ```bash
   npm run db:migrate:deploy
   ```

3. Verify constraints against the deployed database where appropriate:

   ```bash
   npm run db:verify-constraints
   ```

4. Build with network access:

   ```bash
   npm run build
   ```

5. Start the production server:

   ```bash
   npm run start
   ```

