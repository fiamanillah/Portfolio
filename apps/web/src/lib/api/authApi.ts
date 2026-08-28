// src/lib/api/authApi.ts
import type {
  AuthUser,
  InitiateRegisterInput,
  VerifyRegisterOtpInput,
  LoginInput,
  ResetPasswordInput,
  UpdateProfileInput,
  GoogleLoginInput,
} from "@workspace/shared"

export type InitiateRegisterPayload = InitiateRegisterInput
export type VerifyRegisterOtpPayload = VerifyRegisterOtpInput
export type LoginPayload = LoginInput
export type ResetPasswordPayload = ResetPasswordInput
export type UpdateProfilePayload = UpdateProfileInput
export type GoogleLoginPayload = GoogleLoginInput

import { getApiBaseUrl } from "./baseUrl"

const API_BASE_URL = getApiBaseUrl()

const ACCESS_TOKEN_KEY = "portfolio_access_token"

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  } catch {
    return null
  }
}

export function setStoredAccessToken(token: string | null): void {
  if (typeof window === "undefined") return
  try {
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token)
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
    }
  } catch {
    // ignore
  }
}

let isRefreshing = false
let refreshPromise: Promise<string | null> | null = null

async function attemptTokenRefresh(): Promise<string | null> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }
  isRefreshing = true
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/v1/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })
      const body = await res.json().catch(() => null)
      if (res.ok && body?.data?.accessToken) {
        setStoredAccessToken(body.data.accessToken)
        return body.data.accessToken as string
      }
      setStoredAccessToken(null)
      return null
    } catch {
      setStoredAccessToken(null)
      return null
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()

  return refreshPromise
}

async function request<T>(
  endpoint: string,
  options: RequestInit & { _isRetry?: boolean } = {}
): Promise<{ success: boolean; data?: T; message?: string; error?: string }> {
  const token = getStoredAccessToken()
  const headers: Record<string, string> = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  try {
    const url = `${API_BASE_URL}${endpoint}`
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    })

    // Handle 401 Unauthorized with silent refresh
    if (
      res.status === 401 &&
      !options._isRetry &&
      !endpoint.includes("/auth/v1/refresh-token") &&
      !endpoint.includes("/auth/v1/login")
    ) {
      const newToken = await attemptTokenRefresh()
      if (newToken) {
        return await request<T>(endpoint, {
          ...options,
          _isRetry: true,
        })
      }
    }

    const body = await res.json().catch(() => null)

    if (!res.ok) {
      const errMsg =
        body?.message ||
        body?.error?.message ||
        `Request failed with status ${res.status}`
      return { success: false, error: errMsg, message: errMsg }
    }

    return {
      success: true,
      data: (body?.data !== undefined ? body.data : body) as T,
      message: body?.message,
    }
  } catch (err: unknown) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Network error. Please check your server connection.",
    }
  }
}

