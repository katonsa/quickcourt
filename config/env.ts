import "server-only"

import { z } from "zod"

/**
 * Centralized runtime environment validation for server-side code.
 *
 * Next.js loads `.env*` files into `process.env` before app code runs. This
 * module validates those raw string values at the import boundary and returns a
 * typed config object for the rest of the application.
 *
 * This file is marked with `server-only`, so importing it from a Client
 * Component fails at build time. Use `config/public-env` for browser-safe env.
 */

/**
 * `NODE_ENV` is controlled by the framework/tooling and only supports
 * development, test, and production. `APP_ENV` is our deployment stage so we can
 * distinguish staging from production while still running Next in production
 * mode.
 */
const appEnvValues = ["development", "test", "staging", "production"] as const

const nodeEnvSchema = z
  .enum(["development", "test", "production"])
  .default("development")

const appEnvSchema = z.enum(appEnvValues)

type NodeEnv = "development" | "test" | "production"
type EmailProvider = "console" | "resend"

const logLevelSchema = z
  .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
  .default("info")

const urlSchema = z
  .string()
  .trim()
  .pipe(z.url({ error: "must be a valid absolute URL" }))

const databaseUrlSchema = z
  .string()
  .trim()
  .min(1, "is required")
  .refine(isPostgresUrl, "must be a PostgreSQL connection URL")

const optionalDatabaseUrlSchema = databaseUrlSchema
  .optional()
  .or(z.literal("").transform(() => undefined))

const optionalNonEmptyString = z
  .string()
  .trim()
  .min(1)
  .optional()
  .or(z.literal("").transform(() => undefined))

/**
 * `process.env` includes many platform-provided variables. `looseObject` keeps
 * validation focused on the variables QuickCourt owns while allowing unrelated
 * host/runtime variables to pass through.
 */
const rawEnvSchema = z
  .looseObject({
    NODE_ENV: nodeEnvSchema,
    APP_ENV: appEnvSchema.optional(),
    APP_URL: urlSchema,
    LOG_LEVEL: logLevelSchema,
    DATABASE_URL: databaseUrlSchema,
    DATABASE_URL_TEST: optionalDatabaseUrlSchema,
    BETTER_AUTH_SECRET: z
      .string()
      .trim()
      .min(32, "must be at least 32 characters"),
    BETTER_AUTH_URL: urlSchema,
    EMAIL_PROVIDER: z.enum(["console", "resend"]).optional(),
    EMAIL_FROM: optionalNonEmptyString,
    RESEND_API_KEY: optionalNonEmptyString,
  })
  .superRefine((input, context) => {
    const appEnv = resolveAppEnv(input.NODE_ENV, input.APP_ENV)
    const emailProvider = resolveEmailProvider(input.EMAIL_PROVIDER, input)

    if (
      input.DATABASE_URL_TEST &&
      input.DATABASE_URL_TEST === input.DATABASE_URL
    ) {
      context.addIssue({
        code: "custom",
        path: ["DATABASE_URL_TEST"],
        message: "must not be the same database as DATABASE_URL",
      })
    }

    if (!requiresResendConfig(appEnv, emailProvider)) {
      return
    }

    if (!input.RESEND_API_KEY) {
      context.addIssue({
        code: "custom",
        path: ["RESEND_API_KEY"],
        message:
          "is required when APP_ENV is staging/production or EMAIL_PROVIDER is resend",
      })
    }

    if (!input.EMAIL_FROM) {
      context.addIssue({
        code: "custom",
        path: ["EMAIL_FROM"],
        message:
          "is required when APP_ENV is staging/production or EMAIL_PROVIDER is resend",
      })
    }
  })
  .transform((input) => {
    const appEnv = resolveAppEnv(input.NODE_ENV, input.APP_ENV)
    const emailProvider = resolveEmailProvider(input.EMAIL_PROVIDER, input)

    return {
      APP_ENV: appEnv,
      NODE_ENV: input.NODE_ENV,
      APP_URL: input.APP_URL,
      LOG_LEVEL: input.LOG_LEVEL,
      DATABASE_URL: input.DATABASE_URL,
      DATABASE_URL_TEST: input.DATABASE_URL_TEST,
      BETTER_AUTH_SECRET: input.BETTER_AUTH_SECRET,
      BETTER_AUTH_URL: input.BETTER_AUTH_URL,
      EMAIL_PROVIDER: emailProvider,
      EMAIL_FROM: input.EMAIL_FROM,
      RESEND_API_KEY: input.RESEND_API_KEY,
    }
  })

export type AppEnv = (typeof appEnvValues)[number]
export type Env = z.infer<typeof rawEnvSchema>

/**
 * Parse and validate an environment object.
 *
 * The optional input is primarily for unit tests and scripts that need to verify
 * environment behavior without mutating global `process.env`.
 */
export function createEnv(input: NodeJS.ProcessEnv = process.env): Env {
  const parsedEnv = rawEnvSchema.safeParse(input)

  if (!parsedEnv.success) {
    throw new Error(formatEnvError(parsedEnv.error.issues))
  }

  return parsedEnv.data
}

/**
 * Server-only application env config. Importing this value validates
 * immediately, so config mistakes surface during startup/build instead of later
 * in request handling.
 */
export const serverEnv = createEnv()

export const env = serverEnv

function resolveAppEnv(nodeEnv: NodeEnv, appEnv?: AppEnv): AppEnv {
  if (appEnv) {
    return appEnv
  }

  if (nodeEnv === "test") {
    return "test"
  }

  if (nodeEnv === "production") {
    return "production"
  }

  return "development"
}

function resolveEmailProvider(
  emailProvider: EmailProvider | undefined,
  input: {
    APP_ENV?: AppEnv
    NODE_ENV: NodeEnv
    EMAIL_FROM?: string
    RESEND_API_KEY?: string
  }
): EmailProvider {
  if (emailProvider) {
    return emailProvider
  }

  const appEnv = resolveAppEnv(input.NODE_ENV, input.APP_ENV)

  if (isHostedAppEnv(appEnv)) {
    return "resend"
  }

  if (input.EMAIL_FROM && input.RESEND_API_KEY) {
    return "resend"
  }

  return "console"
}

/**
 * Local development and tests can use console email fallback. Staging and
 * production must fail fast if Resend is selected implicitly or explicitly but
 * the required sending configuration is missing.
 */
function requiresResendConfig(
  appEnv: AppEnv,
  emailProvider: EmailProvider
): boolean {
  return isHostedAppEnv(appEnv) || emailProvider === "resend"
}

function isHostedAppEnv(appEnv: AppEnv): boolean {
  return appEnv === "production" || appEnv === "staging"
}

function isPostgresUrl(value: string): boolean {
  try {
    const url = new URL(value)

    return url.protocol === "postgresql:" || url.protocol === "postgres:"
  } catch {
    return false
  }
}

function formatEnvError(issues: z.core.$ZodIssue[]): string {
  const details = issues
    .map((issue) => {
      const path = issue.path.join(".")

      return `- ${path || "env"}: ${issue.message}`
    })
    .join("\n")

  return `Invalid environment configuration:\n${details}`
}
