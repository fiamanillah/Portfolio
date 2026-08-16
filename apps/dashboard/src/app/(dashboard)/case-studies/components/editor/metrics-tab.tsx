"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import type { PerformanceMetric } from "@workspace/shared"
import { MetricsPresetsBar } from "./metrics/metrics-presets-bar"
import { MetricCardItem } from "./metrics/metric-card-item"

interface MetricsTabProps {
  metrics: PerformanceMetric[]
  setMetrics: (metrics: PerformanceMetric[]) => void
}

export function MetricsTab({ metrics, setMetrics }: MetricsTabProps) {
  const handleAddMetric = (preset?: PerformanceMetric) => {
    setMetrics([
      ...metrics,
      preset || {
        value: "99.9%",
        label: "Uptime for asynchronous worker processing",
      },
    ])
  }

  const handleUpdateMetric = (
    index: number,
    field: keyof PerformanceMetric,
    value: string
  ) => {
    const updated = [...metrics]
    updated[index] = { ...updated[index], [field]: value }
    setMetrics(updated)
  }

  const handleRemoveMetric = (index: number) => {
    setMetrics(metrics.filter((_, i) => i !== index))
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-base font-bold">
            Section 04: Performance & Scale Metrics ({metrics.length})
          </CardTitle>
          <CardDescription className="text-xs">
            4-card metrics grid displaying performance numbers, throughput stats, and benchmark figures.
          </CardDescription>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => handleAddMetric()}
          className="h-8 gap-1 text-xs"
        >
          <Plus className="size-3.5" /> Add Metric
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <MetricsPresetsBar onAddMetric={handleAddMetric} />

        <div className="grid gap-3 sm:grid-cols-2">
          {metrics.map((metric, index) => (
            <MetricCardItem
              key={index}
              metric={metric}
              index={index}
              onUpdate={(field, val) => handleUpdateMetric(index, field, val)}
              onRemove={() => handleRemoveMetric(index)}
            />
          ))}
        </div>

        {!metrics.length && (
          <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-border text-center">
            <p className="text-xs text-muted-foreground">
              No performance metrics defined. Click "Add Metric" or choose from presets above.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
