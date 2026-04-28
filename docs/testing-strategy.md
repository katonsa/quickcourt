# Testing Strategy

> [!NOTE]
> Dokumen ini menjabarkan **strategi, framework, dan panduan testing** Quickcourt MVP.
> Untuk spesifikasi teknis, lihat [Technical Spec](./technical-spec.md).
> Untuk roadmap dan milestone, lihat [Project Plan](./project-plan.md).

---

## 1. Prinsip Testing

### 1.1 Filosofi

QuickCourt adalah **marketplace transaksional** — bug pada booking, payment, atau ledger langsung berdampak pada uang dan kepercayaan user. Testing harus **fokus pada critical path** terlebih dahulu, bukan mengejar coverage angka tinggi.

### 1.2 Prinsip Utama

1. **Critical path first** — Test booking flow, payment webhook, dan ledger sebelum yang lain.
2. **Test behavior, bukan implementation** — Validasi output dan side effects, bukan internal function calls.
3. **Database-backed tests** — Service layer test harus menggunakan real database (test DB), bukan mock Prisma.
4. **Pisahkan unit dan integration** — `npm run test` harus tetap DB-free; DB-backed tests berjalan lewat `npm run test:integration`.
5. **Fast feedback loop** — Unit test harus cepat (<10 detik). Integration test boleh lebih lambat tapi tetap terkontrol.
6. **Idempotency harus dibuktikan** — Webhook dan cron job harus ditest dengan repeated execution.

---

## 2. Framework & Tooling

### 2.1 Pilihan Framework

| Layer                       | Tool                         | Alasan                                                                  |
| --------------------------- | ---------------------------- | ----------------------------------------------------------------------- |
| **Unit & Integration Test** | **Vitest**                   | Native ESM, fast, compatible dengan Next.js ecosystem, built-in mocking |
| **E2E Test**                | **Playwright**               | Multi-browser, reliable, auto-wait, native Next.js integration          |
| **Database Test**           | **Vitest + Test DB**         | Real PostgreSQL via Docker, Prisma migrate pada test DB                 |
| **API/Webhook Test**        | **Vitest + supertest/fetch** | Test API routes langsung tanpa browser                                  |

### 2.2 Kenapa Vitest, Bukan Jest?

- **Native ESM support** — Next.js App Router dan Prisma v7 menggunakan ESM. Jest butuh transformasi tambahan.
- **Faster execution** — Vitest menggunakan Vite dev server, lebih cepat untuk project TypeScript.
- **Compatible API** — API mirip Jest (`describe`, `it`, `expect`), migrasi mudah jika perlu.
- **Built-in features** — Coverage, mocking, snapshot, concurrent test, tanpa banyak plugin.

### 2.3 Kenapa Playwright untuk E2E?

- **Auto-wait** — Tidak perlu manual sleep/waitFor, mengurangi flaky test.
- **Multi-browser** — Chromium, Firefox, WebKit dalam satu config.
- **Next.js native support** — `webServer` config bisa auto-start dev server.
- **Trace viewer** — Debug failed test dengan screenshot, network log, dan DOM snapshot.

### 2.4 Dependencies

```bash
# Unit & Integration
npm i -D vitest @vitest/coverage-v8 @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths

# E2E
npm i -D @playwright/test
npx playwright install --with-deps chromium

# Utilities
# dotenv-cli boleh ditambahkan jika project memilih .env.test file loading eksplisit.
```

---

## 3. Test Layers & Scope

### 3.1 Piramida Test QuickCourt

```
        ┌─────────┐
        │  E2E    │  ← Sedikit, critical user journeys
        │ (5-10)  │
       ─┼─────────┼─
       │Integration│  ← Service layer + DB + API routes
       │ (30-50)   │
      ─┼───────────┼─
      │   Unit      │  ← Pure functions, utils, validators
      │  (50-100)   │
      └─────────────┘
```

### 3.2 Apa yang Di-test di Setiap Layer

#### Unit Test — Pure Logic

Target: functions tanpa side effects atau dependency external.

