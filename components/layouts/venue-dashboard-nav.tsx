"use client"

import Link from "next/link"
import {
  Banknote,
  Building2,
  CalendarDays,
  Settings,
  UsersRound,
} from "lucide-react"
import { usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { DASHBOARD_VENUE_PATH } from "@/lib/auth/paths"

const venueNavItems = [
  { href: DASHBOARD_VENUE_PATH, label: "Overview", icon: Building2 },
] as const

const futureVenueNavItems = [
  { label: "Bookings", icon: CalendarDays },
  { label: "Staff", icon: UsersRound },
  { label: "Finance", icon: Banknote },
  { label: "Settings", icon: Settings },
] as const

export function VenueDashboardNav() {
  const pathname = usePathname()

  return (
    <SidebarGroup className="p-0">
      <SidebarGroupLabel>Venue workspace</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-1">
          {venueNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive}>
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

          {futureVenueNavItems.map((item) => {
            const Icon = item.icon

            return (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton disabled aria-disabled="true">
                  <Icon aria-hidden="true" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
                <SidebarMenuBadge>Later</SidebarMenuBadge>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
