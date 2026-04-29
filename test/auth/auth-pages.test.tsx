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

    expect(screen.getByText("Sign in")).toBeVisible()
    expect(screen.getByLabelText("Email")).toBeVisible()
    expect(screen.getByLabelText("Password")).toBeVisible()
    expect(
      screen.getByRole("link", { name: "Forgot password?" })
    ).toHaveAttribute("href", FORGOT_PASSWORD_PATH)
    expect(
      screen.getByRole("link", { name: "Create an account" })
    ).toHaveAttribute("href", SIGN_UP_PATH)
  })

  it("renders the sign-up page as a customer account entry point", () => {
    render(<SignUpPage />)

    expect(screen.getByText("Create your account")).toBeVisible()
    expect(screen.getByText(/Venue access is granted/)).toBeVisible()
    expect(screen.getByLabelText("Name")).toBeVisible()
    expect(screen.getByLabelText("Email")).toBeVisible()
    expect(screen.getByLabelText("Password")).toBeVisible()
    expect(screen.getByLabelText("Confirm password")).toBeVisible()
    expect(
      screen.getByRole("link", { name: "Sign in" })
    ).toHaveAttribute("href", SIGN_IN_PATH)
  })

  it("renders the forgot-password page without exposing provider details", () => {
    render(<ForgotPasswordPage />)

    expect(screen.getByText("Reset your password")).toBeVisible()
    expect(screen.getByLabelText("Email")).toBeVisible()
    expect(
      screen.getByRole("button", { name: "Send reset link" })
    ).toBeEnabled()
    expect(
      screen.getByRole("link", { name: "Back to sign in" })
    ).toHaveAttribute("href", SIGN_IN_PATH)
    expect(screen.queryByText(/resend/i)).not.toBeInTheDocument()
  })

  it("renders a usable reset-password form when a token is present", async () => {
    render(
      await ResetPasswordPage({
        searchParams: Promise.resolve({ token: "reset-token" }),
      })
    )

    expect(screen.getByText("Set a new password")).toBeVisible()
    expect(screen.getByLabelText("New password")).toBeVisible()
    expect(screen.getByLabelText("Confirm new password")).toBeVisible()
    expect(
      screen.getByRole("button", { name: "Update password" })
    ).toBeEnabled()
    expect(screen.queryByText(/reset-token/)).not.toBeInTheDocument()
  })

  it("renders an unusable reset-password state without exposing token details", async () => {
    render(
      await ResetPasswordPage({
        searchParams: Promise.resolve({ error: "invalid-token" }),
      })
    )

    expect(
      screen.getByText("This reset link cannot be used. Request a new link to continue.")
    ).toBeVisible()
    expect(
      screen.getByRole("button", { name: "Update password" })
    ).toBeDisabled()
    expect(screen.queryByText(/invalid-token/)).not.toBeInTheDocument()
  })

  it("renders verify-email success and error states from provider params", async () => {
    const success = await VerifyEmailPage({
      searchParams: Promise.resolve({ status: "success" }),
    })
    const { unmount } = render(success)

    expect(screen.getByText("Email verified")).toBeVisible()
    unmount()

    render(
      await VerifyEmailPage({
        searchParams: Promise.resolve({ error: "expired-token" }),
      })
    )

    expect(screen.getByText("Verification link expired")).toBeVisible()
    expect(screen.queryByText(/expired-token/)).not.toBeInTheDocument()
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