| Area                  | Contoh                                          |
| --------------------- | ----------------------------------------------- |
| **Validators**        | Zod schema parsing, custom validation rules     |
| **Formatters**        | Currency formatting (BigInt → Rupiah string)    |
| **Calculators**       | Harga slot, komisi, refund amount               |
| **Code generators**   | Booking code (`QC-` + nanoid), idempotency keys |
| **State machine**     | Booking status transitions (valid/invalid)      |
| **Slot generation**   | Time window generation dari operating hours     |
| **Policy evaluation** | Cancellation policy rules evaluation            |

#### Integration Test — Service Layer + Database

Target: service functions yang berinteraksi dengan database.

| Area                     | Contoh                                                      |
| ------------------------ | ----------------------------------------------------------- |
| **Booking service**      | Create booking → cek slot tersimpan, status benar           |
| **Anti double-booking**  | 2 concurrent booking pada slot sama → satu gagal            |
| **Webhook processing**   | Simulate webhook → booking status updated, ledger created   |
| **Idempotent webhook**   | Same webhook 2x → processed sekali                          |
| **Payment retry**        | Failed/pending payment → lanjut bayar/retry sebelum expiry  |
| **Late webhook guard**   | Webhook attempt lama/expired → ignored, ledger tidak dibuat |
| **Booking expiry**       | Expired booking → slot released                             |
| **Refund operation**     | Refund success/failed → status dan ledger benar             |
| **Withdrawal operation** | Withdrawal paid/failed → saldo dan ledger benar             |
| **Ledger calculation**   | Payment → gross, commission, net tercatat benar             |
| **Permission check**     | Staff tanpa permission → aksi ditolak                       |
| **Availability**         | Block + booking + operating hours → slot calculation benar  |

#### E2E Test — Critical User Journeys

Target: full user flow dari browser.

| Journey                  | Steps                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------- |
| **Customer booking**     | Login → search → select venue → select slot → checkout → payment callback → confirmed |
| **Venue onboarding**     | Accept invite → fill venue → submit → admin approve → visible di marketplace          |
| **Walk-in booking**      | Staff login → create manual booking → confirmed                                       |
| **Booking cancellation** | Customer cancel → refund calculated → status updated                                  |
| **Payment retry**        | Customer pending payment → close page → return → continue payment                     |
| **Staff management**     | Owner invite/revoke staff → permission enforced                                       |
| **Support basic**        | Customer opens booking → submit support request                                       |
| **Admin approval**       | Admin login → review venue → approve → venue active                                   |

---

## 4. Critical Path: Test Scenarios Detail

### 4.1 Anti Double-Booking (HIGHEST PRIORITY)

Ini adalah **risiko terbesar** — double-booking merusak trust venue dan customer.

```typescript
// Contoh test scenario
describe("Anti Double-Booking", () => {
  it("menolak booking pada slot yang sudah terisi", async () => {
    // Arrange: buat booking confirmed pada Court A, 08:00-09:00
    // Act: buat booking baru pada Court A, 08:00-09:00
    // Assert: booking kedua ditolak dengan error yang jelas
  })

  it("menolak booking yang overlap sebagian", async () => {
    // Arrange: booking confirmed 08:00-10:00
    // Act: booking baru 09:00-11:00
    // Assert: ditolak (overlap 09:00-10:00)
  })

  it("mengizinkan booking pada court berbeda di waktu sama", async () => {
    // Arrange: booking pada Court A, 08:00-09:00
    // Act: booking pada Court B, 08:00-09:00
    // Assert: berhasil
  })

  it("mengizinkan booking setelah slot di-cancel", async () => {
    // Arrange: booking pada Court A 08:00 → cancelled
    // Act: booking baru pada Court A 08:00
    // Assert: berhasil
  })

  it("DB constraint menangkap race condition", async () => {
    // Arrange: 2 concurrent booking requests pada slot sama
    // Act: jalankan bersamaan (Promise.all)
    // Assert: tepat satu berhasil, satu gagal
  })
})
```

### 4.2 Payment Webhook Idempotency

