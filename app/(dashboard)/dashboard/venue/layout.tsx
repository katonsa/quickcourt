import { requireAnyOrganizationMemberForRoute } from "@/lib/auth/guards"

export default async function VenueDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  await requireAnyOrganizationMemberForRoute()

  return children
}
