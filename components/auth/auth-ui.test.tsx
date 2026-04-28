// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { VerifyEmailNotice } from "@/components/auth/verify-email-notice"
import { SIGN_IN_PATH } from "@/lib/auth/paths"

describe("auth UI components", () => {
  afterEach(() => {
    cleanup()
  })

  it("renders the auth page shell with public navigation and child content", () => {
    render(
      <AuthPageShell>
        <h1>Sign in</h1>
      </AuthPageShell>
    )

    expect(
      screen.getByRole("link", { name: "QuickCourt" }).getAttribute("href")
    ).toBe("/")
    expect(
      screen.getByRole("link", { name: "Venues" }).getAttribute("href")
    ).toBe("/venues")
    expect(screen.getByRole("heading", { name: "Sign in" })).toBeTruthy()
  })

  it("renders the verified email notice with the canonical sign-in link", () => {
    render(<VerifyEmailNotice status="verified" hasProviderError={false} />)

    expect(screen.getByText("Email verified")).toBeTruthy()
    expect(
      screen.getByRole("link", { name: "Go to sign in" }).getAttribute("href")
    ).toBe(SIGN_IN_PATH)
  })

  it("renders an expired verification notice without exposing token details", () => {
    render(<VerifyEmailNotice hasProviderError />)

    expect(screen.getByText("Verification link expired")).toBeTruthy()
    expect(screen.queryByText(/token/i)).toBeNull()
  })
})
