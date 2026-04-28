import "dotenv/config"

import { PrismaPg } from "@prisma/adapter-pg"

import { PrismaClient } from "@/generated/prisma/client"

const databaseUrl = readDatabaseUrl()
const adapter = new PrismaPg({ connectionString: databaseUrl })
const db = new PrismaClient({ adapter })

async function main(): Promise<void> {
  const result = await db.$queryRaw<Array<{ ok: number }>>`SELECT 1 AS ok`

  if (result[0]?.ok !== 1) {
    throw new Error("Database smoke query returned an unexpected result.")
  }

  console.info("Database smoke check passed.")
}

function readDatabaseUrl(): string {
  const value = process.env.DATABASE_URL?.trim()

  if (!value) {
    throw new Error("DATABASE_URL is required to run the database smoke check.")
  }

  const url = new URL(value)

  if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") {
    throw new Error("DATABASE_URL must be a PostgreSQL connection URL.")
  }

  return value
}

main()
  .then(async () => {
    await db.$disconnect()
  })
  .catch(async (error: unknown) => {
    console.error(error)
    await db.$disconnect()
    process.exit(1)
  })
