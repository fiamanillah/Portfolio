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

  const displayTitle =
    currentPreview?.title || "Technical Guide Title | Fi Amanillah"
  const displaySnippet =
    currentPreview?.description ||
    "A production engineering breakdown of distributed system architecture and performance optimization."
  const displayUrl =
    currentPreview?.url || `${siteUrl}/blog/${slug || "article-slug"}`

  return (
    <div className="space-y-3 rounded-xl border border-border/80 bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
            <Globe className="h-3.5 w-3.5 text-primary" /> Google SERP Snippet
            Simulation
          </span>
          <p className="text-[11px] text-muted-foreground">
            How your article appears in Google search engine result pages.
          </p>
        </div>

        <div className="flex items-center rounded-lg border border-border bg-muted/60 p-0.5">
          <Button
            type="button"
            variant={device === "desktop" ? "secondary" : "ghost"}
            size="sm"
            className="h-6 gap-1 px-2 text-[11px]"
            onClick={() => setDevice("desktop")}
          >
            <Monitor className="h-3 w-3" /> Desktop
          </Button>
          <Button
            type="button"
            variant={device === "mobile" ? "secondary" : "ghost"}
            size="sm"
            className="h-6 gap-1 px-2 text-[11px]"
            onClick={() => setDevice("mobile")}
          >
            <Smartphone className="h-3 w-3" /> Mobile
          </Button>
        </div>
      </div>

      {/* Google Result Card Simulation */}
      <div
        className={`space-y-1.5 rounded-lg border bg-white p-4 font-sans text-[#4d5156] dark:bg-[#202124] dark:text-[#bdc1c6] ${
          device === "mobile" ? "mx-auto max-w-sm" : "w-full"
        }`}
      >
        {/* Favicon + Site Brand */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
            F
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[12px] font-medium text-[#202124] dark:text-[#dadce0]">
              Fi Amanillah
            </span>
            <span className="truncate text-[11px] text-[#4d5156] dark:text-[#bdc1c6]">
              {displayUrl}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="line-clamp-2 cursor-pointer text-base leading-snug font-medium text-[#1a0dab] hover:underline sm:text-lg dark:text-[#8ab4f8]">
          {displayTitle}
        </h3>

        {/* Snippet */}
        <p className="line-clamp-2 text-xs leading-relaxed text-[#4d5156] sm:text-sm dark:text-[#bdc1c6]">
          {displaySnippet}
        </p>
      </div>
    </div>
  )
}
