"use client"

import * as React from "react"
import {
  Info,
  Layers,
  AlertCircle,
  Server,
  Sparkles,
  Activity,
  CheckCircle2,
  Share2,
  Eye,
} from "lucide-react"
import { TabsPrimitive } from "@workspace/ui/components/tabs"
import { Badge } from "@workspace/ui/components/badge"

interface EditorTabsNavProps {
  activeTab?: string
  metadataCount: number
  contextCount: number
  architectureCount: number
  featuresCount: number
  metricsCount: number
  postMortemCount: number
}

const STEPS = [
  { id: "hero", number: "01", label: "Overview", icon: Info },
  { id: "metadata", number: "02", label: "Metadata", icon: Layers, countKey: "metadataCount" },
  { id: "context", number: "03", label: "Context", icon: AlertCircle, countKey: "contextCount" },
  { id: "architecture", number: "04", label: "Architecture", icon: Server, countKey: "architectureCount" },
  { id: "features", number: "05", label: "Features", icon: Sparkles, countKey: "featuresCount" },
  { id: "metrics", number: "06", label: "Metrics", icon: Activity, countKey: "metricsCount" },
  { id: "post-mortem", number: "07", label: "Post-Mortem", icon: CheckCircle2, countKey: "postMortemCount" },
  { id: "seo", number: "08", label: "SEO & Social", icon: Share2 },
  { id: "preview", number: "09", label: "Live Preview", icon: Eye },
]

export function EditorTabsNav({
  activeTab = "hero",
  metadataCount,
  contextCount,
  architectureCount,
  featuresCount,
  metricsCount,
  postMortemCount,
}: EditorTabsNavProps) {
  const counts: Record<string, number> = {
    metadataCount,
    contextCount,
    architectureCount,
    featuresCount,
    metricsCount,
    postMortemCount,
  }

  const activeIndex = STEPS.findIndex((s) => s.id === activeTab)
  const currentStep = STEPS[Math.max(0, activeIndex)]
  const progressPercent = Math.round(((Math.max(0, activeIndex) + 1) / STEPS.length) * 100)

  return (
    <div className="w-full overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs">
      {/* Top Progress Indicator Bar */}
      <div className="h-1 w-full bg-muted/40">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Header Info Strip */}
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-3.5 py-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-bold text-primary">
            STEP {currentStep.number} / 09:
          </span>
          <span className="text-xs font-semibold text-foreground">
            {currentStep.label}
          </span>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">
          {progressPercent}% Complete
        </span>
      </div>

      {/* Stepper Grid Container */}
      <div className="p-2 sm:p-2.5">
        <TabsPrimitive.List className="grid h-auto w-full grid-cols-3 gap-1.5 bg-transparent p-0 md:grid-cols-5 xl:grid-cols-9">
          {STEPS.map((step) => {
            const Icon = step.icon
            const isCurrent = activeTab === step.id
            const count = step.countKey ? counts[step.countKey] : undefined

            return (
              <TabsPrimitive.Trigger
                key={step.id}
                value={step.id}
                className={`relative flex min-h-[44px] cursor-pointer items-center justify-between gap-1 rounded-lg border px-2 py-1.5 text-left transition-all duration-200 select-none ${
                  isCurrent
                    ? "border-primary/70 bg-primary/10 text-primary shadow-xs font-bold ring-1 ring-primary/30"
                    : "border-border/60 bg-background/60 text-muted-foreground hover:border-primary/40 hover:bg-muted/40 hover:text-foreground"
                }`}
              >
                <div className="flex min-w-0 items-center gap-1.5">
                  <span
                    className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded text-[9px] font-mono font-bold ${
                      isCurrent
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.number}
                  </span>
                  <div className="flex min-w-0 items-center gap-1">
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate text-[11px] font-medium">
                      {step.label}
                    </span>
                  </div>
                </div>

                {count !== undefined && count > 0 && (
                  <Badge
                    variant="outline"
                    className="h-3.5 px-1 font-mono text-[8px] border-border text-muted-foreground"
                  >
                    {count}
                  </Badge>
                )}
              </TabsPrimitive.Trigger>
            )
          })}
        </TabsPrimitive.List>
      </div>
    </div>
  )
}


