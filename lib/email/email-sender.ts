import "server-only"

import { serverEnv, type Env } from "@/config/env"

import { ConsoleEmailSender } from "./console-sender"
import { ResendEmailSender } from "./resend-sender"

export type AuthEmailInput = {
  to: string
  name?: string | null
  url: string
}

export interface EmailSender {
  sendVerificationEmail(input: AuthEmailInput): Promise<void>
  sendPasswordResetEmail(input: AuthEmailInput): Promise<void>
}

export function createEmailSender(env: Env = serverEnv): EmailSender {
  if (env.EMAIL_PROVIDER === "resend") {
    return new ResendEmailSender({
      apiKey: requireEnvValue(env.RESEND_API_KEY, "RESEND_API_KEY"),
      from: requireEnvValue(env.EMAIL_FROM, "EMAIL_FROM"),
    })
  }

  if (env.APP_ENV === "production" || env.APP_ENV === "staging") {
    throw new Error(
      "Console email sender cannot be used in staging or production."
    )
  }

  return new ConsoleEmailSender({ appEnv: env.APP_ENV })
}

export const emailSender = createEmailSender()

function requireEnvValue(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`${name} is required for the Resend email sender.`)
  }

  return value
}
