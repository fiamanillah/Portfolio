"use client"

import * as React from "react"
import { Calendar, Clock, CheckCircle } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import type { BlogStatus } from "@workspace/shared"

interface PublicationStatusSectionProps {
  status: BlogStatus
  setStatus: (val: BlogStatus) => void
  publishedAt: string
  setPublishedAt: (val: string) => void
  scheduledAt: string
  setScheduledAt: (val: string) => void
  dateDisplay: string
  setDateDisplay: (val: string) => void
}

export function PublicationStatusSection({
  status,
  setStatus,
  publishedAt,
  setPublishedAt,
  scheduledAt,
  setScheduledAt,
  dateDisplay,
  setDateDisplay,
}: PublicationStatusSectionProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status Select */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-primary" /> Publication Status
          </label>
          <Select value={status} onValueChange={(val) => setStatus(val as BlogStatus)}>
            <SelectTrigger className="text-xs h-9 bg-background border-border/90 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-xs">
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

        {/* Published Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary" /> Published Date & Time
          </label>
          <Input
            type="datetime-local"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            className="text-xs h-9 bg-background border-border/90 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Scheduled At */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary" /> Scheduled Release Date (Optional)
          </label>
          <Input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="text-xs h-9 bg-background border-border/90 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-xs"
          />
        </div>

        {/* Display Date Label */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Display Date Label (e.g. "AUG 2026")
          </label>
          <Input
            placeholder="e.g. AUG 2026"
            value={dateDisplay}
            onChange={(e) => setDateDisplay(e.target.value)}
            className="text-xs h-9 bg-background border-border/90 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-xs"
          />
        </div>
      </div>
    </div>
  )
}
