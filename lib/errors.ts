import "server-only"

import { logger } from "@/lib/logger"

const DEFAULT_SAFE_ERROR_MESSAGE = "Something went wrong."

export type SafeError = {
  name: string
  message: string
  digest?: string
}

export type ErrorLogContext = Record<string, unknown>

export function normalizeError(error: unknown): SafeError {
  if (error instanceof Error) {
    return {
      name: error.name || "Error",
      message: DEFAULT_SAFE_ERROR_MESSAGE,
      digest: getErrorDigest(error),
    }
  }

  return {
    name: "UnknownError",
    message: DEFAULT_SAFE_ERROR_MESSAGE,
  }
}

export function logError(
  error: unknown,
  message = "Unhandled server error",
  context: ErrorLogContext = {}
): SafeError {
  const safeError = normalizeError(error)

  logger.error(
    {
      ...context,
      err: error,
      safeError,
    },
    message
  )

  return safeError
}

function getErrorDigest(error: Error): string | undefined {
  return "digest" in error && typeof error.digest === "string"
    ? error.digest
    : undefined
}
