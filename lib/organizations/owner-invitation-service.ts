import "server-only"

import { createHash, randomUUID } from "node:crypto"

import { headers } from "next/headers"
import { z } from "zod"

import { env } from "@/config/env"
import { auth } from "@/lib/auth"
import {
  requireAdmin,
  requireUser,
  type AdminAccess,
  type CurrentUser,
} from "@/lib/auth/access"
import { db } from "@/lib/db"

export const OWNER_INVITATION_ROLE = "owner"
export const CREATE_OWNER_INVITATION_ACTION = "organization.owner_invitation.create"
export const ACCEPT_OWNER_INVITATION_ACTION = "organization.owner_invitation.accept"
export const OWNER_INVITATION_ENTITY_TYPE = "organization_invitation"
export const OWNER_INVITATION_ACCEPTANCE_ENTITY_TYPE = "member"
export const BETTER_AUTH_INVITATION_EXPIRES_IN_SECONDS = 60 * 60 * 48

const emailSchema = z.email()

export type InviteOrganizationOwnerInput = {
  organizationId: string
  email: string
}

export type AcceptOrganizationOwnerInvitationInput = {
  invitationId: string
}

export type NormalizedInviteOrganizationOwnerInput = {
  organizationId: string
  email: string
}

export type OwnerInvitationValidationIssue = {
  field: keyof InviteOrganizationOwnerInput | keyof AcceptOrganizationOwnerInvitationInput
  message: string
}

export type OwnerInvitationOrganization = {
  id: string
  name: string
  slug: string
}

export type OwnerInvitationUser = {
  email: string
  id: string
  name: string | null
}

export type OwnerInvitationRecord = {
  id: string
  organizationId: string
  email: string
  role: string | null
  status: string
  expiresAt: Date
  createdAt: Date
  inviterId: string
}

export type OwnerInvitationMember = {
  id: string
  organizationId: string
  userId: string
  role: string
  createdAt: Date
}

export type OwnerInvitationEmailPayload = {
  event: "owner_invitation.created"
  to: {
    email: string
    name: string | null
  }
  organization: OwnerInvitationOrganization
  inviter: {
    id: string
    name: string | null
  }
  invitation: {
    role: typeof OWNER_INVITATION_ROLE
    expiresAt: Date
  }
  acceptUrl: string
}

export type OwnerInvitationSafeDto = {
  organizationId: string
  email: string
  role: string | null
  status: string
  expiresAt: Date
  createdAt: Date
  inviterId: string
}

export type AcceptedOwnerInvitationDto = {
  organizationId: string
  role: string | null
  status: string
}

export type InviteOrganizationOwnerResult = {
  invitation: OwnerInvitationSafeDto
  invitedUser: OwnerInvitationUser
  organization: OwnerInvitationOrganization
  emailPayload: OwnerInvitationEmailPayload
}

export type AcceptOrganizationOwnerInvitationResult = {
  invitation: AcceptedOwnerInvitationDto
  member: OwnerInvitationMember
}

export type BetterAuthAcceptOwnerInvitationResult = {
  invitation: OwnerInvitationRecord
  member: OwnerInvitationMember
}

type ExistingMembership = {
  id: string
  role: string
}

type CreateOwnerInvitationRecordInput = {
  actorUserId: string
  email: string
  organizationId: string
}

type CreateOwnerInvitationAuditLogInput = {
  actorUserId: string
  invitation: OwnerInvitationRecord
  invitedUser: OwnerInvitationUser
  organization: OwnerInvitationOrganization
}

type CreateOwnerInvitationAcceptanceAuditLogInput = {
  actorUserId: string
  invitation: OwnerInvitationRecord
  member: OwnerInvitationMember
}

