"use client"

import * as React from "react"
import { Trash2, Code2 } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import type { PostMortemEntry } from "@workspace/shared"

interface PostMortemEntryItemProps {
  entry: PostMortemEntry
  onUpdateHeading: (val: string) => void
  onUpdateDetail: (val: string) => void
  onUpdateCode: (val: string) => void
  onRemove: () => void
}

export function PostMortemEntryItem({
  entry,
  onUpdateHeading,
  onUpdateDetail,
  onUpdateCode,
  onRemove,
}: PostMortemEntryItemProps) {
  return (
    <div className="space-y-2 rounded-lg border border-border/80 bg-muted/20 p-3.5 transition-colors hover:border-primary/30">
      <div className="flex items-center justify-between gap-2">
        <Input
          value={entry.heading}
          onChange={(e) => onUpdateHeading(e.target.value)}
          placeholder="// Heading (e.g. Asynchronous Alert Queuing)"
          className="h-8 text-xs font-mono font-semibold max-w-md"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
          title="Remove Entry"
        >
          <Trash2 className="size-3" />
        </Button>
      </div>

      <Textarea
        value={entry.detail}
        onChange={(e) => onUpdateDetail(e.target.value)}
        placeholder="Detail the technical bottleneck and the architectural resolution..."
        rows={3}
        className="text-xs leading-relaxed"
      />

      <div className="space-y-1 pt-1">
        <Label className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
          <Code2 className="size-3" /> Optional Code Snippet / Config
        </Label>
        <Textarea
          value={entry.code || ""}
          onChange={(e) => onUpdateCode(e.target.value)}
          placeholder="Optional code snippet, SQL query, or docker compose block..."
          rows={2}
          className="font-mono text-xs"
        />
      </div>
    </div>
  )
}
