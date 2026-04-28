import { z } from "zod"

/**
 * Client-safe environment validation.
 *
 * Only `NEXT_PUBLIC_*` variables may be exported from this module. Next.js
 * inlines those values into the browser bundle at build time, while unprefixed
 * server variables must stay in `config/env`.
 */

const publicAppEnvSchema = z
  .enum(["development", "test", "staging", "production"])
  .optional()

const publicUrlSchema = z
  .string()
  .trim()
  .pipe(z.url({ error: "must be a valid absolute URL" }))
  .optional()

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_ENV: publicAppEnvSchema,
  NEXT_PUBLIC_APP_URL: publicUrlSchema,
})

export type PublicEnv = z.infer<typeof publicEnvSchema>

/**
 * Parse and validate browser-safe environment values.
 *
 * The optional input is primarily for unit tests and scripts that need to verify
 * public env behavior without mutating global `process.env`.
 */
export function createPublicEnv(
  input: NodeJS.ProcessEnv = process.env
): PublicEnv {
  const parsedEnv = publicEnvSchema.safeParse(input)

  if (!parsedEnv.success) {
    throw new Error(formatPublicEnvError(parsedEnv.error.issues))
  }

  return parsedEnv.data
}

/**
 * Client-safe env config. Import this from Client Components instead of
 * `config/env`.
 */
export const publicEnv = createPublicEnv()

function formatPublicEnvError(issues: z.core.$ZodIssue[]): string {
  const details = issues
    .map((issue) => {
      const path = issue.path.join(".")

      return `- ${path || "public env"}: ${issue.message}`
    })
    .join("\n")

  return `Invalid public environment configuration:\n${details}`
}
