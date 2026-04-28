import "server-only"

export {
  AccessDeniedError,
  AuthenticationRequiredError,
  getCurrentOrganizationMemberships,
  getCurrentSession,
  getCurrentUser,
  getOrganizationMembershipsForUser,
  isAdminUser,
  requireAdmin,
  requireAnyOrganizationMember,
  requireOrganizationOwner,
  requireUser,
  requireUser as requireAuthenticatedUser,
} from "@/lib/auth/access"

export type {
  AdminAccess,
  CurrentSession,
  CurrentUser,
  OrganizationMemberAccess,
  OrganizationMembership,
} from "@/lib/auth/access"
