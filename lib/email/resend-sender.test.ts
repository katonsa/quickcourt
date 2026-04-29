import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  loggerError: vi.fn(),
  loggerInfo: vi.fn(),
  resendConstructor: vi.fn(),
  resendSend: vi.fn(),
}))

vi.mock("server-only", () => ({}))

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

import { ResendEmailSender } from "./resend-sender"

describe("ResendEmailSender", () => {
  beforeEach(() => {
    mocks.resendSend.mockResolvedValue({ data: { id: "email-1" }, error: null })
  })

  it("sends verification emails through the Resend SDK", async () => {
    const sender = new ResendEmailSender({
      apiKey: "re_test_key",
      from: "QuickCourt <auth@quickcourt.test>",
    })

    await sender.sendVerificationEmail({
      to: "player@example.com",
      name: "Court Player",
      url: "https://quickcourt.test/verify-email?token=verify-token",
    })

    expect(mocks.resendConstructor).toHaveBeenCalledWith("re_test_key")
    expect(mocks.resendSend).toHaveBeenCalledWith({
      from: "QuickCourt <auth@quickcourt.test>",
      to: "player@example.com",
      subject: "Verify your QuickCourt email",
      html: expect.stringContaining("Verify email"),
      text: expect.stringContaining(
        "https://quickcourt.test/verify-email?token=verify-token"
      ),
    })
    expect(mocks.loggerInfo).toHaveBeenCalledWith(
      { emailType: "verification" },
      "Auth email sent through Resend"
    )
  })

  it("sends password reset emails through the Resend SDK", async () => {
    const sender = new ResendEmailSender({
      apiKey: "re_test_key",
      from: "QuickCourt <auth@quickcourt.test>",
    })

    await sender.sendPasswordResetEmail({
      to: "player@example.com",
      name: null,
      url: "https://quickcourt.test/reset-password?token=reset-token",
    })

    expect(mocks.resendSend).toHaveBeenCalledWith({
      from: "QuickCourt <auth@quickcourt.test>",
      to: "player@example.com",
      subject: "Reset your QuickCourt password",
      html: expect.stringContaining("Reset password"),
      text: expect.stringContaining(
        "https://quickcourt.test/reset-password?token=reset-token"
      ),
    })
  })

  it("logs and throws when Resend reports a send failure", async () => {
    mocks.resendSend.mockResolvedValue({
      data: null,
      error: {
        name: "validation_error",
        statusCode: 422,
      },
    })
    const sender = new ResendEmailSender({
      apiKey: "re_test_key",
      from: "QuickCourt <auth@quickcourt.test>",
    })

    await expect(
      sender.sendPasswordResetEmail({
        to: "player@example.com",
        name: "Court Player",
        url: "https://quickcourt.test/reset-password?token=reset-token",
      })
    ).rejects.toThrow("Resend failed to send password-reset email.")

    expect(mocks.loggerError).toHaveBeenCalledWith(
      {
        emailType: "password-reset",
        resendErrorName: "validation_error",
        resendStatusCode: 422,
      },
      "Resend auth email send failed"
    )
  })
})
