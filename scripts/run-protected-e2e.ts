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

  const playwrightBin =
    process.platform === "win32"
      ? "node_modules/.bin/playwright.cmd"
      : "node_modules/.bin/playwright"

  const playwright = spawn(
    playwrightBin,
    ["test", "e2e/protected-auth.spec.ts", "--workers=1"],
    {
      env: {
        ...process.env,
        APP_ENV: "test",
        APP_URL: "http://localhost:3000",
        BETTER_AUTH_URL: "http://localhost:3000",
        DATABASE_URL: testDatabaseUrl.href,
        DATABASE_URL_TEST: "",
        E2E_DATABASE_URL_TEST: testDatabaseUrl.href,
        NEXT_PUBLIC_APP_ENV: "test",
        NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      },
      stdio: "inherit",
    }
  )

  await new Promise<void>((resolve, reject) => {
    playwright.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`Protected E2E stopped by signal ${signal}.`))
        return
      }

      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(`Protected E2E failed with exit code ${code}.`))
    })

    playwright.on("error", reject)
  })
}

function readRequiredPostgresUrl(name: string, value: string | undefined): URL {
  if (!value?.trim()) {
    throw new Error(`${name} is required for protected E2E tests.`)
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
