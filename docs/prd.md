# Product Requirements Document (PRD)

> [!NOTE]
> Dokumen ini menjabarkan **fitur, scope, dan kebutuhan produk** Quickcourt MVP.
> Untuk ringkasan eksekutif, lihat [Brief](./brief.md).
> Untuk spesifikasi teknis, lihat [Technical Spec](./technical-spec.md).
> Untuk roadmap dan milestone, lihat [Project Plan](./project-plan.md).

---

## 1. Target Pengguna & Role

| Role            | Deskripsi                                       | Scope Akses                |
| --------------- | ----------------------------------------------- | -------------------------- |
| **Customer**    | Pengguna umum yang mencari dan memesan lapangan | Self-service               |
| **Venue Owner** | Pemilik atau pengelola utama venue              | Venue-level management     |
| **Venue Staff** | Staff operasional harian venue                  | Terbatas sesuai permission |
| **Super Admin** | Tim internal Quickcourt                         | Platform-wide management   |

Catatan akses: Venue Owner dan Venue Staff tetap dapat memakai fitur Customer seperti riwayat booking, profil, dan pengaturan akun. Akses venue management adalah akses tambahan berbasis membership Organization, bukan pengganti akses Customer.

### 1.0 Route Area MVP

| Area               | URL                                                                              | Akses                                 |
| ------------------ | -------------------------------------------------------------------------------- | ------------------------------------- |
| Marketplace publik | `/venues`, `/venues/[venueSlug]`                                                 | Public                                |
| Dashboard pengguna | `/dashboard`, `/dashboard/bookings`, `/dashboard/profile`, `/dashboard/settings` | Semua user login                      |
| Venue management   | `/dashboard/venue`, `/dashboard/venue/*`                                         | Venue Owner / Staff sesuai permission |
| Super Admin        | `/admin`, `/admin/*`                                                             | Super Admin                           |

### 1.1 Customer

Customer adalah individu atau grup yang ingin memesan lapangan olahraga seperti futsal, badminton, tenis, padel, basket, voli, squash, dan olahraga lain yang tersedia di platform.

Kebutuhan utama:

- Mencari venue.
- Melihat detail venue dan lapangan.
- Melihat slot tersedia.
- Membuat booking.
- Membayar booking.
- Membatalkan booking sesuai kebijakan.
- Melihat riwayat transaksi dan booking.

### 1.2 Venue Owner

Venue Owner adalah pihak yang mendaftarkan dan mengelola venue di Quickcourt.

Kebutuhan utama:

- Mendaftarkan venue.
- Mengelola data venue, cabang, lapangan, foto, fasilitas, dan olahraga.
- Mengatur jam operasional dan harga.
- Melihat dan mengelola booking.
- Mengundang staff.
- Melihat pendapatan dan saldo.
- Mengajukan withdrawal.

### 1.3 Venue Staff

Venue Staff adalah karyawan venue yang membantu operasional harian.

Akses MVP:

- Melihat jadwal booking.
- Mengelola booking jika diberi permission.
- Melakukan manual check-in jika diberi permission.
- Tidak dapat mengakses pengaturan sensitif atau data keuangan kecuali diberi izin khusus.

### 1.4 Super Admin

Super Admin adalah tim internal Quickcourt.

Akses MVP:

- Review, approve, reject, suspend, atau ban venue.
- Mengelola user bermasalah.
- Mengelola master data olahraga, kota, dan fasilitas.
- Mengelola komisi platform.
- Melihat analytics dasar platform.
- Melakukan audit terhadap aktivitas penting.

---

## 2. Scope MVP

MVP Quickcourt dibagi menjadi tiga prioritas:

- **Must Have:** wajib untuk transaksi marketplace berjalan.
- **Should Have:** penting, tetapi bisa dibuat sederhana.
- **Could Have:** berguna, tetapi dapat ditunda jika menghambat rilis MVP.

---

## 3. MVP Must Have

### 3.1 Customer — Akun & Profil

