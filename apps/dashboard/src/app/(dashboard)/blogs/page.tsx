"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  BookOpen,
  Plus,
  Search,
  RefreshCw,
  LayoutGrid,
  List,
  Eye,
  ThumbsUp,
  FileText,
  FolderTree,
  CloudDownload,
  Loader2,
  Calendar,
  ArrowUpDown,
} from "lucide-react"

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
import { Card } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { toast } from "@workspace/ui/components/sonner"

import { getBlogColumns } from "./columns"
import { BlogsDataTable } from "./data-table"
import { BlogCard } from "./blog-card"
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
  const [sortBy, setSortBy] = React.useState<"createdAt" | "updatedAt" | "publishedAt" | "views" | "likesCount" | "title">("createdAt")
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc")
  const [viewMode, setViewMode] = React.useState<"table" | "grid">("table")

  // Pagination
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [totalCount, setTotalCount] = React.useState(0)

  // Dialog states
  const [isTaxonomyOpen, setIsTaxonomyOpen] = React.useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [deletingPost, setDeletingPost] = React.useState<BlogPostListItemDTO | null>(null)
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
        status: statusFilter !== "all" ? (statusFilter as BlogStatus) : undefined,
        featured: featuredFilter === "featured" ? true : undefined,
        sortBy,
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
    } catch (err) {
      toast.error("Failed to fetch blog posts")
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, pageSize, searchQuery, categoryFilter, statusFilter, featuredFilter, sortBy, sortOrder])

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

  // Navigation Handlers
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
    } catch (err) {
      toast.error("Failed to duplicate post")
    }
  }

  const handleStatusChange = async (postItem: BlogPostListItemDTO, newStatus: BlogStatus) => {
    try {
      const res = await BlogApi.update(postItem.id, { status: newStatus })
      if (res.success) {
        toast.success(`Status updated to ${newStatus}`)
        loadPosts()
        loadStatsAndTaxonomies()
      } else {
        toast.error(res.message || "Failed to update status")
      }
    } catch (err) {
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
          toast.success(`Deleted ${res.data?.count || bulkDeletingIds.length} blog posts`)
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
    } catch (err) {
      toast.error("Failed to complete delete request")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBulkStatusChange = async (ids: string[], newStatus: BlogStatus) => {
    try {
      const res = await BlogApi.bulkUpdateStatus({ ids, status: newStatus })
      if (res.success) {
        toast.success(`Updated ${ids.length} posts to ${newStatus}`)
        loadPosts()
        loadStatsAndTaxonomies()
      } else {
        toast.error(res.message || "Failed to bulk update status")
      }
    } catch (err) {
      toast.error("Failed to update posts")
    }
  }

  const handleSyncLocal = async () => {
    setIsSyncing(true)
    try {
      const res = await BlogApi.seedLocal()
      if (res.success) {
        toast.success(res.message || `Successfully synced ${res.data?.imported || 9} local posts!`)
        loadPosts()
        loadStatsAndTaxonomies()
      } else {
        toast.error(res.message || "Failed to sync local posts")
      }
    } catch (err) {
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Blog Post Management
            </h1>
            <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
              SEO Engine
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Author, edit, schedule, and optimize technical articles with real-time SERP previews and Google Schema.org graphs.
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="border-border/80 bg-card p-3.5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Posts</span>
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">
            {stats.totalPosts}
          </div>
        </Card>

        <Card className="border-border/80 bg-card p-3.5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Published</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-500 font-mono">
            {stats.publishedPosts}
          </div>
        </Card>

        <Card className="border-border/80 bg-card p-3.5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Drafts</span>
            <span className="h-2 w-2 rounded-full bg-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-500 font-mono">
            {stats.draftPosts}
          </div>
        </Card>

        <Card className="border-border/80 bg-card p-3.5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Scheduled</span>
            <Calendar className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-500 font-mono">
            {stats.scheduledPosts}
          </div>
        </Card>

        <Card className="border-border/80 bg-card p-3.5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Views</span>
            <Eye className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">
            {stats.totalViews > 999 ? `${(stats.totalViews / 1000).toFixed(1)}k` : stats.totalViews}
          </div>
        </Card>

        <Card className="border-border/80 bg-card p-3.5 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Likes</span>
            <ThumbsUp className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">
            {stats.totalLikes}
          </div>
        </Card>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/80 bg-card shadow-xs">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search title, summary, slug..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Category Filter */}
          <Select
            value={categoryFilter}
            onValueChange={(val) => {
              setCategoryFilter(val)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="h-9 w-36 text-xs">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.name}>
                  {c.name}
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
            <SelectTrigger className="h-9 w-32 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="DRAFT">Drafts</SelectItem>
              <SelectItem value="SCHEDULED">Scheduled</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>

          {/* Featured Filter */}
          <Select
            value={featuredFilter}
            onValueChange={(val) => {
              setFeaturedFilter(val)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="h-9 w-32 text-xs">
              <SelectValue placeholder="Featured" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Posts</SelectItem>
              <SelectItem value="featured">Featured Only</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort By */}
          <Select
            value={`${sortBy}:${sortOrder}`}
            onValueChange={(val) => {
              const [field, order] = val.split(":")
              setSortBy(field as "createdAt" | "updatedAt" | "publishedAt" | "views" | "likesCount" | "title")
              setSortOrder(order as "asc" | "desc")
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="h-9 w-40 text-xs font-medium">
              <ArrowUpDown className="h-3 w-3 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt:desc">Newest Created</SelectItem>
              <SelectItem value="createdAt:asc">Oldest Created</SelectItem>
              <SelectItem value="publishedAt:desc">Recently Published</SelectItem>
              <SelectItem value="views:desc">Most Views</SelectItem>
              <SelectItem value="likesCount:desc">Most Likes</SelectItem>
              <SelectItem value="title:asc">Title (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            onClick={() => {
              loadPosts()
              loadStatsAndTaxonomies()
            }}
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-muted/60 rounded-lg p-0.5 border border-border">
            <Button
              type="button"
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("table")}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("grid")}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

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
        <div className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="h-80 animate-pulse bg-muted/40" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center border border-dashed rounded-xl bg-card text-muted-foreground space-y-3">
              <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/60" />
              <div className="text-base font-semibold text-foreground">No blog posts found</div>
              <p className="text-xs max-w-sm mx-auto">
                No articles match the current filter or search criteria.
              </p>
              <Button size="sm" asChild>
                <Link href="/blogs/create">
                  <Plus className="h-4 w-4 mr-1" /> Create First Post
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {posts.map((post) => (
                <BlogCard
                  key={post.id}
                  post={post}
                  onEdit={handleOpenEdit}
                  onPreview={handleOpenPreview}
                  onDuplicate={handleDuplicate}
                  onDelete={handlePromptDelete}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </div>
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
