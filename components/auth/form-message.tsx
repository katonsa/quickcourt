import * as React from "react"

import { cn } from "@/lib/utils"

type FormMessageProps = React.ComponentProps<"div"> & {
  variant?: "error" | "success"
}

export function FormMessage({
  variant = "error",
  className,
  children,
  ...props
}: FormMessageProps) {
  if (!children) {
    return null
  }

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      aria-live="polite"
      data-variant={variant}
      className={cn(
        "rounded-lg border px-3 py-2 text-sm leading-6",
        variant === "error" &&
          "border-destructive/25 bg-destructive/10 text-destructive",
        variant === "success" &&
          "border-emerald-600/25 bg-emerald-600/10 text-emerald-700 dark:text-emerald-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
