# QuickCourt Documentation

Dokumentasi ini adalah sumber rujukan untuk product scope, arsitektur, rencana milestone, testing, dan workflow maintainer QuickCourt.

## Status Implementasi

- **Phase 1 Foundation:** implemented and locally verified.
- **Phase 2 Organization & Venue Profile Onboarding:** planning docs exist; implementation tasks after P2-01 remain planned until their task board status changes.
- **Booking, payment, ledger, refund, withdrawal, staff operations, and release hardening:** planned for later milestones in `project-plan.md`.

Gunakan status di `docs/phase-*/breakdown.md` untuk membedakan fitur yang sudah implemented, planned, deferred, atau blocked.

## Dokumen Utama

| Dokumen | Isi |
| --- | --- |
| [Maintainer Guide](./maintainer-guide.md) | Workflow maintainer: setup, env, database, testing, build, deployment, dan aturan update docs. |
| [Brief](./brief.md) | Ringkasan eksekutif, informasi proyek, tech stack, latar belakang, dan tujuan. |
| [PRD](./prd.md) | Target pengguna, scope MVP, fitur detail, user journey, permission, bisnis, dan gap operasional MVP. |
| [Technical Spec](./technical-spec.md) | State machine, arsitektur data, constraint, payment retry, refund, withdrawal, dan ops teknis. |
| [Project Plan](./project-plan.md) | Success metrics, risiko, roadmap, milestone, dan keputusan MVP. |
| [Testing Strategy](./testing-strategy.md) | Strategi testing, Hybrid TDD, test layer, local harness, DB integration, dan future CI/E2E. |
| [Phase 1 Docs](./phase-1/README.md) | Dokumen kerja dan task spec Foundation. |
| [Phase 2 Docs](./phase-2/README.md) | Dokumen kerja dan task spec Organization & Venue Profile Onboarding. |

## Cara Membaca

| Situasi | Mulai dari |
| --- | --- |
| Maintainer baru yang perlu menjalankan repo | [Maintainer Guide](./maintainer-guide.md), lalu root [README](../README.md). |
| Ingin memahami produk | [Brief](./brief.md), lalu [PRD](./prd.md). |
| Akan mengubah arsitektur/data model | [Technical Spec](./technical-spec.md), [Project Plan](./project-plan.md), dan phase decision log terkait. |
| Akan menambah test atau mengubah test harness | [Testing Strategy](./testing-strategy.md) dan [Maintainer Guide](./maintainer-guide.md). |
| Akan mengerjakan Phase 2 | [Phase 2 README](./phase-2/README.md), [Phase 2 Breakdown](./phase-2/breakdown.md), dan task spec terkait. |
| Perlu mengecek keputusan historis | `decision-log.md` di phase terkait. |

## Konvensi Route

Current implemented routes:

- **Auth UI:** `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`, `/verify-email`
- **Auth aliases:** `/login` redirects to `/sign-in`, `/register` redirects to `/sign-up`
- **Public marketplace shell:** `/`, `/venues`
- **Dashboard pengguna:** `/dashboard`, `/dashboard/bookings`, `/dashboard/profile`, `/dashboard/settings`, `/dashboard/support`
- **Venue management shell:** `/dashboard/venue`
- **Super Admin shell:** `/admin`
- **Access/error pages:** `/unauthorized`, `/forbidden`, app-level error and not-found UI
- **Auth API route handler:** `/api/auth/[...all]`

Planned routes from later milestones should stay documented as planned until implemented. Examples include venue detail pages, onboarding flows, venue booking/staff/finance pages, admin ops pages, booking/payment APIs, and cron routes.

## Documentation Maintenance Rules

- Update docs in the same change that changes commands, env, routes, schema, or behavior.
- Keep task status current in each phase `breakdown.md`.
- Add a decision-log entry when scope, dependency order, security posture, or milestone boundaries change.
- Do not mark planned product behavior as implemented.
- Keep maintainer workflows in [Maintainer Guide](./maintainer-guide.md) aligned with `package.json`, `.env.example`, Docker Compose, Prisma, and test configs.