- Register menggunakan email dan password.
- Login dan logout.
- Email verification disiapkan melalui flow auth; MVP boleh membatasi booking hanya untuk user dengan email terverifikasi jika risiko fraud meningkat.
- Forgot password / reset password via email.
- Ganti password dari halaman settings.
- Edit profil dasar.
- Simpan nomor HP.
- Customer wajib login sebelum melakukan booking.

### 3.2 Customer — Discovery & Search

- Melihat daftar venue aktif.
- Cari venue berdasarkan kota.
- Cari venue berdasarkan jenis olahraga.
- Cari venue berdasarkan nama venue.
- Sorting dasar: harga termurah dan rating tertinggi.
- Melihat detail venue:
  - nama, deskripsi, foto, alamat, Google Maps Embed, fasilitas, jenis olahraga, rating, daftar lapangan.

### 3.3 Customer — Booking

- Pilih venue, lapangan, tanggal.
- Pilih satu atau beberapa slot waktu berturutan (contiguous). Slot terpisah menghasilkan booking terpisah.
- Melihat harga sebelum checkout.
- Membuat booking online.
- Booking memiliki kode unik dan status yang jelas.
- Melihat detail booking.
- Melihat riwayat booking: upcoming, completed, cancelled, expired.

### 3.4 Customer — Payment

- Pembayaran online penuh di muka.
- Payment gateway menggunakan Xendit.
- Metode pembayaran MVP: QRIS, virtual account / bank transfer, kartu debit/kredit jika tersedia dari gateway.
- Customer diarahkan ke checkout/payment page.
- Customer melihat countdown batas waktu pembayaran pada detail booking `pending_payment`.
- Customer dapat membuka ulang detail booking dan melanjutkan pembayaran selama invoice belum expired.
- Jika payment gagal tetapi booking belum expired, customer dapat mencoba pembayaran ulang sesuai aturan gateway.
- Sistem menerima webhook pembayaran.
- Booking dikonfirmasi setelah payment sukses.
- Booking expired jika payment tidak dibayar sampai batas waktu.
- Jika payment gagal/expired, UI harus menjelaskan bahwa customer perlu retry sebelum expiry atau membuat booking baru jika booking sudah expired.

### 3.5 Customer — Cancellation & Refund Dasar

- Customer dapat membatalkan booking sebelum sesi mulai sesuai aturan platform: free cancel ≥24 jam sebelum sesi; late cancel <24 jam sebelum sesi tetap boleh tetapi no refund.
- Cancellation policy MVP berada di level platform, dikelola melalui `PlatformSetting.default_cancellation_policy`, bukan hardcoded dan bukan per-venue.
- Sistem menyimpan snapshot kebijakan pembatalan saat booking dibuat. Perubahan policy hanya berlaku untuk booking baru dan tidak mengubah hak/refund booking lama.
- Refund diproses semi-manual: admin/owner trigger dari dashboard, sistem eksekusi via Xendit.
- Detail booking customer menampilkan eligibility refund, nominal estimasi refund, dan status refund jika ada.
- Status refund minimal: `pending`, `processing`, `succeeded`, `failed`, `cancelled`.
- Refund gagal tidak boleh mengubah ledger menjadi seolah-olah refund berhasil; user melihat status gagal dan support/admin dapat menindaklanjuti.
- Untuk MVP, refund automation dibuat sederhana, tetapi struktur data harus siap untuk refund otomatis penuh.

### 3.6 Venue Owner — Onboarding

- Super Admin membuat Organization dan menginvite user sebagai venue owner.
- User menerima invitation dan accept → mendapat akses venue management di `/dashboard/venue`.
- Venue Owner mengisi profil awal venue: nama venue, legal business name jika ada, alamat, kota, nomor kontak, foto, jenis olahraga, fasilitas, dan rekening bank.
- Venue dibuat sebagai `draft` selama profil, branch default, court, schedule, pricing, dan rekening bank belum lengkap.
- Venue baru masuk status `pending_approval` setelah operational setup lengkap: minimal satu court aktif, operating hours, pricing, dan data bank yang diperlukan.
- Super Admin melakukan approval/rejection setelah review operational setup. Venue approved baru tampil di marketplace.

