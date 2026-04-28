# Project Plan

> [!NOTE]
> Dokumen ini menjabarkan **metrics, risiko, roadmap, dan milestone** Quickcourt MVP.
> Untuk ringkasan eksekutif, lihat [Brief](./brief.md).
> Untuk kebutuhan fitur, lihat [PRD](./prd.md).
> Untuk spesifikasi teknis, lihat [Technical Spec](./technical-spec.md).
> Untuk strategi testing, lihat [Testing Strategy](./testing-strategy.md).

---

## 1. Success Metrics MVP

### 1.1 Business Metrics

- Minimal 10 venue aktif dalam 3 bulan pertama setelah launch.
- Minimal 100 successful bookings dalam periode validasi awal.
- GMV tercatat dan dapat direkonsiliasi dengan payment gateway.
- Komisi platform tercatat melalui ledger.
- Minimal 30% booking berasal dari repeat customer setelah periode awal.

### 1.2 Product Metrics

- Customer dapat menyelesaikan alur cari → booking → bayar → confirmed.
- Venue owner dapat onboarding tanpa bantuan teknis besar.
- Venue staff dapat mengelola jadwal harian.
- Booking creation flow selesai dalam waktu yang wajar.
- Search page response time di bawah 2 detik untuk dataset awal.

### 1.3 Reliability Metrics

- Zero critical bug pada alur payment, webhook, refund, dan withdrawal.
- Zero double-booking pada court dan slot yang sama.
- Webhook payment tidak memproses event duplikat.
- Ledger balance dapat direkonsiliasi.
- Tidak ada booking confirmed tanpa payment valid, kecuali booking manual yang memang diizinkan oleh rule operasional.

---

## 2. Risiko & Mitigasi

### Risiko 1 — Scope MVP terlalu besar

**Mitigasi:** Prioritaskan booking, payment, venue management dasar, dan ledger. Fitur nice-to-have seperti promo, dark mode, dan analytics lanjutan ditunda.

### Risiko 2 — Double-booking akibat concurrent request

**Mitigasi:** Gunakan application-level validation dan PostgreSQL exclusion constraint berbasis `tstzrange`.

### Risiko 3 — Payment webhook diproses ganda

**Mitigasi:** Simpan webhook event dan gunakan idempotency key yang kuat.

### Risiko 4 — Status booking/payment tidak konsisten

**Mitigasi:** Buat state machine eksplisit dan update status hanya melalui service layer.

### Risiko 5 — Refund terlalu kompleks untuk MVP

**Mitigasi:** Siapkan model data refund dan snapshot policy sejak awal, tetapi otomasi penuh dapat dipersempit pada MVP.

### Risiko 6 — Venue tetap nyaman memakai WhatsApp

**Mitigasi:** Sediakan booking manual, dashboard jadwal sederhana, dan proses check-in yang cepat.

### Risiko 7 — Data keuangan tidak mudah diaudit

**Mitigasi:** Gunakan ledger pattern dan audit log untuk aksi finansial penting.

### Risiko 8 — Payment gagal/tertunda membuat customer bingung

**Mitigasi:** Sediakan countdown payment, tombol lanjutkan pembayaran, payment failed email, dan state machine retry/expiry yang eksplisit.

### Risiko 9 — Support/dispute operasional tidak tertangani

**Mitigasi:** Sediakan form bantuan sederhana dari detail booking/payment/refund/withdrawal dan halaman admin ops untuk investigasi manual.

---

## 3. Roadmap Pengembangan

| Fase                | Fokus                 | Output                                                                                       |
| ------------------- | --------------------- | -------------------------------------------------------------------------------------------- |
| **MVP v1.0 / v1.1** | Core marketplace      | Search, booking, payment, retry/expiry, venue management, staff, support basic, ledger dasar |
| **v1.2**            | Operational hardening | Refund lebih matang, check-in penuh, invoice PDF, reconciliation tools                       |
| **v2 — Growth**     | Retensi & akuisisi    | Promo, voucher, PWA, WhatsApp notification, multi-cabang UI                                  |
| **v3 — Scale**      | Ekspansi platform     | Mobile app, kiosk mode, featured venue, open API, analytics lanjutan                         |

