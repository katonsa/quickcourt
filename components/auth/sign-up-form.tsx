import Link from "next/link"

import { AuthCard } from "@/components/auth/auth-card"
import { AuthField } from "@/components/auth/auth-field"
import { SubmitButton } from "@/components/auth/submit-button"
import { SIGN_IN_PATH } from "@/lib/auth/paths"

export function SignUpForm() {
  return (
    <AuthCard
      title="Create your account"
      description="Start with a customer account. Venue access is granted after organization membership is approved."
      footer={
        <span>
          Already have an account?{" "}
          <Link href={SIGN_IN_PATH} className="font-medium text-foreground">
            Sign in
          </Link>
        </span>
      }
    >
      <form className="space-y-5">
        <div className="space-y-4">
          <AuthField
            name="name"
            label="Name"
            autoComplete="name"
            required
          />
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
            autoComplete="new-password"
            description="Use 8 to 128 characters."
            required
          />
          <AuthField
            name="confirmPassword"
            type="password"
            label="Confirm password"
            autoComplete="new-password"
            required
          />
        </div>
        <SubmitButton className="w-full" disabled>
          Create account
        </SubmitButton>
      </form>
    </AuthCard>
  )
}
