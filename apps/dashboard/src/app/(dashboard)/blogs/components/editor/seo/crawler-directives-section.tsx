"use client"

import * as React from "react"
import { Globe, Shield, Code2 } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Switch } from "@workspace/ui/components/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import type { BlogArticleType } from "@workspace/shared"

interface CrawlerDirectivesSectionProps {
  slug: string
  canonicalUrl: string
  setCanonicalUrl: (val: string) => void
  articleType: BlogArticleType
  setArticleType: (val: BlogArticleType) => void
  noIndex: boolean
  setNoIndex: (val: boolean) => void
  noFollow: boolean
  setNoFollow: (val: boolean) => void
}

export function CrawlerDirectivesSection({
  slug,
  canonicalUrl,
  setCanonicalUrl,
  articleType,
  setArticleType,
  noIndex,
  setNoIndex,
  noFollow,
  setNoFollow,
}: CrawlerDirectivesSectionProps) {
  return (
    <div className="space-y-4 pt-4 border-t border-border/80">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Canonical URL */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-primary" /> Canonical URL
          </label>
          <Input
            placeholder={`https://fi.amanillah.com/blog/${slug || "post-slug"}`}
            value={canonicalUrl}
            onChange={(e) => setCanonicalUrl(e.target.value)}
            className="font-mono text-xs h-9 bg-background border-border/90 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-xs"
          />
        </div>

        {/* Schema.org Type */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Code2 className="h-3.5 w-3.5 text-primary" /> Schema.org Article Type
          </label>
          <Select
            value={articleType}
            onValueChange={(val) => setArticleType(val as BlogArticleType)}
          >
            <SelectTrigger className="text-xs h-9 bg-background border-border/90 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TechArticle">TechArticle (Recommended for Technical Guides)</SelectItem>
              <SelectItem value="BlogPosting">BlogPosting (Standard Blog Article)</SelectItem>
              <SelectItem value="Article">Article (General Editorial)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Crawler Switches */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        <div className="flex items-center justify-between p-3.5 rounded-lg border border-border/80 bg-background/80 hover:bg-background transition-colors">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-muted-foreground" /> Robots NoIndex
            </div>
            <div className="text-[11px] text-muted-foreground">Block search engines from indexing this URL</div>
          </div>
          <Switch checked={noIndex} onCheckedChange={setNoIndex} />
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-lg border border-border/80 bg-background/80 hover:bg-background transition-colors">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-muted-foreground" /> Robots NoFollow
            </div>
            <div className="text-[11px] text-muted-foreground">Tell crawlers not to follow hyperlinks on this page</div>
          </div>
          <Switch checked={noFollow} onCheckedChange={setNoFollow} />
        </div>
      </div>
    </div>
  )
}
