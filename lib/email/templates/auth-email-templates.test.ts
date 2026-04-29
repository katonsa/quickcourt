import { describe, expect, it } from "vitest"

import {
  renderPasswordResetEmail,
  renderVerificationEmail,
} from "./auth-email-templates"

describe("auth email templates", () => {
  it("renders verification email subject, text, html, and intended URL", () => {
    const url = "https://quickcourt.test/verify-email?token=verify-token-123"
    const template = renderVerificationEmail({
      appName: "QuickCourt",
      name: "Court Player",
      url,
    })

    expect(template.subject).toBe("Verify your QuickCourt email")
    expect(template.text).toContain("Hi Court Player,")
    expect(template.text).toContain("Verify your email address for QuickCourt:")
    expect(template.text).toContain(url)
    expect(template.html).toContain("Verify your QuickCourt email")
    expect(template.html).toContain("Verify email")
    expect(template.html).toContain(`href="${url}"`)
    expect(template.subject).not.toContain("verify-token-123")
    expect(countOccurrences(template.text, "verify-token-123")).toBe(1)
    expect(countOccurrences(template.html, "verify-token-123")).toBe(2)
  })

  it("renders password reset email subject, text, html, and intended URL", () => {
    const url = "https://quickcourt.test/reset-password?token=reset-token-123"
    const template = renderPasswordResetEmail({
      appName: "QuickCourt",
      name: null,
      url,
    })

    expect(template.subject).toBe("Reset your QuickCourt password")
    expect(template.text).toContain("Hi,")
    expect(template.text).toContain("Reset your QuickCourt password:")
    expect(template.text).toContain(url)
    expect(template.html).toContain("Reset your QuickCourt password")
    expect(template.html).toContain("Reset password")
    expect(template.html).toContain(`href="${url}"`)
    expect(template.subject).not.toContain("reset-token-123")
    expect(countOccurrences(template.text, "reset-token-123")).toBe(1)
    expect(countOccurrences(template.html, "reset-token-123")).toBe(2)
  })

  it("escapes unsafe name and URL input in HTML output", () => {
    const unsafeName = `<img src=x onerror="alert('x')">`
    const unsafeUrl =
      "https://quickcourt.test/reset-password?token=reset-token&next=<script>alert(`x`)</script>"
    const template = renderPasswordResetEmail({
      appName: "QuickCourt",
      name: unsafeName,
      url: unsafeUrl,
    })

    expect(template.html).not.toContain(unsafeName)
    expect(template.html).not.toContain(unsafeUrl)
    expect(template.html).toContain(
      "Hi &lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt;,"
    )
    expect(template.html).toContain(
      "https://quickcourt.test/reset-password?token=reset-token&amp;next=&lt;script&gt;alert(&#96;x&#96;)&lt;/script&gt;"
    )
    expect(template.text).toContain(unsafeName)
    expect(template.text).toContain(unsafeUrl)
  })
})

function countOccurrences(value: string, search: string): number {
  return value.split(search).length - 1
}
