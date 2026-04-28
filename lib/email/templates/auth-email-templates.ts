export type AuthEmailTemplate = {
  subject: string
  html: string
  text: string
}

type AuthEmailTemplateInput = {
  appName: string
  name?: string | null
  url: string
}

export function renderVerificationEmail(
  input: AuthEmailTemplateInput
): AuthEmailTemplate {
  const { appName, name, url } = input
  const greeting = buildGreeting(name)
  const ignoreMessage =
    "If you did not create this account, you can ignore this email."

  return {
    subject: `Verify your ${appName} email`,
    text: [
      greeting,
      "",
      `Verify your email address for ${appName}:`,
      url,
      "",
      ignoreMessage,
    ].join("\n"),
    html: renderLayout({
      title: `Verify your ${appName} email`,
      body: [
        greeting,
        `Verify your email address for ${appName}.`,
        ignoreMessage,
      ],
      ctaLabel: "Verify email",
      ctaUrl: url,
    }),
  }
}

export function renderPasswordResetEmail(
  input: AuthEmailTemplateInput
): AuthEmailTemplate {
  const { appName, name, url } = input
  const greeting = buildGreeting(name)
  const ignoreMessage =
    "If you did not request a password reset, you can ignore this email."

  return {
    subject: `Reset your ${appName} password`,
    text: [
      greeting,
      "",
      `Reset your ${appName} password:`,
      url,
      "",
      ignoreMessage,
    ].join("\n"),
    html: renderLayout({
      title: `Reset your ${appName} password`,
      body: [
        greeting,
        `Use the link below to reset your ${appName} password.`,
        ignoreMessage,
      ],
      ctaLabel: "Reset password",
      ctaUrl: url,
    }),
  }
}

function buildGreeting(name?: string | null): string {
  const trimmedName = name?.trim()

  if (!trimmedName) {
    return "Hi,"
  }

  return `Hi ${trimmedName},`
}

function renderLayout(input: {
  title: string
  body: string[]
  ctaLabel: string
  ctaUrl: string
}): string {
  const paragraphs = input.body
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("")

  return `<!doctype html>
<html>
  <body style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
    <h1 style="font-size: 20px; margin: 0 0 16px;">${escapeHtml(input.title)}</h1>
    ${paragraphs}
    <p>
      <a href="${escapeAttribute(input.ctaUrl)}" style="display: inline-block; padding: 10px 14px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 6px;">
        ${escapeHtml(input.ctaLabel)}
      </a>
    </p>
    <p style="font-size: 12px; color: #4b5563;">If the button does not work, paste this URL into your browser:<br>${escapeHtml(input.ctaUrl)}</p>
  </body>
</html>`
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replaceAll("`", "&#96;")
}
