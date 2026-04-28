import { RouteState } from "@/components/layouts/route-state"
import { DASHBOARD_PATH } from "@/lib/auth/paths"

export default function ForbiddenPage() {
  return (
    <RouteState
      eyebrow="Access unavailable"
      title="This page cannot be opened"
      description="The requested area is not available for the current session. No account or workspace details are shown here."
      actions={[
        { href: DASHBOARD_PATH, label: "Go to dashboard" },
        { href: "/venues", label: "Browse venues", variant: "outline" },
      ]}
    />
  )
}
