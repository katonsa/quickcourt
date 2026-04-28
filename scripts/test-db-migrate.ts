import "dotenv/config"

import { spawn } from "node:child_process"

async function main(): Promise<void> {
  const testDatabaseUrl = readRequiredPostgresUrl(
    "DATABASE_URL_TEST",
    process.env.DATABASE_URL_TEST
  )
  const appDatabaseUrl = readOptionalPostgresUrl(
    "DATABASE_URL",
    process.env.DATABASE_URL
  )

  if (appDatabaseUrl && isSameDatabase(appDatabaseUrl, testDatabaseUrl)) {
    throw new Error(
      "DATABASE_URL_TEST must not point to the same database as DATABASE_URL."
    )
  }

  const prismaBin =
    process.platform === "win32"
      ? "node_modules/.bin/prisma.cmd"
      : "node_modules/.bin/prisma"

  const migrate = spawn(prismaBin, ["migrate", "deploy"], {
    env: {
      ...process.env,
      APP_ENV: "test",
      DATABASE_URL: testDatabaseUrl.href,
    },
    stdio: "inherit",
  })

  await new Promise<void>((resolve, reject) => {
    migrate.on("exit", (code, signal) => {
      if (signal) {
        reject(
          new Error(`Prisma test database migration stopped by signal ${signal}.`)
        )
        return
      }

      if (code === 0) {
        resolve()
        return
      }

      reject(
        new Error(`Prisma test database migration failed with exit code ${code}.`)
      )
    })

    migrate.on("error", reject)
  })
}

function readRequiredPostgresUrl(name: string, value: string | undefined): URL {
  if (!value?.trim()) {
    throw new Error(
      `${name} is required to migrate the DB integration test database.`
    )
  }

  return parsePostgresUrl(name, value)
}

function readOptionalPostgresUrl(
  name: string,
  value: string | undefined
): URL | undefined {
  if (!value?.trim()) {
    return undefined
  }

  return parsePostgresUrl(name, value)
}

function parsePostgresUrl(name: string, value: string): URL {
  let url: URL

  try {
    url = new URL(value)
  } catch {
    throw new Error(`${name} must be a PostgreSQL connection URL.`)
  }

  if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") {
    throw new Error(`${name} must be a PostgreSQL connection URL.`)
  }

  return url
}

function isSameDatabase(left: URL, right: URL): boolean {
  return (
    left.hostname === right.hostname &&
    left.port === right.port &&
    left.pathname.replace(/\/$/, "") === right.pathname.replace(/\/$/, "")
  )
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
