import { describe, expect, it } from "vitest"

import { createEnv } from "./env-core"

const baseEnv = {
  NODE_ENV: "test",
  APP_URL: "http://localhost:3000",
  BETTER_AUTH_SECRET: "test-secret-with-at-least-32-characters",
  BETTER_AUTH_URL: "http://localhost:3000",
  DATABASE_URL: "postgresql://quickcourt:quickcourt@localhost:5432/quickcourt",
} satisfies NodeJS.ProcessEnv

describe("createEnv", () => {
  it.each([
    ["development", undefined, "development"],
    ["test", undefined, "test"],
  ] as const)(
    "allows console email fallback in %s mode",
    (nodeEnv, appEnv, expectedAppEnv) => {
      const env = createEnv({
        ...baseEnv,
        NODE_ENV: nodeEnv,
        ...(appEnv ? { APP_ENV: appEnv } : {}),
      })

      expect(env.APP_ENV).toBe(expectedAppEnv)
      expect(env.EMAIL_PROVIDER).toBe("console")
      expect(env.EMAIL_FROM).toBeUndefined()
      expect(env.RESEND_API_KEY).toBeUndefined()
    }
  )

  it.each(["staging", "production"] as const)(
    "requires Resend config in %s app env",
    (appEnv) => {
      expect(() =>
        createEnv({
          ...baseEnv,
          NODE_ENV: appEnv === "production" ? "production" : "development",
          APP_ENV: appEnv,
        })
      ).toThrow(/RESEND_API_KEY[\s\S]*EMAIL_FROM/)
    }
  )

  it("requires Resend config when EMAIL_PROVIDER is resend", () => {
    expect(() =>
      createEnv({
        ...baseEnv,
        NODE_ENV: "development",
        EMAIL_PROVIDER: "resend",
      })
    ).toThrow(/RESEND_API_KEY[\s\S]*EMAIL_FROM/)
  })

  it("rejects DATABASE_URL_TEST when it matches DATABASE_URL", () => {
    expect(() =>
      createEnv({
        ...baseEnv,
        NODE_ENV: "test",
        DATABASE_URL_TEST: baseEnv.DATABASE_URL,
      })
    ).toThrow(/DATABASE_URL_TEST[\s\S]*must not be the same database/)
  })

  it("accepts a distinct DATABASE_URL_TEST", () => {
    const env = createEnv({
      ...baseEnv,
      NODE_ENV: "test",
      DATABASE_URL_TEST:
        "postgresql://quickcourt:quickcourt@localhost:5432/quickcourt_test",
    })

    expect(env.DATABASE_URL_TEST).toBe(
      "postgresql://quickcourt:quickcourt@localhost:5432/quickcourt_test"
    )
  })
})
