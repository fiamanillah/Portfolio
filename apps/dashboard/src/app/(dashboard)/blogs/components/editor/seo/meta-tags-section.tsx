"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"

interface MetaTagsSectionProps {
  title: string
  summary: string
  metaTitle: string
  setMetaTitle: (val: string) => void
  metaDescription: string
  setMetaDescription: (val: string) => void
}

export function MetaTagsSection({
  title,
  summary,
  metaTitle,
  setMetaTitle,
  metaDescription,
  setMetaDescription,
}: MetaTagsSectionProps) {
  const effectiveTitle = metaTitle || title
  const effectiveDesc = metaDescription || summary

  return (
    <div className="space-y-4">
      {/* Meta Title */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Search className="h-3.5 w-3.5 text-primary" /> SEO Meta Title (SERP Heading)
          </label>
          <span
            className={`text-[11px] font-mono ${
              effectiveTitle.length >= 40 && effectiveTitle.length <= 60
                ? "text-emerald-500 font-semibold"
                : effectiveTitle.length > 60
                ? "text-rose-500 font-semibold"
                : "text-amber-500"
            }`}
          >
            {effectiveTitle.length} / 60 chars (Optimal: 40-60)
          </span>
        </div>
        <Input
          placeholder={title ? `${title} | Fi Amanillah` : "Enter SEO title for Google SERP..."}
          value={metaTitle}
          onChange={(e) => setMetaTitle(e.target.value)}
          className="text-xs h-9 bg-background border-border/90 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-xs"
        />
        <div className="w-full bg-muted/60 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              effectiveTitle.length >= 40 && effectiveTitle.length <= 60
                ? "bg-emerald-500"
                : effectiveTitle.length > 60
                ? "bg-rose-500"
                : "bg-amber-500"
            }`}
            style={{ width: `${Math.min(100, (effectiveTitle.length / 60) * 100)}%` }}
          />
        </div>
      </div>

      {/* Meta Description */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            SEO Meta Description
          </label>
          <span
            className={`text-[11px] font-mono ${
              effectiveDesc.length >= 120 && effectiveDesc.length <= 160
                ? "text-emerald-500 font-semibold"
                : effectiveDesc.length > 160
                ? "text-rose-500 font-semibold"
                : "text-amber-500"
            }`}
          >
            {effectiveDesc.length} / 160 chars (Optimal: 120-160)
          </span>
        </div>
        <Textarea
          placeholder={
            summary || "Compelling summary snippet displayed on Google search results and social cards..."
          }
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          rows={3}
          className="text-xs leading-relaxed bg-background border-border/90 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-xs"
        />
        <div className="w-full bg-muted/60 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              effectiveDesc.length >= 120 && effectiveDesc.length <= 160
                ? "bg-emerald-500"
                : effectiveDesc.length > 160
                ? "bg-rose-500"
                : "bg-amber-500"
            }`}
            style={{ width: `${Math.min(100, (effectiveDesc.length / 160) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
