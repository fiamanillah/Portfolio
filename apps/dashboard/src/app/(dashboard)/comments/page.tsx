"use client"

import * as React from "react"
import {
  Check,
  CheckCircle2,
  Filter,
  MessageSquare,
  Search,
  Trash2,
  ShieldAlert,
  RefreshCw,
  Ban,
  Layers,
  SlidersHorizontal,
  Flag,
} from "lucide-react"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { toast } from "@workspace/ui/components/sonner"

import { CommentApi } from "@/lib/api"
import type {
  CommentAdminListItemDTO,
  CommentModerationStatsDTO,
  CommentReportDTO,
  CommentStatus,
  CommentReportReason,
  CommentReportStatus,
} from "@workspace/shared"

// Modular Components
import { CommentStatsCards } from "./components/comment-stats-cards"
import { CommentsFeedView } from "./components/comments-feed-view"
import { CommentsTableView } from "./components/comments-table-view"
import { ReportedQueueTab } from "./components/reported-queue-tab"
import { ThreadInspectorDialog } from "./components/thread-inspector-dialog"
import { ReportResolverDialog } from "./components/report-resolver-dialog"
import { DeleteConfirmDialog } from "./components/delete-confirm-dialog"

export default function CommentsModerationPage() {
  const [activeTab, setActiveTab] = React.useState<"comments" | "reports">(
    "comments"
  )
  const [loading, setLoading] = React.useState(true)
  const [actionLoading, setActionLoading] = React.useState(false)

  // Statistics
  const [stats, setStats] = React.useState<CommentModerationStatsDTO>({
    totalComments: 0,
    pendingCount: 0,
    approvedCount: 0,
    spamCount: 0,
    rejectedCount: 0,
    totalReports: 0,
    pendingReportsCount: 0,
  })

  // Comments state
  const [comments, setComments] = React.useState<CommentAdminListItemDTO[]>([])
  const [commentsPage, setCommentsPage] = React.useState(1)
  const [commentsTotal, setCommentsTotal] = React.useState(0)
  const [commentsTotalPages, setCommentsTotalPages] = React.useState(1)
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL")
  const [reportedOnlyFilter, setReportedOnlyFilter] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCommentIds, setSelectedCommentIds] = React.useState<string[]>(
    []
  )
  const [viewMode, setViewMode] = React.useState<"cards" | "table">("cards")

  // Reports state
  const [reports, setReports] = React.useState<CommentReportDTO[]>([])
  const [reportsPage, setReportsPage] = React.useState(1)
  const [reportsTotal, setReportsTotal] = React.useState(0)
  const [reportsTotalPages, setReportsTotalPages] = React.useState(1)
  const [reportStatusFilter, setReportStatusFilter] =
    React.useState<string>("ALL")
  const [reportReasonFilter, setReportReasonFilter] =
    React.useState<string>("ALL")
  const [reportSearchQuery, setReportSearchQuery] = React.useState("")

  // Dialog states
  const [inspectComment, setInspectComment] = React.useState<any | null>(null)
  const [activeReportToResolve, setActiveReportToResolve] =
    React.useState<CommentReportDTO | null>(null)
  const [reportAction, setReportAction] =
    React.useState<string>("DELETE_COMMENT")
  const [reportResolutionNotes, setReportResolutionNotes] = React.useState("")
  const [deleteConfirmTarget, setDeleteConfirmTarget] = React.useState<{
    id: string
    type: "single" | "bulk"
  } | null>(null)

  // Load stats
  const fetchStats = React.useCallback(async () => {
    try {
      const res = await CommentApi.getStats()
      if (res.success && res.data) {
        setStats(res.data)
      }
    } catch (err) {
      console.error("Failed to load moderation stats:", err)
    }
  }, [])

  // Load comments
  const fetchComments = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await CommentApi.getComments({
        page: commentsPage,
        limit: 15,
        search: searchQuery || undefined,
        status:
          statusFilter !== "ALL" ? (statusFilter as CommentStatus) : undefined,
        reportedOnly: reportedOnlyFilter || undefined,
      })

      if (res.success && res.data) {
        setComments(res.data)
        if (res.pagination) {
          setCommentsTotal(res.pagination.total)
          setCommentsTotalPages(
            res.pagination.pages || res.pagination.totalPages || 1
          )
        }
      }
    } catch (err) {
      console.error("Failed to load comments:", err)
      toast.error("Failed to load comments list")
    } finally {
      setLoading(false)
    }
  }, [commentsPage, searchQuery, statusFilter, reportedOnlyFilter])

  // Load reports
  const fetchReports = React.useCallback(async () => {
    setLoading(true)
    try {
      const res = await CommentApi.getReports({
        page: reportsPage,
        limit: 15,
        search: reportSearchQuery || undefined,
        status:
          reportStatusFilter !== "ALL"
            ? (reportStatusFilter as CommentReportStatus)
            : undefined,
        reason:
          reportReasonFilter !== "ALL"
            ? (reportReasonFilter as CommentReportReason)
            : undefined,
      })

      if (res.success && res.data) {
        setReports(res.data)
        if (res.pagination) {
          setReportsTotal(res.pagination.total)
          setReportsTotalPages(
            res.pagination.pages || res.pagination.totalPages || 1
          )
        }
      }
    } catch (err) {
      console.error("Failed to load reports:", err)
      toast.error("Failed to load reports list")
    } finally {
      setLoading(false)
    }
  }, [reportsPage, reportSearchQuery, reportStatusFilter, reportReasonFilter])

  // Initial loads
  React.useEffect(() => {
    fetchStats()
  }, [fetchStats])

  React.useEffect(() => {
    if (activeTab === "comments") {
      fetchComments()
    } else {
      fetchReports()
    }
  }, [activeTab, fetchComments, fetchReports])

  // Status update
  const handleUpdateStatus = async (
    id: string,
    status: CommentStatus,
    isPinned?: boolean
  ) => {
    setActionLoading(true)
    try {
      const res = await CommentApi.updateStatus(id, { status, isPinned })
      if (res.success) {
        toast.success(`Comment marked as ${status}`)
        fetchComments()
        fetchStats()
      } else {
        toast.error(res.error || "Failed to update status")
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to update status")
    } finally {
      setActionLoading(false)
    }
  }

  // Delete comment
  const handleDeleteComment = async (id: string) => {
    setActionLoading(true)
    try {
      const res = await CommentApi.deleteComment(id)
      if (res.success) {
        toast.success("Comment deleted permanently")
        setDeleteConfirmTarget(null)
        if (inspectComment?.id === id) setInspectComment(null)
        fetchComments()
        fetchStats()
      } else {
        toast.error(res.error || "Failed to delete comment")
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to delete comment")
    } finally {
      setActionLoading(false)
    }
  }

  // Bulk actions
  const handleBulkStatus = async (status: CommentStatus) => {
    if (selectedCommentIds.length === 0) return
    setActionLoading(true)
    try {
      const res = await CommentApi.bulkUpdateStatus({
        commentIds: selectedCommentIds,
        status,
      })
      if (res.success) {
        toast.success(
          `Updated ${res.data?.count || selectedCommentIds.length} comments to ${status}`
        )
        setSelectedCommentIds([])
        fetchComments()
        fetchStats()
      } else {
        toast.error(res.error || "Bulk action failed")
      }
    } catch (e: any) {
      toast.error(e.message || "Bulk action failed")
    } finally {
      setActionLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedCommentIds.length === 0) return
    setActionLoading(true)
    try {
      const res = await CommentApi.bulkDelete({
        commentIds: selectedCommentIds,
      })
      if (res.success) {
        toast.success(
          `Deleted ${res.data?.count || selectedCommentIds.length} comments`
        )
        setSelectedCommentIds([])
        setDeleteConfirmTarget(null)
        fetchComments()
        fetchStats()
      } else {
        toast.error(res.error || "Bulk delete failed")
      }
    } catch (e: any) {
      toast.error(e.message || "Bulk delete failed")
    } finally {
      setActionLoading(false)
    }
  }

  // Inspect comment thread
  const handleInspect = async (id: string) => {
    try {
      const res = await CommentApi.getById(id)
      if (res.success && res.data) {
        setInspectComment(res.data)
      } else {
        toast.error("Failed to load comment details")
      }
    } catch (e: any) {
      toast.error(e.message || "Error loading comment details")
    }
  }

  // Resolve report
  const handleResolveReport = async () => {
    if (!activeReportToResolve) return
    setActionLoading(true)
    try {
      const res = await CommentApi.resolveReport(activeReportToResolve.id, {
        status: "ACTION_TAKEN" as CommentReportStatus,
        action: reportAction as any,
        resolutionNotes: reportResolutionNotes || undefined,
      })

      if (res.success) {
        toast.success("Report resolved successfully")
        setActiveReportToResolve(null)
        setReportResolutionNotes("")
        fetchReports()
        fetchComments()
        fetchStats()
      } else {
        toast.error(res.error || "Failed to resolve report")
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to resolve report")
    } finally {
      setActionLoading(false)
    }
  }

  // Dismiss report
  const handleDismissReport = async (reportId: string) => {
    setActionLoading(true)
    try {
      const res = await CommentApi.resolveReport(reportId, {
        status: "DISMISSED" as CommentReportStatus,
        action: "DISMISS",
        resolutionNotes: "Dismissed by admin after review",
      })

      if (res.success) {
        toast.success("Report dismissed")
        fetchReports()
        fetchStats()
      } else {
        toast.error(res.error || "Failed to dismiss report")
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to dismiss report")
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggleSelectComment = (id: string) => {
    if (selectedCommentIds.includes(id)) {
      setSelectedCommentIds(selectedCommentIds.filter((cid) => cid !== id))
    } else {
      setSelectedCommentIds([...selectedCommentIds, id])
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Comments & Moderation Hub
            </h1>
            {stats.pendingReportsCount > 0 && (
              <Badge className="animate-pulse bg-rose-500 font-mono text-[10px] text-white">
                {stats.pendingReportsCount} FLAGGED ISSUES
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time management for community discussions, threaded replies,
            and user-flagged reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchStats()
              if (activeTab === "comments") fetchComments()
              else fetchReports()
            }}
            disabled={loading}
            className="h-9 gap-1.5 text-xs"
          >
            <RefreshCw
              className={`size-3.5 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          {stats.pendingCount > 0 && (
            <Button
              size="sm"
              onClick={async () => {
                const pendingIds = comments
                  .filter((c) => c.status === "PENDING")
                  .map((c) => c.id)
                if (pendingIds.length > 0) {
                  await CommentApi.bulkUpdateStatus({
                    commentIds: pendingIds,
                    status: "APPROVED",
                  })
                  toast.success("All pending comments approved")
                  fetchComments()
                  fetchStats()
                }
              }}
              className="h-9 gap-1.5 bg-emerald-600 text-xs text-white hover:bg-emerald-700"
            >
              <CheckCircle2 className="size-3.5" />
              Approve All Pending ({stats.pendingCount})
            </Button>
          )}
        </div>
      </div>

      {/* KPI Metric Cards */}
      <CommentStatsCards
        stats={stats}
        activeTab={activeTab}
        statusFilter={statusFilter}
        onSelectCategory={(tab, status) => {
          setActiveTab(tab)
          setStatusFilter(status)
          setReportedOnlyFilter(false)
        }}
      />

      {/* Main Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as any)}
        className="space-y-4"
      >
        <div className="flex flex-col gap-3 border-b pb-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="grid w-full grid-cols-2 sm:w-auto">
            <TabsTrigger value="comments" className="gap-2 text-xs">
              <MessageSquare className="size-3.5" />
              All Discussions ({stats.totalComments})
            </TabsTrigger>
            <TabsTrigger value="reports" className="relative gap-2 text-xs">
              <ShieldAlert className="size-3.5 text-rose-500" />
              Reported Queue
              {stats.pendingReportsCount > 0 && (
                <span className="py-0.2 ml-1 rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                  {stats.pendingReportsCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* View Mode Toggle */}
          {activeTab === "comments" && (
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button
                variant={viewMode === "cards" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("cards")}
                className="h-8 gap-1.5 px-2.5 text-xs"
              >
                <Layers className="size-3.5" />
                Feed View
              </Button>
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="h-8 gap-1.5 px-2.5 text-xs"
              >
                <SlidersHorizontal className="size-3.5" />
                Table View
              </Button>
            </div>
          )}
        </div>

        {/* Tab 1: All Discussions */}
        <TabsContent value="comments" className="mt-0 space-y-4">
          {/* Filter and Search Bar */}
          <div className="flex flex-col gap-3 rounded-lg border border-border/80 bg-card/60 p-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-72">
                <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search comments, authors, or articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 pl-8 text-xs"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-[140px] text-xs">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending Review</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="SPAM">Spam Blocked</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={reportedOnlyFilter ? "destructive" : "outline"}
                size="sm"
                onClick={() => setReportedOnlyFilter(!reportedOnlyFilter)}
                className="h-9 gap-1.5 text-xs"
              >
                <Flag className="size-3.5" />
                {reportedOnlyFilter ? "Showing Flagged Only" : "Flagged Only"}
              </Button>
            </div>

            {/* Bulk Toolbar */}
            {selectedCommentIds.length > 0 && (
              <div className="flex animate-in items-center gap-2 rounded-md border border-primary/30 bg-muted/60 px-3 py-1.5 fade-in">
                <span className="font-mono text-xs font-semibold text-primary">
                  {selectedCommentIds.length} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatus("APPROVED")}
                  disabled={actionLoading}
                  className="h-7 gap-1 text-xs text-emerald-600"
                >
                  <Check className="size-3" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatus("SPAM")}
                  disabled={actionLoading}
                  className="h-7 gap-1 text-xs text-amber-600"
                >
                  <Ban className="size-3" />
                  Mark Spam
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setDeleteConfirmTarget({ id: "", type: "bulk" })
                  }
                  disabled={actionLoading}
                  className="h-7 gap-1 text-xs text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-3" />
                  Delete
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCommentIds([])}
                  className="h-7 text-xs text-muted-foreground"
                >
                  Clear
                </Button>
              </div>
            )}
          </div>

          {/* Select all header */}
          {comments.length > 0 && (
            <div className="flex items-center justify-between px-2 font-mono text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={
                    comments.length > 0 &&
                    selectedCommentIds.length === comments.length
                  }
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedCommentIds(comments.map((c) => c.id))
                    } else {
                      setSelectedCommentIds([])
                    }
                  }}
                  id="select-all-comments"
                />
                <label htmlFor="select-all-comments" className="cursor-pointer">
                  Select all on this page ({comments.length})
                </label>
              </div>
              <span>
                Showing {comments.length} of {commentsTotal} total comments
              </span>
            </div>
          )}

          {/* Views */}
          {viewMode === "cards" ? (
            <CommentsFeedView
              comments={comments}
              loading={loading}
              selectedCommentIds={selectedCommentIds}
              actionLoading={actionLoading}
              onToggleSelect={handleToggleSelectComment}
              onInspect={handleInspect}
              onUpdateStatus={handleUpdateStatus}
              onDeleteConfirm={(id) =>
                setDeleteConfirmTarget({ id, type: "single" })
              }
            />
          ) : (
            <CommentsTableView
              comments={comments}
              selectedCommentIds={selectedCommentIds}
              onToggleSelect={handleToggleSelectComment}
              onSelectAllPage={(checked) => {
                if (checked) setSelectedCommentIds(comments.map((c) => c.id))
                else setSelectedCommentIds([])
              }}
              onInspect={handleInspect}
              onUpdateStatus={(id, status) => handleUpdateStatus(id, status)}
              onDeleteConfirm={(id) =>
                setDeleteConfirmTarget({ id, type: "single" })
              }
            />
          )}

          {/* Comments Pagination */}
          {commentsTotalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border/60 pt-4">
              <span className="font-mono text-xs text-muted-foreground">
                Page {commentsPage} of {commentsTotalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCommentsPage((p) => Math.max(1, p - 1))}
                  disabled={commentsPage <= 1 || loading}
                  className="h-8 text-xs"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCommentsPage((p) => Math.min(commentsTotalPages, p + 1))
                  }
                  disabled={commentsPage >= commentsTotalPages || loading}
                  className="h-8 text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Reported Queue */}
        <TabsContent value="reports" className="mt-0 space-y-4">
          <ReportedQueueTab
            reports={reports}
            loading={loading}
            actionLoading={actionLoading}
            searchQuery={reportSearchQuery}
            statusFilter={reportStatusFilter}
            reasonFilter={reportReasonFilter}
            page={reportsPage}
            totalPages={reportsTotalPages}
            onSearchChange={setReportSearchQuery}
            onStatusFilterChange={setReportStatusFilter}
            onReasonFilterChange={setReportReasonFilter}
            onPageChange={setReportsPage}
            onDismissReport={handleDismissReport}
            onOpenResolver={(rep, action) => {
              setActiveReportToResolve(rep)
              setReportAction(action)
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ThreadInspectorDialog
        comment={inspectComment}
        onClose={() => setInspectComment(null)}
        onDeleteConfirm={(id) => setDeleteConfirmTarget({ id, type: "single" })}
      />

      <ReportResolverDialog
        report={activeReportToResolve}
        reportAction={reportAction}
        reportResolutionNotes={reportResolutionNotes}
        actionLoading={actionLoading}
        onClose={() => setActiveReportToResolve(null)}
        onSetReportAction={setReportAction}
        onSetResolutionNotes={setReportResolutionNotes}
        onApplyResolution={handleResolveReport}
      />

      <DeleteConfirmDialog
        target={deleteConfirmTarget}
        selectedCount={selectedCommentIds.length}
        actionLoading={actionLoading}
        onClose={() => setDeleteConfirmTarget(null)}
        onConfirm={() => {
          if (deleteConfirmTarget?.type === "bulk") {
            handleBulkDelete()
          } else if (deleteConfirmTarget?.id) {
            handleDeleteComment(deleteConfirmTarget.id)
          }
        }}
      />
    </div>
  )
}