```typescript
describe("Webhook Processing", () => {
  it("memproses webhook payment success → booking confirmed", async () => {
    // Arrange: booking pending_payment
    // Act: kirim webhook payment.paid
    // Assert: booking.status = confirmed, ledger entry created
  })

  it("webhook yang sama 2x → hanya diproses sekali", async () => {
    // Act: kirim webhook identical 2x
    // Assert: processedAt hanya di-set sekali, ledger entry hanya 1
  })

  it("menolak webhook dengan callback token salah", async () => {
    // Act: POST webhook tanpa/token salah
    // Assert: 401 Unauthorized
  })

  it("webhook expired → booking expired, slot released", async () => {
    // Act: kirim webhook payment.expired
    // Assert: booking.status = expired, slot.status = cancelled
  })
})
```

### 4.3 Ledger Accuracy

```typescript
describe("Ledger", () => {
  it("booking confirmed → ledger entries lengkap", async () => {
    // Assert: gross credit + commission debit + fee debit = net
    // Assert: BigInt arithmetic, bukan float
  })

  it("refund → ledger debit tercatat", async () => {
    // Assert: refund debit entry created
    // Assert: venue balance berkurang
  })

  it("venue balance = sum of all ledger entries", async () => {
    // Buat beberapa booking + 1 refund
    // Assert: calculated balance === sum(credits) - sum(debits)
  })
})
```

### 4.4 Booking Expiry

```typescript
describe("Booking Expiry", () => {
  it("booking expired setelah 30 menit tanpa payment", async () => {
    // Arrange: booking pending_payment, createdAt = 31 menit lalu
    // Act: jalankan expiry sweep
    // Assert: status = expired, slots released
  })

  it("booking tidak expired jika belum 30 menit", async () => {
    // Arrange: booking pending_payment, createdAt = 25 menit lalu
    // Act: jalankan expiry sweep
    // Assert: status tetap pending_payment
  })

  it("expiry sweep idempotent", async () => {
    // Act: jalankan sweep 2x
    // Assert: tidak ada error, status tetap expired
  })
})
```

---

### 4.5 Payment Failure & Retry

```typescript
describe("Payment Retry", () => {
  it("menampilkan checkoutUrl existing selama invoice masih aktif", async () => {
    // Arrange: booking pending_payment dengan payment pending
    // Act: customer membuka detail booking
    // Assert: response berisi checkoutUrl dan expiry countdown
  })

  it("mengizinkan retry jika payment failed tetapi booking belum expired", async () => {
    // Arrange: booking pending_payment, payment failed, expiresAt masih future
    // Act: create retry payment attempt
    // Assert: new/current payment pending, amount sama dengan booking snapshot
  })

  it("mengabaikan webhook sukses dari payment attempt lama", async () => {
    // Arrange: booking punya payment attempt baru; attempt lama terlambat paid
    // Act: webhook paid untuk attempt lama
    // Assert: webhook stored as ignored/failed, booking tidak confirmed, ledger tidak dibuat
  })
})
```

### 4.6 Refund & Withdrawal Operations

```typescript
describe("Refund and Withdrawal", () => {
  it("refund sukses membuat ledger refund_debit sekali", async () => {
    // Arrange: booking paid cancelled eligible refund
    // Act: process refund succeeded twice
    // Assert: Refund.status = succeeded, ledger refund_debit hanya satu
  })

  it("refund gagal tidak membuat ledger debit", async () => {
    // Arrange: refund processing
    // Act: gateway returns failed
    // Assert: Refund.status = failed, VenueLedgerEntry refund_debit tidak ada
  })

  it("withdrawal paid mengurangi available balance secara idempotent", async () => {
    // Arrange: venue balance available
    // Act: process withdrawal paid webhook/job twice
    // Assert: withdrawal_debit hanya satu, balance benar
  })
})
```

### 4.7 Staff, Admin Ops, and Legal Consent

```typescript
describe("Operational MVP", () => {
  it("staff revoked tidak dapat mengakses branch venue", async () => {
    // Arrange: staff punya akses lalu direvoke
    // Act: staff request venue booking management
    // Assert: 403 Forbidden
  })

  it("manual adjustment membutuhkan reason dan audit log", async () => {
    // Arrange: super admin
    // Act: create adjustment tanpa reason lalu dengan reason
    // Assert: tanpa reason ditolak; dengan reason membuat ledger + audit
  })

  it("checkout tanpa policy consent ditolak", async () => {
    // Act: submit checkout tanpa consent
    // Assert: validation error dan booking tidak dibuat
  })
})
```