### 3.7 Venue Owner — Venue & Branch Management

- Mengelola profil venue.
- Mengelola branch/cabang.
- MVP UI dapat fokus pada satu branch default, tetapi database tetap branch-ready.
- Mengelola alamat, kontak, Google Maps Embed, timezone, dan status branch.
- Mengelola foto venue dan foto branch.

### 3.8 Venue Owner — Court Management

- Tambah dan edit lapangan.
- Set jenis olahraga per lapangan.
- Set harga dasar lapangan.
- Set durasi slot.
- Upload foto lapangan.
- Set status lapangan: active, inactive, maintenance.

### 3.9 Venue Owner — Schedule & Pricing

- Set jam operasional per lapangan.
- Set harga dasar.
- Set price rule sederhana: weekday, weekend, peak hour, custom.
- Price rule memiliki prioritas.
- Harga yang dipakai pada booking harus disimpan sebagai snapshot.

### 3.10 Venue Owner / Staff — Booking Management

- Melihat booking harian dan mingguan.
- Melihat detail booking.
- Membuat booking manual untuk customer walk-in.
- Mengubah status booking sesuai permission.
- Menandai booking sebagai completed.
- Menandai booking sebagai no-show.
- Membatalkan booking dari sisi venue jika diperlukan.
- Staff hanya dapat mengakses branch yang diberikan.
- Booking detail menampilkan audit ringkas untuk perubahan status penting.

### 3.11 Availability Block

- Venue dapat memblokir slot untuk: maintenance, event, reserved, closed.
- MVP menggunakan **Opsi A**: venue harus menyelesaikan atau membatalkan booking aktif terlebih dahulu sebelum membuat block pada slot yang sudah terisi.
- Booking baru tidak boleh dibuat pada slot yang terkena active availability block.

### 3.12 Check-in Dasar

- Venue Staff melakukan manual check-in melalui tombol di venue management.
- Check-in tercatat sebagai audit operasional.
- QR check-in ditunda ke v1.2.

### 3.13 Finance & Ledger

- Setiap pembayaran sukses menghasilkan ledger entry untuk venue.
- Komisi platform dihitung dan disimpan sebagai snapshot pada booking.
- Pendapatan venue dicatat sebagai net amount.
- Ledger digunakan sebagai sumber kebenaran untuk saldo venue.
- Venue dapat melihat riwayat transaksi.
- Venue dapat melihat saldo `pending`, `available`, dan `settled` jika status ledger tersedia.
- Venue dapat mengajukan withdrawal manual/on-demand.
- Withdrawal MVP memiliki aturan minimum amount, settlement delay, status jelas, dan riwayat perubahan.
- Perubahan rekening bank venue wajib diaudit dan rekening utama hanya boleh satu.

### 3.14 Invoice / Receipt Dasar

- Sistem membuat invoice atau receipt untuk booking.
- Invoice menyimpan line item per slot booking.
- MVP hanya wajib menampilkan receipt web dan menyimpan data invoice lengkap.
- PDF invoice ditunda ke v1.2.

### 3.15 Super Admin

- Review venue baru. Approve atau reject venue.
- Suspend atau ban venue bermasalah. Suspend user bermasalah.
- Kelola master data: sport, city, facility.
- Kelola komisi platform melalui setting, bukan hardcoded.
- Melihat analytics dasar: total venue aktif, total booking, total transaksi, booking per hari, GMV, platform commission.
- Mencari booking berdasarkan booking code, customer, venue, tanggal, dan status.
- Mencari payment berdasarkan `externalId`, `gatewayInvoiceId`, dan status.
- Melihat webhook event, status pemrosesan, dan error message untuk investigasi.
- Melihat ledger entries per booking/payment/refund/withdrawal.
- Melakukan manual adjustment finansial dengan audit log dan reason wajib.

### 3.16 Notification MVP

