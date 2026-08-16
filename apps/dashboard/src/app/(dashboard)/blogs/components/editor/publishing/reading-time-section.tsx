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
    <div className="p-4 rounded-xl border border-border/80 bg-background/60 space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary" /> Reading Time & Article Length
          </label>
          <p className="text-[11px] text-muted-foreground">
            Automatically estimated at 200 words per minute.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
          <span>{wordCount} Words</span>
          <span>•</span>
          <span className="text-primary font-semibold">{calculatedReadTime}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder={`Auto-calculated: ${calculatedReadTime}`}
          value={readTimeOverride}
          onChange={(e) => setReadTimeOverride(e.target.value)}
          className="text-xs h-9 font-mono bg-background border-border/90 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-xs"
        />
        {readTimeOverride && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setReadTimeOverride("")}
            className="h-9 text-xs text-muted-foreground hover:text-foreground shrink-0"
          >
            Reset to Auto
          </Button>
        )}
      </div>
    </div>
  )
}
