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
  }
  setStoredUser(newUser)
  return newUser
}

export function logoutUser(): void {
  setStoredUser(null)
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
    logout: logoutUser,
  }
}
