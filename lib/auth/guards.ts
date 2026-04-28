import "server-only"

import { redirect } from "next/navigation"

import {
  AccessDeniedError,
  AuthenticationRequiredError,
  requireAdmin,
  requireAnyOrganizationMember,
  requireOrganizationOwner,
  requireUser,
} from "@/lib/auth/access"

export const SIGN_IN_PATH = "/sign-in"
export const FORBIDDEN_PATH = "/forbidden"

export function redirectToSignIn(): never {
  redirect(SIGN_IN_PATH)
}

export function redirectToForbidden(): never {
  redirect(FORBIDDEN_PATH)
}

export function handleAccessError(error: unknown): never {
  if (error instanceof AuthenticationRequiredError) {
    redirectToSignIn()
  }

  if (error instanceof AccessDeniedError) {
    redirectToForbidden()
  }

  throw error
}

export async function requireUserForRoute(): Promise<Awaited<ReturnType<typeof requireUser>>> {
  return runRouteAccessCheck(() => requireUser())
}

export async function requireAdminForRoute(): Promise<Awaited<ReturnType<typeof requireAdmin>>> {
  return runRouteAccessCheck(() => requireAdmin())
}

export async function requireAnyOrganizationMemberForRoute(
  options?: Parameters<typeof requireAnyOrganizationMember>[0]
): Promise<Awaited<ReturnType<typeof requireAnyOrganizationMember>>> {
  return runRouteAccessCheck(() => requireAnyOrganizationMember(options))
}

export async function requireOrganizationOwnerForRoute(
  options?: Parameters<typeof requireOrganizationOwner>[0]
): Promise<Awaited<ReturnType<typeof requireOrganizationOwner>>> {
  return runRouteAccessCheck(() => requireOrganizationOwner(options))
}

async function runRouteAccessCheck<T>(checkAccess: () => Promise<T>): Promise<T> {
  let accessError: unknown

  try {
    return await checkAccess()
  } catch (error) {
    accessError = error
  }

  handleAccessError(accessError)
}
