import Link from "next/link"
import * as React from "react"

import { SignOutButton } from "@/components/auth/sign-out-button"
import { DashboardNav } from "@/components/layouts/dashboard-nav"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { DASHBOARD_PATH } from "@/lib/auth/paths"

type DashboardShellUser = {
  email: string
  name?: string | null
}

type DashboardShellProps = {
  user: DashboardShellUser
  children: React.ReactNode
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const displayName = user.name?.trim() || user.email

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="lg" tooltip="QuickCourt">
                <Link href={DASHBOARD_PATH}>
                  <span className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
                    QC
                  </span>
                  <span className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">QuickCourt</span>
                    <span className="truncate text-xs text-sidebar-foreground/70">
                      Dashboard
                    </span>
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <DashboardNav />
        </SidebarContent>
        <SidebarFooter>
          <div className="min-w-0 px-2 py-1">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {displayName}
            </p>
            <p className="truncate text-xs text-sidebar-foreground/70">
              {user.email}
            </p>
          </div>
          <SignOutButton
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4">
          <SidebarTrigger />
          <div className="min-w-0">
            <Link
              href={DASHBOARD_PATH}
              className="text-sm font-medium text-foreground"
            >
              QuickCourt
            </Link>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
