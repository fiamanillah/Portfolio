// apps/dashboard/src/lib/api/auth.api.ts
import type { AuthUser, LoginInput, GoogleLoginInput } from "@workspace/shared"
import {
  request,
  setStoredAccessToken,
  getStoredAccessToken,
  API_BASE_URL,
} from "./client"

export const AuthApi = {
  /**
   * 1. Admin Sign In
   */
  async login(payload: LoginInput) {
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
   * 2. 1-Click Demo Login
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
   * 3. Get current authenticated user profile & role
   */
  async getMe() {
    return await request<AuthUser>("/auth/v1/me", {
      method: "GET",
    })
  },

  /**
   * 4. Sign Out
   */
  async logout() {
    try {
      await request("/auth/v1/logout", {
        method: "POST",
      })
    } catch {
      // ignore
    } finally {
      setStoredAccessToken(null)
    }
  },

  /**
   * 5. Authenticate with Google (Direct REST)
   */
  async loginWithGoogle(payload: GoogleLoginInput) {
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
   * 6. Open Google OAuth Popup for Admin Login
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
        "google_admin_oauth_popup",
        `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
      )

      if (!popup || popup.closed || typeof popup.closed === "undefined") {
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
          (event.key === "portfolio_access_token" ||
            event.key === "portfolio_user_session") &&
          event.newValue
        ) {
          const token = getStoredAccessToken()
          if (token) {
            AuthApi.getMe()
              .then((res) => {
                if (res.success && res.data) {
                  handleSuccess(res.data, token)
                }
              })
              .catch(() => {})
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

      pollTimer = setInterval(() => {
        if (!popup || popup.closed) {
          setTimeout(() => {
            if (!isFinished) {
              const token = getStoredAccessToken()
              if (token) {
                AuthApi.getMe()
                  .then((res) => {
                    if (res.success && res.data) {
                      handleSuccess(res.data, token)
                    } else {
                      handleError("Sign-in cancelled")
                    }
                  })
                  .catch(() => {
                    handleError("Sign-in cancelled")
                  })
                return
              }
              handleError("Sign-in cancelled")
            }
          }, 400)
        }
      }, 500)
    })
  },
}