## 5. Konfigurasi

### 5.1 Vitest Config

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    // Isolate test files untuk menghindari state leakage
    pool: "forks",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
})
```

```typescript
// vitest.config.unit.ts
import { defineConfig, mergeConfig } from "vitest/config"
import baseConfig from "./vitest.config"

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ["**/*.test.ts", "**/*.spec.ts"],
      exclude: ["e2e/**", "**/*.integration.test.ts"],
      setupFiles: ["./test/setup.ts"],
      coverage: {
        provider: "v8",
        include: ["app/**", "components/**", "config/**", "lib/**"],
        exclude: ["test/**", "**/*.d.ts", "**/*.integration.test.ts"],
      },
    },
  }),
)
```

```typescript
// vitest.config.integration.ts
import { defineConfig, mergeConfig } from "vitest/config"
import baseConfig from "./vitest.config"

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ["**/*.integration.test.ts"],
      setupFiles: ["./test/integration/setup.ts"],
      testTimeout: 15_000,
      hookTimeout: 15_000,
    },
  }),
)
```

Unit dan integration tests memakai shared base config, tetapi entrypoint-nya terpisah. Jangan memuat Prisma/test DB dari `test/setup.ts` global, karena file itu ikut dipakai unit tests.

### 5.2 Playwright Config

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Sequential — shared database state
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
})
```

### 5.3 Test Database Setup

```typescript
// test/setup.ts
import { afterEach, vi } from "vitest"

afterEach(() => {
  vi.restoreAllMocks()
})
```

Integration setup memvalidasi env sebelum DB-backed tests berjalan:

```typescript
// test/integration/setup.ts
if (!process.env.DATABASE_URL_TEST) {
  throw new Error("DATABASE_URL_TEST is required for DB integration tests")
}

if (process.env.DATABASE_URL_TEST === process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL_TEST must not equal DATABASE_URL")
}
```

DB helper untuk integration tests dipisah agar unit tests tidak membutuhkan PostgreSQL:

```typescript
// test/integration/db.ts
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@/generated/prisma/client"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL_TEST!,
})

export const prisma = new PrismaClient({
  adapter,
})
```

Minimal P1-07 DB integration smoke test cukup membuktikan harness, koneksi test DB, dan migrated schema. Jangan truncate/reset/seed database development dari integration tests.

```typescript
// test/integration/db.integration.test.ts
import { afterAll, describe, expect, it } from "vitest"
import { prisma } from "./db"

describe("DB integration harness", () => {
  afterAll(async () => {
    await prisma.$disconnect()
  })

  it("connects to the migrated test database", async () => {
    const result = await prisma.$queryRaw<{ ok: number }[]>`SELECT 1 AS ok`

    expect(result[0]?.ok).toBe(1)
  })
})
```

### 5.4 Environment

```bash
# .env.test
DATABASE_URL_TEST="postgresql://postgres:postgres@localhost:5433/quickcourt_test"
BETTER_AUTH_SECRET="test-secret-do-not-use-in-prod"
XENDIT_CALLBACK_TOKEN="test-callback-token"
```

`DATABASE_URL` remains the active app datasource. `DATABASE_URL_TEST` is the canonical DB integration test database URL introduced by P1-03 and required by the P1-07 DB integration harness. Do not persist `DATABASE_URL` and `DATABASE_URL_TEST` with the same value because `config/env.ts` rejects that configuration. Test scripts that need Prisma's active datasource should map `DATABASE_URL` to `DATABASE_URL_TEST` only for that subprocess.

### 5.5 Docker Compose untuk Test DB

```yaml
# docker-compose.test.yml
services:
  postgres-test:
    image: postgres:17-alpine
    ports:
      - "5433:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: quickcourt_test
    tmpfs:
      - /var/lib/postgresql/data # In-memory untuk speed
```

---

## 6. NPM Scripts

