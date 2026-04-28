import Link from "next/link"

export default function DashboardPage() {
  return (
    <main className="min-h-svh bg-background">
      <section className="mx-auto flex min-h-svh w-full max-w-5xl flex-col justify-center gap-8 px-6 py-16">
        <div className="max-w-2xl space-y-4">
          <h1 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
            Dashboard
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            Account activity, bookings, and profile workflows will land here as
            Phase 1 route protection is completed.
          </p>
        </div>

        <div className="grid gap-4 border-t pt-8 sm:grid-cols-2">
          <Link
            className="rounded-md border p-5 transition-colors hover:bg-accent"
            href="/dashboard/venue"
          >
            <h2 className="text-sm font-medium text-foreground">
              Venue workspace
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Operational route surface for organization members.
            </p>
          </Link>
          <div className="rounded-md border p-5">
            <h2 className="text-sm font-medium text-foreground">
              Booking history
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Customer booking summaries will be wired in a later slice.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
