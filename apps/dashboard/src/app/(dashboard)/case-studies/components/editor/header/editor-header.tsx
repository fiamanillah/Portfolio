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
  ExternalLink,
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
import type { CaseStudyStatus } from "@workspace/shared"

export type CaseStudyViewMode = "editor" | "preview"

interface EditorHeaderProps {
  isEdit: boolean
  title: string
  slug: string
  status: CaseStudyStatus
  onStatusChange: (status: CaseStudyStatus) => void
  isSaving: boolean
  viewMode: CaseStudyViewMode
  onViewModeChange: (mode: CaseStudyViewMode) => void
  onBack: () => void
  onSaveDraft: () => void
  onPublishOrSave: () => void
}

export function EditorHeader({
  isEdit,
  title,
  slug,
  status,
  onStatusChange,
  isSaving,
  viewMode,
  onViewModeChange,
  onBack,
  onSaveDraft,
  onPublishOrSave,
}: EditorHeaderProps) {
  const getStatusBadge = () => {
    switch (status) {
      case "PUBLISHED":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 text-[10px] uppercase font-mono">
            Published
          </Badge>
        )
      case "ARCHIVED":
        return (
          <Badge className="bg-muted text-muted-foreground border-border text-[10px] uppercase font-mono">
            Archived
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="text-[10px] uppercase font-mono">
            Draft
          </Badge>
        )
    }
  }

  return (
    <div className="sticky top-14 z-20 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/80 bg-background/95 p-3 shadow-xs backdrop-blur-md">
      {/* Left: Back & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-8 w-8 shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              <Link href="/case-studies" className="hover:underline">
                Case Studies
              </Link>{" "}
              / {isEdit ? "Edit Study" : "New Study"}
            </span>
            {getStatusBadge()}
          </div>
          <h1 className="line-clamp-1 text-base font-bold text-foreground sm:text-lg">
            {title.trim() || (isEdit ? "Edit Case Study" : "Untitled Case Study")}
          </h1>
        </div>
      </div>

      {/* Right: View Switcher & Action Buttons */}
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
          onValueChange={(val) => onStatusChange(val as CaseStudyStatus)}
        >
          <SelectTrigger className="h-8 w-30 border-border/80 bg-background text-xs font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>

        {/* View Public Button (if published/edit) */}
        {isEdit && slug && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            asChild
            title="Open Public URL"
          >
            <a
              href={`${process.env.NEXT_PUBLIC_SITE_URL || "https://fi.amanillah.com"}/case-study/${slug}`}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        )}

        {/* Save Draft Action */}
        {status !== "DRAFT" && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSaveDraft}
            disabled={isSaving}
            className="h-8 gap-1.5 text-xs font-medium"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Draft</span>
          </Button>
        )}

        {/* Primary Action Button */}
        <Button
          type="button"
          onClick={onPublishOrSave}
          disabled={isSaving}
          className="h-8 gap-1.5 text-xs font-bold shadow-xs"
        >
          {isSaving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : status === "PUBLISHED" ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          <span>
            {isEdit
              ? status === "PUBLISHED"
                ? "Update Published Study"
                : "Save Changes"
              : status === "PUBLISHED"
                ? "Publish Study"
                : "Save & Continue"}
          </span>
        </Button>
      </div>
    </div>
  )
}
