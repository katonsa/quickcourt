import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { SignInForm } from "@/components/auth/sign-in-form"
import {
  SIGN_IN_REDIRECT_PARAM,
  sanitizeSignInRedirectTo,
} from "@/lib/auth/paths"

type AuthPageSearchParams = Promise<{
  [key: string]: string | string[] | undefined
}>

export default async function SignInPage({
  searchParams,
}: {
  searchParams: AuthPageSearchParams
}) {
  const params = await searchParams
  const redirectTo = sanitizeSignInRedirectTo(params[SIGN_IN_REDIRECT_PARAM])

  return (
    <AuthPageShell>
      <SignInForm redirectTo={redirectTo} />
    </AuthPageShell>
  )
}
