"use client"

import * as React from "react"
import {
  Trash2,
  FolderInput,
  X,
  CheckSquare,
  Square,
  Sparkles,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"

interface MediaBulkBarProps {
  selectedCount: number
  totalOnPage: number
  onSelectAllPage: () => void
  onClearSelection: () => void
  onBulkMoveFolder: () => void
  onBulkDelete: () => void
}

export function MediaBulkBar({
  selectedCount,
  totalOnPage,
  onSelectAllPage,
  onClearSelection,
  onBulkMoveFolder,
  onBulkDelete,
}: MediaBulkBarProps) {
  if (selectedCount === 0) return null

  const isAllPageSelected = selectedCount >= totalOnPage && totalOnPage > 0

  return (
    <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 animate-in duration-200 slide-in-from-bottom-5 fade-in">
      <div className="flex items-center gap-2 rounded-full border border-border/80 bg-background/95 p-2 px-3.5 text-xs shadow-xl backdrop-blur-md">
        <Badge
          variant="default"
          className="rounded-full px-2.5 py-0.5 font-mono text-xs"
        >
          {selectedCount} selected
        </Badge>

        <div className="mx-0.5 h-4 w-px bg-border" />

        <Button
          variant="ghost"
          size="sm"
          onClick={isAllPageSelected ? onClearSelection : onSelectAllPage}
          className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          {isAllPageSelected ? (
            <>
              <Square className="size-3.5" /> Deselect Page
            </>
          ) : (
            <>
              <CheckSquare className="size-3.5" /> Select Page
            </>
          )}
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onBulkMoveFolder}
          className="h-7 gap-1.5 px-2.5 text-xs shadow-2xs"
        >
          <FolderInput className="size-3.5 text-primary" />
          Move Folder
        </Button>

        <Button
          variant="destructive"
          size="sm"
          onClick={onBulkDelete}
          className="text-destructive-foreground h-7 gap-1.5 bg-destructive px-2.5 text-xs shadow-2xs hover:bg-destructive/90"
        >
          <Trash2 className="size-3.5" />
          Delete Selected
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClearSelection}
          className="ml-1 size-7 rounded-full text-muted-foreground hover:text-foreground"
          title="Dismiss"
        >
          <X className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
