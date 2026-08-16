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
          <label className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
            <Search className="h-3.5 w-3.5 text-primary" /> SEO Meta Title (SERP
            Heading)
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
          className="h-9 border-border/90 bg-background text-xs shadow-xs hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20"
        />
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
          className="border-border/90 bg-background text-xs leading-relaxed shadow-xs hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20"
        />
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
