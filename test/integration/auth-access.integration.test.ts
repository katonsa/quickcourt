import { randomUUID } from "node:crypto"

import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
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

import {
  AccessDeniedError,
  requireAnyOrganizationMember,
  requireOrganizationOwner,
} from "@/lib/auth/access"
import { db } from "@/lib/db"

const createdOrganizationIds = new Set<string>()
const createdUserIds = new Set<string>()

describe("auth access helpers with migrated organization membership schema", () => {
  beforeEach(() => {
    mocks.headers.mockResolvedValue(new Headers())
    mocks.getSession.mockResolvedValue(null)
  })

  afterEach(async () => {
    await cleanupCreatedRows()
  })

  afterAll(async () => {
    await db.$disconnect()
  })

  it("denies venue organization access to an admin without membership", async () => {
    const admin = await createUser({ role: "admin" })
    mocks.getSession.mockResolvedValue({ user: sessionUser(admin) })

    await expect(requireAnyOrganizationMember()).rejects.toBeInstanceOf(
      AccessDeniedError
    )
  })

  it("grants organization access through a member record", async () => {
    const user = await createUser({ role: "user" })
    const organization = await createOrganization()
    const member = await createMember({
      organizationId: organization.id,
      role: "member",
      userId: user.id,
    })
    mocks.getSession.mockResolvedValue({ user: sessionUser(user) })

    await expect(
      requireAnyOrganizationMember({ organizationId: organization.id })
    ).resolves.toMatchObject({
      user: { id: user.id, role: "user" },
      membership: {
        id: member.id,
        organizationId: organization.id,
        role: "member",
        organization: {
          id: organization.id,
          venue: null,
        },
        branchAccess: [],
      },
      memberships: [
        {
          id: member.id,
          organizationId: organization.id,
          role: "member",
        },
      ],
    })
  })

  it("grants organization owner access through an owner member record", async () => {
    const user = await createUser({ role: "user" })
    const organization = await createOrganization()
    const venue = await db.venue.create({
      data: {
        name: "Owner Courts",
        organizationId: organization.id,
        slug: uniqueSlug("owner-courts"),
      },
    })
    const member = await createMember({
      organizationId: organization.id,
      role: "owner",
      userId: user.id,
    })
    mocks.getSession.mockResolvedValue({ user: sessionUser(user) })

    await expect(
      requireOrganizationOwner({ organizationId: organization.id })
    ).resolves.toMatchObject({
      user: { id: user.id, role: "user" },
      membership: {
        id: member.id,
        organizationId: organization.id,
        role: "owner",
        organization: {
          id: organization.id,
          venue: {
            id: venue.id,
            name: "Owner Courts",
          },
        },
        branchAccess: [],
      },
    })
  })

  it("denies organization access to an authenticated non-member", async () => {
    const user = await createUser({ role: "user" })
    const organization = await createOrganization()
    mocks.getSession.mockResolvedValue({ user: sessionUser(user) })

    await expect(
      requireAnyOrganizationMember({ organizationId: organization.id })
    ).rejects.toBeInstanceOf(AccessDeniedError)
  })

  it("denies owner access to an organization member without owner role", async () => {
    const user = await createUser({ role: "user" })
    const organization = await createOrganization()
    await createMember({
      organizationId: organization.id,
      role: "member",
      userId: user.id,
    })
    mocks.getSession.mockResolvedValue({ user: sessionUser(user) })

    await expect(
      requireOrganizationOwner({ organizationId: organization.id })
    ).rejects.toBeInstanceOf(AccessDeniedError)
  })
})

type TestUser = {
  id: string
  email: string
  name: string
  role: string | null
}

async function createUser(overrides: Partial<TestUser> = {}) {
  const id = overrides.id ?? uniqueId("user")
  const user = await db.user.create({
    data: {
      id,
      email: overrides.email ?? `${id}@example.test`,
      emailVerified: true,
      name: overrides.name ?? "Integration User",
      role: overrides.role ?? "user",
    },
  })

  createdUserIds.add(user.id)

  return user
}

async function createOrganization() {
  const id = uniqueId("org")
  const organization = await db.organization.create({
    data: {
      createdAt: new Date(),
      id,
      name: "Integration Courts",
      slug: uniqueSlug("integration-courts"),
    },
  })

  createdOrganizationIds.add(organization.id)

  return organization
}

async function createMember(input: {
  organizationId: string
  role: "member" | "owner"
  userId: string
}) {
  return db.member.create({
    data: {
      createdAt: new Date(),
      id: uniqueId("member"),
      organizationId: input.organizationId,
      role: input.role,
      userId: input.userId,
    },
  })
}

function sessionUser(user: TestUser) {
  return {
    email: user.email,
    id: user.id,
    name: user.name,
    role: user.role,
  }
}

async function cleanupCreatedRows(): Promise<void> {
  const organizationIds = [...createdOrganizationIds]
  const userIds = [...createdUserIds]

  createdOrganizationIds.clear()
  createdUserIds.clear()

  await db.organization.deleteMany({
    where: {
      id: {
        in: organizationIds,
      },
    },
  })
  await db.user.deleteMany({
    where: {
      id: {
        in: userIds,
      },
    },
  })
}

function uniqueId(prefix: string): string {
  return `p1-08-${prefix}-${randomUUID()}`
}

function uniqueSlug(prefix: string): string {
  return `${prefix}-${randomUUID()}`
}
