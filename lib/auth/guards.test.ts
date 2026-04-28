import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  redirect: vi.fn(),
  requireAdmin: vi.fn(),
  requireAnyOrganizationMember: vi.fn(),
  requireOrganizationOwner: vi.fn(),
  requireUser: vi.fn(),
}))

class TestRedirectError extends Error {
  constructor(readonly path: string) {
    super(`Redirected to ${path}`)
    this.name = "TestRedirectError"
  }
}

vi.mock("server-only", () => ({}))

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}))

vi.mock("@/lib/auth/access", () => {
  class AuthenticationRequiredError extends Error {
    constructor() {
      super("Authentication is required.")
      this.name = "AuthenticationRequiredError"
    }
  }

  class AccessDeniedError extends Error {
    constructor(message = "Access is denied.") {
      super(message)
      this.name = "AccessDeniedError"
    }
  }

  return {
    AccessDeniedError,
    AuthenticationRequiredError,
    requireAdmin: mocks.requireAdmin,
    requireAnyOrganizationMember: mocks.requireAnyOrganizationMember,
    requireOrganizationOwner: mocks.requireOrganizationOwner,
    requireUser: mocks.requireUser,
  }
})

import { AccessDeniedError, AuthenticationRequiredError } from "@/lib/auth/access"
import {
  FORBIDDEN_PATH,
  SIGN_IN_PATH,
  handleAccessError,
  requireAdminForRoute,
  requireAnyOrganizationMemberForRoute,
  requireOrganizationOwnerForRoute,
  requireUserForRoute,
} from "@/lib/auth/guards"

describe("route guard response helpers", () => {
  beforeEach(() => {
    mocks.redirect.mockImplementation((path: string) => {
      throw new TestRedirectError(path)
    })
    mocks.requireAdmin.mockReset()
    mocks.requireAnyOrganizationMember.mockReset()
    mocks.requireOrganizationOwner.mockReset()
    mocks.requireUser.mockReset()
  })

  it("redirects authentication errors to the sign-in path", () => {
    expect(() => handleAccessError(new AuthenticationRequiredError())).toThrow(
      TestRedirectError
    )
    expect(mocks.redirect).toHaveBeenCalledWith(SIGN_IN_PATH)
  })

  it("redirects access denied errors to the forbidden path", () => {
    expect(() => handleAccessError(new AccessDeniedError())).toThrow(TestRedirectError)
    expect(mocks.redirect).toHaveBeenCalledWith(FORBIDDEN_PATH)
  })

  it("rethrows unexpected errors", () => {
    const error = new Error("database unavailable")

    expect(() => handleAccessError(error)).toThrow(error)
    expect(mocks.redirect).not.toHaveBeenCalled()
  })

  it("requireUserForRoute calls requireUser and returns the result", async () => {
    const result = { id: "user-1" }
    mocks.requireUser.mockResolvedValue(result)

    await expect(requireUserForRoute()).resolves.toBe(result)
    expect(mocks.requireUser).toHaveBeenCalledTimes(1)
  })

  it("requireAdminForRoute calls requireAdmin and returns the result", async () => {
    const result = { user: { id: "admin-1", role: "admin" } }
    mocks.requireAdmin.mockResolvedValue(result)

    await expect(requireAdminForRoute()).resolves.toBe(result)
    expect(mocks.requireAdmin).toHaveBeenCalledTimes(1)
  })

  it("requireAdminForRoute redirects authentication failures to sign in", async () => {
    mocks.requireAdmin.mockRejectedValue(new AuthenticationRequiredError())

    await expect(requireAdminForRoute()).rejects.toBeInstanceOf(TestRedirectError)
    expect(mocks.redirect).toHaveBeenCalledWith(SIGN_IN_PATH)
  })

  it("requireAdminForRoute redirects access failures to forbidden", async () => {
    mocks.requireAdmin.mockRejectedValue(new AccessDeniedError("Admin access required."))

    await expect(requireAdminForRoute()).rejects.toBeInstanceOf(TestRedirectError)
    expect(mocks.redirect).toHaveBeenCalledWith(FORBIDDEN_PATH)
  })

  it("requireAnyOrganizationMemberForRoute calls requireAnyOrganizationMember and returns the result", async () => {
    const result = {
      user: { id: "member-user" },
      membership: { id: "member-1" },
      memberships: [{ id: "member-1" }],
    }
    mocks.requireAnyOrganizationMember.mockResolvedValue(result)

    await expect(requireAnyOrganizationMemberForRoute()).resolves.toBe(result)
    expect(mocks.requireAnyOrganizationMember).toHaveBeenCalledWith(undefined)
  })

  it("requireAnyOrganizationMemberForRoute redirects authentication failures", async () => {
    mocks.requireAnyOrganizationMember.mockRejectedValue(new AuthenticationRequiredError())

    await expect(requireAnyOrganizationMemberForRoute()).rejects.toBeInstanceOf(
      TestRedirectError
    )
    expect(mocks.redirect).toHaveBeenCalledWith(SIGN_IN_PATH)
  })

  it("requireAnyOrganizationMemberForRoute redirects access failures to forbidden", async () => {
    mocks.requireAnyOrganizationMember.mockRejectedValue(
      new AccessDeniedError("Organization membership is required.")
    )

    await expect(requireAnyOrganizationMemberForRoute()).rejects.toBeInstanceOf(
      TestRedirectError
    )
    expect(mocks.redirect).toHaveBeenCalledWith(FORBIDDEN_PATH)
  })

  it("requireOrganizationOwnerForRoute passes options to the access helper", async () => {
    const options = { organizationId: "org-1" }
    const result = { user: { id: "owner-1" }, membership: { id: "member-1" } }
    mocks.requireOrganizationOwner.mockResolvedValue(result)

    await expect(requireOrganizationOwnerForRoute(options)).resolves.toBe(result)
    expect(mocks.requireOrganizationOwner).toHaveBeenCalledWith(options)
  })

  it("requireOrganizationOwnerForRoute redirects access failures to forbidden", async () => {
    mocks.requireOrganizationOwner.mockRejectedValue(
      new AccessDeniedError("Organization owner access is required.")
    )

    await expect(requireOrganizationOwnerForRoute()).rejects.toBeInstanceOf(
      TestRedirectError
    )
    expect(mocks.redirect).toHaveBeenCalledWith(FORBIDDEN_PATH)
  })
})
