// ── BookingCalendar.tsx ───────────────────────────────────────────────────────
// Renders the mini-calendar grid + timezone selector.
// Matches site design: sharp edges, corner brackets, primary accent.

import { useMemo } from "react"
import { POPULAR_TIMEZONES } from "./types"

interface CalendarDay {
  dayNumber: number
  dateString: string
  isPast: boolean
  isToday: boolean
  isWeekend: boolean
}

interface BookingCalendarProps {
  selectedDate: string
  currentMonthDate: Date
  selectedTimezone: string
  userDetectedTimezone: string
  onDateSelect: (dateString: string) => void
  onMonthChange: (date: Date) => void
  onTimezoneChange: (tz: string) => void
}

export function BookingCalendar({
  selectedDate,
  currentMonthDate,
  selectedTimezone,
  userDetectedTimezone,
  onDateSelect,
  onMonthChange,
  onTimezoneChange,
}: BookingCalendarProps) {
  const calendarDays = useMemo<Array<CalendarDay | null>>(() => {
    const year = currentMonthDate.getFullYear()
    const month = currentMonthDate.getMonth()
    const firstDayIndex = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const todayStr = new Date().toISOString().split("T")[0]

    const days: Array<CalendarDay | null> = []
    for (let i = 0; i < firstDayIndex; i++) days.push(null)

    for (let d = 1; d <= daysInMonth; d++) {
      const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
      const dayDate = new Date(year, month, d)
      const dayOfWeek = dayDate.getDay()
      days.push({
        dayNumber: d,
        dateString: dStr,
        isPast: dStr < todayStr,
        isToday: dStr === todayStr,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      })
    }
    return days
  }, [currentMonthDate])

  const monthYearLabel = currentMonthDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

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
      {/* ── Calendar Card ─────────────────────────────────────────────── */}
      <div className="relative border border-border bg-card">
        {/* Corner brackets */}
        <div className="pointer-events-none absolute top-0 left-0 z-10 h-3.5 w-3.5 border-t border-l border-primary/50" />
        <div className="pointer-events-none absolute top-0 right-0 z-10 h-3.5 w-3.5 border-t border-r border-primary/50" />
        <div className="pointer-events-none absolute bottom-0 left-0 z-10 h-3.5 w-3.5 border-b border-l border-primary/50" />
        <div className="pointer-events-none absolute bottom-0 right-0 z-10 h-3.5 w-3.5 border-b border-r border-primary/50" />

        {/* Month navigation header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <button
            type="button"
            onClick={goToPrevMonth}
            className="flex size-7 items-center justify-center border border-border bg-background text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            title="Previous month"
          >
            <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <span className="font-mono text-xs font-bold tracking-wider text-foreground uppercase">
            {monthYearLabel}
          </span>

          <button
            type="button"
            onClick={goToNextMonth}
            className="flex size-7 items-center justify-center border border-border bg-background text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            title="Next month"
          >
            <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day-of-week labels */}
        <div className="grid grid-cols-7 border-b border-border/60 bg-background/50 px-3 py-2 text-center">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <span key={d} className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
              {d}
            </span>
          ))}
        </div>

        {/* Calendar day grid */}
        <div className="grid grid-cols-7 gap-1 p-3">
          {calendarDays.map((item, idx) => {
            if (!item) return <div key={`empty-${idx}`} className="h-9" />

            const isSelected = item.dateString === selectedDate
            const isDisabled = item.isPast

            return (
              <button
                key={item.dateString}
                type="button"
                disabled={isDisabled}
                onClick={() => onDateSelect(item.dateString)}
                className={[
                  "relative flex h-9 items-center justify-center font-mono text-xs font-semibold transition-all",
                  isSelected
                    ? "bg-primary text-primary-foreground font-bold"
                    : isDisabled
                    ? "cursor-not-allowed text-muted-foreground/25"
                    : item.isWeekend
                    ? "text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer"
                    : "text-foreground hover:bg-primary/10 hover:text-primary cursor-pointer",
                  item.isToday && !isSelected
                    ? "border border-primary/40 text-primary"
                    : "",
                ].join(" ")}
              >
                {item.dayNumber}
                {item.isToday && !isSelected && (
                  <span className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Timezone Selector ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 border border-border bg-background/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <svg className="size-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Timezone
        </span>
        <select
          value={selectedTimezone}
          onChange={(e) => onTimezoneChange(e.target.value)}
          className="border border-border bg-background px-3 py-1.5 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {POPULAR_TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz} {tz === userDetectedTimezone ? "(Your Local)" : ""}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
