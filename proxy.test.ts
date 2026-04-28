import { NextRequest } from "next/server"
import {
  getRedirectUrl,
  unstable_doesMiddlewareMatch as unstable_doesProxyMatch,
} from "next/experimental/testing/server"
import { describe, expect, it } from "vitest"

import {
  SIGN_IN_PATH,
  SIGN_IN_REDIRECT_PARAM,
} from "@/lib/auth/paths"
import { config, proxy } from "@/proxy"

describe("proxy optimistic auth redirect", () => {
  it("matches protected dashboard and admin paths only", () => {
    expect(unstable_doesProxyMatch({ config, url: "/dashboard" })).toBe(true)
    expect(unstable_doesProxyMatch({ config, url: "/dashboard/venue" })).toBe(true)
    expect(unstable_doesProxyMatch({ config, url: "/admin" })).toBe(true)
    expect(unstable_doesProxyMatch({ config, url: "/venues" })).toBe(false)
    expect(unstable_doesProxyMatch({ config, url: "/api/auth/get-session" })).toBe(
      false
    )
  })

  it("redirects requests without a session cookie to sign in with a return target", () => {
    const response = proxy(
      new NextRequest("http://localhost/dashboard/venue?tab=settings")
    )
    const redirectUrl = getRedirectUrl(response)

    expect(redirectUrl).not.toBeNull()

    const url = new URL(redirectUrl as string)
    expect(url.pathname).toBe(SIGN_IN_PATH)
    expect(url.searchParams.get(SIGN_IN_REDIRECT_PARAM)).toBe(
      "/dashboard/venue?tab=settings"
    )
  })

  it("continues requests with a Better Auth session cookie", () => {
    const response = proxy(
      new NextRequest("http://localhost/admin", {
        headers: {
          cookie: "better-auth.session_token=test-session",
        },
      })
    )

    expect(getRedirectUrl(response)).toBeNull()
    expect(response.headers.get("x-middleware-next")).toBe("1")
  })
})