---

## 4. Milestone Implementasi MVP

Milestone berikut disusun agar tiap fase punya boundary yang jelas untuk dokumen kerja dan task spec. Test service-layer tetap ditulis sebagai bagian dari milestone terkait; Milestone 9 fokus pada hardening lintas area, E2E, dan release readiness.

### Milestone 1 — Foundation

Detailed Phase 1 working docs and implementation task specs live in [`docs/phase-1/`](./phase-1/README.md).

- Setup project Next.js 16 + TypeScript strict.
- Setup PostgreSQL 17 (Docker) dan Prisma v7, dengan runtime client di `lib/db.ts`.
- Migration schema + migration constraint PostgreSQL terpisah; constraint PostgreSQL khusus menjadi source of truth di raw SQL migration.
- Setup Better Auth email/password + Admin Plugin + Organization Plugin.
- Auth UI: login, register, logout, email verification, forgot/reset password, dan change password.
- Resend email sender abstraction + development console fallback.
- Better Auth built-in `rateLimit` untuk endpoint auth.
- Role-based route protection dan access helper dasar.
- Seed script idempotent, termasuk admin bootstrap path dan optional seed organization untuk development/test tanpa raw-seeding credential Better Auth.
- UI library (shadcn/ui) + shell layouts: public marketplace `/venues`, user dashboard `/dashboard`, venue management `/dashboard/venue`, admin `/admin`.
- Structured logging (Pino) — setup dari awal agar semua service layer konsisten.
- Global error boundary + route group error pages.
- Testing infrastructure (Vitest + test DB) dan CI foundation untuk lint/typecheck/test.

### Milestone 2 — Organization & Venue Profile Onboarding

- Super Admin creates Organization + invites venue owner.
- Owner accepts invitation and can access `/dashboard/venue`.
- Venue profile draft creation and data entry.
- Branch default draft (auto-created).
- Venue photos (Uploadthing).
- Sport dan facility mapping di level venue/profile.
- Bank account management dengan masking dan audit.
- Manual bank account verification oleh Super Admin.
- Owner invitation email dan minimal onboarding status email.
- Unit & integration test untuk service layer Milestone 2.

> [!NOTE]
> Milestone 2 belum mem-publish venue ke marketplace. Approval/publish final dilakukan setelah operational setup selesai di Milestone 3.

### Milestone 3 — Court, Schedule, Pricing & Venue Approval

- CRUD court.
- Operating hours.
- Price rules (weekday, weekend, peak hour, custom).
- Availability block.
- Slot availability calculation (on-the-fly).
- Operational readiness validation: venue punya minimal satu court aktif, operating hours, dan pricing yang valid.
- Submit venue for approval.
- Super Admin approve/reject completed venue.
- Approved venue becomes visible in marketplace.

### Milestone 4 — Marketplace & Booking Core

- Public venue listing and venue detail page.
- Availability selection for court/date/time.
- Customer booking flow (contiguous slots only).
- BookingSlot generation.
- Anti-overlap validation (application + exclusion constraint).
- Booking code generation (`QC-` + nanoid).
- Booking status lifecycle (state machine).
- Booking history (upcoming, completed, cancelled, expired).
- Cancellation/refund policy snapshot saat booking dibuat.
- Checkout policy consent.
- Walk-in booking dengan customer snapshot fields.

### Milestone 5 — Payment, Webhook & Transaction Posting

- Xendit payment creation (Invoice API).
- Payment status tracking.
- Payment countdown dan lanjutkan pembayaran dari booking detail.
- Payment failed/expired/retry flow.
- Webhook endpoint dengan callback token verification.
- Webhook event storage.
- Idempotent webhook processing.
- Booking confirmation after payment success.
- Booking expiry (30 menit — lazy check + `/api/cron/expire-bookings`).
- Minimal ledger transaction posting pada payment success: gross booking, platform commission snapshot, gateway fee jika tersedia, dan idempotency key ledger.

