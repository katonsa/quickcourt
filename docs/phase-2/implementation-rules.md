# QuickCourt Phase 2 Implementation Rules

These rules apply to all Phase 2 task specs. They are intended for both human developers and AI implementers.

## Scope Control

- Do not implement features outside the current task spec.
- Do not pull Phase 3+ features into Phase 2 without updating `decision-log.md` first.
- If a task requires a decision not captured in the docs, add it to `decision-log.md` before implementing behavior.
- Keep each implementation focused on one task ID where possible.
- Preserve Phase 1 auth, access, logging, error handling, and testing conventions.
- Do not start P2-02 or later until Phase 1 is fully `Done`, including P1-08 behavior coverage, unless `decision-log.md` explicitly allows a narrow exception.

## Auth and Access Control

- Use Better Auth as the source of truth for auth/session handling.
- Use Better Auth Admin Plugin for Super Admin checks.
- Use Better Auth Organization Plugin for Organization membership.
- Ordinary users must not create Organizations or self-promote into venue owners.
- Super Admin creates the Organization and sends the owner invitation.
- Owner invitation in Phase 2 requires an already-registered user.
- `/admin/venues` actions require Super Admin access.
- `/dashboard/venue/*` access is based on Organization membership, not `User.role`.
- Owner-only onboarding mutations must require Organization owner membership unless a task explicitly broadens access.

## Venue Draft Rules

- A Phase 2 venue starts as `draft`.
- Do not transition venues to `pending_approval`, `approved`, `rejected`, or marketplace-visible states in Phase 2.
- One Venue maps to one Better Auth Organization through `Venue.organizationId`.
- Phase 2 UI focuses on one default branch, but data model must remain branch-ready.
- Default branch uniqueness is enforced through the existing partial unique index.
- `Sport`, `City`, and `Facility` are seeded/read-only in Phase 2.
- Do not implement court, operating hour, pricing, or availability management in Phase 2.

## Uploads

- Use Uploadthing for venue photo upload.
- Install Uploadthing and update `.env.example` if the dependency or env variables are not already present.
- Store public Uploadthing CDN URLs in `VenuePhoto.imageUrl`.
- Validate image type and size according to the Technical Spec.
- Phase 2 requires at least one venue-level photo for onboarding completeness.
- Branch photos are optional in Phase 2.
- Court photos are out of scope until court management exists.

## Bank Account Security

- Treat full bank account numbers as sensitive.
- Persist `VenueBankAccount.accountNumberLast4` when creating or updating account numbers.
- Do not return full account numbers from normal service DTOs, API responses, UI loader data, or component props.
- Do not write full account numbers to logs.
- Audit `beforeData` and `afterData` must use censored bank account values.
- Manual verification must be Super Admin-only.
- Rejection uses `isVerified = false` plus audit metadata in Phase 2; do not imply a separate persisted rejected state unless the schema changes.
- Full encryption is deferred unless a later decision-log entry changes the model.

## Database and Prisma

- Do not change Prisma schema without a migration.
- Keep PostgreSQL-specific constraints in explicit SQL migrations when Prisma cannot express them.
- All migrations must be deterministic and reviewable.
- Do not weaken Phase 1 constraints, especially default branch, primary bank account, and booking overlap constraints.
- Runtime Prisma access lives in `lib/db.ts`; do not create a parallel database client module without a decision-log entry.
- Unit tests must not require a database; DB-backed behavior belongs in `*.integration.test.ts`.

## Email

- Use the existing email sender abstraction.
- Resend is the production provider.
- Development may use the existing console sender fallback.
- Invitation and status emails must not leak auth tokens except through intended one-time links.
- Email templates should not contain full bank account numbers.

## Logging and Error Handling

- Use structured logging for server-side logs.
- Do not log account numbers, auth tokens, session cookies, reset tokens, invitation tokens, or upload secrets.
- Keep PII and secrets in structured log fields only when redaction is configured.
- User-facing errors must be generic where sensitive data or authorization state could leak.
- Service-layer errors should be testable and mapped to safe UI/API messages.

## Testing

- Add or update tests when implementing behavior that can regress.
- Write service-layer tests using Hybrid TDD before implementation where practical.
- Unit tests stay DB-free.
- DB-backed tests use `*.integration.test.ts`, run through `npm run test:integration`, and target `DATABASE_URL_TEST`.
- Test bank account masking and audit censorship explicitly.
- Test permission boundaries for Super Admin, owner, regular user, and unrelated Organization member.
- Do not add booking/payment/ledger tests in Phase 2 except placeholders in later milestone docs.

## Documentation

- Update task status in `breakdown.md` as work progresses.
- Update `decision-log.md` for decisions that affect architecture, scope, security, or operations.
- If implementation differs from task spec, update the spec rather than leaving docs stale.
