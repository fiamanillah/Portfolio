"use client"

import * as React from "react"
import { Trash2, Plus, AlertTriangle } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import type { PostMortemSection, PostMortemEntry } from "@workspace/shared"
import { PostMortemEntryItem } from "./post-mortem-entry-item"

interface PostMortemSectionCardProps {
  section: PostMortemSection
  index: number
  onUpdateTitle: (title: string) => void
  onRemoveSection: () => void
  onAddEntry: () => void
  onUpdateEntry: (entryIndex: number, field: keyof PostMortemEntry, val: string) => void
  onRemoveEntry: (entryIndex: number) => void
}

export function PostMortemSectionCard({
  section,
  index,
  onUpdateTitle,
  onRemoveSection,
  onAddEntry,
  onUpdateEntry,
  onRemoveEntry,
}: PostMortemSectionCardProps) {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card/60 p-5 shadow-xs transition-colors hover:border-primary/30">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <span className="font-mono text-xs font-bold text-primary">
          SECTION {String(index + 1).padStart(2, "0")}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemoveSection}
          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
          title="Delete Section"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-mono text-muted-foreground uppercase">
          Section Heading Title *
        </Label>
        <Input
          value={section.title}
          onChange={(e) => onUpdateTitle(e.target.value)}
          placeholder="e.g. Technical Challenges or Lessons Learned"
          className="font-semibold text-sm h-8"
        />
      </div>

      {/* Entries */}
      <div className="space-y-3 pt-2 border-t border-border/40">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-mono text-muted-foreground uppercase">
            Entries & Engineering Lessons ({section.entries?.length || 0})
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={onAddEntry}
          >
            <Plus className="mr-1 size-3" /> Add Entry
          </Button>
        </div>

        <div className="space-y-3">
          {(section.entries || []).map((entry, entryIndex) => (
            <PostMortemEntryItem
              key={entryIndex}
              entry={entry}
              onUpdateHeading={(val) =>
                onUpdateEntry(entryIndex, "heading", val)
              }
              onUpdateDetail={(val) => onUpdateEntry(entryIndex, "detail", val)}
              onUpdateCode={(val) => onUpdateEntry(entryIndex, "code", val)}
              onRemove={() => onRemoveEntry(entryIndex)}
            />
          ))}
          {!section.entries?.length && (
            <div className="rounded-lg border border-dashed border-border/60 p-3 text-center text-xs text-muted-foreground">
              No entries added to this section yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
