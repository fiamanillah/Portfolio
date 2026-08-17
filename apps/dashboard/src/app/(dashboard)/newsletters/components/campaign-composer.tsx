// apps/dashboard/src/app/(dashboard)/newsletters/components/campaign-composer.tsx
"use client";

import * as React from "react";
import {
  Sparkles,
  Zap,
  Code2,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  PresetTemplatesModal,
  type PresetTemplate,
} from "./preset-templates-modal";

interface CampaignComposerProps {
  title: string;
  onChangeTitle: (val: string) => void;
  subject: string;
  onChangeSubject: (val: string) => void;
  previewText: string;
  onChangePreviewText: (val: string) => void;
  content: string;
  onChangeContent: (val: string) => void;
  senderName: string;
  onChangeSenderName: (val: string) => void;
  senderEmail: string;
  onChangeSenderEmail: (val: string) => void;
  replyTo: string;
  onChangeReplyTo: (val: string) => void;
}

export function CampaignComposer({
  title,
  onChangeTitle,
  subject,
  onChangeSubject,
  previewText,
  onChangePreviewText,
  content,
  onChangeContent,
  senderName,
  onChangeSenderName,
  senderEmail,
  onChangeSenderEmail,
  replyTo,
  onChangeReplyTo,
}: CampaignComposerProps) {
  const [isTemplateModalOpen, setIsTemplateModalOpen] = React.useState(false);
  const [showSenderOverrides, setShowSenderOverrides] = React.useState(false);

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const insertVariable = (variable: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const newContent =
      content.substring(0, start) + variable + content.substring(end);
    onChangeContent(newContent);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          start + variable.length,
          start + variable.length
        );
      }
    }, 50);
  };

  const insertSnippet = (snippet: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const newContent =
      content.substring(0, start) + snippet + content.substring(end);
    onChangeContent(newContent);
  };

  const handleApplyPreset = (tpl: PresetTemplate) => {
    onChangeSubject(tpl.defaultSubject);
    onChangePreviewText(tpl.defaultPreview);
    onChangeContent(tpl.defaultContent);
  };

  const subjectLen = subject.trim().length;
  const previewLen = previewText.trim().length;

  return (
    <div className="space-y-6">
      {/* Campaign Name & Subject Card */}
      <Card className="border-border/80 bg-card/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-sm font-semibold">
              Campaign Header & Subject Line
            </CardTitle>
            <CardDescription className="text-xs">
              Craft high-impact subject and preview text to maximize open rates.
            </CardDescription>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsTemplateModalOpen(true)}
            className="h-8 gap-1.5 border-primary/30 text-xs text-primary hover:bg-primary/10"
          >
            <Zap className="size-3.5" />
            Starter Templates
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Internal Title */}
          <div className="space-y-1.5">
            <Label htmlFor="camp-title" className="text-xs">
              Internal Campaign Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="camp-title"
              placeholder="e.g. August 2026 Engineering Deep-Dive"
              value={title}
              onChange={(e) => onChangeTitle(e.target.value)}
              required
              className="h-9 text-xs"
            />
            <p className="text-[11px] text-muted-foreground">
              Used for your internal dashboard organization and analytics.
            </p>
          </div>

          {/* Email Subject Line */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="camp-subject" className="text-xs">
                Email Subject Line <span className="text-destructive">*</span>
              </Label>
              <span
                className={`font-mono text-[11px] ${
                  subjectLen >= 20 && subjectLen <= 70
                    ? "text-emerald-500"
                    : "text-muted-foreground"
                }`}
              >
                {subjectLen} / 70 chars (ideal: 20-70)
              </span>
            </div>
            <Input
              id="camp-subject"
              placeholder="e.g. Deep Dive: Distributed Real-Time Architecture"
              value={subject}
              onChange={(e) => onChangeSubject(e.target.value)}
              required
              className="h-9 text-xs"
            />
          </div>

          {/* Preheader Text */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="camp-preview" className="text-xs">
                Inbox Teaser / Preheader Snippet
              </Label>
              <span
                className={`font-mono text-[11px] ${
                  previewLen >= 40 && previewLen <= 100
                    ? "text-emerald-500"
                    : "text-muted-foreground"
                }`}
              >
                {previewLen} / 100 chars
              </span>
            </div>
            <Input
              id="camp-preview"
              placeholder="e.g. An overview of high-throughput distributed architectures and zero-downtime migrations."
              value={previewText}
              onChange={(e) => onChangePreviewText(e.target.value)}
              className="h-9 text-xs"
            />
            <p className="text-[11px] text-muted-foreground">
              Displayed beside or below the subject line in modern mobile and
              desktop email clients.
            </p>
          </div>

          {/* Optional Sender Overrides Accordion */}
          <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
            <button
              type="button"
              onClick={() => setShowSenderOverrides(!showSenderOverrides)}
              className="flex w-full items-center justify-between text-xs font-semibold text-foreground"
            >
              <span>Custom Sender &amp; Reply-To Settings</span>
              {showSenderOverrides ? (
                <ChevronUp className="size-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="size-4 text-muted-foreground" />
              )}
            </button>

            {showSenderOverrides && (
              <div className="grid gap-3 pt-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label htmlFor="sender-name" className="text-[11px]">
                    Sender From Name
                  </Label>
                  <Input
                    id="sender-name"
                    placeholder="Fi Amanillah"
                    value={senderName}
                    onChange={(e) => onChangeSenderName(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="sender-email" className="text-[11px]">
                    From Email Address
                  </Label>
                  <Input
                    id="sender-email"
                    type="email"
                    placeholder="fi@amanillah.com"
                    value={senderEmail}
                    onChange={(e) => onChangeSenderEmail(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="reply-to" className="text-[11px]">
                    Reply-To Address
                  </Label>
                  <Input
                    id="reply-to"
                    type="email"
                    placeholder="fi@amanillah.com"
                    value={replyTo}
                    onChange={(e) => onChangeReplyTo(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rich Content Editor */}
      <Card className="border-border/80 bg-card/60 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">
                Newsletter Content Body
              </CardTitle>
              <CardDescription className="text-xs">
                Compose with HTML or rich markdown elements. Fully responsive
                across inboxes.
              </CardDescription>
            </div>

            {/* Quick Variable Insertion Pills */}
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[11px] text-muted-foreground mr-1">
                Insert:
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-6 font-mono text-[10px] px-2"
                onClick={() =>
                  insertVariable(
                    "{{ name | default: firstName | default: 'there' }}"
                  )
                }
              >
                {"{{ name }}"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-6 font-mono text-[10px] px-2"
                onClick={() => insertVariable("{{ email }}")}
              >
                {"{{ email }}"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-6 font-mono text-[10px] px-2"
                onClick={() => insertVariable("{{ unsubscribeUrl }}")}
              >
                {"{{ unsubscribeUrl }}"}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Quick Component Snippet Toolbar */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-border/50 pb-2">
            <span className="text-[11px] text-muted-foreground mr-1">
              Layout Blocks:
            </span>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 text-[11px] px-2"
              onClick={() =>
                insertSnippet(`<!-- Highlight Card -->
<div style="margin: 20px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 18px 20px;">
  <h4 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 700; color: #0f172a;">Highlight Title</h4>
  <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.6;">Highlight summary text goes here.</p>
</div>\n`)
              }
            >
              + Highlight Card
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 text-[11px] px-2"
              onClick={() =>
                insertSnippet(`<a href="https://fi.amanillah.com" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 13px; font-weight: 600; padding: 10px 18px; border: 1px solid #0f172a; text-decoration: none;">
  Button Link &rarr;
</a>\n`)
              }
            >
              + CTA Button
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 text-[11px] px-2"
              onClick={() =>
                insertSnippet(`<span style="font-family: ui-monospace, monospace; font-size: 11px; font-weight: 600; color: #475569; background-color: #f1f5f9; border: 1px solid #e2e8f0; padding: 2px 6px; text-transform: uppercase;">
  TAG LABEL
</span>\n`)
              }
            >
              + Monospace Badge
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 text-[11px] px-2"
              onClick={() =>
                insertSnippet(`<hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />\n`)
              }
            >
              + Divider
            </Button>
          </div>

          <Textarea
            ref={textareaRef}
            rows={18}
            placeholder="Write your email markup or text here..."
            value={content}
            onChange={(e) => onChangeContent(e.target.value)}
            className="font-mono text-xs leading-relaxed"
          />
        </CardContent>
      </Card>

      {/* Preset Modal */}
      <PresetTemplatesModal
        open={isTemplateModalOpen}
        onOpenChange={setIsTemplateModalOpen}
        onSelectTemplate={handleApplyPreset}
      />
    </div>
  );
}
