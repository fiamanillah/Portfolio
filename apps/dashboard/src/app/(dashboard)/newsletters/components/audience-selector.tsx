// apps/dashboard/src/app/(dashboard)/newsletters/components/audience-selector.tsx
"use client";

import * as React from "react";
import {
  Users,
  Filter,
  UserPlus,
  UserX,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import type {
  AudienceType,
  RecipientCalculationResult,
} from "@workspace/shared";
import { NewsletterApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card";
import { Label } from "@workspace/ui/components/label";
import { Badge } from "@workspace/ui/components/badge";
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Textarea } from "@workspace/ui/components/textarea";
import { Button } from "@workspace/ui/components/button";

const AVAILABLE_SOURCES = [
  { id: "hero_section", label: "Hero Subscription Form" },
  { id: "blog_post", label: "Blog Post Newsletter Box" },
  { id: "newsletter_modal", label: "Exit/Slide-in Modal" },
  { id: "admin_portal", label: "Admin Manual Registration" },
  { id: "api_docs", label: "API & Developers" },
  { id: "project_showcase", label: "Case Studies & Projects" },
];

interface AudienceSelectorProps {
  targetAudience: AudienceType;
  onChangeTargetAudience: (val: AudienceType) => void;
  includedSources: string[];
  onChangeIncludedSources: (sources: string[]) => void;
  includedEmails: string[];
  onChangeIncludedEmails: (emails: string[]) => void;
  excludedEmails: string[];
  onChangeExcludedEmails: (emails: string[]) => void;
  excludedSources: string[];
  onChangeExcludedSources: (sources: string[]) => void;
}

export function AudienceSelector({
  targetAudience,
  onChangeTargetAudience,
  includedSources,
  onChangeIncludedSources,
  includedEmails,
  onChangeIncludedEmails,
  excludedEmails,
  onChangeExcludedEmails,
  excludedSources,
  onChangeExcludedSources,
}: AudienceSelectorProps) {
  const [includeText, setIncludeText] = React.useState(
    includedEmails.join("\n")
  );
  const [excludeText, setExcludeText] = React.useState(
    excludedEmails.join("\n")
  );
  const [calcResult, setCalcResult] =
    React.useState<RecipientCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = React.useState(false);

  // Sync state if props change externally
  React.useEffect(() => {
    setIncludeText(includedEmails.join("\n"));
  }, [includedEmails]);

  React.useEffect(() => {
    setExcludeText(excludedEmails.join("\n"));
  }, [excludedEmails]);

  // Recipient calculation call
  const calculate = React.useCallback(async () => {
    try {
      setIsCalculating(true);
      const res = await NewsletterApi.calculateRecipients({
        targetAudience,
        includedSources,
        includedEmails,
        excludedEmails,
        excludedSources,
      });

      if (res.success && res.data) {
        setCalcResult(res.data);
      }
    } catch {
      // ignore
    } finally {
      setIsCalculating(false);
    }
  }, [
    targetAudience,
    includedSources,
    includedEmails,
    excludedEmails,
    excludedSources,
  ]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      calculate();
    }, 400);
    return () => clearTimeout(timer);
  }, [calculate]);

  const handleIncludeTextBlur = () => {
    const parsed = includeText
      .split(/[\n,]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.includes("@"));
    onChangeIncludedEmails(Array.from(new Set(parsed)));
  };

  const handleExcludeTextBlur = () => {
    const parsed = excludeText
      .split(/[\n,]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.includes("@"));
    onChangeExcludedEmails(Array.from(new Set(parsed)));
  };

  const toggleSource = (sourceId: string) => {
    if (includedSources.includes(sourceId)) {
      onChangeIncludedSources(includedSources.filter((s) => s !== sourceId));
    } else {
      onChangeIncludedSources([...includedSources, sourceId]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Recipient Summary Badge Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  Target Recipient Pool:
                </span>
                <span className="font-mono text-base font-bold text-primary">
                  {isCalculating
                    ? "Calculating..."
                    : `${calcResult?.totalCount ?? 0} Recipients`}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {calcResult
                  ? `Active Subscribers: ${calcResult.totalSubscribers} • Custom Inclusions: +${calcResult.includedCustomCount} • Subtracted Exclusions: -${calcResult.excludedCount}`
                  : "Resolving audience segment..."}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={calculate}
            disabled={isCalculating}
            className="h-8 gap-1.5 text-xs self-start sm:self-center"
          >
            <RefreshCw
              className={`size-3 ${isCalculating ? "animate-spin" : ""}`}
            />
            Recalculate
          </Button>
        </CardContent>
      </Card>

      {/* Target Audience Scope Selector */}
      <Card className="border-border/80 bg-card/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            1. Target Audience Scope
          </CardTitle>
          <CardDescription className="text-xs">
            Choose whether to broadcast to all confirmed subscribers or filter
            by acquisition channels.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <RadioGroup
            value={targetAudience}
            onValueChange={(val) => onChangeTargetAudience(val as AudienceType)}
            className="grid gap-3 sm:grid-cols-3"
          >
            <Label
              htmlFor="aud-all"
              className="flex cursor-pointer flex-col gap-1.5 rounded-lg border border-border p-3 hover:border-primary data-[state=checked]:border-primary data-[state=checked]:bg-primary/5"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-foreground">
                  All Subscribers
                </span>
                <RadioGroupItem value="ALL" id="aud-all" />
              </div>
              <span className="text-[11px] text-muted-foreground font-normal leading-relaxed">
                Broadcast to all active, confirmed double opt-in subscribers.
              </span>
            </Label>

            <Label
              htmlFor="aud-segment"
              className="flex cursor-pointer flex-col gap-1.5 rounded-lg border border-border p-3 hover:border-primary data-[state=checked]:border-primary data-[state=checked]:bg-primary/5"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-foreground">
                  Channel Segment
                </span>
                <RadioGroupItem value="SEGMENT" id="aud-segment" />
              </div>
              <span className="text-[11px] text-muted-foreground font-normal leading-relaxed">
                Filter subscribers by specific signup locations or forms.
              </span>
            </Label>

            <Label
              htmlFor="aud-custom"
              className="flex cursor-pointer flex-col gap-1.5 rounded-lg border border-border p-3 hover:border-primary data-[state=checked]:border-primary data-[state=checked]:bg-primary/5"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-foreground">
                  Explicit List Only
                </span>
                <RadioGroupItem value="CUSTOM" id="aud-custom" />
              </div>
              <span className="text-[11px] text-muted-foreground font-normal leading-relaxed">
                Send exclusively to the manual email list provided below.
              </span>
            </Label>
          </RadioGroup>

          {/* Source Checkboxes if Segment */}
          {targetAudience === "SEGMENT" && (
            <div className="space-y-2.5 rounded-lg border border-border/80 bg-muted/20 p-3 pt-2">
              <Label className="text-xs font-semibold text-foreground">
                Select Acquisition Channels to Include:
              </Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {AVAILABLE_SOURCES.map((src) => {
                  const isChecked = includedSources.includes(src.id);
                  return (
                    <div
                      key={src.id}
                      className="flex items-center space-x-2 rounded border border-border/40 bg-background/60 p-2"
                    >
                      <Checkbox
                        id={`src-${src.id}`}
                        checked={isChecked}
                        onCheckedChange={() => toggleSource(src.id)}
                      />
                      <Label
                        htmlFor={`src-${src.id}`}
                        className="cursor-pointer text-xs font-normal"
                      >
                        {src.label}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Explicit Inclusions & Exclusions */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Explicit Inclusions */}
        <Card className="border-border/80 bg-card/60">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <UserPlus className="size-4 text-emerald-500" />
              <CardTitle className="text-xs font-semibold">
                Explicit Contact Inclusions
              </CardTitle>
            </div>
            <CardDescription className="text-[11px]">
              Add specific email addresses that must be included (one per line or
              comma-separated).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Textarea
              placeholder="vip@example.com&#10;collaborator@domain.com"
              value={includeText}
              onChange={(e) => setIncludeText(e.target.value)}
              onBlur={handleIncludeTextBlur}
              className="min-h-[100px] font-mono text-xs"
            />
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{includedEmails.length} custom contact(s) queued</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[11px]"
                onClick={() => {
                  setIncludeText("");
                  onChangeIncludedEmails([]);
                }}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Explicit Exclusions */}
        <Card className="border-border/80 bg-card/60">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <UserX className="size-4 text-rose-500" />
              <CardTitle className="text-xs font-semibold">
                Explicit Contact Exclusions (Suppression)
              </CardTitle>
            </div>
            <CardDescription className="text-[11px]">
              Specific emails to suppress/exclude from this broadcast (e.g.
              internal tests or competitors).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Textarea
              placeholder="exclude@example.com&#10;internal@company.com"
              value={excludeText}
              onChange={(e) => setExcludeText(e.target.value)}
              onBlur={handleExcludeTextBlur}
              className="min-h-[100px] font-mono text-xs"
            />
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{excludedEmails.length} suppression rule(s) active</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[11px]"
                onClick={() => {
                  setExcludeText("");
                  onChangeExcludedEmails([]);
                }}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recipient Sample Preview */}
      {calcResult && calcResult.previewRecipients.length > 0 && (
        <Card className="border-border/60 bg-muted/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Sample Audience Preview ({calcResult.previewRecipients.length} shown)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {calcResult.previewRecipients.map((r, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="gap-1 border-border/80 bg-background font-mono text-[11px]"
                >
                  <span>{r.email}</span>
                  {r.name && (
                    <span className="text-muted-foreground">({r.name})</span>
                  )}
                  {r.reason === "custom_include" && (
                    <span className="text-emerald-500 font-bold">• inc</span>
                  )}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
