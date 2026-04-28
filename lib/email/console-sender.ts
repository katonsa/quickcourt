import "server-only"

import type { AppEnv } from "@/config/env"

import type { AuthEmailInput, EmailSender } from "./email-sender"
import {
  renderPasswordResetEmail,
  renderVerificationEmail,
} from "./templates/auth-email-templates"

type ConsoleEmailSenderOptions = {
  appEnv: AppEnv
}

export class ConsoleEmailSender implements EmailSender {
  constructor(private readonly options: ConsoleEmailSenderOptions) {}

  async sendVerificationEmail(input: AuthEmailInput): Promise<void> {
    const template = renderVerificationEmail({
      appName: "QuickCourt",
      name: input.name,
      url: input.url,
    })

    this.logDevelopmentEmail("verification", input, template.subject)
  }

  async sendPasswordResetEmail(input: AuthEmailInput): Promise<void> {
    const template = renderPasswordResetEmail({
      appName: "QuickCourt",
      name: input.name,
      url: input.url,
    })

    this.logDevelopmentEmail("password reset", input, template.subject)
  }

  private logDevelopmentEmail(
    emailType: string,
    input: AuthEmailInput,
    subject: string
  ): void {
    if (this.options.appEnv !== "development") {
      console.info(`[auth-email:${emailType}] ${subject}`)
      return
    }

    console.info(
      [
        `[auth-email:${emailType}] ${subject}`,
        `To: ${input.to}`,
        `Link: ${input.url}`,
      ].join("\n")
    )
  }
}