type OwnerInvitationServiceDependencies = {
  appUrl: string
  requireAdminAccess: () => Promise<AdminAccess>
  findOrganizationById: (
    organizationId: string
  ) => Promise<OwnerInvitationOrganization | null>
  findUserByEmail: (email: string) => Promise<OwnerInvitationUser | null>
  findMembership: (input: {
    organizationId: string
    userId: string
  }) => Promise<ExistingMembership | null>
  findActiveOwnerInvitation: (input: {
    organizationId: string
    email: string
  }) => Promise<OwnerInvitationRecord | null>
  cancelExpiredOwnerInvitations: (input: {
    organizationId: string
    email: string
  }) => Promise<unknown>
  createOwnerInvitationRecord: (
    input: CreateOwnerInvitationRecordInput
  ) => Promise<OwnerInvitationRecord>
  createInvitationAuditLog: (
    input: CreateOwnerInvitationAuditLogInput
  ) => Promise<unknown>
}

type OwnerInvitationAcceptanceDependencies = {
  requireCurrentUser: () => Promise<CurrentUser>
  acceptBetterAuthInvitation: (
    input: AcceptOrganizationOwnerInvitationInput
  ) => Promise<BetterAuthAcceptOwnerInvitationResult>
  createInvitationAcceptanceAuditLog: (
    input: CreateOwnerInvitationAcceptanceAuditLogInput
  ) => Promise<unknown>
}

export class OwnerInvitationValidationError extends Error {
  readonly issues: OwnerInvitationValidationIssue[]

  constructor(issues: OwnerInvitationValidationIssue[]) {
    super("Owner invitation input is invalid.")
    this.name = "OwnerInvitationValidationError"
    this.issues = issues
  }
}

export class OwnerInvitationOrganizationNotFoundError extends Error {
  constructor() {
    super("Organization was not found.")
    this.name = "OwnerInvitationOrganizationNotFoundError"
  }
}

export class OwnerInvitationTargetUserNotFoundError extends Error {
  constructor() {
    super("Owner invitation cannot be created for this email.")
    this.name = "OwnerInvitationTargetUserNotFoundError"
  }
}

export class OwnerInvitationDuplicateError extends Error {
  constructor() {
    super("An active owner invitation already exists for this organization.")
    this.name = "OwnerInvitationDuplicateError"
  }
}

export class OwnerInvitationAlreadyMemberError extends Error {
  constructor() {
    super("The invited user is already a member of this organization.")
    this.name = "OwnerInvitationAlreadyMemberError"
  }
}

export class OwnerInvitationAcceptanceError extends Error {
  constructor(message = "Owner invitation acceptance failed.") {
    super(message)
    this.name = "OwnerInvitationAcceptanceError"
  }
}

export async function inviteOrganizationOwnerForAdmin(
  input: InviteOrganizationOwnerInput,
  dependencies: OwnerInvitationServiceDependencies = productionDependencies
): Promise<InviteOrganizationOwnerResult> {
  const normalizedInput = validateInviteOrganizationOwnerInput(input)
  const { user: actor } = await dependencies.requireAdminAccess()

  const organization = await dependencies.findOrganizationById(
    normalizedInput.organizationId
  )

  if (!organization) {
    throw new OwnerInvitationOrganizationNotFoundError()
  }

  const invitedUser = await dependencies.findUserByEmail(normalizedInput.email)

  if (!invitedUser) {
    throw new OwnerInvitationTargetUserNotFoundError()
  }

  const existingMembership = await dependencies.findMembership({
    organizationId: organization.id,
    userId: invitedUser.id,
  })

  if (existingMembership) {
    throw new OwnerInvitationAlreadyMemberError()
  }

  await dependencies.cancelExpiredOwnerInvitations({
    organizationId: organization.id,
    email: normalizedInput.email,
  })

  const activeInvitation = await dependencies.findActiveOwnerInvitation({
    organizationId: organization.id,
    email: normalizedInput.email,
  })

  if (activeInvitation) {
    throw new OwnerInvitationDuplicateError()
  }

  const invitation = await createDuplicateSafeOwnerInvitation(
    {
      actorUserId: actor.id,
      email: normalizedInput.email,
      organizationId: organization.id,
    },
    dependencies.createOwnerInvitationRecord
  )

  await dependencies.createInvitationAuditLog({
    actorUserId: actor.id,
    invitation,
    invitedUser,
    organization,
  })

  return {
    invitation: toOwnerInvitationSafeDto(invitation),
    invitedUser,
    organization,
    emailPayload: createOwnerInvitationEmailPayload({
      appUrl: dependencies.appUrl,
      invitation,
      invitedUser,
      inviter: actor,
      organization,
    }),
  }
}

