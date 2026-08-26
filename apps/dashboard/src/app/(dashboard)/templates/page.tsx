"use client"

import * as React from "react"
import {
  CheckCircle2,
  Cloud,
  CloudOff,
  CloudUpload,
  Code2,
  Filter,
  Layers,
  LayoutGrid,
  List,
  Mail,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Zap,
} from "lucide-react"

import type {
  CreateTemplateDTO,
  EmailTemplate,
  EmailTemplateType,
  SendTestEmailDTO,
  TemplateSource,
  TemplateStats,
  TemplateSyncStatus,
  UpdateTemplateDTO,
} from "@workspace/shared"
import { TemplateApi, showApiError } from "@/lib/api"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { toast } from "@workspace/ui/components/sonner"

import { getTemplateColumns } from "./columns"
import { TemplatesDataTable } from "./data-table"
import { TemplateCard } from "./template-card"
import { CreateTemplateDialog } from "./create-template-dialog"
import { EditTemplateDialog } from "./edit-template-dialog"
import { TemplatePreviewDialog } from "./template-preview-dialog"
import { SendTestDialog } from "./send-test-dialog"
import { SyncAllDialog, type SyncReport } from "./sync-all-dialog"
import { DeleteTemplateDialog } from "./delete-template-dialog"

export default function TemplatesPage() {
  const [templates, setTemplates] = React.useState<EmailTemplate[]>([])
  const [stats, setStats] = React.useState<TemplateStats>({
    total: 0,
    systemCount: 0,
    customCount: 0,
    plunkSyncedCount: 0,
    typesCount: {
      TRANSACTIONAL: 0,
      MARKETING: 0,
      HEADLESS: 0,
    },
  })
  const [isLoading, setIsLoading] = React.useState(true)

  // Query & Filter States
  const [searchQuery, setSearchQuery] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState<string>("ALL")
  const [sourceFilter, setSourceFilter] = React.useState<TemplateSource>("ALL")
  const [syncStatusFilter, setSyncStatusFilter] =
    React.useState<TemplateSyncStatus>("ALL")
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid")

  // Pagination
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(12)
  const [totalCount, setTotalCount] = React.useState(0)

  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false)
  const [isSendTestOpen, setIsSendTestOpen] = React.useState(false)
  const [isSyncAllOpen, setIsSyncAllOpen] = React.useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)

  const [activeTemplate, setActiveTemplate] =
    React.useState<EmailTemplate | null>(null)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [isSyncingAll, setIsSyncingAll] = React.useState(false)
  const [syncReport, setSyncReport] = React.useState<SyncReport | null>(null)

  // 1. Fetch KPI Stats
  const fetchStats = React.useCallback(async () => {
    try {
      const res = await TemplateApi.getStats()
      if (res.success && res.data) {
        setStats(res.data)
      }
    } catch {
      // ignore
    }
  }, [])

  // 2. Fetch Templates with Filters & Pagination
  const fetchTemplates = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await TemplateApi.list({
        page: currentPage,
        limit: pageSize,
        search: searchQuery.trim() || undefined,
        type:
          typeFilter !== "ALL" ? (typeFilter as EmailTemplateType) : undefined,
        source: sourceFilter !== "ALL" ? sourceFilter : undefined,
        syncStatus: syncStatusFilter !== "ALL" ? syncStatusFilter : undefined,
      })

      if (res.success && res.data) {
        setTemplates(res.data)
        if (res.pagination) {
          setTotalCount(res.pagination.total)
        } else {
          setTotalCount(res.data.length)
        }
      } else {
        toast.error(res.error || "Failed to load email templates")
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch templates")
    } finally {
      setIsLoading(false)
    }
  }, [
    currentPage,
    pageSize,
    searchQuery,
    typeFilter,
    sourceFilter,
    syncStatusFilter,
  ])

  // Initial load
  React.useEffect(() => {
    fetchStats()
  }, [fetchStats])

  React.useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  // Handlers
  const handleOpenPreview = (tpl: EmailTemplate) => {
    setActiveTemplate(tpl)
    setIsPreviewOpen(true)
  }

  const handleOpenEdit = (tpl: EmailTemplate) => {
    setActiveTemplate(tpl)
    setIsEditOpen(true)
  }

  const handleOpenSendTest = (tpl: EmailTemplate) => {
    setActiveTemplate(tpl)
    setIsSendTestOpen(true)
  }

  const handleOpenDelete = (tpl: EmailTemplate) => {
    setActiveTemplate(tpl)
    setIsDeleteOpen(true)
  }

  const handleCreateSubmit = async (payload: CreateTemplateDTO) => {
    setIsProcessing(true)
    try {
      const res = await TemplateApi.create(payload)
      if (res.success) {
        toast.success(`Template "${res.data?.name}" created successfully!`)
        fetchTemplates()
        fetchStats()
        return true
      } else {
        showApiError(res, "Failed to create template")
        return false
      }
    } catch (err: unknown) {
      showApiError(err, "An unexpected error occurred")
      return false
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEditSubmit = async (id: string, payload: UpdateTemplateDTO) => {
    setIsProcessing(true)
    try {
      const res = await TemplateApi.update(id, payload)
      if (res.success) {
        toast.success(`Template "${res.data?.name}" updated successfully!`)
        fetchTemplates()
        fetchStats()
        return true
      } else {
        showApiError(res, "Failed to update template")
        return false
      }
    } catch (err: unknown) {
      showApiError(err, "An unexpected error occurred")
      return false
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDuplicate = async (tpl: EmailTemplate) => {
    toast.promise(
      TemplateApi.duplicate(tpl.id).then((res) => {
        if (!res.success)
          throw new Error(res.error || "Failed to duplicate template")
        fetchTemplates()
        fetchStats()
        return res.data
      }),
      {
        loading: `Duplicating "${tpl.name}"...`,
        success: (data) => `Created duplicate template "${data?.name}"`,
        error: (err) => err?.message || "Failed to duplicate template",
      }
    )
  }

  const handleResetDefault = async (tpl: EmailTemplate) => {
    toast.promise(
      TemplateApi.resetToDefault(tpl.slug || tpl.id).then((res) => {
        if (!res.success)
          throw new Error(res.error || "Failed to reset template")
        fetchTemplates()
        fetchStats()
        return res.data
      }),
      {
        loading: `Resetting "${tpl.name}" to codebase default...`,
        success: (data) =>
          `Template "${data?.name}" restored to codebase default!`,
        error: (err) => err?.message || "Failed to reset template",
      }
    )
  }

  const handleSyncSingle = async (tpl: EmailTemplate) => {
    toast.promise(
      TemplateApi.syncSingle(tpl.id).then((res) => {
        if (!res.success)
          throw new Error(res.error || "Failed to sync template with Plunk")
        fetchTemplates()
        fetchStats()
        return res.data
      }),
      {
        loading: `Synchronizing "${tpl.name}" with Plunk...`,
        success: `"${tpl.name}" synced to Plunk successfully!`,
        error: (err) => err?.message || "Plunk sync failed",
      }
    )
  }

  const handleTriggerSyncAll = async () => {
    setIsSyncingAll(true)
    try {
      const res = await TemplateApi.syncAll()
      if (res.success && res.data) {
        setSyncReport(res.data)
        toast.success(
          `Plunk sync completed! ${res.data.synced}/${res.data.total} synced.`
        )
        fetchTemplates()
        fetchStats()
      } else {
        toast.error(res.error || "Failed to sync all templates with Plunk")
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Plunk sync failed")
    } finally {
      setIsSyncingAll(false)
    }
  }

  const handleBulkSync = async (selected: EmailTemplate[]) => {
    if (selected.length === 0) return
    toast.promise(
      Promise.all(selected.map((t) => TemplateApi.syncSingle(t.id))).then(
        () => {
          fetchTemplates()
          fetchStats()
        }
      ),
      {
        loading: `Synchronizing ${selected.length} template(s) to Plunk...`,
        success: `Successfully synced ${selected.length} template(s) to Plunk!`,
        error: "Failed to sync some templates",
      }
    )
  }

  const handleDeleteConfirm = async (tpl: EmailTemplate) => {
    setIsProcessing(true)
    try {
      const res = await TemplateApi.delete(tpl.id)
      if (res.success) {
        toast.success(`Template "${tpl.name}" deleted successfully`)
        fetchTemplates()
        fetchStats()
        return true
      } else {
        toast.error(res.error || "Failed to delete template")
        return false
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete template")
      return false
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSendTestSubmit = async (payload: SendTestEmailDTO) => {
    setIsProcessing(true)
    try {
      const res = await TemplateApi.sendTestEmail(payload)
      if (res.success) {
        toast.success(`Test email dispatched to ${payload.to}!`)
        return true
      } else {
        toast.error(res.error || "Failed to dispatch test email")
        return false
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error sending test email")
      return false
    } finally {
      setIsProcessing(false)
    }
  }

  const resetFilters = () => {
    setSearchQuery("")
    setTypeFilter("ALL")
    setSourceFilter("ALL")
    setSyncStatusFilter("ALL")
    setCurrentPage(1)
  }

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    typeFilter !== "ALL" ||
    sourceFilter !== "ALL" ||
    syncStatusFilter !== "ALL"

  const columns = React.useMemo(
    () =>
      getTemplateColumns({
        onPreview: handleOpenPreview,
        onEdit: handleOpenEdit,
        onDelete: handleOpenDelete,
        onDuplicate: handleDuplicate,
        onSendTest: handleOpenSendTest,
        onSyncSingle: handleSyncSingle,
        onResetDefault: handleResetDefault,
      }),
    []
  )

  const syncRate =
    stats.total > 0
      ? Math.round((stats.plunkSyncedCount / stats.total) * 100)
      : 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Template Engine & Plunk Sync
            </h1>
            <Badge
              variant="outline"
              className="hidden gap-1 border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-400 sm:inline-flex"
            >
              <CheckCircle2 className="size-3" />
              Live Sync Active
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Build, preview, test, and synchronize transactional and marketing
            email templates seamlessly between your codebase, database, and
            Plunk API.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchTemplates()
              fetchStats()
              toast.info("Refreshed templates & statistics")
            }}
            className="h-9 gap-1.5 bg-background/80 text-xs"
            disabled={isLoading}
          >
            <RefreshCw
              className={`size-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSyncAllOpen(true)}
            className="h-9 gap-1.5 border-emerald-500/30 bg-background/80 text-xs text-emerald-400 hover:bg-emerald-500/10"
          >
            <CloudUpload className="size-4" />
            Sync with Plunk
          </Button>

          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="h-9 gap-1.5 bg-primary text-xs font-semibold text-primary-foreground shadow-sm"
          >
            <Plus className="size-4" />
            Create Template
          </Button>
        </div>
      </div>

      {/* KPI Metrics Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Templates */}
        <Card className="border-border/80 bg-card/60 shadow-sm backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Total Templates
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Layers className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats.total}
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>{stats.typesCount.TRANSACTIONAL || 0} Transactional</span>
              <span>•</span>
              <span>{stats.typesCount.MARKETING || 0} Marketing</span>
            </p>
          </CardContent>
        </Card>

        {/* Codebase System Templates */}
        <Card className="border-border/80 bg-card/60 shadow-sm backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Codebase Templates
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <Code2 className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {stats.systemCount}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Auth OTP, Reset, Welcome & Contacts
            </p>
          </CardContent>
        </Card>

        {/* Custom Made Templates */}
        <Card className="border-border/80 bg-card/60 shadow-sm backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Custom Templates
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <Sparkles className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">
              {stats.customCount}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              User-created custom email flows
            </p>
          </CardContent>
        </Card>

        {/* Plunk Sync Rate */}
        <Card className="border-border/80 bg-card/60 shadow-sm backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Plunk Cloud Sync
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
              <Cloud className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">
              {syncRate}%
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {stats.plunkSyncedCount} of {stats.total} synchronized
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar with View Switcher */}
      <div className="flex flex-col gap-3.5 rounded-xl border border-border/80 bg-card/60 p-4 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          {/* Search Input */}
          <div className="relative max-w-md flex-1">
            <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
            <Input
              placeholder="Search templates by name, slug, subject, or description..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="h-9 bg-background/80 pl-9 text-xs"
            />
          </div>

          {/* Controls: View Switcher */}
          <div className="flex items-center gap-2 self-end md:self-center">
            <div className="flex items-center rounded-lg border border-border/60 bg-muted/40 p-0.5">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="size-7 rounded"
                onClick={() => setViewMode("grid")}
                title="Grid Cards View"
              >
                <LayoutGrid className="size-3.5" />
              </Button>
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="icon"
                className="size-7 rounded"
                onClick={() => setViewMode("table")}
                title="Data Table View"
              >
                <List className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Dropdowns Row */}
        <div className="flex flex-wrap items-center gap-2.5 border-t border-border/40 pt-1">
          <div className="mr-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter className="size-3.5" />
            <span>Filters:</span>
          </div>

          {/* Type Filter */}
          <Select
            value={typeFilter}
            onValueChange={(val) => {
              setTypeFilter(val)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="h-8 w-[140px] bg-background/80 text-xs">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs">
                All Types
              </SelectItem>
              <SelectItem value="TRANSACTIONAL" className="text-xs">
                Transactional
              </SelectItem>
              <SelectItem value="MARKETING" className="text-xs">
                Marketing
              </SelectItem>
              <SelectItem value="HEADLESS" className="text-xs">
                Headless
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Source Filter */}
          <Select
            value={sourceFilter}
            onValueChange={(val: TemplateSource) => {
              setSourceFilter(val)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="h-8 w-[150px] bg-background/80 text-xs">
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs">
                All Sources
              </SelectItem>
              <SelectItem value="CODEBASE" className="text-xs">
                Codebase (System)
              </SelectItem>
              <SelectItem value="CUSTOM" className="text-xs">
                Custom Made
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Sync Status Filter */}
          <Select
            value={syncStatusFilter}
            onValueChange={(val: TemplateSyncStatus) => {
              setSyncStatusFilter(val)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="h-8 w-[140px] bg-background/80 text-xs">
              <SelectValue placeholder="Sync Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs">
                All Sync Status
              </SelectItem>
              <SelectItem value="SYNCED" className="text-xs">
                Synced to Plunk
              </SelectItem>
              <SelectItem value="LOCAL" className="text-xs">
                Local Only
              </SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="ml-auto h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Main Content: Grid vs Table */}
      {viewMode === "grid" ? (
        <div className="space-y-6">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card
                  key={`skeleton-card-${i}`}
                  className="h-64 animate-pulse border-border/60 bg-card/40"
                />
              ))}
            </div>
          ) : templates.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((tpl) => (
                <TemplateCard
                  key={tpl.id}
                  template={tpl}
                  onPreview={handleOpenPreview}
                  onEdit={handleOpenEdit}
                  onDelete={handleOpenDelete}
                  onDuplicate={handleDuplicate}
                  onSendTest={handleOpenSendTest}
                  onSyncSingle={handleSyncSingle}
                  onResetDefault={handleResetDefault}
                />
              ))}
            </div>
          ) : (
            <Card className="border-border/80 bg-card/40 p-12 text-center">
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
                  <Layers className="size-6" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  No templates match your filters
                </h3>
                <p className="max-w-sm text-xs text-muted-foreground">
                  Try adjusting your search query, type, or source filters, or
                  create a new email template.
                </p>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetFilters}
                    className="mt-2 text-xs"
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
            </Card>
          )}

          {/* Grid View Pagination Controls */}
          {totalCount > pageSize && (
            <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-border/80 bg-card/60 p-4 backdrop-blur-sm sm:flex-row">
              <span className="text-xs text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {(currentPage - 1) * pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-foreground">
                  {Math.min(currentPage * pageSize, totalCount)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {totalCount}
                </span>{" "}
                templates
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8 text-xs"
                >
                  Previous
                </Button>
                <span className="px-2 text-xs font-medium">
                  Page {currentPage} of {Math.ceil(totalCount / pageSize)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) =>
                      p < Math.ceil(totalCount / pageSize) ? p + 1 : p
                    )
                  }
                  disabled={currentPage >= Math.ceil(totalCount / pageSize)}
                  className="h-8 text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <TemplatesDataTable
          columns={columns}
          data={templates}
          isLoading={isLoading}
          totalCount={totalCount}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize)
            setCurrentPage(1)
          }}
          onRefresh={() => {
            fetchTemplates()
            fetchStats()
          }}
          onBulkSync={handleBulkSync}
        />
      )}

      {/* Dialog Modals */}
      <CreateTemplateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateSubmit}
        isProcessing={isProcessing}
      />

      <EditTemplateDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        template={activeTemplate}
        onSubmit={handleEditSubmit}
        onResetDefault={handleResetDefault}
        onOpenPreview={handleOpenPreview}
        isProcessing={isProcessing}
      />

      <TemplatePreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        template={activeTemplate}
        onOpenEdit={handleOpenEdit}
      />

      <SendTestDialog
        open={isSendTestOpen}
        onOpenChange={setIsSendTestOpen}
        template={activeTemplate}
        onSubmit={handleSendTestSubmit}
        isProcessing={isProcessing}
      />

      <SyncAllDialog
        open={isSyncAllOpen}
        onOpenChange={setIsSyncAllOpen}
        isSyncing={isSyncingAll}
        report={syncReport}
        onTriggerSync={handleTriggerSyncAll}
      />

      <DeleteTemplateDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        template={activeTemplate}
        onConfirmDelete={handleDeleteConfirm}
        onResetDefault={handleResetDefault}
        isProcessing={isProcessing}
      />
    </div>
  )
}
