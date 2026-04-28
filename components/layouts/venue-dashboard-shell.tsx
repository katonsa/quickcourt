import * as React from "react"

import { VenueDashboardNav } from "@/components/layouts/venue-dashboard-nav"

type VenueDashboardShellProps = {
  organization: {
    name: string
    slug: string
  }
  membership: {
    role: string
  }
  membershipsCount: number
  venue: {
    name: string
  } | null
  children: React.ReactNode
}

export function VenueDashboardShell({
  organization,
  membership,
  membershipsCount,
  venue,
  children,
}: VenueDashboardShellProps) {
  const workspaceName = venue?.name ?? organization.name
  const roleLabel = formatMembershipRole(membership.role)
  const membershipLabel =
    membershipsCount === 1
      ? "1 organization membership"
      : `${membershipsCount} organization memberships`

  return (
    <main className="min-h-[calc(100svh-3.5rem)] bg-muted/20">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b bg-background pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              Venue workspace
            </p>
            <div className="space-y-2">
              <h1 className="truncate text-3xl font-semibold tracking-normal text-foreground">
                {workspaceName}
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                Protected workspace for {organization.name}. Access is granted
                by organization membership.
              </p>
            </div>
          </div>
          <div className="grid gap-3 text-sm sm:grid-cols-3 lg:min-w-[28rem]">
            <div className="rounded-lg border bg-card p-3">
              <p className="text-xs font-medium text-muted-foreground">Role</p>
              <p className="mt-1 truncate font-medium text-card-foreground">
                {roleLabel}
              </p>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <p className="text-xs font-medium text-muted-foreground">
                Organization
              </p>
              <p className="mt-1 truncate font-medium text-card-foreground">
                {organization.slug}
              </p>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <p className="text-xs font-medium text-muted-foreground">
                Memberships
              </p>
              <p className="mt-1 truncate font-medium text-card-foreground">
                {membershipLabel}
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <aside className="h-fit rounded-lg border bg-background p-2 lg:sticky lg:top-20">
            <VenueDashboardNav />
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </section>
    </main>
  )
}

function formatMembershipRole(role: string) {
  return role
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}
