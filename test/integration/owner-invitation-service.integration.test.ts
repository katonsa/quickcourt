import { createHash, randomUUID } from "node:crypto"

import { convertSetCookieToCookie } from "better-auth/test"
import { afterAll, afterEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

import { auth } from "@/lib/auth"
import { getOrganizationMembershipsForUser } from "@/lib/auth/access"
import { db } from "@/lib/db"
import {
  ACCEPT_OWNER_INVITATION_ACTION,
  BETTER_AUTH_INVITATION_EXPIRES_IN_SECONDS,
  CREATE_OWNER_INVITATION_ACTION,
  OWNER_INVITATION_ACCEPTANCE_ENTITY_TYPE,
  OWNER_INVITATION_ENTITY_TYPE,
  OWNER_INVITATION_ROLE,
  OwnerInvitationDuplicateError,
  OwnerInvitationTargetUserNotFoundError,
  acceptOrganizationOwnerInvitation,
  inviteOrganizationOwnerForAdmin,
  type BetterAuthAcceptOwnerInvitationResult,
  type OwnerInvitationRecord,
} from "@/lib/organizations/owner-invitation-service"

const createdOrganizationIds = new Set<string>()
const createdUserIds = new Set<string>()
const createdInvitationIds = new Set<string>()
const createdEmails = new Set<string>()

describe("owner invitation service integration", () => {
  afterEach(async () => {
    await cleanupCreatedRows()
  })

  afterAll(async () => {
    await db.$disconnect()
  })

  it("creates a pending owner invitation for an existing user with safe audit metadata", async () => {
    const admin = await createUser({ role: "admin" })
    const owner = await createUser({
      email: uniqueEmail("owner"),
      name: "Registered Owner",
    })
    const organization = await createOrganization()
    const dependencies = createInviteDependencies(admin)

    const result = await inviteOrganizationOwnerForAdmin(
      {
        email: owner.email.toUpperCase(),
        organizationId: organization.id,
      },
      dependencies
    )
    expect(result).toMatchObject({
      invitation: {
        email: owner.email,
        organizationId: organization.id,
        role: OWNER_INVITATION_ROLE,
        status: "pending",
        inviterId: admin.id,
      },
      invitedUser: {
        id: owner.id,
        email: owner.email,
      },
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
      },
    })
    expect(result.invitation.expiresAt.getTime()).toBeGreaterThan(
      Date.now() + (BETTER_AUTH_INVITATION_EXPIRES_IN_SECONDS - 60) * 1000
    )
    const invitationId = invitationIdFromAcceptUrl(result.emailPayload.acceptUrl)
    createdInvitationIds.add(invitationId)
    expect(result.emailPayload.invitation).not.toHaveProperty("id")

    await expect(
      db.invitation.findUnique({ where: { id: invitationId } })
    ).resolves.toMatchObject({
      email: owner.email,
      organizationId: organization.id,
      role: OWNER_INVITATION_ROLE,
      status: "pending",
    })

    const auditLog = await db.auditLog.findFirstOrThrow({
      where: {
        action: CREATE_OWNER_INVITATION_ACTION,
        entityId: invitationIdAuditHash(invitationId),
        entityType: OWNER_INVITATION_ENTITY_TYPE,
      },
    })

    expect(auditLog).toMatchObject({
      actorUserId: admin.id,
      beforeData: null,
      ipAddress: null,
      userAgent: null,
    })
    expect(auditLog.afterData).toEqual({
      invitedUserId: owner.id,
      organizationId: organization.id,
      role: OWNER_INVITATION_ROLE,
      status: "pending",
    })
    expect(auditLog.metadata).toMatchObject({
      betterAuthInvitationExpiresInSeconds:
        BETTER_AUTH_INVITATION_EXPIRES_IN_SECONDS,
      emailDomain: owner.email.split("@")[1],
      invitationIdHash: invitationIdAuditHash(invitationId),
      service: "owner_invitation_service",
      target: "venue_onboarding",
    })
    expect(auditLog.metadata).not.toMatchObject({
      email: owner.email,
    })
  })

  it("rejects non-admin callers without creating an owner invitation", async () => {
    const regularUser = await createUser({ role: "user" })
    const owner = await createUser({ email: uniqueEmail("regular-denied-owner") })
    const organization = await createOrganization()
    const dependencies = createInviteDependencies(regularUser, {
      requireAdminAccess: vi
        .fn()
        .mockRejectedValue(new Error("Admin access is required.")),
    })

    await expect(
      inviteOrganizationOwnerForAdmin(
        {
          email: owner.email,
          organizationId: organization.id,
        },
        dependencies
      )
    ).rejects.toThrow("Admin access is required.")

    await expect(
      db.invitation.count({
        where: {
          email: owner.email,
          organizationId: organization.id,
          role: OWNER_INVITATION_ROLE,
        },
      })
    ).resolves.toBe(0)
  })

  it("rejects unknown email safely without creating an invitation", async () => {
    const admin = await createUser({ role: "admin" })
    const organization = await createOrganization()
    const dependencies = createInviteDependencies(admin)
    const unknownEmail = uniqueEmail("unknown-owner")

    await expect(
      inviteOrganizationOwnerForAdmin(
        {
          email: unknownEmail,
          organizationId: organization.id,
        },
        dependencies
      )
    ).rejects.toBeInstanceOf(OwnerInvitationTargetUserNotFoundError)

    await expect(
      db.invitation.count({
        where: {
          email: unknownEmail,
          organizationId: organization.id,
        },
      })
    ).resolves.toBe(0)
  })

  it("prevents duplicate active owner invitations for the same organization and email", async () => {
    const admin = await createUser({ role: "admin" })
    const owner = await createUser({ email: uniqueEmail("duplicate-owner") })
    const organization = await createOrganization()
    const dependencies = createInviteDependencies(admin)

    const first = await inviteOrganizationOwnerForAdmin(
      {
        email: owner.email,
        organizationId: organization.id,
      },
      dependencies
    )
    createdInvitationIds.add(invitationIdFromAcceptUrl(first.emailPayload.acceptUrl))

    await expect(
      inviteOrganizationOwnerForAdmin(
        {
          email: owner.email,
          organizationId: organization.id,
        },
        dependencies
      )
    ).rejects.toBeInstanceOf(OwnerInvitationDuplicateError)

    await expect(
      db.invitation.count({
        where: {
          email: owner.email,
          organizationId: organization.id,
          role: OWNER_INVITATION_ROLE,
          status: "pending",
        },
      })
    ).resolves.toBe(1)
  })

  it("allows a fresh owner invitation after canceling an expired pending owner invite", async () => {
    const admin = await createUser({ role: "admin" })
    const owner = await createUser({ email: uniqueEmail("expired-owner") })
    const organization = await createOrganization()
    const expiredInvitation = await db.invitation.create({
      data: {
        createdAt: new Date("2026-04-01T00:00:00.000Z"),
        email: owner.email,
        expiresAt: new Date("2026-04-02T00:00:00.000Z"),
        id: uniqueId("expired-invitation"),
        inviterId: admin.id,
        organizationId: organization.id,
        role: OWNER_INVITATION_ROLE,
        status: "pending",
      },
    })
    createdInvitationIds.add(expiredInvitation.id)

    const result = await inviteOrganizationOwnerForAdmin(
      {
        email: owner.email,
        organizationId: organization.id,
      },
      createInviteDependencies(admin)
    )
    const newInvitationId = invitationIdFromAcceptUrl(result.emailPayload.acceptUrl)
    createdInvitationIds.add(newInvitationId)

    await expect(
      db.invitation.findUnique({ where: { id: expiredInvitation.id } })
    ).resolves.toMatchObject({ status: "canceled" })
    await expect(
      db.invitation.findUnique({ where: { id: newInvitationId } })
    ).resolves.toMatchObject({ status: "pending" })
  })

  it("accepts the owner invitation through Better Auth and grants venue dashboard membership access", async () => {
    const admin = await createUser({ role: "admin" })
    const owner = await createAuthUser({
      email: uniqueEmail("accepted-owner"),
      name: "Accepted Owner",
    })
    const organization = await createOrganization()
    const inviteDependencies = createInviteDependencies(admin)

    const invitationResult = await inviteOrganizationOwnerForAdmin(
      {
        email: owner.email,
        organizationId: organization.id,
      },
      inviteDependencies
    )
    const invitationId = invitationIdFromAcceptUrl(
      invitationResult.emailPayload.acceptUrl
    )
    createdInvitationIds.add(invitationId)

    const ownerHeaders = await signInHeaders(owner.email, owner.password)
    const acceptResult = await acceptOrganizationOwnerInvitation(
      {
        invitationId,
      },
      createAcceptDependencies(owner, ownerHeaders)
    )

    expect(acceptResult.member).toMatchObject({
      organizationId: organization.id,
      role: OWNER_INVITATION_ROLE,
      userId: owner.id,
    })

    const persistedMember = await db.member.findFirstOrThrow({
      where: {
        organizationId: organization.id,
        userId: owner.id,
      },
    })

    expect(persistedMember.role).toBe(OWNER_INVITATION_ROLE)

    await expect(getOrganizationMembershipsForUser(owner.id)).resolves.toEqual([
      expect.objectContaining({
        id: persistedMember.id,
        organizationId: organization.id,
        role: OWNER_INVITATION_ROLE,
      }),
    ])

    const auditLog = await db.auditLog.findFirstOrThrow({
      where: {
        action: ACCEPT_OWNER_INVITATION_ACTION,
        entityId: persistedMember.id,
        entityType: OWNER_INVITATION_ACCEPTANCE_ENTITY_TYPE,
      },
    })

    expect(auditLog).toMatchObject({
      actorUserId: owner.id,
      action: ACCEPT_OWNER_INVITATION_ACTION,
      entityType: OWNER_INVITATION_ACCEPTANCE_ENTITY_TYPE,
      entityId: persistedMember.id,
    })
    expect(auditLog.afterData).toEqual({
      id: persistedMember.id,
      organizationId: organization.id,
      role: OWNER_INVITATION_ROLE,
      userId: owner.id,
    })
    expect(auditLog.metadata).toEqual({
      invitationIdHash: invitationIdAuditHash(invitationId),
      service: "owner_invitation_service",
      target: "venue_onboarding",
    })
  })

  it("enforces one organization member row per user", async () => {
    const owner = await createUser({ email: uniqueEmail("unique-member") })
    const organization = await createOrganization()

    await db.member.create({
      data: {
        createdAt: new Date(),
        id: uniqueId("member"),
        organizationId: organization.id,
        role: OWNER_INVITATION_ROLE,
        userId: owner.id,
      },
    })

    await expect(
      db.member.create({
        data: {
          createdAt: new Date(),
          id: uniqueId("member"),
          organizationId: organization.id,
          role: OWNER_INVITATION_ROLE,
          userId: owner.id,
        },
      })
    ).rejects.toMatchObject({ code: "P2002" })
  })
})

