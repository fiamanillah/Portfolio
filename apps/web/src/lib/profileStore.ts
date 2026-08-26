// src/lib/profileStore.ts
import { useSyncExternalStore } from "react"
import { getStoredUser, setStoredUser } from "@/lib/authStore"
import { AuthApi } from "@/lib/api/authApi"
import type { AuthUser, UpdateProfileInput } from "@workspace/shared"

export interface SimpleUserProfileState {
  profile: AuthUser | null
  subscribedToNewsletter: boolean
}

const PROFILE_STORAGE_KEY_PREFIX = "portfolio_profile_user_"
const PROFILE_EVENT_NAME = "portfolio:profile-change"

const EMPTY_PROFILE_STATE: SimpleUserProfileState = {
  profile: null,
  subscribedToNewsletter: false,
}

let cachedProfileStr: string | null = null
let cachedProfileState: SimpleUserProfileState | null = null
let cachedUserId: string | null = null

export function getSimpleProfileState(): SimpleUserProfileState {
  if (typeof window === "undefined") return EMPTY_PROFILE_STATE

  const authUser = getStoredUser()
  if (!authUser) {
    cachedProfileStr = null
    cachedProfileState = EMPTY_PROFILE_STATE
    cachedUserId = null
    return EMPTY_PROFILE_STATE
  }

  const key = `${PROFILE_STORAGE_KEY_PREFIX}${authUser.id}`

  try {
    const raw = localStorage.getItem(key)
    if (
      raw === cachedProfileStr &&
      cachedUserId === authUser.id &&
      cachedProfileState
    ) {
      return cachedProfileState
    }

    cachedProfileStr = raw
    cachedUserId = authUser.id

    if (raw) {
      const parsed = JSON.parse(raw) as SimpleUserProfileState
      parsed.profile = {
        ...authUser,
        ...parsed.profile,
      }
      cachedProfileState = parsed
      return cachedProfileState
    }

    const defaultState: SimpleUserProfileState = {
      profile: authUser,
      subscribedToNewsletter: authUser.subscribedToNewsletter ?? true,
    }
    const json = JSON.stringify(defaultState)
    localStorage.setItem(key, json)
    cachedProfileStr = json
    cachedProfileState = defaultState
    return cachedProfileState
  } catch (e) {
    console.error("Failed to load profile state from localStorage:", e)
    const fallback: SimpleUserProfileState = {
      profile: authUser,
      subscribedToNewsletter: authUser.subscribedToNewsletter ?? true,
    }
    return fallback
  }
}

export function saveSimpleProfileState(state: SimpleUserProfileState): void {
  if (typeof window === "undefined") return
  try {
    if (state.profile) {
      const key = `${PROFILE_STORAGE_KEY_PREFIX}${state.profile.id}`
      const raw = JSON.stringify(state)
      localStorage.setItem(key, raw)
      cachedProfileStr = raw
      cachedUserId = state.profile.id
      cachedProfileState = state

      // Synchronize in authStore
      setStoredUser({
        ...state.profile,
        subscribedToNewsletter: state.subscribedToNewsletter,
      })
    }

    window.dispatchEvent(new CustomEvent(PROFILE_EVENT_NAME, { detail: state }))
  } catch (e) {
    console.error("Failed to save profile state:", e)
  }
}

export async function updateProfileInfo(updates: UpdateProfileInput): Promise<{
  success: boolean
  user?: AuthUser
  error?: string
}> {
  const current = getSimpleProfileState()
  if (!current.profile) {
    return {
      success: false,
      error: "You must be signed in to update your profile.",
    }
  }

  try {
    const res = await AuthApi.updateProfile(updates)
    if (res.success && res.data) {
      const updatedState: SimpleUserProfileState = {
        ...current,
        profile: res.data,
      }
      saveSimpleProfileState(updatedState)
      return { success: true, user: res.data }
    }
    return {
      success: false,
      error: res.error || res.message || "Failed to update profile.",
    }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update profile.",
    }
  }
}

