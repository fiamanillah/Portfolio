// ── BookingDateTimeStep.tsx ───────────────────────────────────────────────────
// Step 1: Side-by-side Date & Available Times selector matching the exact design.
// Left: Monthly Calendar with navigation.
// Right: Available Times vertical list.
// Bottom: Full global timezone selector with shadcn Select component.

import { useMemo } from "react"
import type { TimeSlot } from "@workspace/shared"
import {
  TIMEZONE_REGIONS,
} from "./types"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
} from "@workspace/ui/components/select"

interface CalendarDay {
  dayNumber: number
  dateString: string
  isPast: boolean
  isToday: boolean
  isWeekend: boolean
  isCurrentMonth: boolean
}

interface BookingDateTimeStepProps {
  selectedDate: string
  selectedSlot: TimeSlot | null
  availableSlots: TimeSlot[]
  isLoadingSlots: boolean
  currentMonthDate: Date
  selectedTimezone: string
  userDetectedTimezone: string
  onDateSelect: (dateString: string) => void
  onSlotSelect: (slot: TimeSlot) => void
  onMonthChange: (date: Date) => void
  onTimezoneChange: (tz: string) => void
  onProceedToDetails?: () => void
}

function formatSlotTime(isoString: string, timezone: string): string {
  return new Date(isoString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone,
  })
}

