export default function DashboardSupportPage() {
  return (
    <main>
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10">
        <div className="max-w-2xl space-y-3">
          <h1 className="text-3xl font-semibold tracking-normal text-foreground">
            Support
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            Support entry points will be connected after the foundation routes
            are complete.
          </p>
        </div>
        <div className="rounded-lg border p-6">
          <h2 className="text-sm font-medium text-foreground">
            Support workflow placeholder
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            This authenticated route exists for navigation continuity and does
            not create tickets or support messages yet.
          </p>
        </div>
      </section>
    </main>
  )
}
