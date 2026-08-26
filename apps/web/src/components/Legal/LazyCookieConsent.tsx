// apps/web/src/components/Legal/LazyCookieConsent.tsx
import { useState, useEffect, lazy, Suspense } from "react"

const STORAGE_KEY = "fi_cookie_consent_v1"

const CookieConsentComponent = lazy(() =>
  import("./CookieConsent").then((module) => ({
    default: module.CookieConsent,
  }))
)

export function LazyCookieConsent() {
  const [shouldLoad, setShouldLoad] = useState<boolean>(false)

  useEffect(() => {
    // 1. Listen for global preference open triggers (from footer link or custom event)
    const handleOpenTrigger = () => {
      setShouldLoad(true)
    }

    window.openCookiePreferences = handleOpenTrigger
    window.addEventListener("open-cookie-preferences", handleOpenTrigger)

    // 2. Check if consent is already recorded in localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        // Returning visitor has already consented: Do not load heavy banner/modal
        return () => {
          window.removeEventListener(
            "open-cookie-preferences",
            handleOpenTrigger
          )
        }
      }
    } catch {
      // localStorage unavailable, continue with delayed load
    }

    // 3. First-time visitor: Trigger after 4.5s dwell delay or after scroll
    let timer: ReturnType<typeof setTimeout> | null = null
    let hasTriggered = false

    const trigger = () => {
      if (hasTriggered) return
      hasTriggered = true
      setShouldLoad(true)
    }

    const handleScroll = () => {
      if (window.scrollY > 200) {
        trigger()
        window.removeEventListener("scroll", handleScroll)
      }
    }

    const graceTimer = setTimeout(() => {
      window.addEventListener("scroll", handleScroll, { passive: true })
    }, 3000)

    timer = setTimeout(() => {
      trigger()
    }, 4500)

    return () => {
      clearTimeout(graceTimer)
      if (timer) clearTimeout(timer)
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("open-cookie-preferences", handleOpenTrigger)
    }
  }, [])

  if (!shouldLoad) {
    return null
  }

  return (
    <Suspense fallback={null}>
      <CookieConsentComponent />
    </Suspense>
  )
}

export default LazyCookieConsent
