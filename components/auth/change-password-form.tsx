"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { getGenericChangePasswordErrorMessage } from "@/components/auth/auth-errors"
import { AuthField } from "@/components/auth/auth-field"
import { FormMessage } from "@/components/auth/form-message"
import { SubmitButton } from "@/components/auth/submit-button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { authClient } from "@/lib/auth-client"
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from "@/lib/validation/auth"

const CHANGE_PASSWORD_SUCCESS_MESSAGE = "Your password has been updated."

export function ChangePasswordForm() {
  const [formError, setFormError] = React.useState<string | null>(null)
  const [successMessage, setSuccessMessage] = React.useState<string | null>(
    null
  )
  const [isPending, setIsPending] = React.useState(false)
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  function handleValidSubmit(input: ChangePasswordInput) {
    setFormError(null)
    setSuccessMessage(null)
    void submitPasswordChange(input)
  }

  async function submitPasswordChange(input: ChangePasswordInput) {
    setIsPending(true)

    try {
      const { error } = await authClient.changePassword({
        currentPassword: input.currentPassword,
        newPassword: input.newPassword,
        revokeOtherSessions: true,
      })

      if (error) {
        setFormError(getGenericChangePasswordErrorMessage())
        return
      }

      reset()
      setSuccessMessage(CHANGE_PASSWORD_SUCCESS_MESSAGE)
    } catch {
      setFormError(getGenericChangePasswordErrorMessage())
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Card className="w-full max-w-xl rounded-lg shadow-sm">
      <CardHeader className="gap-2">
        <CardTitle className="text-xl">Password</CardTitle>
        <CardDescription>
          Use your current password to set a new password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-5"
          onSubmit={handleSubmit(handleValidSubmit)}
          noValidate
        >
          <div className="space-y-4">
            <AuthField
              type="password"
              label="Current password"
              autoComplete="current-password"
              error={errors.currentPassword?.message}
              disabled={isPending}
              required
              {...register("currentPassword")}
            />
            <AuthField
              type="password"
              label="New password"
              autoComplete="new-password"
              description="Use 8 to 128 characters."
              error={errors.newPassword?.message}
              disabled={isPending}
              required
              {...register("newPassword")}
            />
            <AuthField
              type="password"
              label="Confirm new password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              disabled={isPending}
              required
              {...register("confirmPassword")}
            />
          </div>
          <FormMessage>{formError}</FormMessage>
          <FormMessage variant="success">{successMessage}</FormMessage>
          <SubmitButton
            className="w-full sm:w-auto"
            isPending={isPending}
            pendingLabel="Updating password"
          >
            Update password
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  )
}
