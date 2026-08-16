"use client"

import * as React from "react"
import type { PerformanceMetric } from "@workspace/shared"

interface PreviewMetricsSectionProps {
  metrics: PerformanceMetric[]
}

export function PreviewMetricsSection({ metrics }: PreviewMetricsSectionProps) {
  if (!metrics || metrics.length === 0) return null

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <span className="font-mono text-xs font-semibold text-primary uppercase">
          [ SEC_04 // PERFORMANCE_METRICS ]
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center rounded-xl border border-border/80 bg-card/60 p-5 text-center"
          >
            <span className="text-3xl font-black tracking-tight text-foreground">
              {m.value}
            </span>
            <div className="mt-2 h-px w-6 bg-primary/40" />
            <p className="mt-2 font-mono text-[10px] text-muted-foreground uppercase">
              {m.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
