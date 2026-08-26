"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, FolderTree, CloudDownload, Loader2 } from "lucide-react"

import type {
  BlogPostListItemDTO,
  BlogCategoryDTO,
  BlogTagDTO,
  BlogStatsDTO,
  BlogStatus,
} from "@workspace/shared"
import { BlogApi } from "@/lib/api"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"

import { getBlogColumns } from "./columns"
import { BlogsDataTable } from "./data-table"
import { BlogStatsOverview } from "./components/list/blog-stats-overview"
import { BlogToolbar } from "./components/list/blog-toolbar"
import { BlogGridView } from "./components/list/blog-grid-view"
import { CategoryTagDialog } from "./category-tag-dialog"
import { DeletePostDialog } from "./delete-post-dialog"

export default function BlogsPage() {
  const router = useRouter()
  const [posts, setPosts] = React.useState<BlogPostListItemDTO[]>([])
  const [stats, setStats] = React.useState<BlogStatsDTO>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    scheduledPosts: 0,
    archivedPosts: 0,
    featuredPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    topPosts: [],
    categoryBreakdown: [],
  })
  const [categories, setCategories] = React.useState<BlogCategoryDTO[]>([])
  const [tags, setTags] = React.useState<BlogTagDTO[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  // Filters & Search
  const [searchQuery, setSearchQuery] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [featuredFilter, setFeaturedFilter] = React.useState<string>("all")
  const [sortBy, setSortBy] = React.useState<string>("createdAt")
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc")
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("table")

  // Pagination
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [totalCount, setTotalCount] = React.useState(0)

  // Dialog states
  const [isTaxonomyOpen, setIsTaxonomyOpen] = React.useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [deletingPost, setDeletingPost] =
    React.useState<BlogPostListItemDTO | null>(null)
  const [bulkDeletingIds, setBulkDeletingIds] = React.useState<string[]>([])
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [isSyncing, setIsSyncing] = React.useState(false)

  // Load Data
  const loadPosts = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await BlogApi.getAll({
        page: currentPage,
        limit: pageSize,
        search: searchQuery.trim() || undefined,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
        status:
          statusFilter !== "all" ? (statusFilter as BlogStatus) : undefined,
        featured: featuredFilter === "featured" ? true : undefined,
        sortBy:
          (sortBy as
            | "createdAt"
            | "title"
            | "views"
            | "likesCount"
            | "publishedAt"
            | "updatedAt") || undefined,
        sortOrder,
      })

      if (res.success && res.data) {
        setPosts(res.data)
        if (res.pagination) {
          setTotalCount(res.pagination.total)
        }
      } else {
        toast.error(res.message || "Failed to load blog posts")
      }
    } catch {
      toast.error("Failed to fetch blog posts")
    } finally {
      setIsLoading(false)
    }
  }, [
    currentPage,
    pageSize,
    searchQuery,
    categoryFilter,
    statusFilter,
    featuredFilter,
    sortBy,
    sortOrder,
  ])

  const loadStatsAndTaxonomies = React.useCallback(async () => {
    try {
      const [statsRes, catsRes, tagsRes] = await Promise.all([
        BlogApi.getStats(),
        BlogApi.getCategories(),
        BlogApi.getTags(),
      ])

      if (statsRes.success && statsRes.data) setStats(statsRes.data)
      if (catsRes.success && catsRes.data) setCategories(catsRes.data)
      if (tagsRes.success && tagsRes.data) setTags(tagsRes.data)
    } catch (err) {
      console.error("Failed to load blog metadata:", err)
    }
  }, [])

  React.useEffect(() => {
    loadStatsAndTaxonomies()
  }, [loadStatsAndTaxonomies])

  React.useEffect(() => {
    loadPosts()
  }, [loadPosts])

  // Handlers
  const handleOpenEdit = (postItem: BlogPostListItemDTO) => {
    router.push(`/blogs/${postItem.id}/edit`)
  }

  const handleOpenPreview = (postItem: BlogPostListItemDTO) => {
    router.push(`/blogs/${postItem.id}/preview`)
  }

  const handleDuplicate = async (postItem: BlogPostListItemDTO) => {
    try {
      const res = await BlogApi.duplicate(postItem.id)
      if (res.success && res.data) {
        toast.success(`Duplicated '${postItem.title}' as draft`)
        loadPosts()
        loadStatsAndTaxonomies()
      } else {
        toast.error(res.message || "Failed to duplicate post")
      }
    } catch {
      toast.error("Failed to duplicate post")
    }
  }

  const handleStatusChange = async (
    postItem: BlogPostListItemDTO,
    newStatus: BlogStatus
  ) => {
    try {
      const res = await BlogApi.update(postItem.id, { status: newStatus })
      if (res.success) {
        toast.success(`Status updated to ${newStatus}`)
        loadPosts()
        loadStatsAndTaxonomies()
      } else {
        toast.error(res.message || "Failed to update status")
      }
    } catch {
      toast.error("Failed to update status")
    }
  }

  const handlePromptDelete = (postItem: BlogPostListItemDTO) => {
    setDeletingPost(postItem)
    setBulkDeletingIds([])
    setIsDeleteOpen(true)
  }

  const handlePromptBulkDelete = (ids: string[]) => {
    setDeletingPost(null)
    setBulkDeletingIds(ids)
    setIsDeleteOpen(true)
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    try {
      if (bulkDeletingIds.length > 0) {
        const res = await BlogApi.bulkDelete({ ids: bulkDeletingIds })
        if (res.success) {
          toast.success(
            `Deleted ${res.data?.count || bulkDeletingIds.length} blog posts`
          )
          setIsDeleteOpen(false)
          setBulkDeletingIds([])
          loadPosts()
          loadStatsAndTaxonomies()
        } else {
          toast.error(res.message || "Failed to delete posts")
        }
      } else if (deletingPost) {
        const res = await BlogApi.delete(deletingPost.id)
        if (res.success) {
          toast.success(`Deleted '${deletingPost.title}'`)
          setIsDeleteOpen(false)
          setDeletingPost(null)
          loadPosts()
          loadStatsAndTaxonomies()
        } else {
          toast.error(res.message || "Failed to delete post")
        }
      }
    } catch {
      toast.error("Failed to complete delete request")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBulkStatusChange = async (
    ids: string[],
    newStatus: BlogStatus
  ) => {
    try {
      const res = await BlogApi.bulkUpdateStatus({ ids, status: newStatus })
      if (res.success) {
        toast.success(`Updated ${ids.length} posts to ${newStatus}`)
        loadPosts()
        loadStatsAndTaxonomies()
      } else {
        toast.error(res.message || "Failed to bulk update status")
      }
    } catch {
      toast.error("Failed to update posts")
    }
  }

  const handleSyncLocal = async () => {
    setIsSyncing(true)
    try {
      const res = await BlogApi.seedLocal()
      if (res.success) {
        toast.success(
          res.message ||
            `Successfully synced ${res.data?.imported || 9} local posts!`
        )
        loadPosts()
        loadStatsAndTaxonomies()
      } else {
        toast.error(res.message || "Failed to sync local posts")
      }
    } catch {
      toast.error("Failed to sync local posts")
    } finally {
      setIsSyncing(false)
    }
  }

  const columns = React.useMemo(() => {
    return getBlogColumns({
      onEdit: handleOpenEdit,
      onPreview: handleOpenPreview,
      onDuplicate: handleDuplicate,
      onDelete: handlePromptDelete,
      onStatusChange: handleStatusChange,
    })
  }, [])

  return (
    <div className="space-y-6">
      {/* Header & Primary Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Blog Post Management
            </h1>
            <Badge
              variant="outline"
              className="border-primary/30 font-mono text-xs text-primary"
            >
              SEO Engine
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Author, edit, schedule, and optimize technical articles with
            real-time SERP previews and Google Schema.org graphs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTaxonomyOpen(true)}
            className="gap-1.5"
          >
            <FolderTree className="h-4 w-4 text-muted-foreground" />
            Categories & Tags
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncLocal}
            disabled={isSyncing}
            className="gap-1.5"
          >
            {isSyncing ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <CloudDownload className="h-4 w-4 text-muted-foreground" />
            )}
            Sync Local
          </Button>

          <Button size="sm" asChild className="gap-1.5 shadow-xs">
            <Link href="/blogs/create">
              <Plus className="h-4 w-4" />
              New Blog Post
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Overview Metrics Bar */}
      <BlogStatsOverview stats={stats} />

      {/* Filter & Search Toolbar */}
      <BlogToolbar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q)
          setCurrentPage(1)
        }}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={(c) => {
          setCategoryFilter(c)
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
        sortOrder={sortOrder}
        onSortChange={(sb, so) => {
          setSortBy(sb)
          setSortOrder(so)
          setCurrentPage(1)
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        categories={categories}
        isLoading={isLoading}
        onRefresh={() => {
          loadPosts()
          loadStatsAndTaxonomies()
        }}
      />

      {/* Main Content View (Table or Grid) */}
      {viewMode === "table" ? (
        <BlogsDataTable
          columns={columns}
          data={posts}
          isLoading={isLoading}
          totalCount={totalCount}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          onBulkStatusChange={handleBulkStatusChange}
          onBulkDelete={handlePromptBulkDelete}
        />
      ) : (
        <BlogGridView
          posts={posts}
          isLoading={isLoading}
          onEdit={handleOpenEdit}
          onPreview={handleOpenPreview}
          onDuplicate={handleDuplicate}
          onDelete={handlePromptDelete}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Taxonomy Manager Modal (Categories & Tags) */}
      <CategoryTagDialog
        open={isTaxonomyOpen}
        onOpenChange={setIsTaxonomyOpen}
        onUpdated={() => {
          loadStatsAndTaxonomies()
          loadPosts()
        }}
      />

      {/* Delete Confirmation Dialog (Single & Bulk) */}
      <DeletePostDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        post={deletingPost}
        bulkCount={bulkDeletingIds.length}
        isProcessing={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
