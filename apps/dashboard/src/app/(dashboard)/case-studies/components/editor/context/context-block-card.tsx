"use client"

import * as React from "react"
import { Trash2, Circle, LightbulbOff } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import type { ContextBlock } from "@workspace/shared"

interface ContextBlockCardProps {
  block: ContextBlock
  index: number
  onUpdate: (field: keyof ContextBlock, value: string) => void
  onRemove: () => void
}

export function ContextBlockCard({
  block,
  index,
  onUpdate,
  onRemove,
}: ContextBlockCardProps) {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card/60 p-4 shadow-xs transition-colors hover:border-primary/30">
      <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary">
            {index === 0 ? (
              <Circle className="size-3.5" />
            ) : (
              <LightbulbOff className="size-3.5" />
            )}
          </div>
          <span className="font-mono text-xs font-bold text-primary">
            BLOCK {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
          title="Delete Block"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-mono text-muted-foreground uppercase">
          Block Label
        </Label>
        <Input
          value={block.label}
          onChange={(e) => onUpdate("label", e.target.value)}
          placeholder="e.g. The Problem, The Solution"
          className="font-medium text-sm h-8"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-mono text-muted-foreground uppercase">
          Body Narrative
        </Label>
        <Textarea
          value={block.body}
          onChange={(e) => onUpdate("body", e.target.value)}
          placeholder="Detail the narrative problem and solution..."
          rows={4}
          className="text-xs leading-relaxed"
        />
      </div>
    </div>
  )
}
