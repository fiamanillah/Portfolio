"use client"

import * as React from "react"
import {
  FileText,
  Search,
  Calendar,
  Image as ImageIcon,
  User,
  Eye,
  CheckCircle2,
} from "lucide-react"
import { TabsPrimitive } from "@workspace/ui/components/tabs"
import { Badge } from "@workspace/ui/components/badge"
import type { SeoAnalysisResult } from "@workspace/shared"

interface EditorTabsNavProps {
  activeTab: string
  seoAnalysis: SeoAnalysisResult | null
  hasCoverImage: boolean
  hasRequiredContent: boolean
}

const STEPS = [
  { id: "content", number: "01", label: "Content & Body", icon: FileText },
  { id: "media", number: "02", label: "Media & Hero", icon: ImageIcon },
  { id: "seo", number: "03", label: "SEO & Social", icon: Search },
  { id: "publishing", number: "04", label: "Publishing", icon: Calendar },
  { id: "author", number: "05", label: "Author Persona", icon: User },
  { id: "preview", number: "06", label: "Live Preview", icon: Eye },
]

export function EditorTabsNav({
  activeTab,
  seoAnalysis,
  hasCoverImage,
  hasRequiredContent,
}: EditorTabsNavProps) {
  const activeIndex = STEPS.findIndex((s) => s.id === activeTab)
  const currentStep = STEPS[Math.max(0, activeIndex)]
  const progressPercent = Math.round(((Math.max(0, activeIndex) + 1) / STEPS.length) * 100)

  return (
    <div className="border-b border-border/80 bg-card/60 backdrop-blur-xs">
      {/* Top Subtle Step Progress Bar */}
      <div className="h-1 w-full bg-muted/40">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step Info Strip */}
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-3.5 py-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-bold text-primary">
            STEP {currentStep.number} / 06:
          </span>
          <span className="text-xs font-semibold text-foreground">
            {currentStep.label}
          </span>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">
          {progressPercent}% Complete
        </span>
      </div>

      <div className="p-2 sm:p-2.5">
        <TabsPrimitive.List className="grid h-auto w-full grid-cols-2 gap-1.5 bg-transparent p-0 sm:grid-cols-3 lg:grid-cols-6">
          {STEPS.map((step) => {
            const Icon = step.icon
            const isCompleted =
              (step.id === "content" && hasRequiredContent) ||
              (step.id === "media" && hasCoverImage) ||
              (step.id === "seo" && seoAnalysis && seoAnalysis.score >= 70)
            const isCurrent = activeTab === step.id

            return (
              <TabsPrimitive.Trigger
                key={step.id}
                value={step.id}
                className={`relative flex min-h-[44px] cursor-pointer items-center justify-between gap-1.5 rounded-lg border px-2.5 py-2 text-left transition-all duration-200 select-none ${
                  isCurrent
                    ? "border-primary/70 bg-primary/10 text-primary shadow-xs font-bold ring-1 ring-primary/30"
                    : "border-border/60 bg-background/60 text-muted-foreground hover:border-primary/40 hover:bg-muted/40 hover:text-foreground"
                }`}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-mono font-bold ${
                      isCurrent
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.number}
                  </span>
                  <div className="flex min-w-0 items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate text-xs font-semibold">
                      {step.label}
                    </span>
                  </div>
                </div>

                {/* Status Badges / Indicators */}
                <div className="flex shrink-0 items-center gap-1">
                  {step.id === "seo" && seoAnalysis && (
                    <Badge
                      variant="outline"
                      className={`h-4 px-1 font-mono text-[9px] ${
                        seoAnalysis.score >= 85
                          ? "border-emerald-500/40 text-emerald-500"
                          : seoAnalysis.score >= 70
                            ? "border-amber-500/40 text-amber-500"
                            : "border-rose-500/40 text-rose-500"
                      }`}
                    >
                      {seoAnalysis.score}
                    </Badge>
                  )}
                  {isCompleted && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  )}
                </div>
              </TabsPrimitive.Trigger>
            )
          })}
        </TabsPrimitive.List>
      </div>
    </div>
  )
}


