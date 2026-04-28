export const SIGN_IN_PATH = "/sign-in"
export const SIGN_UP_PATH = "/sign-up"
export const FORGOT_PASSWORD_PATH = "/forgot-password"
export const RESET_PASSWORD_PATH = "/reset-password"
export const VERIFY_EMAIL_PATH = "/verify-email"
export const DEFAULT_SIGN_IN_REDIRECT_PATH = "/dashboard"
export const FORBIDDEN_PATH = "/forbidden"
export const SIGN_IN_REDIRECT_PARAM = "redirectTo"
export const EMAIL_VERIFICATION_SENT_PATH = `${VERIFY_EMAIL_PATH}?status=sent`
export const EMAIL_VERIFICATION_CALLBACK_PATH = `${VERIFY_EMAIL_PATH}?status=verified`

const REDIRECT_SANITIZER_BASE_URL = "http://quickcourt.invalid"

export function sanitizeSignInRedirectTo(
  redirectTo: string | string[] | undefined
): string | null {
  const value = Array.isArray(redirectTo) ? redirectTo[0] : redirectTo

  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null
  }

  try {
    const url = new URL(value, REDIRECT_SANITIZER_BASE_URL)

    if (url.origin !== REDIRECT_SANITIZER_BASE_URL) {
      return null
    }

    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return null
  }
}