```jsonc
// package.json (scripts section)
{
  "scripts": {
    "test": "vitest run --config vitest.config.unit.ts",
    "test:watch": "vitest --config vitest.config.unit.ts",
    "test:coverage": "vitest run --config vitest.config.unit.ts --coverage",
    "test:integration": "vitest run --config vitest.config.integration.ts",
    "test:all": "npm run test && npm run test:integration",
    "test:ui": "vitest --config vitest.config.unit.ts --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:db:up": "docker compose -f docker-compose.test.yml up -d",
    "test:db:down": "docker compose -f docker-compose.test.yml down",
    "test:db:migrate": "DATABASE_URL=$DATABASE_URL_TEST npm run db:migrate:deploy"
  },
}
```

`test`, `test:watch`, dan `test:coverage` memakai unit config. `test:db:migrate` menyiapkan schema test DB dengan mapping subprocess-local dari `DATABASE_URL` ke `DATABASE_URL_TEST`. `test:integration` memakai integration config, hanya memilih `*.integration.test.ts`, dan harus gagal jelas jika `DATABASE_URL_TEST` belum tersedia.

---

## 7. Folder Structure

```

├── test/
│   ├── setup.ts                   # Global unit-safe setup; no DB connection
│   ├── integration/
│   │   ├── setup.ts               # Integration-only env validation
│   │   └── db.ts                  # Prisma client/helper for DB integration tests
│   ├── helpers/
│   │   ├── factory.ts             # Test data factories (createTestUser, createTestVenue, dll)
│   │   ├── fixtures.ts            # Reusable test fixtures
│   │   └── webhook.ts             # Webhook payload builders
│   └── mocks/
│       ├── xendit.ts              # Mock Xendit API responses
│       └── uploadthing.ts         # Mock upload responses
├── lib/
│   ├── booking-code.ts
│   ├── booking-code.test.ts       # ← Co-located unit test
│   ├── slot-calculator.ts
│   ├── slot-calculator.test.ts
│   ├── currency.ts
│   └── currency.test.ts
├── services/
│   ├── booking/
│   │   ├── booking.service.ts
│   │   └── booking.service.test.ts  # ← Integration test
│   ├── payment/
│   │   ├── webhook.service.ts
│   │   └── webhook.service.test.ts
│   └── ledger/
│       ├── ledger.service.ts
│       └── ledger.service.test.ts
e2e/
├── customer-booking.spec.ts       # Full booking journey
├── venue-onboarding.spec.ts       # Venue registration flow
├── admin-approval.spec.ts         # Admin workflow
└── helpers/
    ├── auth.ts                    # Login helper, session setup
    └── seed.ts                    # E2E-specific seed data
```

---

## 8. Test Data Factories

```typescript
// test/helpers/factory.ts
import { prisma } from "../setup"
import { nanoid } from "nanoid"

export async function createTestUser(overrides = {}) {
  return prisma.user.create({
    data: {
      id: nanoid(),
      name: "Test User",
      email: `test-${nanoid(6)}@example.com`,
      emailVerified: true,
      ...overrides,
    },
  })
}

export async function createTestVenue(orgId: string, overrides = {}) {
  return prisma.venue.create({
    data: {
      name: "Test Venue",
      slug: `test-venue-${nanoid(6)}`,
      organizationId: orgId,
      status: "approved",
      ...overrides,
    },
  })
}

export async function createTestBooking(
  userId: string,
  venueId: string,
  branchId: string,
  courtId: string,
  overrides = {}
) {
  const startsAt = new Date("2026-05-01T01:00:00.000Z")
  const endsAt = new Date("2026-05-01T02:00:00.000Z")

  return prisma.booking.create({
    data: {
      bookingCode: `QC-TEST${nanoid(4).toUpperCase()}`,
      customerUserId: userId,
      venueId,
      branchId,
      status: "pending_payment",
      paymentStatus: "pending",
      totalAmount: BigInt(200_000),
      slots: {
        create: {
          courtId,
          startsAt,
          endsAt,
          venueTimezone: "Asia/Jakarta",
          localDate: new Date("2026-05-01"),
          localStartTime: new Date("1970-01-01T08:00:00.000Z"),
          localEndTime: new Date("1970-01-01T09:00:00.000Z"),
          durationMinutes: 60,
          priceAmount: BigInt(200_000),
        },
      },
      ...overrides,
    },
    include: { slots: true },
  })
}

export function buildWebhookPayload(externalId: string, status = "PAID") {
  return {
    id: `evt_${nanoid()}`,
    event: `invoice.${status.toLowerCase()}`,
    data: {
      id: externalId,
      status,
      amount: 200_000,
      paid_at: new Date().toISOString(),
    },
  }
}
```

