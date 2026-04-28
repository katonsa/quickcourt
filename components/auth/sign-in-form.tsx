"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { AuthCard } from "@/components/auth/auth-card"
import { getGenericSignInErrorMessage } from "@/components/auth/auth-errors"
import { AuthField } from "@/components/auth/auth-field"
import { FormMessage } from "@/components/auth/form-message"
import { SubmitButton } from "@/components/auth/submit-button"
import { authClient } from "@/lib/auth-client"
import {
  DEFAULT_SIGN_IN_REDIRECT_PATH,
  SIGN_UP_PATH,
  sanitizeSignInRedirectTo,
} from "@/lib/auth/paths"
import { signInSchema, type SignInInput } from "@/lib/validation/auth"

type SignInFormProps = {
  redirectTo?: string | null
}

export function SignInForm({ redirectTo }: SignInFormProps) {
  const router = useRouter()
  const [formError, setFormError] = React.useState<string | null>(null)
  const [isPending, setIsPending] = React.useState(false)
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  function handleValidSubmit(input: SignInInput) {
    setFormError(null)
    const safeRedirectTo =
      sanitizeSignInRedirectTo(redirectTo ?? undefined) ??
      DEFAULT_SIGN_IN_REDIRECT_PATH

    void submitSignIn(input, safeRedirectTo)
  }

  async function submitSignIn(input: SignInInput, safeRedirectTo: string) {
    setIsPending(true)

    try {
      const { error } = await authClient.signIn.email({
        email: input.email,
        password: input.password,
      })

      if (error) {
        setFormError(getGenericSignInErrorMessage(error))
        return
      }

      router.replace(safeRedirectTo)
      router.refresh()
    } catch {
      setFormError(getGenericSignInErrorMessage(null))
    } finally {
      setIsPending(false)
    }
  }

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
      <form
        className="space-y-5"
        onSubmit={handleSubmit(handleValidSubmit)}
        noValidate
      >
        <div className="space-y-4">
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
            autoComplete="current-password"
            error={errors.password?.message}
            disabled={isPending}
            required
            {...register("password")}
          />
        </div>
        <FormMessage>{formError}</FormMessage>
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/forgot-password"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Forgot password?
          </Link>
          <SubmitButton isPending={isPending}>Continue</SubmitButton>
        </div>
      </form>
    </AuthCard>
  )
}
