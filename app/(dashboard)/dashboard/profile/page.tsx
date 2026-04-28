export default function DashboardProfilePage() {
  return (
    <main>
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10">
        <div className="max-w-2xl space-y-3">
          <h1 className="text-3xl font-semibold tracking-normal text-foreground">
            Profile
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            Profile details and editing controls will be added in a later
            milestone.
          </p>
        </div>
        <div className="rounded-lg border p-6">
          <h2 className="text-sm font-medium text-foreground">
            Account profile placeholder
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            The route is protected and ready for future profile workflows, but
            no profile editing is implemented in this slice.
          </p>
        </div>
      </section>
    </main>
  )
}
