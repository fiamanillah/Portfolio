// apps/dashboard/src/app/(dashboard)/comments/components/reported-queue-tab.tsx
import * as React from "react"
import { Search, ShieldCheck, Ban, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import type { CommentReportDTO } from "@workspace/shared"
import { renderStatusBadge, renderReasonBadge } from "./comment-badge-utils"

interface ReportedQueueTabProps {
  reports: CommentReportDTO[]
  loading: boolean
  actionLoading: boolean
  searchQuery: string
  statusFilter: string
  reasonFilter: string
  page: number
  totalPages: number
  onSearchChange: (q: string) => void
  onStatusFilterChange: (s: string) => void
  onReasonFilterChange: (r: string) => void
  onPageChange: (p: number) => void
  onDismissReport: (id: string) => void
  onOpenResolver: (report: CommentReportDTO, initialAction: string) => void
}

export function ReportedQueueTab({
  reports,
  loading,
  actionLoading,
  searchQuery,
  statusFilter,
  reasonFilter,
  page,
  totalPages,
  onSearchChange,
  onStatusFilterChange,
  onReasonFilterChange,
  onPageChange,
  onDismissReport,
  onOpenResolver,
}: ReportedQueueTabProps) {
  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-col gap-3 rounded-lg border border-border/80 bg-card/60 p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-72">
            <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search reported claims or details..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 pl-8 text-xs"
            />
          </div>

          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="h-9 w-[150px] text-xs">
              <SelectValue placeholder="Report Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Report Statuses</SelectItem>
              <SelectItem value="PENDING">Pending Review</SelectItem>
              <SelectItem value="REVIEWED">Reviewed</SelectItem>
              <SelectItem value="ACTION_TAKEN">Action Taken</SelectItem>
              <SelectItem value="DISMISSED">Dismissed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={reasonFilter} onValueChange={onReasonFilterChange}>
            <SelectTrigger className="h-9 w-[150px] text-xs">
              <SelectValue placeholder="Report Reason" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Reasons</SelectItem>
              <SelectItem value="SPAM">Spam</SelectItem>
              <SelectItem value="HARASSMENT">Harassment</SelectItem>
              <SelectItem value="HATE_SPEECH">Hate Speech</SelectItem>
              <SelectItem value="INAPPROPRIATE">Inappropriate</SelectItem>
              <SelectItem value="MISINFORMATION">Misinformation</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse bg-card/40 p-6">
                <div className="mb-2 h-4 w-40 bg-muted/60" />
                <div className="h-3 w-full bg-muted/40" />
              </Card>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <Card className="border-dashed p-12 text-center">
            <ShieldCheck className="mx-auto mb-3 size-10 text-emerald-500" />
            <h3 className="text-base font-semibold">
              No reported comments pending review
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
              All community flags have been moderated and resolved.
            </p>
          </Card>
        ) : (
          reports.map((report) => (
            <Card
              key={report.id}
              className={`border transition-all ${
                report.status === "PENDING"
                  ? "border-rose-500/40 bg-rose-500/[0.02]"
                  : "border-border/80 bg-card/60"
              }`}
            >
              <CardHeader className="p-4 pb-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    {renderReasonBadge(report.reason)}
                    <span className="text-sm font-semibold">
                      Flagged by{" "}
                      {report.reporterName ||
                        report.reporter?.name ||
                        "Anonymous Reader"}
                    </span>
                    {report.reporterEmail && (
                      <span className="font-mono text-xs text-muted-foreground">
                        ({report.reporterEmail})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {report.status === "PENDING" ? (
                      <Badge className="bg-rose-500 text-[10px] text-white">
                        Pending Action
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">
                        {report.status}
                      </Badge>
                    )}
                    <span className="font-mono text-xs text-muted-foreground">
                      {new Date(report.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 p-4 pt-0">
                {/* Reporter reason explanation */}
                {report.details && (
                  <div className="rounded-md border border-rose-500/20 bg-rose-500/5 p-3 text-xs">
                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                      Reporter Note:{" "}
                    </span>
                    <span className="text-foreground/90">{report.details}</span>
                  </div>
                )}

                {/* Offending Comment Box */}
                {report.comment ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        Offending Comment by:{" "}
                        <strong>{report.comment.author?.name}</strong> on
                        article <strong>{report.comment.postTitle}</strong>
                      </span>
                      {renderStatusBadge(report.comment.status)}
                    </div>

                    <div className="rounded border border-border/60 bg-muted/30 p-3 text-xs leading-relaxed text-foreground/90 italic">
                      &ldquo;{report.comment.content}&rdquo;
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    The reported comment has been deleted.
                  </p>
                )}

                {/* Resolution Notes if reviewed */}
                {report.resolutionNotes && (
                  <div className="rounded border border-border/40 bg-muted/40 p-2.5 text-xs">
                    <span className="font-semibold">Resolution Note: </span>
                    <span>{report.resolutionNotes}</span>
                  </div>
                )}

                {/* Resolution Actions Bar */}
                <div className="flex items-center justify-end gap-2 border-t border-border/40 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDismissReport(report.id)}
                    disabled={actionLoading || report.status === "DISMISSED"}
                    className="h-8 text-xs text-muted-foreground"
                  >
                    Dismiss Report
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenResolver(report, "MARK_SPAM")}
                    disabled={actionLoading}
                    className="h-8 gap-1 text-xs text-amber-600 hover:bg-amber-500/10"
                  >
                    <Ban className="size-3.5" />
                    Mark as Spam
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => onOpenResolver(report, "DELETE_COMMENT")}
                    disabled={actionLoading}
                    className="h-8 gap-1 bg-rose-600 text-xs text-white hover:bg-rose-700"
                  >
                    <Trash2 className="size-3.5" />
                    Take Action / Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Reports Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/60 pt-4">
          <span className="font-mono text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page <= 1 || loading}
              className="h-8 text-xs"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages || loading}
              className="h-8 text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
