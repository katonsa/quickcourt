import "server-only"

import { auth } from "@/lib/auth"
import { requireAdmin, type AdminAccess } from "@/lib/auth/access"
import { db } from "@/lib/db"
import { logger } from "@/lib/logger"

export const CREATE_VENUE_ORGANIZATION_ACTION = "organization.create"
export const ORGANIZATION_ENTITY_TYPE = "organization"
export const ORGANIZATION_DUPLICATE_RULE =
  "organization_slug_unique_after_normalization"

const ORGANIZATION_NAME_MAX_LENGTH = 100
const ORGANIZATION_SLUG_MAX_LENGTH = 80

export type CreateVenueOrganizationInput = {
  name: string
  slug?: string
}

export type VenueOrganizationAdminDto = {
  id: string
  name: string
  slug: string
  createdAt: Date
}

export type NormalizedCreateVenueOrganizationInput = {
  name: string
  slug: string
}

export type OrganizationValidationIssue = {
  field: keyof CreateVenueOrganizationInput
  message: string
}

type BetterAuthOrganization = {
  id: string
  name: string
  slug: string
  createdAt: Date | string
}

type CreateAuditLogInput = {
  actorUserId: string
  entityId: string
  organization: VenueOrganizationAdminDto
}

type OrganizationAdminServiceDependencies = {
  requireAdminAccess: () => Promise<AdminAccess>
  findOrganizationBySlug: (slug: string) => Promise<{ id: string } | null>
  createBetterAuthOrganization: (input: {
    actorUserId: string
    name: string
    slug: string
  }) => Promise<BetterAuthOrganization>
  createAuditLog: (input: CreateAuditLogInput) => Promise<unknown>
  deleteOrganizationById: (id: string) => Promise<unknown>
}

export class OrganizationValidationError extends Error {
  readonly issues: OrganizationValidationIssue[]

  constructor(issues: OrganizationValidationIssue[]) {
    super("Organization input is invalid.")
    this.name = "OrganizationValidationError"
    this.issues = issues
  }
}

export class OrganizationDuplicateError extends Error {
  readonly slug: string

  constructor(slug: string) {
    super("An organization with this slug already exists.")
    this.name = "OrganizationDuplicateError"
    this.slug = slug
  }
}

export async function createVenueOrganizationForAdmin(
  input: CreateVenueOrganizationInput,
  dependencies: OrganizationAdminServiceDependencies = productionDependencies
): Promise<VenueOrganizationAdminDto> {
  const normalizedInput = validateCreateVenueOrganizationInput(input)
  const { user } = await dependencies.requireAdminAccess()

  await assertOrganizationSlugIsAvailable(
    normalizedInput.slug,
    dependencies.findOrganizationBySlug
  )

  const organization = await createDuplicateSafeOrganization(
    {
      actorUserId: user.id,
      name: normalizedInput.name,
      slug: normalizedInput.slug,
    },
    dependencies.createBetterAuthOrganization
  )
  const dto = toVenueOrganizationAdminDto(organization)

  try {
    await dependencies.createAuditLog({
      actorUserId: user.id,
      entityId: dto.id,
      organization: dto,
    })
  } catch (error) {
    await rollbackOrganizationAfterAuditFailure(dto.id, dependencies)
    throw error
  }

  return dto
}

export function validateCreateVenueOrganizationInput(
  input: CreateVenueOrganizationInput
): NormalizedCreateVenueOrganizationInput {
  const issues: OrganizationValidationIssue[] = []
  const name = typeof input.name === "string" ? input.name.trim() : ""

  if (!name) {
    issues.push({ field: "name", message: "Organization name is required." })
  } else if (name.length > ORGANIZATION_NAME_MAX_LENGTH) {
    issues.push({
      field: "name",
      message: `Organization name must be ${ORGANIZATION_NAME_MAX_LENGTH} characters or fewer.`,
    })
  }

  const slugSource = input.slug?.trim() || name
  const slug = normalizeOrganizationSlug(slugSource)

  if (!slug) {
    issues.push({ field: "slug", message: "Organization slug is required." })
  } else if (slug.length > ORGANIZATION_SLUG_MAX_LENGTH) {
    issues.push({
      field: "slug",
      message: `Organization slug must be ${ORGANIZATION_SLUG_MAX_LENGTH} characters or fewer.`,
    })
  }

  if (issues.length > 0) {
    throw new OrganizationValidationError(issues)
  }

  return { name, slug }
}

export function normalizeOrganizationSlug(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
}

async function assertOrganizationSlugIsAvailable(
  slug: string,
  findOrganizationBySlug: OrganizationAdminServiceDependencies["findOrganizationBySlug"]
): Promise<void> {
  const existingOrganization = await findOrganizationBySlug(slug)

  if (existingOrganization) {
    throw new OrganizationDuplicateError(slug)
  }
}

async function createDuplicateSafeOrganization(
  input: {
    actorUserId: string
    name: string
    slug: string
  },
  createBetterAuthOrganization: OrganizationAdminServiceDependencies["createBetterAuthOrganization"]
): Promise<BetterAuthOrganization> {
  try {
    return await createBetterAuthOrganization(input)
  } catch (error) {
    if (isDuplicateOrganizationError(error)) {
      throw new OrganizationDuplicateError(input.slug)
    }

    throw error
  }
}

function toVenueOrganizationAdminDto(
  organization: BetterAuthOrganization
): VenueOrganizationAdminDto {
  return {
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    createdAt:
      organization.createdAt instanceof Date
        ? organization.createdAt
        : new Date(organization.createdAt),
  }
}

function isDuplicateOrganizationError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false
  }

  if ("code" in error && error.code === "P2002") {
    return true
  }

  const message = "message" in error ? String(error.message) : ""

  return (
    message.includes("Organization already exists") ||
    message.includes("Organization slug already taken") ||
    message.includes("ORGANIZATION_ALREADY_EXISTS") ||
    message.includes("ORGANIZATION_SLUG_ALREADY_TAKEN")
  )
}

const productionDependencies: OrganizationAdminServiceDependencies = {
  requireAdminAccess: requireAdmin,
  findOrganizationBySlug: (slug) =>
    db.organization.findUnique({
      where: { slug },
      select: { id: true },
    }),
  createBetterAuthOrganization: ({ actorUserId, name, slug }) =>
    auth.api.createOrganization({
      body: {
        keepCurrentActiveOrganization: true,
        name,
        slug,
        userId: actorUserId,
      },
    }),
  createAuditLog: ({ actorUserId, entityId, organization }) =>
    db.auditLog.create({
      data: {
        actorUserId,
        action: CREATE_VENUE_ORGANIZATION_ACTION,
        entityType: ORGANIZATION_ENTITY_TYPE,
        entityId,
        afterData: {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
        },
        metadata: {
          duplicateRule: ORGANIZATION_DUPLICATE_RULE,
          service: "organization_admin_service",
          target: "venue_onboarding",
        },
      },
    }),
  deleteOrganizationById: (id) =>
    db.organization.deleteMany({
      where: { id },
    }),
}

async function rollbackOrganizationAfterAuditFailure(
  organizationId: string,
  dependencies: Pick<OrganizationAdminServiceDependencies, "deleteOrganizationById">
): Promise<void> {
  try {
    await dependencies.deleteOrganizationById(organizationId)
  } catch (rollbackError) {
    logger.error(
      {
        err: rollbackError,
        organizationId,
      },
      "Failed to roll back organization after audit log failure"
    )
  }
}