---

## 9. Metodologi: Hybrid TDD

### Prinsip

QuickCourt menggunakan **Hybrid TDD** — TDD untuk service layer dan business logic, test-after untuk UI dan setup.

```
Red    →  Tulis test yang mendeskripsikan behavior yang diinginkan → test FAIL
Green  →  Tulis implementasi minimum agar test PASS
Refactor → Perbaiki kode tanpa mengubah behavior → test tetap PASS
```

### Kapan TDD, Kapan Tidak

| Area                                                              | Pendekatan            | Alasan                                |
| ----------------------------------------------------------------- | --------------------- | ------------------------------------- |
| **Service layer** (booking, payment, ledger, webhook, approval)   | ✅ **TDD**            | Requirements jelas, risiko tinggi     |
| **Pure functions** (validators, calculators, formatters, masking) | ✅ **TDD**            | Input/output terdefinisi              |
| **Database constraints** (anti double-booking, idempotency)       | ✅ **TDD**            | Harus dibuktikan sebelum implementasi |
| **State machine transitions**                                     | ✅ **TDD**            | Acceptance criteria = test scenarios  |
| **UI components** (forms, layouts, pages)                         | ❌ Test-after via E2E | Exploratory, desain berubah-ubah      |
| **Third-party setup** (Better Auth, Uploadthing)                  | ❌ Tidak perlu        | Bukan kode kita                       |
| **CRUD sederhana** (master data sport/city)                       | ❌ Tidak perlu        | Overhead tidak sebanding              |

### Workflow TDD per Area

Setiap area yang punya service layer mengikuti alur ini:

```
1. Baca acceptance criteria area/milestone
2. Tulis test file (*.service.test.ts) berdasarkan acceptance criteria
3. Run test → semua FAIL (Red)
4. Implementasi service layer → test PASS (Green)
5. Refactor jika perlu
6. Build UI yang memanggil service
7. Commit: test + implementasi + UI
```

### Contoh: Venue Registration

```typescript
// services/venue.service.test.ts — ditulis SEBELUM venue.service.ts

describe("createVenueWithBranch", () => {
  it("membuat venue dan branch default dalam satu transaction", async () => {
    const result = await createVenueWithBranch({ name: "Test Venue", ... })
    expect(result.venue).toBeDefined()
    expect(result.branch.isDefault).toBe(true)
  })

  it("rollback venue jika branch gagal", async () => {
    // Force branch creation to fail
    await expect(createVenueWithBranch({ name: "Test", cityId: "invalid" }))
      .rejects.toThrow()
    // Verify venue was NOT created
    const venues = await db.venue.findMany()
    expect(venues).toHaveLength(0)
  })

  it("menolak jika user bukan org owner", async () => {
    const customer = await createTestUser()
    await expect(createVenueWithBranch({ ...data, userId: customer.id }))
      .rejects.toThrow("Unauthorized")
  })
})
```

### Test Tidak Menjadi Task Terpisah

Dengan TDD, test tidak diperlakukan sebagai pekerjaan terpisah dari implementasi. Test adalah bagian dari setiap area yang memiliki service layer. Acceptance criteria area/milestone menjadi test specification.

### Per-Milestone Test Summary

| Milestone                                                   | Test yang Ditulis (TDD)                                                                   |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Milestone 1 — Foundation**                                | Setup Vitest, unit-only default test command, required DB integration harness, CI foundation, env validation, auth config, access helpers |
| **Milestone 2 — Organization & Venue Profile Onboarding**   | TDD: org invite/accept, venue profile draft, permission, bank masking/verification        |
| **Milestone 3 — Court, Schedule, Pricing & Venue Approval** | TDD: court CRUD, slot calculator, price calculator, operating hours, approval lifecycle   |
| **Milestone 4 — Marketplace & Booking Core**                | TDD: booking creation, anti double-booking, state machine, cancellation policy snapshot   |
| **Milestone 5 — Payment, Webhook & Transaction Posting**    | TDD: payment retry, webhook idempotency, expiry sweep, minimal ledger posting             |
| **Milestone 6 — Venue Operations & Staff**                  | TDD: manual booking, check-in, staff permissions, booking auto-complete                   |
| **Milestone 7 — Finance, Refund, Withdrawal & Admin Ops**   | TDD: ledger accuracy, balance calculation, refund, withdrawal, adjustment, reconciliation |
| **Milestone 8 — Notification Workflows**                    | TDD: email trigger conditions, reminder cron, template rendering, notification logging    |
| **Milestone 9 — Hardening, E2E & Release Readiness**        | E2E test, race condition test, duplicate webhook, cron idempotency, release gates         |

