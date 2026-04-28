import Link from "next/link"

import { AuthCard } from "@/components/auth/auth-card"
import { AuthField } from "@/components/auth/auth-field"
import { SubmitButton } from "@/components/auth/submit-button"
import {
  SIGN_IN_REDIRECT_PARAM,
  SIGN_UP_PATH,
} from "@/lib/auth/paths"

type SignInFormProps = {
  redirectTo?: string | null
}

export function SignInForm({ redirectTo }: SignInFormProps) {
  return (
    <AuthCard
      title="Sign in"
      description="Access your bookings, venue workspace, or admin tools."
      footer={
        <span>
          New to QuickCourt?{" "}
          <Link href={SIGN_UP_PATH} className="font-medium text-foreground">
            Create an account
          </Link>
        </span>
      }
    >
      <form className="space-y-5">
        {redirectTo ? (
          <input
            type="hidden"
            name={SIGN_IN_REDIRECT_PARAM}
            value={redirectTo}
          />
        ) : null}
        <div className="space-y-4">
          <AuthField
            name="email"
            type="email"
            label="Email"
            autoComplete="email"
            required
          />
          <AuthField
            name="password"
            type="password"
            label="Password"
            autoComplete="current-password"
            required
          />
        </div>
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/forgot-password"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Forgot password?
          </Link>
          <SubmitButton disabled>Continue</SubmitButton>
        </div>
      </form>
    </AuthCard>
  )
}
