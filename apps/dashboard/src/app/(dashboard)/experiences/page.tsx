"use client"

import * as React from "react"
import {
  Plus,
  RotateCcw,
  Search,
  LayoutList,
  Layers,
  Sparkles,
  Briefcase,
  Loader2,
  Filter,
} from "lucide-react"

import type {
  ExperienceDTO,
  ExperienceListItemDTO,
  ExperienceStatsDTO,
  ExperienceStatus,
} from "@workspace/shared"
import { ExperienceApi } from "@/lib/api"
import { showApiError } from "@/lib/api/error-handler"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { toast } from "@workspace/ui/components/sonner"
import {
  Tabs,
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

import { getExperienceColumns } from "./columns"
import { ExperiencesDataTable } from "./data-table"
import { ExperienceStatsOverview } from "./components/experience-stats-overview"
import { ExperienceFormDialog } from "./components/experience-form-dialog"
import { ExperiencePreviewDialog } from "./components/experience-preview-dialog"
import { ExperienceTimelineView } from "./components/experience-timeline-view"
import { DeleteExperienceDialog } from "./components/delete-experience-dialog"

export default function ExperiencesPage() {
  const [experiences, setExperiences] = React.useState<ExperienceListItemDTO[]>([])
  const [stats, setStats] = React.useState<ExperienceStatsDTO>({
    totalExperiences: 0,
    publishedCount: 0,
    draftCount: 0,
    archivedCount: 0,
    currentRolesCount: 0,
    totalCompaniesCount: 0,
    totalTechnologiesCount: 0,
    topTechnologies: [],
  })
  const [isLoading, setIsLoading] = React.useState(true)

  // Filters & Search
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [employmentFilter, setEmploymentFilter] = React.useState<string>("all")
  const [viewMode, setViewMode] = React.useState<"table" | "timeline">("table")

  // Pagination
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [totalCount, setTotalCount] = React.useState(0)

  // Dialog states
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [editingExperience, setEditingExperience] = React.useState<ExperienceDTO | null>(null)

  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false)
  const [previewingExperience, setPreviewingExperience] = React.useState<ExperienceListItemDTO | null>(null)

  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [deletingExperience, setDeletingExperience] = React.useState<ExperienceListItemDTO | null>(null)
  const [bulkDeletingIds, setBulkDeletingIds] = React.useState<string[]>([])
  const [isDeleting, setIsDeleting] = React.useState(false)

  const [isSeeding, setIsSeeding] = React.useState(false)

  // Load Data
  const loadExperiences = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await ExperienceApi.getAll({
        page: currentPage,
        limit: pageSize,
        search: searchQuery.trim() || undefined,
        status:
          statusFilter !== "all"
            ? (statusFilter as ExperienceStatus)
            : undefined,
        employmentType:
          employmentFilter !== "all" ? employmentFilter : undefined,
        sortBy: "order",
        sortOrder: "asc",
      })

      if (res.success && res.data) {
        setExperiences(res.data)
        if (res.pagination) {
          setTotalCount(res.pagination.total)
        }
      } else {
        toast.error(res.message || "Failed to load experiences")
      }
    } catch {
      toast.error("Failed to fetch professional history")
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, pageSize, searchQuery, statusFilter, employmentFilter])

  // Load Stats
  const loadStats = React.useCallback(async () => {
    try {
      const res = await ExperienceApi.getStats()
      if (res.success && res.data) {
        setStats(res.data)
      }
    } catch {
      // Ignore background stats load error
    }
  }, [])

  React.useEffect(() => {
    loadExperiences()
  }, [loadExperiences])

  React.useEffect(() => {
    loadStats()
  }, [loadStats])

  // Action handlers
  const handleOpenCreate = () => {
    setEditingExperience(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = async (item: ExperienceListItemDTO) => {
    try {
      const res = await ExperienceApi.getById(item.id)
      if (res.success && res.data) {
        setEditingExperience(res.data)
        setIsFormOpen(true)
      } else {
        toast.error("Failed to load experience details")
      }
    } catch {
      toast.error("Error fetching experience")
    }
  }

  const handleOpenPreview = (item: ExperienceListItemDTO) => {
    setPreviewingExperience(item)
    setIsPreviewOpen(true)
  }

  const handleDuplicate = async (item: ExperienceListItemDTO) => {
    try {
      const res = await ExperienceApi.duplicate(item.id)
      if (res.success) {
        toast.success("Experience duplicated as Draft")
        loadExperiences()
        loadStats()
      } else {
        toast.error(res.message || "Failed to duplicate experience")
      }
    } catch {
      toast.error("Failed to duplicate")
    }
  }

  const handleStatusChange = async (
    item: ExperienceListItemDTO,
    newStatus: ExperienceStatus
  ) => {
    try {
      const res = await ExperienceApi.update(item.id, { status: newStatus })
      if (res.success) {
        toast.success(`Status updated to ${newStatus}`)
        loadExperiences()
        loadStats()
      } else {
        toast.error(res.message || "Failed to update status")
      }
    } catch {
      toast.error("Failed to update status")
    }
  }

  const handleOpenDelete = (item: ExperienceListItemDTO) => {
    setDeletingExperience(item)
    setBulkDeletingIds([])
    setIsDeleteOpen(true)
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    try {
      if (bulkDeletingIds.length > 0) {
        const res = await ExperienceApi.bulkDelete({ ids: bulkDeletingIds })
        if (res.success) {
          toast.success(`Deleted ${res.data?.count || bulkDeletingIds.length} experiences`)
          setIsDeleteOpen(false)
          setBulkDeletingIds([])
          loadExperiences()
          loadStats()
        } else {
          toast.error(res.message || "Failed to bulk delete")
        }
      } else if (deletingExperience) {
        const res = await ExperienceApi.delete(deletingExperience.id)
        if (res.success) {
          toast.success("Experience deleted successfully")
          setIsDeleteOpen(false)
          setDeletingExperience(null)
          loadExperiences()
          loadStats()
        } else {
          toast.error(res.message || "Failed to delete experience")
        }
      }
    } catch {
      toast.error("An error occurred during deletion")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBulkStatusChange = async (
    selectedIds: string[],
    newStatus: ExperienceStatus
  ) => {
    try {
      const res = await ExperienceApi.bulkUpdateStatus({
        ids: selectedIds,
        status: newStatus,
      })
      if (res.success) {
        toast.success(`Updated ${res.data?.count || selectedIds.length} experiences to ${newStatus}`)
        loadExperiences()
        loadStats()
      } else {
        toast.error(res.message || "Failed to bulk update status")
      }
    } catch {
      toast.error("Failed to update status")
    }
  }

  const handleBulkDelete = (selectedIds: string[]) => {
    setBulkDeletingIds(selectedIds)
    setDeletingExperience(null)
    setIsDeleteOpen(true)
  }

  const handleSeedDefault = async () => {
    if (
      !confirm(
        "This will seed default full-stack career experience records into your database. Continue?"
      )
    ) {
      return
    }

    setIsSeeding(true)
    try {
      const res = await ExperienceApi.seedDefault()
      if (res.success) {
        toast.success(res.message || "Default experiences seeded successfully")
        loadExperiences()
        loadStats()
      } else {
        showApiError(res, "Failed to seed default experiences")
      }
    } catch (err: unknown) {
      showApiError(err, "Error during experience seeding")
    } finally {
      setIsSeeding(false)
    }
  }

  const columns = React.useMemo(
    () =>
      getExperienceColumns({
        onEdit: handleOpenEdit,
        onPreview: handleOpenPreview,
        onDuplicate: handleDuplicate,
        onDelete: handleOpenDelete,
        onStatusChange: handleStatusChange,
      }),
    []
  )

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 font-mono text-2xl font-black uppercase tracking-tight text-foreground md:text-3xl">
            <Briefcase className="h-7 w-7 text-primary" />
            Professional History
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your career timeline, engineering achievements, technologies, and milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSeedDefault}
            disabled={isSeeding || isLoading}
            className="font-mono text-xs"
            title="Seed standard default portfolio experiences"
          >
            {isSeeding ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" />
            )}
            Seed Defaults
          </Button>

          <Button
            onClick={handleOpenCreate}
            size="sm"
            className="font-mono text-xs font-bold"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Experience
          </Button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <ExperienceStatsOverview stats={stats} isLoading={isLoading} />

      {/* Toolbar & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border bg-card p-4">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search roles, companies, tech..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs h-9"
            />
          </div>

          {/* Status Tabs */}
          <Tabs
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val)
              setCurrentPage(1)
            }}
          >
            <TabsList className="h-9 font-mono text-xs">
              <TabsTrigger value="all">All ({stats.totalExperiences})</TabsTrigger>
              <TabsTrigger value="PUBLISHED">
                Published ({stats.publishedCount})
              </TabsTrigger>
              <TabsTrigger value="DRAFT">
                Draft ({stats.draftCount})
              </TabsTrigger>
              <TabsTrigger value="ARCHIVED">
                Archived ({stats.archivedCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Employment filter */}
          <Select
            value={employmentFilter}
            onValueChange={(val) => {
              setEmploymentFilter(val)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="h-9 w-36 text-xs font-mono">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Full-Time">Full-Time</SelectItem>
              <SelectItem value="Contract">Contract</SelectItem>
              <SelectItem value="Part-Time">Part-Time</SelectItem>
              <SelectItem value="Freelance">Freelance</SelectItem>
              <SelectItem value="Internship">Internship</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 border border-border/80 rounded-md p-0.5 bg-muted/20">
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("table")}
            className="h-7 px-2.5 font-mono text-xs"
          >
            <LayoutList className="mr-1.5 h-3.5 w-3.5" />
            Table
          </Button>
          <Button
            variant={viewMode === "timeline" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("timeline")}
            className="h-7 px-2.5 font-mono text-xs"
          >
            <Layers className="mr-1.5 h-3.5 w-3.5" />
            Timeline
          </Button>
        </div>
      </div>

      {/* Main Content View */}
      {viewMode === "table" ? (
        <ExperiencesDataTable
          columns={columns}
          data={experiences}
          isLoading={isLoading}
          totalCount={totalCount}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          onBulkStatusChange={handleBulkStatusChange}
          onBulkDelete={handleBulkDelete}
          onSeedDefaults={handleSeedDefault}
          onAddExperience={handleOpenCreate}
        />
      ) : (
        <ExperienceTimelineView
          experiences={experiences}
          onEdit={handleOpenEdit}
          onPreview={handleOpenPreview}
          onDuplicate={handleDuplicate}
          onDelete={handleOpenDelete}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Form Dialog */}
      <ExperienceFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        experience={editingExperience}
        onSuccess={() => {
          loadExperiences()
          loadStats()
        }}
      />

      {/* Live Preview Dialog */}
      <ExperiencePreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        experience={previewingExperience}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteExperienceDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        experience={deletingExperience}
        bulkIds={bulkDeletingIds}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
