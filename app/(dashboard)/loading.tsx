import { RouteLoadingState } from "@/components/layouts/route-state"

export default function DashboardLoading() {
  return (
    <RouteLoadingState
      label="Loading dashboard"
      description="Preparing your protected workspace."
    />
  )
}
