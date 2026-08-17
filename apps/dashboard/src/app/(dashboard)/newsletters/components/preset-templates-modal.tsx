// apps/dashboard/src/app/(dashboard)/newsletters/components/preset-templates-modal.tsx
"use client";

import * as React from "react";
import {
  FileText,
  Sparkles,
  Layers,
  Code2,
  Check,
  Zap,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardContent } from "@workspace/ui/components/card";

export interface PresetTemplate {
  id: string;
  name: string;
  badge: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultSubject: string;
  defaultPreview: string;
  defaultContent: string;
}

export const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: "tech_deep_dive",
    name: "Tech Deep-Dive & Architecture",
    badge: "Article Release",
    description:
      "A clean layout engineered for technical write-ups, deep-dives, benchmark breakdowns, and code releases.",
    icon: Code2,
    defaultSubject: "Deep Dive: Distributed Real-Time Architecture & Event-Driven Engines",
    defaultPreview:
      "An overview of high-throughput distributed architectures, zero-downtime migrations, and event patterns.",
    defaultContent: `<p style="margin: 0 0 16px 0; font-size: 15px; color: #0f172a;">
  Hi <strong>{{ name | default: firstName | default: 'there' }}</strong>,
</p>

<p style="margin: 0 0 16px 0; color: #334155; line-height: 1.65;">
  Over the past few weeks, I have been designing and benchmarking a high-throughput event-driven microservices architecture. Today, I'm publishing a full deep-dive into how we scaled throughput while eliminating latency spikes.
</p>

<!-- Featured Post / Highlight Card -->
<div style="margin: 24px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0; padding: 20px 22px;">
  <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.04em; background-color: #f1f5f9; border: 1px solid #e2e8f0; padding: 2px 6px; border-radius: 0; display: inline-block; margin-bottom: 12px;">
    Architecture Deep-Dive
  </span>

  <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #0f172a; line-height: 1.4;">
    Building Low-Latency Distributed Queues with Zero-Downtime Rebalancing
  </h3>

  <p style="margin: 0 0 16px 0; font-size: 13px; color: #475569; line-height: 1.6;">
    An end-to-end breakdown covering partition rebalancing, optimistic concurrency models, PostgreSQL JSONB indexing, and Redis caching topologies.
  </p>

  <div style="text-align: left;">
    <a href="https://fi.amanillah.com/blog" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 13px; font-weight: 600; padding: 10px 18px; border-radius: 0; border: 1px solid #0f172a; text-decoration: none;">
      Read Full Article &rarr;
    </a>
  </div>
</div>

<p style="margin: 0 0 16px 0; color: #334155; line-height: 1.65;">
  Key takeaways discussed in this edition:
</p>
<ul style="margin: 0 0 20px 0; padding-left: 20px; color: #334155; line-height: 1.65; font-size: 14px;">
  <li>Mitigating connection pool exhaustion during sudden burst traffic.</li>
  <li>Designing idempotent webhooks and at-least-once delivery guarantees.</li>
  <li>Telemetry and tracing configurations with OpenTelemetry.</li>
</ul>

<div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
  <p style="margin: 0; font-size: 13px; color: #64748b;">
    Until next time,<br>
    <strong style="color: #0f172a;">Fi Amanillah</strong>
  </p>
</div>`,
  },
  {
    id: "weekly_digest",
    name: "Workbench Curated Digest",
    badge: "Weekly Notes",
    description:
      "A structured digest format featuring weekly engineering notes, curated links, tool recommendations, and reflections.",
    icon: FileText,
    defaultSubject: "Workbench Notes: What I Built, Learned & Read This Week",
    defaultPreview:
      "A quick roundup of open-source experiments, database optimization learnings, and articles worth reading.",
    defaultContent: `<p style="margin: 0 0 16px 0; font-size: 15px; color: #0f172a;">
  Hey <strong>{{ name | default: firstName | default: 'there' }}</strong>,
</p>

<p style="margin: 0 0 16px 0; color: #334155; line-height: 1.65;">
  Here is this week's workbench digest — a curated dispatch of engineering insights, projects shipped, and tools that made my workflow significantly faster.
</p>

<h3 style="margin: 24px 0 10px 0; font-size: 15px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
  &bull; What I Shipped This Week
</h3>
<p style="margin: 0 0 12px 0; color: #334155; line-height: 1.65;">
  Completed migration to an automated zero-downtime CI/CD deployment pipeline for full-stack monorepos using Bun and Docker Compose.
</p>

<h3 style="margin: 24px 0 10px 0; font-size: 15px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
  &bull; Top Reads & Architecture References
</h3>
<ul style="margin: 0 0 20px 0; padding-left: 20px; color: #334155; line-height: 1.65; font-size: 14px;">
  <li><a href="https://fi.amanillah.com" style="color: #0f172a; text-decoration: underline; font-weight: 600;">PostgreSQL Index Tuning</a> — Best practices for composite indexing on high-write tables.</li>
  <li><a href="https://fi.amanillah.com" style="color: #0f172a; text-decoration: underline; font-weight: 600;">Modern CSS & Design Systems</a> — Flat brutalism vs glassmorphism in enterprise consoles.</li>
</ul>

<div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
  <p style="margin: 0; font-size: 13px; color: #64748b;">
    Enjoy your weekend,<br>
    <strong style="color: #0f172a;">Fi Amanillah</strong>
  </p>
</div>`,
  },
  {
    id: "case_study_release",
    name: "Project & Case Study Launch",
    badge: "Showcase",
    description:
      "A high-impact announcement template for unveiling major client case studies, open-source projects, and apps.",
    icon: Layers,
    defaultSubject: "Case Study Launch: Scaling Distributed Systems with 99.99% Uptime",
    defaultPreview:
      "Discover the architecture, engineering decisions, and measurable outcomes of our latest production project.",
    defaultContent: `<p style="margin: 0 0 16px 0; font-size: 15px; color: #0f172a;">
  Hi <strong>{{ name | default: firstName | default: 'there' }}</strong>,
</p>

<p style="margin: 0 0 16px 0; color: #334155; line-height: 1.65;">
  I am excited to share a brand new comprehensive case study showcasing an end-to-end cloud platform built from scratch.
</p>

<!-- Case Study Card -->
<div style="margin: 24px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0; padding: 22px;">
  <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; font-weight: 600; color: #0f172a; text-transform: uppercase; letter-spacing: 0.04em; background-color: #e2e8f0; padding: 2px 6px; border-radius: 0; display: inline-block; margin-bottom: 12px;">
    Featured Case Study
  </span>

  <h2 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 700; color: #0f172a; line-height: 1.35;">
    Next-Gen Enterprise Cloud Infrastructure & Real-Time Analytics Platform
  </h2>

  <p style="margin: 0 0 16px 0; font-size: 13px; color: #475569; line-height: 1.6;">
    Engineered a high-availability multi-tenant cloud application handling over 10M daily events with sub-25ms response times.
  </p>

  <div style="text-align: left;">
    <a href="https://fi.amanillah.com/case-studies" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 13px; font-weight: 600; padding: 10px 20px; border-radius: 0; border: 1px solid #0f172a; text-decoration: none;">
      Explore Full Case Study &rarr;
    </a>
  </div>
</div>

<p style="margin: 0 0 16px 0; color: #334155; line-height: 1.65;">
  Feel free to reply directly to this email if you have any questions or feedback about the implementation details.
</p>`,
  },
  {
    id: "minimal_announcement",
    name: "Minimal Personal Dispatch",
    badge: "Direct Note",
    description:
      "A minimalist, high-contrast letter format ideal for direct announcements, personal updates, and quick notes.",
    icon: Sparkles,
    defaultSubject: "A quick update and thoughts from my workbench",
    defaultPreview:
      "Brief personal update on upcoming writing, software projects, and roadmap milestones.",
    defaultContent: `<p style="margin: 0 0 16px 0; font-size: 15px; color: #0f172a;">
  Hi <strong>{{ name | default: firstName | default: 'there' }}</strong>,
</p>

<p style="margin: 0 0 16px 0; color: #334155; line-height: 1.7;">
  I wanted to write a brief, direct note regarding the upcoming roadmap and some exciting new tools I am preparing to open-source in the coming weeks.
</p>

<p style="margin: 0 0 16px 0; color: #334155; line-height: 1.7;">
  Thank you for being part of this audience and following along with the engineering journey.
</p>

<div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
  <p style="margin: 0; font-size: 13px; color: #64748b;">
    Warm regards,<br>
    <strong style="color: #0f172a;">Fi Amanillah</strong>
  </p>
</div>`,
  },
];

interface PresetTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: PresetTemplate) => void;
}

export function PresetTemplatesModal({
  open,
  onOpenChange,
  onSelectTemplate,
}: PresetTemplatesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Zap className="size-4 text-primary" />
            <span>Select Preset Starter Template</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Choose a responsive, pre-tested layout designed for high engagement
            and anti-spam deliverability.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-2 sm:grid-cols-2">
          {PRESET_TEMPLATES.map((tpl) => {
            const Icon = tpl.icon;
            return (
              <Card
                key={tpl.id}
                className="group relative cursor-pointer border-border/80 transition-all hover:border-primary hover:bg-muted/40"
                onClick={() => {
                  onSelectTemplate(tpl);
                  onOpenChange(false);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </div>
                    <Badge
                      variant="outline"
                      className="font-mono text-[10px] uppercase"
                    >
                      {tpl.badge}
                    </Badge>
                  </div>

                  <h4 className="mt-3 text-xs font-semibold text-foreground group-hover:text-primary">
                    {tpl.name}
                  </h4>

                  <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground leading-relaxed">
                    {tpl.description}
                  </p>

                  <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-primary">
                    <span>Apply template</span>
                    <span>&rarr;</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
