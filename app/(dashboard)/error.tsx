"use client"

import { Button } from "@/components/ui/button"

type DashboardErrorPageProps = {
  error: Error & { digest?: string }
  unstable_retry: () => void
}

export default function DashboardErrorPage({
  unstable_retry: retryAction,
}: DashboardErrorPageProps) {
  return (
    <main className="min-h-svh bg-background">
      <section className="mx-auto flex min-h-svh w-full max-w-3xl flex-col justify-center gap-6 px-6 py-16">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-normal text-foreground">
            Dashboard unavailable
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground">
            The dashboard could not be loaded. Try again, or return later if the
            problem continues.
          </p>
        </div>
        <div>
          <Button type="button" onClick={() => retryAction()}>
            Try again
          </Button>
        </div>
      </section>
    </main>
  )
}
