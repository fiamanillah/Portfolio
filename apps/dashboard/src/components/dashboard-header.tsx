"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Search, Terminal, Shield } from "lucide-react"

import { SidebarTrigger } from "@workspace/ui/components/sidebar"
import { Separator } from "@workspace/ui/components/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { ModeToggle } from "@workspace/ui/components/ModeToggle"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { useAuth } from "@/providers/auth-provider"

const routeTitles: Record<string, string> = {
  "/": "Overview",
  "/users": "Users & Roles",
  "/subscribers": "Subscribers",
  "/templates": "Templates",
  "/comments": "Comments",
  "/settings": "Settings",
}

export function DashboardHeader() {
  const pathname = usePathname()
  const { user } = useAuth()
  const currentTitle =
    routeTitles[pathname] ||
    pathname.replace("/", "").charAt(0).toUpperCase() + pathname.slice(2)

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md transition-all">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:inline-flex">
              <BreadcrumbLink asChild>
                <Link href="/">Admin</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {pathname !== "/" && (
              <>
                <BreadcrumbSeparator className="hidden md:inline-flex" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{currentTitle}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
            {pathname === "/" && (
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary lg:flex">
          <Shield className="size-3" />
          <span>Super Admin: {user?.name || "Fi Amanillah"}</span>
        </div>

        <div className="hidden items-center gap-1 border-l border-border pl-2 sm:flex">
          <Badge
            variant="secondary"
            className="h-6 gap-1 px-2 font-mono text-[11px]"
          >
            <Terminal className="size-3 text-primary" />
            <span>API: online</span>
          </Badge>
        </div>

        <ModeToggle />
      </div>
    </header>
  )
}
