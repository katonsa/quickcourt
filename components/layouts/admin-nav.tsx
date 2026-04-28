"use client"

import Link from "next/link"
import {
  Building2,
  ClipboardList,
  Settings,
  ShieldCheck,
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
import { ADMIN_PATH } from "@/lib/auth/paths"

const adminNavItems = [
  { href: ADMIN_PATH, label: "Overview", icon: ShieldCheck },
] as const

const futureAdminNavItems = [
  { label: "Venues", icon: Building2 },
  { label: "Users", icon: UsersRound },
  { label: "Audit", icon: ClipboardList },
  { label: "Settings", icon: Settings },
] as const

export function AdminNav() {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Admin</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-1">
          {adminNavItems.map((item) => {
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

          {futureAdminNavItems.map((item) => {
            const Icon = item.icon

            return (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  disabled
                  aria-disabled="true"
                  tooltip={item.label}
                >
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
