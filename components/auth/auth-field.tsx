"use client"

import * as React from "react"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type AuthFieldProps = Omit<React.ComponentProps<typeof Input>, "id" | "name"> & {
  id?: string
  name: string
  label: React.ReactNode
  description?: React.ReactNode
  error?: string | string[]
}

export function AuthField({
  id,
  name,
  label,
  description,
  error,
  required,
  ...props
}: AuthFieldProps) {
  const generatedId = React.useId()
  const inputId = id ?? `${name}-${generatedId}`
  const descriptionId = description ? `${inputId}-description` : undefined
  const errorId = error ? `${inputId}-error` : undefined
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ")
  const errors = Array.isArray(error) ? error : error ? [error] : []

  return (
    <Field data-invalid={errors.length > 0}>
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      <Input
        id={inputId}
        name={name}
        required={required}
        aria-invalid={errors.length > 0}
        aria-describedby={describedBy || undefined}
        {...props}
      />
      {description ? (
        <FieldDescription id={descriptionId}>{description}</FieldDescription>
      ) : null}
      <FieldError
        id={errorId}
        errors={errors.map((message) => ({ message }))}
      />
    </Field>
  )
}
