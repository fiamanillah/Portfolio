"use client"

import * as React from "react"
import { Eye, Search, Share2, Code2, Globe } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import type { SeoAnalysisResult } from "@workspace/shared"

interface SeoPreviewCardProps {
  seoAnalysis: SeoAnalysisResult | null
  slug: string
}

export function SeoPreviewCard({ seoAnalysis, slug }: SeoPreviewCardProps) {
  const [tab, setTab] = React.useState<"google" | "twitter" | "og" | "jsonld">(
    "google"
  )

  if (!seoAnalysis) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-xs text-muted-foreground">
        Enter title and summary to generate real-time SERP previews and SEO
        diagnostic health checks.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* SEO Health Score Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3.5">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full border-4 text-base font-bold ${
              seoAnalysis.score >= 90
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
                : seoAnalysis.score >= 75
                  ? "border-amber-500 bg-amber-500/10 text-amber-500"
                  : "border-rose-500 bg-rose-500/10 text-rose-500"
            }`}
          >
            {seoAnalysis.score}
          </div>
          <div>
            <div className="text-sm font-bold">
              SEO Health Score: {seoAnalysis.rating}
            </div>
            <div className="text-xs text-muted-foreground">
              Evaluated against Google SERP snippets, OpenGraph protocols, and
              Schema.org rules
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {seoAnalysis.checks.slice(0, 3).map((check, i) => (
            <Badge
              key={i}
              variant="outline"
              className={`text-[11px] ${
                check.level === "pass"
                  ? "border-emerald-500/30 text-emerald-500"
                  : check.level === "warning"
                    ? "border-amber-500/30 text-amber-500"
                    : "border-rose-500/30 text-rose-500"
              }`}
            >
              {check.title}
            </Badge>
          ))}
        </div>
      </div>

      {/* Diagnostics Checklist */}
      <div className="space-y-2">
        <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
          Diagnostic Checks ({seoAnalysis.checks.length})
        </span>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {seoAnalysis.checks.map((check, i) => (
            <div
              key={i}
              className={`space-y-1 rounded-lg border p-3 text-xs ${
                check.level === "pass"
                  ? "border-emerald-500/30 bg-emerald-500/5 text-foreground"
                  : check.level === "warning"
                    ? "border-amber-500/30 bg-amber-500/5 text-foreground"
                    : "border-rose-500/30 bg-rose-500/5 text-foreground"
              }`}
            >
              <div className="flex items-center gap-1.5 font-semibold">
                <span
                  className={`h-2 w-2 rounded-full ${
                    check.level === "pass"
                      ? "bg-emerald-500"
                      : check.level === "warning"
                        ? "bg-amber-500"
                        : "bg-rose-500"
                  }`}
                />
                {check.title}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {check.message}
              </p>
              {check.recommendation && (
                <p className="pt-0.5 text-[11px] font-medium text-primary">
                  Tip: {check.recommendation}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Simulator Tabs */}
      <div className="space-y-3 border-t border-border pt-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-primary uppercase">
            <Eye className="h-3.5 w-3.5" /> Interactive SERP & Social Previews
          </span>
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/60 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setTab("google")}
              className={`rounded-md px-2.5 py-1 transition-colors ${
                tab === "google"
                  ? "bg-background font-semibold text-foreground shadow-xs"
                  : "text-muted-foreground"
              }`}
            >
              Google SERP
            </button>
            <button
              type="button"
              onClick={() => setTab("twitter")}
              className={`rounded-md px-2.5 py-1 transition-colors ${
                tab === "twitter"
                  ? "bg-background font-semibold text-foreground shadow-xs"
                  : "text-muted-foreground"
              }`}
            >
              Twitter / X
            </button>
            <button
              type="button"
              onClick={() => setTab("og")}
              className={`rounded-md px-2.5 py-1 transition-colors ${
                tab === "og"
                  ? "bg-background font-semibold text-foreground shadow-xs"
                  : "text-muted-foreground"
              }`}
            >
              OpenGraph
            </button>
            <button
              type="button"
              onClick={() => setTab("jsonld")}
              className={`rounded-md px-2.5 py-1 transition-colors ${
                tab === "jsonld"
                  ? "bg-background font-semibold text-foreground shadow-xs"
                  : "text-muted-foreground"
              }`}
            >
              JSON-LD
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-muted/20 p-4">
          {tab === "google" && (
            <div className="max-w-2xl space-y-1 rounded-xl border border-border/80 bg-white p-4 font-sans text-black dark:bg-[#202124] dark:text-[#e8eaed]">
              <div className="flex items-center gap-1 text-[12px] text-[#4d5156] dark:text-[#bdc1c6]">
                <span>fi.amanillah.com</span>
                <span>›</span>
                <span>blog</span>
                <span>›</span>
                <span>{slug || "post-slug"}</span>
              </div>
              <div className="cursor-pointer text-[18px] leading-snug font-medium text-[#1a0dab] hover:underline dark:text-[#8ab4f8]">
                {seoAnalysis.previews.googleSearchDesktop.title}
              </div>
              <div className="line-clamp-2 text-[13px] leading-relaxed text-[#4d5156] dark:text-[#bdc1c6]">
                {seoAnalysis.previews.googleSearchDesktop.description}
              </div>
            </div>
          )}

          {tab === "twitter" && (
            <div className="max-w-md overflow-hidden rounded-xl border border-border bg-card">
              {seoAnalysis.previews.twitterCard.image && (
                <div className="relative aspect-[1.91/1] overflow-hidden bg-muted">
                  <img
                    src={seoAnalysis.previews.twitterCard.image}
                    alt="Twitter Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="space-y-1 p-3.5">
                <div className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                  fi.amanillah.com
                </div>
                <div className="line-clamp-1 text-sm font-bold text-foreground">
                  {seoAnalysis.previews.twitterCard.title}
                </div>
                <div className="line-clamp-2 text-xs text-muted-foreground">
                  {seoAnalysis.previews.twitterCard.description}
                </div>
              </div>
            </div>
          )}

          {tab === "og" && (
            <div className="max-w-md overflow-hidden rounded-xl border border-border bg-card">
              {seoAnalysis.previews.openGraph.image && (
                <div className="relative aspect-[1.91/1] overflow-hidden bg-muted">
                  <img
                    src={seoAnalysis.previews.openGraph.image}
                    alt="OG Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="space-y-1 bg-muted/40 p-3.5">
                <div className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                  FI.AMANILLAH.COM
                </div>
                <div className="line-clamp-1 text-sm font-bold text-foreground">
                  {seoAnalysis.previews.openGraph.title}
                </div>
                <div className="line-clamp-2 text-xs text-muted-foreground">
                  {seoAnalysis.previews.openGraph.description}
                </div>
              </div>
            </div>
          )}

          {tab === "jsonld" && (
            <div className="max-h-60 overflow-x-auto rounded-lg bg-[#0d1117] p-3 font-mono text-xs text-[#e6edf3]">
              <pre>{JSON.stringify(seoAnalysis.previews.jsonLd, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
