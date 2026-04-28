import * as React from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

type AuthCardProps = Omit<React.ComponentProps<typeof Card>, "title"> & {
  title: React.ReactNode
  description?: React.ReactNode
  footer?: React.ReactNode
}

export function AuthCard({
  title,
  description,
  footer,
  children,
  className,
  ...props
}: AuthCardProps) {
  return (
    <Card
      className={cn("w-full max-w-md rounded-lg shadow-sm", className)}
      {...props}
    >
      <CardHeader className="gap-2 px-6 pt-6">
        <CardTitle className="text-xl">{title}</CardTitle>
        {description ? (
          <CardDescription className="leading-6">{description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="px-6">{children}</CardContent>
      {footer ? (
        <CardFooter className="justify-center px-6 text-center text-sm text-muted-foreground">
          {footer}
        </CardFooter>
      ) : null}
    </Card>
  )
}
