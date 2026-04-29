import { expect, test } from "@playwright/test"

test.describe("public auth routes", () => {
  test("redirects the legacy register alias to sign up", async ({ page }) => {
    await page.goto("/register")

    await expect(page).toHaveURL(/\/sign-up$/)
    await expect(page.getByText("Create your account")).toBeVisible()
  })

  test("redirects the legacy login alias with a safe return target", async ({
    page,
  }) => {
    await page.goto("/login?redirectTo=/dashboard/venue?tab=settings")

    await expect(page).toHaveURL(/\/sign-in\?/)

    const url = new URL(page.url())
    expect(url.pathname).toBe("/sign-in")
    expect(url.searchParams.get("redirectTo")).toBe(
      "/dashboard/venue?tab=settings"
    )
  })

  test("sanitizes an external login alias return target", async ({ page }) => {
    await page.goto("/login?redirectTo=https://evil.example/dashboard")

    await expect(page).toHaveURL(/\/sign-in$/)

    const url = new URL(page.url())
    expect(url.searchParams.has("redirectTo")).toBe(false)
  })

  test("renders a usable reset password form when a token is present", async ({
    page,
  }) => {
    await page.goto("/reset-password?token=fake-token")

    await expect(page.getByText("Set a new password")).toBeVisible()
    await expect(page.getByLabel("New password", { exact: true })).toBeEnabled()
    await expect(page.getByLabel("Confirm new password")).toBeEnabled()
    await expect(
      page.getByRole("button", { name: "Update password" })
    ).toBeEnabled()
    await expect(page.getByText("fake-token", { exact: true })).toHaveCount(0)
  })

  test("renders an unusable reset password state without a token", async ({
    page,
  }) => {
    await page.goto("/reset-password")

    await expect(page.getByText("Set a new password")).toBeVisible()
    await expect(
      page.getByText(
        "This reset link cannot be used. Request a new link to continue."
      )
    ).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Update password" })
    ).toBeDisabled()
  })

  test("renders an unusable reset password state from a provider error", async ({
    page,
  }) => {
    await page.goto("/reset-password?error=invalid-token")

    await expect(page.getByText("Set a new password")).toBeVisible()
    await expect(
      page.getByText(
        "This reset link cannot be used. Request a new link to continue."
      )
    ).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Update password" })
    ).toBeDisabled()
    await expect(page.getByText("invalid-token", { exact: true })).toHaveCount(
      0
    )
  })

  test("renders verify email success state from provider status", async ({
    page,
  }) => {
    await page.goto("/verify-email?status=success")

    await expect(page.getByText("Email verified")).toBeVisible()
    await expect(page.getByText("expired-token", { exact: true })).toHaveCount(
      0
    )
  })

  test("renders verify email error state from provider error", async ({
    page,
  }) => {
    await page.goto("/verify-email?error=expired-token")

    await expect(page.getByText("Verification link expired")).toBeVisible()
    await expect(page.getByText("expired-token", { exact: true })).toHaveCount(
      0
    )
  })
})
