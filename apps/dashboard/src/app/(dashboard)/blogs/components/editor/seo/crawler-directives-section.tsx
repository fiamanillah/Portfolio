"use client"

import * as React from "react"
import { Globe, Shield, Code2, Sparkles } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { Switch } from "@workspace/ui/components/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { FieldError } from "@workspace/ui/components/field"
import type { BlogArticleType } from "@workspace/shared"

interface CrawlerDirectivesSectionProps {
  slug: string
  canonicalUrl: string
  setCanonicalUrl: (val: string) => void
  canonicalUrlError?: string
  articleType: BlogArticleType
  setArticleType: (val: BlogArticleType) => void
  noIndex: boolean
  setNoIndex: (val: boolean) => void
  noFollow: boolean
  setNoFollow: (val: boolean) => void
  onAutoFillCanonical?: () => void
}

export function CrawlerDirectivesSection({
  slug,
  canonicalUrl,
  setCanonicalUrl,
  canonicalUrlError,
  articleType,
  setArticleType,
  noIndex,
  setNoIndex,
  noFollow,
  setNoFollow,
  onAutoFillCanonical,
}: CrawlerDirectivesSectionProps) {
  const defaultCanonical = `https://fi.amanillah.com/blog/${slug || "post-slug"}`

  return (
    <div className="space-y-4 border-t border-border/80 pt-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Canonical URL */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
              <Globe className="h-3.5 w-3.5 text-primary" /> Canonical URL
            </label>
            {onAutoFillCanonical && (
              <button
                type="button"
                onClick={onAutoFillCanonical}
                className="flex items-center gap-1 font-mono text-[10px] text-primary hover:underline cursor-pointer"
              >
                <Sparkles className="h-2.5 w-2.5" /> Auto-Fill Default
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Input
              placeholder={defaultCanonical}
              value={canonicalUrl}
              onChange={(e) => setCanonicalUrl(e.target.value)}
              className={`h-9 bg-background font-mono text-xs shadow-xs transition-colors flex-1 ${
                canonicalUrlError
                  ? "border-destructive focus:border-destructive focus:ring-1 focus:ring-destructive/30"
                  : "border-border/90 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20"
              }`}
            />
            {onAutoFillCanonical && !canonicalUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAutoFillCanonical}
                className="h-9 px-2.5 text-xs text-muted-foreground hover:text-primary hover:border-primary/40 shrink-0"
                title="Populate standard canonical link"
              >
                Auto-fill
              </Button>
            )}
          </div>
          {canonicalUrlError && <FieldError errors={canonicalUrlError} />}
          <p className="text-[10px] text-muted-foreground">
            Specifies the preferred URL for search engines to prevent duplicate content indexing.
          </p>
        </div>

        {/* Schema.org Type */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
            <Code2 className="h-3.5 w-3.5 text-primary" /> Schema.org Article Type
          </label>
          <Select
            value={articleType}
            onValueChange={(val) => setArticleType(val as BlogArticleType)}
          >
            <SelectTrigger className="h-9 border-border/90 bg-background text-xs shadow-xs hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TechArticle">
                TechArticle (Recommended for Technical Guides & Code)
              </SelectItem>
              <SelectItem value="BlogPosting">
                BlogPosting (Standard Blog Article)
              </SelectItem>
              <SelectItem value="Article">
                Article (General Editorial)
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[10px] text-muted-foreground">
            Injected into Google Rich Snippet JSON-LD structured data graph.
          </p>
        </div>
      </div>

      {/* Crawler Switches */}
      <div className="grid grid-cols-1 gap-4 pt-1 sm:grid-cols-2">
        <div className="flex items-center justify-between rounded-lg border border-border/80 bg-background/80 p-3.5 transition-colors hover:bg-background">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Shield className="h-3.5 w-3.5 text-muted-foreground" /> Robots NoIndex
            </div>
            <div className="text-[11px] text-muted-foreground">
              Block search engines from indexing this URL
            </div>
          </div>
          <Switch checked={noIndex} onCheckedChange={setNoIndex} />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border/80 bg-background/80 p-3.5 transition-colors hover:bg-background">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Shield className="h-3.5 w-3.5 text-muted-foreground" /> Robots NoFollow
            </div>
            <div className="text-[11px] text-muted-foreground">
              Tell crawlers not to follow hyperlinks on this page
            </div>
          </div>
          <Switch checked={noFollow} onCheckedChange={setNoFollow} />
        </div>
      </div>
    </div>
  )
}
