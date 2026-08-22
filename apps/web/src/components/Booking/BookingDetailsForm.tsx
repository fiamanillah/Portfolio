// ── BookingDetailsForm.tsx ────────────────────────────────────────────────────
// Step 2: Guest info, notes, honeypot, Turnstile CAPTCHA, and submit.

import React, { useRef, useCallback, useEffect } from "react"
import type { TimeSlot } from "@workspace/shared"

interface BookingDetailsFormProps {
  selectedSlot: TimeSlot
  selectedTimezone: string
  selectedDate: string
  selectedTopic: string
  selectedDuration: number

  // Auth state
  isAuthenticated: boolean
  user: { name: string; email: string } | null
  useProfileInfo: boolean
  onUseProfileInfoChange: (val: boolean) => void

  // Form fields
  guestName: string
  guestEmail: string
  guestNotes: string
  hpField: string
  onGuestNameChange: (val: string) => void
  onGuestEmailChange: (val: string) => void
  onGuestNotesChange: (val: string) => void
  onHpFieldChange: (val: string) => void
  onCaptchaTokenChange: (token: string) => void

  // Email suggestion
  suggestedEmail: string | null
  onSuggestedEmailApply: () => void

  // Error
  errorMsg: string | null

  // Submission
  isSubmitting: boolean
  onSubmit: (e: React.FormEvent) => void
  onBack: () => void
}

function formatSlotTime(isoString: string, timezone: string): string {
  return new Date(isoString).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone,
  })
}

