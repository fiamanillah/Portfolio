"use client"

import * as React from "react"
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lightbulb,
} from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import type { SeoAnalysisResult } from "@workspace/shared"

interface SeoDiagnosticsCardProps {
  seoAnalysis: SeoAnalysisResult | null
}

export function SeoDiagnosticsCard({ seoAnalysis }: SeoDiagnosticsCardProps) {
  if (!seoAnalysis) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/10 p-8 text-center text-xs text-muted-foreground italic">
        Enter article title and summary to generate real-time SEO health score
        and Google SERP diagnostics.
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
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-full border-4 font-mono text-lg font-extrabold ${scoreColor}`}
          >
            {seoAnalysis.score}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-sm font-bold">
              <span>SEO Health: {seoAnalysis.rating}</span>
              <Badge
                variant="outline"
                className={`font-mono text-[10px] uppercase ${
                  seoAnalysis.score >= 85
                    ? "border-emerald-500/30 text-emerald-500"
                    : "border-amber-500/30 text-amber-500"
                }`}
              >
                {seoAnalysis.score}/100 Score
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Evaluated against Google SERP snippets, OpenGraph protocols, and
              Schema.org rules.
            </p>
          </div>
        </div>

        {/* Quick summary badges */}
        <div className="flex flex-wrap gap-1.5">
          {seoAnalysis.checks.slice(0, 3).map((check, i) => (
            <Badge
              key={i}
              variant="outline"
              className={`font-mono text-[11px] ${
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
        <span className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> Diagnostic Checks (
          {seoAnalysis.checks.length})
        </span>

        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
          {seoAnalysis.checks.map((check, i) => (
            <div
              key={i}
              className={`space-y-1.5 rounded-lg border p-3 text-xs ${
                check.level === "pass"
                  ? "border-emerald-500/30 bg-emerald-500/5 text-foreground"
                  : check.level === "warning"
                    ? "border-amber-500/30 bg-amber-500/5 text-foreground"
                    : "border-rose-500/30 bg-rose-500/5 text-foreground"
              }`}
            >
              <div className="flex items-center justify-between font-semibold">
                <span className="flex items-center gap-1.5">
                  {check.level === "pass" ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  ) : check.level === "warning" ? (
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 shrink-0 text-rose-500" />
                  )}
                  {check.title}
                </span>
                <Badge
                  variant="outline"
                  className={`h-4 px-1 py-0 font-mono text-[9px] uppercase ${
                    check.level === "pass"
                      ? "border-emerald-500/30 text-emerald-500"
                      : check.level === "warning"
                        ? "border-amber-500/30 text-amber-500"
                        : "border-rose-500/30 text-rose-500"
                  }`}
                >
                  {check.level}
                </Badge>
              </div>

              <p className="text-[11px] leading-relaxed text-muted-foreground">
                {check.message}
              </p>

              {check.recommendation && (
                <div className="flex items-start gap-1 pt-1 text-[11px] font-medium text-primary">
                  <Lightbulb className="mt-0.5 h-3 w-3 shrink-0" />
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
