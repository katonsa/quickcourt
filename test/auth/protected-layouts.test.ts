import { beforeEach, describe, expect, it, vi } from "vitest"

const guardMocks = vi.hoisted(() => ({
  requireAdminForRoute: vi.fn(),
  requireAnyOrganizationMemberForRoute: vi.fn(),
  requireUserForRoute: vi.fn(),
}))

vi.mock("server-only", () => ({}))

vi.mock("@/lib/auth/guards", () => guardMocks)

import AdminGroupLayout from "@/app/(admin)/layout"
import DashboardGroupLayout from "@/app/(dashboard)/layout"
import VenueDashboardLayout from "@/app/(dashboard)/dashboard/venue/layout"

describe("protected route layouts", () => {
  beforeEach(() => {
    guardMocks.requireAdminForRoute.mockReset()
    guardMocks.requireAnyOrganizationMemberForRoute.mockReset()
    guardMocks.requireUserForRoute.mockReset()
  })

  it("guards the dashboard route group with authenticated user access", async () => {
    const children = "dashboard"
    guardMocks.requireUserForRoute.mockResolvedValue({
      email: "user@example.com",
    })

    const result = await DashboardGroupLayout({ children })

    expect(result.props.children).toContain(children)
    expect(guardMocks.requireUserForRoute).toHaveBeenCalledTimes(1)
  })

  it("guards the admin route group with admin access", async () => {
    const children = "admin"
    guardMocks.requireAdminForRoute.mockResolvedValue({
      user: {
        email: "admin@example.com",
        name: "Admin User",
      },
    })

    const result = await AdminGroupLayout({ children })

    expect(result.props.children).toBe(children)
    expect(guardMocks.requireAdminForRoute).toHaveBeenCalledTimes(1)
  })

  it("guards the venue dashboard route with organization membership access", async () => {
    const children = "venue"
    guardMocks.requireAnyOrganizationMemberForRoute.mockResolvedValue({
      membership: {
        role: "owner",
        organization: {
          name: "Sample Courts",
          slug: "sample-courts",
          venue: {
            name: "Sample Courts Arena",
          },
        },
      },
      memberships: [
        {
          id: "membership-1",
        },
      ],
    })

    const result = await VenueDashboardLayout({ children })

    expect(result.props.children).toBe(children)
    expect(
      guardMocks.requireAnyOrganizationMemberForRoute
    ).toHaveBeenCalledTimes(1)
  })
})
