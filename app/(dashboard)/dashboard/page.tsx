import Link from "next/link"

import {
  DASHBOARD_BOOKINGS_PATH,
  DASHBOARD_PROFILE_PATH,
  DASHBOARD_SETTINGS_PATH,
} from "@/lib/auth/paths"

export default function DashboardPage() {
  return (
    <main>
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10">
        <div className="max-w-2xl space-y-4">
          <h1 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
            Dashboard
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            Your protected QuickCourt account workspace. Phase 1 keeps these
            routes visible while product workflows arrive later.
          </p>
        </div>

        <div className="grid gap-4 border-t pt-8 sm:grid-cols-2 xl:grid-cols-4">
          <Link
            className="rounded-lg border p-5 transition-colors hover:bg-accent"
            href={DASHBOARD_BOOKINGS_PATH}
          >
            <h2 className="text-sm font-medium text-foreground">Bookings</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Customer booking history placeholder for later milestones.
            </p>
          </Link>
          <Link
            className="rounded-lg border p-5 transition-colors hover:bg-accent"
            href={DASHBOARD_PROFILE_PATH}
          >
            <h2 className="text-sm font-medium text-foreground">Profile</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Account profile route placeholder without editing workflows.
            </p>
          </Link>
          <Link
            className="rounded-lg border p-5 transition-colors hover:bg-accent"
            href={DASHBOARD_SETTINGS_PATH}
          >
            <h2 className="text-sm font-medium text-foreground">Settings</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Password settings and account controls.
            </p>
          </Link>
          <Link
            className="rounded-lg border p-5 transition-colors hover:bg-accent"
            href="/dashboard/venue"
          >
            <h2 className="text-sm font-medium text-foreground">
              Venue workspace
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Operational route surface for organization members.
            </p>
          </Link>
        </div>
      </section>
    </main>
  )
}
