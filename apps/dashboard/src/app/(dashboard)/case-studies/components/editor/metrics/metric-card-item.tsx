"use client"

import * as React from "react"
import { Trash2 } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import type { PerformanceMetric } from "@workspace/shared"

interface MetricCardItemProps {
  metric: PerformanceMetric
  index: number
  onUpdate: (field: keyof PerformanceMetric, value: string) => void
  onRemove: () => void
}

export function MetricCardItem({
  metric,
  index,
  onUpdate,
  onRemove,
}: MetricCardItemProps) {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-xs transition-colors hover:border-primary/30">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <span className="font-mono text-xs font-bold text-primary">
          METRIC {String(index + 1).padStart(2, "0")}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
          title="Delete Metric"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-mono text-muted-foreground uppercase">
          Metric Stat Value *
        </Label>
        <Input
          value={metric.value}
          onChange={(e) => onUpdate("value", e.target.value)}
          placeholder="e.g. <50ms, 10k+, 99.9%"
          className="font-black text-lg h-10 tracking-tight"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-mono text-muted-foreground uppercase">
          Metric Caption Label *
        </Label>
        <Input
          value={metric.label}
          onChange={(e) => onUpdate("label", e.target.value)}
          placeholder="e.g. WebSocket latency across distributed nodes"
          className="text-xs h-8"
        />
      </div>
    </div>
  )
}
