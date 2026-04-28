"use client"

import * as React from "react"
import { useFormStatus } from "react-dom"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

type SubmitButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "type" | "disabled"
> & {
  disabled?: boolean
  isPending?: boolean
  pendingLabel?: React.ReactNode
}

export function SubmitButton({
  children,
  disabled,
  isPending,
  pendingLabel = "Please wait",
  ...props
}: SubmitButtonProps) {
  const { pending: formPending } = useFormStatus()
  const pending = isPending ?? formPending
  const isDisabled = disabled || pending

  return (
    <Button
      type="submit"
      disabled={isDisabled}
      aria-disabled={isDisabled}
      {...props}
    >
      {pending ? <Spinner aria-hidden="true" /> : null}
      <span>{pending ? pendingLabel : children}</span>
    </Button>
  )
}
