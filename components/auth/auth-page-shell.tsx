import Link from "next/link"

import { cn } from "@/lib/utils"

export function AuthPageShell({
  children,
  className,
}: Readonly<{
  children: React.ReactNode
  className?: string
}>) {
  return (
    <main
      className={cn(
        "min-h-svh bg-background",
        className
      )}
    >
      <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col px-6">
        <header className="flex h-16 items-center justify-between">
          <Link href="/" className="text-sm font-semibold tracking-normal">
            QuickCourt
          </Link>
          <Link
            href="/venues"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Venues
          </Link>
        </header>
        <div className="flex flex-1 items-center justify-center py-10">
          {children}
        </div>
      </div>
    </main>
  )
}
