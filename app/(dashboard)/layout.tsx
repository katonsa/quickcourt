import { requireUserForRoute } from "@/lib/auth/guards"

export default async function DashboardGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  await requireUserForRoute()

  return children
}
