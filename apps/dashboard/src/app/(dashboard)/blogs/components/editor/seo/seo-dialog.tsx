"use client"

import * as React from "react"
import { Search, Globe, Share2, Sparkles, Shield, Code2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { Badge } from "@workspace/ui/components/badge"
import type { SeoAnalysisResult, BlogArticleType } from "@workspace/shared"

import { SerpPreview } from "./serp-preview"
import { SocialSharePreview } from "./social-share-preview"
import { SeoDiagnosticsCard } from "./seo-diagnostics-card"
import { CrawlerDirectivesSection } from "./crawler-directives-section"
import { MetaTagsSection } from "./meta-tags-section"

interface SeoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  seoAnalysis: SeoAnalysisResult | null
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
}

export function SeoDialog({
  open,
  onOpenChange,
  seoAnalysis,
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
}: SeoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-4xl overflow-y-auto border border-border/80 bg-card p-6 shadow-2xl sm:min-w-[700px] md:min-w-[800px]">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <div className="space-y-0.5">
              <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                <Search className="h-5 w-5 text-primary" />
                SEO & Social Media Diagnostics Studio
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Inspect Google SERP snippet simulation, OpenGraph cards, schema
                structured graphs, and automated ranking health checks.
              </DialogDescription>
            </div>
            {seoAnalysis && (
              <Badge
                variant="outline"
                className={`px-2.5 py-1 font-mono text-xs ${
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
        </DialogHeader>

        <Tabs defaultValue="previews" className="mt-2">
          <TabsList className="grid w-full grid-cols-3 border border-border bg-muted/60 p-1">
            <TabsTrigger
              value="previews"
              className="flex items-center gap-2 text-xs font-semibold"
            >
              <Globe className="h-3.5 w-3.5" />
              SERP & Social Previews
            </TabsTrigger>
            <TabsTrigger
              value="diagnostics"
              className="flex items-center gap-2 text-xs font-semibold"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Health Checks ({seoAnalysis?.checks?.length || 0})
            </TabsTrigger>
            <TabsTrigger
              value="directives"
              className="flex items-center gap-2 text-xs font-semibold"
            >
              <Shield className="h-3.5 w-3.5" />
              Directives & Meta
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: SERP & SOCIAL PREVIEWS */}
          <TabsContent value="previews" className="space-y-4 pt-3">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <SerpPreview
                desktop={seoAnalysis?.previews?.googleSearchDesktop}
                mobile={seoAnalysis?.previews?.googleSearchMobile}
                slug={slug}
              />
              <SocialSharePreview
                twitter={seoAnalysis?.previews?.twitterCard}
                og={seoAnalysis?.previews?.openGraph}
              />
            </div>
          </TabsContent>

          {/* TAB 2: SEO DIAGNOSTICS & AUDIT */}
          <TabsContent value="diagnostics" className="space-y-4 pt-3">
            <SeoDiagnosticsCard seoAnalysis={seoAnalysis} />
          </TabsContent>

          {/* TAB 3: CRAWLER DIRECTIVES & META TAGS */}
          <TabsContent value="directives" className="space-y-4 pt-3">
            <div className="space-y-4 rounded-xl border border-border/80 bg-background/60 p-4 shadow-xs">
              <MetaTagsSection
                title={title}
                summary={summary}
                metaTitle={metaTitle}
                setMetaTitle={setMetaTitle}
                metaTitleError={metaTitleError}
                metaDescription={metaDescription}
                setMetaDescription={setMetaDescription}
                metaDescriptionError={metaDescriptionError}
              />

              <CrawlerDirectivesSection
                slug={slug}
                canonicalUrl={canonicalUrl}
                setCanonicalUrl={setCanonicalUrl}
                canonicalUrlError={canonicalUrlError}
                articleType={articleType}
                setArticleType={setArticleType}
                noIndex={noIndex}
                setNoIndex={setNoIndex}
                noFollow={noFollow}
                setNoFollow={setNoFollow}
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
