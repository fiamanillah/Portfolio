"use client"

import * as React from "react"
import { FolderTree, Tag as TagIcon, Plus, X } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import type { BlogCategoryDTO, BlogTagDTO } from "@workspace/shared"

interface CategoryTagSectionProps {
  categoryId: string
  setCategoryId: (id: string) => void
  categoryName: string
  setCategoryName: (name: string) => void
  categories: BlogCategoryDTO[]
  selectedTags: string[]
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>
  availableTags: BlogTagDTO[]
  onOpenTaxonomyManager?: () => void
}

function getCategoryDotColor(color?: string | null): string {
  if (!color) return "#3b82f6"
  const clean = color.trim()
  if (clean.startsWith("#")) return clean
  const presetMap: Record<string, string> = {
    blue: "#3b82f6",
    emerald: "#10b981",
    amber: "#f59e0b",
    purple: "#8b5cf6",
    rose: "#f43f5e",
    cyan: "#06b6d4",
    indigo: "#6366f1",
    orange: "#f97316",
    fuchsia: "#d946ef",
    teal: "#14b8a6",
    lime: "#84cc16",
    sky: "#0ea5e9",
  }
  return presetMap[clean.toLowerCase()] || clean
}

export function CategoryTagSection({
  categoryId,
  setCategoryId,
  categoryName,
  setCategoryName,
  categories,
  selectedTags,
  setSelectedTags,
  availableTags,
  onOpenTaxonomyManager,
}: CategoryTagSectionProps) {
  const [tagInput, setTagInput] = React.useState("")

  const handleCategorySelect = (val: string) => {
    setCategoryId(val)
    if (val === "none") {
      setCategoryName("")
    } else {
      const found = categories.find((c) => c.id === val)
      if (found) setCategoryName(found.name)
    }
  }

  const handleAddTag = (tagToAdd: string) => {
    const clean = tagToAdd
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
    if (!clean) return
    if (!selectedTags.includes(clean)) {
      setSelectedTags([...selectedTags, clean])
    }
    setTagInput("")
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tagToRemove))
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      handleAddTag(tagInput)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 border-t border-border/80 pt-4 md:grid-cols-2">
      {/* Category Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
            <FolderTree className="h-3.5 w-3.5 text-primary" /> Primary Category
          </label>
          {onOpenTaxonomyManager && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onOpenTaxonomyManager}
              className="h-6 px-1.5 text-[11px] text-primary hover:bg-primary/10 hover:text-primary"
            >
              + Manage Categories
            </Button>
          )}
        </div>
        <Select value={categoryId} onValueChange={handleCategorySelect}>
          <SelectTrigger className="h-9 w-full border-border/90 bg-background text-xs shadow-xs hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20">
            <SelectValue placeholder="Select article category..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">-- No Category --</SelectItem>
            {categories.map((cat) => {
              const dotColor = getCategoryDotColor(cat.color)
              return (
                <SelectItem key={cat.id} value={cat.id}>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: dotColor,
                        boxShadow: `0 0 4px ${dotColor}80`,
                      }}
                    />
                    <span>{cat.name}</span>
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Tags Input */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
          <TagIcon className="h-3.5 w-3.5 text-primary" /> Technical Tags
        </label>
        <div className="flex items-center gap-1.5">
          <Input
            placeholder="Type tag and press Enter (e.g. redis, rabbitmq)..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            className="h-9 border-border/90 bg-background font-mono text-xs shadow-xs hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleAddTag(tagInput)}
            disabled={!tagInput.trim()}
            className="h-9 shrink-0 px-3 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Selected Tags Chips */}
        <div className="flex min-h-7 flex-wrap gap-1.5">
          {selectedTags.length === 0 ? (
            <span className="text-[11px] text-muted-foreground italic">
              No tags attached. Type above or choose suggested tags below.
            </span>
          ) : (
            selectedTags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="flex items-center gap-1 border border-border bg-muted/80 py-0.5 pr-1 pl-2 font-mono text-[11px] text-foreground hover:bg-muted"
              >
                <span>#{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="rounded p-0.5 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          )}
        </div>

        {/* Suggested Database Tags */}
        {availableTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 pt-1">
            <span className="font-mono text-[10px] text-muted-foreground">
              Suggested:
            </span>
            {availableTags.slice(0, 8).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleAddTag(t.slug || t.name)}
                className="rounded border border-border/60 bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                +{t.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
