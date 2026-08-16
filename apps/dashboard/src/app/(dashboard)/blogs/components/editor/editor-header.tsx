"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Eye, Save, Loader2, FileText, CheckCircle2 } from "lucide-react"
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

interface EditorHeaderProps {
  title: string
  status: BlogStatus
  onStatusChange: (status: BlogStatus) => void
  isEdit?: boolean
  isSubmitting: boolean
  onPreviewClick?: () => void
  onSaveClick?: () => void
  discardHref?: string
}

export function EditorHeader({
  title,
  status,
  onStatusChange,
  isEdit = false,
  isSubmitting,
  onPreviewClick,
  onSaveClick,
  discardHref = "/blogs",
}: EditorHeaderProps) {
  return (
    <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-border/80 bg-background/95 backdrop-blur-md shadow-xs">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="h-9 w-9">
          <Link href={discardHref}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono">
              <Link href="/blogs" className="hover:underline">
                Blogs
              </Link>{" "}
              / {isEdit ? "Edit Post" : "Create New Post"}
            </span>
            <Badge
              variant={status === "PUBLISHED" ? "default" : "secondary"}
              className="text-[10px] h-4 px-1.5 capitalize font-medium"
            >
              {status.toLowerCase()}
            </Badge>
          </div>
          <h1 className="text-lg font-bold text-foreground line-clamp-1">
            {title.trim() || (isEdit ? "Edit Article" : "Untitled Technical Article")}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Select value={status} onValueChange={(val) => onStatusChange(val as BlogStatus)}>
          <SelectTrigger className="h-9 w-36 font-medium text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>

        {onPreviewClick && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onPreviewClick}
            className="h-9 gap-1.5 text-xs font-medium"
          >
            <Eye className="h-3.5 w-3.5" />
            Live Preview
          </Button>
        )}

        <Button
          type="button"
          onClick={onSaveClick}
          disabled={isSubmitting}
          className="h-9 gap-1.5 text-xs font-medium shadow-xs"
        >
          {isSubmitting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          {isEdit ? "Update Article" : "Publish / Save"}
        </Button>
      </div>
    </div>
  )
}
