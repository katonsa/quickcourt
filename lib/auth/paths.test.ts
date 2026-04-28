import { describe, expect, it } from "vitest"

import { sanitizeSignInRedirectTo } from "@/lib/auth/paths"

describe("auth path helpers", () => {
  it("keeps same-origin relative redirect paths", () => {
    expect(sanitizeSignInRedirectTo("/dashboard?tab=bookings")).toBe(
      "/dashboard?tab=bookings"
    )
  })

  it("uses the first redirect value when duplicate query params are provided", () => {
    expect(sanitizeSignInRedirectTo(["/dashboard", "/admin"])).toBe("/dashboard")
  })

  it("rejects absolute and protocol-relative redirect targets", () => {
    expect(sanitizeSignInRedirectTo("https://example.com/dashboard")).toBeNull()
    expect(sanitizeSignInRedirectTo("//example.com/dashboard")).toBeNull()
  })

  it("rejects empty and non-root-relative redirect targets", () => {
    expect(sanitizeSignInRedirectTo(undefined)).toBeNull()
    expect(sanitizeSignInRedirectTo("")).toBeNull()
    expect(sanitizeSignInRedirectTo("dashboard")).toBeNull()
  })
})
