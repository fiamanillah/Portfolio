"use client"

import * as React from "react"
import { Sparkles, CheckCircle2, AlertTriangle, XCircle, Lightbulb } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import type { SeoAnalysisResult } from "@workspace/shared"

interface SeoDiagnosticsCardProps {
  seoAnalysis: SeoAnalysisResult | null
}

export function SeoDiagnosticsCard({ seoAnalysis }: SeoDiagnosticsCardProps) {
  if (!seoAnalysis) {
    return (
      <div className="p-8 text-center rounded-xl border border-dashed border-border bg-muted/10 text-xs text-muted-foreground italic">
        Enter article title and summary to generate real-time SEO health score and Google SERP diagnostics.
      </div>
    )
  }

  const scoreColor =
    seoAnalysis.score >= 90
      ? "text-emerald-500 border-emerald-500 bg-emerald-500/10"
      : seoAnalysis.score >= 75
      ? "text-amber-500 border-amber-500 bg-amber-500/10"
      : "text-rose-500 border-rose-500 bg-rose-500/10"

  return (
    <div className="space-y-4">
      {/* Score Header Card */}
      <div className="p-4 rounded-xl border border-border bg-card flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center justify-center h-14 w-14 rounded-full border-4 font-extrabold text-lg font-mono ${scoreColor}`}
          >
            {seoAnalysis.score}
          </div>
          <div className="space-y-0.5">
            <div className="text-sm font-bold flex items-center gap-2">
              <span>SEO Health: {seoAnalysis.rating}</span>
              <Badge
                variant="outline"
                className={`text-[10px] uppercase font-mono ${
                  seoAnalysis.score >= 85
                    ? "text-emerald-500 border-emerald-500/30"
                    : "text-amber-500 border-amber-500/30"
                }`}
              >
                {seoAnalysis.score}/100 Score
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Evaluated against Google SERP snippets, OpenGraph protocols, and Schema.org rules.
            </p>
          </div>
        </div>

        {/* Quick summary badges */}
        <div className="flex flex-wrap gap-1.5">
          {seoAnalysis.checks.slice(0, 3).map((check, i) => (
            <Badge
              key={i}
              variant="outline"
              className={`text-[11px] font-mono ${
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
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> Diagnostic Checks ({seoAnalysis.checks.length})
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {seoAnalysis.checks.map((check, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                check.level === "pass"
                  ? "border-emerald-500/30 bg-emerald-500/5 text-foreground"
                  : check.level === "warning"
                  ? "border-amber-500/30 bg-amber-500/5 text-foreground"
                  : "border-rose-500/30 bg-rose-500/5 text-foreground"
              }`}
            >
              <div className="font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  {check.level === "pass" ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  ) : check.level === "warning" ? (
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                  )}
                  {check.title}
                </span>
                <Badge
                  variant="outline"
                  className={`text-[9px] uppercase font-mono px-1 py-0 h-4 ${
                    check.level === "pass"
                      ? "text-emerald-500 border-emerald-500/30"
                      : check.level === "warning"
                      ? "text-amber-500 border-amber-500/30"
                      : "text-rose-500 border-rose-500/30"
                  }`}
                >
                  {check.level}
                </Badge>
              </div>

              <p className="text-muted-foreground text-[11px] leading-relaxed">{check.message}</p>

              {check.recommendation && (
                <div className="flex items-start gap-1 pt-1 text-primary font-medium text-[11px]">
                  <Lightbulb className="h-3 w-3 shrink-0 mt-0.5" />
                  <span>{check.recommendation}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
