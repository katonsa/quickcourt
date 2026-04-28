import { describe, expect, it } from "vitest"

import {
  AUTH_PASSWORD_MAX_LENGTH,
  AUTH_PASSWORD_MIN_LENGTH,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/validation/auth"

describe("auth validation schemas", () => {
  it("accepts sign-in input and trims email addresses", () => {
    const result = signInSchema.safeParse({
      email: " user@example.com ",
      password: "password123",
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.email).toBe("user@example.com")
    }
  })

  it("rejects invalid sign-in email and short passwords", () => {
    const result = signInSchema.safeParse({
      email: "not-an-email",
      password: "short",
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(issuePaths(result.error.issues)).toEqual(
        expect.arrayContaining(["email", "password"])
      )
    }
  })

  it("matches Better Auth password bounds", () => {
    expect(AUTH_PASSWORD_MIN_LENGTH).toBe(8)
    expect(AUTH_PASSWORD_MAX_LENGTH).toBe(128)

    expect(
      resetPasswordSchema.safeParse({
        password: "a".repeat(AUTH_PASSWORD_MIN_LENGTH),
        confirmPassword: "a".repeat(AUTH_PASSWORD_MIN_LENGTH),
      }).success
    ).toBe(true)

    expect(
      resetPasswordSchema.safeParse({
        password: "a".repeat(AUTH_PASSWORD_MAX_LENGTH + 1),
        confirmPassword: "a".repeat(AUTH_PASSWORD_MAX_LENGTH + 1),
      }).success
    ).toBe(false)
  })

  it("requires matching sign-up password confirmation", () => {
    const result = signUpSchema.safeParse({
      name: "QuickCourt User",
      email: "user@example.com",
      password: "password123",
      confirmPassword: "different123",
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(issuePaths(result.error.issues)).toContain("confirmPassword")
    }
  })

  it("validates forgot password by email only", () => {
    expect(
      forgotPasswordSchema.safeParse({
        email: "owner@example.com",
      }).success
    ).toBe(true)

    expect(
      forgotPasswordSchema.safeParse({
        email: "",
      }).success
    ).toBe(false)
  })

  it("requires current password and matching new password for password changes", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "",
      newPassword: "password123",
      confirmPassword: "different123",
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(issuePaths(result.error.issues)).toEqual(
        expect.arrayContaining(["currentPassword", "confirmPassword"])
      )
    }
  })
})

function issuePaths(issues: Array<{ path: PropertyKey[] }>) {
  return issues.map((issue) => issue.path.join("."))
}
