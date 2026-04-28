export default function DashboardBookingsPage() {
  return (
    <main>
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10">
        <div className="max-w-2xl space-y-3">
          <h1 className="text-3xl font-semibold tracking-normal text-foreground">
            Bookings
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            Customer booking history will appear here after booking workflows
            are implemented.
          </p>
        </div>
        <div className="rounded-lg border p-6">
          <h2 className="text-sm font-medium text-foreground">
            No booking workflow yet
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            This protected placeholder keeps the user dashboard route stable
            without adding marketplace booking behavior in Phase 1.
          </p>
        </div>
      </section>
    </main>
  )
}
