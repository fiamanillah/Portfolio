// ── BookingSection.tsx ────────────────────────────────────────────────────────
// Main orchestrator for the 2-step 1-on-1 booking flow.
// Step 1: Date & Time Selector (side-by-side Calendar + Available Times)
// Step 2: Details & Confirm (Topic dropdown with custom other option, notes, guest info)

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { bookingApi } from "@/lib/api/bookingApi"
import { useAuthSession } from "@/lib/authStore"
import type { TimeSlot, Booking } from "@workspace/shared"
import {
  TOPIC_OPTIONS,
  OTHER_TOPIC_VALUE,
  detectEmailTypo,
} from "./types"
import { BookingDateTimeStep } from "./BookingDateTimeStep"
import { BookingDetailsForm } from "./BookingDetailsForm"
import { BookingConfirmation } from "./BookingConfirmation"

// ── Session Durations ─────────────────────────────────────────────────────────
const DURATIONS = [15, 30, 45, 60] as const

function formatSlotTimeRange(startTimeStr: string, durationMinutes: number, timezone: string): string {
  const start = new Date(startTimeStr)
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000)

  const startFormatted = start.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone,
  })

  const endFormatted = end.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone,
  })

  return `${startFormatted} – ${endFormatted}`
}

function formatDateLong(dateStr: string): string {
  if (!dateStr) return ""
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default function BookingSection() {
  const { user, isAuthenticated } = useAuthSession()

  // Detect browser timezone once
  const userDetectedTimezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
    } catch {
      return "UTC"
    }
  }, [])

  // ── 2-Step Wizard: 1 = Date & Time, 2 = Details & Confirm ─────────────────
  const [currentStep, setCurrentStep] = useState<1 | 2>(1)

  // ── Booking selections ───────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<number>(30)
  const [selectedTimezone, setSelectedTimezone] = useState<string>(userDetectedTimezone)
  const [selectedTopic, setSelectedTopic] = useState<string>(TOPIC_OPTIONS[0].id)
  const [customTopic, setCustomTopic] = useState<string>("")

  // ── Guest form fields ────────────────────────────────────────────────────
  const [useProfileInfo, setUseProfileInfo] = useState<boolean>(true)
  const [guestName, setGuestName] = useState<string>("")
  const [guestEmail, setGuestEmail] = useState<string>("")
  const [guestNotes, setGuestNotes] = useState<string>("")
  const [hpField, setHpField] = useState<string>("")
  const [captchaToken, setCaptchaToken] = useState<string>("")
  const [suggestedEmail, setSuggestedEmail] = useState<string | null>(null)

  // ── Cancellation states (via link with token) ───────────────────────────
  const [cancelToken, setCancelToken] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState<string>("")
  const [isCancelling, setIsCancelling] = useState<boolean>(false)
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState<string | null>(null)
  const [cancelErrorMsg, setCancelErrorMsg] = useState<string | null>(null)

  // ── API states ───────────────────────────────────────────────────────────
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null)

  // ── Calendar month navigation ────────────────────────────────────────────
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => {
    const d = new Date()
    d.setDate(1)
    return d
  })

  // ── Parse cancelToken from query string or hash on mount ────────────────
  useEffect(() => {
    if (typeof window === "undefined") return
    const searchParams = new URLSearchParams(window.location.search)
    let token = searchParams.get("cancelToken") || searchParams.get("token")
    if (!token && window.location.hash.includes("token=")) {
      const hashQuery = window.location.hash.split("?")[1]
      if (hashQuery) {
        const hp = new URLSearchParams(hashQuery)
        token = hp.get("cancelToken") || hp.get("token")
      }
    }
    if (token) {
      setCancelToken(token)
    }
  }, [])

  // ── Handle booking cancellation ─────────────────────────────────────────
  const handleCancelBooking = async () => {
    if (!cancelToken) return
    setIsCancelling(true)
    setCancelErrorMsg(null)
    try {
      const res = await bookingApi.cancelBooking(cancelToken, cancelReason.trim() || undefined)
      if (res.success) {
        setCancelSuccessMsg(res.message || "Your scheduled meeting session has been cancelled successfully.")
      } else {
        setCancelErrorMsg(res.error || res.message || "Failed to cancel booking. It may have already been cancelled.")
      }
    } catch (err: any) {
      setCancelErrorMsg(err?.message || "An unexpected error occurred while cancelling.")
    } finally {
      setIsCancelling(false)
    }
  }

  // ── Sync logged-in user into form ────────────────────────────────────────
  useEffect(() => {
    if (isAuthenticated && user) {
      if (useProfileInfo) {
        setGuestName(user.name || "")
        setGuestEmail(user.email || "")
      }
    } else {
      setUseProfileInfo(false)
    }
  }, [isAuthenticated, user, useProfileInfo])

  // ── Default date to today ────────────────────────────────────────────────
  useEffect(() => {
    setSelectedDate(new Date().toISOString().split("T")[0])
  }, [])

  // ── Fetch available time slots when date/tz/duration changes ──────────────
  useEffect(() => {
    if (!selectedDate) return
    let mounted = true
    setIsLoadingSlots(true)
    setErrorMsg(null)

    bookingApi
      .getAvailableSlots(selectedDate, selectedTimezone, selectedDuration)
      .then((res) => {
        if (!mounted) return
        if (res.success && res.data) {
          setAvailableSlots(res.data)
        } else {
          setAvailableSlots([])
          if (res.error) setErrorMsg(res.error)
        }
      })
      .catch(() => {
        if (!mounted) return
        setErrorMsg("Failed to load time slots. Please pick another date.")
      })
      .finally(() => {
        if (mounted) setIsLoadingSlots(false)
      })

    return () => { mounted = false }
  }, [selectedDate, selectedTimezone, selectedDuration])

  // ── Dispatch layout refresh when step or major visual states change ──────
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("grid-refresh"))
      const timer = setTimeout(() => {
        window.dispatchEvent(new CustomEvent("grid-refresh"))
      }, 80)
      return () => clearTimeout(timer)
    }
  }, [currentStep, confirmedBooking, cancelToken, availableSlots.length, selectedSlot])

  // ── Email typo handler ───────────────────────────────────────────────────
  const handleEmailChange = useCallback((val: string) => {
    setGuestEmail(val)
    setSuggestedEmail(detectEmailTypo(val))
  }, [])

  const applySuggestedEmail = useCallback(() => {
    if (suggestedEmail) {
      setGuestEmail(suggestedEmail)
      setSuggestedEmail(null)
      setErrorMsg(null)
    }
  }, [suggestedEmail])

  // ── Duration change (clears slot selection) ──────────────────────────────
  const handleDurationChange = (dur: number) => {
    setSelectedDuration(dur)
    setSelectedSlot(null)
  }

  // ── Date select handler ──────────────────────────────────────────────────
  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr)
    setSelectedSlot(null)
  }

  // ── Slot select handler ──────────────────────────────────────────────────
  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot)
  }

  // ── Booking submission ───────────────────────────────────────────────────
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSlot) {
      setErrorMsg("Please select an available time slot.")
      setCurrentStep(1)
      return
    }

    const finalName = useProfileInfo && isAuthenticated && user ? user.name : guestName.trim()
    const finalEmail = useProfileInfo && isAuthenticated && user ? user.email : guestEmail.trim()

    if (!finalName || !finalEmail) {
      setErrorMsg("Please provide your name and email address.")
      return
    }

    const finalTopic =
      selectedTopic === OTHER_TOPIC_VALUE
        ? customTopic.trim() || "Custom Technical Consultation"
        : selectedTopic

    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      const res = await bookingApi.bookMeeting({
        guestName: finalName,
        guestEmail: finalEmail,
        guestNotes: guestNotes.trim() || undefined,
        meetingType: finalTopic,
        startTime: selectedSlot.startTime,
        durationMinutes: selectedDuration,
        timezone: selectedTimezone,
        captchaToken: captchaToken || undefined,
        hp_field: hpField || undefined,
      })

      if (res.success && res.data) {
        setConfirmedBooking(res.data)
      } else {
        const sugEmail = (res as any)?.details?.suggestedEmail || (res as any)?.data?.suggestedEmail
        if (sugEmail) setSuggestedEmail(sugEmail)
        setErrorMsg(res.message || res.error || "Failed to book meeting. Please try again.")

        // Reset Turnstile on error
        if ((window as any).turnstile && (window as any).turnstile.reset) {
          ;(window as any).turnstile.reset()
          setCaptchaToken("")
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred while booking.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render: Success Confirmation Screen
  // ─────────────────────────────────────────────────────────────────────────
  if (confirmedBooking) {
    return (
      <BookingConfirmation
        booking={confirmedBooking}
        selectedTimezone={selectedTimezone}
        onBookAnother={() => {
          setConfirmedBooking(null)
          setSelectedSlot(null)
          setCurrentStep(1)
        }}
      />
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render: Cancellation Portal (when cancelToken in URL)
  // ─────────────────────────────────────────────────────────────────────────
  if (cancelToken) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-destructive/40 bg-card p-6 shadow-xl sm:p-8">
        <div className="flex items-center gap-3 border-b border-destructive/20 pb-4">
          <div className="flex size-10 items-center justify-center rounded-lg border border-destructive/40 bg-destructive/10 text-destructive">
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <h3 className="font-mono text-base font-bold text-foreground">
              Cancel Scheduled Meeting
            </h3>
            <p className="font-mono text-xs text-muted-foreground">
              Manage your session status with Fi Amanillah
            </p>
          </div>
        </div>

        {cancelSuccessMsg ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 font-mono text-xs text-emerald-400">
              {cancelSuccessMsg}
            </div>
            <button
              type="button"
              onClick={() => {
                setCancelToken(null)
                setCancelSuccessMsg(null)
                if (typeof window !== "undefined") {
                  window.history.replaceState({}, document.title, window.location.pathname)
                }
              }}
              className="flex w-full items-center justify-center rounded-lg border border-primary bg-primary py-3 font-mono text-xs font-bold uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-90"
            >
              Schedule a New Consultation
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <p className="font-mono text-xs leading-relaxed text-muted-foreground">
              Are you sure you want to cancel this booking? If you cancel, your time slot will be released back to the public calendar and the Google Calendar event will be removed.
            </p>

            <div>
              <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Reason for cancellation (optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Let Fi know why you are cancelling..."
                rows={3}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
              />
            </div>

            {cancelErrorMsg && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 font-mono text-xs text-destructive">
                {cancelErrorMsg}
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2 sm:flex-row">
              <button
                type="button"
                onClick={handleCancelBooking}
                disabled={isCancelling}
                className="flex flex-1 items-center justify-center rounded-lg border border-destructive bg-destructive py-3 font-mono text-xs font-bold uppercase tracking-wider text-destructive-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isCancelling ? "Cancelling Booking..." : "Confirm Cancellation"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCancelToken(null)
                  if (typeof window !== "undefined") {
                    window.history.replaceState({}, document.title, window.location.pathname)
                  }
                }}
                disabled={isCancelling}
                className="flex items-center justify-center rounded-lg border border-border bg-background px-6 py-3 font-mono text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                Keep Booking
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render: Main 2-Step Booking Layout
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
      {/* ── Top Bar: 2-Step Navigation ───────────────────────────────── */}
      <div className="border-b border-border px-5 py-3.5 sm:px-6">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          {/* Step 1 Button */}
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={[
              "flex items-center gap-2 rounded-lg border px-3.5 py-1.5 font-bold uppercase tracking-wider transition-all",
              currentStep === 1
                ? "border-primary bg-primary text-primary-foreground shadow-xs"
                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
            ].join(" ")}
          >
            <span className="flex size-4 items-center justify-center rounded border border-current text-[9px] font-black">
              1
            </span>
            <span>Date & Time</span>
          </button>

          <span className="text-muted-foreground/40">→</span>

          {/* Step 2 Button */}
          <button
            type="button"
            onClick={() => {
              if (selectedSlot) setCurrentStep(2)
            }}
            disabled={!selectedSlot}
            className={[
              "flex items-center gap-2 rounded-lg border px-3.5 py-1.5 font-bold uppercase tracking-wider transition-all",
              currentStep === 2
                ? "border-primary bg-primary text-primary-foreground shadow-xs"
                : selectedSlot
                ? "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground cursor-pointer"
                : "cursor-not-allowed border-border/30 bg-background/50 text-muted-foreground/30",
            ].join(" ")}
          >
            <span className="flex size-4 items-center justify-center rounded border border-current text-[9px] font-black">
              2
            </span>
            <span>Details & Confirm</span>
          </button>
        </div>
      </div>

      {/* ── Two-Column Body ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.35fr]">

        {/* ── LEFT COLUMN: Host Identity, Call Length & Confirmed Slot Window ── */}
        <div className="flex flex-col justify-between border-b border-border lg:border-b-0 lg:border-r">
          <div className="divide-y divide-border">
            {/* Host Identity */}
            <div className="px-6 py-6">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <img
                    src="/fi.png"
                    alt="Fi Amanillah"
                    className="size-13 rounded-full border-2 border-primary/40 object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                    }}
                  />
                  {/* Online status indicator */}
                  <span className="absolute -bottom-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full border border-card bg-card">
                    <span className="size-2 rounded-full bg-emerald-500" />
                  </span>
                </div>
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Host & Consultant
                  </span>
                  <h4 className="text-base font-black tracking-tight text-foreground">Fi Amanillah</h4>
                  <p className="font-mono text-[11px] font-semibold text-primary">Author & Lead Architect</p>
                </div>
              </div>

              <p className="mt-3.5 font-mono text-[11px] leading-relaxed text-muted-foreground">
                Schedule a focused 1-on-1 technical consultation. Review system architecture, distributed microservices, performance bottlenecks, or discuss strategic engineering roadmaps.
              </p>
            </div>

            {/* Select Call Length */}
            <div className="px-6 py-5">
              <div className="mb-2.5 flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Select Call Length
                </span>
                <span className="font-mono text-[10px] font-semibold text-primary">
                  {selectedDuration} Minutes
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {DURATIONS.map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => handleDurationChange(dur)}
                    className={[
                      "rounded-lg border py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all",
                      selectedDuration === dur
                        ? "border-primary bg-primary text-primary-foreground shadow-xs"
                        : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                    ].join(" ")}
                  >
                    {dur}m
                  </button>
                ))}
              </div>
            </div>

            {/* Confirmed / Selected Slot Window (Directly below Call Length) */}
            <div className="px-6 py-5">
              <div className="mb-2.5 flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Selected Slot Window
                </span>
                {selectedSlot ? (
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-400">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Slot Selected
                  </span>
                ) : (
                  <span className="font-mono text-[10px] text-muted-foreground/70">
                    Pending selection
                  </span>
                )}
              </div>

              {selectedSlot ? (
                <div className="relative overflow-hidden rounded-xl border border-primary/40 bg-primary/5 p-4 transition-all">
                  <div className="space-y-1.5 font-mono">
                    <p className="text-sm font-bold text-foreground">
                      {formatSlotTimeRange(selectedSlot.startTime, selectedDuration, selectedTimezone)}
                    </p>
                    <p className="text-xs font-semibold text-primary">
                      {formatDateLong(selectedDate)}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                      <span>{selectedDuration} min session</span>
                      <span>·</span>
                      <span className="truncate">{selectedTimezone}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border/80 bg-background/40 p-4 text-center">
                  <p className="font-mono text-xs text-muted-foreground">
                    {selectedDate
                      ? `Select an available time slot for ${formatDateLong(selectedDate)}`
                      : "Pick a date and time slot from the calendar"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Session Perks & Badges */}
          <div className="border-t border-border bg-muted/10 px-6 py-4">
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 font-mono text-[10px] text-muted-foreground">
                <svg className="size-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Google Meet Video
              </span>
              <span className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 font-mono text-[10px] text-muted-foreground">
                <svg className="size-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Anti-Bot Protected
              </span>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Step 1 or Step 2 ────────────────────────── */}
        <div className="p-6 sm:p-8">

          {/* STEP 1: Date & Time Selector (Side-by-Side matching Screenshot) */}
          {currentStep === 1 && (
            <BookingDateTimeStep
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              availableSlots={availableSlots}
              isLoadingSlots={isLoadingSlots}
              currentMonthDate={currentMonthDate}
              selectedTimezone={selectedTimezone}
              userDetectedTimezone={userDetectedTimezone}
              onDateSelect={handleDateSelect}
              onSlotSelect={handleSlotSelect}
              onMonthChange={setCurrentMonthDate}
              onTimezoneChange={setSelectedTimezone}
              onProceedToDetails={() => {
                if (selectedSlot) setCurrentStep(2)
              }}
            />
          )}

          {/* STEP 2: Details & Confirm */}
          {currentStep === 2 && selectedSlot && (
            <div className="space-y-5">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary">
                  Step 2 of 2
                </span>
                <h3 className="font-mono text-base font-bold tracking-tight text-foreground">
                  Consultation Details & Verification
                </h3>
                <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                  Specify your discussion topic, notes, and attendee info to reserve your slot.
                </p>
              </div>

              <BookingDetailsForm
                selectedTopic={selectedTopic}
                customTopic={customTopic}
                isAuthenticated={isAuthenticated}
                user={user ? { name: user.name || "", email: user.email || "" } : null}
                useProfileInfo={useProfileInfo}
                onUseProfileInfoChange={setUseProfileInfo}
                guestName={guestName}
                guestEmail={guestEmail}
                guestNotes={guestNotes}
                hpField={hpField}
                onTopicChange={setSelectedTopic}
                onCustomTopicChange={setCustomTopic}
                onGuestNameChange={setGuestName}
                onGuestEmailChange={handleEmailChange}
                onGuestNotesChange={setGuestNotes}
                onHpFieldChange={setHpField}
                onCaptchaTokenChange={setCaptchaToken}
                suggestedEmail={suggestedEmail}
                onSuggestedEmailApply={applySuggestedEmail}
                errorMsg={errorMsg}
                isSubmitting={isSubmitting}
                onSubmit={handleBookingSubmit}
                onBack={() => setCurrentStep(1)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
