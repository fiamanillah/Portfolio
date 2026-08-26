"use client"

import * as React from "react"
import { Share2, Globe } from "lucide-react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
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
    <div className="space-y-3 rounded-xl border border-border/80 bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
            <Share2 className="h-3.5 w-3.5 text-primary" /> Social Share Card
            Simulation
          </span>
          <p className="text-[11px] text-muted-foreground">
            Preview how your article looks when shared on Twitter/X, LinkedIn,
            and Facebook.
          </p>
        </div>

        <Tabs
          value={platform}
          onValueChange={(v) => setPlatform(v as "twitter" | "og")}
          className="w-auto"
        >
          <TabsList className="h-7 border border-border bg-muted/60 p-0.5">
            <TabsTrigger value="twitter" className="h-6 px-2.5 text-[11px]">
              Twitter / X
            </TabsTrigger>
            <TabsTrigger value="og" className="h-6 px-2.5 text-[11px]">
              OpenGraph / LinkedIn
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {platform === "twitter" && (
        <div className="mx-auto max-w-md overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
          {twitter?.image && (
            <div className="aspect-[2/1] w-full overflow-hidden border-b border-border/60 bg-muted/40">
              <img
                src={twitter.image}
                alt="Twitter card preview"
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="space-y-1 p-3.5">
            <span className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
              <Globe className="h-3 w-3" /> {host}
            </span>
            <div className="line-clamp-1 text-sm leading-snug font-bold text-foreground">
              {twitter?.title || "Article Title for Twitter"}
            </div>
            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {twitter?.description ||
                "Article snippet summary displayed on social timeline."}
            </p>
          </div>
        </div>
      )}

      {platform === "og" && (
        <div className="mx-auto max-w-md overflow-hidden rounded-lg border border-border/80 bg-card shadow-sm">
          {og?.image && (
            <div className="aspect-[1.91/1] w-full overflow-hidden border-b border-border/60 bg-muted/40">
              <img
                src={og.image}
                alt="OG card preview"
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="space-y-1 p-3.5">
            <span className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
              {host}
            </span>
            <div className="line-clamp-2 text-sm leading-snug font-bold text-foreground">
              {og?.title || "Article Title for OpenGraph"}
            </div>
            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {og?.description ||
                "Article snippet summary displayed on OpenGraph feeds."}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
