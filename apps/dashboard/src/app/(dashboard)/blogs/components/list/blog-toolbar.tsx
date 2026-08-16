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
    <div className="flex flex-col justify-between gap-3 rounded-xl border border-border/80 bg-card p-3.5 shadow-xs lg:flex-row lg:items-center">
      <div className="flex flex-1 flex-wrap items-center gap-2.5">
        {/* Search Input */}
        <div className="relative max-w-sm min-w-[200px] flex-1">
          <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search title, summary, slug..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 pl-9 text-xs"
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
            <ArrowUpDown className="mr-1 h-3 w-3 text-muted-foreground" />
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

      <div className="flex shrink-0 items-center gap-2">
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
        <div className="flex items-center rounded-lg border border-border bg-muted/60 p-0.5">
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
