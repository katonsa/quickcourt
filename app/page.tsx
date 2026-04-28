import Link from "next/link"

import { PublicShell } from "@/components/layouts/public-shell"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <PublicShell activePath="/">
      <main>
        <section className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center lg:py-16">
          <div className="max-w-3xl space-y-7">
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
                QuickCourt
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                A sports venue marketplace foundation for public discovery,
                account access, and future booking operations.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/venues">Browse venue surface</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard">Open dashboard</Link>
              </Button>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted/30"
          >
            <div className="absolute inset-6 rounded-md border-2 border-foreground/20" />
            <div className="absolute top-6 left-1/2 h-[calc(100%-3rem)] w-px bg-foreground/20" />
            <div className="absolute top-1/2 left-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-foreground/20" />
            <div className="absolute top-1/2 left-6 h-24 w-20 -translate-y-1/2 rounded-r-full border-2 border-l-0 border-foreground/20" />
            <div className="absolute top-1/2 right-6 h-24 w-20 -translate-y-1/2 rounded-l-full border-2 border-r-0 border-foreground/20" />
            <div className="absolute right-6 bottom-6 left-6 flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Search</span>
              <span>Schedule</span>
              <span>Book</span>
            </div>
          </div>
        </section>

        <section className="border-t">
          <div className="mx-auto grid w-full max-w-6xl gap-4 px-6 py-10 sm:grid-cols-3">
            <div className="rounded-lg border p-5">
              <div className="mb-4 h-1 w-10 rounded-full bg-emerald-600" />
              <h2 className="text-sm font-medium">Marketplace shell</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Public pages now share navigation and route structure.
              </p>
            </div>
            <div className="rounded-lg border p-5">
              <div className="mb-4 h-1 w-10 rounded-full bg-sky-600" />
              <h2 className="text-sm font-medium">Account access</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Sign-in, sign-up, and dashboard entry points use canonical auth
                routes.
              </p>
            </div>
            <div className="rounded-lg border p-5">
              <div className="mb-4 h-1 w-10 rounded-full bg-amber-600" />
              <h2 className="text-sm font-medium">Operations later</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Booking, payment, venue approval, and staff tools remain
                deferred.
              </p>
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  )
}
