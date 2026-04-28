"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { AuthCard } from "@/components/auth/auth-card"
import { getGenericSignUpErrorMessage } from "@/components/auth/auth-errors"
import { AuthField } from "@/components/auth/auth-field"
import { FormMessage } from "@/components/auth/form-message"
import { SubmitButton } from "@/components/auth/submit-button"
import { authClient } from "@/lib/auth-client"
import {
  EMAIL_VERIFICATION_CALLBACK_PATH,
  EMAIL_VERIFICATION_SENT_PATH,
  SIGN_IN_PATH,
} from "@/lib/auth/paths"
import { signUpSchema, type SignUpInput } from "@/lib/validation/auth"

export function SignUpForm() {
  const router = useRouter()
  const [formError, setFormError] = React.useState<string | null>(null)
  const [isPending, setIsPending] = React.useState(false)
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  function handleValidSubmit(input: SignUpInput) {
    setFormError(null)
    void submitSignUp(input)
  }

  async function submitSignUp(input: SignUpInput) {
    setIsPending(true)

    try {
      const { error } = await authClient.signUp.email({
        name: input.name,
        email: input.email,
        password: input.password,
        callbackURL: EMAIL_VERIFICATION_CALLBACK_PATH,
      })

      if (error) {
        setFormError(getGenericSignUpErrorMessage())
        return
      }

      router.replace(EMAIL_VERIFICATION_SENT_PATH)
    } catch {
      setFormError(getGenericSignUpErrorMessage())
    } finally {
      setIsPending(false)
    }
  }

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
      <form
        className="space-y-5"
        onSubmit={handleSubmit(handleValidSubmit)}
        noValidate
      >
        <div className="space-y-4">
          <AuthField
            label="Name"
            autoComplete="name"
            error={errors.name?.message}
            disabled={isPending}
            required
            {...register("name")}
          />
          <AuthField
            type="email"
            label="Email"
            autoComplete="email"
            error={errors.email?.message}
            disabled={isPending}
            required
            {...register("email")}
          />
          <AuthField
            type="password"
            label="Password"
            autoComplete="new-password"
            description="Use 8 to 128 characters."
            error={errors.password?.message}
            disabled={isPending}
            required
            {...register("password")}
          />
          <AuthField
            type="password"
            label="Confirm password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            disabled={isPending}
            required
            {...register("confirmPassword")}
          />
        </div>
        <FormMessage>{formError}</FormMessage>
        <SubmitButton className="w-full" isPending={isPending}>
          Create account
        </SubmitButton>
      </form>
    </AuthCard>
  )
}
