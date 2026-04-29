import "dotenv/config"

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

process.env.APP_ENV = "test"
process.env.DATABASE_URL = testDatabaseUrl.href
delete process.env.DATABASE_URL_TEST

function readRequiredPostgresUrl(name: string, value: string | undefined): URL {
  if (!value?.trim()) {
    throw new Error(`${name} is required for DB integration tests.`)
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
