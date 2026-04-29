// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const navigationMocks = vi.hoisted(() => ({
  pathname: "/dashboard",
}))

vi.mock("server-only", () => ({}))

vi.mock("next/navigation", () => ({
  usePathname: () => navigationMocks.pathname,
}))

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => false,
}))

vi.mock("@/components/auth/sign-out-button", () => ({
  SignOutButton: () => <button type="button">Sign out</button>,
}))

import { AdminShell } from "@/components/layouts/admin-shell"
import { DashboardShell } from "@/components/layouts/dashboard-shell"
import { RouteState } from "@/components/layouts/route-state"
import { VenueDashboardShell } from "@/components/layouts/venue-dashboard-shell"
import { SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  ADMIN_PATH,
  DASHBOARD_PATH,
  DASHBOARD_VENUE_PATH,
  SIGN_IN_PATH,
} from "@/lib/auth/paths"

describe("protected shell smoke states", () => {
  beforeEach(() => {
    navigationMocks.pathname = "/dashboard"
  })

  afterEach(() => {
    cleanup()
  })

  it("renders the authenticated dashboard shell with user identity and navigation", () => {
    render(
      <TooltipProvider>
        <DashboardShell
          user={{ email: "player@example.com", name: "Court Player" }}
        >
          <section>Dashboard page content</section>
        </DashboardShell>
      </TooltipProvider>
    )

    expect(screen.getAllByText("Court Player")[0]).toBeTruthy()
    expect(screen.getAllByText("player@example.com")[0]).toBeTruthy()
    expect(screen.getAllByText("QuickCourt")[0]).toBeTruthy()
    expect(getLinkByHref(DASHBOARD_PATH)).toBeTruthy()
    expect(
      screen.getByRole("link", { name: "Settings" }).getAttribute("href")
    ).toBe("/dashboard/settings")
    expect(screen.getByText("Dashboard page content")).toBeTruthy()
  })

  it("renders the admin shell as role-protected platform navigation", () => {
    navigationMocks.pathname = ADMIN_PATH

    render(
      <TooltipProvider>
        <AdminShell user={{ email: "admin@example.com", name: null }}>
          <section>Admin page content</section>
        </AdminShell>
      </TooltipProvider>
    )

    expect(screen.getAllByText("admin@example.com")[0]).toBeTruthy()
    expect(screen.getByText("Admin console")).toBeTruthy()
    expect(getLinkByHref(ADMIN_PATH)).toBeTruthy()
    expect(screen.getByText("Admin role required")).toBeTruthy()
    expect(screen.getByText("Admin page content")).toBeTruthy()
  })

  it("renders the venue dashboard shell from organization membership state", () => {
    navigationMocks.pathname = DASHBOARD_VENUE_PATH

    render(
      <TooltipProvider>
        <SidebarProvider>
          <VenueDashboardShell
            organization={{ name: "Sample Courts", slug: "sample-courts" }}
            membership={{ role: "owner" }}
            membershipsCount={2}
            venue={{ name: "Sample Courts Arena" }}
          >
            <section>Venue page content</section>
          </VenueDashboardShell>
        </SidebarProvider>
      </TooltipProvider>
    )

    expect(
      screen.getByRole("heading", { name: "Sample Courts Arena" })
    ).toBeTruthy()
    expect(screen.getByText("Owner")).toBeTruthy()
    expect(screen.getByText("sample-courts")).toBeTruthy()
    expect(screen.getByText("2 organization memberships")).toBeTruthy()
    expect(
      screen.getByRole("link", { name: "Overview" }).getAttribute("href")
    ).toBe(DASHBOARD_VENUE_PATH)
    expect(screen.getByText("Venue page content")).toBeTruthy()
  })

  it("renders route state actions for protected route failures", () => {
    render(
      <RouteState
        eyebrow="Authentication required"
        title="Sign in to continue"
        description="This area is only available after a verified session is established."
        actions={[
          { href: SIGN_IN_PATH, label: "Sign in" },
          { href: "/venues", label: "Browse venues", variant: "outline" },
        ]}
      />
    )

    expect(
      screen.getByRole("heading", { name: "Sign in to continue" })
    ).toBeTruthy()
    expect(
      screen.getByRole("link", { name: "Sign in" }).getAttribute("href")
    ).toBe(SIGN_IN_PATH)
    expect(
      screen.getByRole("link", { name: "Browse venues" }).getAttribute("href")
    ).toBe("/venues")
  })
})

function getLinkByHref(href: string): HTMLAnchorElement | undefined {
  return screen
    .getAllByRole<HTMLAnchorElement>("link")
    .find((link) => link.getAttribute("href") === href)
}
