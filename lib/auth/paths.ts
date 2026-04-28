export const SIGN_IN_PATH = "/sign-in"
export const SIGN_UP_PATH = "/sign-up"
export const FORBIDDEN_PATH = "/forbidden"
export const SIGN_IN_REDIRECT_PARAM = "redirectTo"

export function sanitizeSignInRedirectTo(
  redirectTo: string | string[] | undefined
): string | null {
  const value = Array.isArray(redirectTo) ? redirectTo[0] : redirectTo

  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null
  }

  try {
    const url = new URL(value, "http://quickcourt.local")

    if (url.origin !== "http://quickcourt.local") {
      return null
    }

    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return null
  }
}
