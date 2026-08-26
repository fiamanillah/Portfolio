"use client"

import { useState, useEffect } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  SecurityCheckIcon,
  Settings02Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { Switch } from "@workspace/ui/components/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"

const STORAGE_KEY = "fi_cookie_consent_v1"

export interface CookiePreferences {
  necessary: boolean
  functional: boolean
  analytics: boolean
  marketing: boolean
  timestamp: string
  version: string
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  functional: true,
  analytics: false,
  marketing: false,
  timestamp: "",
  version: "1.0",
}

declare global {
  interface Window {
    openCookiePreferences?: () => void
  }
}

export function CookieConsent() {
  const [mounted, setMounted] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [preferences, setPreferences] =
    useState<CookiePreferences>(DEFAULT_PREFERENCES)

  useEffect(() => {
    setMounted(true)

    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setPreferences(parsed)
        return
      }

      // Industry Standard: Display banner after user engagement or a 4.5-second dwell delay
      let hasTriggered = false
      let timer: ReturnType<typeof setTimeout> | null = null

      const triggerBanner = () => {
        if (hasTriggered) return
        hasTriggered = true
        if (timer) clearTimeout(timer)
        window.removeEventListener("scroll", handleScroll)
        setShowBanner(true)
      }

      const handleScroll = () => {
        if (window.scrollY > 200) {
          triggerBanner()
        }
      }

      // Grace period: allow user at least 3 seconds to absorb hero before scroll triggers it
      const graceTimer = setTimeout(() => {
        window.addEventListener("scroll", handleScroll, { passive: true })
      }, 3000)

      // Fallback timer: 4.5 seconds of active page dwell time
      timer = setTimeout(() => {
        triggerBanner()
      }, 4500)

      return () => {
        clearTimeout(graceTimer)
        if (timer) clearTimeout(timer)
        window.removeEventListener("scroll", handleScroll)
      }
    } catch {
      // If localStorage is unavailable, safe 5s delay
      const fallbackTimer = setTimeout(() => setShowBanner(true), 5000)
      return () => clearTimeout(fallbackTimer)
    }
  }, [])

  useEffect(() => {
    // Global hook & custom event listener to re-open preferences anywhere on the site
    const handleOpen = () => {
      setShowModal(true)
      setShowBanner(false)
    }

    window.openCookiePreferences = handleOpen
    window.addEventListener("open-cookie-preferences", handleOpen)

    return () => {
      window.removeEventListener("open-cookie-preferences", handleOpen)
    }
  }, [])

  const saveConsent = (updated: CookiePreferences) => {
    const record = {
      ...updated,
      necessary: true,
      marketing: false,
      timestamp: new Date().toISOString(),
      version: "1.0",
    }
    setPreferences(record)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
      window.dispatchEvent(
        new CustomEvent("cookie-consent-updated", { detail: record })
      )
    } catch (e) {
      console.error("Failed to save cookie preferences", e)
    }
    setShowBanner(false)
    setShowModal(false)
  }

  const handleAcceptAll = () => {
    saveConsent({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: false,
      timestamp: "",
      version: "1.0",
    })
  }

  const handleEssentialOnly = () => {
    saveConsent({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
      timestamp: "",
      version: "1.0",
    })
  }

  const handleSaveCustom = () => {
    saveConsent(preferences)
  }

  if (!mounted || (!showBanner && !showModal)) return null

  return (
    <>
      {/* ── Floating Cookie Banner ─────────────────────────────────── */}
      {showBanner && (
        <aside
          role="region"
          aria-label="Cookie and Privacy Consent"
          className="fixed right-4 bottom-4 left-4 z-50 mx-auto w-[calc(100%-2rem)] animate-in duration-300 slide-in-from-bottom-5 fade-in sm:right-6 sm:bottom-6 sm:left-auto sm:w-auto sm:max-w-xl sm:min-w-[480px] md:max-w-2xl md:min-w-[560px]"
        >
          <div className="relative overflow-hidden rounded-sm border border-border/90 bg-card/95 p-5 shadow-2xl backdrop-blur-xl transition-all">
            {/* Corner Cyber Accents */}
            <div className="pointer-events-none absolute top-2 left-2 h-2.5 w-2.5 border-t-2 border-l-2 border-primary/50" />
            <div className="pointer-events-none absolute top-2 right-2 h-2.5 w-2.5 border-t-2 border-r-2 border-primary/50" />
            <div className="pointer-events-none absolute bottom-2 left-2 h-2.5 w-2.5 border-b-2 border-l-2 border-primary/50" />
            <div className="pointer-events-none absolute right-2 bottom-2 h-2.5 w-2.5 border-r-2 border-b-2 border-primary/50" />

            {/* Header Badge */}
            <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                <span className="font-mono text-[11px] font-bold tracking-wider text-primary uppercase">
                  SYSTEM // PRIVACY_CONTROLS
                </span>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">
                GDPR / CCPA
              </span>
            </div>

            {/* Description Body */}
            <div className="space-y-2 py-3.5">
              <p className="text-xs leading-relaxed text-foreground/90 sm:text-sm">
                We utilize essential cookies and functional local storage for
                session authentication, theme persistence, and security
                challenges.{" "}
                <strong className="font-semibold text-foreground">
                  We never deploy third-party advertising trackers.
                </strong>
              </p>
              <p className="text-[11px] text-muted-foreground">
                Customize your preferences or inspect our{" "}
                <a
                  href="/privacy#cookies-storage"
                  className="text-primary underline underline-offset-2 transition-colors hover:text-foreground"
                >
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a
                  href="/terms"
                  className="text-primary underline underline-offset-2 transition-colors hover:text-foreground"
                >
                  Terms of Use
                </a>
                .
              </p>
            </div>

            {/* Action Buttons Grid */}
            <div className="flex flex-col items-stretch justify-between gap-2 border-t border-border/50 pt-2 font-mono text-xs sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => {
                  setShowBanner(false)
                  setShowModal(true)
                }}
                className="flex items-center justify-center gap-1.5 rounded-xs border border-border/70 bg-background/80 px-3 py-2 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
              >
                <HugeiconsIcon icon={Settings02Icon} className="size-3.5" />
                <span>Customize</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleEssentialOnly}
                  className="flex-1 rounded-xs border border-border/80 bg-secondary/80 px-3.5 py-2 font-semibold text-secondary-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none sm:flex-initial"
                >
                  Essential Only
                </button>

                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xs bg-primary px-4 py-2 font-bold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none sm:flex-initial"
                >
                  <HugeiconsIcon icon={Tick02Icon} className="size-3.5" />
                  <span>Accept All</span>
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* ── Detailed Preferences Dialog Modal ──────────────────────── */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent
          className="w-[calc(100vw-2rem)] rounded-sm border border-border bg-card/95 p-6 shadow-2xl backdrop-blur-2xl sm:w-[92vw] sm:max-w-3xl sm:min-w-[580px] sm:p-8 md:max-w-3xl md:min-w-[680px] lg:max-w-4xl lg:min-w-[780px]"
          showCloseButton={true}
        >
          {/* Cyber accents on modal */}
          <div className="pointer-events-none absolute top-2 left-2 h-3 w-3 border-t-2 border-l-2 border-primary/40" />
          <div className="pointer-events-none absolute top-2 right-2 h-3 w-3 border-t-2 border-r-2 border-primary/40" />
          <div className="pointer-events-none absolute bottom-2 left-2 h-3 w-3 border-b-2 border-l-2 border-primary/40" />
          <div className="pointer-events-none absolute right-2 bottom-2 h-3 w-3 border-r-2 border-b-2 border-primary/40" />

          <DialogHeader className="space-y-2 border-b border-border/70 pb-4 text-left">
            <div className="flex items-center gap-2">
              <span className="border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold text-primary uppercase">
                PRIVACY PREFERENCES
              </span>
            </div>
            <DialogTitle className="font-mono text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Cookie &amp; Local Storage Manager
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed text-muted-foreground">
              Configure how local storage and session cookies are used on this
              device. Essential cookies are strictly necessary for core
              functionality and cannot be switched off.
            </DialogDescription>
          </DialogHeader>

          {/* Preferences Categories List */}
          <div className="max-h-[60vh] space-y-3.5 overflow-y-auto py-2 pr-1">
            {/* 1. Strictly Necessary */}
            <div className="rounded-xs border border-border/70 bg-background/50 p-4 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon
                      icon={SecurityCheckIcon}
                      className="size-4 text-primary"
                    />
                    <span className="font-mono text-xs font-bold text-foreground">
                      1. Strictly Necessary &amp; Security
                    </span>
                    <span className="rounded-xs bg-primary/15 px-2 py-0.5 font-mono text-[9px] font-bold text-primary uppercase">
                      ALWAYS ACTIVE
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Essential for secure authentication sessions, CSRF
                    prevention, Cloudflare Turnstile bot verification
                    challenges, and remembering your dark/light theme setting.
                  </p>
                </div>
                <div className="pt-0.5">
                  <Switch
                    checked={true}
                    disabled={true}
                    aria-label="Strictly Necessary Cookies (Always active)"
                  />
                </div>
              </div>
            </div>

            {/* 2. Functional & UI State */}
            <div className="rounded-xs border border-border/70 bg-background/50 p-4 transition-colors hover:border-primary/30">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-foreground">
                      2. Functional &amp; User Experience
                    </span>
                    <span className="py-0.2 border border-border px-1.5 font-mono text-[9px] text-muted-foreground uppercase">
                      OPTIONAL
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Stores custom code editor font preferences, reading progress
                    on technical articles, and bookmarking states for a seamless
                    developer experience.
                  </p>
                </div>
                <div className="pt-0.5">
                  <Switch
                    checked={preferences.functional}
                    onCheckedChange={(checked) =>
                      setPreferences((prev) => ({
                        ...prev,
                        functional: checked,
                      }))
                    }
                    aria-label="Functional and Experience Preferences"
                  />
                </div>
              </div>
            </div>

            {/* 3. Analytics & Diagnostics */}
            <div className="rounded-xs border border-border/70 bg-background/50 p-4 transition-colors hover:border-primary/30">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-foreground">
                      3. Anonymous Telemetry &amp; Performance
                    </span>
                    <span className="py-0.2 border border-border px-1.5 font-mono text-[9px] text-muted-foreground uppercase">
                      OPTIONAL
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Collects aggregated, non-identifying Core Web Vitals and
                    load performance metrics to help us optimize edge routing
                    and frontend rendering speeds.
                  </p>
                </div>
                <div className="pt-0.5">
                  <Switch
                    checked={preferences.analytics}
                    onCheckedChange={(checked) =>
                      setPreferences((prev) => ({
                        ...prev,
                        analytics: checked,
                      }))
                    }
                    aria-label="Anonymous Telemetry and Performance"
                  />
                </div>
              </div>
            </div>

            {/* 4. Marketing & Targeted Advertising */}
            <div className="rounded-xs border border-border/70 bg-background/30 p-4 opacity-75">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-muted-foreground">
                      4. Advertising &amp; Commercial Trackers
                    </span>
                    <span className="rounded-xs bg-muted px-2 py-0.5 font-mono text-[9px] font-bold text-muted-foreground uppercase">
                      ZERO ADS / NOT USED
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    We do not partner with ad networks, sell user profiles, or
                    embed behavioral marketing pixels. This category is
                    permanently disabled.
                  </p>
                </div>
                <div className="pt-0.5">
                  <Switch
                    checked={false}
                    disabled={true}
                    aria-label="Marketing Tracking (Permanently disabled)"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dialog Action Buttons */}
          <div className="flex flex-col items-stretch justify-between gap-3 border-t border-border/70 pt-4 font-mono text-xs sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleEssentialOnly}
              className="rounded-xs border border-border/80 bg-background px-4 py-2 font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              Reject Non-Essential
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAcceptAll}
                className="flex-1 rounded-xs border border-primary/30 bg-primary/10 px-4 py-2 font-semibold text-primary transition-colors hover:bg-primary/20 sm:flex-initial"
              >
                Accept All
              </button>

              <button
                type="button"
                onClick={handleSaveCustom}
                className="flex-1 rounded-xs bg-primary px-5 py-2 font-bold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 sm:flex-initial"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
