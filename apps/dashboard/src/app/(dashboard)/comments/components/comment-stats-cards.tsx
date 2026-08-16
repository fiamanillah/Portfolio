// apps/dashboard/src/app/(dashboard)/comments/components/comment-stats-cards.tsx
import * as React from "react"
import { Clock, Flag, ShieldCheck, ShieldX } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import type { CommentModerationStatsDTO } from "@workspace/shared"

interface CommentStatsCardsProps {
  stats: CommentModerationStatsDTO
  activeTab: "comments" | "reports"
  statusFilter: string
  onSelectCategory: (tab: "comments" | "reports", status: string) => void
}

export function CommentStatsCards({
  stats,
  activeTab,
  statusFilter,
  onSelectCategory,
}: CommentStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {/* Total Comments */}
      <Card
        className={`cursor-pointer border-border/80 transition-all hover:border-primary/50 ${
          statusFilter === "ALL" && activeTab === "comments"
            ? "ring-2 ring-primary/40"
            : ""
        }`}
        onClick={() => onSelectCategory("comments", "ALL")}
      >
        <CardHeader className="p-4 pb-2">
          <CardDescription className="font-mono text-xs">
            Total Comments
          </CardDescription>
          <CardTitle className="text-2xl font-bold">
            {stats.totalComments}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <span className="text-[11px] text-muted-foreground">
            Across all published articles
          </span>
        </CardContent>
      </Card>

      {/* Pending Moderation */}
      <Card
        className={`cursor-pointer border-border/80 transition-all hover:border-amber-500/50 ${
          statusFilter === "PENDING" && activeTab === "comments"
            ? "bg-amber-500/5 ring-2 ring-amber-500/40"
            : ""
        }`}
        onClick={() => onSelectCategory("comments", "PENDING")}
      >
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <CardDescription className="font-mono text-xs font-semibold text-amber-600 dark:text-amber-400">
              Pending
            </CardDescription>
            <Clock className="size-4 text-amber-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {stats.pendingCount}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <span className="text-[11px] text-muted-foreground">
            Awaiting moderator review
          </span>
        </CardContent>
      </Card>

      {/* Approved Comments */}
      <Card
        className={`cursor-pointer border-border/80 transition-all hover:border-emerald-500/50 ${
          statusFilter === "APPROVED" && activeTab === "comments"
            ? "ring-2 ring-emerald-500/40"
            : ""
        }`}
        onClick={() => onSelectCategory("comments", "APPROVED")}
      >
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <CardDescription className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Approved
            </CardDescription>
            <ShieldCheck className="size-4 text-emerald-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats.approvedCount}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <span className="text-[11px] text-muted-foreground">
            Visible on public posts
          </span>
        </CardContent>
      </Card>

      {/* Reported Queue */}
      <Card
        className={`cursor-pointer border-border/80 transition-all hover:border-rose-500/50 ${
          activeTab === "reports" ? "bg-rose-500/5 ring-2 ring-rose-500/40" : ""
        }`}
        onClick={() => onSelectCategory("reports", "ALL")}
      >
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <CardDescription className="font-mono text-xs font-semibold text-rose-600 dark:text-rose-400">
              Reported Queue
            </CardDescription>
            <Flag className="size-4 text-rose-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {stats.pendingReportsCount}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <span className="text-[11px] text-muted-foreground">
            {stats.totalReports} total flags filed
          </span>
        </CardContent>
      </Card>

      {/* Spam Blocked */}
      <Card
        className={`cursor-pointer border-border/80 transition-all hover:border-zinc-500/50 ${
          statusFilter === "SPAM" && activeTab === "comments"
            ? "ring-2 ring-zinc-500/40"
            : ""
        }`}
        onClick={() => onSelectCategory("comments", "SPAM")}
      >
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <CardDescription className="font-mono text-xs">
              Spam Blocked
            </CardDescription>
            <ShieldX className="size-4 text-zinc-400" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {stats.spamCount}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <span className="text-[11px] text-muted-foreground">
            Hidden from readers
          </span>
        </CardContent>
      </Card>
    </div>
  )
}
