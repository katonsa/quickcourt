// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const navigationMocks = vi.hoisted(() => ({
  redirect: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}))

class TestRedirectError extends Error {
  constructor(readonly path: string) {
    super(`Redirected to ${path}`)
    this.name = "TestRedirectError"
  }
}

vi.mock("server-only", () => ({}))

vi.mock("next/navigation", () => ({
  redirect: navigationMocks.redirect,
  useRouter: () => ({
    replace: navigationMocks.replace,
    refresh: navigationMocks.refresh,
  }),
}))

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    changePassword: vi.fn(),
    requestPasswordReset: vi.fn(),
    resetPassword: vi.fn(),
    signIn: {
      email: vi.fn(),
    },
    signOut: vi.fn(),
    signUp: {
      email: vi.fn(),
    },
  },
}))

import ForgotPasswordPage from "@/app/(auth)/forgot-password/page"
import LoginAliasPage from "@/app/(auth)/login/page"
import RegisterAliasPage from "@/app/(auth)/register/page"
import ResetPasswordPage from "@/app/(auth)/reset-password/page"
import SignInPage from "@/app/(auth)/sign-in/page"
import SignUpPage from "@/app/(auth)/sign-up/page"
import VerifyEmailPage from "@/app/(auth)/verify-email/page"
import {
  FORGOT_PASSWORD_PATH,
  SIGN_IN_PATH,
  SIGN_IN_REDIRECT_PARAM,
  SIGN_UP_PATH,
} from "@/lib/auth/paths"

describe("auth pages", () => {
  beforeEach(() => {
    navigationMocks.redirect.mockImplementation((path: string) => {
      throw new TestRedirectError(path)
    })
  })

  afterEach(() => {
    cleanup()
  })

  it("renders the sign-in page with canonical account links", async () => {
    render(
      await SignInPage({
        searchParams: Promise.resolve({
          [SIGN_IN_REDIRECT_PARAM]: "/dashboard/settings",
        }),
      })
    )

    expect(screen.getByText("Sign in")).toBeTruthy()
    expect(screen.getByLabelText("Email")).toBeTruthy()
    expect(screen.getByLabelText("Password")).toBeTruthy()
    expect(
      screen.getByRole("link", { name: "Forgot password?" }).getAttribute("href")
    ).toBe(FORGOT_PASSWORD_PATH)
    expect(
      screen.getByRole("link", { name: "Create an account" }).getAttribute("href")
    ).toBe(SIGN_UP_PATH)
  })

  it("renders the sign-up page as a customer account entry point", () => {
    render(<SignUpPage />)

    expect(screen.getByText("Create your account")).toBeTruthy()
    expect(screen.getByText(/Venue access is granted/)).toBeTruthy()
    expect(screen.getByLabelText("Name")).toBeTruthy()
    expect(screen.getByLabelText("Email")).toBeTruthy()
    expect(screen.getByLabelText("Password")).toBeTruthy()
    expect(screen.getByLabelText("Confirm password")).toBeTruthy()
    expect(
      screen.getByRole("link", { name: "Sign in" }).getAttribute("href")
    ).toBe(SIGN_IN_PATH)
  })

  it("renders the forgot-password page without exposing provider details", () => {
    render(<ForgotPasswordPage />)

    expect(screen.getByText("Reset your password")).toBeTruthy()
    expect(screen.getByLabelText("Email")).toBeTruthy()
    expect(
      screen.getByRole("button", { name: "Send reset link" })
    ).toBeTruthy()
    expect(
      screen.getByRole("link", { name: "Back to sign in" }).getAttribute("href")
    ).toBe(SIGN_IN_PATH)
    expect(screen.queryByText(/resend/i)).toBeNull()
  })

  it("renders a usable reset-password form when a token is present", async () => {
    render(
      await ResetPasswordPage({
        searchParams: Promise.resolve({ token: "reset-token" }),
      })
    )

    expect(screen.getByText("Set a new password")).toBeTruthy()
    expect(screen.getByLabelText("New password")).toBeTruthy()
    expect(screen.getByLabelText("Confirm new password")).toBeTruthy()
    expect(
      screen.getByRole("button", { name: "Update password" }).hasAttribute(
        "disabled"
      )
    ).toBe(false)
    expect(screen.queryByText(/reset-token/)).toBeNull()
  })

  it("renders an unusable reset-password state without exposing token details", async () => {
    render(
      await ResetPasswordPage({
        searchParams: Promise.resolve({ error: "invalid-token" }),
      })
    )

    expect(
      screen.getByText("This reset link cannot be used. Request a new link to continue.")
    ).toBeTruthy()
    expect(
      screen.getByRole("button", { name: "Update password" }).hasAttribute(
        "disabled"
      )
    ).toBe(true)
    expect(screen.queryByText(/invalid-token/)).toBeNull()
  })

  it("renders verify-email success and error states from provider params", async () => {
    const success = await VerifyEmailPage({
      searchParams: Promise.resolve({ status: "success" }),
    })
    const { unmount } = render(success)

    expect(screen.getByText("Email verified")).toBeTruthy()
    unmount()

    render(
      await VerifyEmailPage({
        searchParams: Promise.resolve({ error: "expired-token" }),
      })
    )

    expect(screen.getByText("Verification link expired")).toBeTruthy()
    expect(screen.queryByText(/expired-token/)).toBeNull()
  })

  it("redirects legacy auth aliases to canonical paths", async () => {
    expect(() => RegisterAliasPage()).toThrow(TestRedirectError)
    expect(navigationMocks.redirect).toHaveBeenLastCalledWith(SIGN_UP_PATH)

    await expect(
      LoginAliasPage({
        searchParams: Promise.resolve({
          [SIGN_IN_REDIRECT_PARAM]: "/dashboard/venue?tab=settings",
        }),
      })
    ).rejects.toMatchObject({
      path: `${SIGN_IN_PATH}?${SIGN_IN_REDIRECT_PARAM}=%2Fdashboard%2Fvenue%3Ftab%3Dsettings`,
    })

    await expect(
      LoginAliasPage({
        searchParams: Promise.resolve({
          [SIGN_IN_REDIRECT_PARAM]: "https://evil.example/dashboard",
        }),
      })
    ).rejects.toMatchObject({ path: SIGN_IN_PATH })
  })
})
