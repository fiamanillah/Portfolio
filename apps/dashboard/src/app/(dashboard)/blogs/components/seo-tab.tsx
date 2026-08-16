"use client"

import * as React from "react"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Switch } from "@workspace/ui/components/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import type { BlogArticleType, SeoAnalysisResult } from "@workspace/shared"
import { SeoPreviewCard } from "./seo-preview-card"

interface SeoTabProps {
  title: string
  summary: string
  slug: string
  metaTitle: string
  setMetaTitle: (val: string) => void
  metaDescription: string
  setMetaDescription: (val: string) => void
  canonicalUrl: string
  setCanonicalUrl: (val: string) => void
  articleType: BlogArticleType
  setArticleType: (val: BlogArticleType) => void
  noIndex: boolean
  setNoIndex: (val: boolean) => void
  noFollow: boolean
  setNoFollow: (val: boolean) => void
  seoAnalysis: SeoAnalysisResult | null
}

export function SeoTab({
  title,
  summary,
  slug,
  metaTitle,
  setMetaTitle,
  metaDescription,
  setMetaDescription,
  canonicalUrl,
  setCanonicalUrl,
  articleType,
  setArticleType,
  noIndex,
  setNoIndex,
  noFollow,
  setNoFollow,
  seoAnalysis,
}: SeoTabProps) {
  const effectiveTitle = metaTitle || title
  const effectiveDesc = metaDescription || summary

  return (
    <div className="space-y-6">
      {/* Primary SEO Meta Inputs */}
      <div className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              SEO Meta Title (SERP Heading)
            </label>
            <span
              className={`font-mono text-[11px] ${
                effectiveTitle.length >= 40 && effectiveTitle.length <= 60
                  ? "font-semibold text-emerald-500"
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
                : "Meta Title for Google SERP..."
            }
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            className="bg-card text-xs"
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              SEO Meta Description
            </label>
            <span
              className={`font-mono text-[11px] ${
                effectiveDesc.length >= 120 && effectiveDesc.length <= 160
                  ? "font-semibold text-emerald-500"
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
            rows={2}
            className="bg-card text-xs leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Canonical URL
            </label>
            <Input
              placeholder={`https://fi.amanillah.com/blog/${slug || "post-slug"}`}
              value={canonicalUrl}
              onChange={(e) => setCanonicalUrl(e.target.value)}
              className="bg-card font-mono text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Schema.org Article Type
            </label>
            <Select
              value={articleType}
              onValueChange={(val) => setArticleType(val as BlogArticleType)}
            >
              <SelectTrigger className="bg-card text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TechArticle">
                  TechArticle (Recommended for Dev Guides)
                </SelectItem>
                <SelectItem value="BlogPosting">
                  BlogPosting (Standard Blog Post)
                </SelectItem>
                <SelectItem value="Article">
                  Article (General Editorial)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Crawler Directives */}
        <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3.5">
            <div>
              <div className="text-xs font-semibold">Robots NoIndex</div>
              <div className="text-[11px] text-muted-foreground">
                Block search engines from indexing this URL
              </div>
            </div>
            <Switch checked={noIndex} onCheckedChange={setNoIndex} />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3.5">
            <div>
              <div className="text-xs font-semibold">Robots NoFollow</div>
              <div className="text-[11px] text-muted-foreground">
                Do not endorse/crawl outbound links
              </div>
            </div>
            <Switch checked={noFollow} onCheckedChange={setNoFollow} />
          </div>
        </div>
      </div>

      {/* Embedded Real-time Preview Simulator */}
      <SeoPreviewCard seoAnalysis={seoAnalysis} slug={slug} />
    </div>
  )
}
