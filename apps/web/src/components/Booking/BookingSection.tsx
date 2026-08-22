// ── BookingSection.tsx ────────────────────────────────────────────────────────
// Main orchestrator for the 1-on-1 booking flow.
// Manages all state and effects; delegates UI to focused sub-components.

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { bookingApi } from "@/lib/api/bookingApi"
import { useAuthSession } from "@/lib/authStore"
import type { TimeSlot, Booking } from "@workspace/shared"
import {
  TOPIC_OPTIONS,
  detectEmailTypo,
} from "./types"
import { BookingCalendar } from "./BookingCalendar"
import { BookingSlots } from "./BookingSlots"
import { TopicSelector } from "./TopicSelector"
import { BookingDetailsForm } from "./BookingDetailsForm"
import { BookingConfirmation } from "./BookingConfirmation"

// ── Session Durations ─────────────────────────────────────────────────────────
const DURATIONS = [15, 30, 45, 60] as const

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

  // ── Wizard step ──────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState<1 | 2>(1)

  // ── Booking selections ───────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<number>(30)
  const [selectedTimezone, setSelectedTimezone] = useState<string>(userDetectedTimezone)
  const [selectedTopic, setSelectedTopic] = useState<string>(TOPIC_OPTIONS[0].id)

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

  // ── Calendar month navigation ────────────────────────────────────────────
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => {
    const d = new Date()
    d.setDate(1)
    return d
  })

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

  // ── Fetch available time slots ───────────────────────────────────────────
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

    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      const res = await bookingApi.bookMeeting({
        guestName: finalName,
        guestEmail: finalEmail,
        guestNotes: guestNotes.trim() || undefined,
        meetingType: selectedTopic,
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

  // ── Duration change (clears slot selection) ──────────────────────────────
  const handleDurationChange = (dur: number) => {
    setSelectedDuration(dur)
    setSelectedSlot(null)
  }

  // ── Date change (clears slot selection) ─────────────────────────────────
  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr)
    setSelectedSlot(null)
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render: Success Confirmation
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
      <div className="mx-auto max-w-xl border border-destructive/40 bg-card p-6 sm:p-8">
        <div className="flex items-center gap-3 border-b border-destructive/20 pb-4">
          <div className="flex size-10 items-center justify-center border border-destructive/40 bg-destructive/10 text-destructive">
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
            <div className="border border-emerald-500/30 bg-emerald-500/10 p-4 font-mono text-xs text-emerald-400">
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
              className="flex w-full items-center justify-center border border-primary bg-primary py-3 font-mono text-xs font-bold uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-90"
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
                className="w-full border border-border bg-background px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
              />
            </div>

            {cancelErrorMsg && (
              <div className="border border-destructive/40 bg-destructive/10 p-3 font-mono text-xs text-destructive">
                {cancelErrorMsg}
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2 sm:flex-row">
              <button
                type="button"
                onClick={handleCancelBooking}
                disabled={isCancelling}
                className="flex flex-1 items-center justify-center border border-destructive bg-destructive py-3 font-mono text-xs font-bold uppercase tracking-wider text-destructive-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
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
                className="flex items-center justify-center border border-border bg-background px-6 py-3 font-mono text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
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
  // Render: Main booking layout
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="relative border border-border bg-card">
      {/* Corner bracket decorators (matching About terminal card) */}
      <div className="pointer-events-none absolute top-0 left-0 z-10 h-5 w-5 border-t-[1.5px] border-l-[1.5px] border-primary/60" />
      <div className="pointer-events-none absolute top-0 right-0 z-10 h-5 w-5 border-t-[1.5px] border-r-[1.5px] border-primary/60" />
      <div className="pointer-events-none absolute bottom-0 left-0 z-10 h-5 w-5 border-b-[1.5px] border-l-[1.5px] border-primary/60" />
      <div className="pointer-events-none absolute bottom-0 right-0 z-10 h-5 w-5 border-b-[1.5px] border-r-[1.5px] border-primary/60" />

      {/* ── Top Bar: Stepper + Live Sync ─────────────────────────────── */}
      <div className="flex flex-col gap-3 border-b border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Step pills */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={[
              "flex items-center gap-2 border px-3 py-1.5 font-bold uppercase tracking-wider transition-colors",
              currentStep === 1
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
            ].join(" ")}
          >
            <span className="flex size-4 items-center justify-center border border-current text-[9px] font-black">
              1
            </span>
            Date & Time
          </button>

          <span className="text-border">—</span>

          <button
            type="button"
            onClick={() => { if (selectedSlot) setCurrentStep(2) }}
            disabled={!selectedSlot}
            className={[
              "flex items-center gap-2 border px-3 py-1.5 font-bold uppercase tracking-wider transition-colors",
              currentStep === 2
                ? "border-primary bg-primary text-primary-foreground"
                : selectedSlot
                ? "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground cursor-pointer"
                : "cursor-not-allowed border-border/30 bg-background/50 text-muted-foreground/30",
            ].join(" ")}
          >
            <span className="flex size-4 items-center justify-center border border-current text-[9px] font-black">
              2
            </span>
            Details & Confirm
          </button>
        </div>

        {/* Live sync indicator */}
        <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <span className="font-semibold text-foreground/70">Google Calendar Live Sync</span>
        </div>
      </div>

      {/* ── Two-Column Body ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr]">

        {/* ── LEFT COLUMN: Host Info, Duration & Topics ──────────────── */}
        <div className="border-b border-border lg:border-b-0 lg:border-r">
          {/* Host Identity */}
          <div className="border-b border-border px-6 py-5">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <img
                  src="/fi.png"
                  alt="Fi Amanillah"
                  className="size-12 border border-primary/30 object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                  }}
                />
                {/* Online dot */}
                <span className="absolute -bottom-0.5 -right-0.5 flex size-3.5 items-center justify-center border border-card bg-card">
                  <span className="size-2 rounded-full bg-emerald-500" />
                </span>
              </div>
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Host
                </p>
                <h4 className="text-base font-black tracking-tight text-foreground">Fi Amanillah</h4>
                <p className="font-mono text-[10px] text-primary">Author & Lead Architect</p>
              </div>
            </div>

            <p className="mt-4 font-mono text-[11px] leading-relaxed text-muted-foreground">
              Reserve a high-impact video consultation to review distributed architectures,
              performance bottlenecks, or discuss system engineering strategies.
            </p>

            {/* Session metadata pills */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 border border-border bg-background px-2.5 py-1 font-mono text-[10px] text-muted-foreground">
                <svg className="size-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {selectedDuration}min Direct Call
              </span>
              <span className="flex items-center gap-1.5 border border-border bg-background px-2.5 py-1 font-mono text-[10px] text-muted-foreground">
                <svg className="size-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Google Meet
              </span>
              <span className="flex items-center gap-1.5 border border-border bg-background px-2.5 py-1 font-mono text-[10px] text-muted-foreground">
                <svg className="size-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Bot Protected
              </span>
            </div>
          </div>

          {/* Session Duration */}
          <div className="border-b border-border px-6 py-5">
            <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Session Length
            </p>
            <div className="grid grid-cols-4 gap-2">
              {DURATIONS.map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => handleDurationChange(dur)}
                  className={[
                    "border py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-colors",
                    selectedDuration === dur
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  ].join(" ")}
                >
                  {dur}m
                </button>
              ))}
            </div>
          </div>

          {/* Consultation Topics */}
          <div className="px-6 py-5">
            <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Consultation Topic
            </p>
            <TopicSelector
              topics={TOPIC_OPTIONS}
              selectedTopic={selectedTopic}
              onTopicSelect={setSelectedTopic}
            />
          </div>
        </div>

        {/* ── RIGHT COLUMN: Step 1 or Step 2 ────────────────────────── */}
        <div className="px-6 py-6">

          {/* STEP 1: Date, Calendar & Slot Picker */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-foreground">
                  Select Date & Time
                </h4>
                <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                  Slots are checked against live calendar availability.
                </p>
              </div>

              {/* Calendar */}
              <BookingCalendar
                selectedDate={selectedDate}
                currentMonthDate={currentMonthDate}
                selectedTimezone={selectedTimezone}
                userDetectedTimezone={userDetectedTimezone}
                onDateSelect={handleDateSelect}
                onMonthChange={setCurrentMonthDate}
                onTimezoneChange={setSelectedTimezone}
              />

              {/* Divider */}
              <div className="border-t border-border" />

              {/* Time Slots */}
              <BookingSlots
                slots={availableSlots}
                selectedSlot={selectedSlot}
                isLoading={isLoadingSlots}
                selectedDate={selectedDate}
                selectedTimezone={selectedTimezone}
                onSlotSelect={setSelectedSlot}
              />

              {/* Global error (step 1) */}
              {errorMsg && !selectedSlot && (
                <div className="border border-destructive/40 bg-destructive/8 px-4 py-3 font-mono text-xs text-destructive">
                  {errorMsg}
                </div>
              )}

              {/* Continue CTA */}
              {selectedSlot && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="btn-shimmer flex w-full items-center justify-center gap-2 border border-primary bg-primary py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.99]"
                >
                  Continue to Details & Verification
                  <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* STEP 2: Details Form */}
          {currentStep === 2 && selectedSlot && (
            <BookingDetailsForm
              selectedSlot={selectedSlot}
              selectedTimezone={selectedTimezone}
              selectedDate={selectedDate}
              selectedTopic={selectedTopic}
              selectedDuration={selectedDuration}
              isAuthenticated={isAuthenticated}
              user={user ? { name: user.name || "", email: user.email || "" } : null}
              useProfileInfo={useProfileInfo}
              onUseProfileInfoChange={setUseProfileInfo}
              guestName={guestName}
              guestEmail={guestEmail}
              guestNotes={guestNotes}
              hpField={hpField}
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
          )}
        </div>
      </div>
    </div>
  )
}