type TestUser = {
  banned: boolean | null
  createdAt: Date
  email: string
  emailVerified: boolean
  id: string
  image: string | null
  name: string
  password?: string
  role: string | null
  updatedAt: Date
}

async function createUser(overrides: Partial<TestUser> = {}) {
  const id = overrides.id ?? uniqueId("user")
  const email = overrides.email ?? `${id}@example.test`
  const user = await db.user.create({
    data: {
      id,
      email,
      emailVerified: overrides.emailVerified ?? true,
      name: overrides.name ?? "Integration User",
      role: overrides.role ?? "user",
    },
  })

  createdUserIds.add(user.id)
  createdEmails.add(user.email)

  return user
}

async function createAuthUser(overrides: Partial<TestUser> = {}) {
  const email = overrides.email ?? uniqueEmail("auth-user")
  const password = overrides.password ?? "Password123!"

  await auth.api.signUpEmail({
    body: {
      email,
      name: overrides.name ?? "Integration Auth User",
      password,
    },
  })

  const user = await db.user.update({
    where: { email },
    data: {
      emailVerified: overrides.emailVerified ?? true,
      role: overrides.role ?? "user",
    },
  })

  createdUserIds.add(user.id)
  createdEmails.add(user.email)

  return {
    ...user,
    password,
  }
}