function formatDateLabel(dateStr: string): string {
  if (!dateStr) return ""
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function BookingDetailsForm({
  selectedSlot,
  selectedTimezone,
  selectedDate,
  selectedTopic,
  selectedDuration,
  isAuthenticated,
  user,
  useProfileInfo,
  onUseProfileInfoChange,
  guestName,
  guestEmail,
  guestNotes,
  hpField,
  onGuestNameChange,
  onGuestEmailChange,
  onGuestNotesChange,
  onHpFieldChange,
  onCaptchaTokenChange,
  suggestedEmail,
  onSuggestedEmailApply,
  errorMsg,
  isSubmitting,
  onSubmit,
  onBack,
}: BookingDetailsFormProps) {
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null)
  const turnstileWidgetIdRef = useRef<string | null>(null)

  // Initialize Cloudflare Turnstile
  const initTurnstile = useCallback(() => {
    const siteKey =
      (typeof import.meta !== "undefined" && import.meta.env?.PUBLIC_TURNSTILE_SITE_KEY) ||
      "1x00000000000000000000AA"

    if (typeof window === "undefined" || !turnstileContainerRef.current) return

    const renderWidget = () => {
      if (
        (window as any).turnstile &&
        turnstileContainerRef.current &&
        !turnstileWidgetIdRef.current
      ) {
        try {
          const id = (window as any).turnstile.render(turnstileContainerRef.current, {
            sitekey: siteKey,
            theme: "auto",
            callback: (token: string) => onCaptchaTokenChange(token),
            "expired-callback": () => onCaptchaTokenChange(""),
            "error-callback": () => onCaptchaTokenChange(""),
          })
          turnstileWidgetIdRef.current = id
        } catch (e) {
          console.warn("Turnstile init warning:", e)
        }
      }
    }

    if ((window as any).turnstile) {
      renderWidget()
    } else {
      let script = document.getElementById("cf-turnstile-script") as HTMLScriptElement | null
      if (!script) {
        script = document.createElement("script")
        script.id = "cf-turnstile-script"
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        script.async = true
        script.defer = true
        document.head.appendChild(script)
      }
      script.addEventListener("load", renderWidget, { once: true })
    }
  }, [onCaptchaTokenChange])

  useEffect(() => {
    initTurnstile()
  }, [initTurnstile])

  const showManualFields = !isAuthenticated || !useProfileInfo

  return (
    <form onSubmit={onSubmit} className="space-y-5">

      {/* ── Selected Slot Recap ─────────────────────────────────────── */}
      <div className="relative border border-primary/30 bg-primary/5">
        {/* Corner brackets */}
        <div className="pointer-events-none absolute top-0 left-0 h-3 w-3 border-t border-l border-primary/60" />
        <div className="pointer-events-none absolute top-0 right-0 h-3 w-3 border-t border-r border-primary/60" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-3 w-3 border-b border-l border-primary/60" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b border-r border-primary/60" />

        <div className="flex items-start justify-between px-4 py-3 sm:items-center">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
              Selected Window
            </p>
            <p className="mt-0.5 font-mono text-sm font-bold text-foreground">
              {formatSlotTime(selectedSlot.startTime, selectedTimezone)}
              <span className="ml-1.5 text-muted-foreground">({selectedTimezone})</span>
            </p>
            <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
              {formatDateLabel(selectedDate)} · {selectedDuration}min
            </p>
            <p className="mt-1 font-mono text-[10px] text-muted-foreground/70 line-clamp-1">
              {selectedTopic}
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="mt-1 border border-border/80 bg-background px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            Change
          </button>
        </div>
      </div>

      {/* ── Error Banner ────────────────────────────────────────────── */}
      {errorMsg && (
        <div className="flex items-center justify-between border border-destructive/40 bg-destructive/8 px-4 py-3">
          <span className="font-mono text-xs text-destructive">{errorMsg}</span>
          {suggestedEmail && (
            <button
              type="button"
              onClick={onSuggestedEmailApply}
              className="ml-3 font-mono text-xs font-bold text-primary underline"
            >
              Use {suggestedEmail}
            </button>
          )}
        </div>
      )}

      {/* ── Logged-in Profile Toggle ────────────────────────────────── */}
      {isAuthenticated && user && (
        <div className="border border-border bg-background/60">
          <div className="flex items-center justify-between border-b border-border px-4 py-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Booking As
            </span>
            <span className="border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-400">
              Logged In
            </span>
          </div>
          <div className="divide-y divide-border/40">
            <label className="flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors hover:bg-primary/5">
              <input
                type="radio"
                name="auth_mode"
                checked={useProfileInfo}
                onChange={() => onUseProfileInfoChange(true)}
                className="accent-primary"
              />
              <span className="font-mono text-xs text-foreground">
                <strong>{user.name}</strong>
                <span className="ml-1.5 text-muted-foreground">({user.email})</span>
              </span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors hover:bg-primary/5">
              <input
                type="radio"
                name="auth_mode"
                checked={!useProfileInfo}
                onChange={() => onUseProfileInfoChange(false)}
                className="accent-primary"
              />
              <span className="font-mono text-xs text-muted-foreground">Use a different name & email</span>
            </label>
          </div>
        </div>
      )}

      {/* ── Manual Name & Email ─────────────────────────────────────── */}
      {showManualFields && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Full Name <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Jane Doe"
              value={guestName}
              onChange={(e) => onGuestNameChange(e.target.value)}
              className="w-full border border-border bg-background px-3.5 py-2.5 font-mono text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Email Address <span className="text-primary">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="jane@company.com"
              value={guestEmail}
              onChange={(e) => onGuestEmailChange(e.target.value)}
              className="w-full border border-border bg-background px-3.5 py-2.5 font-mono text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {suggestedEmail && !errorMsg && (
              <div className="flex items-center justify-between border border-amber-500/30 bg-amber-500/8 px-2.5 py-1.5">
                <span className="font-mono text-[10px] text-amber-400">
                  Did you mean <strong>{suggestedEmail}</strong>?
                </span>
                <button
                  type="button"
                  onClick={onSuggestedEmailApply}
                  className="font-mono text-[10px] font-bold text-primary underline"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Agenda / Notes ──────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Agenda / Notes
          <span className="ml-1.5 normal-case tracking-normal text-muted-foreground/60">(optional)</span>
        </label>
        <textarea
          rows={3}
          placeholder="Share context, architecture topics, or questions you'd like to address..."
          value={guestNotes}
          onChange={(e) => onGuestNotesChange(e.target.value)}
          className="w-full resize-none border border-border bg-background px-3.5 py-2.5 font-mono text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* ── Honeypot (Bot Defense) ──────────────────────────────────── */}
      <div className="hidden" aria-hidden="true" style={{ display: "none" }}>
        <label htmlFor="booking_hp_field">Do not fill this field</label>
        <input
          id="booking_hp_field"
          type="text"
          name="hp_field"
          tabIndex={-1}
          autoComplete="off"
          value={hpField}
          onChange={(e) => onHpFieldChange(e.target.value)}
        />
      </div>

      {/* ── Turnstile CAPTCHA ────────────────────────────────────────── */}
      <div className="flex justify-center py-1">
        <div ref={turnstileContainerRef} id="turnstile-booking-widget" />
      </div>

      {/* ── Action Buttons ───────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="border border-border bg-background px-5 py-3 font-mono text-xs font-medium text-muted-foreground transition-colors hover:border-border/80 hover:text-foreground"
        >
          ‹ Back
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className={[
            "btn-shimmer relative flex flex-1 items-center justify-center gap-2 border border-primary bg-primary px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-primary-foreground transition-all",
            "hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50",
          ].join(" ")}
        >
          {isSubmitting ? (
            <>
              <svg className="size-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Confirming & Syncing...
            </>
          ) : (
            <>
              Confirm & Schedule Meeting
              <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
