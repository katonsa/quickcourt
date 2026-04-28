"use client"

import Link from "next/link"
import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { AuthCard } from "@/components/auth/auth-card"
import { getGenericPasswordResetErrorMessage } from "@/components/auth/auth-errors"
import { AuthField } from "@/components/auth/auth-field"
import { FormMessage } from "@/components/auth/form-message"
import { SubmitButton } from "@/components/auth/submit-button"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { FORGOT_PASSWORD_PATH, SIGN_IN_PATH } from "@/lib/auth/paths"
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validation/auth"

type ResetPasswordFormProps = {
  hasToken: boolean
  hasProviderError: boolean
}

export function ResetPasswordForm({
  hasToken,
  hasProviderError,
}: ResetPasswordFormProps) {
  const [formError, setFormError] = React.useState<string | null>(null)
  const [isPending, setIsPending] = React.useState(false)
  const [isComplete, setIsComplete] = React.useState(false)
  const isLinkUsable = hasToken && !hasProviderError
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  function handleValidSubmit(input: ResetPasswordInput) {
    setFormError(null)

    if (!isLinkUsable) {
      setFormError(getGenericPasswordResetErrorMessage())
      return
    }

    const token = getResetTokenFromCurrentUrl()

    if (!token) {
      setFormError(getGenericPasswordResetErrorMessage())
      return
    }

    void submitPasswordReset(input, token)
  }

  async function submitPasswordReset(input: ResetPasswordInput, token: string) {
    setIsPending(true)

    try {
      const { error } = await authClient.resetPassword({
        newPassword: input.password,
        token,
      })

      if (error) {
        setFormError(getGenericPasswordResetErrorMessage())
        return
      }

      setIsComplete(true)
    } catch {
      setFormError(getGenericPasswordResetErrorMessage())
    } finally {
      setIsPending(false)
    }
  }

  return (
    <AuthCard
      title={isComplete ? "Password updated" : "Set a new password"}
      description={
        isComplete
          ? "Sign in with your new password to continue."
          : "Choose a new password for your QuickCourt account."
      }
      footer={
        <Link
          href={FORGOT_PASSWORD_PATH}
          className="font-medium text-foreground"
        >
          Request another reset link
        </Link>
      }
    >
      {isComplete ? (
        <div className="space-y-5">
          <FormMessage variant="success">
            Your password has been updated.
          </FormMessage>
          <Button asChild className="w-full">
            <Link href={SIGN_IN_PATH}>Go to sign in</Link>
          </Button>
        </div>
      ) : (
        <form
          className="space-y-5"
          onSubmit={handleSubmit(handleValidSubmit)}
          noValidate
        >
          {!isLinkUsable ? (
            <FormMessage>
              This reset link cannot be used. Request a new link to continue.
            </FormMessage>
          ) : null}
          <div className="space-y-4">
            <AuthField
              type="password"
              label="New password"
              autoComplete="new-password"
              description="Use 8 to 128 characters."
              error={errors.password?.message}
              disabled={!isLinkUsable || isPending}
              required
              {...register("password")}
            />
            <AuthField
              type="password"
              label="Confirm new password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              disabled={!isLinkUsable || isPending}
              required
              {...register("confirmPassword")}
            />
          </div>
          <FormMessage>{formError}</FormMessage>
          <SubmitButton
            className="w-full"
            disabled={!isLinkUsable}
            isPending={isPending}
            pendingLabel="Updating password"
          >
            Update password
          </SubmitButton>
        </form>
      )}
    </AuthCard>
  )
}

function getResetTokenFromCurrentUrl() {
  if (typeof window === "undefined") {
    return null
  }

  return new URLSearchParams(window.location.search).get("token")
}
