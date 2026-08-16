"use client"

import * as React from "react"
import { Search, ArrowUpDown, RefreshCw, List, LayoutGrid } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import type { BlogCategoryDTO } from "@workspace/shared"

interface BlogToolbarProps {
  searchQuery: string
  onSearchChange: (val: string) => void
  categoryFilter: string
  onCategoryFilterChange: (val: string) => void
  statusFilter: string
  onStatusFilterChange: (val: string) => void
  featuredFilter: string
  onFeaturedFilterChange: (val: string) => void
  sortBy: string
  sortOrder: "asc" | "desc"
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void
  viewMode: "table" | "grid"
  onViewModeChange: (mode: "table" | "grid") => void
  categories: BlogCategoryDTO[]
  isLoading: boolean
  onRefresh: () => void
}

export function BlogToolbar({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  statusFilter,
  onStatusFilterChange,
  featuredFilter,
  onFeaturedFilterChange,
  sortBy,
  sortOrder,
  onSortChange,
  viewMode,
  onViewModeChange,
  categories,
  isLoading,
  onRefresh,
}: BlogToolbarProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/80 bg-card shadow-xs">
      <div className="flex flex-1 flex-wrap items-center gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search title, summary, slug..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Category Filter */}
        <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
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
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
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
        <Select value={featuredFilter} onValueChange={onFeaturedFilterChange}>
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
            onSortChange(field, order as "asc" | "desc")
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
          onClick={onRefresh}
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
            onClick={() => onViewModeChange("table")}
            title="Table View"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => onViewModeChange("grid")}
            title="Grid View"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
