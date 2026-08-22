// ── BookingSlots.tsx ──────────────────────────────────────────────────────────
// Renders available time slots with loading skeleton and empty state.

import type { TimeSlot } from "@workspace/shared"

interface BookingSlotsProps {
  slots: TimeSlot[]
  selectedSlot: TimeSlot | null
  isLoading: boolean
  selectedDate: string
  selectedTimezone: string
  onSlotSelect: (slot: TimeSlot) => void
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
  })
}

export function BookingSlots({
  slots,
  selectedSlot,
  isLoading,
  selectedDate,
  selectedTimezone,
  onSlotSelect,
}: BookingSlotsProps) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {selectedDate ? `Available — ${formatDateLabel(selectedDate)}` : "Select a date"}
        </span>
        {isLoading && (
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-primary">
            <svg className="size-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Syncing...
          </span>
        )}
      </div>

      {/* Slot Grid */}
      {isLoading ? (
        // Skeleton loading state
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-10 animate-pulse border border-border/40 bg-muted/30" />
          ))}
        </div>
      ) : slots.length === 0 ? (
        // Empty state
        <div className="border border-dashed border-border/80 bg-background/30 px-6 py-8 text-center">
          <p className="font-mono text-xs font-semibold text-foreground">No available slots</p>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">
            Try selecting a different date above.
          </p>
        </div>
      ) : (
        // Slot buttons
        <div className="grid max-h-52 grid-cols-3 gap-2 overflow-y-auto pr-0.5 sm:grid-cols-4">
          {slots.map((slot) => {
            const isSelected = selectedSlot?.startTime === slot.startTime
            return (
              <button
                key={slot.startTime}
                type="button"
                disabled={!slot.available}
                onClick={() => onSlotSelect(slot)}
                className={[
                  "border px-2 py-2.5 font-mono text-[11px] font-semibold transition-all",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : slot.available
                    ? "border-border bg-background text-foreground hover:border-primary/60 hover:bg-primary/5 hover:text-primary"
                    : "cursor-not-allowed border-border/30 bg-muted/10 text-muted-foreground/30 line-through",
                ].join(" ")}
              >
                {formatSlotTime(slot.startTime, selectedTimezone)}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