async function createOrganization() {
  const id = uniqueId("org")
  const organization = await db.organization.create({
    data: {
      createdAt: new Date(),
      id,
      name: "Owner Invitation Courts",
      slug: uniqueSlug("owner-invitation-courts"),
    },
  })

  createdOrganizationIds.add(organization.id)

  return organization
}

function createInviteDependencies(admin: TestUser, overrides = {}) {
  return {
    appUrl: "https://quickcourt.test",
    requireAdminAccess: vi.fn().mockResolvedValue({ user: sessionUser(admin) }),
    findOrganizationById: (organizationId: string) =>
      db.organization.findUnique({
        where: { id: organizationId },
        select: {
          id: true,
          name: true,
          slug: true,
        },
      }),
    findUserByEmail: (email: string) =>
      db.user.findUnique({
        where: { email },
        select: {
          email: true,
          id: true,
          name: true,
        },
      }),
    findMembership: ({
      organizationId,
      userId,
    }: {
      organizationId: string
      userId: string
    }) =>
      db.member.findFirst({
        where: {
          organizationId,
          userId,
        },
        select: {
          id: true,
          role: true,
        },
      }),
    cancelExpiredOwnerInvitations: ({
      organizationId,
      email,
    }: {
      organizationId: string
      email: string
    }) =>
      db.invitation.updateMany({
        where: {
          email,
          organizationId,
          role: OWNER_INVITATION_ROLE,
          status: "pending",
          expiresAt: {
            lte: new Date(),
          },
        },
        data: {
          status: "canceled",
        },
      }),
    findActiveOwnerInvitation: ({
      organizationId,
      email,
    }: {
      organizationId: string
      email: string
    }) =>
      db.invitation.findFirst({
        where: {
          email,
          organizationId,
          role: OWNER_INVITATION_ROLE,
          status: "pending",
          expiresAt: {
            gt: new Date(),
          },
        },
      }),
    createOwnerInvitationRecord: async ({
      actorUserId,
      email,
      organizationId,
    }: {
      actorUserId: string
      email: string
      organizationId: string
    }) => {
      const invitation = await db.invitation.create({
        data: {
          createdAt: new Date(),
          email,
          expiresAt: new Date(
            Date.now() + BETTER_AUTH_INVITATION_EXPIRES_IN_SECONDS * 1000
          ),
          id: uniqueId("invitation"),
          inviterId: actorUserId,
          organizationId,
          role: OWNER_INVITATION_ROLE,
          status: "pending",
        },
      })

      createdInvitationIds.add(invitation.id)

      return invitation
    },
    createInvitationAuditLog: ({
      actorUserId,
      invitation,
      invitedUser,
      organization,
    }: {
      actorUserId: string
      invitation: OwnerInvitationRecord
      invitedUser: { id: string }
      organization: { id: string }
    }) =>
      db.auditLog.create({
        data: {
          actorUserId,
          action: CREATE_OWNER_INVITATION_ACTION,
          entityType: OWNER_INVITATION_ENTITY_TYPE,
          entityId: invitationIdAuditHash(invitation.id),
          afterData: {
            invitedUserId: invitedUser.id,
            organizationId: organization.id,
            role: OWNER_INVITATION_ROLE,
            status: invitation.status,
          },
          metadata: {
            betterAuthInvitationExpiresInSeconds:
              BETTER_AUTH_INVITATION_EXPIRES_IN_SECONDS,
            emailDomain: invitation.email.split("@")[1],
            emailHash: "integration-test-hash",
            invitationIdHash: invitationIdAuditHash(invitation.id),
            service: "owner_invitation_service",
            target: "venue_onboarding",
          },
        },
      }),
    ...overrides,
  }
}

