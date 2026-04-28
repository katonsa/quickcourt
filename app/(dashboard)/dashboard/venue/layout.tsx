import { VenueDashboardShell } from "@/components/layouts/venue-dashboard-shell"
import { requireAnyOrganizationMemberForRoute } from "@/lib/auth/guards"

export default async function VenueDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const access = await requireAnyOrganizationMemberForRoute()
  const { membership, memberships } = access
  const venue = membership.organization.venue

  return (
    <VenueDashboardShell
      organization={{
        name: membership.organization.name,
        slug: membership.organization.slug,
      }}
      membership={{ role: membership.role }}
      membershipsCount={memberships.length}
      venue={
        venue
          ? {
              name: venue.name,
            }
          : null
      }
    >
      {children}
    </VenueDashboardShell>
  )
}
