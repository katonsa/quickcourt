"use client"

import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { SIGN_IN_PATH } from "@/lib/auth/paths"

type SignOutButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "onClick" | "disabled"
>

export function SignOutButton({ children, ...props }: SignOutButtonProps) {
  const router = useRouter()
  const [isPending, setIsPending] = React.useState(false)

  async function handleSignOut() {
    setIsPending(true)

    try {
      await authClient.signOut()
    } finally {
      router.replace(SIGN_IN_PATH)
      router.refresh()
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => void handleSignOut()}
      disabled={isPending}
      aria-disabled={isPending}
      {...props}
    >
      <LogOut aria-hidden="true" />
      <span>{children ?? (isPending ? "Signing out" : "Sign out")}</span>
    </Button>
  )
}
