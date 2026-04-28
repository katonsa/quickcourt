export default function VenueDashboardPage() {
  return (
    <main className="min-h-svh bg-background">
      <section className="mx-auto flex min-h-svh w-full max-w-5xl flex-col justify-center gap-8 px-6 py-16">
        <div className="max-w-2xl space-y-4">
          <h1 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
            Venue workspace
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            Organization members will manage venue operations from this route
            surface once guards and venue workflows are connected.
          </p>
        </div>

        <div className="grid gap-4 border-t pt-8 sm:grid-cols-3">
          <div>
            <h2 className="text-sm font-medium text-foreground">Schedule</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Court availability and daily operations.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-foreground">Bookings</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Reservation management for venue staff.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-foreground">Finance</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Settlement and ledger views for owners.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
