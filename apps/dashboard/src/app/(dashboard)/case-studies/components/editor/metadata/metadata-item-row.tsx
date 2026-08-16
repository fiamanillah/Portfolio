"use client"

import * as React from "react"
import { Trash2 } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import type { CaseStudyMetadataItem } from "@workspace/shared"

interface MetadataItemRowProps {
  item: CaseStudyMetadataItem
  index: number
  onUpdate: (field: keyof CaseStudyMetadataItem, value: string) => void
  onRemove: () => void
}

export function MetadataItemRow({
  item,
  index,
  onUpdate,
  onRemove,
}: MetadataItemRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-xs transition-colors hover:border-primary/30">
      <div className="w-1/3 space-y-1">
        <Label className="text-[11px] text-muted-foreground uppercase font-mono">
          Label #{index + 1}
        </Label>
        <Input
          value={item.label}
          onChange={(e) => onUpdate("label", e.target.value)}
          placeholder="e.g. Role, Timeline, Client"
          className="h-8 text-xs font-mono"
        />
      </div>

      <div className="flex-1 space-y-1">
        <Label className="text-[11px] text-muted-foreground uppercase font-mono">
          Display Value
        </Label>
        <Input
          value={item.value}
          onChange={(e) => onUpdate("value", e.target.value)}
          placeholder="e.g. Lead Backend Engineer"
          className="h-8 text-xs font-medium"
        />
      </div>

      <div className="pt-5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
          title="Delete Item"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
