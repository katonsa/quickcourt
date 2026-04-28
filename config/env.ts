import "server-only"

import { createEnv } from "./env-core"

export type { AppEnv, Env } from "./env-core"
export { createEnv, isHostedAppEnv } from "./env-core"

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
 * Server-only application env config. Importing this value validates
 * immediately, so config mistakes surface during startup/build instead of later
 * in request handling.
 */
export const serverEnv = createEnv()

export const env = serverEnv
