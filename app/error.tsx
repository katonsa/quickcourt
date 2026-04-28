"use client"

import { RouteState } from "@/components/layouts/route-state"

type ErrorPageProps = {
  error: Error & { digest?: string }
  unstable_retry: () => void
}

export default function ErrorPage({
  unstable_retry: retryAction,
}: ErrorPageProps) {
  return (
    <RouteState
      eyebrow="Unexpected error"
      title="Something went wrong"
      description="The page could not be loaded. Try again, or return later if the problem continues."
      onRetry={retryAction}
    />
  )
}
