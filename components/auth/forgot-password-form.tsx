import Link from "next/link"

import { AuthCard } from "@/components/auth/auth-card"
import { AuthField } from "@/components/auth/auth-field"
import { SubmitButton } from "@/components/auth/submit-button"
import { SIGN_IN_PATH } from "@/lib/auth/paths"

export function ForgotPasswordForm() {
  return (
    <AuthCard
      title="Reset your password"
      description="Enter the email address on your QuickCourt account."
      footer={
        <Link href={SIGN_IN_PATH} className="font-medium text-foreground">
          Back to sign in
        </Link>
      }
    >
      <form className="space-y-5">
        <AuthField
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          required
        />
        <SubmitButton className="w-full" disabled>
          Send reset link
        </SubmitButton>
      </form>
    </AuthCard>
  )
}
