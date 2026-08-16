"use client"

import * as React from "react"
import {
  Layers,
  CheckCircle2,
  FileEdit,
  Sparkles,
  Eye,
  ThumbsUp,
} from "lucide-react"
import { Card, CardContent } from "@workspace/ui/components/card"
import type { CaseStudyStatsDTO } from "@workspace/shared"

interface CaseStudyStatsOverviewProps {
  stats: CaseStudyStatsDTO
}

export function CaseStudyStatsOverview({ stats }: CaseStudyStatsOverviewProps) {
  const statCards = [
    {
      title: "Total Case Studies",
      value: stats.totalCaseStudies,
      subtitle: `${stats.featuredCount} featured projects`,
      icon: Layers,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Published",
      value: stats.publishedCount,
      subtitle: "Live in portfolio",
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Drafts & Archived",
      value: stats.draftCount + stats.archivedCount,
      subtitle: `${stats.draftCount} drafts, ${stats.archivedCount} archived`,
      icon: FileEdit,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      title: "Total Views",
      value: stats.totalViews.toLocaleString(),
      subtitle: `${stats.totalLikes} total reactions`,
      icon: Eye,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card) => (
        <Card key={card.title} className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {card.title}
              </span>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.bg} ${card.color}`}
              >
                <card.icon className="size-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black tracking-tight text-foreground">
                {card.value}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {card.subtitle}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
