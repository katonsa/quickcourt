"use client"

import { RouteState } from "@/components/layouts/route-state"

type DashboardErrorPageProps = {
  error: Error & { digest?: string }
  unstable_retry: () => void
}

export default function DashboardErrorPage({
  unstable_retry: retryAction,
}: DashboardErrorPageProps) {
  return (
    <RouteState
      eyebrow="Dashboard error"
      title="Dashboard unavailable"
      description="The dashboard could not be loaded. Try again, or return later if the problem continues."
      onRetry={retryAction}
    />
  )
}