export async function acceptOrganizationOwnerInvitation(
  input: AcceptOrganizationOwnerInvitationInput,
  dependencies: OwnerInvitationAcceptanceDependencies = productionAcceptanceDependencies
): Promise<AcceptOrganizationOwnerInvitationResult> {
  const normalizedInput = validateAcceptOrganizationOwnerInvitationInput(input)
  const actor = await dependencies.requireCurrentUser()
  const result = await dependencies.acceptBetterAuthInvitation(normalizedInput)

  if (result.member.role !== OWNER_INVITATION_ROLE) {
    throw new OwnerInvitationAcceptanceError(
      "Accepted invitation did not grant owner membership."
    )
  }

  await dependencies.createInvitationAcceptanceAuditLog({
    actorUserId: actor.id,
    invitation: result.invitation,
    member: result.member,
  })

  return {
    invitation: toAcceptedOwnerInvitationDto(result.invitation),
    member: result.member,
  }
}

export function validateInviteOrganizationOwnerInput(
  input: InviteOrganizationOwnerInput
): NormalizedInviteOrganizationOwnerInput {
  const issues: OwnerInvitationValidationIssue[] = []
  const organizationId =
    typeof input.organizationId === "string" ? input.organizationId.trim() : ""
  const email = normalizeOwnerInvitationEmail(input.email)

  if (!organizationId) {
    issues.push({
      field: "organizationId",
      message: "Organization id is required.",
    })
  }

  if (!email) {
    issues.push({ field: "email", message: "Email is required." })
  } else if (!emailSchema.safeParse(email).success) {
    issues.push({ field: "email", message: "Email is invalid." })
  }

  if (issues.length > 0) {
    throw new OwnerInvitationValidationError(issues)
  }

  return { organizationId, email }
}

export function validateAcceptOrganizationOwnerInvitationInput(
  input: AcceptOrganizationOwnerInvitationInput
): AcceptOrganizationOwnerInvitationInput {
  const invitationId =
    typeof input.invitationId === "string" ? input.invitationId.trim() : ""

  if (!invitationId) {
    throw new OwnerInvitationValidationError([
      { field: "invitationId", message: "Invitation id is required." },
    ])
  }

  return { invitationId }
}

export function normalizeOwnerInvitationEmail(email: string): string {
  return typeof email === "string" ? email.trim().toLowerCase() : ""
}

export function createOwnerInvitationEmailPayload(input: {
  appUrl: string
  invitation: OwnerInvitationRecord
  invitedUser: OwnerInvitationUser
  inviter: Pick<CurrentUser, "id" | "name">
  organization: OwnerInvitationOrganization
}): OwnerInvitationEmailPayload {
  const acceptUrl = new URL(
    `/dashboard/venue/invitations/accept?invitationId=${encodeURIComponent(
      input.invitation.id
    )}`,
    input.appUrl
  )

  return {
    event: "owner_invitation.created",
    to: {
      email: input.invitedUser.email,
      name: input.invitedUser.name,
    },
    organization: input.organization,
    inviter: {
      id: input.inviter.id,
      name: input.inviter.name,
    },
    invitation: {
      role: OWNER_INVITATION_ROLE,
      expiresAt: input.invitation.expiresAt,
    },
    acceptUrl: acceptUrl.toString(),
  }
}

function toOwnerInvitationSafeDto(
  invitation: OwnerInvitationRecord
): OwnerInvitationSafeDto {
  return {
    organizationId: invitation.organizationId,
    email: invitation.email,
    role: invitation.role,
    status: invitation.status,
    expiresAt: invitation.expiresAt,
    createdAt: invitation.createdAt,
    inviterId: invitation.inviterId,
  }
}

function toAcceptedOwnerInvitationDto(
  invitation: OwnerInvitationRecord
): AcceptedOwnerInvitationDto {
  return {
    organizationId: invitation.organizationId,
    role: invitation.role,
    status: invitation.status,
  }
}

function createInvitationId(): string {
  return randomUUID()
}