function createAcceptDependencies(owner: TestUser, ownerHeaders: Headers) {
  return {
    requireCurrentUser: vi.fn().mockResolvedValue(sessionUser(owner)),
    acceptBetterAuthInvitation: ({ invitationId }: { invitationId: string }) =>
      auth.api.acceptInvitation({
        body: { invitationId },
        headers: ownerHeaders,
      }) as Promise<BetterAuthAcceptOwnerInvitationResult>,
    createInvitationAcceptanceAuditLog: ({
      actorUserId,
      invitation,
      member,
    }: {
      actorUserId: string
      invitation: OwnerInvitationRecord
      member: { id: string; organizationId: string; role: string; userId: string }
    }) =>
      db.auditLog.create({
        data: {
          actorUserId,
          action: ACCEPT_OWNER_INVITATION_ACTION,
          entityType: OWNER_INVITATION_ACCEPTANCE_ENTITY_TYPE,
          entityId: member.id,
          beforeData: {
            invitationIdHash: invitationIdAuditHash(invitation.id),
            organizationId: invitation.organizationId,
            role: invitation.role,
            status: "pending",
          },
          afterData: {
            id: member.id,
            organizationId: member.organizationId,
            role: member.role,
            userId: member.userId,
          },
          metadata: {
            invitationIdHash: invitationIdAuditHash(invitation.id),
            service: "owner_invitation_service",
            target: "venue_onboarding",
          },
        },
      }),
  }
}

async function signInHeaders(email: string, password: string): Promise<Headers> {
  const response = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
    returnHeaders: true,
  })

  return convertSetCookieToCookie(response.headers ?? new Headers())
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
  const invitationIds = [...createdInvitationIds]
  const emails = [...createdEmails]

  createdOrganizationIds.clear()
  createdUserIds.clear()
  createdInvitationIds.clear()
  createdEmails.clear()

  await db.auditLog.deleteMany({
    where: {
      OR: [
        { actorUserId: { in: userIds } },
        { entityId: { in: organizationIds } },
        { entityId: { in: invitationIds } },
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
  await db.verification.deleteMany({
    where: {
      identifier: {
        in: emails,
      },
    },
  })
}

function uniqueId(prefix: string): string {
  return `p2-03-${prefix}-${randomUUID()}`
}

function uniqueSlug(prefix: string): string {
  return `${prefix}-${randomUUID()}`
}

function uniqueEmail(prefix: string): string {
  return `${uniqueId(prefix)}@example.test`
}

function invitationIdFromAcceptUrl(acceptUrl: string): string {
  const invitationId = new URL(acceptUrl).searchParams.get("invitationId")

  if (!invitationId) {
    throw new Error("Expected owner invitation accept URL to include invitationId.")
  }

  return invitationId
}

function invitationIdAuditHash(invitationId: string): string {
  return createHash("sha256").update(invitationId).digest("hex")
}
