"use client"

import * as React from "react"
import { ArrowLeft, ExternalLink, Save, CheckCircle2, Loader2, Sparkles } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import type { CaseStudyStatus } from "@workspace/shared"

interface EditorHeaderProps {
  isEdit: boolean
  title: string
  slug: string
  status: CaseStudyStatus
  isSaving: boolean
  onBack: () => void
  onSaveDraft: () => void
  onPublishOrSave: () => void
}

export function EditorHeader({
  isEdit,
  title,
  slug,
  status,
  isSaving,
  onBack,
  onSaveDraft,
  onPublishOrSave,
}: EditorHeaderProps) {
  return (
    <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/80 bg-background/95 p-4 backdrop-blur-md shadow-xs">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-8 px-2.5 text-xs"
        >
          <ArrowLeft className="mr-1 size-3.5" /> Back
        </Button>

        <div className="h-4 w-px bg-border" />

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-foreground line-clamp-1">
              {isEdit ? (title ? `Edit: ${title}` : "Edit Case Study") : "New Case Study"}
            </h1>
            <Badge
              variant="outline"
              className={`font-mono text-[10px] uppercase ${
                status === "PUBLISHED"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                  : status === "ARCHIVED"
                    ? "border-zinc-500/30 bg-zinc-500/10 text-zinc-500"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-600"
              }`}
            >
              {status}
            </Badge>
          </div>
          <p className="font-mono text-[11px] text-muted-foreground">
            /case-study/{slug || "slug"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {isEdit && slug && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            asChild
          >
            <a
              href={`${process.env.NEXT_PUBLIC_SITE_URL || "https://fi.amanillah.com"}/case-study/${slug}`}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="size-3.5" /> View Public
            </a>
          </Button>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isSaving}
          onClick={onSaveDraft}
          className="h-8 text-xs font-medium"
        >
          {isSaving ? (
            <Loader2 className="mr-1.5 size-3.5 animate-spin" />
          ) : (
            <Save className="mr-1.5 size-3.5" />
          )}
          Save Draft
        </Button>

        <Button
          type="button"
          size="sm"
          disabled={isSaving}
          onClick={onPublishOrSave}
          className="h-8 gap-1.5 text-xs font-semibold bg-primary text-primary-foreground"
        >
          {isSaving ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="size-3.5" />
          )}
          {isEdit
            ? status === "PUBLISHED"
              ? "Save Changes"
              : "Publish Now"
            : "Create & Publish"}
        </Button>
      </div>
    </div>
  )
}
