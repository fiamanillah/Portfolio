"use client"

import * as React from "react"
import { Search, Sparkles } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Button } from "@workspace/ui/components/button"
import { FieldError } from "@workspace/ui/components/field"

interface MetaTagsSectionProps {
  title: string
  summary: string
  metaTitle: string
  setMetaTitle: (val: string) => void
  metaTitleError?: string
  metaDescription: string
  setMetaDescription: (val: string) => void
  metaDescriptionError?: string
  onAutoGenerateMeta?: () => void
}

export function MetaTagsSection({
  title,
  summary,
  metaTitle,
  setMetaTitle,
  metaTitleError,
  metaDescription,
  setMetaDescription,
  metaDescriptionError,
  onAutoGenerateMeta,
}: MetaTagsSectionProps) {
  const effectiveTitle = metaTitle || (title ? `${title} | Fi Amanillah` : "")
  const effectiveDesc = metaDescription || summary

  return (
    <div className="space-y-4">
      {/* Quick Auto-Enhance Banner */}
      {onAutoGenerateMeta && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/20 bg-primary/5 p-2.5 px-3 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <span className="text-[11px] text-muted-foreground">
              Smart auto-fill computes optimal 50-60 char titles & 140-160 char descriptions.
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAutoGenerateMeta}
            className="h-7 text-xs border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary font-semibold"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Auto-Generate Meta
          </Button>
        </div>
      )}

      {/* Meta Title */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
            <Search className="h-3.5 w-3.5 text-primary" /> SEO Meta Title (SERP Heading)
          </label>
          <span
            className={`font-mono text-[11px] ${
              effectiveTitle.length >= 40 && effectiveTitle.length <= 60
                ? "font-semibold text-emerald-500"
                : effectiveTitle.length > 60
                  ? "font-semibold text-rose-500"
                  : "text-amber-500"
            }`}
          >
            {effectiveTitle.length} / 60 chars (Optimal: 40-60)
          </span>
        </div>
        <Input
          placeholder={
            title
              ? `${title} | Fi Amanillah`
              : "Enter SEO title for Google SERP..."
          }
          value={metaTitle}
          onChange={(e) => setMetaTitle(e.target.value)}
          className={`h-9 bg-background text-xs shadow-xs transition-colors ${
            metaTitleError
              ? "border-destructive focus:border-destructive focus:ring-1 focus:ring-destructive/30"
              : "border-border/90 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20"
          }`}
        />
        {metaTitleError && <FieldError errors={metaTitleError} />}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
          <div
            className={`h-full transition-all ${
              effectiveTitle.length >= 40 && effectiveTitle.length <= 60
                ? "bg-emerald-500"
                : effectiveTitle.length > 60
                  ? "bg-rose-500"
                  : "bg-amber-500"
            }`}
            style={{
              width: `${Math.min(100, (effectiveTitle.length / 60) * 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Meta Description */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
            SEO Meta Description
          </label>
          <span
            className={`font-mono text-[11px] ${
              effectiveDesc.length >= 120 && effectiveDesc.length <= 160
                ? "font-semibold text-emerald-500"
                : effectiveDesc.length > 160
                  ? "font-semibold text-rose-500"
                  : "text-amber-500"
            }`}
          >
            {effectiveDesc.length} / 160 chars (Optimal: 120-160)
          </span>
        </div>
        <Textarea
          placeholder={
            summary ||
            "Compelling summary snippet displayed on Google search results and social cards..."
          }
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          rows={3}
          className={`bg-background text-xs leading-relaxed shadow-xs transition-colors ${
            metaDescriptionError
              ? "border-destructive focus:border-destructive focus:ring-1 focus:ring-destructive/30"
              : "border-border/90 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20"
          }`}
        />
        {metaDescriptionError && <FieldError errors={metaDescriptionError} />}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
          <div
            className={`h-full transition-all ${
              effectiveDesc.length >= 120 && effectiveDesc.length <= 160
                ? "bg-emerald-500"
                : effectiveDesc.length > 160
                  ? "bg-rose-500"
                  : "bg-amber-500"
            }`}
            style={{
              width: `${Math.min(100, (effectiveDesc.length / 160) * 100)}%`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
