import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { Client } from "pg"

const client = new Client({
  connectionString: process.env.DATABASE_URL,
})

describe("DB integration harness", () => {
  beforeAll(async () => {
    await client.connect()
  })

  afterAll(async () => {
    await client.end()
  })

  it("connects to the test database", async () => {
    const result = await client.query<{ ok: number }>("SELECT 1 AS ok")

    expect(result.rows[0]?.ok).toBe(1)
  })

  it("can see the migrated schema", async () => {
    const result = await client.query<{
      has_booking_slots: boolean
      has_prisma_migrations: boolean
      has_sports: boolean
    }>(`
      SELECT
        to_regclass('public._prisma_migrations') IS NOT NULL AS has_prisma_migrations,
        to_regclass('public.sports') IS NOT NULL AS has_sports,
        to_regclass('public.booking_slots') IS NOT NULL AS has_booking_slots
    `)

    expect(result.rows[0]).toEqual({
      has_booking_slots: true,
      has_prisma_migrations: true,
      has_sports: true,
    })
  })
})