- Email konfirmasi booking.
- Email payment success.
- Email payment failed/expired.
- Email booking reminder.
- Email cancellation/refund update.
- Email staff invitation.
- Email withdrawal update.
- Email venue approval/rejection.
- WhatsApp disiapkan secara enum/channel, tetapi tidak wajib aktif di MVP.

### 3.17 Venue Owner — Staff Management

- Venue Owner dapat melihat daftar staff.
- Venue Owner dapat mengundang staff via email.
- Venue Owner dapat revoke akses staff.
- Venue Owner dapat assign staff ke branch tertentu.
- Venue Owner dapat mengatur permission dasar: view schedule, manage bookings, check-in, view finance.
- Staff yang dihapus/revoked langsung kehilangan akses venue management.
- Perubahan staff dan permission wajib masuk audit log.

### 3.18 Payment Failure & Retry Flow

- Detail booking `pending_payment` menampilkan status payment saat ini dan tombol lanjutkan pembayaran.
- Jika Xendit invoice masih aktif, tombol lanjutkan pembayaran membuka `checkoutUrl` yang sama.
- Jika payment gagal tetapi booking belum expired, sistem dapat membuat attempt payment baru atau mengarahkan customer untuk memilih metode lain sesuai constraint gateway.
- Hanya payment attempt yang masih relevan dengan booking aktif yang boleh mengubah booking menjadi `confirmed`.
- Webhook terlambat dari payment lama harus diabaikan atau ditandai untuk investigasi jika booking sudah `expired`/`cancelled`.

### 3.19 Refund Request & Refund Status

- Customer dapat melihat apakah booking eligible refund setelah cancel.
- Customer dapat menghubungi support dari detail booking jika refund belum diterima atau refund gagal.
- Venue Owner atau Super Admin dapat trigger refund sesuai permission dan policy snapshot.
- Refund membutuhkan alasan dan actor.
- Customer dan venue dapat melihat status refund.
- Refund sukses membuat ledger refund debit; refund gagal tidak mengubah saldo venue.

### 3.20 Withdrawal & Bank Account Operations

- Venue Owner dapat melihat rekening bank aktif dan riwayat perubahan rekening.
- Venue Owner dapat menambah/mengubah rekening bank, tetapi hanya satu rekening yang dapat menjadi primary.
- Rekening bank ditampilkan dengan masking nomor rekening pada UI.
- Super Admin dapat melakukan verifikasi manual rekening bank.
- Withdrawal hanya dapat diajukan dari saldo `available`.
- Minimum withdrawal MVP dikonfigurasi di platform setting atau constant konfigurasi server.
- Status withdrawal minimal: `requested`, `approved`, `processing`, `paid`, `rejected`, `failed`, `cancelled`.
- Withdrawal gagal harus menampilkan alasan dan tidak boleh mengurangi saldo available secara final.

### 3.21 Support / Dispute Basic

- Detail booking menyediakan tombol “Butuh bantuan?” untuk customer.
- Venue dashboard menyediakan jalur bantuan untuk payment, refund, withdrawal, dan booking bermasalah.
- MVP tidak membutuhkan live chat; form dapat dikirim ke email/support queue internal.
- Support request wajib menyertakan konteks minimal: user, booking/payment/refund/withdrawal terkait, kategori, deskripsi, dan timestamp.
- Super Admin menyelesaikan dispute secara manual dan setiap aksi penting dicatat di audit log.

### 3.22 Legal & Policy Consent

- Halaman Terms of Service, Privacy Policy, Cancellation Policy, dan Refund Policy tersedia untuk MVP launch.
- Checkout menampilkan ringkasan cancellation/refund policy dan checkbox persetujuan.
- Booking menyimpan snapshot policy yang berlaku saat checkout.
- User tidak dapat menyelesaikan checkout tanpa menyetujui policy yang relevan.

### 3.23 Admin Transaction Operations