> [!NOTE]
> Milestone 5 mulai mencatat ledger entries untuk transaksi online agar tidak perlu backfill finansial. UI finance, withdrawal, reconciliation, dan adjustment tetap Milestone 7.

### Milestone 6 — Venue Operations & Staff

- Booking calendar/list di `/dashboard/venue/bookings`.
- Booking detail.
- Booking manual/walk-in (customer snapshot).
- Staff management: invite, revoke, assign branch, permission.
- Support request entry point dari booking/payment/refund issue.
- Manual check-in (tombol di venue management).
- Status update.
- Booking auto-complete lazy check + `/api/cron/complete-bookings`.

> [!NOTE]
> Support di Milestone 6 adalah intake/entry point sederhana. Full admin investigation dan transaction ops tetap Milestone 7.

### Milestone 7 — Finance, Refund, Withdrawal & Admin Ops

- Venue balance calculation dari ledger.
- Transaction history.
- Withdrawal request dengan minimum amount dan status lifecycle.
- Refund trigger semi-manual + refund status.
- Refund ledger impact dan failure handling.
- Admin transaction ops: booking/payment/webhook/refund/withdrawal/ledger search.
- Manual adjustment dengan audit log.
- Invoice/receipt dasar.
- Ledger settlement cron (`/api/cron/settle-ledger`).
- Reconciliation support dasar.

### Milestone 8 — Notification Workflows

- Email booking confirmation.
- Email booking reminder.
- Booking reminder cron (`/api/cron/send-reminders`).
- Email payment failed/expired.
- Email payment/refund update.
- Email withdrawal update.
- Notification template standardization.
- Notification logging, retry behavior, dan preference dasar jika feasible.

> [!NOTE]
> Auth email foundation, owner invitation email, dan staff invitation email dikerjakan pada milestone yang membutuhkan flow tersebut. Milestone 8 fokus pada workflow notification lintas booking, payment, refund, dan finance.

### Milestone 9 — Hardening, E2E & Release Readiness

> Detail strategi: [Testing Strategy](./testing-strategy.md)

- **E2E test** (Playwright) — full user journeys:
  - Customer booking flow (search → book → pay → confirmed).
  - Venue onboarding flow (invite → accept → operational setup → approve).
  - Walk-in booking oleh staff.
  - Admin approval workflow.
- **Race condition test** (double-booking via concurrent requests).
- **Payment webhook duplicate test** (idempotency verification).
- **Booking expiry test** (30 menit + sweep correctness).
- **Payment retry test** (failed/expired/late webhook + retry behavior).
- **Refund test** (cancellation policy evaluation + ledger impact + failure handling).
- **Withdrawal test** (requested → processing → paid/failed + ledger impact).
- **Ledger reconciliation test** (balance = sum credits - sum debits).
- **Permission test** (role-based access enforcement).
- **Venue approval/suspension test** (status lifecycle).
- **Custom non-auth rate limiting** (@upstash/ratelimit) untuk endpoint kritis seperti booking create dan webhook jika diperlukan.
- **Cron job testing** (booking expiry sweep, auto-complete, ledger settlement, reminder — idempotency).
- CI/CD hardening and release gates — memperketat pipeline yang sudah dibuat di Milestone 1.

> [!NOTE]
> QuickCourt menggunakan **Hybrid TDD** — test ditulis sebelum implementasi service layer.
> Setiap milestone menyertakan TDD test yang embedded di pekerjaan service layer, bukan task terpisah.
> Milestone 9 fokus pada **E2E test, race condition, release gates, dan hardening** yang melintasi banyak area.

---

## 5. Definition of Done MVP

MVP dianggap selesai jika:

