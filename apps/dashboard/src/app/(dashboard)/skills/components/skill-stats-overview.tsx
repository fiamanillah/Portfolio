"use client"

import * as React from "react"
import {
  Cpu,
  Layers,
  Sparkles,
  CheckCircle2,
  Tag,
  Star,
} from "lucide-react"
import { Card, CardContent } from "@workspace/ui/components/card"
import type { SkillStatsDTO } from "@workspace/shared"

interface SkillStatsOverviewProps {
  stats: SkillStatsDTO
  isLoading?: boolean
}

export function SkillStatsOverview({
  stats,
  isLoading = false,
}: SkillStatsOverviewProps) {
  const publishedPercent =
    stats.totalSkills > 0
      ? Math.round((stats.publishedCount / stats.totalSkills) * 100)
      : 0

  const cards = [
    {
      title: "Total Skills",
      value: stats.totalSkills,
      label: `${stats.publishedCount} published · ${stats.draftCount} drafts`,
      icon: Cpu,
      accent: "text-primary border-primary/20 bg-primary/10",
    },
    {
      title: "Stack Categories",
      value: stats.totalCategories,
      label: "Architecture & domain groups",
      icon: Layers,
      accent: "text-sky-500 border-sky-500/20 bg-sky-500/10",
    },
    {
      title: "Featured Tech",
      value: stats.featuredCount,
      label: "Highlighted capabilities",
      icon: Star,
      accent: "text-amber-500 border-amber-500/20 bg-amber-500/10",
    },
    {
      title: "Published Status",
      value: `${publishedPercent}%`,
      label: `${stats.publishedCount} active in live portfolio`,
      icon: CheckCircle2,
      accent: "text-emerald-500 border-emerald-500/20 bg-emerald-500/10",
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
