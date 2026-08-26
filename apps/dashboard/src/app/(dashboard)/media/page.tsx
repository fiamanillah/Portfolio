"use client"

import * as React from "react"
import { MediaApi } from "@/lib/api"
import type { MediaFileDTO, MediaStatsDTO } from "@workspace/shared"
import { MediaStatsOverview } from "./components/media-stats-overview"
import { MediaToolbar } from "./components/media-toolbar"
import { MediaGrid } from "./components/media-grid"
import { MediaDataTable } from "./components/media-data-table"
import { getMediaColumns } from "./components/media-columns"
import { MediaUploadDialog } from "./components/media-upload-dialog"
import { MediaDetailsDialog } from "./components/media-details-dialog"
import { MediaBulkBar } from "./components/media-bulk-bar"
import {
  BulkMoveFolderDialog,
  DeleteMediaDialog,
} from "./components/media-bulk-actions-dialog"
import { MediaCleanupDialog } from "./components/media-cleanup-dialog"
import { toast } from "@workspace/ui/components/sonner"

export default function MediaPage() {
  const [files, setFiles] = React.useState<MediaFileDTO[]>([])
  const [stats, setStats] = React.useState<MediaStatsDTO | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  // Filters & Search
  const [searchQuery, setSearchQuery] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState("all")
  const [folderFilter, setFolderFilter] = React.useState("all")
  const [sortBy, setSortBy] = React.useState<
    "createdAt" | "size" | "fileName" | "updatedAt"
  >("createdAt")
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc")
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid")

  // Pagination
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(24)
  const [totalCount, setTotalCount] = React.useState(0)

  // Selection
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])

  // Dialogs
  const [isUploadOpen, setIsUploadOpen] = React.useState(false)
  const [isInspectorOpen, setIsInspectorOpen] = React.useState(false)
  const [inspectingFile, setInspectingFile] =
    React.useState<MediaFileDTO | null>(null)
  const [isBulkMoveOpen, setIsBulkMoveOpen] = React.useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [singleDeleteFile, setSingleDeleteFile] =
    React.useState<MediaFileDTO | null>(null)
  const [isCleanupOpen, setIsCleanupOpen] = React.useState(false)

  // Debounce search input
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(handler)
  }, [searchQuery])

  // Load Data
  const loadData = React.useCallback(
    async (showRefreshing = false) => {
      if (showRefreshing) setIsRefreshing(true)
      else setIsLoading(true)

      try {
        const [filesRes, statsRes] = await Promise.all([
          MediaApi.getAll({
            page: currentPage,
            limit: pageSize,
            search: debouncedSearch.trim() || undefined,
            mimeType: typeFilter !== "all" ? typeFilter : undefined,
            folder: folderFilter !== "all" ? folderFilter : undefined,
            sortBy,
            sortOrder,
          }),
          MediaApi.getStats(),
        ])

        if (filesRes.success && filesRes.data) {
          setFiles(filesRes.data)
          setTotalCount(filesRes.pagination?.total || filesRes.data.length)
        } else {
          toast.error(filesRes.error || "Failed to load media files")
        }

        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data)
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to load media")
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [
      currentPage,
      pageSize,
      debouncedSearch,
      typeFilter,
      folderFilter,
      sortBy,
      sortOrder,
    ]
  )

  React.useEffect(() => {
    loadData()
  }, [loadData])

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleSelectAllPage = () => {
    const pageIds = files.map((f) => f.id)
    setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])))
  }

  const handleClearSelection = () => {
    setSelectedIds([])
  }

  // Inspector handlers
  const handleInspect = (file: MediaFileDTO) => {
    setInspectingFile(file)
    setIsInspectorOpen(true)
  }

  const currentInspectIndex = inspectingFile
    ? files.findIndex((f) => f.id === inspectingFile.id)
    : -1

  const handlePrevInspector = () => {
    if (currentInspectIndex > 0) {
      setInspectingFile(files[currentInspectIndex - 1])
    }
  }

  const handleNextInspector = () => {
    if (currentInspectIndex < files.length - 1 && currentInspectIndex >= 0) {
      setInspectingFile(files[currentInspectIndex + 1])
    }
  }

  // Delete single file trigger
  const handleDeleteSingle = (file: MediaFileDTO) => {
    setSingleDeleteFile(file)
    setIsDeleteOpen(true)
  }

  // Delete bulk trigger
  const handleDeleteBulk = () => {
    setSingleDeleteFile(null)
    setIsDeleteOpen(true)
  }

  // Update file in local state after inspector edit
  const handleUpdateFile = (updated: MediaFileDTO) => {
    setFiles((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))
    setInspectingFile(updated)
    MediaApi.getStats().then((res) => {
      if (res.success && res.data) setStats(res.data)
    })
  }

  // Columns for data table
  const columns = React.useMemo(
    () =>
      getMediaColumns({
        onInspect: handleInspect,
        onDelete: handleDeleteSingle,
      }),
    []
  )

  return (
    <div className="mx-auto max-w-7xl flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Top Overview & KPI Cards */}
      <MediaStatsOverview
        stats={stats}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        onRefreshClick={() => loadData(true)}
        onUploadClick={() => setIsUploadOpen(true)}
        onCleanupClick={() => setIsCleanupOpen(true)}
      />

      {/* Toolbar & Filter Bar */}
      <MediaToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        typeFilter={typeFilter}
        onTypeFilterChange={(val) => {
          setTypeFilter(val)
          setCurrentPage(1)
        }}
        folderFilter={folderFilter}
        onFolderFilterChange={(val) => {
          setFolderFilter(val)
          setCurrentPage(1)
        }}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(field, order) => {
          setSortBy(field)
          setSortOrder(order)
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        folders={stats?.folders || []}
        totalFiltered={totalCount}
      />

      {/* Main Asset Browser (Grid vs Table) */}
      {viewMode === "grid" ? (
        <MediaGrid
          files={files}
          isLoading={isLoading}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onInspect={handleInspect}
          onDelete={handleDeleteSingle}
          onUploadClick={() => setIsUploadOpen(true)}
          totalCount={totalCount}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setCurrentPage(1)
          }}
        />
      ) : (
        <MediaDataTable
          columns={columns}
          data={files}
          isLoading={isLoading}
          totalCount={totalCount}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setCurrentPage(1)
          }}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      )}

      {/* Floating Bulk Action Bar */}
      <MediaBulkBar
        selectedCount={selectedIds.length}
        totalOnPage={files.length}
        onSelectAllPage={handleSelectAllPage}
        onClearSelection={handleClearSelection}
        onBulkMoveFolder={() => setIsBulkMoveOpen(true)}
        onBulkDelete={handleDeleteBulk}
      />

      {/* Upload Modal */}
      <MediaUploadDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        existingFolders={stats?.folders || []}
        onUploadSuccess={() => {
          loadData(true)
        }}
      />

      {/* Attachment Details Inspector Modal */}
      <MediaDetailsDialog
        file={inspectingFile}
        open={isInspectorOpen}
        onOpenChange={setIsInspectorOpen}
        onUpdateFile={handleUpdateFile}
        onDeleteFile={(file) => {
          setIsInspectorOpen(false)
          handleDeleteSingle(file)
        }}
        onPrev={handlePrevInspector}
        onNext={handleNextInspector}
        hasPrev={currentInspectIndex > 0}
        hasNext={
          currentInspectIndex < files.length - 1 && currentInspectIndex >= 0
        }
        existingFolders={stats?.folders || []}
      />

      {/* Bulk Move Folder Dialog */}
      <BulkMoveFolderDialog
        open={isBulkMoveOpen}
        onOpenChange={setIsBulkMoveOpen}
        selectedIds={selectedIds}
        existingFolders={stats?.folders || []}
        onSuccess={() => {
          setSelectedIds([])
          loadData(true)
        }}
      />

      {/* Delete Confirmation Dialog (Single or Bulk) */}
      <DeleteMediaDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        singleFile={singleDeleteFile}
        selectedIds={selectedIds}
        onSuccess={() => {
          setSelectedIds([])
          setSingleDeleteFile(null)
          loadData(true)
        }}
      />

      {/* Storage Cleaner / Orphan Scanner Modal */}
      <MediaCleanupDialog
        open={isCleanupOpen}
        onOpenChange={setIsCleanupOpen}
        onSuccess={() => {
          loadData(true)
        }}
      />
    </div>
  )
}
