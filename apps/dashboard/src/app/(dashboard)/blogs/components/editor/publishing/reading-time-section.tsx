"use client"

import * as React from "react"
import { Clock, RefreshCw } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"

interface ReadingTimeSectionProps {
  readTimeOverride: string
  setReadTimeOverride: (val: string) => void
  calculatedReadTime: string
  wordCount: number
}

export function ReadingTimeSection({
  readTimeOverride,
  setReadTimeOverride,
  calculatedReadTime,
  wordCount,
}: ReadingTimeSectionProps) {
  return (
    <div className="space-y-3 rounded-xl border border-border/80 bg-background/60 p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <label className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
            <Clock className="h-3.5 w-3.5 text-primary" /> Reading Time &
            Article Length
          </label>
          <p className="text-[11px] text-muted-foreground">
            Automatically estimated at 200 words per minute.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
          <span>{wordCount} Words</span>
          <span>•</span>
          <span className="font-semibold text-primary">
            {calculatedReadTime}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder={`Auto-calculated: ${calculatedReadTime}`}
          value={readTimeOverride}
          onChange={(e) => setReadTimeOverride(e.target.value)}
          className="h-9 border-border/90 bg-background font-mono text-xs shadow-xs hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20"
        />
        {readTimeOverride && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setReadTimeOverride("")}
            className="h-9 shrink-0 text-xs text-muted-foreground hover:text-foreground"
          >
            Reset to Auto
          </Button>
        )}
      </div>
    </div>
  )
}
