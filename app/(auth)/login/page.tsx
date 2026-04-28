import { redirect } from "next/navigation"

import {
  SIGN_IN_PATH,
  SIGN_IN_REDIRECT_PARAM,
  sanitizeSignInRedirectTo,
} from "@/lib/auth/paths"

type AuthPageSearchParams = Promise<{
  [key: string]: string | string[] | undefined
}>

export default async function LoginAliasPage({
  searchParams,
}: {
  searchParams: AuthPageSearchParams
}) {
  const params = await searchParams
  const redirectTo = sanitizeSignInRedirectTo(params[SIGN_IN_REDIRECT_PARAM])

  if (!redirectTo) {
    redirect(SIGN_IN_PATH)
  }

  const signInUrl = new URL(SIGN_IN_PATH, "http://quickcourt.local")
  signInUrl.searchParams.set(SIGN_IN_REDIRECT_PARAM, redirectTo)

  redirect(`${signInUrl.pathname}${signInUrl.search}`)
}
