import Link from "next/link"

import { SignOutButton } from "@/components/auth/sign-out-button"
import { requireUserForRoute } from "@/lib/auth/guards"
import { DASHBOARD_PATH, DASHBOARD_SETTINGS_PATH } from "@/lib/auth/paths"

export default async function DashboardGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await requireUserForRoute()

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <Link
              href={DASHBOARD_PATH}
              className="text-sm font-semibold tracking-normal text-foreground"
            >
              QuickCourt
            </Link>
            <p className="truncate text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>
          <nav
            aria-label="Account"
            className="flex flex-wrap items-center gap-2"
          >
            <Link
              href={DASHBOARD_SETTINGS_PATH}
              className="inline-flex h-8 items-center rounded-lg px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Settings
            </Link>
            <SignOutButton />
          </nav>
        </div>
      </header>
      {children}
    </div>
  )
}
