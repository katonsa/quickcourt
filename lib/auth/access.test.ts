import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  getSession: vi.fn(),
  headers: vi.fn(),
}))

vi.mock("server-only", () => ({}))

vi.mock("next/headers", () => ({
  headers: mocks.headers,
}))

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: mocks.getSession,
    },
  },
}))

vi.mock("@/lib/db", () => ({
  db: {
    member: {
      findMany: mocks.findMany,
    },
  },
}))

import {
  AccessDeniedError,
  AuthenticationRequiredError,
  requireAdmin,
  requireAnyOrganizationMember,
  requireOrganizationOwner,
  requireUser,
} from "@/lib/auth/access"

type TestUser = {
  id: string
  role?: string | null
}

type TestMembership = {
  id: string
  userId: string
  organizationId: string
  role: string
  createdAt: Date
  organization: {
    id: string
    venue: null
  }
  branchAccess: []
}

describe("auth access helpers", () => {
  beforeEach(() => {
    mocks.headers.mockResolvedValue(new Headers())
    mocks.getSession.mockResolvedValue(null)
    mocks.findMany.mockResolvedValue([])
  })

  it("requireUser throws AuthenticationRequiredError when there is no session user", async () => {
    mocks.getSession.mockResolvedValue(null)

    await expect(requireUser()).rejects.toBeInstanceOf(AuthenticationRequiredError)
  })

  it("requireAdmin accepts user.role admin", async () => {
    const adminUser = createUser({ role: "admin" })
    mocks.getSession.mockResolvedValue({ user: adminUser })

    await expect(requireAdmin()).resolves.toEqual({ user: adminUser })
  })

  it("requireAdmin rejects non-admin users", async () => {
    mocks.getSession.mockResolvedValue({ user: createUser({ role: "user" }) })

    await expect(requireAdmin()).rejects.toBeInstanceOf(AccessDeniedError)
  })

  it("requireAnyOrganizationMember accepts a user with at least one member record", async () => {
    const user = createUser({ id: "user-member", role: "user" })
    const membership = createMembership({
      id: "member-1",
      organizationId: "org-1",
      role: "member",
      userId: user.id,
    })
    mocks.getSession.mockResolvedValue({ user })
    mocks.findMany.mockResolvedValue([membership])

    await expect(requireAnyOrganizationMember()).resolves.toEqual({
      user,
      membership,
      memberships: [membership],
    })
  })

  it("requireAnyOrganizationMember rejects a user without memberships", async () => {
    mocks.getSession.mockResolvedValue({
      user: createUser({ id: "user-no-membership", role: "user" }),
    })
    mocks.findMany.mockResolvedValue([])

    await expect(requireAnyOrganizationMember()).rejects.toBeInstanceOf(AccessDeniedError)
  })

  it("requireOrganizationOwner accepts owner membership", async () => {
    const user = createUser({ id: "owner-user", role: "user" })
    const membership = createMembership({
      id: "owner-member",
      organizationId: "org-owned",
      role: "owner",
      userId: user.id,
    })
    mocks.getSession.mockResolvedValue({ user })
    mocks.findMany.mockResolvedValue([membership])

    await expect(requireOrganizationOwner()).resolves.toEqual({
      user,
      membership,
      memberships: [membership],
    })
  })

  it("requireOrganizationOwner scoped by organizationId rejects owner membership in another organization", async () => {
    const user = createUser({ id: "owner-user", role: "user" })
    mocks.getSession.mockResolvedValue({ user })
    mocks.findMany.mockResolvedValue([
      createMembership({
        id: "owner-member",
        organizationId: "org-owned",
        role: "owner",
        userId: user.id,
      }),
    ])

    await expect(
      requireOrganizationOwner({ organizationId: "org-other" })
    ).rejects.toBeInstanceOf(AccessDeniedError)
  })

  it("organization membership access does not use User.role to grant venue access", async () => {
    mocks.getSession.mockResolvedValue({
      user: createUser({ id: "admin-without-membership", role: "admin" }),
    })
    mocks.findMany.mockResolvedValue([])

    await expect(requireAnyOrganizationMember()).rejects.toBeInstanceOf(AccessDeniedError)
  })
})

function createUser(overrides: Partial<TestUser> = {}): TestUser {
  return {
    id: "user-1",
    role: "user",
    ...overrides,
  }
}

function createMembership(overrides: Partial<TestMembership> = {}): TestMembership {
  const organizationId = overrides.organizationId ?? "org-1"

  return {
    id: "member-1",
    userId: "user-1",
    organizationId,
    role: "member",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    organization: {
      id: organizationId,
      venue: null,
    },
    branchAccess: [],
    ...overrides,
  }
}
