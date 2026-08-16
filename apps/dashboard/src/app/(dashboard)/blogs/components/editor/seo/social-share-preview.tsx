"use client"

import * as React from "react"
import { Share2, Globe } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import type { SeoAnalysisResult } from "@workspace/shared"

interface SocialSharePreviewProps {
  twitter?: SeoAnalysisResult["previews"]["twitterCard"]
  og?: SeoAnalysisResult["previews"]["openGraph"]
  siteUrl?: string
}

export function SocialSharePreview({
  twitter,
  og,
  siteUrl = "fi.amanillah.com",
}: SocialSharePreviewProps) {
  const [platform, setPlatform] = React.useState<"twitter" | "og">("twitter")

  const host = siteUrl.replace(/^https?:\/\//, "")

  return (
    <div className="space-y-3 p-4 rounded-xl border border-border/80 bg-card">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Share2 className="h-3.5 w-3.5 text-primary" /> Social Share Card Simulation
          </span>
          <p className="text-[11px] text-muted-foreground">
            Preview how your article looks when shared on Twitter/X, LinkedIn, and Facebook.
          </p>
        </div>

        <Tabs value={platform} onValueChange={(v) => setPlatform(v as any)} className="w-auto">
          <TabsList className="h-7 bg-muted/60 p-0.5 border border-border">
            <TabsTrigger value="twitter" className="text-[11px] h-6 px-2.5">
              Twitter / X
            </TabsTrigger>
            <TabsTrigger value="og" className="text-[11px] h-6 px-2.5">
              OpenGraph / LinkedIn
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {platform === "twitter" && (
        <div className="max-w-md mx-auto rounded-2xl overflow-hidden border border-border/80 bg-card shadow-sm">
          {twitter?.image && (
            <div className="aspect-[2/1] w-full overflow-hidden bg-muted/40 border-b border-border/60">
              <img src={twitter.image} alt="Twitter card preview" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-3.5 space-y-1">
            <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
              <Globe className="h-3 w-3" /> {host}
            </span>
            <div className="font-bold text-sm text-foreground line-clamp-1 leading-snug">
              {twitter?.title || "Article Title for Twitter"}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {twitter?.description || "Article snippet summary displayed on social timeline."}
            </p>
          </div>
        </div>
      )}

      {platform === "og" && (
        <div className="max-w-md mx-auto rounded-lg overflow-hidden border border-border/80 bg-card shadow-sm">
          {og?.image && (
            <div className="aspect-[1.91/1] w-full overflow-hidden bg-muted/40 border-b border-border/60">
              <img src={og.image} alt="OG card preview" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-3.5 space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
              {host}
            </span>
            <div className="font-bold text-sm text-foreground line-clamp-2 leading-snug">
              {og?.title || "Article Title for OpenGraph"}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {og?.description || "Article snippet summary displayed on OpenGraph feeds."}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
