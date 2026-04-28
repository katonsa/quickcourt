"use client"

import { RouteState } from "@/components/layouts/route-state"

type AdminErrorPageProps = {
  error: Error & { digest?: string }
  unstable_retry: () => void
}

export default function AdminErrorPage({
  unstable_retry: retryAction,
}: AdminErrorPageProps) {
  return (
    <RouteState
      eyebrow="Admin error"
      title="Admin area unavailable"
      description="The admin area could not be loaded. Try again, or return later if the problem continues."
      onRetry={retryAction}
    />
  )
}