- Super Admin memiliki halaman ops untuk investigasi booking, payment, webhook, refund, withdrawal, ledger, dan audit log.
- Admin ops mengutamakan pencarian cepat berdasarkan booking code, email/customer, venue, payment external ID, dan tanggal.
- Manual adjustment hanya tersedia untuk Super Admin dan wajib reason.
- Semua tindakan admin terhadap transaksi keuangan wajib tercatat di audit log.

---

## 4. MVP Should Have

Fitur berikut penting, tetapi dapat dibuat sederhana pada MVP:

- Rating dan review setelah booking selesai.
- Dashboard pendapatan harian, mingguan, bulanan untuk venue.
- Filter availability berdasarkan tanggal, jam mulai, durasi, kota, dan olahraga langsung dari listing venue.
- Special hours / hari libur venue menggunakan availability block atau operating hour override sederhana.
- Review moderation/reporting oleh Super Admin.
- Notification preferences sederhana.
- QR check-in penuh.

---

## 5. MVP Could Have / Bisa Ditunda

- Dark mode.
- Sorting venue berdasarkan lokasi terdekat.
- Google Maps API penuh.
- Refund otomatis penuh untuk semua skenario.
- Dashboard analytics lanjutan.
- Promo dan diskon.
- Voucher code.
- Loyalty points.
- Referral program.
- Featured venue / iklan.
- Chat customer dan venue.
- Rental alat olahraga.
- Booking berulang / recurring booking.
- Mobile app native.
- Mode kiosk staff.

---

## 6. Di Luar Scope MVP

| Fitur                                  | Target | Catatan                                                                           |
| -------------------------------------- | ------ | --------------------------------------------------------------------------------- |
| Multi-cabang UI penuh                  | v2     | Database sudah branch-ready, UI MVP fokus sederhana                               |
| Reschedule booking                     | v1.2   | MVP: customer cancel lalu booking ulang; staff tidak memindahkan slot tanpa audit |
| Google OAuth                           | v2     | MVP pakai email/password                                                          |
| PWA                                    | v2     | Web responsive dulu                                                               |
| WhatsApp notification aktif            | v2     | MVP cukup email                                                                   |
| PDF invoice                            | v1.2   | MVP hanya receipt web dan data invoice tersimpan                                  |
| Promo & voucher                        | v2     | Butuh rule engine sendiri                                                         |
| Analytics lanjutan                     | v2     | MVP cukup dashboard dasar                                                         |
| Withdraw otomatis terjadwal            | v2     | MVP manual/on-demand                                                              |
| Refund massal otomatis saat block slot | v2     | MVP pakai Opsi A                                                                  |
| Mobile app iOS & Android               | v3     | Setelah web stabil                                                                |
| Open API                               | v3     | Setelah core marketplace mature                                                   |

---

## 7. User Journey Utama

### 7.1 Customer Booking Online

1. Customer membuka Quickcourt.
2. Customer mencari venue berdasarkan kota atau olahraga.
3. Customer membuka detail venue.
4. Customer memilih lapangan.
5. Customer memilih tanggal dan slot waktu.
6. Sistem menampilkan harga dan ringkasan booking.
7. Customer checkout.
8. Sistem membuat booking dengan status `pending_payment`.
9. Sistem membuat payment invoice melalui Xendit.
10. Customer melihat countdown batas waktu pembayaran dan diarahkan ke payment page.
11. Customer menyelesaikan pembayaran.
12. Webhook payment diterima.
13. Sistem mengubah booking menjadi `confirmed`.
14. Sistem mengirim email konfirmasi.
15. Customer datang ke venue.
16. Venue Staff melakukan check-in.
17. Setelah sesi selesai, booking ditandai `completed`.
18. Jika fitur review diaktifkan, customer dapat memberi rating dan review setelah booking `completed`.

### 7.2 Booking Manual / Walk-in oleh Venue Staff

