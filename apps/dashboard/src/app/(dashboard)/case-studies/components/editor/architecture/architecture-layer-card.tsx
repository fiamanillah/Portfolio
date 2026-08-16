"use client"

import * as React from "react"
import { Trash2, Plus } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import type { ArchitectureLayer } from "@workspace/shared"
import { ArchitectureItemRow } from "./architecture-item-row"

interface ArchitectureLayerCardProps {
  layer: ArchitectureLayer
  index: number
  onUpdateLayer: (field: "name" | "description", value: string) => void
  onRemoveLayer: () => void
  onAddItem: () => void
  onUpdateItem: (itemIndex: number, field: "title" | "subtitle", value: string) => void
  onRemoveItem: (itemIndex: number) => void
}

export function ArchitectureLayerCard({
  layer,
  index,
  onUpdateLayer,
  onRemoveLayer,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
}: ArchitectureLayerCardProps) {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card/60 p-5 shadow-xs transition-colors hover:border-primary/30">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <span className="font-mono text-xs font-bold text-primary">
          LAYER {String(index + 1).padStart(2, "0")}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemoveLayer}
          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
          title="Delete Layer"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs font-mono text-muted-foreground uppercase">
            Layer Name *
          </Label>
          <Input
            value={layer.name}
            onChange={(e) => onUpdateLayer("name", e.target.value)}
            placeholder="e.g. Client / UI, API & Compute, Data Layer"
            className="font-semibold text-sm h-8"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-mono text-muted-foreground uppercase">
            Layer Description
          </Label>
          <Input
            value={layer.description}
            onChange={(e) => onUpdateLayer("description", e.target.value)}
            placeholder="Brief description of this tier layer..."
            className="text-xs h-8"
          />
        </div>
      </div>

      {/* Layer Items List */}
      <div className="space-y-2 pt-2 border-t border-border/40">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-mono text-muted-foreground uppercase">
            Components / Technologies ({layer.items?.length || 0})
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={onAddItem}
          >
            <Plus className="mr-1 size-3" /> Add Component
          </Button>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {(layer.items || []).map((item, itemIdx) => (
            <ArchitectureItemRow
              key={itemIdx}
              item={item}
              onUpdateTitle={(val) => onUpdateItem(itemIdx, "title", val)}
              onUpdateSubtitle={(val) => onUpdateItem(itemIdx, "subtitle", val)}
              onRemove={() => onRemoveItem(itemIdx)}
            />
          ))}
          {!layer.items?.length && (
            <div className="col-span-2 rounded-lg border border-dashed border-border/60 p-3 text-center text-xs text-muted-foreground">
              No components added to this layer yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
