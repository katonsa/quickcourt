import { getSessionCookie } from "better-auth/cookies"
import { NextResponse, type NextRequest } from "next/server"

import { SIGN_IN_PATH, SIGN_IN_REDIRECT_PARAM } from "@/lib/auth/paths"

export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) {
    return NextResponse.next()
  }

  const signInUrl = new URL(SIGN_IN_PATH, request.url)
  signInUrl.searchParams.set(
    SIGN_IN_REDIRECT_PARAM,
    `${request.nextUrl.pathname}${request.nextUrl.search}`
  )

  return NextResponse.redirect(signInUrl)
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
}
