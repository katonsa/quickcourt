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
  getCurrentOrganizationMemberships,
  getCurrentUser,
  getOrganizationMembershipsForUser,
  isAdminUser,
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

  it("getCurrentUser returns the session user when authenticated", async () => {
    const user = createUser({ id: "current-user" })
    mocks.getSession.mockResolvedValue({ user })

    await expect(getCurrentUser()).resolves.toBe(user)
  })

  it("getCurrentUser returns null when there is no session", async () => {
    mocks.getSession.mockResolvedValue(null)

    await expect(getCurrentUser()).resolves.toBeNull()
  })

  it("getCurrentOrganizationMemberships returns an empty list without querying members when unauthenticated", async () => {
    mocks.getSession.mockResolvedValue(null)

    await expect(getCurrentOrganizationMemberships()).resolves.toEqual([])
    expect(mocks.findMany).not.toHaveBeenCalled()
  })

  it("getOrganizationMembershipsForUser queries memberships with organization venue and branch access", async () => {
    const memberships = [createMembership({ userId: "user-memberships" })]
    mocks.findMany.mockResolvedValue(memberships)

    await expect(getOrganizationMembershipsForUser("user-memberships")).resolves.toBe(
      memberships
    )
    expect(mocks.findMany).toHaveBeenCalledWith({
      where: { userId: "user-memberships" },
      include: {
        organization: {
          include: {
            venue: true,
          },
        },
        branchAccess: true,
      },
      orderBy: { createdAt: "asc" },
    })
  })

  it("isAdminUser only accepts the admin role", () => {
    expect(isAdminUser({ role: "admin" })).toBe(true)
    expect(isAdminUser({ role: "user" })).toBe(false)
    expect(isAdminUser({ role: null })).toBe(false)
    expect(isAdminUser({})).toBe(false)
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

  it("requireAnyOrganizationMember scoped by organizationId returns the matching membership", async () => {
    const user = createUser({ id: "multi-org-user", role: "user" })
    const otherMembership = createMembership({
      id: "member-other",
      organizationId: "org-other",
      role: "member",
      userId: user.id,
    })
    const matchingMembership = createMembership({
      id: "member-matching",
      organizationId: "org-matching",
      role: "member",
      userId: user.id,
    })
    mocks.getSession.mockResolvedValue({ user })
    mocks.findMany.mockResolvedValue([otherMembership, matchingMembership])

    await expect(
      requireAnyOrganizationMember({ organizationId: "org-matching" })
    ).resolves.toEqual({
      user,
      membership: matchingMembership,
      memberships: [otherMembership, matchingMembership],
    })
  })

  it("requireAnyOrganizationMember rejects a user without memberships", async () => {
    mocks.getSession.mockResolvedValue({
      user: createUser({ id: "user-no-membership", role: "user" }),
    })
    mocks.findMany.mockResolvedValue([])

    await expect(requireAnyOrganizationMember()).rejects.toBeInstanceOf(AccessDeniedError)
  })

  it("requireAnyOrganizationMember scoped by organizationId rejects memberships in other organizations", async () => {
    const user = createUser({ id: "member-other-org", role: "user" })
    mocks.getSession.mockResolvedValue({ user })
    mocks.findMany.mockResolvedValue([
      createMembership({
        id: "member-other",
        organizationId: "org-other",
        role: "member",
        userId: user.id,
      }),
    ])

    await expect(
      requireAnyOrganizationMember({ organizationId: "org-missing" })
    ).rejects.toBeInstanceOf(AccessDeniedError)
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

  it("requireOrganizationOwner rejects non-owner membership", async () => {
    const user = createUser({ id: "staff-user", role: "user" })
    mocks.getSession.mockResolvedValue({ user })
    mocks.findMany.mockResolvedValue([
      createMembership({
        id: "staff-member",
        organizationId: "org-staffed",
        role: "member",
        userId: user.id,
      }),
    ])

    await expect(requireOrganizationOwner()).rejects.toBeInstanceOf(AccessDeniedError)
  })

  it("requireOrganizationOwner selects an owner membership from multiple memberships", async () => {
    const user = createUser({ id: "multi-role-user", role: "user" })
    const staffMembership = createMembership({
      id: "staff-member",
      organizationId: "org-staffed",
      role: "member",
      userId: user.id,
    })
    const ownerMembership = createMembership({
      id: "owner-member",
      organizationId: "org-owned",
      role: "owner",
      userId: user.id,
    })
    mocks.getSession.mockResolvedValue({ user })
    mocks.findMany.mockResolvedValue([staffMembership, ownerMembership])

    await expect(requireOrganizationOwner()).resolves.toEqual({
      user,
      membership: ownerMembership,
      memberships: [staffMembership, ownerMembership],
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
