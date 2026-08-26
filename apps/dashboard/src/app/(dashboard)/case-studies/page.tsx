"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Loader2, Layers } from "lucide-react"

import type {
  CaseStudyListItemDTO,
  CaseStudyStatsDTO,
  CaseStudyStatus,
} from "@workspace/shared"
import { CaseStudyApi } from "@/lib/api"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"

import { getCaseStudyColumns } from "./columns"
import { CaseStudiesDataTable } from "./data-table"
import { CaseStudyStatsOverview } from "./components/list/case-study-stats-overview"
import { CaseStudyToolbar } from "./components/list/case-study-toolbar"
import { CaseStudyGridView } from "./components/list/case-study-grid-view"
import { DeleteCaseStudyDialog } from "./delete-case-study-dialog"

export default function CaseStudiesPage() {
  const router = useRouter()
  const [studies, setStudies] = React.useState<CaseStudyListItemDTO[]>([])
  const [stats, setStats] = React.useState<CaseStudyStatsDTO>({
    totalCaseStudies: 0,
    publishedCount: 0,
    draftCount: 0,
    archivedCount: 0,
    featuredCount: 0,
    totalViews: 0,
    totalLikes: 0,
    topCaseStudies: [],
    techStackBreakdown: [],
  })
  const [isLoading, setIsLoading] = React.useState(true)

  // Filters & Search
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [featuredFilter, setFeaturedFilter] = React.useState<string>("all")
  const [sortBy, setSortBy] = React.useState<string>("order")
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc")
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("table")

  // Pagination
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [totalCount, setTotalCount] = React.useState(0)

  // Dialog states
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [deletingStudy, setDeletingStudy] =
    React.useState<CaseStudyListItemDTO | null>(null)
  const [bulkDeletingIds, setBulkDeletingIds] = React.useState<string[]>([])
  const [isDeleting, setIsDeleting] = React.useState(false)

  // Load Data
  const loadStudies = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await CaseStudyApi.getAll({
        page: currentPage,
        limit: pageSize,
        search: searchQuery.trim() || undefined,
        status:
          statusFilter !== "all"
            ? (statusFilter as CaseStudyStatus)
            : undefined,
        featured: featuredFilter === "featured" ? true : undefined,
        sortBy:
          (sortBy as
            | "order"
            | "createdAt"
            | "title"
            | "views"
            | "likesCount"
            | "updatedAt"
            | "publishedAt") || undefined,
        sortOrder,
      })

      if (res.success && res.data) {
        setStudies(res.data)
        if (res.pagination) {
          setTotalCount(res.pagination.total)
        }
      } else {
        toast.error(res.message || "Failed to load case studies")
      }
    } catch {
      toast.error("Failed to fetch case studies")
    } finally {
      setIsLoading(false)
    }
  }, [
    currentPage,
    pageSize,
    searchQuery,
    statusFilter,
    featuredFilter,
    sortBy,
    sortOrder,
  ])

  const loadStats = React.useCallback(async () => {
    try {
      const res = await CaseStudyApi.getStats()
      if (res.success && res.data) {
        setStats(res.data)
      }
    } catch (err) {
      console.error("Failed to load case study stats:", err)
    }
  }, [])

  React.useEffect(() => {
    loadStats()
  }, [loadStats])

  React.useEffect(() => {
    loadStudies()
  }, [loadStudies])

  // Handlers
  const handleOpenEdit = (study: CaseStudyListItemDTO) => {
    router.push(`/case-studies/${study.id}/edit`)
  }

  const handleOpenPreview = (study: CaseStudyListItemDTO) => {
    router.push(`/case-studies/${study.id}/preview`)
  }

  const handleDuplicate = async (study: CaseStudyListItemDTO) => {
    try {
      const res = await CaseStudyApi.duplicate(study.id)
      if (res.success && res.data) {
        toast.success(`Duplicated "${study.title}" as draft copy`)
        loadStudies()
        loadStats()
      } else {
        toast.error(res.message || "Failed to duplicate case study")
      }
    } catch {
      toast.error("Failed to duplicate case study")
    }
  }

  const handleStatusChange = async (
    study: CaseStudyListItemDTO,
    newStatus: CaseStudyStatus
  ) => {
    try {
      const res = await CaseStudyApi.update(study.id, { status: newStatus })
      if (res.success && res.data) {
        toast.success(`Case study status changed to ${newStatus}`)
        setStudies((prev) =>
          prev.map((s) => (s.id === study.id ? { ...s, status: newStatus } : s))
        )
        loadStats()
      } else {
        toast.error(res.message || "Failed to update status")
      }
    } catch {
      toast.error("Failed to update status")
    }
  }

  const handleOpenDelete = (study: CaseStudyListItemDTO) => {
    setDeletingStudy(study)
    setBulkDeletingIds([])
    setIsDeleteOpen(true)
  }

  const handleOpenBulkDelete = (ids: string[]) => {
    setDeletingStudy(null)
    setBulkDeletingIds(ids)
    setIsDeleteOpen(true)
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    try {
      if (bulkDeletingIds.length > 0) {
        const res = await CaseStudyApi.bulkDelete({ ids: bulkDeletingIds })
        if (res.success) {
          toast.success(`Successfully deleted ${res.data?.count} case studies`)
          setIsDeleteOpen(false)
          loadStudies()
          loadStats()
        } else {
          toast.error(res.message || "Failed to delete case studies")
        }
      } else if (deletingStudy) {
        const res = await CaseStudyApi.delete(deletingStudy.id)
        if (res.success) {
          toast.success(`Deleted "${deletingStudy.title}"`)
          setIsDeleteOpen(false)
          loadStudies()
          loadStats()
        } else {
          toast.error(res.message || "Failed to delete case study")
        }
      }
    } catch {
      toast.error("Failed to delete case study")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBulkStatusChange = async (
    ids: string[],
    newStatus: CaseStudyStatus
  ) => {
    try {
      const res = await CaseStudyApi.bulkUpdateStatus({
        ids,
        status: newStatus,
      })
      if (res.success) {
        toast.success(`Updated ${res.data?.count} case studies to ${newStatus}`)
        loadStudies()
        loadStats()
      } else {
        toast.error(res.message || "Failed to update status")
      }
    } catch {
      toast.error("Failed to update status")
    }
  }

  const handleResetFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setFeaturedFilter("all")
    setSortBy("order")
    setSortOrder("asc")
    setCurrentPage(1)
  }

  const columns = React.useMemo(
    () =>
      getCaseStudyColumns({
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
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              Case Studies
            </h1>
            <span className="font-mono text-xs text-muted-foreground">
              ({totalCount} records)
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Architectural deep-dives, topology maps, feature breakdowns, and
            system post-mortems.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button asChild size="sm" className="h-9 gap-1.5 bg-primary text-xs">
            <Link href="/case-studies/create">
              <Plus className="size-4" />
              <span>Create Case Study</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <CaseStudyStatsOverview stats={stats} />

      {/* Filters & Search Toolbar */}
      <CaseStudyToolbar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q)
          setCurrentPage(1)
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(s) => {
          setStatusFilter(s)
          setCurrentPage(1)
        }}
        featuredFilter={featuredFilter}
        onFeaturedFilterChange={(f) => {
          setFeaturedFilter(f)
          setCurrentPage(1)
        }}
        sortBy={sortBy}
        onSortByChange={(s) => {
          setSortBy(s)
          setCurrentPage(1)
        }}
        sortOrder={sortOrder}
        onSortOrderChange={(so) => {
          setSortOrder(so)
          setCurrentPage(1)
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={totalCount}
        onResetFilters={handleResetFilters}
      />

      {/* View Content (Table or Grid) */}
      {viewMode === "table" ? (
        <CaseStudiesDataTable
          columns={columns}
          data={studies}
          isLoading={isLoading}
          totalCount={totalCount}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setCurrentPage(1)
          }}
          onBulkStatusChange={handleBulkStatusChange}
          onBulkDelete={handleOpenBulkDelete}
        />
      ) : (
        <CaseStudyGridView
          data={studies}
          isLoading={isLoading}
          onEdit={handleOpenEdit}
          onPreview={handleOpenPreview}
          onDuplicate={handleDuplicate}
          onDelete={handleOpenDelete}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteCaseStudyDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        study={deletingStudy}
        bulkCount={bulkDeletingIds.length}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  )
}
