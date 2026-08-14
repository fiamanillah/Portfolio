import { useSyncExternalStore } from "react"
import { DEMO_USERS, type AuthUser } from "@/data/commentsData"

const AUTH_STORAGE_KEY = "portfolio_user_session"
const AUTH_EVENT_NAME = "portfolio:auth-change"

let cachedUserStr: string | null = null
let cachedUser: AuthUser | null = null

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (raw === cachedUserStr) return cachedUser
    cachedUserStr = raw
    if (!raw) {
      cachedUser = null
      return null
    }
    cachedUser = JSON.parse(raw) as AuthUser
    return cachedUser
  } catch (e) {
    console.error("Failed to parse stored auth user:", e)
    return null
  }
}

export function setStoredUser(user: AuthUser | null): void {
  if (typeof window === "undefined") return
  try {
    if (user) {
      const raw = JSON.stringify(user)
      localStorage.setItem(AUTH_STORAGE_KEY, raw)
      cachedUserStr = raw
      cachedUser = user
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      cachedUserStr = null
      cachedUser = null
    }
    window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME, { detail: user }))
  } catch (e) {
    console.error("Failed to update auth user in localStorage:", e)
  }
}

export function loginWithDemoUser(userId: string): AuthUser | null {
  const found = DEMO_USERS.find((u) => u.id === userId)
  if (found) {
    setStoredUser(found)
    return found
  }
  return null
}

export function loginWithCredentials(email: string, password?: string): AuthUser {
  void password
  // Check if matching demo user
  const matching = DEMO_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  )
  if (matching) {
    setStoredUser(matching)
    return matching
  }

  // Otherwise generate custom user from email handle
  const username = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "") || "engineer"
  const displayName = username.charAt(0).toUpperCase() + username.slice(1)
  const newUser: AuthUser = {
    id: `user-${Date.now()}`,
    name: displayName,
    username: username.toLowerCase(),
    email,
    avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    role: "Software Engineer",
    badge: "Member",
    joinedAt: new Date().toISOString().split("T")[0],
  }
  setStoredUser(newUser)
  return newUser
}

export function registerUser(params: {
  name: string
  username: string
  email: string
  role?: string
  avatar?: string
  subscribedToNewsletter?: boolean
}): AuthUser {
  const cleanUsername = params.username.toLowerCase().replace(/[^a-zA-Z0-9_]/g, "") || `dev_${Date.now().toString().slice(-4)}`
  const newUser: AuthUser = {
    id: `user-${Date.now()}`,
    name: params.name.trim() || "Dev Explorer",
    username: cleanUsername,
    email: params.email.trim(),
    avatar:
      params.avatar ||
      `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    role: params.role?.trim() || "Full Stack Developer",
    badge: "Contributor",
    joinedAt: new Date().toISOString().split("T")[0],
    subscribedToNewsletter: !!params.subscribedToNewsletter,
  }
  setStoredUser(newUser)

  // If newsletter subscribed, also sync to newsletter storage if exists
  if (params.subscribedToNewsletter && typeof window !== "undefined") {
    try {
      localStorage.setItem("portfolio_newsletter_subscribed", "true")
    } catch {
      // ignore
    }
  }

  return newUser
}

export function resetPassword(email: string, newPassword?: string): boolean {
  void newPassword
  if (typeof window === "undefined") return true
  try {
    const stored = getStoredUser()
    if (stored && stored.email.toLowerCase() === email.toLowerCase()) {
      setStoredUser({ ...stored })
    }
    return true
  } catch (e) {
    console.error("Failed to reset password in mock store:", e)
    return false
  }
}

export function logoutUser(): void {
  setStoredUser(null)
}

/**
 * URL Query Synchronization for Auth Modal
 */
export const AUTH_MODAL_EVENT = "portfolio:auth-modal-toggle"

export type AuthModalStep =
  | "quick"
  | "signin"
  | "signup"
  | "register-verify-otp"
  | "forgot-password"
  | "verify-otp"
  | "reset-password"

export function getAuthUrlParam(): AuthModalStep | null {
  if (typeof window === "undefined") return null
  const params = new URLSearchParams(window.location.search)
  const auth = params.get("auth")?.toLowerCase()
  if (
    auth === "quick" ||
    auth === "signin" ||
    auth === "login" ||
    auth === "signup" ||
    auth === "register" ||
    auth === "register-verify-otp" ||
    auth === "verify-email" ||
    auth === "signup-otp" ||
    auth === "forgot-password" ||
    auth === "forgot" ||
    auth === "verify-otp" ||
    auth === "otp" ||
    auth === "reset-password" ||
    auth === "reset"
  ) {
    if (auth === "login") return "signin"
    if (auth === "register") return "signup"
    if (auth === "verify-email" || auth === "signup-otp") return "register-verify-otp"
    if (auth === "forgot") return "forgot-password"
    if (auth === "otp") return "verify-otp"
    if (auth === "reset") return "reset-password"
    return auth as AuthModalStep
  }
  return null
}

export function setAuthUrlParam(step: AuthModalStep | null, extraParams?: Record<string, string>): void {
  if (typeof window === "undefined") return
  const url = new URL(window.location.href)
  if (step) {
    url.searchParams.set("auth", step)
    if (extraParams) {
      Object.entries(extraParams).forEach(([k, v]) => {
        url.searchParams.set(k, v)
      })
    }
  } else {
    url.searchParams.delete("auth")
    url.searchParams.delete("email")
    url.searchParams.delete("otp")
  }

  window.history.replaceState({}, "", url.pathname + url.search + url.hash)
  window.dispatchEvent(
    new CustomEvent(AUTH_MODAL_EVENT, {
      detail: { step, open: !!step },
    })
  )
}

function subscribeAuth(callback: () => void) {
  if (typeof window === "undefined") return () => {}
  const handleAuth = () => callback()
  const handleStorage = (e: StorageEvent) => {
    if (e.key === AUTH_STORAGE_KEY) callback()
  }
  window.addEventListener(AUTH_EVENT_NAME, handleAuth)
  window.addEventListener("storage", handleStorage)
  return () => {
    window.removeEventListener(AUTH_EVENT_NAME, handleAuth)
    window.removeEventListener("storage", handleStorage)
  }
}

export function useAuthSession() {
  const user = useSyncExternalStore(subscribeAuth, getStoredUser, () => null)

  return {
    user,
    isLoading: false,
    isAuthenticated: !!user,
    loginDemo: loginWithDemoUser,
    login: (email: string, password?: string) => loginWithCredentials(email, password),
    register: registerUser,
    resetPassword: resetPassword,
    logout: logoutUser,
  }
}
