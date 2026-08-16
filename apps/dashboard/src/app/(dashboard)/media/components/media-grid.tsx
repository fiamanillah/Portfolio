"use client"

import * as React from "react"
import {
  UploadCloud,
  FileQuestion,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import type { MediaFileDTO } from "@workspace/shared"
import { MediaCard } from "./media-card"
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

interface MediaGridProps {
  files: MediaFileDTO[]
  isLoading: boolean
  selectedIds: string[]
  onToggleSelect: (id: string) => void
  onInspect: (file: MediaFileDTO) => void
  onDelete: (file: MediaFileDTO) => void
  onUploadClick: () => void
  totalCount: number
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function MediaGrid({
  files,
  isLoading,
  selectedIds,
  onToggleSelect,
  onInspect,
  onDelete,
  onUploadClick,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: MediaGridProps) {
  const totalPages = Math.ceil(totalCount / pageSize) || 1

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: pageSize }).map((_, i) => (
            <Card key={i} className="overflow-hidden border-border/80 p-0">
              <Skeleton className="aspect-[4/3] w-full" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2.5 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-border/80 bg-muted/5">
        <div className="size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
          <UploadCloud className="size-8" />
        </div>
        <h3 className="text-base font-semibold text-foreground">No media assets found</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          No files match your current search and filter criteria, or your media library is empty.
        </p>
        <Button onClick={onUploadClick} size="sm" className="mt-4 gap-2 text-xs">
          <UploadCloud className="size-3.5" /> Upload Media Files
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Grid Container */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {files.map((file) => (
          <MediaCard
            key={file.id}
            file={file}
            isSelected={selectedIds.includes(file.id)}
            onToggleSelect={onToggleSelect}
            onInspect={onInspect}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Grid Pagination Footer */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-2 border-t border-border/60">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(val) => onPageSizeChange(Number(val))}
          >
            <SelectTrigger className="h-8 w-[70px] text-xs">
              <SelectValue placeholder={String(pageSize)} />
            </SelectTrigger>
            <SelectContent side="top" className="text-xs">
              {[12, 24, 48, 96].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="font-mono text-xs">
            Showing {(currentPage - 1) * pageSize + 1}–
            {Math.min(currentPage * pageSize, totalCount)} of {totalCount}
          </span>
        </div>

        <div className="flex items-center gap-1 self-end sm:self-auto">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1}
          >
            <ChevronsLeft className="size-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="size-3.5" />
          </Button>
          <span className="text-xs font-mono px-2 text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="size-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
          >
            <ChevronsRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