export function BookingDateTimeStep({
  selectedDate,
  selectedSlot,
  availableSlots,
  isLoadingSlots,
  currentMonthDate,
  selectedTimezone,
  userDetectedTimezone,
  onDateSelect,
  onSlotSelect,
  onMonthChange,
  onTimezoneChange,
  onProceedToDetails,
}: BookingDateTimeStepProps) {
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], [])

  // Build full 6-row or exact calendar matrix with previous and next month overflow days
  const calendarDays = useMemo<CalendarDay[]>(() => {
    const year = currentMonthDate.getFullYear()
    const month = currentMonthDate.getMonth()

    const firstDayIndex = new Date(year, month, 1).getDay() // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const prevMonthDays = new Date(year, month, 0).getDate()

    const days: CalendarDay[] = []

    // Previous month overflow days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dNum = prevMonthDays - i
      const prevDate = new Date(year, month - 1, dNum)
      const dStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}-${String(dNum).padStart(2, "0")}`
      days.push({
        dayNumber: dNum,
        dateString: dStr,
        isPast: dStr < todayStr,
        isToday: dStr === todayStr,
        isWeekend: prevDate.getDay() === 0 || prevDate.getDay() === 6,
        isCurrentMonth: false,
      })
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
      const dayDate = new Date(year, month, d)
      days.push({
        dayNumber: d,
        dateString: dStr,
        isPast: dStr < todayStr,
        isToday: dStr === todayStr,
        isWeekend: dayDate.getDay() === 0 || dayDate.getDay() === 6,
        isCurrentMonth: true,
      })
    }

    // Next month overflow days (to fill complete 35 or 42 grid slots)
    const remainingSlots = (7 - (days.length % 7)) % 7
    for (let d = 1; d <= remainingSlots; d++) {
      const nextDate = new Date(year, month + 1, d)
      const dStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
      days.push({
        dayNumber: d,
        dateString: dStr,
        isPast: dStr < todayStr,
        isToday: dStr === todayStr,
        isWeekend: nextDate.getDay() === 0 || nextDate.getDay() === 6,
        isCurrentMonth: false,
      })
    }

    return days
  }, [currentMonthDate, todayStr])

  const monthYearLabel = currentMonthDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  const isCurrentMonth = useMemo(() => {
    const now = new Date()
    return (
      currentMonthDate.getFullYear() === now.getFullYear() &&
      currentMonthDate.getMonth() === now.getMonth()
    )
  }, [currentMonthDate])

  const goToPrevMonth = () => {
    const prev = new Date(currentMonthDate)
    prev.setMonth(prev.getMonth() - 1)
    onMonthChange(prev)
  }

  const goToNextMonth = () => {
    const next = new Date(currentMonthDate)
    next.setMonth(next.getMonth() + 1)
    onMonthChange(next)
  }

  return (
    <div className="space-y-4">
      {/* ── Main Side-by-Side Card (Matching Screenshot Layout) ─────── */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card/90 shadow-sm backdrop-blur-xs">
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr]">

          {/* ── LEFT: Calendar Sub-Panel ───────────────────────────── */}
          <div className="p-4 sm:p-5">
            {/* Header: < August 2026 > */}
            <div className="flex items-center justify-between pb-3">
              <button
                type="button"
                onClick={goToPrevMonth}
                disabled={isCurrentMonth}
                className="flex size-7 items-center justify-center rounded-md border border-border/80 bg-background text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-25"
                aria-label="Previous month"
              >
                <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <h4 className="font-mono text-xs font-bold tracking-tight text-foreground sm:text-sm">
                {monthYearLabel}
              </h4>

              <button
                type="button"
                onClick={goToNextMonth}
                className="flex size-7 items-center justify-center rounded-md border border-border/80 bg-background text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground"
                aria-label="Next month"
              >
                <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 py-2 text-center">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <span
                  key={d}
                  className="font-mono text-[11px] font-semibold text-muted-foreground"
                >
                  {d}
                </span>
              ))}
            </div>

            {/* Calendar dates grid */}
            <div className="grid grid-cols-7 gap-1 pt-1">
              {calendarDays.map((item) => {
                const isSelected = item.dateString === selectedDate
                const isDisabled = item.isPast

                return (
                  <button
                    key={item.dateString}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => onDateSelect(item.dateString)}
                    className={[
                      "group relative flex h-9 w-full items-center justify-center rounded-md font-mono text-xs font-medium transition-all",
                      isSelected
                        ? "bg-foreground font-bold text-background shadow-sm"
                        : isDisabled
                        ? "cursor-not-allowed text-muted-foreground/25"
                        : !item.isCurrentMonth
                        ? "text-muted-foreground/40 hover:bg-muted/40 hover:text-foreground cursor-pointer"
                        : "text-foreground hover:bg-primary/10 hover:text-primary cursor-pointer",
                      item.isToday && !isSelected
                        ? "border border-primary/40 text-primary font-semibold"
                        : "",
                    ].join(" ")}
                  >
                    <span>{item.dayNumber}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── RIGHT: Available Times Sub-Panel ───────────────────── */}
          <div className="flex flex-col border-t border-border p-4 sm:p-5 md:border-t-0 md:border-l">
            {/* Header: Available Times */}
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-mono text-xs font-bold tracking-tight text-foreground sm:text-sm">
                Available Times
              </h4>
              {isLoadingSlots && (
                <span className="flex items-center gap-1 font-mono text-[10px] text-primary">
                  <svg className="size-2.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Syncing
                </span>
              )}
            </div>

            {/* Slots Scroll Container */}
            <div className="max-h-[260px] flex-1 space-y-2 overflow-y-auto pr-1">
              {isLoadingSlots ? (
                // Skeletons
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-9 w-full animate-pulse rounded-lg border border-border/40 bg-muted/20" />
                ))
              ) : availableSlots.length === 0 ? (
                // Empty state
                <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed border-border/70 p-4 text-center">
                  <p className="font-mono text-xs font-semibold text-foreground">No slots available</p>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                    Try choosing another date on the calendar.
                  </p>
                </div>
              ) : (
                // Available slot buttons (matching screenshot rounded pills)
                availableSlots.map((slot) => {
                  const isSelected = selectedSlot?.startTime === slot.startTime
                  return (
                    <button
                      key={slot.startTime}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => onSlotSelect(slot)}
                      className={[
                        "flex w-full items-center justify-center rounded-lg border px-3 py-2.5 font-mono text-xs font-semibold transition-all duration-150",
                        isSelected
                          ? "border-primary bg-primary font-bold text-primary-foreground shadow-sm shadow-primary/25 ring-1 ring-primary"
                          : slot.available
                          ? "border-border/80 bg-background text-foreground hover:border-primary/60 hover:bg-primary/5 hover:text-primary cursor-pointer"
                          : "cursor-not-allowed border-border/30 bg-muted/10 text-muted-foreground/30 line-through",
                      ].join(" ")}
                    >
                      <span>{formatSlotTime(slot.startTime, selectedTimezone)}</span>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Timezone Selector (Shadcn Select Component) ─────────────── */}
      <div className="rounded-xl border border-border bg-card/90 p-3 sm:p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <svg className="size-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
              Timezone
            </span>
          </div>

          <div className="w-full sm:w-72">
            <Select value={selectedTimezone} onValueChange={onTimezoneChange}>
              <SelectTrigger className="w-full font-mono text-xs">
                <SelectValue placeholder="Select your timezone..." />
              </SelectTrigger>
              <SelectContent className="max-h-72 border border-border bg-card">
                {TIMEZONE_REGIONS.map((grp) => (
                  <SelectGroup key={grp.region}>
                    <SelectLabel className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {grp.region}
                    </SelectLabel>
                    {grp.timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value} className="font-mono text-xs">
                        <span>{tz.label}</span>
                        {tz.value === userDetectedTimezone && (
                          <span className="ml-1.5 font-bold text-primary">(Local)</span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ── Continue Action (When slot is selected) ───────────────────── */}
      {selectedSlot && onProceedToDetails && (
        <div className="pt-1">
          <button
            type="button"
            onClick={onProceedToDetails}
            className="btn-shimmer flex w-full items-center justify-center gap-2 rounded-lg border border-primary bg-primary py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-primary-foreground transition-all hover:opacity-90 active:scale-[0.99]"
          >
            <span>Proceed to Details & Verification</span>
            <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