1. Customer datang atau menghubungi venue secara offline.
2. Venue Staff membuka booking management di `/dashboard/venue/bookings`.
3. Staff memilih lapangan, tanggal, dan slot.
4. Staff memasukkan data customer manual.
5. Sistem memvalidasi slot tidak bentrok.
6. Staff membuat booking manual.
7. Booking tercatat dengan source `walk_in` atau `admin_created`.
8. Booking langsung berstatus `confirmed`, `paymentStatus = unpaid`, dan tidak membuat `Payment` Xendit.
9. Jika customer membayar offline ke venue, Venue Owner atau Staff dengan permission `canManageBookings` dapat menandai booking sebagai paid offline.
10. Paid offline mengubah `Booking.paymentStatus` menjadi `paid`, tetapi tetap tidak membuat record `Payment` Xendit.
11. Aksi paid offline wajib tercatat di `AuditLog` dengan nominal, metode offline, actor, dan timestamp.
12. Paid offline tidak menambah saldo withdrawal platform dan dikecualikan dari rekonsiliasi Xendit; pelaporannya dipisahkan dari online GMV.

### 7.3 Venue Onboarding

1. User register sebagai customer biasa.
2. User menghubungi Super Admin untuk mendaftarkan venue.
3. Super Admin membuat Organization dan menginvite user sebagai `owner`.
4. User menerima dan meng-accept invitation.
5. User mengakses `/dashboard/venue/onboarding` dan mengisi data venue.
6. Venue Owner mengisi branch default, lapangan, olahraga, harga, jam operasional, dan rekening bank.
7. Venue Owner submit approval.
8. Super Admin review.
9. Jika approved, venue tampil di marketplace.
10. Jika rejected, venue owner menerima alasan dan dapat memperbaiki data.

### 7.4 Withdrawal Venue

1. Payment customer sukses.
2. Sistem mencatat ledger gross booking.
3. Sistem mencatat platform commission dan gateway fee.
4. Saldo venue menjadi available sesuai aturan settlement.
5. Venue Owner memilih rekening bank primary yang sudah diverifikasi atau disetujui untuk MVP.
6. Venue Owner mengajukan withdrawal dari saldo available.
7. Super Admin atau sistem memproses withdrawal via Xendit.
8. Ledger mencatat withdrawal debit hanya melalui proses idempotent.
9. Status withdrawal diperbarui dan venue menerima notifikasi.

### 7.5 Payment Failed / Retry

1. Customer membuat booking online dan masuk ke payment page.
2. Payment gagal, customer menutup halaman, atau invoice masih pending.
3. Customer membuka detail booking `pending_payment`.
4. Sistem menampilkan status payment, countdown, dan tombol lanjutkan pembayaran.
5. Jika invoice masih aktif, customer diarahkan ke checkout URL yang sama.
6. Jika payment gagal tetapi booking belum expired, customer dapat mencoba ulang sesuai aturan gateway.
7. Jika booking sudah expired, customer harus membuat booking baru dan slot kembali tersedia.

### 7.6 Cancellation & Refund

1. Customer membuka detail booking.
2. Sistem menampilkan policy snapshot dan eligibility refund.
3. Customer membatalkan booking sebelum sesi mulai.
4. Jika eligible, sistem mencatat cancellation dan refund pending/processing.
5. Venue Owner atau Super Admin memproses refund semi-manual.
6. Customer melihat update status refund.
7. Jika refund gagal, customer dapat menghubungi support dari detail booking.

### 7.7 Support / Dispute Basic

1. Customer atau venue membuka detail booking/payment/refund/withdrawal bermasalah.
2. User klik “Butuh bantuan?”.
3. User memilih kategori dan mengisi deskripsi.
4. Sistem mengirim konteks ke support/admin queue.
5. Super Admin menyelesaikan manual dan mencatat aksi penting di audit log.

---

## 8. Permission Matrix MVP

