import { requireAdminForRoute } from "@/lib/auth/guards"

export default async function AdminGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  await requireAdminForRoute()

  return children
}
