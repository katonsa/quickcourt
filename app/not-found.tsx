import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function NotFoundPage() {
  return (
    <main className="min-h-svh bg-background">
      <section className="mx-auto flex min-h-svh w-full max-w-3xl flex-col justify-center gap-6 px-6 py-16">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-normal text-foreground">
            Page not found
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground">
            The page you requested does not exist or may have moved.
          </p>
        </div>
        <div>
          <Button asChild>
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
