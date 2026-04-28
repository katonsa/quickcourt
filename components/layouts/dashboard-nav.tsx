"use client"

import Link from "next/link"
import {
  CalendarDays,
  CircleHelp,
  Home,
  Settings,
  UserRound,
} from "lucide-react"
import { usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  DASHBOARD_BOOKINGS_PATH,
  DASHBOARD_PATH,
  DASHBOARD_PROFILE_PATH,
  DASHBOARD_SETTINGS_PATH,
  DASHBOARD_SUPPORT_PATH,
} from "@/lib/auth/paths"

const dashboardNavItems = [
  { href: DASHBOARD_PATH, label: "Overview", icon: Home },
  { href: DASHBOARD_BOOKINGS_PATH, label: "Bookings", icon: CalendarDays },
  { href: DASHBOARD_PROFILE_PATH, label: "Profile", icon: UserRound },
  { href: DASHBOARD_SETTINGS_PATH, label: "Settings", icon: Settings },
  { href: DASHBOARD_SUPPORT_PATH, label: "Support", icon: CircleHelp },
] as const

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workspace</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-1">
          {dashboardNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.label}
                >
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
