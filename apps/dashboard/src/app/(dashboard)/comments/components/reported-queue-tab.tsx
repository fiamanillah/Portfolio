// apps/dashboard/src/app/(dashboard)/comments/components/reported-queue-tab.tsx
import * as React from "react";
import { Search, ShieldCheck, Ban, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import type { CommentReportDTO } from "@workspace/shared";
import { renderStatusBadge, renderReasonBadge } from "./comment-badge-utils";

interface ReportedQueueTabProps {
  reports: CommentReportDTO[];
  loading: boolean;
  actionLoading: boolean;
  searchQuery: string;
  statusFilter: string;
  reasonFilter: string;
  page: number;
  totalPages: number;
  onSearchChange: (q: string) => void;
  onStatusFilterChange: (s: string) => void;
  onReasonFilterChange: (r: string) => void;
  onPageChange: (p: number) => void;
  onDismissReport: (id: string) => void;
  onOpenResolver: (report: CommentReportDTO, initialAction: string) => void;
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
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between bg-card/60 p-3 rounded-lg border border-border/80">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search reported claims or details..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>

          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-[150px] h-9 text-xs">
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
            <SelectTrigger className="w-[150px] h-9 text-xs">
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
              <Card key={i} className="animate-pulse p-6 bg-card/40">
                <div className="h-4 w-40 bg-muted/60 mb-2" />
                <div className="h-3 w-full bg-muted/40" />
              </Card>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <ShieldCheck className="size-10 text-emerald-500 mx-auto mb-3" />
            <h3 className="font-semibold text-base">No reported comments pending review</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
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
                    <span className="font-semibold text-sm">
                      Flagged by{" "}
                      {report.reporterName || report.reporter?.name || "Anonymous Reader"}
                    </span>
                    {report.reporterEmail && (
                      <span className="text-xs text-muted-foreground font-mono">
                        ({report.reporterEmail})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {report.status === "PENDING" ? (
                      <Badge className="bg-rose-500 text-white text-[10px]">
                        Pending Action
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">
                        {report.status}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground font-mono">
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

              <CardContent className="p-4 pt-0 space-y-3">
                {/* Reporter reason explanation */}
                {report.details && (
                  <div className="bg-rose-500/5 p-3 rounded-md border border-rose-500/20 text-xs">
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
                        Offending Comment by: <strong>{report.comment.author?.name}</strong> on
                        article <strong>{report.comment.postTitle}</strong>
                      </span>
                      {renderStatusBadge(report.comment.status)}
                    </div>

                    <div className="text-xs bg-muted/30 p-3 rounded border border-border/60 leading-relaxed italic text-foreground/90">
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
                  <div className="bg-muted/40 p-2.5 rounded text-xs border border-border/40">
                    <span className="font-semibold">Resolution Note: </span>
                    <span>{report.resolutionNotes}</span>
                  </div>
                )}

                {/* Resolution Actions Bar */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
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
                    className="h-8 text-xs gap-1 text-amber-600 hover:bg-amber-500/10"
                  >
                    <Ban className="size-3.5" />
                    Mark as Spam
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => onOpenResolver(report, "DELETE_COMMENT")}
                    disabled={actionLoading}
                    className="h-8 text-xs gap-1 bg-rose-600 hover:bg-rose-700 text-white"
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
        <div className="flex items-center justify-between pt-4 border-t border-border/60">
          <span className="text-xs text-muted-foreground font-mono">
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
  );
}
