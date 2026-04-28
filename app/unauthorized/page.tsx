import { RouteState } from "@/components/layouts/route-state"
import { SIGN_IN_PATH } from "@/lib/auth/paths"

export default function UnauthorizedPage() {
  return (
    <RouteState
      eyebrow="Authentication required"
      title="Sign in to continue"
      description="This area is only available after a verified session is established."
      actions={[
        { href: SIGN_IN_PATH, label: "Sign in" },
        { href: "/venues", label: "Browse venues", variant: "outline" },
      ]}
    />
  )
}
