"use client"

import * as React from "react"
import { Sparkles } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import type { PerformanceMetric } from "@workspace/shared"

interface MetricsPresetsBarProps {
  onAddMetric: (preset: PerformanceMetric) => void
}

const PRESETS: PerformanceMetric[] = [
  { value: "<50ms", label: "WebSocket real-time chat latency" },
  { value: "10k+", label: "Worker jobs processed asynchronously daily" },
  { value: "100%", label: "End-to-end type safety with Prisma & TypeScript" },
  { value: "99.9%", label: "Uptime across microservices infrastructure" },
  { value: "95+", label: "Google Lighthouse Performance Score" },
]

export function MetricsPresetsBar({ onAddMetric }: MetricsPresetsBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border/60 bg-muted/20 p-2.5">
      <span className="font-mono text-[11px] text-muted-foreground flex items-center gap-1">
        <Sparkles className="size-3 text-primary" /> Common metrics:
      </span>
      {PRESETS.map((p) => (
        <Button
          key={p.label}
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-xs hover:border-primary/40 hover:bg-primary/5"
          onClick={() => onAddMetric(p)}
        >
          + {p.value} ({p.label.slice(0, 20)}...)
        </Button>
      ))}
    </div>
  )
}
