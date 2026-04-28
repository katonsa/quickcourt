export default function AdminPage() {
  return (
    <main className="min-h-svh bg-background">
      <section className="mx-auto flex min-h-svh w-full max-w-5xl flex-col justify-center gap-8 px-6 py-16">
        <div className="max-w-2xl space-y-4">
          <p className="text-sm font-medium text-muted-foreground">
            Super admin
          </p>
          <h1 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
            Admin
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            Platform review, moderation, and operational controls will use this
            protected route surface.
          </p>
        </div>

        <div className="grid gap-4 border-t pt-8 sm:grid-cols-3">
          <div>
            <h2 className="text-sm font-medium text-foreground">Venues</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Approval and verification workflows.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-foreground">Users</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Account review and platform safety tools.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-foreground">Settings</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Platform configuration and audit surfaces.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
