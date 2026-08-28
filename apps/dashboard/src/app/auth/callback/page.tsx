"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ACCESS_TOKEN_KEY, AUTH_COOKIE_NAME } from "@/lib/api/client"

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  React.useEffect(() => {
    const token = searchParams.get("auth_token")
    const userRaw = searchParams.get("user")
    const error = searchParams.get("auth_error")

    if (error) {
      const errPayload = { type: "GOOGLE_AUTH_ERROR", error }
      try {
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(errPayload, "*")
        }
      } catch (e) {}
      try {
        if ("BroadcastChannel" in window) {
          const bc = new BroadcastChannel("portfolio_google_auth")
          bc.postMessage(errPayload)
          bc.close()
        }
      } catch (e) {}
      setTimeout(() => {
        try {
          window.close()
        } catch (e) {}
      }, 1500)
      return
    }

    if (token) {
      let user = null
      if (userRaw) {
        try {
          user = JSON.parse(userRaw)
        } catch (e) {}
      }

      localStorage.setItem(ACCESS_TOKEN_KEY, token)
      document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(
        token
      )}; path=/; max-age=2592000; SameSite=Lax`

      const successPayload = {
        type: "GOOGLE_AUTH_SUCCESS",
        accessToken: token,
        user,
      }

      try {
        if ("BroadcastChannel" in window) {
          const bc = new BroadcastChannel("portfolio_google_auth")
          bc.postMessage(successPayload)
          bc.close()
        }
      } catch (e) {}

      try {
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(successPayload, "*")
        }
      } catch (e) {}

      const isPopup =
        Boolean(window.opener && !window.opener.closed) ||
        window.name === "google_admin_oauth_popup" ||
        window.name === "google_oauth_popup"

      if (isPopup) {
        try {
          window.close()
        } catch (e) {}

        // Fallback for mobile or environments where window.close is restricted
        setTimeout(() => {
          try {
            if (!window.closed) {
              router.replace("/")
            }
          } catch (e) {
            router.replace("/")
          }
        }, 400)
      } else {
        router.replace("/")
      }
    }
  }, [router, searchParams])

  return (
    <div className="w-full max-w-sm rounded-none border border-border bg-card p-6 text-center shadow-lg">
      <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
      <h2 className="text-sm font-semibold">Completing Admin Sign-In...</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Synchronizing session and returning to dashboard...
      </p>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 font-mono text-foreground">
      <React.Suspense
        fallback={
          <div className="w-full max-w-sm rounded-none border border-border bg-card p-6 text-center shadow-lg">
            <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
            <h2 className="text-sm font-semibold">Loading...</h2>
          </div>
        }
      >
        <AuthCallbackContent />
      </React.Suspense>
    </div>
  )
}
