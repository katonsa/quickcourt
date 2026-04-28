import "server-only"

import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export type CurrentSession = Awaited<ReturnType<typeof getCurrentSession>>
export type CurrentUser = NonNullable<CurrentSession>["user"]
export type OrganizationMembership = Awaited<
  ReturnType<typeof getOrganizationMembershipsForUser>
>[number]

export type OrganizationMemberAccess = {
  user: CurrentUser
  membership: OrganizationMembership
  memberships: OrganizationMembership[]
}

export type AdminAccess = {
  user: CurrentUser
}

type OrganizationAccessOptions = {
  organizationId?: string
}

export class AuthenticationRequiredError extends Error {
  constructor() {
    super("Authentication is required.")
    this.name = "AuthenticationRequiredError"
  }
}

export class AccessDeniedError extends Error {
  constructor(message = "Access is denied.") {
    super(message)
    this.name = "AccessDeniedError"
  }
}

export async function getCurrentSession() {
  return auth.api.getSession({
    headers: await headers(),
  })
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getCurrentSession()

  return session?.user ?? null
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser()

  if (!user) {
    throw new AuthenticationRequiredError()
  }

  return user
}

export function isAdminUser(user: { role?: string | null }): boolean {
  return user.role === "admin"
}

export async function requireAdmin(): Promise<AdminAccess> {
  const user = await requireUser()

  if (!isAdminUser(user)) {
    throw new AccessDeniedError("Admin access is required.")
  }

  return { user }
}

export async function getOrganizationMembershipsForUser(userId: string) {
  return db.member.findMany({
    where: { userId },
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
}

export async function getCurrentOrganizationMemberships() {
  const user = await getCurrentUser()

  if (!user) {
    return []
  }

  return getOrganizationMembershipsForUser(user.id)
}

export async function requireAnyOrganizationMember(
  options: OrganizationAccessOptions = {}
): Promise<OrganizationMemberAccess> {
  const user = await requireUser()
  const memberships = await getOrganizationMembershipsForUser(user.id)
  const membership = selectMembership(memberships, options)

  if (!membership) {
    throw new AccessDeniedError("Organization membership is required.")
  }

  return { user, membership, memberships }
}

export async function requireOrganizationOwner(
  options: OrganizationAccessOptions = {}
): Promise<OrganizationMemberAccess> {
  const user = await requireUser()
  const memberships = await getOrganizationMembershipsForUser(user.id)
  const membership = selectMembership(memberships, options, isOwnerMembership)

  if (!membership) {
    throw new AccessDeniedError("Organization owner access is required.")
  }

  return { user, membership, memberships }
}

function selectMembership(
  memberships: OrganizationMembership[],
  options: OrganizationAccessOptions,
  predicate: (membership: OrganizationMembership) => boolean = () => true
): OrganizationMembership | undefined {
  return memberships.find((membership) => {
    if (options.organizationId && membership.organizationId !== options.organizationId) {
      return false
    }

    return predicate(membership)
  })
}

function isOwnerMembership(membership: OrganizationMembership): boolean {
  return membership.role === "owner"
}
