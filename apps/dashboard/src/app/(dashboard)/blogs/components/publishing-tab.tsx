"use client"

import * as React from "react"
import { Sparkles, Pin } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Switch } from "@workspace/ui/components/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import type { BlogStatus } from "@workspace/shared"

interface PublishingTabProps {
  status: BlogStatus
  setStatus: (val: BlogStatus) => void
  publishedAt: string
  setPublishedAt: (val: string) => void
  scheduledAt: string
  setScheduledAt: (val: string) => void
  dateDisplay: string
  setDateDisplay: (val: string) => void
  readTimeOverride: string
  setReadTimeOverride: (val: string) => void
  calculatedReadTime: string
  featured: boolean
  setFeatured: (val: boolean) => void
  pinned: boolean
  setPinned: (val: boolean) => void
}

export function PublishingTab({
  status,
  setStatus,
  publishedAt,
  setPublishedAt,
  scheduledAt,
  setScheduledAt,
  dateDisplay,
  setDateDisplay,
  readTimeOverride,
  setReadTimeOverride,
  calculatedReadTime,
  featured,
  setFeatured,
  pinned,
  setPinned,
}: PublishingTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Publication Status
          </label>
          <Select value={status} onValueChange={(val) => setStatus(val as BlogStatus)}>
            <SelectTrigger className="bg-card text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft (Unpublished)</SelectItem>
              <SelectItem value="PUBLISHED">Published (Live to public)</SelectItem>
              <SelectItem value="SCHEDULED">Scheduled (Future release)</SelectItem>
              <SelectItem value="ARCHIVED">Archived (Hidden from feeds)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Published Date & Time
          </label>
          <Input
            type="datetime-local"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            className="bg-card text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Scheduled Release Date (Optional)
          </label>
          <Input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="bg-card text-xs"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Display Date Label (e.g. "AUG 2025")
          </label>
          <Input
            placeholder="e.g. AUG 2025"
            value={dateDisplay}
            onChange={(e) => setDateDisplay(e.target.value)}
            className="bg-card text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Reading Time Override
          </label>
          <Input
            placeholder={`Auto-calculated: ${calculatedReadTime}`}
            value={readTimeOverride}
            onChange={(e) => setReadTimeOverride(e.target.value)}
            className="bg-card text-xs"
          />
        </div>
      </div>

      {/* Featured & Pinned Switches */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
        <div className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-card">
          <div>
            <div className="text-sm font-semibold flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-500" /> Featured Article
            </div>
            <div className="text-xs text-muted-foreground">Display prominently on home & blog featured grids</div>
          </div>
          <Switch checked={featured} onCheckedChange={setFeatured} />
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-card">
          <div>
            <div className="text-sm font-semibold flex items-center gap-1.5">
              <Pin className="h-4 w-4 text-primary" /> Pinned Article
            </div>
            <div className="text-xs text-muted-foreground">Keep pinned at top of blog listings</div>
          </div>
          <Switch checked={pinned} onCheckedChange={setPinned} />
        </div>
      </div>
    </div>
  )
}
