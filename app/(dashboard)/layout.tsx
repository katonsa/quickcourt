import { DashboardShell } from "@/components/layouts/dashboard-shell"
import { requireUserForRoute } from "@/lib/auth/guards"

export default async function DashboardGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await requireUserForRoute()

  return (
    <DashboardShell user={{ email: user.email, name: user.name }}>
      {children}
    </DashboardShell>
  )
}
