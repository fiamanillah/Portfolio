"use client"

import * as React from "react"
import { Trash2 } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import type { ArchitectureItem } from "@workspace/shared"

interface ArchitectureItemRowProps {
  item: ArchitectureItem
  onUpdateTitle: (val: string) => void
  onUpdateSubtitle: (val: string) => void
  onRemove: () => void
}

export function ArchitectureItemRow({
  item,
  onUpdateTitle,
  onUpdateSubtitle,
  onRemove,
}: ArchitectureItemRowProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-muted/20 p-2.5">
      <div className="flex-1 space-y-1">
        <Input
          value={item.title}
          onChange={(e) => onUpdateTitle(e.target.value)}
          placeholder="Component title (e.g. Bun Runtime)"
          className="h-7 text-xs font-semibold"
        />
        <Input
          value={item.subtitle || ""}
          onChange={(e) => onUpdateSubtitle(e.target.value)}
          placeholder="Subtitle (e.g. Fast JS Execution Engine)"
          className="h-6 text-[11px] text-muted-foreground font-mono"
        />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
        title="Remove Component"
      >
        <Trash2 className="size-3" />
      </Button>
    </div>
  )
}
