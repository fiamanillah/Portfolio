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
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link2,
  Quote,
  Minus,
  Box,
  Layers,
  MousePointerClick,
  Tag,
  Columns,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/components/card";
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

  /**
   * Inserts text or wraps selected text with prefix/suffix
   */
  const wrapOrInsert = (prefix: string, suffix: string = "", defaultText: string = "") => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = selected ? `${prefix}${selected}${suffix}` : `${prefix}${defaultText}${suffix}`;
    const newContent =
      content.substring(0, start) + replacement + content.substring(end);
    onChangeContent(newContent);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const cursor = start + prefix.length + (selected ? selected.length : defaultText.length);
        textareaRef.current.setSelectionRange(cursor, cursor);
      }
    }, 50);
  };

  const insertVariable = (variable: string) => {
    wrapOrInsert(variable);
  };

  const insertSnippet = (snippet: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const newContent =
      content.substring(0, start) + snippet + content.substring(end);
    onChangeContent(newContent);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 50);
  };

  const handleApplyPreset = (tpl: PresetTemplate) => {
    onChangeSubject(tpl.defaultSubject);
    onChangePreviewText(tpl.defaultPreview);
    onChangeContent(tpl.defaultContent);
  };

  const subjectLen = subject.trim().length;
  const previewLen = previewText.trim().length;

  return (
    <div className="space-y-5">
      {/* Campaign Name & Subject Card */}
      <Card className="border-border/80 bg-card/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-sm font-semibold">
              Campaign Header & Subject Line
            </CardTitle>
            <CardDescription className="text-xs">
              Craft compelling subject and preview snippets to maximize deliverability and open rates.
            </CardDescription>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsTemplateModalOpen(true)}
            className="h-7 gap-1.5 border-primary/30 text-xs text-primary hover:bg-primary/10"
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
              Internal identifier for dashboard organization and analytics.
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
                    ? "text-emerald-500 font-semibold"
                    : subjectLen > 70
                    ? "text-amber-500"
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
                    ? "text-emerald-500 font-semibold"
                    : previewLen > 100
                    ? "text-amber-500"
                    : "text-muted-foreground"
                }`}
              >
                {previewLen} / 100 chars (ideal: 40-100)
              </span>
            </div>
            <Input
              id="camp-preview"
              placeholder="e.g. An overview of high-throughput distributed architectures, zero-downtime migrations, and event patterns."
              value={previewText}
              onChange={(e) => onChangePreviewText(e.target.value)}
              className="h-9 text-xs"
            />
            <p className="text-[11px] text-muted-foreground">
              Displayed in mobile and desktop inbox notification snippets.
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
                    placeholder="newsletter@newsletter.amanillah.com"
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
                Supports rich HTML and Markdown. Updates the live preview in real time while typing.
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
                className="h-6 font-mono text-[10px] px-2 hover:bg-primary/10"
                onClick={() =>
                  insertVariable(
                    "{{ name | default: firstName | default: 'there' }}"
                  )
                }
                title="Inserts personalized subscriber name with fallback"
              >
                {"{{ name }}"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-6 font-mono text-[10px] px-2 hover:bg-primary/10"
                onClick={() => insertVariable("{{ firstName }}")}
                title="Inserts first name"
              >
                {"{{ firstName }}"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-6 font-mono text-[10px] px-2 hover:bg-primary/10"
                onClick={() => insertVariable("{{ email }}")}
                title="Inserts subscriber email address"
              >
                {"{{ email }}"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-6 font-mono text-[10px] px-2 hover:bg-primary/10"
                onClick={() => insertVariable("{{ unsubscribeUrl }}")}
                title="Inserts signed 1-click unsubscribe URL"
              >
                {"{{ unsubscribeUrl }}"}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Rich Markdown & Formatting Toolbar */}
          <div className="flex flex-wrap items-center gap-1 border-b border-border/50 pb-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 rounded"
              onClick={() => wrapOrInsert("**", "**", "bold text")}
              title="Bold (**text**)"
            >
              <Bold className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 rounded"
              onClick={() => wrapOrInsert("*", "*", "italic text")}
              title="Italic (*text*)"
            >
              <Italic className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 rounded"
              onClick={() => wrapOrInsert("~~", "~~", "strikethrough text")}
              title="Strikethrough (~~text~~)"
            >
              <Strikethrough className="size-3.5" />
            </Button>

            <div className="h-4 w-px bg-border/60 mx-1" />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 rounded"
              onClick={() => wrapOrInsert("## ", "\n", "Heading 2")}
              title="Heading 2"
            >
              <Heading2 className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 rounded"
              onClick={() => wrapOrInsert("### ", "\n", "Heading 3")}
              title="Heading 3"
            >
              <Heading3 className="size-3.5" />
            </Button>

            <div className="h-4 w-px bg-border/60 mx-1" />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 rounded"
              onClick={() => wrapOrInsert("- ", "\n", "List item")}
              title="Bullet List"
            >
              <List className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 rounded"
              onClick={() => wrapOrInsert("1. ", "\n", "Numbered item")}
              title="Numbered List"
            >
              <ListOrdered className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 rounded"
              onClick={() => wrapOrInsert("> ", "\n", "Quoted text")}
              title="Blockquote"
            >
              <Quote className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 rounded"
              onClick={() => wrapOrInsert("[", "](https://fi.amanillah.com)", "Link Text")}
              title="Link"
            >
              <Link2 className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 rounded"
              onClick={() => wrapOrInsert("`", "`", "code")}
              title="Inline Code"
            >
              <Code2 className="size-3.5" />
            </Button>

            <div className="h-4 w-px bg-border/60 mx-1" />

            {/* Layout Block Snippet Quick Dropdowns / Buttons */}
            <span className="text-[11px] text-muted-foreground mr-0.5">
              Blocks:
            </span>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-[11px] px-2 gap-1"
              onClick={() =>
                insertSnippet(`\n<!-- Featured Highlight Card -->
