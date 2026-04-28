import Link from "next/link"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { DASHBOARD_PATH, SIGN_IN_PATH, SIGN_UP_PATH } from "@/lib/auth/paths"
import { cn } from "@/lib/utils"

type PublicShellProps = {
  activePath?: "/" | "/venues"
  children: React.ReactNode
}

const publicNavItems = [
  { href: "/", label: "Home" },
  { href: "/venues", label: "Venues" },
] as const

export function PublicShell({ activePath = "/", children }: PublicShellProps) {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="border-b bg-card">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-semibold tracking-normal text-foreground"
            >
              QuickCourt
            </Link>
            <nav aria-label="Public" className="flex items-center gap-1">
              {publicNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={activePath === item.href ? "page" : undefined}
                  className={cn(
                    "inline-flex h-8 items-center rounded-lg px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    activePath === item.href && "bg-muted text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href={DASHBOARD_PATH}>Dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={SIGN_IN_PATH}>Sign in</Link>
            </Button>
            <Button asChild>
              <Link href={SIGN_UP_PATH}>Create account</Link>
            </Button>
          </div>
        </div>
      </header>
      {children}
      <footer className="border-t bg-card">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>QuickCourt marketplace foundation</p>
          <p>
            Venue discovery, booking, and payments arrive in later milestones.
          </p>
        </div>
      </footer>
    </div>
  )
}
