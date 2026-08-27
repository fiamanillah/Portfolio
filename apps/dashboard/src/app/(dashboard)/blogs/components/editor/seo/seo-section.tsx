"use client"

import * as React from "react"
import { Search, Sparkles, ExternalLink } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import type { SeoAnalysisResult, BlogArticleType } from "@workspace/shared"
import { SeoDialog } from "./seo-dialog"

interface SeoSectionProps {
  title: string
  summary: string
  slug: string
  metaTitle: string
  setMetaTitle: (val: string) => void
  metaTitleError?: string
  metaDescription: string
  setMetaDescription: (val: string) => void
  metaDescriptionError?: string
  canonicalUrl: string
  setCanonicalUrl: (val: string) => void
  canonicalUrlError?: string
  articleType: BlogArticleType
  setArticleType: (val: BlogArticleType) => void
  noIndex: boolean
  setNoIndex: (val: boolean) => void
  noFollow: boolean
  setNoFollow: (val: boolean) => void
  seoAnalysis: SeoAnalysisResult | null
  onAutoGenerateSeo?: () => void
}

export function SeoSection({
  title,
  summary,
  slug,
  metaTitle,
  setMetaTitle,
  metaTitleError,
  metaDescription,
  setMetaDescription,
  metaDescriptionError,
  canonicalUrl,
  setCanonicalUrl,
  canonicalUrlError,
  articleType,
  setArticleType,
  noIndex,
  setNoIndex,
  noFollow,
  setNoFollow,
  seoAnalysis,
  onAutoGenerateSeo,
}: SeoSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  const effectiveTitle = metaTitle || (title ? `${title} | Fi Amanillah` : "")
  const effectiveDesc = metaDescription || summary

  return (
    <div className="space-y-3">
      {/* Header with Live Score & Regenerate button */}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
          <Search className="h-3.5 w-3.5 text-primary" /> SEO & Directives
        </span>
        <div className="flex items-center gap-2">
          {onAutoGenerateSeo && (
            <button
              type="button"
              onClick={onAutoGenerateSeo}
              className="flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
              title="Regenerate SEO from content, overriding any manual edits"
            >
              <Sparkles className="h-3 w-3" /> Regenerate SEO
            </button>
          )}
          {seoAnalysis && (
            <Badge
              variant="outline"
              className={`px-1.5 py-0 font-mono text-[10px] ${
                seoAnalysis.score >= 85
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
                  : seoAnalysis.score >= 70
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-500"
                    : "border-rose-500/40 bg-rose-500/10 text-rose-500"
              }`}
            >
              {seoAnalysis.score}/100 • {seoAnalysis.rating}
            </Badge>
          )}
        </div>
      </div>

      {/* Compact Meta Title Input */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-muted-foreground">
            Meta Title
          </label>
          <span
            className={`font-mono text-[10px] ${
              effectiveTitle.length >= 40 && effectiveTitle.length <= 60
                ? "font-semibold text-emerald-500"
                : effectiveTitle.length > 60
                  ? "font-semibold text-rose-500"
                  : "text-muted-foreground"
            }`}
          >
            {effectiveTitle.length}/60
          </span>
        </div>
        <Input
          placeholder={
            title ? `${title} | Fi Amanillah` : "Auto-derived from title..."
          }
          value={metaTitle}
          onChange={(e) => setMetaTitle(e.target.value)}
          className={`h-8 bg-background text-xs ${
            metaTitleError ? "border-destructive focus:border-destructive" : ""
          }`}
        />
      </div>

      {/* Compact Meta Description Input */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-muted-foreground">
            Meta Description
          </label>
          <span
            className={`font-mono text-[10px] ${
              effectiveDesc.length >= 120 && effectiveDesc.length <= 160
                ? "font-semibold text-emerald-500"
                : effectiveDesc.length > 160
                  ? "font-semibold text-rose-500"
                  : "text-muted-foreground"
            }`}
          >
            {effectiveDesc.length}/160
          </span>
        </div>
        <Textarea
          placeholder={
            summary || "Auto-derived from article summary excerpt..."
          }
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          rows={2}
          className={`bg-background text-xs leading-relaxed ${
            metaDescriptionError
              ? "border-destructive focus:border-destructive"
              : ""
          }`}
        />
      </div>

      {/* Button to Open Dedicated SEO Diagnostics & SERP Modal */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsDialogOpen(true)}
        className="h-8 w-full gap-1.5 bg-muted/30 text-xs text-foreground hover:bg-muted/60"
      >
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span>SERP, Directives & Social Studio</span>
        <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
      </Button>

      {/* Full Dedicated Modal */}
      <SeoDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        seoAnalysis={seoAnalysis}
        title={title}
        summary={summary}
        slug={slug}
        metaTitle={metaTitle}
        setMetaTitle={setMetaTitle}
        metaTitleError={metaTitleError}
        metaDescription={metaDescription}
        setMetaDescription={setMetaDescription}
        metaDescriptionError={metaDescriptionError}
        canonicalUrl={canonicalUrl}
        setCanonicalUrl={setCanonicalUrl}
        canonicalUrlError={canonicalUrlError}
        articleType={articleType}
        setArticleType={setArticleType}
        noIndex={noIndex}
        setNoIndex={setNoIndex}
        noFollow={noFollow}
        setNoFollow={setNoFollow}
        onAutoGenerateSeo={onAutoGenerateSeo}
      />
    </div>
  )
}
