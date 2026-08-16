"use client"

import * as React from "react"
import { Trash2, Tag, ListChecks, Plus, X } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import { Badge } from "@workspace/ui/components/badge"
import type { FeatureItem } from "@workspace/shared"
import { MediaImagePicker } from "../common/media-image-picker"

interface FeatureCardItemProps {
  feature: FeatureItem
  index: number
  onUpdate: (field: keyof FeatureItem, value: any) => void
  onRemove: () => void
}

export function FeatureCardItem({
  feature,
  index,
  onUpdate,
  onRemove,
}: FeatureCardItemProps) {
  const [tagInput, setTagInput] = React.useState("")
  const [highlightInput, setHighlightInput] = React.useState("")

  const handleAddTag = () => {
    const trimmed = tagInput.trim()
    if (!trimmed) return
    const current = feature.tags || []
    if (!current.includes(trimmed)) {
      onUpdate("tags", [...current, trimmed])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const current = feature.tags || []
    onUpdate(
      "tags",
      current.filter((t) => t !== tagToRemove)
    )
  }

  const handleAddHighlight = () => {
    const trimmed = highlightInput.trim()
    if (!trimmed) return
    const current = feature.highlights || []
    onUpdate("highlights", [...current, trimmed])
    setHighlightInput("")
  }

  const handleRemoveHighlight = (hlIndex: number) => {
    const current = feature.highlights || []
    onUpdate(
      "highlights",
      current.filter((_, i) => i !== hlIndex)
    )
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card/60 p-5 shadow-xs transition-colors hover:border-primary/30">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <span className="font-mono text-xs font-bold text-primary">
          FEATURE {String(index + 1).padStart(2, "0")}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
          title="Delete Feature"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Details & Highlights */}
        <div className="space-y-4 lg:col-span-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-mono text-muted-foreground uppercase">
              Feature Title *
            </Label>
            <Input
              value={feature.title}
              onChange={(e) => onUpdate("title", e.target.value)}
              placeholder="e.g. Real-Time Bidding & Messaging"
              className="font-semibold text-sm h-8"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-mono text-muted-foreground uppercase">
              Description *
            </Label>
            <Textarea
              value={feature.description}
              onChange={(e) => onUpdate("description", e.target.value)}
              placeholder="Describe the architectural implementation and technical choices..."
              rows={3}
              className="text-xs leading-relaxed"
            />
          </div>

          {/* Highlights */}
          <div className="space-y-2 pt-1 border-t border-border/40">
            <Label className="text-xs font-mono text-muted-foreground uppercase flex items-center gap-1.5">
              <ListChecks className="size-3 text-primary" /> Key Highlights ({feature.highlights?.length || 0})
            </Label>
            <div className="flex gap-2">
              <Input
                value={highlightInput}
                onChange={(e) => setHighlightInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddHighlight()
                  }
                }}
                placeholder="Add bullet highlight..."
                className="h-8 text-xs"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={handleAddHighlight}
              >
                <Plus className="size-3" /> Add
              </Button>
            </div>

            <div className="space-y-1 pt-1">
              {(feature.highlights || []).map((hl, hlIndex) => (
                <div
                  key={hlIndex}
                  className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-muted/20 px-2.5 py-1 text-xs"
                >
                  <span className="text-muted-foreground">• {hl}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveHighlight(hlIndex)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Media Artwork with Media Picker & Tags */}
        <div className="space-y-4 lg:col-span-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-mono text-muted-foreground uppercase">
                Media Type
              </Label>
              <Input
                value={feature.mediaType}
                onChange={(e) => onUpdate("mediaType", e.target.value)}
                placeholder="Image / Video or Architecture"
                className="text-xs h-8"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-mono text-muted-foreground uppercase">
                Media Label Caption
              </Label>
              <Input
                value={feature.mediaLabel}
                onChange={(e) => onUpdate("mediaLabel", e.target.value)}
                placeholder="e.g. Messaging Interface"
                className="text-xs h-8"
              />
            </div>
          </div>

          <MediaImagePicker
            label="Feature Screenshot / Media"
            description="Interface screenshot or diagram illustrating this feature."
            value={feature.media}
            onChange={(url) => onUpdate("media", url)}
            folder="case-studies/features"
            source="CASE_STUDY_FEATURE"
            aspectRatio="video"
            required={true}
          />

          {/* Tags */}
          <div className="space-y-2 pt-1 border-t border-border/40">
            <Label className="text-xs font-mono text-muted-foreground uppercase flex items-center gap-1.5">
              <Tag className="size-3 text-muted-foreground" /> Feature Tech Tags
            </Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
                placeholder="Tag (e.g. Socket.IO, RTK Query)..."
                className="h-8 text-xs"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={handleAddTag}
              >
                <Plus className="size-3" /> Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {(feature.tags || []).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1 px-2 py-0.5 text-xs font-mono"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