<div style="margin: 24px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0; padding: 20px 22px;">
  <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.04em; background-color: #f1f5f9; border: 1px solid #e2e8f0; padding: 2px 6px; border-radius: 0; display: inline-block; margin-bottom: 12px;">
    Architecture Deep-Dive
  </span>
  <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #0f172a; line-height: 1.4;">
    Highlight Title Goes Here
  </h3>
  <p style="margin: 0 0 16px 0; font-size: 13px; color: #475569; line-height: 1.6;">
    An overview of technical considerations, design decisions, and benchmarks.
  </p>
  <div style="text-align: left;">
    <a href="https://fi.amanillah.com/blog" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 13px; font-weight: 600; padding: 10px 18px; border-radius: 0; border: 1px solid #0f172a; text-decoration: none;">
      Read Article &rarr;
    </a>
  </div>
</div>\n`)
              }
              title="Insert Styled Highlight Card"
            >
              <Box className="size-3 text-primary" />
              <span>Card</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-[11px] px-2 gap-1"
              onClick={() =>
                insertSnippet(`\n<!-- CTA Button -->
<div style="margin: 20px 0; text-align: left;">
  <a href="https://fi.amanillah.com" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 13px; font-weight: 600; padding: 10px 20px; border-radius: 0; border: 1px solid #0f172a; text-decoration: none;">
    Explore Platform &rarr;
  </a>
</div>\n`)
              }
              title="Insert CTA Button"
            >
              <MousePointerClick className="size-3 text-primary" />
              <span>CTA</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-[11px] px-2 gap-1"
              onClick={() =>
                insertSnippet(`\n<span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; font-weight: 600; color: #475569; background-color: #f1f5f9; border: 1px solid #e2e8f0; padding: 2px 7px; border-radius: 0; display: inline-block; text-transform: uppercase; letter-spacing: 0.05em;">TAG LABEL</span>\n`)
              }
              title="Insert Monospace Badge"
            >
              <Tag className="size-3 text-primary" />
              <span>Badge</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-[11px] px-2 gap-1"
              onClick={() =>
                insertSnippet(`\n<hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />\n`)
              }
              title="Insert Divider"
            >
              <Minus className="size-3" />
              <span>Divider</span>
            </Button>
          </div>

          <Textarea
            ref={textareaRef}
            rows={18}
            placeholder="Write your email content in HTML or Markdown..."
            value={content}
            onChange={(e) => onChangeContent(e.target.value)}
            className="font-mono text-xs leading-relaxed resize-y min-h-[360px]"
          />

          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Live Sync Active &bull; Format: HTML / Markdown / Liquid</span>
            <span>{content.length} characters</span>
          </div>
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
