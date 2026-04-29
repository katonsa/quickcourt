import { randomUUID } from "node:crypto"

import { Client } from "pg"
import { expect, test, type APIRequestContext, type Page } from "@playwright/test"

const testRunId = `e2e-${randomUUID()}`
const testDatabaseUrl = readTestDatabaseUrl()
const db = new Client({ connectionString: testDatabaseUrl.href })
const createdUserIds = new Set<string>()
const createdEmails = new Set<string>()

test.describe("protected auth routes", () => {
  test.beforeAll(async () => {
    await db.connect()
  })

  test.afterEach(async () => {
    await cleanupCreatedRows()
  })

  test.afterAll(async () => {
    await db.end()
  })

  test("redirects unauthenticated dashboard access to sign in", async ({
    page,
  }) => {
    await page.goto("/dashboard")

    await expect(page).toHaveURL(/\/sign-in\?/)

    const url = new URL(page.url())
    expect(url.pathname).toBe("/sign-in")
    expect(url.searchParams.get("redirectTo")).toBe("/dashboard")
  })

  test("allows a verified regular user to open the dashboard", async ({
    page,
    request,
  }) => {
    const user = await createVerifiedUser(request, { role: "user" })

    await signInThroughUi(page, user, "/dashboard")

    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(
      page.getByRole("heading", { name: "Dashboard" })
    ).toBeVisible()
  })

  test("allows a verified admin user to open the admin route", async ({
    page,
    request,
  }) => {
    const user = await createVerifiedUser(request, { role: "admin" })

    await signInThroughUi(page, user, "/admin")

    await expect(page).toHaveURL(/\/admin$/)
    await expect(
      page.getByRole("heading", { name: "Admin overview" })
    ).toBeVisible()
  })

  test("denies venue dashboard access to an admin without membership", async ({
    page,
    request,
  }) => {
    const user = await createVerifiedUser(request, { role: "admin" })

    await signInThroughUi(page, user, "/dashboard/venue")

    await expect(page).toHaveURL(/\/forbidden$/)
    await expect(
      page.getByRole("heading", { name: "This page cannot be opened" })
    ).toBeVisible()
  })
})

type TestUser = {
  email: string
  password: string
}

async function createVerifiedUser(
  request: APIRequestContext,
  options: { role: "admin" | "user" }
): Promise<TestUser> {
  const email = uniqueEmail(options.role)
  const password = "Password123!"
  const name = options.role === "admin" ? "E2E Admin" : "E2E User"

  const response = await request.post("/api/auth/sign-up/email", {
    data: {
      email,
      name,
      password,
    },
  })

  expect(response.ok()).toBe(true)

  const user = await db.query<{ id: string }>(
    `UPDATE "user"
     SET "emailVerified" = true,
         "role" = $2
     WHERE "email" = $1
     RETURNING "id"`,
    [email, options.role]
  )

  const userId = user.rows[0]?.id

  if (!userId) {
    throw new Error(`Expected Better Auth sign-up to create user ${email}.`)
  }

  createdUserIds.add(userId)
  createdEmails.add(email)

  return { email, password }
}

async function signInThroughUi(
  page: Page,
  user: TestUser,
  redirectTo: string
): Promise<void> {
  await page.goto(`/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`)
  await page.getByLabel("Email").fill(user.email)
  await page.getByLabel("Password").fill(user.password)
  await page.getByRole("button", { name: "Continue" }).click()
}

async function cleanupCreatedRows(): Promise<void> {
  const userIds = [...createdUserIds]
  const emails = [...createdEmails]

  createdUserIds.clear()
  createdEmails.clear()

  await db.query(`DELETE FROM "user" WHERE "id" = ANY($1::text[])`, [userIds])
  await db.query(
    `DELETE FROM "verification" WHERE "identifier" = ANY($1::text[])`,
    [emails]
  )
}

function uniqueEmail(role: "admin" | "user"): string {
  return `${testRunId}-${role}-${randomUUID()}@example.test`
}

function readTestDatabaseUrl(): URL {
  const testDatabaseUrl = readRequiredPostgresUrl(
    "E2E_DATABASE_URL_TEST",
    process.env.E2E_DATABASE_URL_TEST
  )
  const runtimeDatabaseUrl = readRequiredPostgresUrl(
    "DATABASE_URL",
    process.env.DATABASE_URL
  )

  if (process.env.APP_ENV !== "test") {
    throw new Error("APP_ENV must be test for protected E2E tests.")
  }

  if (!isSameDatabase(runtimeDatabaseUrl, testDatabaseUrl)) {
    throw new Error(
      "DATABASE_URL must point to DATABASE_URL_TEST for protected E2E tests."
    )
  }

  return testDatabaseUrl
}

function readRequiredPostgresUrl(name: string, value: string | undefined): URL {
  if (!value?.trim()) {
    throw new Error(`${name} is required for protected E2E tests.`)
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
