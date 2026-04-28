export default function VenueDashboardPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-lg border bg-background p-6">
        <div className="max-w-2xl space-y-3">
          <h2 className="text-xl font-semibold tracking-normal text-foreground">
            Workspace overview
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Organization members can reach this protected route surface. Phase 1
            keeps the workspace shell ready without adding venue onboarding,
            booking, payment, finance, or staff management workflows.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-5">
          <h3 className="text-sm font-medium text-card-foreground">
            Operations
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Future scheduling and daily venue surfaces will attach here.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <h3 className="text-sm font-medium text-card-foreground">
            Team access
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Staff and branch permissions remain out of scope for this slice.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <h3 className="text-sm font-medium text-card-foreground">
            Financial views
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Settlement and ledger workflows are reserved for later milestones.
          </p>
        </div>
      </div>
    </section>
  )
}
