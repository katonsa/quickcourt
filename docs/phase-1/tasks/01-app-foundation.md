# P1-01 — App Foundation

## Goal

Create the baseline QuickCourt Next.js application foundation so later Phase 1 tasks can build database, auth, route guards, UI shells, and tests on a consistent structure.

## Context

QuickCourt is a transactional marketplace. The app foundation must be strict, predictable, and easy for developers or AI implementers to extend without inventing new conventions in later tasks.

## Scope

- Initialize/verify Next.js 16 App Router setup.
- Enable TypeScript strict mode.
- Establish package manager and scripts.
- Configure ESLint and formatting conventions.
- Configure Tailwind v4 and shadcn/ui baseline if not already present.
- Establish base folder structure.
- Add root metadata and base providers pattern.
- Add minimal home/public route placeholder.
- Add shared path aliases.

## Out of Scope

- Auth implementation.
- Prisma setup.
- Database migrations.
- Full design system.
- Venue, booking, payment, ledger, or admin features.

## Dependencies

None.

## Implementation Steps

1. Verify framework and runtime versions:
   - Next.js 16.
   - React version compatible with Next.js 16.
   - TypeScript strict mode.
2. Create or verify package scripts:
   - `dev`
   - `build`
   - `start`
   - `lint`
   - `typecheck`
   - `test` placeholder if testing task has not run yet.
3. Configure `tsconfig.json`:
   - `strict: true`.
   - Path alias such as `@/*`.
4. Configure base app structure:
   - root `app` directory.
   - `components`.
   - `lib`.
   - `config`.
   - `styles` if needed.
5. Configure Tailwind/shadcn baseline:
   - Ensure global CSS is loaded.
   - Ensure components can be added consistently.
6. Add placeholder public pages:
   - Home or redirect to `/venues`.
   - `/venues` placeholder shell.
7. Document project commands in root README or relevant docs if missing.

## Files / Modules

Likely touched:

```text
package.json
tsconfig.json
next.config.*
eslint.config.*
postcss.config.*
app/layout.tsx
app/page.tsx
app/venues/page.tsx
components/*
lib/*
```

## Acceptance Criteria

- [ ] App runs locally with `npm run dev` or the selected package manager equivalent.
- [ ] `npm run typecheck` passes.
- [ ] `npm run lint` passes or is configured to run once linting rules are finalized.
- [ ] TypeScript strict mode is active.
- [ ] Path alias works.
- [ ] Public placeholder route is available.
- [ ] Base folder conventions are documented or obvious.
- [ ] Project uses root `app` directory and does not introduce `/src`.
- [ ] No auth, booking, payment, or venue onboarding feature is implemented.

## Test Plan

- Run typecheck.
- Run lint.
- Build app if dependencies are available.
- Manually open home and `/venues` placeholder.

## Edge Cases

- Do not introduce a `/src` directory; keep App Router files in the root `app` directory.
- Avoid adding UI dependencies not listed in existing documentation without a decision-log entry.
- Keep the placeholder UI simple; this task is foundation, not product UI polish.

## Risks

- Overbuilding the design system too early.
- Creating structure that conflicts with Better Auth or Prisma conventions used in later tasks.

## Done When

The app has a strict, runnable, minimal Next.js foundation with clear structure and scripts for later tasks.
