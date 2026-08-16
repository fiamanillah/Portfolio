"use client"

import * as React from "react"
import {
  Search,
  LayoutGrid,
  List as ListIcon,
  Filter,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
} from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Badge } from "@workspace/ui/components/badge"

interface CaseStudyToolbarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  statusFilter: string
  onStatusFilterChange: (status: string) => void
  featuredFilter: string
  onFeaturedFilterChange: (featured: string) => void
  sortBy: string
  onSortByChange: (sortBy: string) => void
  sortOrder: "asc" | "desc"
  onSortOrderChange: (sortOrder: "asc" | "desc") => void
  viewMode: "table" | "grid"
  onViewModeChange: (viewMode: "table" | "grid") => void
  totalCount: number
  onResetFilters: () => void
}

export function CaseStudyToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  featuredFilter,
  onFeaturedFilterChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  viewMode,
  onViewModeChange,
  totalCount,
  onResetFilters,
}: CaseStudyToolbarProps) {
  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    statusFilter !== "all" ||
    featuredFilter !== "all" ||
    sortBy !== "order" ||
    sortOrder !== "asc"

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search by title, description, tech..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      {/* Filter and View Mode Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="h-9 w-[130px] text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">
              All Statuses
            </SelectItem>
            <SelectItem value="PUBLISHED" className="text-xs">
              Published
            </SelectItem>
            <SelectItem value="DRAFT" className="text-xs">
              Draft
            </SelectItem>
            <SelectItem value="ARCHIVED" className="text-xs">
              Archived
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Featured Filter */}
        <Select value={featuredFilter} onValueChange={onFeaturedFilterChange}>
          <SelectTrigger className="h-9 w-[130px] text-xs">
            <SelectValue placeholder="Featured" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">
              All Case Studies
            </SelectItem>
            <SelectItem value="featured" className="text-xs">
              Featured Only
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Sort By */}
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="h-9 w-[140px] text-xs">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="order" className="text-xs">
              Order Index
            </SelectItem>
            <SelectItem value="publishedAt" className="text-xs">
              Published Date
            </SelectItem>
            <SelectItem value="views" className="text-xs">
              Total Views
            </SelectItem>
            <SelectItem value="likesCount" className="text-xs">
              Likes Count
            </SelectItem>
            <SelectItem value="createdAt" className="text-xs">
              Date Created
            </SelectItem>
            <SelectItem value="title" className="text-xs">
              Title
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Direction Toggle */}
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-2.5 text-xs"
          onClick={() => onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")}
          title={`Sorting ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
        >
          <ArrowUpDown className="mr-1 size-3.5" />
          {sortOrder.toUpperCase()}
        </Button>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={onResetFilters}
          >
            <RotateCcw className="mr-1 size-3" /> Reset
          </Button>
        )}

        {/* View Mode Toggle (Table / Grid) */}
        <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5">
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onViewModeChange("table")}
            title="Table View"
          >
            <ListIcon className="size-3.5" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onViewModeChange("grid")}
            title="Grid View"
          >
            <LayoutGrid className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
