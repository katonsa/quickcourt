import "dotenv/config"

import { readFile } from "node:fs/promises"

import { Client } from "pg"

const databaseUrl = readDatabaseUrl()
const client = new Client({ connectionString: databaseUrl })

async function main(): Promise<void> {
  const sql = await readFile("prisma/verify-db-constraints.sql", "utf8")

  await client.connect()
  await client.query(sql)

  console.info("QuickCourt database constraints verified.")
}

function readDatabaseUrl(): string {
  const value = process.env.DATABASE_URL?.trim()

  if (!value) {
    throw new Error("DATABASE_URL is required to verify database constraints.")
  }

  const url = new URL(value)

  if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") {
    throw new Error("DATABASE_URL must be a PostgreSQL connection URL.")
  }

  return value
}

main()
  .then(async () => {
    await client.end()
  })
  .catch(async (error: unknown) => {
    console.error(error)
    await client.end()
    process.exit(1)
  })
