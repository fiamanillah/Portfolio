// apps/dashboard/src/app/(dashboard)/comments/components/comment-stats-cards.tsx
import * as React from "react";
import { Clock, Flag, ShieldCheck, ShieldX } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import type { CommentModerationStatsDTO } from "@workspace/shared";

interface CommentStatsCardsProps {
  stats: CommentModerationStatsDTO;
  activeTab: "comments" | "reports";
  statusFilter: string;
  onSelectCategory: (tab: "comments" | "reports", status: string) => void;
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
        className={`cursor-pointer transition-all border-border/80 hover:border-primary/50 ${
          statusFilter === "ALL" && activeTab === "comments" ? "ring-2 ring-primary/40" : ""
        }`}
        onClick={() => onSelectCategory("comments", "ALL")}
      >
        <CardHeader className="p-4 pb-2">
          <CardDescription className="text-xs font-mono">Total Comments</CardDescription>
          <CardTitle className="text-2xl font-bold">{stats.totalComments}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <span className="text-[11px] text-muted-foreground">Across all published articles</span>
        </CardContent>
      </Card>

      {/* Pending Moderation */}
      <Card
        className={`cursor-pointer transition-all border-border/80 hover:border-amber-500/50 ${
          statusFilter === "PENDING" && activeTab === "comments" ? "ring-2 ring-amber-500/40 bg-amber-500/5" : ""
        }`}
        onClick={() => onSelectCategory("comments", "PENDING")}
      >
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <CardDescription className="text-xs font-mono text-amber-600 dark:text-amber-400 font-semibold">
              Pending
            </CardDescription>
            <Clock className="size-4 text-amber-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {stats.pendingCount}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <span className="text-[11px] text-muted-foreground">Awaiting moderator review</span>
        </CardContent>
      </Card>

      {/* Approved Comments */}
      <Card
        className={`cursor-pointer transition-all border-border/80 hover:border-emerald-500/50 ${
          statusFilter === "APPROVED" && activeTab === "comments" ? "ring-2 ring-emerald-500/40" : ""
        }`}
        onClick={() => onSelectCategory("comments", "APPROVED")}
      >
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <CardDescription className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              Approved
            </CardDescription>
            <ShieldCheck className="size-4 text-emerald-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats.approvedCount}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <span className="text-[11px] text-muted-foreground">Visible on public posts</span>
        </CardContent>
      </Card>

      {/* Reported Queue */}
      <Card
        className={`cursor-pointer transition-all border-border/80 hover:border-rose-500/50 ${
          activeTab === "reports" ? "ring-2 ring-rose-500/40 bg-rose-500/5" : ""
        }`}
        onClick={() => onSelectCategory("reports", "ALL")}
      >
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <CardDescription className="text-xs font-mono text-rose-600 dark:text-rose-400 font-semibold">
              Reported Queue
            </CardDescription>
            <Flag className="size-4 text-rose-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {stats.pendingReportsCount}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <span className="text-[11px] text-muted-foreground">{stats.totalReports} total flags filed</span>
        </CardContent>
      </Card>

      {/* Spam Blocked */}
      <Card
        className={`cursor-pointer transition-all border-border/80 hover:border-zinc-500/50 ${
          statusFilter === "SPAM" && activeTab === "comments" ? "ring-2 ring-zinc-500/40" : ""
        }`}
        onClick={() => onSelectCategory("comments", "SPAM")}
      >
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <CardDescription className="text-xs font-mono">Spam Blocked</CardDescription>
            <ShieldX className="size-4 text-zinc-400" />
          </div>
          <CardTitle className="text-2xl font-bold">{stats.spamCount}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <span className="text-[11px] text-muted-foreground">Hidden from readers</span>
        </CardContent>
      </Card>
    </div>
  );
}
