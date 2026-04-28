import { AdminShell } from "@/components/layouts/admin-shell"
import { requireAdminForRoute } from "@/lib/auth/guards"

export default async function AdminGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const access = await requireAdminForRoute()

  return (
    <AdminShell user={{ email: access.user.email, name: access.user.name }}>
      {children}
    </AdminShell>
  )
}
