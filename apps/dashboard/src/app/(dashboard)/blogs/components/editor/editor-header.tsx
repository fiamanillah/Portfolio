"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Eye,
  PenLine,
  Save,
  Loader2,
  Send,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import type { BlogStatus } from "@workspace/shared"

export type EditorViewMode = "editor" | "preview"

interface EditorHeaderProps {
  title: string
  status: BlogStatus
  onStatusChange: (status: BlogStatus) => void
  isEdit?: boolean
  isSubmitting: boolean
  viewMode: EditorViewMode
  onViewModeChange: (mode: EditorViewMode) => void
  onSaveClick: (overrideStatus?: BlogStatus) => void
  discardHref?: string
}

export function EditorHeader({
  title,
  status,
  onStatusChange,
  isEdit = false,
  isSubmitting,
  viewMode,
  onViewModeChange,
  onSaveClick,
  discardHref = "/blogs",
}: EditorHeaderProps) {
  const getStatusBadge = () => {
    switch (status) {
      case "PUBLISHED":
        return (
          <Badge className="border-emerald-500/30 bg-emerald-500/15 font-mono text-[10px] text-emerald-500 uppercase">
            Published
          </Badge>
        )
      case "SCHEDULED":
        return (
          <Badge className="border-amber-500/30 bg-amber-500/15 font-mono text-[10px] text-amber-500 uppercase">
            Scheduled
          </Badge>
        )
      case "ARCHIVED":
        return (
          <Badge className="border-border bg-muted font-mono text-[10px] text-muted-foreground uppercase">
            Archived
          </Badge>
        )
      default:
        return (
          <Badge
            variant="secondary"
            className="font-mono text-[10px] uppercase"
          >
            Draft
          </Badge>
        )
    }
  }

  return (
    <div className="sticky top-14 z-20 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/80 bg-background/95 p-3 shadow-xs backdrop-blur-md">
      {/* Left: Back & Title */}
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="h-8 w-8 shrink-0"
        >
          <Link href={discardHref}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              <Link href="/blogs" className="hover:underline">
                Blogs
              </Link>{" "}
              / {isEdit ? "Edit Post" : "New Post"}
            </span>
            {getStatusBadge()}
          </div>
          <h1 className="line-clamp-1 text-base font-bold text-foreground sm:text-lg">
            {title.trim() ||
              (isEdit ? "Edit Article" : "Untitled Technical Article")}
          </h1>
        </div>
      </div>

      {/* Center/Right: View Switcher & Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Editor vs Live Preview Toggle */}
        <div className="flex items-center rounded-lg border border-border/80 bg-muted/30 p-0.5">
          <Button
            type="button"
            variant={viewMode === "editor" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("editor")}
            className="h-7 gap-1.5 px-2.5 text-xs font-medium"
          >
            <PenLine className="h-3.5 w-3.5" />
            <span>Editor</span>
          </Button>
          <Button
            type="button"
            variant={viewMode === "preview" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("preview")}
            className="h-7 gap-1.5 px-2.5 text-xs font-medium"
          >
            <Eye className="h-3.5 w-3.5 text-primary" />
            <span>Live Preview</span>
          </Button>
        </div>

        {/* Status Selector */}
        <Select
          value={status}
          onValueChange={(val) => onStatusChange(val as BlogStatus)}
        >
          <SelectTrigger className="h-8 w-32 border-border/80 bg-background text-xs font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>

        {/* Save Draft Action */}
        {status !== "DRAFT" && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onSaveClick("DRAFT")}
            disabled={isSubmitting}
            className="h-8 gap-1.5 text-xs font-medium"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Draft</span>
          </Button>
        )}

        {/* Primary Action Button (Publish / Update) */}
        <Button
          type="button"
          onClick={() => onSaveClick()}
          disabled={isSubmitting}
          className="h-8 gap-1.5 text-xs font-bold shadow-xs"
        >
          {isSubmitting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : status === "PUBLISHED" ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          <span>
            {isEdit
              ? status === "PUBLISHED"
                ? "Update Published Article"
                : "Save Changes"
              : status === "PUBLISHED"
                ? "Publish Article"
                : "Save & Continue"}
          </span>
        </Button>
      </div>
    </div>
  )
}