---

## 10. Coverage Target

### MVP Target: Pragmatic, Bukan Angka

| Layer                                        | Target          | Catatan                             |
| -------------------------------------------- | --------------- | ----------------------------------- |
| **Service layer** (booking, payment, ledger) | **80%+**        | Ini yang paling kritis              |
| **Utils & validators**                       | **90%+**        | Pure functions, mudah di-test       |
| **API routes**                               | **70%+**        | Melalui integration test            |
| **UI components**                            | **Tidak wajib** | Dicakup oleh E2E test               |
| **Overall**                                  | **60-70%**      | Realistis untuk MVP solo/small team |

> [!IMPORTANT]
> Coverage tinggi pada **booking service, webhook handler, dan ledger service** jauh lebih berharga daripada 90% overall coverage yang didominasi oleh UI component test.

---

## 11. CI/CD Integration

### GitHub Actions (Rekomendasi)

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test

  db-integration:
    runs-on: ubuntu-latest
    needs: unit
    services:
      postgres:
        image: postgres:17-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: quickcourt_test
        ports:
          - 5433:5432
        options: >-
          --health-cmd="pg_isready"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=5

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run db:generate
      - run: npm run test:db:migrate
        env:
          DATABASE_URL_TEST: postgresql://postgres:postgres@localhost:5433/quickcourt_test
      - run: npm run db:verify-constraints
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5433/quickcourt_test
      - run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/quickcourt_dev_guard
          DATABASE_URL_TEST: postgresql://postgres:postgres@localhost:5433/quickcourt_test

  e2e:
    runs-on: ubuntu-latest
    needs: db-integration
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

P1-07 requires the `unit` and `db-integration` jobs. The `e2e` job is a later milestone/release-readiness layer and should not block the Phase 1 harness unless the project explicitly enables E2E in CI.

### Pipeline Rules

- **PR merge blocked** jika unit test atau DB integration harness gagal.
- **E2E test** berjalan setelah unit/integration pass jika E2E CI sudah diaktifkan.
- **Coverage report** di-upload sebagai artifact.

---

## 12. Hal yang Tidak Perlu Di-test (MVP)

Untuk efisiensi waktu di MVP, **skip** testing untuk:

- UI component rendering (button, card, layout) — cukup E2E.
- Prisma query builder correctness — itu tanggung jawab Prisma.
- Next.js routing behavior — itu tanggung jawab framework.
- Third-party library internals (Better Auth, Xendit SDK).
- CSS/styling — visual regression testing ditunda post-MVP.

Fokus test hanya pada **kode bisnis kita yang punya risiko finansial atau data integrity**.

---

## 13. Ringkasan Keputusan

| Keputusan                  | Pilihan                                                  | Alasan Singkat                                 |
| -------------------------- | -------------------------------------------------------- | ---------------------------------------------- |
| Unit/Integration framework | **Vitest**                                               | Native ESM, fast, modern                       |
| E2E framework              | **Playwright**                                           | Reliable, auto-wait, trace viewer              |
| Test database              | **Real PostgreSQL (Docker)**                             | Exclusion constraint harus ditest nyata        |
| Mocking strategy           | **Minimal — mock hanya external API**                    | Prefer real DB, real service layer             |
| Test timing                | **Hybrid TDD — test sebelum implementasi service layer** | Bugs tertangkap lebih awal, requirements jelas |
| Coverage target            | **80%+ service layer, 60-70% overall**                   | Pragmatis untuk MVP                            |
| CI provider                | **GitHub Actions**                                       | Free tier cukup, built-in PostgreSQL service   |
