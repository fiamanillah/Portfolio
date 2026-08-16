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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="flex items-center gap-2 p-2 px-3.5 rounded-full border border-border/80 bg-background/95 backdrop-blur-md shadow-xl text-xs">
        <Badge variant="default" className="rounded-full px-2.5 py-0.5 text-xs font-mono">
          {selectedCount} selected
        </Badge>

        <div className="h-4 w-px bg-border mx-0.5" />

        <Button
          variant="ghost"
          size="sm"
          onClick={isAllPageSelected ? onClearSelection : onSelectAllPage}
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1.5"
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
          className="h-7 px-2.5 text-xs gap-1.5 shadow-2xs"
        >
          <FolderInput className="size-3.5 text-primary" />
          Move Folder
        </Button>

        <Button
          variant="destructive"
          size="sm"
          onClick={onBulkDelete}
          className="h-7 px-2.5 text-xs gap-1.5 shadow-2xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          <Trash2 className="size-3.5" />
          Delete Selected
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClearSelection}
          className="size-7 rounded-full text-muted-foreground hover:text-foreground ml-1"
          title="Dismiss"
        >
          <X className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
