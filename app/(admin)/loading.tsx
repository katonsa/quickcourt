import { RouteLoadingState } from "@/components/layouts/route-state"

export default function AdminLoading() {
  return (
    <RouteLoadingState
      label="Loading admin area"
      description="Preparing the protected admin surface."
    />
  )
}
