// ── BookingCalendar.tsx ───────────────────────────────────────────────────────
// Step 1: Interactive Calendar & Date Selection
// Designed with crisp borders, corner accents, and smooth transitions.

import { useMemo } from "react"

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
  onDateSelect: (dateString: string) => void
  onMonthChange: (date: Date) => void
  onContinue?: () => void
}

export function BookingCalendar({
  selectedDate,
  currentMonthDate,
  onDateSelect,
  onMonthChange,
  onContinue,
}: BookingCalendarProps) {
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], [])

  const calendarDays = useMemo<Array<CalendarDay | null>>(() => {
    const year = currentMonthDate.getFullYear()
    const month = currentMonthDate.getMonth()
    const firstDayIndex = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

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

  const jumpToToday = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    onMonthChange(firstDay)
    onDateSelect(todayStr)
  }

  return (
    <div className="space-y-4">
      {/* ── Calendar Card ─────────────────────────────────────────────── */}
      <div className="relative border border-border bg-card/80 backdrop-blur-xs">
        {/* Corner brackets */}
        <div className="pointer-events-none absolute top-0 left-0 z-10 size-3 border-t border-l border-primary/60" />
        <div className="pointer-events-none absolute top-0 right-0 z-10 size-3 border-t border-r border-primary/60" />
        <div className="pointer-events-none absolute bottom-0 left-0 z-10 size-3 border-b border-l border-primary/60" />
        <div className="pointer-events-none absolute bottom-0 right-0 z-10 size-3 border-b border-r border-primary/60" />

        {/* Month navigation header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold tracking-tight text-foreground uppercase">
              {monthYearLabel}
            </span>
            {!isCurrentMonth && (
              <button
                type="button"
                onClick={jumpToToday}
                className="border border-border/80 bg-background px-2 py-0.5 font-mono text-[10px] font-semibold text-primary transition-colors hover:border-primary hover:bg-primary/5"
              >
                Today
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={goToPrevMonth}
              disabled={isCurrentMonth}
              className="flex size-7 items-center justify-center border border-border bg-background text-muted-foreground transition-all hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
              title="Previous month"
              aria-label="Previous month"
            >
              <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              type="button"
              onClick={goToNextMonth}
              className="flex size-7 items-center justify-center border border-border bg-background text-muted-foreground transition-all hover:border-primary/40 hover:text-primary"
              title="Next month"
              aria-label="Next month"
            >
              <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Day-of-week labels */}
        <div className="grid grid-cols-7 border-b border-border/60 bg-muted/20 px-3 py-2 text-center">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <span key={d} className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground/80 uppercase">
              {d}
            </span>
          ))}
        </div>

        {/* Calendar day grid */}
        <div className="grid grid-cols-7 gap-1.5 p-3 sm:p-4">
          {calendarDays.map((item, idx) => {
            if (!item) return <div key={`empty-${idx}`} className="h-10" />

            const isSelected = item.dateString === selectedDate
            const isDisabled = item.isPast

            return (
              <button
                key={item.dateString}
                type="button"
                disabled={isDisabled}
                onClick={() => onDateSelect(item.dateString)}
                className={[
                  "group relative flex h-10 items-center justify-center font-mono text-xs font-semibold transition-all duration-150",
                  isSelected
                    ? "border border-primary bg-primary font-bold text-primary-foreground shadow-sm shadow-primary/20"
                    : isDisabled
                    ? "cursor-not-allowed border border-transparent text-muted-foreground/25"
                    : item.isWeekend
                    ? "border border-transparent bg-background/40 text-muted-foreground hover:border-primary/50 hover:bg-primary/10 hover:text-primary cursor-pointer"
                    : "border border-border/40 bg-background text-foreground hover:border-primary/50 hover:bg-primary/10 hover:text-primary cursor-pointer",
                  item.isToday && !isSelected
                    ? "border-primary/60 font-bold text-primary"
                    : "",
                ].join(" ")}
              >
                <span>{item.dayNumber}</span>
                {item.isToday && !isSelected && (
                  <span className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Selected Date Summary & CTA ──────────────────────────────── */}
      {selectedDate && (
        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="font-mono text-xs text-muted-foreground">
            Selected Date:{" "}
            <strong className="text-foreground">
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </strong>
          </div>

          {onContinue && (
            <button
              type="button"
              onClick={onContinue}
              className="btn-shimmer flex items-center justify-center gap-2 border border-primary bg-primary px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-primary-foreground transition-all hover:opacity-90 active:scale-[0.99]"
            >
              <span>View Available Slots</span>
              <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
