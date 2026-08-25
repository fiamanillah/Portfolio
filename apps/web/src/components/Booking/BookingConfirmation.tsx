// ── BookingConfirmation.tsx ───────────────────────────────────────────────────
// Success screen displayed after a booking is confirmed.

import type { Booking } from "@workspace/shared"
import { generateGoogleCalendarUrl, downloadIcsFile } from "./types"

interface BookingConfirmationProps {
  booking: Booking
  selectedTimezone: string
  onBookAnother: () => void
}

export function BookingConfirmation({
  booking,
  selectedTimezone,
  onBookAnother,
}: BookingConfirmationProps) {
  const startFormatted = new Date(booking.startTime).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: selectedTimezone,
  })

  return (
    <div className="mx-auto max-w-2xl">
      {/* ── Success Header ──────────────────────────────────────────── */}
      <div className="relative border border-emerald-500/30 bg-card px-8 py-10 text-center">
        {/* Corner brackets (emerald) */}
        <div className="pointer-events-none absolute top-0 left-0 h-4 w-4 border-t-[1.5px] border-l-[1.5px] border-emerald-500/50" />
        <div className="pointer-events-none absolute top-0 right-0 h-4 w-4 border-t-[1.5px] border-r-[1.5px] border-emerald-500/50" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-4 w-4 border-b-[1.5px] border-l-[1.5px] border-emerald-500/50" />
        <div className="pointer-events-none absolute right-0 bottom-0 h-4 w-4 border-r-[1.5px] border-b-[1.5px] border-emerald-500/50" />

        {/* Checkmark icon */}
        <div className="mx-auto mb-5 flex size-16 items-center justify-center border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
          <svg
            className="size-8"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Status badge */}
        <div className="inline-flex items-center gap-1.5 border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
          Booking Confirmed & Synchronized
        </div>

        <h3 className="mt-4 text-2xl font-black tracking-tight text-foreground">
          You're Scheduled!
        </h3>
        <p className="mt-2 font-mono text-xs leading-relaxed text-muted-foreground">
          A confirmation email and Google Calendar invitation have been sent to{" "}
          <strong className="text-foreground">{booking.guestEmail}</strong>.
        </p>
      </div>

      {/* ── Meeting Summary ─────────────────────────────────────────── */}
      <div className="border-x border-b border-border bg-background">
        {/* Focus area + duration */}
        <div className="flex flex-col gap-2 border-b border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
              Focus Area
            </p>
            <p className="mt-0.5 font-mono text-sm font-bold text-foreground">
              {booking.meetingType}
            </p>
          </div>
          <span className="self-start border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[10px] font-bold tracking-wider text-primary uppercase">
            {booking.durationMinutes}min Session
          </span>
        </div>

        {/* Date/time + attendee */}
        <div className="grid grid-cols-1 gap-0 sm:grid-cols-2">
          <div className="border-b border-border px-6 py-4 sm:border-r sm:border-b-0">
            <p className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
              Date & Time
            </p>
            <p className="mt-0.5 font-mono text-xs font-semibold text-foreground">
              {startFormatted}
            </p>
            <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
              Timezone: {selectedTimezone}
            </p>
          </div>
          <div className="px-6 py-4">
            <p className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
              Guest Attendee
            </p>
            <p className="mt-0.5 font-mono text-xs font-semibold text-foreground">
              {booking.guestName}
            </p>
            <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">
              {booking.guestEmail}
            </p>
          </div>
        </div>

        {/* Google Meet Link */}
        {booking.googleMeetLink && (
          <div className="border-t border-border px-6 py-4">
            <div className="flex flex-col gap-3 border border-primary/20 bg-primary/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center border border-primary/30 bg-primary/10 text-primary">
                  <svg
                    className="size-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-[10px] font-bold tracking-wider text-foreground uppercase">
                    Google Meet Room
                  </p>
                  <p className="truncate font-mono text-[10px] text-primary">
                    {booking.googleMeetLink}
                  </p>
                </div>
              </div>
              <a
                href={booking.googleMeetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 border border-primary bg-primary px-4 py-2 font-mono text-[10px] font-bold tracking-wider text-primary-foreground uppercase transition-opacity hover:opacity-90"
              >
                Join Room
                <svg
                  className="size-3"
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
              </a>
            </div>
          </div>
        )}
      </div>

      {/* ── Action Buttons ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 border-x border-b border-border bg-background/50 px-6 py-4 sm:flex-row">
        <a
          href={generateGoogleCalendarUrl(booking)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 border border-border bg-foreground px-4 py-3 font-mono text-[10px] font-bold tracking-wider text-background uppercase transition-opacity hover:opacity-90"
        >
          <svg className="size-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
          </svg>
          Add to Google Calendar
        </a>

        <button
          type="button"
          onClick={() => downloadIcsFile(booking)}
          className="flex items-center justify-center gap-2 border border-border bg-background px-4 py-3 font-mono text-[10px] font-bold tracking-wider text-muted-foreground uppercase transition-colors hover:border-border hover:text-foreground"
        >
          <svg
            className="size-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Download .ICS
        </button>

        <button
          type="button"
          onClick={onBookAnother}
          className="flex items-center justify-center border border-border bg-background px-4 py-3 font-mono text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Book Another
        </button>
      </div>
    </div>
  )
}
