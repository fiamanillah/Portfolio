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

function GoogleIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27A7.16 7.16 0 0 1 4.9 12c0-.79.14-1.57.38-2.27V6.58H1.25A11.97 11.97 0 0 0 0 12c0 1.92.45 3.74 1.25 5.42l4.03-3.15Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
      />
    </svg>
  )
}

function AdminLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get("redirect") || "/"

  const {
    login,
    loginWithGoogle,
    isAuthenticated,
    isAdmin,
    isLoading: isAuthChecking,
  } = useAuth()

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isGoogleSubmitting, setIsGoogleSubmitting] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  // If already authenticated as ADMIN, redirect to dashboard immediately
  React.useEffect(() => {
    if (!isAuthChecking && isAuthenticated && isAdmin) {
      router.replace(redirectPath)
    }
  }, [isAuthChecking, isAuthenticated, isAdmin, router, redirectPath])

  const handleGoogleLogin = async () => {
    setErrorMessage(null)
    setIsGoogleSubmitting(true)
    try {
      const res = await loginWithGoogle()
      if (!res.success) {
        setErrorMessage(res.error || "Google sign-in failed.")
      } else {
        router.replace(redirectPath)
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Google sign-in failed."
      )
    } finally {
      setIsGoogleSubmitting(false)
    }
  }

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
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "An error occurred while communicating with the server."
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
                className="h-10 w-full cursor-pointer font-medium shadow-md shadow-primary/20"
                disabled={isSubmitting || isGoogleSubmitting}
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

              <div className="relative flex items-center justify-center py-0.5">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/70" />
                </div>
                <span className="relative bg-card px-2 font-mono text-[10px] text-muted-foreground uppercase">
                  Or continue with
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting || isGoogleSubmitting}
                onClick={handleGoogleLogin}
                className="h-10 w-full cursor-pointer border-border/80 bg-background/50 font-medium hover:bg-muted/50"
              >
                {isGoogleSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Authenticating Google Account...
                  </>
                ) : (
                  <>
                    <GoogleIcon className="mr-2 size-4" />
                    Sign in with Google
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
