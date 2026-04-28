import "server-only"

import { Resend } from "resend"

import { logger } from "@/lib/logger"

import type { AuthEmailInput, EmailSender } from "./email-sender"
import {
  renderPasswordResetEmail,
  renderVerificationEmail,
} from "./templates/auth-email-templates"

type ResendEmailSenderOptions = {
  apiKey: string
  from: string
}

export class ResendEmailSender implements EmailSender {
  private readonly resend: Resend

  constructor(private readonly options: ResendEmailSenderOptions) {
    this.resend = new Resend(options.apiKey)
  }

  async sendVerificationEmail(input: AuthEmailInput): Promise<void> {
    const template = renderVerificationEmail({
      appName: "QuickCourt",
      name: input.name,
      url: input.url,
    })

    await this.send("verification", input.to, template)
  }

  async sendPasswordResetEmail(input: AuthEmailInput): Promise<void> {
    const template = renderPasswordResetEmail({
      appName: "QuickCourt",
      name: input.name,
      url: input.url,
    })

    await this.send("password-reset", input.to, template)
  }

  private async send(
    emailType: string,
    to: string,
    template: {
      subject: string
      html: string
      text: string
    }
  ): Promise<void> {
    const response = await this.resend.emails.send({
      from: this.options.from,
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })

    if (response.error) {
      logger.error(
        {
          emailType,
          resendErrorName: response.error.name,
          resendStatusCode: response.error.statusCode,
        },
        "Resend auth email send failed"
      )

      throw new Error(`Resend failed to send ${emailType} email.`)
    }

    logger.info({ emailType }, "Auth email sent through Resend")
  }
}
