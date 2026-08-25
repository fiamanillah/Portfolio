// ── BookingDetailsForm.tsx ────────────────────────────────────────────────────
// Step 2: Guest details form with shadcn components.
// Consultation Topic dropdown (with custom other option + max length),
// Agenda/Notes (with max length protection), Turnstile CAPTCHA, and submit.

import React, { useRef, useCallback, useEffect, useState } from "react"
import {
  TOPIC_OPTIONS,
  OTHER_TOPIC_VALUE,
  MAX_TOPIC_LENGTH,
  MAX_NOTES_LENGTH,
} from "./types"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
} from "@workspace/ui/components/select"
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@workspace/ui/components/field"

interface BookingDetailsFormProps {
  selectedTopic: string
  customTopic: string

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
  onTopicChange: (topic: string) => void
  onCustomTopicChange: (customTopic: string) => void
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

export function BookingDetailsForm({
  selectedTopic,
  customTopic,
  isAuthenticated,
  user,
  useProfileInfo,
  onUseProfileInfoChange,
  guestName,
  guestEmail,
  guestNotes,
  hpField,
  onTopicChange,
  onCustomTopicChange,
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
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({})

  // Initialize Cloudflare Turnstile
  const initTurnstile = useCallback(() => {
    const isLocal =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1")
    const siteKey =
      (typeof import.meta !== "undefined" &&
        import.meta.env?.PUBLIC_TURNSTILE_SITE_KEY) ||
      (isLocal ? "1x00000000000000000000AA" : "0x4AAAAAAEMAnAognjniSApt")

    if (typeof window === "undefined" || !turnstileContainerRef.current) return

    const renderWidget = () => {
      if (
        (window as any).turnstile &&
        turnstileContainerRef.current &&
        !turnstileWidgetIdRef.current
      ) {
        try {
          const id = (window as any).turnstile.render(
            turnstileContainerRef.current,
            {
              sitekey: siteKey,
              theme: "auto",
              callback: (token: string) => {
                onCaptchaTokenChange(token)
                window.dispatchEvent(new CustomEvent("grid-refresh"))
              },
              "expired-callback": () => {
                onCaptchaTokenChange("")
                window.dispatchEvent(new CustomEvent("grid-refresh"))
              },
              "error-callback": () => {
                onCaptchaTokenChange("")
                window.dispatchEvent(new CustomEvent("grid-refresh"))
              },
            }
          )
          turnstileWidgetIdRef.current = id
          window.dispatchEvent(new CustomEvent("grid-refresh"))
        } catch (e) {
          console.warn("Turnstile init warning:", e)
        }
      }
    }

    if ((window as any).turnstile) {
      renderWidget()
    } else {
      let script = document.getElementById(
        "cf-turnstile-script"
      ) as HTMLScriptElement | null
      if (!script) {
        script = document.createElement("script")
        script.id = "cf-turnstile-script"
        script.src =
          "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        script.async = true
        script.defer = true
        document.head.appendChild(script)
      }
      script.addEventListener("load", renderWidget, { once: true })
    }
  }, [onCaptchaTokenChange])

  const showManualFields = !isAuthenticated || !useProfileInfo
  const isOtherSelected = selectedTopic === OTHER_TOPIC_VALUE

  useEffect(() => {
    initTurnstile()
  }, [initTurnstile])

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("grid-refresh"))
    }
  }, [clientErrors, errorMsg, isOtherSelected])

  const handleFormSubmit = (e: React.FormEvent) => {
    const errors: Record<string, string> = {}

    if (showManualFields) {
      if (!guestName.trim()) {
        errors.name = "Full name is required."
      } else if (guestName.trim().length < 2) {
        errors.name = "Name must be at least 2 characters."
      }

      if (!guestEmail.trim()) {
        errors.email = "Email address is required."
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim())) {
        errors.email = "Please enter a valid email address."
      }
    }

    if (isOtherSelected && !customTopic.trim()) {
      errors.customTopic = "Please enter a custom consultation topic."
    }

    if (guestNotes.length > MAX_NOTES_LENGTH) {
      errors.notes = `Notes cannot exceed ${MAX_NOTES_LENGTH} characters.`
    }

    setClientErrors(errors)

    if (Object.keys(errors).length > 0) {
      e.preventDefault()
      return
    }

    onSubmit(e)
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-5">
      {/* ── Error Banner ────────────────────────────────────────────── */}
      {errorMsg && (
        <div className="flex items-center justify-between rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3">
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
        <div className="rounded-lg border border-border bg-card/60">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
              Booking Identity
            </span>
            <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-400">
              Authenticated
            </span>
          </div>
          <div className="divide-y divide-border/40">
            <label className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-primary/5">
              <input
                type="radio"
                name="auth_mode"
                checked={useProfileInfo}
                onChange={() => onUseProfileInfoChange(true)}
                className="accent-primary"
              />
              <span className="font-mono text-xs text-foreground">
                <strong>{user.name}</strong>
                <span className="ml-1.5 text-muted-foreground">
                  ({user.email})
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-primary/5">
              <input
                type="radio"
                name="auth_mode"
                checked={!useProfileInfo}
                onChange={() => onUseProfileInfoChange(false)}
                className="accent-primary"
              />
              <span className="font-mono text-xs text-muted-foreground">
                Enter alternative name & email address
              </span>
            </label>
          </div>
        </div>
      )}

      {/* ── Manual Name & Email (Shadcn Fields) ───────────────────────── */}
      {showManualFields && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field data-invalid={!!clientErrors.name}>
            <FieldLabel className="font-mono text-[11px] font-bold tracking-widest uppercase">
              Full Name <span className="text-primary">*</span>
            </FieldLabel>
            <Input
              type="text"
              placeholder="e.g. Alex Morgan"
              value={guestName}
              onChange={(e) => {
                onGuestNameChange(e.target.value)
                if (clientErrors.name)
                  setClientErrors((prev) => ({ ...prev, name: "" }))
              }}
              className="font-mono text-xs"
              aria-invalid={!!clientErrors.name}
            />
            {clientErrors.name && <FieldError errors={clientErrors.name} />}
          </Field>

          <Field data-invalid={!!clientErrors.email}>
            <FieldLabel className="font-mono text-[11px] font-bold tracking-widest uppercase">
              Email Address <span className="text-primary">*</span>
            </FieldLabel>
            <Input
              type="email"
              placeholder="e.g. alex@example.com"
              value={guestEmail}
              onChange={(e) => {
                onGuestEmailChange(e.target.value)
                if (clientErrors.email)
                  setClientErrors((prev) => ({ ...prev, email: "" }))
              }}
              className="font-mono text-xs"
              aria-invalid={!!clientErrors.email}
            />
            {clientErrors.email && <FieldError errors={clientErrors.email} />}
            {suggestedEmail && !errorMsg && (
              <div className="mt-1 flex items-center justify-between rounded border border-amber-500/30 bg-amber-500/10 px-2.5 py-1">
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
          </Field>
        </div>
      )}

      {/* ── Consultation Topic Dropdown (Shadcn Select) ─────────────── */}
      <Field data-invalid={!!clientErrors.customTopic}>
        <div className="flex items-center justify-between">
          <FieldLabel className="font-mono text-[11px] font-bold tracking-widest uppercase">
            Consultation Topic <span className="text-primary">*</span>
          </FieldLabel>
          <span className="font-mono text-[10px] text-muted-foreground">
            Select session agenda
          </span>
        </div>

        <Select
          value={selectedTopic}
          onValueChange={(val) => {
            onTopicChange(val)
            if (val !== OTHER_TOPIC_VALUE) {
              setClientErrors((prev) => ({ ...prev, customTopic: "" }))
            }
          }}
        >
          <SelectTrigger
            className="w-full font-mono text-xs"
            aria-label="Choose consultation focus topic"
          >
            <SelectValue placeholder="Choose a consultation focus..." />
          </SelectTrigger>
          <SelectContent className="border border-border bg-card">
            <SelectGroup>
              <SelectLabel className="font-mono text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Primary Focus Areas
              </SelectLabel>
              {TOPIC_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.id}
                  value={opt.id}
                  className="font-mono text-xs"
                >
                  <span className="font-semibold text-foreground">
                    {opt.title}
                  </span>
                  <span className="ml-2 text-[10px] text-muted-foreground">
                    ({opt.badge})
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <FieldDescription className="font-mono text-[10px] text-muted-foreground">
          Choose the primary area of discussion for our meeting.
        </FieldDescription>
      </Field>

      {/* ── Custom Topic Input (when 'Other' is selected) ─────────────── */}
      {isOtherSelected && (
        <Field data-invalid={!!clientErrors.customTopic}>
          <div className="flex items-center justify-between">
            <FieldLabel className="font-mono text-[11px] font-bold tracking-widest uppercase">
              Custom Topic Title <span className="text-primary">*</span>
            </FieldLabel>
            <span
              className={[
                "font-mono text-[10px]",
                customTopic.length >= MAX_TOPIC_LENGTH
                  ? "font-bold text-destructive"
                  : "text-muted-foreground",
              ].join(" ")}
            >
              {customTopic.length} / {MAX_TOPIC_LENGTH}
            </span>
          </div>
          <Input
            type="text"
            maxLength={MAX_TOPIC_LENGTH}
            placeholder="e.g. Postgres Partitioning & Zero-Downtime Migration"
            value={customTopic}
            onChange={(e) => {
              onCustomTopicChange(e.target.value.slice(0, MAX_TOPIC_LENGTH))
              if (clientErrors.customTopic) {
                setClientErrors((prev) => ({ ...prev, customTopic: "" }))
              }
            }}
            className="font-mono text-xs"
            aria-invalid={!!clientErrors.customTopic}
          />
          {clientErrors.customTopic && (
            <FieldError errors={clientErrors.customTopic} />
          )}
          <FieldDescription className="font-mono text-[10px] text-muted-foreground">
            Provide a brief title for your custom consultation topic (max{" "}
            {MAX_TOPIC_LENGTH} chars).
          </FieldDescription>
        </Field>
      )}

      {/* ── Agenda / Notes Textarea (with Max Length Counter) ────────── */}
      <Field data-invalid={!!clientErrors.notes}>
        <div className="flex items-center justify-between">
          <FieldLabel className="font-mono text-[11px] font-bold tracking-widest uppercase">
            Agenda Context & Notes
            <span className="ml-1.5 font-normal tracking-normal text-muted-foreground/60">
              (optional)
            </span>
          </FieldLabel>
          <span
            className={[
              "font-mono text-[10px]",
              guestNotes.length >= MAX_NOTES_LENGTH
                ? "font-bold text-destructive"
                : "text-muted-foreground",
            ].join(" ")}
          >
            {guestNotes.length} / {MAX_NOTES_LENGTH}
          </span>
        </div>
        <Textarea
          rows={3}
          maxLength={MAX_NOTES_LENGTH}
          placeholder="Share context, repository links, architecture diagrams, or specific questions you'd like to cover..."
          value={guestNotes}
          onChange={(e) => {
            onGuestNotesChange(e.target.value.slice(0, MAX_NOTES_LENGTH))
            if (clientErrors.notes) {
              setClientErrors((prev) => ({ ...prev, notes: "" }))
            }
          }}
          className="font-mono text-xs"
          aria-invalid={!!clientErrors.notes}
        />
        {clientErrors.notes && <FieldError errors={clientErrors.notes} />}
        <FieldDescription className="font-mono text-[10px] text-muted-foreground">
          Include any background context or questions to ensure the session is
          as impactful as possible.
        </FieldDescription>
      </Field>

      {/* ── Honeypot Anti-Spam (Hidden) ─────────────────────────────── */}
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

      {/* ── Cloudflare Turnstile CAPTCHA ─────────────────────────────── */}
      <div className="flex min-h-[65px] items-center justify-center py-1">
        <div ref={turnstileContainerRef} id="turnstile-booking-widget" />
      </div>

      {/* ── Action Buttons ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-2.5 pt-2 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center rounded-lg border border-border bg-background px-5 py-3 font-mono text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          ‹ Back to Date & Time
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className={[
            "btn-shimmer relative flex flex-1 items-center justify-center gap-2 rounded-lg border border-primary bg-primary px-6 py-3 font-mono text-xs font-bold tracking-wider text-primary-foreground uppercase transition-all",
            "hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50",
          ].join(" ")}
        >
          {isSubmitting ? (
            <>
              <svg
                className="size-3.5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Scheduling Consultation...
            </>
          ) : (
            <>
              Confirm & Schedule Meeting
              <svg
                className="size-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
