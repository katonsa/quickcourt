import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

import { ConsoleEmailSender } from "./console-sender"

describe("ConsoleEmailSender", () => {
  beforeEach(() => {
    vi.spyOn(console, "info").mockImplementation(() => undefined)
  })

  it("logs auth email links in development", async () => {
    const sender = new ConsoleEmailSender({ appEnv: "development" })

    await sender.sendVerificationEmail({
      to: "player@example.com",
      name: "Court Player",
      url: "https://quickcourt.test/verify-email?token=verify-token",
    })

    expect(console.info).toHaveBeenCalledWith(
      [
        "[auth-email:verification] Verify your QuickCourt email",
        "To: player@example.com",
        "Link: https://quickcourt.test/verify-email?token=verify-token",
      ].join("\n")
    )
  })

  it("omits auth links outside development", async () => {
    const sender = new ConsoleEmailSender({ appEnv: "test" })

    await sender.sendPasswordResetEmail({
      to: "player@example.com",
      name: null,
      url: "https://quickcourt.test/reset-password?token=reset-token",
    })

    expect(console.info).toHaveBeenCalledWith(
      "[auth-email:password reset] Reset your QuickCourt password"
    )
    expect(console.info).not.toHaveBeenCalledWith(
      expect.stringContaining("reset-token")
    )
    expect(console.info).not.toHaveBeenCalledWith(
      expect.stringContaining("player@example.com")
    )
  })
})
