import { RouteLoadingState } from "@/components/layouts/route-state"

export default function AuthLoading() {
  return (
    <RouteLoadingState
      label="Loading account page"
      description="Preparing the secure account form."
    />
  )
}