function ownerInvitationExpiresAt(now = new Date()): Date {
  return new Date(
    now.getTime() + BETTER_AUTH_INVITATION_EXPIRES_IN_SECONDS * 1000
  )
}

function emailDomain(email: string): string | null {
  return email.split("@")[1] ?? null
}

function emailAuditHash(email: string): string {
  return createHash("sha256").update(email).digest("hex")
}

function invitationIdAuditHash(invitationId: string): string {
  return createHash("sha256").update(invitationId).digest("hex")
}

async function createDuplicateSafeOwnerInvitation(
  input: CreateOwnerInvitationRecordInput,
  createOwnerInvitationRecord: OwnerInvitationServiceDependencies["createOwnerInvitationRecord"]
): Promise<OwnerInvitationRecord> {
  try {
    return await createOwnerInvitationRecord(input)
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new OwnerInvitationDuplicateError()
    }

    throw error
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return !!(
    error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "P2002"
  )
}

const productionDependencies: OwnerInvitationServiceDependencies = {
  appUrl: env.APP_URL,
  requireAdminAccess: requireAdmin,
  findOrganizationById: (organizationId) =>
    db.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    }),
  findUserByEmail: (email) =>
    db.user.findUnique({
      where: { email },
      select: {
        email: true,
        id: true,
        name: true,
      },
    }),
  findMembership: ({ organizationId, userId }) =>
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
  findActiveOwnerInvitation: ({ organizationId, email }) =>
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
      orderBy: {
        createdAt: "desc",
      },
    }),
  cancelExpiredOwnerInvitations: ({ organizationId, email }) =>
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
  createOwnerInvitationRecord: ({ actorUserId, email, organizationId }) =>
    db.invitation.create({
      data: {
        createdAt: new Date(),
        email,
        expiresAt: ownerInvitationExpiresAt(),
        id: createInvitationId(),
        inviterId: actorUserId,
        organizationId,
        role: OWNER_INVITATION_ROLE,
        status: "pending",
      },
    }),
  createInvitationAuditLog: ({
    actorUserId,
    invitation,
    invitedUser,
    organization,
  }) =>
    db.auditLog.create({
      data: {
        actorUserId,
        action: CREATE_OWNER_INVITATION_ACTION,
        entityType: OWNER_INVITATION_ENTITY_TYPE,
        entityId: invitationIdAuditHash(invitation.id),
        afterData: {
          organizationId: organization.id,
          role: OWNER_INVITATION_ROLE,
          status: invitation.status,
          invitedUserId: invitedUser.id,
        },
        metadata: {
          betterAuthInvitationExpiresInSeconds:
            BETTER_AUTH_INVITATION_EXPIRES_IN_SECONDS,
          emailDomain: emailDomain(invitation.email),
          emailHash: emailAuditHash(invitation.email),
          invitationIdHash: invitationIdAuditHash(invitation.id),
          service: "owner_invitation_service",
          target: "venue_onboarding",
        },
      },
    }),
}

const productionAcceptanceDependencies: OwnerInvitationAcceptanceDependencies = {
  requireCurrentUser: requireUser,
  acceptBetterAuthInvitation: async ({ invitationId }) => {
    const invitationBeforeAccept = await db.invitation.findUnique({
      where: { id: invitationId },
    })

    try {
      return (await auth.api.acceptInvitation({
        body: { invitationId },
        headers: await headers(),
      })) as BetterAuthAcceptOwnerInvitationResult
    } catch (error) {
      if (!isUniqueConstraintError(error) || !invitationBeforeAccept) {
        throw error
      }

      const existingMember = await db.member.findFirst({
        where: {
          organizationId: invitationBeforeAccept.organizationId,
          role: OWNER_INVITATION_ROLE,
          user: {
            email: invitationBeforeAccept.email,
          },
        },
      })
      const invitationAfterAccept = await db.invitation.findUnique({
        where: { id: invitationId },
      })

      if (!existingMember || !invitationAfterAccept) {
        throw error
      }

      return {
        invitation: invitationAfterAccept,
        member: existingMember,
      }
    }
  },
  createInvitationAcceptanceAuditLog: ({ actorUserId, invitation, member }) =>
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
