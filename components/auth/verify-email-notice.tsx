import Link from "next/link"

import { AuthCard } from "@/components/auth/auth-card"
import { FormMessage } from "@/components/auth/form-message"
import { Button } from "@/components/ui/button"
import { SIGN_IN_PATH } from "@/lib/auth/paths"

export type VerifyEmailStatus = "sent" | "verified"

type VerifyEmailNoticeProps = {
  status?: VerifyEmailStatus
  hasProviderError: boolean
}

export function VerifyEmailNotice({
  status,
  hasProviderError,
}: VerifyEmailNoticeProps) {
  const isVerified = status === "verified"
  const title = hasProviderError
    ? "Verification link expired"
    : isVerified
      ? "Email verified"
      : "Check your email"
  const description = hasProviderError
    ? "Request a fresh verification email before signing in."
    : isVerified
      ? "Your email address is ready for sign-in."
      : "Open the verification link from QuickCourt to finish account setup."

  return (
    <AuthCard title={title} description={description}>
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
