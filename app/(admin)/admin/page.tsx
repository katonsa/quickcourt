export default function AdminPage() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10">
      <div className="max-w-2xl space-y-4">
        <p className="text-sm font-medium text-muted-foreground">Super admin</p>
        <h1 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
          Admin overview
        </h1>
        <p className="text-base leading-7 text-muted-foreground">
          Protected platform administration surface for future Phase 1 route
          verification and later operational tools.
        </p>
      </div>

      <div className="grid gap-4 border-t pt-8 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-5">
          <h2 className="text-sm font-medium text-card-foreground">
            Venue records
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Placeholder navigation only; venue review workflows are not
            implemented here.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <h2 className="text-sm font-medium text-card-foreground">
            User records
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Account moderation and support workflows remain out of scope for
            this slice.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <h2 className="text-sm font-medium text-card-foreground">
            Platform settings
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Configuration and audit surfaces are reserved for later milestones.
          </p>
        </div>
      </div>
    </section>
  )
}