export const AuthApi = {
  /**
   * 1. Initiate user registration (sends Plunk OTP email)
   */
  async initiateRegister(payload: InitiateRegisterPayload) {
    return await request<{ email: string; message: string }>(
      "/auth/v1/register/initiate",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    )
  },

  /**
   * 2. Verify registration OTP & activate user account
   */
  async verifyRegisterOtp(payload: VerifyRegisterOtpPayload) {
    const res = await request<{
      user: AuthUser
      accessToken: string
      refreshToken: string
    }>("/auth/v1/register/verify-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    })

    if (res.success && res.data?.accessToken) {
      setStoredAccessToken(res.data.accessToken)
    }

    return res
  },

  /**
   * 3. Sign in with email & password
   */
  async login(payload: LoginPayload) {
    const res = await request<{
      user: AuthUser
      accessToken: string
      refreshToken: string
    }>("/auth/v1/login", {
      method: "POST",
      body: JSON.stringify(payload),
    })

    if (res.success && res.data?.accessToken) {
      setStoredAccessToken(res.data.accessToken)
    }

    return res
  },

  /**
   * 4. 1-Click Demo Login
   */
  async demoLogin(userId: string) {
    const res = await request<{
      user: AuthUser
      accessToken: string
      refreshToken: string
    }>("/auth/v1/demo-login", {
      method: "POST",
      body: JSON.stringify({ userId }),
    })

    if (res.success && res.data?.accessToken) {
      setStoredAccessToken(res.data.accessToken)
    }

    return res
  },

  /**
   * 5. Request Password Reset OTP
   */
  async forgotPassword(email: string) {
    return await request<{ message: string }>("/auth/v1/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  },

  /**
   * 6. Verify Password Reset OTP
   */
  async verifyResetOtp(email: string, otpCode: string) {
    return await request<{ message: string }>("/auth/v1/verify-reset-otp", {
      method: "POST",
      body: JSON.stringify({ email, otpCode }),
    })
  },

  /**
   * 7. Reset Password
   */
  async resetPassword(payload: ResetPasswordPayload) {
    const res = await request<{
      user: AuthUser
      accessToken: string
      refreshToken: string
    }>("/auth/v1/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    })

    if (res.success && res.data?.accessToken) {
      setStoredAccessToken(res.data.accessToken)
    }

    return res
  },

  /**
   * 8. Resend OTP Code
   */
  async resendOtp(
    email: string,
    type: "REGISTER_EMAIL_VERIFY" | "PASSWORD_RESET"
  ) {
    return await request<{ message: string }>("/auth/v1/resend-otp", {
      method: "POST",
      body: JSON.stringify({ email, type }),
    })
  },

  /**
   * 9. Get current authenticated user
   */
  async getMe() {
    return await request<AuthUser>("/auth/v1/me", {
      method: "GET",
    })
  },

  /**
   * 10. Update Profile
   */
  async updateProfile(payload: UpdateProfilePayload) {
    return await request<AuthUser>("/users/v1/profile", {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
  },

  /**
   * 11. Change Password
   */
  async changePassword(currentPassword: string, newPassword: string) {
    return await request<{ message: string }>("/users/v1/change-password", {
      method: "PATCH",
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  },

  /**
   * 12. Update Newsletter Subscription
   */
  async updateSubscription(subscribedToNewsletter: boolean) {
    return await request<{ subscribedToNewsletter: boolean }>(
      "/users/v1/subscription",
      {
        method: "PATCH",
        body: JSON.stringify({ subscribedToNewsletter }),
      }
    )
  },

  /**
   * 13. Delete Account
   */
  async deleteAccount() {
    const res = await request<{ message: string }>("/users/v1/account", {
      method: "DELETE",
    })
    setStoredAccessToken(null)
    return res
  },

  /**
   * 14. Upload Profile Avatar directly to Cloudflare R2 / S3
   */
  async uploadAvatar(file: File) {
    const formData = new FormData()
    formData.append("file", file)

    return await request<AuthUser>("/users/v1/profile/avatar", {
      method: "POST",
      body: formData,
    })
  },

  /**
   * 15. Remove Profile Avatar
   */
  async deleteAvatar() {
    return await request<AuthUser>("/users/v1/profile/avatar", {
      method: "DELETE",
    })
  },

  /**
   * 16. Sign Out
   */
  async logout() {
    await request("/auth/v1/logout", {
      method: "POST",
    })
    setStoredAccessToken(null)
  },

  /**
   * 17. Authenticate with Google (Direct ID token or auth code)
   */
  async loginWithGoogle(payload: GoogleLoginPayload) {
    const res = await request<{
      user: AuthUser
      accessToken: string
      refreshToken: string
    }>("/auth/v1/google", {
      method: "POST",
      body: JSON.stringify(payload),
    })

    if (res.success && res.data?.accessToken) {
      setStoredAccessToken(res.data.accessToken)
    }

    return res
  },

  /**
   * 18. Get Google OAuth Consent URL
   */
  async getGoogleAuthUrl(
    returnTo?: string,
    mode: "popup" | "redirect" = "popup"
  ) {
    const targetUrl =
      returnTo || (typeof window !== "undefined" ? window.location.href : "")
    return await request<{ url: string }>(
      `/auth/v1/google?format=json&mode=${mode}&returnTo=${encodeURIComponent(targetUrl)}`,
      { method: "GET" }
    )
  },

  /**
   * 19. Open Google OAuth Popup and wait for message callback
   */
  openGoogleAuthPopup(returnTo?: string): Promise<{
    success: boolean
    data?: { user: AuthUser; accessToken: string }
    error?: string
  }> {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        return resolve({ success: false, error: "Window is not available" })
      }

      const targetUrl = returnTo || `${window.location.origin}/auth/callback`
      const width = 500
      const height = 620
      const left = window.screenX + (window.outerWidth - width) / 2
      const top = window.screenY + (window.outerHeight - height) / 2

      const popupUrl = `${API_BASE_URL}/auth/v1/google?mode=popup&returnTo=${encodeURIComponent(targetUrl)}`

      const popup = window.open(
        popupUrl,
        "google_oauth_popup",
        `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
      )

      if (!popup || popup.closed || typeof popup.closed === "undefined") {
        // Popup blocked by browser -> fallback to direct redirect
        window.location.href = `${API_BASE_URL}/auth/v1/google?mode=redirect&returnTo=${encodeURIComponent(targetUrl)}`
        return resolve({
          success: false,
          error: "Popup blocked, redirecting...",
        })
      }

      try {
        popup.focus()
      } catch {
        // ignore
      }

      let isFinished = false
      let pollTimer: ReturnType<typeof setInterval> | null = null
      let bc: BroadcastChannel | null = null

      const cleanup = () => {
        if (pollTimer) clearInterval(pollTimer)
        window.removeEventListener("message", handleMessage)
        window.removeEventListener("storage", handleStorage)
        if (bc) {
          try {
            bc.close()
          } catch {
            // ignore
          }
          bc = null
        }
      }

      const handleSuccess = (user: AuthUser, accessToken: string) => {
        if (isFinished) return
        isFinished = true
        cleanup()
        setStoredAccessToken(accessToken)
        try {
          localStorage.setItem("portfolio_user_session", JSON.stringify(user))
          window.dispatchEvent(
            new CustomEvent("portfolio:auth-change", { detail: user })
          )
        } catch {
          // ignore
        }
        try {
          if (popup && !popup.closed) {
            popup.close()
          }
        } catch {
          // ignore
        }
        resolve({
          success: true,
          data: { user, accessToken },
        })
      }

      const handleError = (errorMsg: string) => {
        if (isFinished) return
        isFinished = true
        cleanup()
        resolve({
          success: false,
          error: errorMsg,
        })
      }

      const handleMessage = (event: MessageEvent) => {
        if (!event.data || typeof event.data !== "object") return

        if (
          event.data.type === "GOOGLE_AUTH_SUCCESS" &&
          event.data.accessToken
        ) {
          handleSuccess(event.data.user, event.data.accessToken)
        } else if (event.data.type === "GOOGLE_AUTH_ERROR") {
          handleError(event.data.error || "Google authentication failed")
        }
      }

      const handleStorage = (event: StorageEvent) => {
        if (
          (event.key === "portfolio_user_session" ||
            event.key === "portfolio_access_token") &&
          event.newValue
        ) {
          try {
            const token = getStoredAccessToken()
            const userRaw = localStorage.getItem("portfolio_user_session")
            if (token && userRaw) {
              const user = JSON.parse(userRaw) as AuthUser
              handleSuccess(user, token)
            }
          } catch {
            // ignore
          }
        }
      }

      window.addEventListener("message", handleMessage)
      window.addEventListener("storage", handleStorage)

      if (typeof BroadcastChannel !== "undefined") {
        try {
          bc = new BroadcastChannel("portfolio_google_auth")
          bc.onmessage = (event) => {
            if (
              event.data?.type === "GOOGLE_AUTH_SUCCESS" &&
              event.data?.accessToken
            ) {
              handleSuccess(event.data.user, event.data.accessToken)
            } else if (event.data?.type === "GOOGLE_AUTH_ERROR") {
              handleError(event.data.error || "Google authentication failed")
            }
          }
        } catch {
          // ignore BroadcastChannel errors
        }
      }

      // Poll in case the popup was closed manually or finished in another context
      pollTimer = setInterval(() => {
        if (!popup || popup.closed) {
          setTimeout(() => {
            if (!isFinished) {
              const token = getStoredAccessToken()
              const userRaw = localStorage.getItem("portfolio_user_session")
              if (token && userRaw) {
                try {
                  const user = JSON.parse(userRaw) as AuthUser
                  handleSuccess(user, token)
                  return
                } catch {
                  // ignore
                }
              }
              handleError("Sign-in cancelled")
            }
          }, 400)
        }
      }, 500)
    })
  },
}
