# Project Brief

> [!NOTE]
> Dokumen ini adalah **ringkasan eksekutif** proyek Quickcourt.
> Untuk detail fitur, lihat [PRD](./prd.md).
> Untuk spesifikasi teknis, lihat [Technical Spec](./technical-spec.md).
> Untuk roadmap dan milestone, lihat [Project Plan](./project-plan.md).

---

## 1. Ringkasan Eksekutif

**Quickcourt** adalah platform marketplace berbasis web untuk pemesanan lapangan olahraga secara online di Indonesia. Platform ini menghubungkan **customer** yang ingin mencari dan memesan lapangan dengan **venue owner** yang ingin memasarkan, mengelola, dan memonetisasi lapangannya secara digital.

Quickcourt dirancang sebagai marketplace terbuka: banyak venue dari berbagai kota dapat mendaftar dan beroperasi di satu platform yang sama. Secara konsep, Quickcourt dapat dianalogikan seperti marketplace layanan lokal, tetapi fokus khusus pada pemesanan lapangan olahraga.

Pada **MVP v1.1**, Quickcourt difokuskan pada alur inti:

1. Customer mencari venue dan lapangan.
2. Customer memilih tanggal, jam, dan slot tersedia.
3. Customer melakukan booking dan pembayaran online.
4. Venue menerima booking dan mengelola operasional lapangan.
5. Platform mencatat transaksi, komisi, ledger, refund, dan withdrawal secara rapi.
6. Customer, venue, dan Super Admin memiliki tooling operasional dasar untuk menangani payment gagal, refund, dispute, staff access, dan withdrawal.

Quickcourt harus diperlakukan sebagai **marketplace transaksional**, bukan sekadar direktori venue. Artinya platform memediasi discovery, booking, pembayaran, pencatatan uang, refund, withdrawal, dan audit end-to-end.

Prioritas utama MVP adalah membangun fondasi marketplace yang reliable: **booking tidak bentrok, pembayaran aman, venue bisa beroperasi, customer punya jalur bantuan, dan data keuangan tercatat dengan akurat.**

---

## 2. Informasi Proyek

| Atribut                   | Detail                                           |
| ------------------------- | ------------------------------------------------ |
| **Nama Produk**           | Quickcourt                                       |
| **Tipe Produk**           | Web Application — Marketplace                    |
| **Segmen**                | B2C + B2B                                        |
| **Target Pasar**          | Indonesia                                        |
| **Target Pengguna Utama** | Customer, Venue Owner, Venue Staff, Super Admin  |
| **Model Bisnis**          | Komisi per transaksi booking                     |
| **Struktur Komisi MVP**   | Flat rate, dapat dikonfigurasi oleh Super Admin  |
| **Payment Gateway**       | Xendit                                           |
| **Pembayaran MVP**        | Full payment di muka                             |
| **Disbursement MVP**      | Withdrawal manual/on-demand ke rekening venue    |
| **Support MVP**           | Form bantuan sederhana + penanganan manual admin |
| **Platform Awal**         | Responsive web app                               |
| **Database**              | PostgreSQL                                       |
| **ORM**                   | Prisma ORM v7                                    |
| **Auth**                  | Better Auth + Admin Plugin + Organization Plugin |
| **Status Produk**         | Active Development / MVP Implementation          |

### 2.1 Tech Stack MVP

| Layer                | Teknologi                                 | Catatan                                    |
| -------------------- | ----------------------------------------- | ------------------------------------------ |
| **Framework**        | Next.js 16 (App Router)                   | SSR, API routes, middleware auth           |
| **Language**         | TypeScript (strict mode)                  | End-to-end type safety                     |
| **Database**         | PostgreSQL 17                             | `tstzrange`, exclusion constraint, CITEXT  |
| **ORM**              | Prisma v7 + `@prisma/adapter-pg`          | Driver adapter pattern, `prisma.config.ts` |
| **Auth**             | Better Auth + Admin + Organization Plugin | Role-based, multi-tenant                   |
| **Payment**          | Xendit                                    | Invoice, QRIS, VA, disbursement            |
| **UI Components**    | shadcn/ui                                 | Accessible, customizable                   |
| **Styling**          | Tailwind CSS v4                           | CSS-based config, `@theme` directive       |
| **Email**            | React Email + Resend                      | Template-able, transactional               |
| **Validation**       | Zod                                       | Schema validation, shared client + server  |
| **Form**             | React Hook Form + `@hookform/resolvers`   | Performant, integrasi Zod                  |
| **Date/Time**        | date-fns + date-fns-tz                    | Format, parse, timezone venue              |
| **ID Generation**    | nanoid                                    | Booking code, short URL-safe IDs           |
| **Logging**          | Pino + pino-pretty                        | Structured JSON logging                    |
| **File Upload**      | Uploadthing                               | Managed storage, Next.js native            |
| **Rate Limiting**    | @upstash/ratelimit + Redis                | Serverless-friendly, sliding window        |
| **Containerization** | Docker Compose                            | PostgreSQL lokal                           |
| **Monorepo**         | Tidak — single Next.js app                | Simplifikasi untuk MVP                     |

