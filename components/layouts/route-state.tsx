import Link from "next/link"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"

type RouteStateAction = {
  href: string
  label: string
  variant?: React.ComponentProps<typeof Button>["variant"]
}

type RouteStateProps = {
  eyebrow: string
  title: string
  description: string
  actions?: RouteStateAction[]
  onRetry?: () => void
  retryLabel?: string
}

export function RouteState({
  eyebrow,
  title,
  description,
  actions = [],
  onRetry,
  retryLabel = "Try again",
}: RouteStateProps) {
  return (
    <main className="min-h-svh bg-background">
      <section className="mx-auto flex min-h-svh w-full max-w-3xl flex-col justify-center gap-6 px-6 py-16">
        <div className="space-y-4 border-l-2 border-foreground/80 pl-5">
          <p className="text-sm font-medium text-muted-foreground">{eyebrow}</p>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
              {title}
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {onRetry ? (
            <Button type="button" onClick={() => onRetry()}>
              {retryLabel}
            </Button>
          ) : null}
          {actions.map((action) => (
            <Button
              asChild
              key={action.href}
              variant={action.variant ?? "default"}
            >
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ))}
        </div>
      </section>
    </main>
  )
}

type RouteLoadingStateProps = {
  label: string
  description: string
}

export function RouteLoadingState({
  label,
  description,
}: RouteLoadingStateProps) {
  return (
    <main className="min-h-[calc(100svh-3.5rem)] bg-background">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
        <div className="flex items-center gap-3">
          <Spinner className="size-5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-40" />
      </section>
    </main>
  )
}
