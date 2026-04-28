import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <main className="min-h-svh bg-background">
      <section className="mx-auto flex min-h-svh w-full max-w-5xl flex-col justify-center gap-10 px-6 py-16">
        <div className="max-w-3xl space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
              Book sports courts with a marketplace built for reliable
              operations.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              QuickCourt connects players with sports venues while laying the
              groundwork for account access, venue operations, booking,
              payments, and finance workflows.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/venues">View venue placeholder</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 border-t pt-8 sm:grid-cols-3">
          <div>
            <h2 className="text-sm font-medium">Marketplace</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Public venue discovery starts with a placeholder shell in Phase 1.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-medium">Access</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              User, venue, and admin boundaries will build on the same
              foundation.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-medium">Operations</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Later milestones add booking, payment, staff, and finance
              workflows.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
