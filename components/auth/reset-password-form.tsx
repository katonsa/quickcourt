import Link from "next/link"

import { AuthCard } from "@/components/auth/auth-card"
import { AuthField } from "@/components/auth/auth-field"
import { SubmitButton } from "@/components/auth/submit-button"
import { FormMessage } from "@/components/auth/form-message"

type ResetPasswordFormProps = {
  hasToken: boolean
  hasProviderError: boolean
}

export function ResetPasswordForm({
  hasToken,
  hasProviderError,
}: ResetPasswordFormProps) {
  return (
    <AuthCard
      title="Set a new password"
      description="Choose a new password for your QuickCourt account."
      footer={
        <Link href="/forgot-password" className="font-medium text-foreground">
          Request another reset link
        </Link>
      }
    >
      <form className="space-y-5">
        {!hasToken || hasProviderError ? (
          <FormMessage>
            This reset link cannot be used. Request a new link to continue.
          </FormMessage>
        ) : null}
        <div className="space-y-4">
          <AuthField
            name="password"
            type="password"
            label="New password"
            autoComplete="new-password"
            description="Use 8 to 128 characters."
            disabled={!hasToken || hasProviderError}
            required
          />
          <AuthField
            name="confirmPassword"
            type="password"
            label="Confirm new password"
            autoComplete="new-password"
            disabled={!hasToken || hasProviderError}
            required
          />
        </div>
        <SubmitButton className="w-full" disabled>
          Update password
        </SubmitButton>
      </form>
    </AuthCard>
  )
}
