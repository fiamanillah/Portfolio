"use client"

import * as React from "react"
import {
  Plus,
  RotateCcw,
  Search,
  LayoutList,
  LayoutGrid,
  Sparkles,
  Cpu,
  Layers,
  Loader2,
  FolderTree,
  Filter,
} from "lucide-react"

import type {
  SkillDTO,
  SkillListItemDTO,
  SkillStatsDTO,
  SkillCategoryDTO,
  SkillStatus,
} from "@workspace/shared"
import { SkillApi, showApiError } from "@/lib/api"
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

import { getSkillColumns } from "./columns"
import { SkillsDataTable } from "./data-table"
import { SkillStatsOverview } from "./components/skill-stats-overview"
import { SkillFormDialog } from "./components/skill-form-dialog"
import { CategoryManagerDialog } from "./components/category-manager-dialog"
import { SkillGridView } from "./components/skill-grid-view"
import { DeleteSkillDialog } from "./components/delete-skill-dialog"

export default function SkillsPage() {
  const [skills, setSkills] = React.useState<SkillListItemDTO[]>([])
  const [categories, setCategories] = React.useState<SkillCategoryDTO[]>([])
  const [stats, setStats] = React.useState<SkillStatsDTO>({
    totalSkills: 0,
    publishedCount: 0,
    draftCount: 0,
    archivedCount: 0,
    totalCategories: 0,
    featuredCount: 0,
    categoryBreakdown: [],
    topTags: [],
  })
  const [isLoading, setIsLoading] = React.useState(true)

  // Filters & Search
  const [searchQuery, setSearchQuery] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("table")

  // Pagination
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(20)
  const [totalCount, setTotalCount] = React.useState(0)

  // Dialog states
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [editingSkill, setEditingSkill] = React.useState<SkillDTO | null>(null)
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = React.useState(false)

  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [deletingSkill, setDeletingSkill] = React.useState<SkillListItemDTO | null>(null)
  const [bulkDeletingIds, setBulkDeletingIds] = React.useState<string[]>([])
  const [isDeleting, setIsDeleting] = React.useState(false)

  const [isSeeding, setIsSeeding] = React.useState(false)

  // Load Categories
  const loadCategories = React.useCallback(async () => {
    try {
      const res = await SkillApi.listCategories()
      if (res.success && Array.isArray(res.data)) {
        setCategories(res.data)
      }
    } catch {
      // Ignored
    }
  }, [])

  // Load Stats
  const loadStats = React.useCallback(async () => {
    try {
      const res = await SkillApi.getStats()
      if (res.success && res.data) {
        setStats(res.data)
      }
    } catch {
      // Ignored
    }
  }, [])

  // Load Skills Data
  const loadSkills = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await SkillApi.getAll({
        page: currentPage,
        limit: pageSize,
        search: searchQuery.trim() || undefined,
        categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
        status:
          statusFilter !== "all"
            ? (statusFilter as SkillStatus)
            : undefined,
        sortBy: "order",
        sortOrder: "asc",
      })

      if (res.success && res.data) {
        setSkills(res.data)
        if (res.pagination) {
          setTotalCount(res.pagination.total)
        } else {
          setTotalCount(res.data.length)
        }
      } else {
        toast.error(res.message || "Failed to load skills")
      }
    } catch (error) {
      toast.error("Network error while loading skills")
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, pageSize, searchQuery, categoryFilter, statusFilter])

  // Initial Load
  React.useEffect(() => {
    loadCategories()
    loadStats()
  }, [loadCategories, loadStats])

  React.useEffect(() => {
    loadSkills()
  }, [loadSkills])

  // Handlers for Row Actions
  const handleEditSkill = async (skillItem: SkillListItemDTO) => {
    try {
      const res = await SkillApi.getById(skillItem.id)
      if (res.success && res.data) {
        setEditingSkill(res.data)
        setIsFormOpen(true)
      } else {
        toast.error("Could not fetch skill details")
      }
    } catch {
      toast.error("Failed to load skill details")
    }
  }

  const handleCreateSkill = (preselectedCategory?: string) => {
    setEditingSkill(null)
    setIsFormOpen(true)
  }

  const handleDuplicate = async (id: string) => {
    try {
      const res = await SkillApi.duplicate(id)
      if (res.success) {
        toast.success("Skill duplicated as draft")
        loadSkills()
        loadStats()
      } else {
        showApiError(res, "Failed to duplicate skill")
      }
    } catch (err: unknown) {
      showApiError(err, "Error duplicating skill")
    }
  }

  const handleStatusChange = async (
    skill: SkillListItemDTO,
    newStatus: SkillStatus
  ) => {
    try {
      const res = await SkillApi.update(skill.id, { status: newStatus })
      if (res.success) {
        toast.success(`Updated status to ${newStatus}`)
        loadSkills()
        loadStats()
      } else {
        showApiError(res, "Failed to update status")
      }
    } catch (err: unknown) {
      showApiError(err, "Error updating skill status")
    }
  }

  const handleDeletePrompt = (skill: SkillListItemDTO) => {
    setDeletingSkill(skill)
    setBulkDeletingIds([])
    setIsDeleteOpen(true)
  }

  const handleBulkDeletePrompt = (ids: string[]) => {
    setDeletingSkill(null)
    setBulkDeletingIds(ids)
    setIsDeleteOpen(true)
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    try {
      if (bulkDeletingIds.length > 0) {
        const res = await SkillApi.bulkDelete({ ids: bulkDeletingIds })
        if (res.success) {
          toast.success(`Deleted ${res.data?.count || bulkDeletingIds.length} skills`)
          setIsDeleteOpen(false)
          setBulkDeletingIds([])
          loadSkills()
          loadStats()
          loadCategories()
        } else {
          showApiError(res, "Failed to delete skills")
        }
      } else if (deletingSkill) {
        const res = await SkillApi.delete(deletingSkill.id)
        if (res.success) {
          toast.success(`Deleted skill "${deletingSkill.name}"`)
          setIsDeleteOpen(false)
          setDeletingSkill(null)
          loadSkills()
          loadStats()
          loadCategories()
        } else {
          showApiError(res, "Failed to delete skill")
        }
      }
    } catch (err: unknown) {
      showApiError(err, "Error deleting skill(s)")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBulkStatusChange = async (
    selectedIds: string[],
    newStatus: SkillStatus
  ) => {
    try {
      const res = await SkillApi.bulkUpdateStatus({
        ids: selectedIds,
        status: newStatus,
      })
      if (res.success) {
        toast.success(`Updated ${res.data?.count || selectedIds.length} skills to ${newStatus}`)
        loadSkills()
        loadStats()
      } else {
        showApiError(res, "Failed to bulk update status")
      }
    } catch (err: unknown) {
      showApiError(err, "Error updating skills")
    }
  }

  const handleSeedDefault = async () => {
    if (!confirm("This will seed all standard skill categories and skills into your database. Continue?")) {
      return
    }

    setIsSeeding(true)
    try {
      const res = await SkillApi.seedDefault()
      if (res.success) {
        toast.success(res.message || "Default skills and categories seeded successfully")
        loadSkills()
        loadStats()
        loadCategories()
      } else {
        showApiError(res, "Failed to seed default skills")
      }
    } catch (err: unknown) {
      showApiError(err, "Error seeding default skills")
    } finally {
      setIsSeeding(false)
    }
  }

  const columns = React.useMemo(
    () =>
      getSkillColumns({
        onEdit: handleEditSkill,
        onDuplicate: handleDuplicate,
        onDelete: handleDeletePrompt,
        onStatusChange: handleStatusChange,
      }),
    []
  )

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">
              Skills & Tech Stack
            </h1>
            <Badge variant="outline" className="font-mono text-xs">
              {stats.totalSkills} Items
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your technical proficiencies, architectural categories, and website display order.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Seed Defaults Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSeedDefault}
            disabled={isSeeding || isLoading}
            className="font-mono text-xs"
            title="Seed standard full-stack categories and skills"
          >
            {isSeeding ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" />
            )}
            Seed Defaults
          </Button>

          {/* Manage Categories Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCategoryManagerOpen(true)}
            className="font-mono text-xs"
          >
            <FolderTree className="mr-1.5 h-3.5 w-3.5 text-sky-500" />
            Categories ({categories.length})
          </Button>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadSkills()
              loadStats()
              loadCategories()
            }}
            disabled={isLoading}
            className="h-9 w-9 p-0"
          >
            <RotateCcw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>

          {/* Add Skill Button */}
          <Button
            size="sm"
            onClick={() => handleCreateSkill()}
            className="font-mono text-xs font-bold gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add Skill
          </Button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <SkillStatsOverview stats={stats} isLoading={isLoading} />

      {/* Filter & Toolbar Area */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card/50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search skills, labels, tags..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <Select
              value={categoryFilter}
              onValueChange={(val) => {
                setCategoryFilter(val)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="h-9 w-[180px] text-xs">
                <Filter className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.code} ({cat.title})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="h-9 w-[140px] text-xs">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle: Table / Grid */}
            <Tabs
              value={viewMode}
              onValueChange={(val) => setViewMode(val as "table" | "grid")}
            >
              <TabsList className="h-9 bg-muted/60 p-0.5">
                <TabsTrigger value="table" className="h-8 px-2.5 text-xs">
                  <LayoutList className="h-3.5 w-3.5 mr-1" />
                  Table
                </TabsTrigger>
                <TabsTrigger value="grid" className="h-8 px-2.5 text-xs">
                  <LayoutGrid className="h-3.5 w-3.5 mr-1" />
                  Grid
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Quick Category Filter Pills */}
        {categories.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 border-t border-border/40 pt-3">
            <span className="text-[11px] font-mono text-muted-foreground mr-1">
              Category:
            </span>
            <button
              onClick={() => {
                setCategoryFilter("all")
                setCurrentPage(1)
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${
                categoryFilter === "all"
                  ? "bg-primary text-primary-foreground font-bold shadow-xs"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              All ({stats.totalSkills})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setCategoryFilter(cat.id)
                  setCurrentPage(1)
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${
                  categoryFilter === cat.id
                    ? "bg-primary text-primary-foreground font-bold shadow-xs"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {cat.code}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main View: Table or Visual Grid */}
      {viewMode === "table" ? (
        <SkillsDataTable
          columns={columns}
          data={skills}
          isLoading={isLoading}
          totalCount={totalCount}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          onBulkStatusChange={handleBulkStatusChange}
          onBulkDelete={handleBulkDeletePrompt}
          onSeedDefaults={handleSeedDefault}
          onAddSkill={() => handleCreateSkill()}
          isSeeding={isSeeding}
        />
      ) : (
        <SkillGridView
          skills={skills}
          categories={categories}
          onEdit={handleEditSkill}
          onDuplicate={handleDuplicate}
          onDelete={handleDeletePrompt}
          onAddSkillToCategory={(catId) => handleCreateSkill(catId)}
        />
      )}

      {/* Modals & Dialogs */}
      <SkillFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        editingSkill={editingSkill}
        categories={categories}
        onSuccess={() => {
          loadSkills()
          loadStats()
          loadCategories()
        }}
      />

      <CategoryManagerDialog
        open={isCategoryManagerOpen}
        onOpenChange={setIsCategoryManagerOpen}
        categories={categories}
        onSuccess={() => {
          loadCategories()
          loadSkills()
          loadStats()
        }}
      />

      <DeleteSkillDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        skill={deletingSkill}
        bulkIds={bulkDeletingIds}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
