"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import type { AuthUser, LoginInput } from "@workspace/shared"
import { AuthApi, getStoredAccessToken, setStoredAccessToken } from "@/lib/api"
import { toast } from "@workspace/ui/components/sonner"
import { ShieldAlert, Loader2, Sparkles } from "lucide-react"

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  login: (
    credentials: LoginInput
  ) => Promise<{ success: boolean; error?: string }>
  loginAsDemo: (userId: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<AuthUser | null>
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null)
  const [token, setToken] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState<boolean>(true)
  const router = useRouter()
  const pathname = usePathname()

  const refreshUser = React.useCallback(async (): Promise<AuthUser | null> => {
    const currentToken = getStoredAccessToken()
    if (!currentToken) {
      setUser(null)
      setToken(null)
      setIsLoading(false)
      return null
    }

    try {
      setToken(currentToken)
      const res = await AuthApi.getMe()
      if (res.success && res.data) {
        setUser(res.data)
        return res.data
      } else {
        // Expired or invalid token
        setStoredAccessToken(null)
        setUser(null)
        setToken(null)
        return null
      }
    } catch (err) {
      console.error("Failed to fetch authenticated session:", err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const login = async (credentials: LoginInput) => {
    try {
      setIsLoading(true)
      const res = await AuthApi.login(credentials)

      if (!res.success || !res.data) {
        setIsLoading(false)
        return {
          success: false,
          error: res.error || "Invalid email or password. Please try again.",
        }
      }

      const loggedUser = res.data.user
      setUser(loggedUser)
      setToken(res.data.accessToken)
      setIsLoading(false)

      if (loggedUser.role !== "ADMIN") {
        toast.warning("Limited Access Account", {
          description:
            "Your account is not an Administrator. Redirecting to access portal...",
        })
        router.replace("/access-denied")
        return {
          success: true,
        }
      }

      toast.success("Welcome back, Super Admin!", {
        description: `Signed in as ${loggedUser.name}`,
      })

      return { success: true }
    } catch (err: unknown) {
      setIsLoading(false)
      return {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "An unexpected error occurred during sign in.",
      }
    }
  }

  const loginAsDemo = async (userId: string) => {
    try {
      setIsLoading(true)
      const res = await AuthApi.demoLogin(userId)

      if (!res.success || !res.data) {
        setIsLoading(false)
        return {
          success: false,
          error: res.error || "Failed to switch demo account.",
        }
      }

      const loggedUser = res.data.user
      setUser(loggedUser)
      setToken(res.data.accessToken)
      setIsLoading(false)

      if (loggedUser.role !== "ADMIN") {
        toast.info("Demo Account Activated", {
          description: `Logged in as ${loggedUser.name} (${loggedUser.role}). Non-admin role detected.`,
        })
        router.replace("/access-denied")
        return { success: true }
      }

      toast.success("Administrator Session Initialized", {
        description: `Logged in as ${loggedUser.name} (Role: ADMIN)`,
      })

      return { success: true }
    } catch (err: unknown) {
      setIsLoading(false)
      return {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Error logging into demo account.",
      }
    }
  }

  const logout = async () => {
    try {
      await AuthApi.logout()
    } catch (e) {
      console.error("Logout error:", e)
    } finally {
      setUser(null)
      setToken(null)
      setStoredAccessToken(null)
      toast.info("Signed out successfully")
      router.replace("/login")
    }
  }

  const isAuthenticated = !!user
  const isAdmin = user?.role === "ADMIN"

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        isAdmin,
        login,
        loginAsDemo,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext)
  if (!context) {
    return {
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      isAdmin: false,
      login: async () => ({ success: false }),
      loginAsDemo: async () => ({ success: false }),
      logout: async () => {},
      refreshUser: async () => null,
    }
  }
  return context
}

/**
 * AdminGuard: Component wrapper that restricts access strictly to users with role === 'ADMIN'.
 * Shows loading skeleton while checking, redirects unauthenticated to /login, and non-admins to /access-denied.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  React.useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
      } else if (!isAdmin) {
        router.replace("/access-denied")
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, router, pathname])

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background/95 p-6 backdrop-blur-xs">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <div className="relative flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-inner">
            <Loader2 className="size-7 animate-spin text-primary" />
            <div className="absolute -inset-1 -z-10 animate-pulse rounded-2xl bg-primary/20 blur-md" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold tracking-tight">
              Authenticating Admin
            </h3>
            <p className="text-xs text-muted-foreground">
              Verifying system privileges and cryptographic signature...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !isAdmin) {
    return null // Will redirect via useEffect
  }

  return <>{children}</>
}
