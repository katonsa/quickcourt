import Link from "next/link"

import { AuthCard } from "@/components/auth/auth-card"
import { FormMessage } from "@/components/auth/form-message"
import { Button } from "@/components/ui/button"
import { SIGN_IN_PATH } from "@/lib/auth/paths"

type VerifyEmailNoticeProps = {
  status?: string
  hasProviderError: boolean
}

export function VerifyEmailNotice({
  status,
  hasProviderError,
}: VerifyEmailNoticeProps) {
  const isVerified = status === "verified" || status === "success"

  return (
    <AuthCard
      title={isVerified ? "Email verified" : "Check your email"}
      description={
        isVerified
          ? "Your email address is ready for sign-in."
          : "Open the verification link from QuickCourt to finish account setup."
      }
    >
      <div className="space-y-5">
        {hasProviderError ? (
          <FormMessage>
            This verification link cannot be used. Sign in to request a fresh
            email.
          </FormMessage>
        ) : null}
        <Button asChild className="w-full">
          <Link href={SIGN_IN_PATH}>Go to sign in</Link>
        </Button>
      </div>
    </AuthCard>
  )
}
