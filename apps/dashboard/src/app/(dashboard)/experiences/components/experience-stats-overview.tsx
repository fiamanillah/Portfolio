"use client"

import * as React from "react"
import {
  Briefcase,
  Building2,
  Cpu,
  Sparkles,
  CheckCircle2,
  FileEdit,
  Archive,
} from "lucide-react"
import { Card, CardContent } from "@workspace/ui/components/card"
import type { ExperienceStatsDTO } from "@workspace/shared"

interface ExperienceStatsOverviewProps {
  stats: ExperienceStatsDTO
  isLoading?: boolean
}

export function ExperienceStatsOverview({
  stats,
  isLoading = false,
}: ExperienceStatsOverviewProps) {
  const cards = [
    {
      title: "Total Roles",
      value: stats.totalExperiences,
      label: "Recorded experiences",
      icon: Briefcase,
      accent: "text-primary border-primary/20 bg-primary/10",
    },
    {
      title: "Current Position",
      value: stats.currentRolesCount,
      label: "Active roles in progress",
      icon: Sparkles,
      accent: "text-emerald-500 border-emerald-500/20 bg-emerald-500/10",
    },
    {
      title: "Companies",
      value: stats.totalCompaniesCount,
      label: "Distinct organizations",
      icon: Building2,
      accent: "text-sky-500 border-sky-500/20 bg-sky-500/10",
    },
    {
      title: "Tech Stack",
      value: `${stats.totalTechnologiesCount}+`,
      label: "Technologies utilized",
      icon: Cpu,
      accent: "text-violet-500 border-violet-500/20 bg-violet-500/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => {
        const Icon = card.icon
        return (
          <Card key={idx} className="border-border bg-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  {card.title}
                </span>
                <div className={`rounded-md border p-2 ${card.accent}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-black tracking-tight text-foreground tabular-nums">
                  {isLoading ? "—" : card.value}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {card.label}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
