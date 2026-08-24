"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Command,
  AlertCircle,
  ExternalLink,
  Loader2,
  KeyRound,
} from "lucide-react"

import { useAuth } from "@/providers/auth-provider"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
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
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert"

const PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://fi.amanillah.com"

function AdminLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get("redirect") || "/"

  const {
    login,
    isAuthenticated,
    isAdmin,
    isLoading: isAuthChecking,
  } = useAuth()

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  // If already authenticated as ADMIN, redirect to dashboard immediately
  React.useEffect(() => {
    if (!isAuthChecking && isAuthenticated && isAdmin) {
      router.replace(redirectPath)
    }
  }, [isAuthChecking, isAuthenticated, isAdmin, router, redirectPath])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both email address and password.")
      return
    }

    try {
      setIsSubmitting(true)
      const res = await login({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      })

      if (!res.success) {
        setErrorMessage(
          res.error || "Authentication failed. Check your credentials."
        )
      } else {
        // If login succeeded, redirect to requested path
        router.replace(redirectPath)
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message || "An error occurred while communicating with the server."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Dynamic Ambient Background Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 -z-10 h-80 w-80 rounded-full bg-primary/10 blur-[100px]" />
      <div className="pointer-events-none absolute top-1/3 -right-20 -z-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-[100px]" />

      {/* Grid Pattern Overlay */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] bg-[size:4rem_4rem] opacity-25" />

      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex aspect-square size-12 items-center justify-center rounded-2xl bg-primary font-bold text-primary-foreground shadow-lg ring-8 shadow-primary/25 ring-primary/10">
            <Command className="size-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                Admin Gateway
              </h1>
              <Badge
                variant="outline"
                className="border-primary/30 font-mono text-[10px] tracking-wider text-primary uppercase"
              >
                Super Access
              </Badge>
            </div>
            <p className="mx-auto max-w-xs text-xs text-muted-foreground">
              Sign in with your Super Administrator credentials to manage the
              portfolio platform.
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-border/80 bg-card/80 shadow-2xl backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="flex items-center justify-between text-lg font-semibold">
              <span>Sign In</span>
              <div className="flex items-center gap-1 text-xs font-normal text-muted-foreground">
                <Shield className="size-3.5 text-primary" />
                <span>RBAC Protected</span>
              </div>
            </CardTitle>
            <CardDescription className="text-xs">
              Only authorized administrator roles can access this dashboard.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {errorMessage && (
              <Alert variant="destructive" className="py-2.5">
                <AlertCircle className="size-4" />
                <AlertTitle className="text-xs font-semibold">
                  Access Error
                </AlertTitle>
                <AlertDescription className="text-xs">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-medium">
                  Administrator Email
                </Label>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@amanillah.dev"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 text-sm"
                    required
                    autoComplete="email"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium">
                    Password
                  </Label>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    Min 8 chars
                  </span>
                </div>
                <div className="relative">
                  <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-9 pl-9 text-sm"
                    required
                    autoComplete="current-password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="h-10 w-full font-medium shadow-md shadow-primary/20 cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Authenticating Session...
                  </>
                ) : (
                  <>
                    <KeyRound className="mr-2 size-4" />
                    Sign In to Admin Console
                    <ArrowRight className="ml-2 size-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 border-t border-border/50 pt-4 pb-5 text-center text-xs text-muted-foreground">
            <div className="flex w-full items-center justify-between text-[11px]">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Sparkles className="size-3 text-primary" />
                <span>Encrypted Session</span>
              </div>
              <a
                href={PUBLIC_SITE_URL}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
              >
                <span>Live Portfolio</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
          </CardFooter>
        </Card>

        {/* Security Notice */}
        <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
          Platform Security Notice: Unauthorized access attempts are monitored
          and logged. This administrative portal requires cryptographic
          verification and administrator role privileges.
        </p>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      }
    >
      <AdminLoginForm />
    </React.Suspense>
  )
}
