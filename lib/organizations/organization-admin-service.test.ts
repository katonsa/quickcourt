import { describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      createOrganization: vi.fn(),
    },
  },
}))

vi.mock("@/lib/auth/access", () => ({
  requireAdmin: vi.fn(),
}))

vi.mock("@/lib/db", () => ({
  db: {
    auditLog: {
      create: vi.fn(),
    },
    organization: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock("@/lib/logger", () => ({
  logger: {
    error: vi.fn(),
  },
}))

import {
  OrganizationDuplicateError,
  OrganizationValidationError,
  createVenueOrganizationForAdmin,
  normalizeOrganizationSlug,
  validateCreateVenueOrganizationInput,
} from "@/lib/organizations/organization-admin-service"

describe("organization admin service", () => {
  it("normalizes organization slugs for the Better Auth organization boundary", () => {
    expect(normalizeOrganizationSlug("  QuickCourt Padel Arena!  ")).toBe(
      "quickcourt-padel-arena"
    )
  })

  it("validates and normalizes required organization fields", () => {
    expect(
      validateCreateVenueOrganizationInput({
        name: "  North Jakarta Courts  ",
        slug: " North Jakarta Courts ",
      })
    ).toEqual({
      name: "North Jakarta Courts",
      slug: "north-jakarta-courts",
    })
  })

  it("generates the organization slug from the display name when omitted", () => {
    expect(
      validateCreateVenueOrganizationInput({
        name: "South Arena",
      })
    ).toEqual({
      name: "South Arena",
      slug: "south-arena",
    })
  })

  it("rejects missing required organization display fields", () => {
    expect(() =>
      validateCreateVenueOrganizationInput({
        name: "   ",
      })
    ).toThrow(OrganizationValidationError)
  })

  it("rejects a regular user before checking duplicates or creating an organization", async () => {
    const accessError = new Error("Admin access is required.")
    const dependencies = createDependencies({
      requireAdminAccess: vi.fn().mockRejectedValue(accessError),
    })

    await expect(
      createVenueOrganizationForAdmin({ name: "Member Courts" }, dependencies)
    ).rejects.toBe(accessError)

    expect(dependencies.findOrganizationBySlug).not.toHaveBeenCalled()
    expect(dependencies.createBetterAuthOrganization).not.toHaveBeenCalled()
    expect(dependencies.createAuditLog).not.toHaveBeenCalled()
  })

  it("prevents duplicate organization creation by normalized slug", async () => {
    const dependencies = createDependencies({
      findOrganizationBySlug: vi.fn().mockResolvedValue({ id: "existing-org" }),
    })

    await expect(
      createVenueOrganizationForAdmin(
        { name: "Duplicate Courts", slug: "Duplicate Courts" },
        dependencies
      )
    ).rejects.toMatchObject({
      name: "OrganizationDuplicateError",
      slug: "duplicate-courts",
    })

    expect(dependencies.createBetterAuthOrganization).not.toHaveBeenCalled()
    expect(dependencies.createAuditLog).not.toHaveBeenCalled()
  })

  it("maps Better Auth duplicate failures to the service duplicate error", async () => {
    const dependencies = createDependencies({
      createBetterAuthOrganization: vi
        .fn()
        .mockRejectedValue(new Error("Organization already exists")),
    })

    await expect(
      createVenueOrganizationForAdmin({ name: "Race Courts" }, dependencies)
    ).rejects.toBeInstanceOf(OrganizationDuplicateError)

    expect(dependencies.createAuditLog).not.toHaveBeenCalled()
  })

  it("creates the organization through the Better Auth-compatible path and audits safe metadata", async () => {
    const createdAt = new Date("2026-04-29T00:00:00.000Z")
    const dependencies = createDependencies({
      createBetterAuthOrganization: vi.fn().mockResolvedValue({
        id: "org-created",
        name: "Admin Courts",
        slug: "admin-courts",
        createdAt,
        members: [{ id: "internal-member" }],
        metadata: { internal: true },
      }),
    })

    await expect(
      createVenueOrganizationForAdmin({ name: "Admin Courts" }, dependencies)
    ).resolves.toEqual({
      id: "org-created",
      name: "Admin Courts",
      slug: "admin-courts",
      createdAt,
    })

    expect(dependencies.createBetterAuthOrganization).toHaveBeenCalledWith({
      actorUserId: "admin-user",
      name: "Admin Courts",
      slug: "admin-courts",
    })
    expect(dependencies.createAuditLog).toHaveBeenCalledWith({
      actorUserId: "admin-user",
      entityId: "org-created",
      organization: {
        id: "org-created",
        name: "Admin Courts",
        slug: "admin-courts",
        createdAt,
      },
    })
  })

  it("rolls back the created organization when audit persistence fails", async () => {
    const auditError = new Error("audit unavailable")
    const dependencies = createDependencies({
      createAuditLog: vi.fn().mockRejectedValue(auditError),
    })

    await expect(
      createVenueOrganizationForAdmin({ name: "Audit Failure Courts" }, dependencies)
    ).rejects.toBe(auditError)

    expect(dependencies.deleteOrganizationById).toHaveBeenCalledWith("org-created")
  })
})

function createDependencies(overrides = {}) {
  return {
    requireAdminAccess: vi.fn().mockResolvedValue({
      user: {
        id: "admin-user",
        role: "admin",
      },
    }),
    findOrganizationBySlug: vi.fn().mockResolvedValue(null),
    createBetterAuthOrganization: vi.fn().mockResolvedValue({
      id: "org-created",
      name: "Admin Courts",
      slug: "admin-courts",
      createdAt: new Date("2026-04-29T00:00:00.000Z"),
    }),
    createAuditLog: vi.fn().mockResolvedValue({ id: "audit-log" }),
    deleteOrganizationById: vi.fn().mockResolvedValue({ count: 1 }),
    ...overrides,
  }
}
