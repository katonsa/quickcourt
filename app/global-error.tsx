"use client"

import type { CSSProperties } from "react"

type GlobalErrorProps = {
  error: Error & { digest?: string }
  unstable_retry: () => void
}

const mainStyles = {
  alignItems: "center",
  background: "#ffffff",
  color: "#0a0a0a",
  display: "flex",
  fontFamily:
    'Geist, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  minHeight: "100vh",
  padding: "24px",
} satisfies CSSProperties

const sectionStyles = { maxWidth: "640px" } satisfies CSSProperties

const headingStyles = {
  fontSize: "32px",
  fontWeight: 600,
  lineHeight: 1.2,
  margin: 0,
} satisfies CSSProperties

const messageStyles = {
  color: "#525252",
  fontSize: "16px",
  lineHeight: 1.6,
  margin: "16px 0 24px",
} satisfies CSSProperties

const buttonStyles = {
  background: "#171717",
  border: 0,
  borderRadius: "8px",
  color: "#ffffff",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: 500,
  minHeight: "40px",
  padding: "0 16px",
} satisfies CSSProperties

export default function GlobalError({
  unstable_retry: retryAction,
}: GlobalErrorProps) {
  return (
    <html lang="en">
      <body>
        <main style={mainStyles}>
          <section style={sectionStyles}>
            <h1 style={headingStyles}>Something went wrong</h1>
            <p style={messageStyles}>
              The application could not recover automatically. Try again, or
              return later if the problem continues.
            </p>
            <button
              type="button"
              onClick={() => retryAction()}
              style={buttonStyles}
            >
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  )
}