1. Customer dapat register, login, mencari venue, memilih slot, booking, dan membayar.
2. Booking berhasil berubah menjadi confirmed setelah payment sukses.
3. Sistem mencegah double-booking secara application-level dan database-level.
4. Venue Owner dapat onboarding, mengelola venue, branch, court, jadwal, dan harga.
5. Venue Staff dapat melihat jadwal dan mengelola booking sesuai permission.
6. Super Admin dapat approve/reject venue.
7. Payment webhook diproses secara idempotent.
8. Ledger tercatat untuk transaksi utama.
9. Venue dapat melihat pendapatan dan mengajukan withdrawal manual.
10. Customer dan venue menerima notifikasi email dasar.
11. Audit log tersedia untuk aksi penting.
12. Tidak ada critical bug pada booking, payment, refund, withdrawal, atau ledger.
13. Customer dapat reset password dan melanjutkan pembayaran pending selama belum expired.
14. Staff management dasar tersedia untuk invite/revoke/permission.
15. Support/dispute basic dan admin transaction ops tersedia untuk investigasi manual.
16. Checkout menyimpan policy consent dan snapshot cancellation/refund policy.

---

## 6. Keputusan MVP (Resolved)

> Keputusan berikut telah dikunci pada 27 April 2026 dan berlaku untuk seluruh implementasi MVP.

