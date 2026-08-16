"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Search, Terminal } from "lucide-react"

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

const routeTitles: Record<string, string> = {
  "/": "Overview",
  "/subscribers": "Subscribers",
  "/templates": "Templates",
  "/comments": "Comments",
  "/settings": "Settings",
}

export function DashboardHeader() {
  const pathname = usePathname()
  const currentTitle = routeTitles[pathname] || pathname.replace("/", "").charAt(0).toUpperCase() + pathname.slice(2)

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
        <Button
          variant="outline"
          size="sm"
          className="hidden md:flex h-8 items-center gap-2 px-3 text-xs text-muted-foreground"
        >
          <Search className="size-3.5" />
          <span>Quick search...</span>
          <kbd className="pointer-events-none rounded bg-muted px-1.5 font-mono text-[10px] text-muted-foreground border">
            ⌘K
          </kbd>
        </Button>

        <Button variant="ghost" size="icon" className="relative size-8">
          <Bell className="size-4" />
          <span className="absolute right-1 top-1 flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex size-2 rounded-full bg-primary"></span>
          </span>
          <span className="sr-only">Notifications</span>
        </Button>

        <div className="hidden sm:flex items-center gap-1 border-l border-border pl-2">
          <Badge variant="secondary" className="h-6 gap-1 px-2 font-mono text-[11px]">
            <Terminal className="size-3 text-primary" />
            <span>API: online</span>
          </Badge>
        </div>

        <ModeToggle />
      </div>
    </header>
  )
}
