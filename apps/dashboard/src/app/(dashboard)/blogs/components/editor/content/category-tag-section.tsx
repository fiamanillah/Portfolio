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

const CATEGORY_COLORS: Record<string, string> = {
  websockets: "#3b82f6",
  architecture: "#10b981",
  database: "#f59e0b",
  performance: "#8b5cf6",
  devops: "#f43f5e",
  security: "#06b6d4",
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
    const clean = tagToAdd.trim().toLowerCase().replace(/[^a-z0-9-]/g, "")
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/80">
      {/* Category Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <FolderTree className="h-3.5 w-3.5 text-primary" /> Primary Category
          </label>
          {onOpenTaxonomyManager && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onOpenTaxonomyManager}
              className="h-6 text-[11px] px-1.5 text-primary hover:text-primary hover:bg-primary/10"
            >
              + Manage Categories
            </Button>
          )}
        </div>
        <Select value={categoryId} onValueChange={handleCategorySelect}>
          <SelectTrigger className="w-full text-xs h-9 bg-background border-border/90 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-xs">
            <SelectValue placeholder="Select article category..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">-- No Category --</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor:
                        CATEGORY_COLORS[cat.slug.toLowerCase()] || "#10b981",
                    }}
                  />
                  <span>{cat.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tags Input */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <TagIcon className="h-3.5 w-3.5 text-primary" /> Technical Tags
        </label>
        <div className="flex items-center gap-1.5">
          <Input
            placeholder="Type tag and press Enter (e.g. redis, rabbitmq)..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            className="text-xs h-9 font-mono bg-background border-border/90 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-xs"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleAddTag(tagInput)}
            disabled={!tagInput.trim()}
            className="h-9 px-3 text-xs shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Selected Tags Chips */}
        <div className="flex flex-wrap gap-1.5 min-h-7">
          {selectedTags.length === 0 ? (
            <span className="text-[11px] text-muted-foreground italic">
              No tags attached. Type above or choose suggested tags below.
            </span>
          ) : (
            selectedTags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-[11px] font-mono pl-2 pr-1 py-0.5 flex items-center gap-1 bg-muted/80 hover:bg-muted text-foreground border border-border"
              >
                <span>#{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-destructive p-0.5 rounded"
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
            <span className="text-[10px] text-muted-foreground font-mono">Suggested:</span>
            {availableTags.slice(0, 8).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleAddTag(t.slug || t.name)}
                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/60"
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
