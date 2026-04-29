import { describe, expect, it, vi } from "vitest"

import type { Env } from "@/config/env"

const mocks = vi.hoisted(() => ({
  isHostedAppEnv: vi.fn((appEnv: string) =>
    appEnv === "production" || appEnv === "staging"
  ),
  loggerError: vi.fn(),
  loggerInfo: vi.fn(),
  resendConstructor: vi.fn(),
  resendSend: vi.fn(),
}))

vi.mock("server-only", () => ({}))

vi.mock("@/config/env", () => ({
  isHostedAppEnv: mocks.isHostedAppEnv,
  serverEnv: createTestEnv(),
}))

vi.mock("@/lib/logger", () => ({
  logger: {
    error: mocks.loggerError,
    info: mocks.loggerInfo,
  },
}))

vi.mock("resend", () => ({
  Resend: class {
    readonly emails = {
      send: mocks.resendSend,
    }

    constructor(apiKey: string) {
      mocks.resendConstructor(apiKey)
    }
  },
}))

import { ConsoleEmailSender } from "./console-sender"
import { createEmailSender } from "./email-sender"
import { ResendEmailSender } from "./resend-sender"

describe("createEmailSender", () => {
  it("uses the console sender for local development and test environments", () => {
    expect(
      createEmailSender(
        createTestEnv({
          APP_ENV: "development",
          EMAIL_PROVIDER: "console",
          NODE_ENV: "development",
        })
      )
    ).toBeInstanceOf(ConsoleEmailSender)
    expect(createEmailSender(createTestEnv())).toBeInstanceOf(ConsoleEmailSender)
  })

  it("rejects console email sending in hosted app environments", () => {
    expect(() =>
      createEmailSender(
        createTestEnv({
          APP_ENV: "staging",
          EMAIL_PROVIDER: "console",
        })
      )
    ).toThrow("Console email sender cannot be used in staging or production.")
  })

  it("requires a Resend API key when Resend is selected", () => {
    expect(() =>
      createEmailSender(
        createTestEnv({
          EMAIL_FROM: "QuickCourt <auth@quickcourt.test>",
          EMAIL_PROVIDER: "resend",
          RESEND_API_KEY: undefined,
        })
      )
    ).toThrow("RESEND_API_KEY is required for the Resend email sender.")
  })

  it("requires a sender address when Resend is selected", () => {
    expect(() =>
      createEmailSender(
        createTestEnv({
          EMAIL_FROM: undefined,
          EMAIL_PROVIDER: "resend",
          RESEND_API_KEY: "re_test_key",
        })
      )
    ).toThrow("EMAIL_FROM is required for the Resend email sender.")
  })

  it("uses the Resend sender when Resend config is present", () => {
    const sender = createEmailSender(
      createTestEnv({
        EMAIL_FROM: "QuickCourt <auth@quickcourt.test>",
        EMAIL_PROVIDER: "resend",
        RESEND_API_KEY: "re_test_key",
      })
    )

    expect(sender).toBeInstanceOf(ResendEmailSender)
    expect(mocks.resendConstructor).toHaveBeenCalledWith("re_test_key")
  })
})

function createTestEnv(overrides: Partial<Env> = {}): Env {
  return {
    ADMIN_BOOTSTRAP_EMAIL: undefined,
    APP_ENV: "test",
    APP_URL: "https://quickcourt.test",
    BETTER_AUTH_SECRET: "test-better-auth-secret-with-32-chars",
    BETTER_AUTH_URL: "https://quickcourt.test",
    DATABASE_URL: "postgresql://quickcourt:quickcourt@localhost:5432/quickcourt",
    DATABASE_URL_TEST: undefined,
    EMAIL_FROM: undefined,
    EMAIL_PROVIDER: "console",
    LOG_LEVEL: "info",
    NODE_ENV: "test",
    RESEND_API_KEY: undefined,
    ...overrides,
  }
}
