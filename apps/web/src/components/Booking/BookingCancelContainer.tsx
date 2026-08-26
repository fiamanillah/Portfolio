// ── BookingCancelContainer.tsx ──────────────────────────────────────────────
// Interactive cancellation portal for attendees managing their consultation bookings.

import React, { useState, useEffect, useMemo } from "react"
import { bookingApi } from "@/lib/api/bookingApi"
import type { Booking, BookingStatus } from "@workspace/shared"

function getInitialToken(): string | null {
  if (typeof window === "undefined") return null
  const searchParams = new URLSearchParams(window.location.search)
  let parsedToken = searchParams.get("token") || searchParams.get("cancelToken")

  if (!parsedToken && window.location.hash) {
    const hash = window.location.hash
    if (hash.includes("?")) {
      const hashQuery = hash.split("?")[1]
      if (hashQuery) {
        const hp = new URLSearchParams(hashQuery)
        parsedToken = hp.get("token") || hp.get("cancelToken")
      }
    } else {
      const hp = new URLSearchParams(hash.replace(/^#/, ""))
      parsedToken = hp.get("token") || hp.get("cancelToken")
    }

    if (!parsedToken) {
      const match = hash.match(/(?:token|cancelToken)=([a-zA-Z0-9-]+)/i)
      if (match && match[1]) {
        parsedToken = match[1]
      }
    }
  }

  return parsedToken?.trim() || null
}

export default function BookingCancelContainer() {
  const [token] = useState<string | null>(getInitialToken)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(() =>
    Boolean(getInitialToken())
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(() =>
    getInitialToken()
      ? null
      : "No cancellation token was provided. Please check the link from your confirmation email."
  )

  // Form states
  const [cancelReason, setCancelReason] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isCancelledSuccess, setIsCancelledSuccess] = useState<boolean>(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Detect user's local timezone
  const userTimezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
    } catch {
      return "UTC"
    }
  }, [])

  // Fetch booking details on mount
  useEffect(() => {
    if (!token) return

    let isMounted = true
    bookingApi
      .getBookingDetails(token)
      .then((res) => {
        if (!isMounted) return
        if (res.success && res.data) {
          setBooking(res.data)
          if (res.data.status === "CANCELLED") {
            setIsCancelledSuccess(true)
            setSuccessMessage(
              "This consultation session has already been cancelled."
            )
          }
        } else {
          setErrorMessage(
            res.error ||
              res.message ||
              "Failed to load booking details. The link may have expired or is invalid."
          )
        }
      })
      .catch((err: unknown) => {
        if (!isMounted) return
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Unable to retrieve reservation data."
        )
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [token])

  // Handle cancellation submission
  const handleConfirmCancel = async () => {
    if (!token) return
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const res = await bookingApi.cancelBooking(
        token,
        cancelReason.trim() || undefined
      )
      if (res.success) {
        setIsCancelledSuccess(true)
        setSuccessMessage(
          res.message ||
            "Your scheduled session has been cancelled successfully."
        )
        if (booking) {
          const updatedStatus: BookingStatus = "CANCELLED"
          setBooking({ ...booking, status: updatedStatus })
        }
      } else {
        setErrorMessage(
          res.error ||
            res.message ||
            "Failed to cancel booking. Please try again."
        )
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while processing cancellation."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format date helper
  const formattedStart = useMemo(() => {
    if (!booking?.startTime) return ""
    try {
      return new Date(booking.startTime).toLocaleString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: userTimezone,
      })
    } catch {
      return new Date(booking.startTime).toUTCString()
    }
  }, [booking, userTimezone])

  // ── 1. LOADING SKELETON STATE ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="relative mx-auto max-w-xl border border-border bg-card p-6 sm:p-8">
        <div className="pointer-events-none absolute top-0 left-0 h-4 w-4 border-t-[1.5px] border-l-[1.5px] border-primary/60" />
        <div className="pointer-events-none absolute top-0 right-0 h-4 w-4 border-t-[1.5px] border-r-[1.5px] border-primary/60" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-4 w-4 border-b-[1.5px] border-l-[1.5px] border-primary/60" />
        <div className="pointer-events-none absolute right-0 bottom-0 h-4 w-4 border-r-[1.5px] border-b-[1.5px] border-primary/60" />

        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="size-9 animate-pulse bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-48 animate-pulse bg-muted font-mono" />
            <div className="h-3 w-32 animate-pulse bg-muted/60 font-mono" />
          </div>
        </div>

        <div className="mt-6 space-y-4 font-mono text-xs text-muted-foreground">
          <p className="flex items-center gap-2">
            <span className="size-2 animate-ping bg-primary" />
            [STATUS: RETRIEVING_RESERVATION_RECORD...]
          </p>
          <div className="h-20 w-full animate-pulse border border-border bg-muted/30" />
        </div>
      </div>
    )
  }

  // ── 2. ERROR / MISSING TOKEN STATE ─────────────────────────────────────────
  if (errorMessage && !booking) {
    return (
      <div className="relative mx-auto max-w-xl border border-destructive/40 bg-card p-6 sm:p-8">
        <div className="pointer-events-none absolute top-0 left-0 h-4 w-4 border-t-[1.5px] border-l-[1.5px] border-destructive/60" />
        <div className="pointer-events-none absolute top-0 right-0 h-4 w-4 border-t-[1.5px] border-r-[1.5px] border-destructive/60" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-4 w-4 border-b-[1.5px] border-l-[1.5px] border-destructive/60" />
        <div className="pointer-events-none absolute right-0 bottom-0 h-4 w-4 border-r-[1.5px] border-b-[1.5px] border-destructive/60" />

        <div className="flex items-center gap-3 border-b border-destructive/20 pb-4">
          <div className="flex size-10 items-center justify-center border border-destructive/40 bg-destructive/10 text-destructive">
            <svg
              className="size-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-foreground">
              Unable to Load Booking
            </h3>
            <p className="font-mono text-[11px] text-muted-foreground">
              [ERR_TOKEN_VERIFICATION_FAILED]
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <p className="font-mono text-xs leading-relaxed text-muted-foreground">
            {errorMessage}
          </p>

          {token && (
            <div className="space-y-3 border-t border-destructive/20 pt-3">
              <p className="font-mono text-[11px] text-muted-foreground">
                You can still submit cancellation directly using your
                verification token:
              </p>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isSubmitting}
                className="text-destructive-foreground flex w-full items-center justify-center border border-destructive bg-destructive py-3 font-mono text-xs font-bold tracking-wider uppercase transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isSubmitting
                  ? "Cancelling Session..."
                  : "Cancel Booking With Token"}
              </button>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <a
              href="/#book-call"
              className="flex flex-1 items-center justify-center border border-primary bg-primary py-3 font-mono text-xs font-bold tracking-wider text-primary-foreground uppercase transition-opacity hover:opacity-90"
            >
              Browse Open Calendar
            </a>
            <a
              href="/"
              className="flex items-center justify-center border border-border bg-background px-6 py-3 font-mono text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              Return Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  // ── 3. SUCCESS / ALREADY CANCELLED STATE ───────────────────────────────────
  if (isCancelledSuccess) {
    return (
      <div className="relative mx-auto max-w-xl border border-destructive/40 bg-card p-6 sm:p-8">
        <div className="pointer-events-none absolute top-0 left-0 h-4 w-4 border-t-[1.5px] border-l-[1.5px] border-destructive/60" />
        <div className="pointer-events-none absolute top-0 right-0 h-4 w-4 border-t-[1.5px] border-r-[1.5px] border-destructive/60" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-4 w-4 border-b-[1.5px] border-l-[1.5px] border-destructive/60" />
        <div className="pointer-events-none absolute right-0 bottom-0 h-4 w-4 border-r-[1.5px] border-b-[1.5px] border-destructive/60" />

        {/* Cancellation Badge */}
        <div className="flex items-center gap-3 border-b border-destructive/20 pb-4">
          <div className="flex size-10 items-center justify-center border border-destructive/40 bg-destructive/10 text-destructive">
            <svg
              className="size-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 border border-destructive/30 bg-destructive/10 px-2 py-0.5 font-mono text-[9px] font-bold tracking-wider text-destructive uppercase">
              Booking Cancelled
            </div>
            <h3 className="mt-1 font-mono text-base font-bold text-foreground">
              Consultation Cancelled
            </h3>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <div className="border border-destructive/30 bg-destructive/5 p-4 font-mono text-xs leading-relaxed text-muted-foreground">
            {successMessage ||
              "Your booking has been cancelled. Google Calendar event has been deleted and the time slot is now open."}
          </div>

          {booking && (
            <div className="space-y-2 border border-border bg-background/50 p-4 font-mono text-xs">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                  Topic:
                </span>
                <span className="font-semibold text-foreground">
                  {booking.meetingType}
                </span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                  Scheduled:
                </span>
                <span className="text-foreground">{formattedStart}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                  Attendee:
                </span>
                <span className="text-foreground">
                  {booking.guestName} ({booking.guestEmail})
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <a
              href="/#book-call"
              className="flex flex-1 items-center justify-center border border-primary bg-primary py-3 font-mono text-xs font-bold tracking-wider text-primary-foreground uppercase transition-opacity hover:opacity-90"
            >
              Schedule a New Consultation
            </a>
            <a
              href="/"
              className="flex items-center justify-center border border-border bg-background px-6 py-3 font-mono text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  // ── 4. ACTIVE APPOINTMENT CANCELLATION PORTAL ──────────────────────────────
  return (
    <div className="relative mx-auto max-w-xl border border-border bg-card p-6 sm:p-8">
      {/* Corner bracket decorators */}
      <div className="pointer-events-none absolute top-0 left-0 h-4 w-4 border-t-[1.5px] border-l-[1.5px] border-primary/60" />
      <div className="pointer-events-none absolute top-0 right-0 h-4 w-4 border-t-[1.5px] border-r-[1.5px] border-primary/60" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-4 w-4 border-b-[1.5px] border-l-[1.5px] border-primary/60" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-4 w-4 border-r-[1.5px] border-b-[1.5px] border-primary/60" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[9px] font-bold tracking-wider text-primary uppercase">
            <span className="size-1.5 animate-pulse rounded-full bg-primary" />
            Scheduled Consultation
          </div>
          <h3 className="mt-1 font-mono text-base font-bold text-foreground">
            Manage Consultation Booking
          </h3>
        </div>
        <div className="hidden text-right font-mono text-[10px] text-muted-foreground sm:block">
          Host: <strong className="text-foreground">Fi Amanillah</strong>
        </div>
      </div>

      {/* Meeting Details Box */}
      {booking && (
        <div className="mt-6 space-y-3 border border-border bg-background/60 p-5 font-mono text-xs">
          <div className="flex items-start justify-between border-b border-border pb-2.5">
            <div>
              <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                Focus Topic
              </p>
              <p className="mt-0.5 text-sm font-bold text-foreground">
                {booking.meetingType}
              </p>
            </div>
            <span className="border border-border bg-card px-2.5 py-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              {booking.durationMinutes} Mins
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 border-b border-border pb-2.5 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                Date & Time
              </p>
              <p className="mt-0.5 font-semibold text-foreground">
                {formattedStart}
              </p>
              <p className="text-[10px] text-muted-foreground">
                ({userTimezone})
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                Guest
              </p>
              <p className="mt-0.5 font-semibold text-foreground">
                {booking.guestName}
              </p>
              <p className="truncate text-[10px] text-muted-foreground">
                {booking.guestEmail}
              </p>
            </div>
          </div>

          {booking.googleMeetLink && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                Meeting Room
              </span>
              <span className="text-[11px] font-semibold text-primary">
                Google Meet Protected
              </span>
            </div>
          )}
        </div>
      )}

      {/* Cancellation Prompt */}
      <div className="mt-6 space-y-4">
        <p className="font-mono text-xs leading-relaxed text-muted-foreground">
          Are you sure you want to cancel this booking? If confirmed, the
          session will be deleted from Google Calendar and your time slot will
          immediately open up for others to reserve.
        </p>

        <div>
          <label className="mb-1.5 block font-mono text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Reason for cancellation (optional)
          </label>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Let Fi know why you are cancelling or if you'd like to reschedule..."
            rows={3}
            className="w-full border border-border bg-background px-3 py-2 font-mono text-xs text-foreground transition-colors placeholder:text-muted-foreground/50 focus:border-destructive focus:outline-none"
          />
        </div>

        {errorMessage && (
          <div className="border border-destructive/40 bg-destructive/10 p-3 font-mono text-xs text-destructive">
            {errorMessage}
          </div>
        )}

        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
          <button
            type="button"
            onClick={handleConfirmCancel}
            disabled={isSubmitting}
            className="text-destructive-foreground flex flex-1 items-center justify-center border border-destructive bg-destructive py-3.5 font-mono text-xs font-bold tracking-wider uppercase transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? "Cancelling Session..." : "Confirm Cancellation"}
          </button>
          <a
            href="/#book-call"
            className="flex items-center justify-center border border-border bg-background px-6 py-3.5 font-mono text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            Keep Appointment
          </a>
        </div>
      </div>
    </div>
  )
}
