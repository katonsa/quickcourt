import Link from "next/link"

import { PublicShell } from "@/components/layouts/public-shell"
import { Button } from "@/components/ui/button"

export default function VenuesPage() {
  return (
    <PublicShell activePath="/venues">
      <main>
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
          <div className="flex flex-col gap-6 border-b pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl space-y-3">
              <h1 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
                Venue discovery surface
              </h1>
              <p className="text-base leading-7 text-muted-foreground">
                This page stays public while search, availability, and booking
                workflows are deferred to later milestones.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/">Back home</Link>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border p-5">
              <div className="mb-4 h-1 w-10 rounded-full bg-emerald-600" />
              <h2 className="text-sm font-medium">Search</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Venue search is intentionally deferred beyond the Phase 1
                foundation.
              </p>
            </div>
            <div className="rounded-lg border p-5">
              <div className="mb-4 h-1 w-10 rounded-full bg-sky-600" />
              <h2 className="text-sm font-medium">Availability</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Court schedules, pricing, and slot calculation arrive in later
                milestones.
              </p>
            </div>
            <div className="rounded-lg border p-5">
              <div className="mb-4 h-1 w-10 rounded-full bg-amber-600" />
              <h2 className="text-sm font-medium">Booking</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Customer booking and payment flows are not implemented in Phase
                1.
              </p>
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  )
}