---

## 3. Latar Belakang & Peluang

Proses booking lapangan olahraga di Indonesia masih banyak dilakukan secara manual melalui WhatsApp, telepon, spreadsheet, buku catatan, atau booking langsung di lokasi. Pola ini menimbulkan beberapa masalah:

### Untuk Customer

- Sulit mengetahui jadwal lapangan yang masih tersedia.
- Harus menunggu balasan admin venue.
- Tidak mudah membandingkan venue, harga, fasilitas, dan lokasi.
- Tidak ada proses booking dan pembayaran yang konsisten.
- Risiko miskomunikasi terkait tanggal, jam, atau status booking.

### Untuk Venue Owner

- Jadwal booking rentan bentrok.
- Admin harus mengecek slot kosong secara manual.
- Venue sulit mendapatkan visibilitas digital.
- Pembayaran, refund, dan pencatatan transaksi sering tidak terstruktur.
- Tidak ada dashboard operasional dan keuangan yang rapi.

### Untuk Platform

Belum banyak platform terpusat yang fokus pada discovery, booking, pembayaran, dan operasional venue olahraga secara end-to-end. Quickcourt mengisi gap ini dengan menyediakan marketplace yang menggabungkan:

- discovery venue,
- real-time slot availability,
- online booking,
- online payment,
- venue management,
- account recovery,
- payment retry,
- ledger keuangan,
- refund status,
- withdrawal,
- support/dispute basic,
- legal consent,
- dan audit trail.

---

## 4. Visi Produk

Quickcourt ingin menjadi platform utama untuk menemukan, memesan, dan mengelola lapangan olahraga di Indonesia.

Dalam jangka pendek, Quickcourt fokus pada booking lapangan olahraga secara online. Dalam jangka menengah, Quickcourt dapat berkembang menjadi ekosistem olahraga rekreasional yang mendukung multi-cabang venue, promo, membership, rental alat olahraga, iklan venue, dan mobile app.

---

## 5. Tujuan Produk

### 5.1 Tujuan Bisnis

- Membangun marketplace booking lapangan olahraga untuk pasar Indonesia.
- Menghasilkan revenue melalui komisi per transaksi booking.
- Memvalidasi product-market fit melalui transaksi booking end-to-end.
- Mendorong venue offline agar masuk ke channel digital.
- Menyiapkan fondasi data untuk growth, analytics, dan monetisasi lanjutan.

### 5.2 Tujuan Customer

- Menemukan venue berdasarkan kota, olahraga, harga, dan rating.
- Melihat jadwal lapangan yang tersedia.
- Melakukan booking tanpa harus chat manual.
- Membayar secara online.
- Mendapat konfirmasi dan reminder booking.
- Melihat riwayat booking.

### 5.3 Tujuan Venue Owner

- Meningkatkan visibilitas venue secara online.
- Mengelola lapangan, jadwal, harga, dan booking dalam satu dashboard.
- Mengurangi risiko double-booking.
- Menerima pembayaran secara terstruktur.
- Melihat pendapatan, riwayat transaksi, dan saldo yang dapat ditarik.

### 5.4 Tujuan Platform

- Menjaga keamanan transaksi.
- Menyediakan sistem booking yang tahan terhadap race condition.
- Memastikan setiap transaksi tercatat secara audit-friendly.
- Menyediakan struktur data yang siap untuk multi-branch, promo, mobile app, dan fitur growth.
