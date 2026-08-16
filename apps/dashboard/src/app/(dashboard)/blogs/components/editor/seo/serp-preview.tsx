"use client"

import * as React from "react"
import { Globe, Smartphone, Monitor } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import type { SeoAnalysisResult } from "@workspace/shared"

interface SerpPreviewProps {
  desktop?: SeoAnalysisResult["previews"]["googleSearchDesktop"]
  mobile?: SeoAnalysisResult["previews"]["googleSearchMobile"]
  slug: string
  siteUrl?: string
}

export function SerpPreview({
  desktop,
  mobile,
  slug,
  siteUrl = "https://fi.amanillah.com",
}: SerpPreviewProps) {
  const [device, setDevice] = React.useState<"desktop" | "mobile">("desktop")

  const currentPreview = device === "desktop" ? desktop : mobile

  const displayTitle = currentPreview?.title || "Technical Guide Title | Fi Amanillah"
  const displaySnippet =
    currentPreview?.description ||
    "A production engineering breakdown of distributed system architecture and performance optimization."
  const displayUrl = currentPreview?.url || `${siteUrl}/blog/${slug || "article-slug"}`

  return (
    <div className="space-y-3 p-4 rounded-xl border border-border/80 bg-card">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-primary" /> Google SERP Snippet Simulation
          </span>
          <p className="text-[11px] text-muted-foreground">
            How your article appears in Google search engine result pages.
          </p>
        </div>

        <div className="flex items-center bg-muted/60 rounded-lg p-0.5 border border-border">
          <Button
            type="button"
            variant={device === "desktop" ? "secondary" : "ghost"}
            size="sm"
            className="h-6 text-[11px] px-2 gap-1"
            onClick={() => setDevice("desktop")}
          >
            <Monitor className="h-3 w-3" /> Desktop
          </Button>
          <Button
            type="button"
            variant={device === "mobile" ? "secondary" : "ghost"}
            size="sm"
            className="h-6 text-[11px] px-2 gap-1"
            onClick={() => setDevice("mobile")}
          >
            <Smartphone className="h-3 w-3" /> Mobile
          </Button>
        </div>
      </div>

      {/* Google Result Card Simulation */}
      <div
        className={`p-4 rounded-lg border bg-white dark:bg-[#202124] text-[#4d5156] dark:text-[#bdc1c6] space-y-1.5 font-sans ${
          device === "mobile" ? "max-w-sm mx-auto" : "w-full"
        }`}
      >
        {/* Favicon + Site Brand */}
        <div className="flex items-center gap-2 text-xs">
          <div className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] text-white font-bold">
            F
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[12px] font-medium text-[#202124] dark:text-[#dadce0]">
              Fi Amanillah
            </span>
            <span className="text-[11px] text-[#4d5156] dark:text-[#bdc1c6] truncate">
              {displayUrl}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-medium text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer leading-snug line-clamp-2">
          {displayTitle}
        </h3>

        {/* Snippet */}
        <p className="text-xs sm:text-sm text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed line-clamp-2">
          {displaySnippet}
        </p>
      </div>
    </div>
  )
}
