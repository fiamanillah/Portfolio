// apps/web/src/components/auth/LazyAuthModal.tsx
import { useState, useEffect, lazy, Suspense } from "react"
import { getAuthUrlParam, AUTH_MODAL_EVENT } from "@/lib/authStore"
import type { AuthModalProps } from "./AuthModal"

const AuthModalComponent = lazy(() =>
  import("./AuthModal").then((module) => ({ default: module.AuthModal }))
)

export function LazyAuthModal(props: AuthModalProps) {
  const [shouldLoad, setShouldLoad] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    return props.open === true || Boolean(getAuthUrlParam())
  })

  useEffect(() => {
    if (shouldLoad) return

    const handleAuthTrigger = () => {
      if (getAuthUrlParam() || props.open) {
        setShouldLoad(true)
      }
    }

    const handleModalEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{
        open?: boolean
        step?: string
      }>
      if (customEvent.detail?.open || customEvent.detail?.step) {
        setShouldLoad(true)
      }
    }

    window.addEventListener(AUTH_MODAL_EVENT, handleModalEvent, {
      passive: true,
    })
    window.addEventListener("popstate", handleAuthTrigger, { passive: true })

    const handleGlobalClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest?.("[data-auth-trigger]")
      if (target) {
        setShouldLoad(true)
      }
    }
    document.addEventListener("click", handleGlobalClick, {
      passive: true,
      capture: true,
    })

    return () => {
      window.removeEventListener(AUTH_MODAL_EVENT, handleModalEvent)
      window.removeEventListener("popstate", handleAuthTrigger)
      document.removeEventListener("click", handleGlobalClick, {
        capture: true,
      })
    }
  }, [shouldLoad, props.open])

  if (!shouldLoad) {
    return null
  }

  return (
    <Suspense fallback={null}>
      <AuthModalComponent {...props} />
    </Suspense>
  )
}

export default LazyAuthModal
