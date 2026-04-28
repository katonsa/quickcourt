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

Placeholder test command until the Phase 1 testing harness is added.

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