| Aksi                     | Customer |       Venue Staff | Venue Owner | Super Admin |
| ------------------------ | -------: | ----------------: | ----------: | ----------: |
| Melihat venue aktif      |       Ya |                Ya |          Ya |          Ya |
| Membuat booking online   |       Ya |                Ya |          Ya |          Ya |
| Melihat booking sendiri  |       Ya |                Ya |          Ya |          Ya |
| Melihat jadwal branch    |    Tidak |                Ya |          Ya |          Ya |
| Membuat booking manual   |    Tidak |          Opsional |          Ya |          Ya |
| Mengubah status booking  |    Tidak | Sesuai permission |          Ya |          Ya |
| Manual check-in          |    Tidak | Sesuai permission |          Ya |          Ya |
| Mengelola court          |    Tidak |  Tidak / terbatas |          Ya |          Ya |
| Mengelola harga          |    Tidak |             Tidak |          Ya |          Ya |
| Mengelola staff          |    Tidak |             Tidak |          Ya |          Ya |
| Melihat finance venue    |    Tidak |     Tidak default |          Ya |          Ya |
| Mengelola rekening bank  |    Tidak |             Tidak |          Ya |          Ya |
| Verifikasi rekening bank |    Tidak |             Tidak |       Tidak |          Ya |
| Mengajukan withdrawal    |    Tidak |             Tidak |          Ya |          Ya |
| Trigger refund           |    Tidak |             Tidak |          Ya |          Ya |
| Melihat admin ops        |    Tidak |             Tidak |       Tidak |          Ya |
| Membuat support request  |       Ya |                Ya |          Ya |          Ya |
| Approve venue            |    Tidak |             Tidak |       Tidak |          Ya |
| Suspend venue/user       |    Tidak |             Tidak |       Tidak |          Ya |
| Kelola platform setting  |    Tidak |             Tidak |       Tidak |          Ya |

---

## 9. Model Bisnis

| Aspek                     | Detail                                                |
| ------------------------- | ----------------------------------------------------- |
| **Revenue utama**         | Komisi per transaksi booking                          |
| **Struktur komisi MVP**   | Flat rate dalam basis points                          |
| **Pihak yang menanggung** | Dipotong dari pendapatan venue                        |
| **Settlement venue**      | Saldo tersedia berdasarkan ledger                     |
| **Withdrawal**            | Manual/on-demand via Xendit                           |
| **Komisi v2**             | Bisa berbeda per venue, olahraga, kategori, atau tier |

### 9.1 Alur Komisi

1. Customer membayar booking.
2. Payment sukses.
3. Sistem menghitung gross booking amount.
4. Sistem menghitung platform commission.
5. Sistem menghitung gateway fee jika relevan.
6. Sistem menghitung venue net amount.
7. Semua angka disimpan sebagai snapshot pada booking dan ledger.

### 9.2 Konfigurasi Komisi MVP

1. MVP menggunakan default commission dari `PlatformSetting.default_commission_bps`.
2. Venue tidak dapat mengatur komisi sendiri pada MVP.
3. Field `Venue.defaultCommissionBps` hanya disiapkan untuk v2 dan tidak dipakai sebagai override MVP.
4. Nilai final disimpan ke `Booking.platformCommissionBps`.

### 9.3 Withdrawal Rules MVP

1. Saldo venue dari booking online menjadi available setelah booking `completed` dan melewati settlement delay T+1 hari.
2. Booking paid offline tidak masuk saldo withdrawal karena uang diterima langsung oleh venue.
3. Withdrawal hanya dapat diajukan dari saldo available.
4. Minimum withdrawal MVP harus dikonfigurasi dan ditampilkan di venue finance dashboard.
5. Withdrawal fee jika ada harus disimpan sebagai snapshot pada withdrawal dan ledger.
6. Withdrawal `failed` harus mengembalikan saldo secara akuntansi melalui status/ledger yang konsisten, bukan update manual tanpa audit.

---

## 10. Jenis Olahraga yang Didukung

Master data olahraga dikelola oleh Super Admin.

Daftar awal: Futsal, Badminton, Tenis, Padel, Sepak Bola, Basket, Voli, Squash, dan olahraga lain sesuai kebutuhan platform.

Catatan:

- Satu venue dapat mendukung banyak olahraga.
- Satu lapangan pada MVP hanya melayani satu jenis olahraga.
- Jenis olahraga utama dikonfigurasi di level court.
