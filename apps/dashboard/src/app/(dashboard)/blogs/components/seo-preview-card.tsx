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
  const [tab, setTab] = React.useState<"google" | "twitter" | "og" | "jsonld">("google")

  if (!seoAnalysis) {
    return (
      <div className="p-8 text-center rounded-xl border border-dashed text-xs text-muted-foreground">
        Enter title and summary to generate real-time SERP previews and SEO diagnostic health checks.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* SEO Health Score Banner */}
      <div className="p-4 rounded-xl border border-border bg-card flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className={`flex items-center justify-center h-12 w-12 rounded-full border-4 font-bold text-base ${
              seoAnalysis.score >= 90
                ? "border-emerald-500 text-emerald-500 bg-emerald-500/10"
                : seoAnalysis.score >= 75
                ? "border-amber-500 text-amber-500 bg-amber-500/10"
                : "border-rose-500 text-rose-500 bg-rose-500/10"
            }`}
          >
            {seoAnalysis.score}
          </div>
          <div>
            <div className="text-sm font-bold">SEO Health Score: {seoAnalysis.rating}</div>
            <div className="text-xs text-muted-foreground">
              Evaluated against Google SERP snippets, OpenGraph protocols, and Schema.org rules
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
                  ? "text-emerald-500 border-emerald-500/30"
                  : check.level === "warning"
                  ? "text-amber-500 border-amber-500/30"
                  : "text-rose-500 border-rose-500/30"
              }`}
            >
              {check.title}
            </Badge>
          ))}
        </div>
      </div>

      {/* Diagnostics Checklist */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Diagnostic Checks ({seoAnalysis.checks.length})
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {seoAnalysis.checks.map((check, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg border text-xs space-y-1 ${
                check.level === "pass"
                  ? "border-emerald-500/30 bg-emerald-500/5 text-foreground"
                  : check.level === "warning"
                  ? "border-amber-500/30 bg-amber-500/5 text-foreground"
                  : "border-rose-500/30 bg-rose-500/5 text-foreground"
              }`}
            >
              <div className="font-semibold flex items-center gap-1.5">
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
              <p className="text-muted-foreground text-[11px]">{check.message}</p>
              {check.recommendation && (
                <p className="text-primary font-medium text-[11px] pt-0.5">
                  Tip: {check.recommendation}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Simulator Tabs */}
      <div className="space-y-3 pt-2 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" /> Interactive SERP & Social Previews
          </span>
          <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border text-xs">
            <button
              type="button"
              onClick={() => setTab("google")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                tab === "google" ? "bg-background text-foreground font-semibold shadow-xs" : "text-muted-foreground"
              }`}
            >
              Google SERP
            </button>
            <button
              type="button"
              onClick={() => setTab("twitter")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                tab === "twitter" ? "bg-background text-foreground font-semibold shadow-xs" : "text-muted-foreground"
              }`}
            >
              Twitter / X
            </button>
            <button
              type="button"
              onClick={() => setTab("og")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                tab === "og" ? "bg-background text-foreground font-semibold shadow-xs" : "text-muted-foreground"
              }`}
            >
              OpenGraph
            </button>
            <button
              type="button"
              onClick={() => setTab("jsonld")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                tab === "jsonld" ? "bg-background text-foreground font-semibold shadow-xs" : "text-muted-foreground"
              }`}
            >
              JSON-LD
            </button>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border/80 bg-muted/20">
          {tab === "google" && (
            <div className="p-4 rounded-xl border border-border/80 bg-white text-black dark:bg-[#202124] dark:text-[#e8eaed] space-y-1 font-sans max-w-2xl">
              <div className="text-[12px] text-[#4d5156] dark:text-[#bdc1c6] flex items-center gap-1">
                <span>fi.amanillah.com</span>
                <span>›</span>
                <span>blog</span>
                <span>›</span>
                <span>{slug || "post-slug"}</span>
              </div>
              <div className="text-[18px] text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer font-medium leading-snug">
                {seoAnalysis.previews.googleSearchDesktop.title}
              </div>
              <div className="text-[13px] text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed line-clamp-2">
                {seoAnalysis.previews.googleSearchDesktop.description}
              </div>
            </div>
          )}

          {tab === "twitter" && (
            <div className="rounded-xl border border-border overflow-hidden bg-card max-w-md">
              {seoAnalysis.previews.twitterCard.image && (
                <div className="aspect-[1.91/1] bg-muted relative overflow-hidden">
                  <img
                    src={seoAnalysis.previews.twitterCard.image}
                    alt="Twitter Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-3.5 space-y-1">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">
                  fi.amanillah.com
                </div>
                <div className="text-sm font-bold text-foreground line-clamp-1">
                  {seoAnalysis.previews.twitterCard.title}
                </div>
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {seoAnalysis.previews.twitterCard.description}
                </div>
              </div>
            </div>
          )}

          {tab === "og" && (
            <div className="rounded-xl border border-border overflow-hidden bg-card max-w-md">
              {seoAnalysis.previews.openGraph.image && (
                <div className="aspect-[1.91/1] bg-muted relative overflow-hidden">
                  <img
                    src={seoAnalysis.previews.openGraph.image}
                    alt="OG Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-3.5 space-y-1 bg-muted/40">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">
                  FI.AMANILLAH.COM
                </div>
                <div className="text-sm font-bold text-foreground line-clamp-1">
                  {seoAnalysis.previews.openGraph.title}
                </div>
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {seoAnalysis.previews.openGraph.description}
                </div>
              </div>
            </div>
          )}

          {tab === "jsonld" && (
            <div className="p-3 rounded-lg bg-[#0d1117] text-[#e6edf3] font-mono text-xs overflow-x-auto max-h-60">
              <pre>{JSON.stringify(seoAnalysis.previews.jsonLd, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
