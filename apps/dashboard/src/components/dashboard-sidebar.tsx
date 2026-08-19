"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Mail,
  LayoutDashboard,
  Users,
  UserCheck,
  FileCode2,
  Images,
  MessageSquareQuote,
  Settings,
  Sparkles,
  Command,
  ChevronsUpDown,
  LogOut,
  User,
  ShieldAlert,
  Shield,
  ExternalLink,
  Layers,
  Briefcase,
  FileText,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@workspace/ui/components/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { useAuth } from "@/providers/auth-provider"

interface NavItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: "Main",
    items: [
      {
        title: "Overview",
        url: "/",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Content",
    items: [
      {
        title: "Case Studies",
        url: "/case-studies",
        icon: Layers,
      },
      {
        title: "Professional History",
        url: "/experiences",
        icon: Briefcase,
      },
      {
        title: "Resume / CV",
        url: "/resume",
        icon: FileText,
      },
      {
        title: "Blog Posts",
        url: "/blogs",
        icon: FileCode2,
      },
      {
        title: "Media Library",
        url: "/media",
        icon: Images,
      },
    ],
  },
  {
    label: "Audience & Access",
    items: [
       {
        title: "Newsletters",
        url: "/newsletters",
        icon: Mail,
      },
      {
        title: "Subscribers",
        url: "/subscribers",
        icon: Users,
      },
      {
        title: "Users & RBAC",
        url: "/users",
        icon: UserCheck,
        badge: "Admin",
      },
      {
        title: "Comments",
        url: "/comments",
        icon: MessageSquareQuote,
      },
    ],
  },
  {
    label: "Resources",
    items: [
      {
        title: "Templates",
        url: "/templates",
        icon: Sparkles,
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
      },
    ],
  },
]

export function DashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const adminName = user?.name || "Super Admin"
  const adminEmail = user?.email || "admin@amanillah.dev"
  const adminInitials = adminName.slice(0, 2).toUpperCase()

  return (
    <Sidebar collapsible="icon" className="border-r border-border" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" className="flex items-center gap-3">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground shadow-xs">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <span>Portfolio</span>
                    <Badge
                      variant="outline"
                      className="h-4 border-primary/30 px-1 font-mono text-[10px] text-primary"
                    >
                      v2.0
                    </Badge>
                  </div>
                  <span className="truncate text-xs text-muted-foreground">
                    Admin Console
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    item.url === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.url)

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                      >
                        <Link
                          href={item.url}
                          className="flex items-center gap-2"
                        >
                          <item.icon className="size-4 shrink-0" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                      {item.badge && (
                        <SidebarMenuBadge className="font-mono text-[10px]">
                          {item.badge}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg border border-border">
                    <AvatarImage
                      src={user?.avatar || undefined}
                      alt={adminName}
                    />
                    <AvatarFallback className="rounded-lg font-medium">
                      {adminInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <div className="flex items-center gap-1">
                      <span className="truncate text-xs font-semibold">
                        {adminName}
                      </span>
                      <Badge
                        variant="default"
                        className="h-3.5 px-1 font-mono text-[9px]"
                      >
                        ADMIN
                      </Badge>
                    </div>
                    <span className="truncate text-[11px] text-muted-foreground">
                      {adminEmail}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg border border-border">
                      <AvatarImage
                        src={user?.avatar || undefined}
                        alt={adminName}
                      />
                      <AvatarFallback className="rounded-lg font-medium">
                        {adminInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-xs leading-tight">
                      <span className="truncate font-semibold">
                        {adminName}
                      </span>
                      <span className="truncate text-[11px] text-muted-foreground">
                        {adminEmail}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/users"
                      className="flex items-center gap-2 text-xs"
                    >
                      <Shield className="size-3.5 text-primary" />
                      Users & Role Control
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 text-xs"
                    >
                      <User className="size-3.5" />
                      Admin Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a
                      href="http://localhost:4321"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-xs"
                    >
                      <ExternalLink className="size-3.5" />
                      Live Portfolio
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="cursor-pointer text-xs text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut className="mr-2 size-3.5" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
