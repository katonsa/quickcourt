"use client"

import Link from "next/link"
import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { AuthCard } from "@/components/auth/auth-card"
import { getGenericPasswordResetRequestErrorMessage } from "@/components/auth/auth-errors"
import { AuthField } from "@/components/auth/auth-field"
import { FormMessage } from "@/components/auth/form-message"
import { SubmitButton } from "@/components/auth/submit-button"
import { authClient } from "@/lib/auth-client"
import { RESET_PASSWORD_PATH, SIGN_IN_PATH } from "@/lib/auth/paths"
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validation/auth"

const PASSWORD_RESET_SENT_MESSAGE =
  "If an account uses that email, a reset link will arrive shortly."

export function ForgotPasswordForm() {
  const [formError, setFormError] = React.useState<string | null>(null)
  const [completionMessage, setCompletionMessage] = React.useState<
    string | null
  >(null)
  const [isPending, setIsPending] = React.useState(false)
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  function handleValidSubmit(input: ForgotPasswordInput) {
    setFormError(null)
    setCompletionMessage(null)
    void submitPasswordResetRequest(input)
  }

  async function submitPasswordResetRequest(input: ForgotPasswordInput) {
    setIsPending(true)

    try {
      await authClient.requestPasswordReset({
        email: input.email,
        redirectTo: RESET_PASSWORD_PATH,
      })

      setCompletionMessage(PASSWORD_RESET_SENT_MESSAGE)
    } catch {
      setFormError(getGenericPasswordResetRequestErrorMessage())
    } finally {
      setIsPending(false)
    }
  }

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
      <form
        className="space-y-5"
        onSubmit={handleSubmit(handleValidSubmit)}
        noValidate
      >
        <AuthField
          type="email"
          label="Email"
          autoComplete="email"
          error={errors.email?.message}
          disabled={isPending}
          required
          {...register("email")}
        />
        <FormMessage>{formError}</FormMessage>
        <FormMessage variant="success">{completionMessage}</FormMessage>
        <SubmitButton
          className="w-full"
          isPending={isPending}
          pendingLabel="Sending link"
        >
          Send reset link
        </SubmitButton>
      </form>
    </AuthCard>
  )
}
