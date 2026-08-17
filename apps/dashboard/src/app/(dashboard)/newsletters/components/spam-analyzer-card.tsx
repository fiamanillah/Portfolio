// apps/dashboard/src/app/(dashboard)/newsletters/components/spam-analyzer-card.tsx
"use client";

import * as React from "react";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Sparkles,
  Info,
} from "lucide-react";
import type { NewsletterSpamReport } from "@workspace/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Progress } from "@workspace/ui/components/progress";

interface SpamAnalyzerCardProps {
  report: NewsletterSpamReport | null;
  isLoading?: boolean;
}

export function SpamAnalyzerCard({ report, isLoading }: SpamAnalyzerCardProps) {
  if (isLoading || !report) {
    return (
      <Card className="border-border/80 bg-card/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Deliverability & Anti-Spam Health
          </CardTitle>
          <CardDescription className="text-xs">
            Analyzing subject, preheader, content density, and RFC headers...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-16 w-full animate-pulse rounded bg-muted/60" />
        </CardContent>
      </Card>
    );
  }

  const { score, riskLevel, checks, summary, recommendations } = report;

  const riskColor =
    riskLevel === "LOW"
      ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/30"
      : riskLevel === "MEDIUM"
      ? "text-amber-500 bg-amber-500/10 border-amber-500/30"
      : "text-rose-500 bg-rose-500/10 border-rose-500/30";

  const progressColor =
    score >= 85
      ? "bg-emerald-500"
      : score >= 65
      ? "bg-amber-500"
      : "bg-rose-500";

  const RiskIcon =
    riskLevel === "LOW"
      ? ShieldCheck
      : riskLevel === "MEDIUM"
      ? ShieldAlert
      : ShieldX;

  return (
    <Card className="border-border/80 bg-card/60 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RiskIcon className="size-5 text-primary" />
            <CardTitle className="text-sm font-semibold">
              Deliverability & Spam Audit
            </CardTitle>
          </div>
          <Badge variant="outline" className={`font-mono text-xs ${riskColor}`}>
            {riskLevel} SPAM RISK
          </Badge>
        </div>
        <CardDescription className="text-xs leading-relaxed">
          {summary}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Score Bar */}
        <div className="space-y-1.5 rounded-lg border border-border/60 bg-muted/30 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">
              Inbox Deliverability Score
            </span>
            <span className="font-mono text-sm font-bold text-foreground">
              {score} / 100
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${score}%` }}
            />
          </div>
          <div className="flex justify-between pt-0.5 text-[10px] text-muted-foreground">
            <span>High Risk (&lt;65)</span>
            <span>Moderate (65-84)</span>
            <span>Excellent (85-100)</span>
          </div>
        </div>

        {/* Actionable Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <Sparkles className="size-3.5" />
              <span>Deliverability Recommendations</span>
            </div>
            <ul className="space-y-1 pl-4 text-xs text-muted-foreground list-disc">
              {recommendations.map((rec, i) => (
                <li key={i} className="leading-relaxed">
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Rule Checks Breakdown */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-foreground">
            Rule-by-Rule Audit Breakdown
          </div>
          <div className="space-y-1.5">
            {checks.map((check) => {
              return (
                <div
                  key={check.id}
                  className="flex items-start justify-between gap-2 rounded-md border border-border/40 bg-background/50 p-2 text-xs"
                >
                  <div className="flex items-start gap-2">
                    {check.passed ? (
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
                    )}
                    <div>
                      <div className="font-medium text-foreground">
                        {check.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {check.message}
                      </div>
                    </div>
                  </div>

                  {check.scorePenalty > 0 && (
                    <Badge
                      variant="outline"
                      className="border-rose-500/30 bg-rose-500/10 font-mono text-[10px] text-rose-500"
                    >
                      -{check.scorePenalty} pts
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