export async function updateSubscriptionStatus(subscribed: boolean): Promise<{
  success: boolean
  subscribed?: boolean
  error?: string
}> {
  const current = getSimpleProfileState()
  if (!current.profile) {
    return {
      success: false,
      error: "You must be signed in to manage subscriptions.",
    }
  }

  try {
    const res = await AuthApi.updateSubscription(subscribed)
    if (res.success) {
      const updatedState: SimpleUserProfileState = {
        ...current,
        subscribedToNewsletter: subscribed,
        profile: {
          ...current.profile,
          subscribedToNewsletter: subscribed,
        },
      }
      saveSimpleProfileState(updatedState)
      return { success: true, subscribed }
    }
    return {
      success: false,
      error: res.error || res.message || "Failed to update subscription.",
    }
  } catch (err: unknown) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to update subscription.",
    }
  }
}

export async function uploadProfileAvatar(file: File): Promise<{
  success: boolean
  user?: AuthUser
  error?: string
}> {
  const current = getSimpleProfileState()
  if (!current.profile) {
    return {
      success: false,
      error: "You must be signed in to upload an avatar.",
    }
  }

  try {
    const res = await AuthApi.uploadAvatar(file)
    if (res.success && res.data) {
      const updatedState: SimpleUserProfileState = {
        ...current,
        profile: res.data,
      }
      saveSimpleProfileState(updatedState)
      return { success: true, user: res.data }
    }
    return {
      success: false,
      error: res.error || res.message || "Failed to upload avatar.",
    }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to upload avatar.",
    }
  }
}

export async function removeProfileAvatar(): Promise<{
  success: boolean
  user?: AuthUser
  error?: string
}> {
  const current = getSimpleProfileState()
  if (!current.profile) {
    return {
      success: false,
      error: "You must be signed in to remove your avatar.",
    }
  }

  try {
    const res = await AuthApi.deleteAvatar()
    if (res.success && res.data) {
      const updatedState: SimpleUserProfileState = {
        ...current,
        profile: res.data,
      }
      saveSimpleProfileState(updatedState)
      return { success: true, user: res.data }
    }
    return {
      success: false,
      error: res.error || res.message || "Failed to remove avatar.",
    }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to remove avatar.",
    }
  }
}

export async function deleteUserProfile(): Promise<{
  success: boolean
  error?: string
}> {
  if (typeof window === "undefined") return { success: false }
  const authUser = getStoredUser()

  try {
    const res = await AuthApi.deleteAccount()
    if (authUser) {
      try {
        localStorage.removeItem(`${PROFILE_STORAGE_KEY_PREFIX}${authUser.id}`)
      } catch {}
    }
    setStoredUser(null)
    return { success: res.success, error: res.error }
  } catch (err: unknown) {
    setStoredUser(null)
    return {
      success: false,
      error: err instanceof Error ? err.message : undefined,
    }
  }
}

function subscribeProfileStore(callback: () => void) {
  if (typeof window === "undefined") return () => {}
  const handleProfile = () => callback()
  const handleAuth = () => callback()
  const handleStorage = (e: StorageEvent) => {
    if (
      e.key?.startsWith(PROFILE_STORAGE_KEY_PREFIX) ||
      e.key === "portfolio_user_session"
    ) {
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
    () => EMPTY_PROFILE_STATE
  )

  const activeState = profileState || EMPTY_PROFILE_STATE

  return {
    state: activeState,
    profile: activeState.profile,
    subscribedToNewsletter: activeState.subscribedToNewsletter,
    updateProfile: updateProfileInfo,
    uploadAvatar: uploadProfileAvatar,
    removeAvatar: removeProfileAvatar,
    updateSubscription: updateSubscriptionStatus,
    deleteAccount: deleteUserProfile,
  }
}
