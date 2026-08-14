import { useSyncExternalStore } from "react"
import { getStoredUser, setStoredUser } from "@/lib/authStore"
import { DEMO_USERS, type AuthUser } from "@/data/commentsData"

export interface SimpleUserProfileState {
  profile: AuthUser
  subscribedToNewsletter: boolean
}

const PROFILE_STORAGE_KEY_PREFIX = "portfolio_profile_user_"
const PROFILE_EVENT_NAME = "portfolio:profile-change"

export function getDefaultSimpleProfile(user: AuthUser): SimpleUserProfileState {
  return {
    profile: {
      ...user,
      role: user.role || "Full Stack Developer",
      bio: user.bio || "Software engineer passionate about building high quality web systems.",
    },
    subscribedToNewsletter: user.subscribedToNewsletter ?? true,
  }
}

const DEFAULT_SERVER_STATE: SimpleUserProfileState = getDefaultSimpleProfile(DEMO_USERS[0])
let cachedProfileStr: string | null = null
let cachedProfileState: SimpleUserProfileState | null = null
let cachedUserId: string | null = null

export function getSimpleProfileState(): SimpleUserProfileState {
  if (typeof window === "undefined") return DEFAULT_SERVER_STATE

  const authUser = getStoredUser() || DEMO_USERS[0]
  const key = `${PROFILE_STORAGE_KEY_PREFIX}${authUser.id}`

  try {
    const raw = localStorage.getItem(key)
    if (raw === cachedProfileStr && cachedUserId === authUser.id && cachedProfileState) {
      return cachedProfileState
    }

    cachedProfileStr = raw
    cachedUserId = authUser.id

    if (raw) {
      const parsed = JSON.parse(raw) as SimpleUserProfileState
      parsed.profile = {
        ...parsed.profile,
        id: authUser.id,
        name: authUser.name || parsed.profile.name,
        username: authUser.username || parsed.profile.username,
        email: authUser.email || parsed.profile.email,
        avatar: authUser.avatar || parsed.profile.avatar,
        role: authUser.role || parsed.profile.role,
        badge: authUser.badge || parsed.profile.badge,
        bio: authUser.bio || parsed.profile.bio,
      }
      cachedProfileState = parsed
      return cachedProfileState
    }

    const defaultState = getDefaultSimpleProfile(authUser)
    const json = JSON.stringify(defaultState)
    localStorage.setItem(key, json)
    cachedProfileStr = json
    cachedProfileState = defaultState
    return cachedProfileState
  } catch (e) {
    console.error("Failed to load profile state from localStorage:", e)
    if (!cachedProfileState || cachedUserId !== authUser.id) {
      cachedProfileState = getDefaultSimpleProfile(authUser)
      cachedUserId = authUser.id
    }
    return cachedProfileState
  }
}

export function saveSimpleProfileState(state: SimpleUserProfileState): void {
  if (typeof window === "undefined" || !state.profile) return
  try {
    const key = `${PROFILE_STORAGE_KEY_PREFIX}${state.profile.id}`
    const raw = JSON.stringify(state)
    localStorage.setItem(key, raw)
    cachedProfileStr = raw
    cachedUserId = state.profile.id
    cachedProfileState = state

    // Synchronize basic AuthUser in authStore
    setStoredUser({
      ...state.profile,
      subscribedToNewsletter: state.subscribedToNewsletter,
    })

    window.dispatchEvent(new CustomEvent(PROFILE_EVENT_NAME, { detail: state }))
  } catch (e) {
    console.error("Failed to save profile state:", e)
  }
}

export function updateProfileInfo(updates: Partial<AuthUser>): SimpleUserProfileState {
  const current = getSimpleProfileState()
  const updatedState: SimpleUserProfileState = {
    ...current,
    profile: {
      ...current.profile,
      ...updates,
    },
  }
  saveSimpleProfileState(updatedState)
  return updatedState
}

export function updateSubscriptionStatus(subscribed: boolean): SimpleUserProfileState {
  const current = getSimpleProfileState()
  const updatedState: SimpleUserProfileState = {
    ...current,
    subscribedToNewsletter: subscribed,
    profile: {
      ...current.profile,
      subscribedToNewsletter: subscribed,
    },
  }
  saveSimpleProfileState(updatedState)
  return updatedState
}

export function deleteUserProfile(): void {
  if (typeof window === "undefined") return
  const authUser = getStoredUser()
  if (authUser) {
    try {
      localStorage.removeItem(`${PROFILE_STORAGE_KEY_PREFIX}${authUser.id}`)
    } catch {
      // ignore
    }
  }
  setStoredUser(null)
}

function subscribeProfileStore(callback: () => void) {
  if (typeof window === "undefined") return () => {}
  const handleProfile = () => callback()
  const handleAuth = () => callback()
  const handleStorage = (e: StorageEvent) => {
    if (e.key?.startsWith(PROFILE_STORAGE_KEY_PREFIX) || e.key === "portfolio_user_session") {
      callback()
    }
  }

  window.addEventListener(PROFILE_EVENT_NAME, handleProfile)
  window.addEventListener("portfolio:auth-change", handleAuth)
  window.addEventListener("storage", handleStorage)

  return () => {
    window.removeEventListener(PROFILE_EVENT_NAME, handleProfile)
    window.removeEventListener("portfolio:auth-change", handleAuth)
    window.removeEventListener("storage", handleStorage)
  }
}

export function useProfileState() {
  const profileState = useSyncExternalStore(
    subscribeProfileStore,
    getSimpleProfileState,
    () => DEFAULT_SERVER_STATE
  )

  const activeState = profileState || DEFAULT_SERVER_STATE

  return {
    state: activeState,
    profile: activeState.profile,
    subscribedToNewsletter: activeState.subscribedToNewsletter,
    updateProfile: updateProfileInfo,
    updateSubscription: updateSubscriptionStatus,
    deleteAccount: deleteUserProfile,
  }
}
