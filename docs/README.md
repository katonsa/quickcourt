# Dokumentasi MVP

---

## Tentang Quickcourt

**Quickcourt** adalah platform marketplace berbasis web untuk pemesanan lapangan olahraga secara online di Indonesia. Platform ini menghubungkan customer yang ingin mencari dan memesan lapangan dengan venue owner yang ingin memasarkan, mengelola, dan memonetisasi lapangannya secara digital.

---

## Dokumen Proyek

| Dokumen                                       | Isi                                                                                                 |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| [**Brief**](./brief.md)                       | Ringkasan eksekutif, informasi proyek, tech stack, latar belakang, dan tujuan                       |
| [**PRD**](./prd.md)                           | Target pengguna, scope MVP, fitur detail, user journey, permission, bisnis, dan gap operasional MVP |
| [**Technical Spec**](./technical-spec.md)     | State machine, arsitektur data, constraint, payment retry, refund, withdrawal, dan ops teknis       |
| [**Project Plan**](./project-plan.md)         | Success metrics, risiko, roadmap, milestone, keputusan MVP                                          |
| [**Testing Strategy**](./testing-strategy.md) | Strategi testing, Hybrid TDD, test layer                                                            |
| [**Phase 1 Docs**](./phase-1/README.md)       | Dokumen kerja dan task spec Foundation untuk AI/developer                                           |

---

### Cara Membaca

- **Baru bergabung?** Mulai dari [Brief](./brief.md) untuk memahami konteks dan tech stack.
- **Ingin tahu fitur apa saja?** Baca [PRD](./prd.md).
- **Akan mulai coding?** Baca [Technical Spec](./technical-spec.md), [Project Plan](./project-plan.md), lalu [Testing Strategy](./testing-strategy.md).
- **Ingin tahu timeline dan keputusan?** Baca [Project Plan](./project-plan.md).

### Konvensi Route MVP

- **Auth UI:** `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`, `/verify-email`
- **Auth aliases:** `/login` redirects to `/sign-in`, `/register` redirects to `/sign-up`
- **Marketplace publik:** `/venues`, `/venues/[venueSlug]`
- **Dashboard pengguna:** `/dashboard`, `/dashboard/bookings`, `/dashboard/profile`, `/dashboard/settings`, `/dashboard/support`
- **Venue management:** `/dashboard/venue`, `/dashboard/venue/bookings`, `/dashboard/venue/staff`, `/dashboard/venue/finance`, `/dashboard/venue/*`
- **Super Admin:** `/admin`, `/admin/ops`, `/admin/venues`, `/admin/settings`, `/admin/*`
