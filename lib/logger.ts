import "server-only"

import pino from "pino"

import { serverEnv } from "@/config/env"

const sensitiveFieldNames = [
  "password",
  "currentPassword",
  "newPassword",
  "passwordHash",
  "token",
  "accessToken",
  "refreshToken",
  "resetToken",
  "verificationToken",
  "sessionToken",
  "csrfToken",
  "secret",
  "clientSecret",
  "apiKey",
  "api_key",
  "BETTER_AUTH_SECRET",
  "RESEND_API_KEY",
  "authorization",
  "cookie",
  "email",
  "phone",
  "phoneNumber",
  "name",
  "fullName",
  "firstName",
  "lastName",
  "address",
  "street",
  "city",
  "postalCode",
  "zipCode",
  "ip",
  "ipAddress",
  "userAgent",
  "session",
  "sessionId",
  "otp",
  "otpCode",
  "twoFactorCode",
  "mfaCode",
  "cardNumber",
  "cvv",
  "cvc",
  "expiry",
  "paymentToken",
  "paymentMethod",
  "paymentMethodId",
  "xenditCallbackToken",
] as const

const sensitiveHeaderContainers = [
  "headers",
  "req.headers",
  "request.headers",
] as const

/**
 * Pino redaction is path based, so these paths cover common structured logging
 * shapes. Keep PII out of message strings because redaction cannot inspect free
 * text safely.
 */
export const loggerRedactionPaths = [
  ...buildNestedRedactionPaths(sensitiveFieldNames),
  ...buildHeaderRedactionPaths(sensitiveHeaderContainers),
]

export const loggerOptions: pino.LoggerOptions = {
  level: serverEnv.LOG_LEVEL,
  redact: {
    paths: loggerRedactionPaths,
    censor: "[Redacted]",
  },
  transport:
    serverEnv.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            ignore: "pid,hostname",
            translateTime: "SYS:standard",
          },
        }
      : undefined,
}

export const logger = pino(loggerOptions)

function buildNestedRedactionPaths(fields: readonly string[]): string[] {
  return fields.flatMap((field) => [field, `*.${field}`, `*.*.${field}`])
}

function buildHeaderRedactionPaths(containers: readonly string[]): string[] {
  return containers.flatMap((container) => [
    `${container}.authorization`,
    `${container}.cookie`,
    `${container}["set-cookie"]`,
  ])
}
