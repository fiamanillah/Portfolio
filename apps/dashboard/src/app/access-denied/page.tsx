"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ShieldAlert,
  LogOut,
  ExternalLink,
  RefreshCw,
  Lock,
  UserCheck,
  ArrowLeft,
  Sparkles,
} from "lucide-react"

import { useAuth } from "@/providers/auth-provider"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { toast } from "@workspace/ui/components/sonner"

export default function AccessDeniedPage() {
  const router = useRouter()
  const { user, isAdmin, logout, refreshUser, isLoading } = useAuth()
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  // If role got promoted to ADMIN, automatically allow into dashboard
  React.useEffect(() => {
    if (!isLoading && isAdmin) {
      toast.success("Admin Access Granted", {
        description:
          "Your administrator role has been verified. Redirecting...",
      })
      router.replace("/")
    }
  }, [isLoading, isAdmin, router])

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true)
      const updated = await refreshUser()
      if (updated?.role === "ADMIN") {
        toast.success("Privilege upgraded! Welcome to Admin Console.")
        router.replace("/")
      } else {
        toast.info("Role check complete", {
          description: `Current account role is still "${updated?.role || "USER"}".`,
        })
      }
    } catch {
      toast.error("Failed to re-validate session.")
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-500/15 blur-[120px]" />
      <div className="pointer-events-none absolute right-1/4 bottom-0 -z-10 h-80 w-80 rounded-full bg-destructive/10 blur-[100px]" />

      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex aspect-square size-14 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 font-bold text-amber-500 shadow-lg ring-8 ring-amber-500/10">
            <ShieldAlert className="size-7" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">
              Access Restricted
            </h1>
            <p className="mx-auto max-w-xs text-xs text-muted-foreground">
              Administrator privileges are required to access this dashboard.
            </p>
          </div>
        </div>

        <Card className="border-border/80 bg-card/80 shadow-2xl backdrop-blur-xl">
          <CardHeader className="pb-3 text-center">
            <CardTitle className="text-base font-semibold">
              Current Session Profile
            </CardTitle>
            <CardDescription className="text-xs">
              You are currently authenticated, but your account lacks Super
              Admin clearance.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* User Profile Summary */}
            <div className="flex items-center gap-3 rounded-xl border border-border/80 bg-muted/30 p-3.5">
              <Avatar className="h-11 w-11 rounded-lg border border-border">
                <AvatarImage
                  src={user?.avatar || undefined}
                  alt={user?.name || "User"}
                />
                <AvatarFallback className="rounded-lg font-bold">
                  {user?.name?.slice(0, 2).toUpperCase() || "US"}
                </AvatarFallback>
              </Avatar>

              <div className="grid flex-1 text-left text-xs leading-tight">
                <div className="flex items-center justify-between">
                  <span className="truncate text-sm font-semibold">
                    {user?.name || "Authenticated User"}
                  </span>
                  <Badge
                    variant="secondary"
                    className="font-mono text-[10px] uppercase"
                  >
                    {user?.role || "GUEST"}
                  </Badge>
                </div>
                <span className="truncate text-muted-foreground">
                  {user?.email || "Unknown email"}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 font-medium text-amber-500 text-foreground">
                <Lock className="size-3.5" />
                <span>Why am I seeing this?</span>
              </div>
              <p className="leading-relaxed">
                This administrative console is reserved for Super Administrators
                to manage database records, email templates, subscribers, and
                system telemetry.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 border-t border-border/50 pt-2 pt-4 pb-5">
            <Button
              variant="default"
              className="w-full gap-2 text-xs"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Re-verify Role Privileges
            </Button>

            <Button
              variant="outline"
              className="w-full gap-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => logout()}
            >
              <LogOut className="size-3.5" />
              Sign Out & Switch to Admin Account
            </Button>

            <Button
              variant="ghost"
              className="w-full gap-2 text-xs text-muted-foreground"
              asChild
            >
              <a href="http://localhost:4321" target="_blank" rel="noreferrer">
                <ExternalLink className="size-3.5" />
                Return to Live Portfolio Site
              </a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
