export function getGenericSignInErrorMessage(error: unknown) {
  if (hasErrorCode(error, "EMAIL_NOT_VERIFIED")) {
    return "Verify your email before signing in. If the account exists, a fresh verification email has been sent."
  }

  return "We could not sign you in with those details. Check your email and password, then try again."
}

export function getGenericSignUpErrorMessage() {
  return "We could not create the account. Check the details and try again."
}

export function getGenericPasswordResetRequestErrorMessage() {
  return "We could not process that request right now. Try again in a moment."
}

export function getGenericPasswordResetErrorMessage() {
  return "We could not update the password with this reset link. Request a new link and try again."
}

export function getGenericChangePasswordErrorMessage() {
  return "We could not update your password. Check your current password and try again."
}

function hasErrorCode(error: unknown, code: string) {
  if (!error || typeof error !== "object") {
    return false
  }

  return "code" in error && error.code === code
}
