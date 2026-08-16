"use client"

import * as React from "react"
import {
  Search,
  LayoutGrid,
  List,
  Filter,
  X,
  FolderOpen,
  ArrowUpDown,
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  FileArchive,
  Layers,
} from "lucide-react"
import type { MediaFolderStat } from "@workspace/shared"
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

interface MediaToolbarProps {
  searchQuery: string
  onSearchChange: (val: string) => void
  typeFilter: string
  onTypeFilterChange: (val: string) => void
  folderFilter: string
  onFolderFilterChange: (val: string) => void
  sortBy: "createdAt" | "size" | "fileName" | "updatedAt"
  sortOrder: "asc" | "desc"
  onSortChange: (
    sortBy: "createdAt" | "size" | "fileName" | "updatedAt",
    sortOrder: "asc" | "desc"
  ) => void
  viewMode: "grid" | "table"
  onViewModeChange: (mode: "grid" | "table") => void
  folders: MediaFolderStat[]
  totalFiltered: number
}

export function MediaToolbar({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  folderFilter,
  onFolderFilterChange,
  sortBy,
  sortOrder,
  onSortChange,
  viewMode,
  onViewModeChange,
  folders = [],
  totalFiltered,
}: MediaToolbarProps) {
  const isFiltered =
    searchQuery.trim() !== "" || typeFilter !== "all" || folderFilter !== "all"

  const handleResetFilters = () => {
    onSearchChange("")
    onTypeFilterChange("all")
    onFolderFilterChange("all")
  }

  // Preset known folders merged with dynamic folders
  const allFolderNames = React.useMemo(() => {
    const set = new Set([
      "general",
      "blogs",
      "avatars",
      "templates",
      "documents",
    ])
    folders.forEach((f) => {
      if (f.folder) set.add(f.folder)
    })
    return Array.from(set).sort()
  }, [folders])

  const sortValue = `${sortBy}_${sortOrder}`
  const handleSortSelect = (value: string) => {
    const [field, order] = value.split("_") as [
      "createdAt" | "size" | "fileName" | "updatedAt",
      "asc" | "desc",
    ]
    onSortChange(field, order)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Side: Search & Primary Filters */}
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          {/* Search Bar */}
          <div className="relative max-w-sm min-w-[220px] flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search file name, alt text, or tags..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 bg-card pr-8 pl-9 text-xs"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Media Type Filter */}
          <Select value={typeFilter} onValueChange={onTypeFilterChange}>
            <SelectTrigger className="h-9 w-[150px] bg-card text-xs">
              <div className="flex items-center gap-1.5 truncate">
                <Filter className="size-3.5 shrink-0 text-muted-foreground" />
                <SelectValue placeholder="All Types" />
              </div>
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="all">All Media Types</SelectItem>
              <SelectItem value="image/*">Images & Icons</SelectItem>
              <SelectItem value="video/*">Videos</SelectItem>
              <SelectItem value="audio/*">Audio</SelectItem>
              <SelectItem value="application/pdf">PDF Documents</SelectItem>
              <SelectItem value="application/*">Other Documents</SelectItem>
            </SelectContent>
          </Select>

          {/* Folder Filter */}
          <Select value={folderFilter} onValueChange={onFolderFilterChange}>
            <SelectTrigger className="h-9 w-[150px] bg-card text-xs">
              <div className="flex items-center gap-1.5 truncate">
                <FolderOpen className="size-3.5 shrink-0 text-muted-foreground" />
                <SelectValue placeholder="All Folders" />
              </div>
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="all">All Folders</SelectItem>
              {allFolderNames.map((folder) => {
                const folderStat = folders.find((f) => f.folder === folder)
                return (
                  <SelectItem key={folder} value={folder}>
                    <span className="capitalize">{folder}</span>
                    {folderStat ? ` (${folderStat.count})` : ""}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>

          {/* Sort Selector */}
          <Select value={sortValue} onValueChange={handleSortSelect}>
            <SelectTrigger className="h-9 w-[160px] bg-card text-xs">
              <div className="flex items-center gap-1.5 truncate">
                <ArrowUpDown className="size-3.5 shrink-0 text-muted-foreground" />
                <SelectValue placeholder="Sort by" />
              </div>
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="createdAt_desc">Newest First</SelectItem>
              <SelectItem value="createdAt_asc">Oldest First</SelectItem>
              <SelectItem value="fileName_asc">Name (A to Z)</SelectItem>
              <SelectItem value="fileName_desc">Name (Z to A)</SelectItem>
              <SelectItem value="size_desc">Size (Largest)</SelectItem>
              <SelectItem value="size_asc">Size (Smallest)</SelectItem>
            </SelectContent>
          </Select>

          {/* Reset Filters button */}
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-9 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
              Reset
            </Button>
          )}
        </div>

        {/* Right Side: View Mode Toggles & Result Count */}
        <div className="flex items-center justify-between gap-3 lg:justify-end">
          <span className="font-mono text-xs text-muted-foreground">
            {totalFiltered} {totalFiltered === 1 ? "asset" : "assets"} found
          </span>

          <div className="flex items-center rounded-lg border border-border bg-card p-0.5 shadow-2xs">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => onViewModeChange("grid")}
              className="h-7 w-7 rounded-md"
              title="Grid View (WordPress style)"
            >
              <LayoutGrid className="size-3.5" />
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => onViewModeChange("table")}
              className="h-7 w-7 rounded-md"
              title="List / Table View"
            >
              <List className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
