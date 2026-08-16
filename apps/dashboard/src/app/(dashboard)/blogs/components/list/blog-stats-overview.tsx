"use client"

import * as React from "react"
import { FileText, Eye, ThumbsUp, Calendar } from "lucide-react"
import { Card } from "@workspace/ui/components/card"
import type { BlogStatsDTO } from "@workspace/shared"

interface BlogStatsOverviewProps {
  stats: BlogStatsDTO
}

export function BlogStatsOverview({ stats }: BlogStatsOverviewProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* Total Posts */}
      <Card className="border-border/80 bg-card p-3.5 shadow-xs space-y-1">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Posts</span>
          <FileText className="h-4 w-4 text-primary" />
        </div>
        <div className="text-2xl font-bold text-foreground font-mono">
          {stats.totalPosts}
        </div>
      </Card>

      {/* Published */}
      <Card className="border-border/80 bg-card p-3.5 shadow-xs space-y-1">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold uppercase tracking-wider">Published</span>
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
        </div>
        <div className="text-2xl font-bold text-emerald-500 font-mono">
          {stats.publishedPosts}
        </div>
      </Card>

      {/* Drafts */}
      <Card className="border-border/80 bg-card p-3.5 shadow-xs space-y-1">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold uppercase tracking-wider">Drafts</span>
          <span className="h-2 w-2 rounded-full bg-amber-500" />
        </div>
        <div className="text-2xl font-bold text-amber-500 font-mono">
          {stats.draftPosts}
        </div>
      </Card>

      {/* Scheduled */}
      <Card className="border-border/80 bg-card p-3.5 shadow-xs space-y-1">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold uppercase tracking-wider">Scheduled</span>
          <Calendar className="h-4 w-4 text-blue-500" />
        </div>
        <div className="text-2xl font-bold text-blue-500 font-mono">
          {stats.scheduledPosts}
        </div>
      </Card>

      {/* Total Views */}
      <Card className="border-border/80 bg-card p-3.5 shadow-xs space-y-1">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Views</span>
          <Eye className="h-4 w-4 text-purple-500" />
        </div>
        <div className="text-2xl font-bold text-foreground font-mono">
          {stats.totalViews > 999
            ? `${(stats.totalViews / 1000).toFixed(1)}k`
            : stats.totalViews}
        </div>
      </Card>

      {/* Total Likes */}
      <Card className="border-border/80 bg-card p-3.5 shadow-xs space-y-1">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Likes</span>
          <ThumbsUp className="h-4 w-4 text-rose-500" />
        </div>
        <div className="text-2xl font-bold text-foreground font-mono">
          {stats.totalLikes}
        </div>
      </Card>
    </div>
  )
}