| #   | Pertanyaan                                       | Keputusan                                                                                                                  | Catatan                                                                                                                                                                                                                                                                                                                     |
| --- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Booking manual boleh tanpa payment online?       | **Ya**                                                                                                                     | Status langsung `confirmed`, `paymentStatus = unpaid`, dan tidak membuat `Payment` Xendit. Jika dibayar offline, Venue Owner atau Staff dengan `canManageBookings` boleh menandai `paymentStatus = paid`; aksi wajib masuk `AuditLog`, dikecualikan dari rekonsiliasi Xendit, dan tidak menambah saldo withdrawal platform. |
| 2   | Semua booking online wajib full payment di muka? | **Ya**                                                                                                                     | Tidak ada partial payment di MVP. Full amount saat checkout.                                                                                                                                                                                                                                                                |
| 3   | Durasi expiry payment setelah booking dibuat?    | **30 menit**                                                                                                               | Booking otomatis expired jika payment belum selesai dalam 30 menit. Cukup untuk QRIS dan VA.                                                                                                                                                                                                                                |
| 4   | Refund otomatis atau semi-manual?                | **Semi-manual**                                                                                                            | Admin/owner trigger refund dari dashboard, sistem eksekusi via Xendit. Tidak ada auto-refund.                                                                                                                                                                                                                               |
| 5   | Default cancellation policy?                     | **Platform-level policy: free cancel ≥24 jam sebelum sesi; late cancel <24 jam sebelum sesi tetap boleh tetapi no refund** | Policy dibaca dari `PlatformSetting.default_cancellation_policy` dan di-snapshot pada booking saat dibuat. Perubahan policy hanya berlaku untuk booking baru.                                                                                                                                                               |
| 6   | QR check-in atau manual check-in?                | **Manual check-in**                                                                                                        | QR check-in ditunda ke v1.2. MVP cukup tombol check-in di venue management.                                                                                                                                                                                                                                                 |
| 7   | Invoice PDF wajib?                               | **Tidak**                                                                                                                  | MVP cukup receipt web. PDF invoice ditunda ke v1.2. Data invoice tetap disimpan lengkap.                                                                                                                                                                                                                                    |
| 8   | Staff buat booking manual tanpa approval owner?  | **Ya**                                                                                                                     | Trust model — staff yang diberi akses `canManageBookings` boleh buat booking langsung. Semua aksi tercatat di audit log.                                                                                                                                                                                                    |
| 9   | Venue atur komisi sendiri?                       | **Tidak**                                                                                                                  | Hanya Super Admin yang mengatur komisi via `PlatformSetting`. Field `defaultCommissionBps` di venue disiapkan untuk v2.                                                                                                                                                                                                     |
| 10  | Settlement delay sebelum saldo available?        | **T+1 hari**                                                                                                               | Saldo venue dari transaksi online menjadi `available` setelah sesi booking selesai (`completed`), bukan saat payment masuk. Booking paid offline tidak menambah saldo withdrawal karena uang diterima langsung oleh venue.                                                                                                  |
| 11  | Customer cancel setelah batas refund?            | **Bisa, sebelum sesi mulai**                                                                                               | Jika <24 jam sebelum sesi, booking menjadi `cancelled` tanpa refund; `paymentStatus` tetap `paid`. Setelah sesi mulai, cancellation tidak diizinkan.                                                                                                                                                                        |
| 12  | Review hanya setelah booking completed?          | **Ya**                                                                                                                     | Guard di service layer — review hanya bisa dibuat jika `booking.status === completed`.                                                                                                                                                                                                                                      |
| 13  | No-show tetap masuk revenue venue?               | **Ya**                                                                                                                     | Venue tetap mendapat revenue penuh. Tidak ada refund otomatis untuk no-show.                                                                                                                                                                                                                                                |
| 14  | Branch default otomatis saat venue onboarding?   | **Ya**                                                                                                                     | Sistem otomatis membuat satu branch default (`isDefault: true`) saat venue pertama kali didaftarkan.                                                                                                                                                                                                                        |
| 15  | Dispute handling?                                | **Manual via Super Admin**                                                                                                 | Tidak ada dispute engine di MVP. Customer menghubungi support, Super Admin menyelesaikan secara manual via dashboard.                                                                                                                                                                                                       |
| 16  | Forgot/reset password masuk MVP?                 | **Ya**                                                                                                                     | Semua role menggunakan email/password; recovery dibutuhkan agar customer/venue tidak terkunci dari booking atau operasional.                                                                                                                                                                                                |
| 17  | Payment retry masuk MVP?                         | **Ya, selama booking belum expired**                                                                                       | Customer dapat lanjutkan pembayaran aktif atau retry payment sesuai constraint gateway. Setelah booking expired, customer harus membuat booking baru.                                                                                                                                                                       |
| 18  | Reschedule booking masuk MVP?                    | **Tidak**                                                                                                                  | Customer cancel lalu booking ulang. Staff tidak boleh memindahkan slot tanpa flow baru dan audit yang jelas.                                                                                                                                                                                                                |
| 19  | Staff management masuk MVP?                      | **Ya**                                                                                                                     | Owner dapat invite/revoke staff, assign branch, dan mengatur permission dasar.                                                                                                                                                                                                                                              |
| 20  | Bank account change butuh audit?                 | **Ya**                                                                                                                     | Rekening dimasking di UI, hanya satu primary, perubahan rekening masuk audit log, verifikasi manual oleh Super Admin.                                                                                                                                                                                                       |
| 21  | Legal consent saat checkout?                     | **Ya**                                                                                                                     | Customer harus menyetujui cancellation/refund policy; snapshot policy disimpan di booking.                                                                                                                                                                                                                                  |
| 22  | Admin transaction ops masuk MVP?                 | **Ya, versi basic**                                                                                                        | Minimal cari booking/payment/webhook/refund/withdrawal/ledger dan manual adjustment dengan reason + audit log.                                                                                                                                                                                                              |

---

## 7. Rekomendasi Fokus MVP

Quickcourt MVP sebaiknya tidak diperlakukan sebagai aplikasi booking sederhana. Berdasarkan arah produk dan struktur schema yang sudah disiapkan, MVP paling tepat diposisikan sebagai:

**Marketplace booking lapangan olahraga dengan pembayaran online, manajemen venue, dan fondasi ledger keuangan.**

Fokus utama implementasi:

1. Booking flow harus reliable.
2. Payment webhook harus aman dan idempotent.
3. Double-booking harus mustahil secara database.
4. Venue management di `/dashboard/venue` harus cukup nyaman untuk operasional harian.
5. Ledger harus benar sejak awal.
6. Payment failure, refund, withdrawal, dan support/dispute harus punya jalur operasional meskipun masih semi-manual.
7. Scope growth seperti promo, loyalty, dan mobile app harus ditunda sampai core marketplace stabil.
