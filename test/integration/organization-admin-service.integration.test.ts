import { randomUUID } from "node:crypto"

import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

vi.mock("@/lib/auth/access", () => ({
  requireAdmin: vi.fn(),
}))

import { requireAdmin } from "@/lib/auth/access"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import {
  CREATE_VENUE_ORGANIZATION_ACTION,
  ORGANIZATION_DUPLICATE_RULE,
  ORGANIZATION_ENTITY_TYPE,
  OrganizationDuplicateError,
  createVenueOrganizationForAdmin,
} from "@/lib/organizations/organization-admin-service"

const createdOrganizationIds = new Set<string>()
const createdUserIds = new Set<string>()

const requireAdminMock = vi.mocked(requireAdmin)

describe("organization admin service integration", () => {
  beforeEach(() => {
    requireAdminMock.mockReset()
  })

  afterEach(async () => {
    await cleanupCreatedRows()
  })

  afterAll(async () => {
    await db.$disconnect()
  })

  it("creates a Better Auth-compatible organization, owner member, and audit log", async () => {
    const admin = await createUser({ role: "admin" })
    requireAdminMock.mockResolvedValue({ user: sessionUser(admin) })

    const result = await createVenueOrganizationForAdmin({
      name: "P2 Admin Courts",
      slug: uniqueSlug("p2-admin-courts"),
    })
    createdOrganizationIds.add(result.id)

    expect(result).toEqual({
      id: expect.any(String),
      name: "P2 Admin Courts",
      slug: expect.stringMatching(/^p2-admin-courts-/),
      createdAt: expect.any(Date),
    })

    const organization = await db.organization.findUnique({
      where: { id: result.id },
      include: { members: true, venue: true },
    })

    expect(organization).toMatchObject({
      id: result.id,
      name: "P2 Admin Courts",
      slug: result.slug,
      venue: null,
    })
    expect(organization?.members).toEqual([
      expect.objectContaining({
        organizationId: result.id,
        role: "owner",
        userId: admin.id,
      }),
    ])

    const auditLog = await db.auditLog.findFirstOrThrow({
      where: {
        action: CREATE_VENUE_ORGANIZATION_ACTION,
        entityId: result.id,
        entityType: ORGANIZATION_ENTITY_TYPE,
      },
    })

    expect(auditLog).toMatchObject({
      actorUserId: admin.id,
      action: CREATE_VENUE_ORGANIZATION_ACTION,
      entityType: ORGANIZATION_ENTITY_TYPE,
      entityId: result.id,
      beforeData: null,
      ipAddress: null,
      userAgent: null,
    })
    expect(auditLog.afterData).toEqual({
      id: result.id,
      name: "P2 Admin Courts",
      slug: result.slug,
    })
    expect(auditLog.metadata).toEqual({
      duplicateRule: ORGANIZATION_DUPLICATE_RULE,
      service: "organization_admin_service",
      target: "venue_onboarding",
    })
  })

  it("rejects non-admin callers without creating an organization", async () => {
    const user = await createUser({ role: "user" })
    const slug = uniqueSlug("regular-user-denied")
    requireAdminMock.mockRejectedValue(new Error("Admin access is required."))

    await expect(
      createVenueOrganizationForAdmin({
        name: "Regular User Courts",
        slug,
      })
    ).rejects.toThrow("Admin access is required.")

    await expect(
      db.organization.findUnique({ where: { slug } })
    ).resolves.toBeNull()
    await expect(
      db.auditLog.findMany({
        where: {
          actorUserId: user.id,
          action: CREATE_VENUE_ORGANIZATION_ACTION,
        },
      })
    ).resolves.toEqual([])
  })

  it("keeps duplicate creation safe by normalized organization slug", async () => {
    const admin = await createUser({ role: "admin" })
    const slug = uniqueSlug("duplicate-safe-courts")
    requireAdminMock.mockResolvedValue({ user: sessionUser(admin) })

    const firstResult = await createVenueOrganizationForAdmin({
      name: "Duplicate Safe Courts",
      slug,
    })
    createdOrganizationIds.add(firstResult.id)

    await expect(
      createVenueOrganizationForAdmin({
        name: "Duplicate Safe Courts",
        slug,
      })
    ).rejects.toBeInstanceOf(OrganizationDuplicateError)

    await expect(db.organization.count({ where: { slug } })).resolves.toBe(1)
    await expect(
      db.auditLog.count({
        where: {
          action: CREATE_VENUE_ORGANIZATION_ACTION,
          entityId: firstResult.id,
        },
      })
    ).resolves.toBe(1)
  })

  it("rolls back the Better Auth organization when audit log persistence fails", async () => {
    const admin = await createUser({ role: "admin" })
    const slug = uniqueSlug("audit-failure-rollback")

    await expect(
      createVenueOrganizationForAdmin(
        {
          name: "Audit Failure Rollback Courts",
          slug,
        },
        {
          requireAdminAccess: vi.fn().mockResolvedValue({ user: sessionUser(admin) }),
          findOrganizationBySlug: (organizationSlug) =>
            db.organization.findUnique({
              where: { slug: organizationSlug },
              select: { id: true },
            }),
          createBetterAuthOrganization: ({ actorUserId, name, slug: organizationSlug }) =>
            auth.api.createOrganization({
              body: {
                keepCurrentActiveOrganization: true,
                name,
                slug: organizationSlug,
                userId: actorUserId,
              },
            }),
          createAuditLog: vi.fn().mockRejectedValue(new Error("audit unavailable")),
          deleteOrganizationById: (organizationId) =>
            db.organization.deleteMany({
              where: { id: organizationId },
            }),
        }
      )
    ).rejects.toThrow("audit unavailable")

    await expect(
      db.organization.findUnique({ where: { slug } })
    ).resolves.toBeNull()
    await expect(
      db.auditLog.count({
        where: {
          action: CREATE_VENUE_ORGANIZATION_ACTION,
          actorUserId: admin.id,
        },
      })
    ).resolves.toBe(0)
  })
})

type TestUser = {
  banned: boolean | null
  createdAt: Date
  id: string
  email: string
  emailVerified: boolean
  image: string | null
  name: string
  role: string | null
  updatedAt: Date
}

async function createUser(overrides: Partial<TestUser> = {}) {
  const id = overrides.id ?? uniqueId("user")
  const user = await db.user.create({
    data: {
      id,
      email: overrides.email ?? `${id}@example.test`,
      emailVerified: overrides.emailVerified ?? true,
      name: overrides.name ?? "Integration Admin",
      role: overrides.role ?? "user",
    },
  })

  createdUserIds.add(user.id)

  return user
}

function sessionUser(user: TestUser) {
  return {
    banned: user.banned,
    createdAt: user.createdAt,
    email: user.email,
    emailVerified: user.emailVerified,
    id: user.id,
    image: user.image,
    name: user.name,
    role: user.role,
    updatedAt: user.updatedAt,
  }
}

async function cleanupCreatedRows(): Promise<void> {
  const organizationIds = [...createdOrganizationIds]
  const userIds = [...createdUserIds]

  createdOrganizationIds.clear()
  createdUserIds.clear()

  await db.auditLog.deleteMany({
    where: {
      OR: [
        { entityId: { in: organizationIds } },
        { actorUserId: { in: userIds } },
      ],
    },
  })
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
  return `p2-02-${prefix}-${randomUUID()}`
}

function uniqueSlug(prefix: string): string {
  return `${prefix}-${randomUUID()}`
}
