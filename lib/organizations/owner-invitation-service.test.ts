import { describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}))

vi.mock("@/config/env", () => ({
  env: {
    APP_URL: "https://quickcourt.test",
  },
}))

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      acceptInvitation: vi.fn(),
    },
  },
}))

vi.mock("@/lib/auth/access", () => ({
  requireAdmin: vi.fn(),
  requireUser: vi.fn(),
}))

vi.mock("@/lib/db", () => ({
  db: {
    auditLog: {
      create: vi.fn(),
    },
    invitation: {
      create: vi.fn(),
      findFirst: vi.fn(),
      updateMany: vi.fn(),
    },
    member: {
      findFirst: vi.fn(),
    },
    organization: {
      findUnique: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}))

import {
  OWNER_INVITATION_ROLE,
  OwnerInvitationAcceptanceError,
  OwnerInvitationAlreadyMemberError,
  OwnerInvitationOrganizationNotFoundError,
  OwnerInvitationValidationError,
  acceptOrganizationOwnerInvitation,
  createOwnerInvitationEmailPayload,
  inviteOrganizationOwnerForAdmin,
  normalizeOwnerInvitationEmail,
  validateAcceptOrganizationOwnerInvitationInput,
  validateInviteOrganizationOwnerInput,
  type OwnerInvitationRecord,
} from "@/lib/organizations/owner-invitation-service"

describe("owner invitation service", () => {
  it("normalizes owner invitation email addresses", () => {
    expect(normalizeOwnerInvitationEmail("  OWNER@Example.COM  ")).toBe(
      "owner@example.com"
    )
  })

  it("validates and normalizes invite input", () => {
    expect(
      validateInviteOrganizationOwnerInput({
        organizationId: " org-1 ",
        email: " OWNER@Example.COM ",
      })
    ).toEqual({
      organizationId: "org-1",
      email: "owner@example.com",
    })
  })

  it("rejects missing or invalid invite input", () => {
    expect(() =>
      validateInviteOrganizationOwnerInput({
        organizationId: " ",
        email: "not-an-email",
      })
    ).toThrow(OwnerInvitationValidationError)
  })

  it("validates accept input", () => {
    expect(
      validateAcceptOrganizationOwnerInvitationInput({
        invitationId: " invitation-1 ",
      })
    ).toEqual({ invitationId: "invitation-1" })

    expect(() =>
      validateAcceptOrganizationOwnerInvitationInput({ invitationId: " " })
    ).toThrow(OwnerInvitationValidationError)
  })

  it("rejects a non-admin actor before disclosing organization or account state", async () => {
    const accessError = new Error("Admin access is required.")
    const dependencies = createInviteDependencies({
      requireAdminAccess: vi.fn().mockRejectedValue(accessError),
    })

    await expect(
      inviteOrganizationOwnerForAdmin(
        { organizationId: "org-1", email: "owner@example.com" },
        dependencies
      )
    ).rejects.toBe(accessError)

    expect(dependencies.findOrganizationById).not.toHaveBeenCalled()
    expect(dependencies.findUserByEmail).not.toHaveBeenCalled()
    expect(dependencies.createOwnerInvitationRecord).not.toHaveBeenCalled()
  })

  it("validates target organization existence", async () => {
    const dependencies = createInviteDependencies({
      findOrganizationById: vi.fn().mockResolvedValue(null),
    })

    await expect(
      inviteOrganizationOwnerForAdmin(
        { organizationId: "missing-org", email: "owner@example.com" },
        dependencies
      )
    ).rejects.toBeInstanceOf(OwnerInvitationOrganizationNotFoundError)

    expect(dependencies.findUserByEmail).not.toHaveBeenCalled()
    expect(dependencies.createOwnerInvitationRecord).not.toHaveBeenCalled()
  })

  it("rejects an unknown invitee email with a safe service error", async () => {
    const dependencies = createInviteDependencies({
      findUserByEmail: vi.fn().mockResolvedValue(null),
    })

    await expect(
      inviteOrganizationOwnerForAdmin(
        { organizationId: "org-1", email: "unknown@example.com" },
        dependencies
      )
    ).rejects.toMatchObject({
      name: "OwnerInvitationTargetUserNotFoundError",
      message: "Owner invitation cannot be created for this email.",
    })

    expect(dependencies.findMembership).not.toHaveBeenCalled()
    expect(dependencies.createOwnerInvitationRecord).not.toHaveBeenCalled()
  })

  it("rejects users who are already organization members", async () => {
    const dependencies = createInviteDependencies({
      findMembership: vi.fn().mockResolvedValue({
        id: "member-1",
        role: OWNER_INVITATION_ROLE,
      }),
    })

    await expect(
      inviteOrganizationOwnerForAdmin(
        { organizationId: "org-1", email: "owner@example.com" },
        dependencies
      )
    ).rejects.toBeInstanceOf(OwnerInvitationAlreadyMemberError)

    expect(dependencies.findActiveOwnerInvitation).not.toHaveBeenCalled()
    expect(dependencies.createOwnerInvitationRecord).not.toHaveBeenCalled()
  })

  it("prevents duplicate active owner invitations", async () => {
    const dependencies = createInviteDependencies({
      findActiveOwnerInvitation: vi
        .fn()
        .mockResolvedValue(createInvitation({ id: "active-invitation" })),
    })

    await expect(
      inviteOrganizationOwnerForAdmin(
        { organizationId: "org-1", email: "owner@example.com" },
        dependencies
      )
    ).rejects.toMatchObject({
      name: "OwnerInvitationDuplicateError",
    })

    expect(dependencies.createOwnerInvitationRecord).not.toHaveBeenCalled()
  })

  it("does not expose the duplicate invitation id on duplicate errors", async () => {
    const dependencies = createInviteDependencies({
      findActiveOwnerInvitation: vi
        .fn()
        .mockResolvedValue(createInvitation({ id: "active-invitation" })),
    })

    try {
      await inviteOrganizationOwnerForAdmin(
        { organizationId: "org-1", email: "owner@example.com" },
        dependencies
      )
      throw new Error("Expected duplicate invitation rejection.")
    } catch (error) {
      expect(error).toMatchObject({
        name: "OwnerInvitationDuplicateError",
      })
      expect(error).not.toHaveProperty("invitationId")
    }
  })

  it("creates a Better Auth-compatible owner invitation, audit log request, and email payload", async () => {
    const invitation = createInvitation()
    const dependencies = createInviteDependencies({
      createOwnerInvitationRecord: vi.fn().mockResolvedValue(invitation),
    })

    await expect(
      inviteOrganizationOwnerForAdmin(
        { organizationId: "org-1", email: " OWNER@Example.COM " },
        dependencies
      )
    ).resolves.toEqual({
      invitation: {
        createdAt: invitation.createdAt,
        email: "owner@example.com",
        expiresAt: invitation.expiresAt,
        inviterId: "admin-user",
        organizationId: "org-1",
        role: OWNER_INVITATION_ROLE,
        status: "pending",
      },
      invitedUser: {
        email: "owner@example.com",
        id: "owner-user",
        name: "Venue Owner",
      },
      organization: {
        id: "org-1",
        name: "P2 Courts",
        slug: "p2-courts",
      },
      emailPayload: {
        event: "owner_invitation.created",
        to: {
          email: "owner@example.com",
          name: "Venue Owner",
        },
        organization: {
          id: "org-1",
          name: "P2 Courts",
          slug: "p2-courts",
        },
        inviter: {
          id: "admin-user",
          name: "Admin User",
        },
        invitation: {
          role: OWNER_INVITATION_ROLE,
          expiresAt: invitation.expiresAt,
        },
        acceptUrl:
          "https://quickcourt.test/dashboard/venue/invitations/accept?invitationId=invitation-1",
      },
    })

    expect(dependencies.findUserByEmail).toHaveBeenCalledWith("owner@example.com")
    expect(dependencies.createOwnerInvitationRecord).toHaveBeenCalledWith({
      actorUserId: "admin-user",
      email: "owner@example.com",
      organizationId: "org-1",
    })
    expect(dependencies.createInvitationAuditLog).toHaveBeenCalledWith({
      actorUserId: "admin-user",
      invitation,
      invitedUser: {
        email: "owner@example.com",
        id: "owner-user",
        name: "Venue Owner",
      },
      organization: {
        id: "org-1",
        name: "P2 Courts",
        slug: "p2-courts",
      },
    })
  })

  it("shapes owner invitation email payload without provider-specific template work", () => {
    const invitation = createInvitation({
      id: "payload-invitation",
      expiresAt: new Date("2026-05-01T00:00:00.000Z"),
    })

    expect(
      createOwnerInvitationEmailPayload({
        appUrl: "https://app.quickcourt.test",
        invitation,
        invitedUser: {
          email: "owner@example.com",
          id: "owner-user",
          name: null,
        },
        inviter: {
          id: "admin-user",
          name: "Admin User",
        },
        organization: {
          id: "org-1",
          name: "P2 Courts",
          slug: "p2-courts",
        },
      })
    ).toEqual({
      event: "owner_invitation.created",
      to: {
        email: "owner@example.com",
        name: null,
      },
      organization: {
        id: "org-1",
        name: "P2 Courts",
        slug: "p2-courts",
      },
      inviter: {
        id: "admin-user",
        name: "Admin User",
      },
      invitation: {
        role: OWNER_INVITATION_ROLE,
        expiresAt: new Date("2026-05-01T00:00:00.000Z"),
      },
      acceptUrl:
        "https://app.quickcourt.test/dashboard/venue/invitations/accept?invitationId=payload-invitation",
    })
  })

  it("accepts owner invitations through the injected Better Auth acceptance path and audits", async () => {
    const invitation = createInvitation({ status: "accepted" })
    const member = {
      createdAt: new Date("2026-04-29T01:00:00.000Z"),
      id: "member-owner",
      organizationId: "org-1",
      role: OWNER_INVITATION_ROLE,
      userId: "owner-user",
    }
    const dependencies = createAcceptDependencies({
      acceptBetterAuthInvitation: vi.fn().mockResolvedValue({
        invitation,
        member,
      }),
    })

    await expect(
      acceptOrganizationOwnerInvitation(
        { invitationId: "invitation-1" },
        dependencies
      )
    ).resolves.toEqual({
      invitation: {
        organizationId: "org-1",
        role: OWNER_INVITATION_ROLE,
        status: "accepted",
      },
      member,
    })

    expect(dependencies.createInvitationAcceptanceAuditLog).toHaveBeenCalledWith({
      actorUserId: "owner-user",
      invitation,
      member,
    })
  })

  it("rejects accepted invitations that do not grant owner membership", async () => {
    const dependencies = createAcceptDependencies({
      acceptBetterAuthInvitation: vi.fn().mockResolvedValue({
        invitation: createInvitation({ status: "accepted" }),
        member: {
          createdAt: new Date("2026-04-29T01:00:00.000Z"),
          id: "member-staff",
          organizationId: "org-1",
          role: "member",
          userId: "owner-user",
        },
      }),
    })

    await expect(
      acceptOrganizationOwnerInvitation(
        { invitationId: "invitation-1" },
        dependencies
      )
    ).rejects.toBeInstanceOf(OwnerInvitationAcceptanceError)

    expect(dependencies.createInvitationAcceptanceAuditLog).not.toHaveBeenCalled()
  })
})

function createInviteDependencies(overrides = {}) {
  return {
    appUrl: "https://quickcourt.test",
    requireAdminAccess: vi.fn().mockResolvedValue({
      user: {
        id: "admin-user",
        name: "Admin User",
        role: "admin",
      },
    }),
    findOrganizationById: vi.fn().mockResolvedValue({
      id: "org-1",
      name: "P2 Courts",
      slug: "p2-courts",
    }),
    findUserByEmail: vi.fn().mockResolvedValue({
      email: "owner@example.com",
      id: "owner-user",
      name: "Venue Owner",
    }),
    findMembership: vi.fn().mockResolvedValue(null),
    findActiveOwnerInvitation: vi.fn().mockResolvedValue(null),
    cancelExpiredOwnerInvitations: vi.fn().mockResolvedValue({ count: 0 }),
    createOwnerInvitationRecord: vi.fn().mockResolvedValue(createInvitation()),
    createInvitationAuditLog: vi.fn().mockResolvedValue({ id: "audit-log" }),
    ...overrides,
  }
}

function createAcceptDependencies(overrides = {}) {
  return {
    requireCurrentUser: vi.fn().mockResolvedValue({
      id: "owner-user",
      name: "Venue Owner",
      role: "user",
    }),
    acceptBetterAuthInvitation: vi.fn().mockResolvedValue({
      invitation: createInvitation({ status: "accepted" }),
      member: {
        createdAt: new Date("2026-04-29T01:00:00.000Z"),
        id: "member-owner",
        organizationId: "org-1",
        role: OWNER_INVITATION_ROLE,
        userId: "owner-user",
      },
    }),
    createInvitationAcceptanceAuditLog: vi
      .fn()
      .mockResolvedValue({ id: "audit-log" }),
    ...overrides,
  }
}

function createInvitation(
  overrides: Partial<OwnerInvitationRecord> = {}
): OwnerInvitationRecord {
  return {
    createdAt: new Date("2026-04-29T00:00:00.000Z"),
    email: "owner@example.com",
    expiresAt: new Date("2026-05-01T00:00:00.000Z"),
    id: "invitation-1",
    inviterId: "admin-user",
    organizationId: "org-1",
    role: OWNER_INVITATION_ROLE,
    status: "pending",
    ...overrides,
  }
}
