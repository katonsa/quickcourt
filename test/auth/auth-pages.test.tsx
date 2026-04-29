// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

const navigationMocks = vi.hoisted(() => ({
  replace: vi.fn(),
  refresh: vi.fn(),
}))

vi.mock("server-only", () => ({}))

vi.mock("next/navigation", () => ({
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
import SignInPage from "@/app/(auth)/sign-in/page"
import SignUpPage from "@/app/(auth)/sign-up/page"
import {
  FORGOT_PASSWORD_PATH,
  SIGN_IN_PATH,
  SIGN_IN_REDIRECT_PARAM,
  SIGN_UP_PATH,
} from "@/lib/auth/paths"

describe("auth pages", () => {
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
})
