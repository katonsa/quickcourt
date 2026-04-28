import "server-only"

import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export type CurrentSession = Awaited<ReturnType<typeof getCurrentSession>>
export type CurrentUser = NonNullable<CurrentSession>["user"]

export class AuthenticationRequiredError extends Error {
  constructor() {
    super("Authentication is required.")
    this.name = "AuthenticationRequiredError"
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

export async function requireAuthenticatedUser(): Promise<CurrentUser> {
  const user = await getCurrentUser()

  if (!user) {
    throw new AuthenticationRequiredError()
  }

  return user
}

export function isAdminUser(user: { role?: string | null }): boolean {
  return user.role === "admin"
}

export async function getCurrentOrganizationMemberships() {
  const user = await getCurrentUser()

  if (!user) {
    return []
  }

  return db.member.findMany({
    where: { userId: user.id },
    include: {
      organization: true,
      branchAccess: true,
    },
    orderBy: { createdAt: "asc" },
  })
}
