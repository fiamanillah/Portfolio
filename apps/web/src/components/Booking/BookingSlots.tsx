// ── BookingSlots.tsx ──────────────────────────────────────────────────────────
// Step 2: Time Slot Selector
// Displays live available slots for the selected date and timezone.

import type { TimeSlot } from "@workspace/shared"

interface BookingSlotsProps {
  slots: TimeSlot[]
  selectedSlot: TimeSlot | null
  isLoading: boolean
  selectedDate: string
  selectedTimezone: string
  selectedDuration: number
  onSlotSelect: (slot: TimeSlot) => void
  onBackToDate: () => void
  onContinue?: () => void
}

function formatSlotTime(isoString: string, timezone: string): string {
  return new Date(isoString).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone,
  })
}

function formatDateFull(dateStr: string): string {
  if (!dateStr) return ""
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export function BookingSlots({
  slots,
  selectedSlot,
  isLoading,
  selectedDate,
  selectedTimezone,
  selectedDuration,
  onSlotSelect,
  onBackToDate,
  onContinue,
}: BookingSlotsProps) {
  return (
    <div className="space-y-5">
      {/* ── Top Header & Navigation ──────────────────────────────────── */}
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={onBackToDate}
            className="mb-1.5 inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-primary transition-colors hover:text-primary/80"
          >
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Change Date
          </button>
          <h4 className="font-mono text-sm font-bold tracking-tight text-foreground">
            {formatDateFull(selectedDate) || "Selected Date"}
          </h4>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="border border-border bg-background px-2.5 py-1 font-mono text-[10px] font-semibold text-muted-foreground">
            {selectedDuration} Minutes
          </span>
          <span className="border border-border bg-background px-2.5 py-1 font-mono text-[10px] font-semibold text-muted-foreground">
            {selectedTimezone}
          </span>
        </div>
      </div>

      {/* ── Slots Grid / Skeletons / Empty State ─────────────────────── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
            Available Windows
          </span>
          {isLoading && (
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-primary">
              <svg
                className="size-3 animate-spin"
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
              Checking availability...
            </span>
          )}
        </div>

        {isLoading ? (
          // Skeleton loading grid
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="h-11 animate-pulse border border-border/50 bg-muted/20"
              />
            ))}
          </div>
        ) : slots.length === 0 ? (
          // Empty State
          <div className="relative border border-dashed border-border/80 bg-background/50 p-8 text-center">
            <div className="mx-auto mb-3 flex size-10 items-center justify-center border border-border bg-muted/20 text-muted-foreground">
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="font-mono text-xs font-bold text-foreground">
              No available time slots on this date
            </p>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
              All slots for this day are either booked or outside working
              availability.
            </p>
            <button
              type="button"
              onClick={onBackToDate}
              className="mt-4 inline-flex items-center gap-1.5 border border-primary/40 bg-primary/10 px-4 py-2 font-mono text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              Select Another Date
            </button>
          </div>
        ) : (
          // Available slot buttons
          <div className="grid max-h-72 grid-cols-2 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-3 md:grid-cols-4">
            {slots.map((slot) => {
              const isSelected = selectedSlot?.startTime === slot.startTime
              return (
                <button
                  key={slot.startTime}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => onSlotSelect(slot)}
                  className={[
                    "group relative flex items-center justify-center border px-3 py-3 font-mono text-xs font-semibold transition-all duration-150",
                    isSelected
                      ? "border-primary bg-primary font-bold text-primary-foreground shadow-sm shadow-primary/20"
                      : slot.available
                        ? "cursor-pointer border-border bg-background text-foreground hover:border-primary hover:bg-primary/5 hover:text-primary"
                        : "cursor-not-allowed border-border/30 bg-muted/10 text-muted-foreground/30 line-through",
                  ].join(" ")}
                >
                  <span>
                    {formatSlotTime(slot.startTime, selectedTimezone)}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Action Buttons ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBackToDate}
          className="flex items-center justify-center gap-1.5 border border-border bg-background px-4 py-3 font-mono text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          ‹ Back to Calendar
        </button>

        {selectedSlot && onContinue && (
          <button
            type="button"
            onClick={onContinue}
            className="btn-shimmer flex flex-1 items-center justify-center gap-2 border border-primary bg-primary px-6 py-3 font-mono text-xs font-bold tracking-wider text-primary-foreground uppercase transition-all hover:opacity-90 active:scale-[0.99] sm:flex-none"
          >
            <span>Proceed to Details & Verification</span>
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
          </button>
        )}
      </div>
    </div>
  )
}
