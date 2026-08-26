// apps/dashboard/src/app/(dashboard)/newsletters/new/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Mail,
  Eye,
  Users,
  ShieldCheck,
  Zap,
  Columns,
  Edit3,
} from "lucide-react";
import type {
  AudienceType,
  NewsletterSpamReport,
} from "@workspace/shared";
import { NewsletterApi, showApiError, validateEmail } from "@/lib/api";
import { PRESET_TEMPLATES } from "../components/preset-templates-modal";
import { CampaignComposer } from "../components/campaign-composer";
import { AudienceSelector } from "../components/audience-selector";
import { EmailPreviewCard } from "../components/email-preview-card";
import { SpamAnalyzerCard } from "../components/spam-analyzer-card";
import { TestSendDialog } from "../components/test-send-dialog";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { toast } from "@workspace/ui/components/sonner";

export default function NewNewsletterPage() {
  const router = useRouter();

  // Preset default
  const defaultTpl = PRESET_TEMPLATES[0]!;

  // Form State
  const [title, setTitle] = React.useState("");
  const [subject, setSubject] = React.useState(defaultTpl.defaultSubject);
  const [previewText, setPreviewText] = React.useState(defaultTpl.defaultPreview);
  const [content, setContent] = React.useState(defaultTpl.defaultContent);
  const [senderName, setSenderName] = React.useState("Fi Amanillah");
  const [senderEmail, setSenderEmail] = React.useState(
    "newsletter@newsletter.amanillah.com"
  );
  const [replyTo, setReplyTo] = React.useState("fi@amanillah.com");

  // Audience State
  const [targetAudience, setTargetAudience] =
    React.useState<AudienceType>("ALL");
  const [includedSources, setIncludedSources] = React.useState<string[]>([]);
  const [includedEmails, setIncludedEmails] = React.useState<string[]>([]);
  const [excludedEmails, setExcludedEmails] = React.useState<string[]>([]);
  const [excludedSources, setExcludedSources] = React.useState<string[]>([]);

  // UI State
  const [activeTab, setActiveTab] = React.useState("compose");
  const [viewMode, setViewMode] = React.useState<"split" | "editor" | "preview">(
    "split"
  );
  const [isSaving, setIsSaving] = React.useState(false);
  const [isTestSendOpen, setIsTestSendOpen] = React.useState(false);
  const [spamReport, setSpamReport] =
    React.useState<NewsletterSpamReport | null>(null);
  const [isAuditingSpam, setIsAuditingSpam] = React.useState(false);

  // Anti-Spam audit on change
  const runSpamAudit = React.useCallback(async () => {
    if (!subject.trim() || !content.trim()) return;
    try {
      setIsAuditingSpam(true);
      const res = await NewsletterApi.spamCheck({
        subject,
        previewText: previewText || undefined,
        content,
        senderEmail: senderEmail || undefined,
      });
      if (res.success && res.data) {
        setSpamReport(res.data);
      }
    } catch {
      // ignore
    } finally {
      setIsAuditingSpam(false);
    }
  }, [subject, previewText, content, senderEmail]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      runSpamAudit();
    }, 600);
    return () => clearTimeout(timer);
  }, [runSpamAudit]);

  const handleSaveDraft = React.useCallback(async () => {
    if (!title.trim()) {
      toast.error("Campaign title is required");
      setActiveTab("compose");
      return;
    }
    if (!subject.trim()) {
      toast.error("Subject line is required");
      setActiveTab("compose");
      return;
    }
    if (!content.trim()) {
      toast.error("Campaign content is required");
      setActiveTab("compose");
      return;
    }

    if (senderEmail.trim()) {
      const emailVal = validateEmail(senderEmail, "Sender Email");
      if (!emailVal.valid && emailVal.error) {
        toast.error(emailVal.error);
        return;
      }
    }

    if (replyTo.trim()) {
      const emailVal = validateEmail(replyTo, "Reply-To Email");
      if (!emailVal.valid && emailVal.error) {
        toast.error(emailVal.error);
        return;
      }
    }

    try {
      setIsSaving(true);
      const res = await NewsletterApi.create({
        title: title.trim(),
        subject: subject.trim(),
        previewText: previewText.trim() || undefined,
        content,
        senderName: senderName.trim() || undefined,
        senderEmail: senderEmail.trim() || undefined,
        replyTo: replyTo.trim() || undefined,
        targetAudience,
        includedSources,
        includedEmails,
        excludedEmails,
        excludedSources,
      });

      if (res.success && res.data) {
        toast.success("Campaign created successfully!", {
          description: `Saved "${res.data.title}" as Draft.`,
        });
        router.push(`/newsletters/${res.data.id}`);
      } else {
        showApiError(res, "Failed to create campaign");
      }
    } catch (err: unknown) {
      showApiError(err, "Error creating campaign");
    } finally {
      setIsSaving(false);
    }
  }, [
    title,
    subject,
    previewText,
    content,
    senderName,
    senderEmail,
    replyTo,
    targetAudience,
    includedSources,
    includedEmails,
    excludedEmails,
    excludedSources,
    router,
  ]);

  // Keyboard shortcut: Ctrl+S / Cmd+S to save draft
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSaveDraft();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSaveDraft]);

  return (
    <div className="space-y-6">
      {/* Header & Action Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Button asChild variant="outline" size="icon" className="size-8 shrink-0">
            <Link href="/newsletters">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight md:text-2xl truncate">
                Create Newsletter Campaign
              </h1>
              <Badge variant="outline" className="font-mono text-xs shrink-0">
                Drafting
              </Badge>
              {spamReport && (
                <Badge
                  variant="outline"
                  className={`hidden sm:inline-flex font-mono text-[10px] shrink-0 ${
                    spamReport.riskLevel === "LOW"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : spamReport.riskLevel === "MEDIUM"
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
                      : "border-rose-500/30 bg-rose-500/10 text-rose-500"
                  }`}
                >
                  {spamReport.score}/100 Deliverability
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              Draft content with real-time responsive preview, configure audience targeting, and test deliverability.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsTestSendOpen(true)}
            className="gap-1.5 text-xs"
          >
            <Mail className="size-3.5 text-primary" />
            Send Test
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="gap-1.5 text-xs shadow-xs"
          >
            <Save className="size-3.5" />
            {isSaving ? "Saving..." : "Save Draft"}
          </Button>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-2">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="compose" className="gap-1.5 text-xs">
              <Zap className="size-3.5" />
              <span>Compose &amp; Preview</span>
            </TabsTrigger>
            <TabsTrigger value="audience" className="gap-1.5 text-xs">
              <Users className="size-3.5" />
              <span>Audience</span>
            </TabsTrigger>
            <TabsTrigger value="spam" className="gap-1.5 text-xs">
              <ShieldCheck className="size-3.5" />
              <span>Deliverability</span>
            </TabsTrigger>
          </TabsList>

          {/* View Switcher (Active on Compose tab) */}
          {activeTab === "compose" && (
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-muted-foreground mr-1 hidden sm:inline">
                View:
              </span>
              <div className="flex items-center rounded-lg border border-border/60 bg-muted/40 p-0.5">
                <Button
                  variant={viewMode === "split" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 gap-1 text-[11px] px-2"
                  onClick={() => setViewMode("split")}
                  title="Side-by-side Split View"
                >
                  <Columns className="size-3" />
                  <span>Split View</span>
                </Button>
                <Button
                  variant={viewMode === "editor" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 gap-1 text-[11px] px-2"
                  onClick={() => setViewMode("editor")}
                  title="Editor Only"
                >
                  <Edit3 className="size-3" />
                  <span>Editor</span>
                </Button>
                <Button
                  variant={viewMode === "preview" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 gap-1 text-[11px] px-2"
                  onClick={() => setViewMode("preview")}
                  title="Preview Only"
                >
                  <Eye className="size-3" />
                  <span>Preview</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Tab 1: Compose & Live Preview */}
        <TabsContent value="compose" className="space-y-4 pt-1">
          {viewMode === "split" ? (
            <div className="grid gap-6 lg:grid-cols-2 items-start">
              {/* Left Column: Composer */}
              <div className="min-w-0 space-y-4">
                <CampaignComposer
                  title={title}
                  onChangeTitle={setTitle}
                  subject={subject}
                  onChangeSubject={setSubject}
                  previewText={previewText}
                  onChangePreviewText={setPreviewText}
                  content={content}
                  onChangeContent={setContent}
                  senderName={senderName}
                  onChangeSenderName={setSenderName}
                  senderEmail={senderEmail}
                  onChangeSenderEmail={setSenderEmail}
                  replyTo={replyTo}
                  onChangeReplyTo={setReplyTo}
                />
              </div>

              {/* Right Column: Live Synchronous Preview */}
              <div className="min-w-0 lg:sticky lg:top-4">
                <EmailPreviewCard
                  subject={subject}
                  previewText={previewText}
                  content={content}
                  senderName={senderName}
                  senderEmail={senderEmail}
                  replyTo={replyTo}
                  onSendTestClick={() => setIsTestSendOpen(true)}
                />
              </div>
            </div>
          ) : viewMode === "editor" ? (
            <div className="max-w-4xl mx-auto">
              <CampaignComposer
                title={title}
                onChangeTitle={setTitle}
                subject={subject}
                onChangeSubject={setSubject}
                previewText={previewText}
                onChangePreviewText={setPreviewText}
                content={content}
                onChangeContent={setContent}
                senderName={senderName}
                onChangeSenderName={setSenderName}
                senderEmail={senderEmail}
                onChangeSenderEmail={setSenderEmail}
                replyTo={replyTo}
                onChangeReplyTo={setReplyTo}
              />
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <EmailPreviewCard
                subject={subject}
                previewText={previewText}
                content={content}
                senderName={senderName}
                senderEmail={senderEmail}
                replyTo={replyTo}
                onSendTestClick={() => setIsTestSendOpen(true)}
              />
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Audience Targeting */}
        <TabsContent value="audience" className="space-y-4 pt-1">
          <div className="max-w-4xl mx-auto">
            <AudienceSelector
              targetAudience={targetAudience}
              onChangeTargetAudience={setTargetAudience}
              includedSources={includedSources}
              onChangeIncludedSources={setIncludedSources}
              includedEmails={includedEmails}
              onChangeIncludedEmails={setIncludedEmails}
              excludedEmails={excludedEmails}
              onChangeExcludedEmails={setExcludedEmails}
              excludedSources={excludedSources}
              onChangeExcludedSources={setExcludedSources}
            />
          </div>
        </TabsContent>

        {/* Tab 3: Deliverability & Anti-Spam */}
        <TabsContent value="spam" className="space-y-6 pt-1">
          <div className="max-w-4xl mx-auto space-y-6">
            <SpamAnalyzerCard
              report={spamReport}
              isLoading={isAuditingSpam}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Test Send Modal */}
      <TestSendDialog
        open={isTestSendOpen}
        onOpenChange={setIsTestSendOpen}
        subject={subject}
        previewText={previewText}
        content={content}
        senderName={senderName}
        senderEmail={senderEmail}
      />
    </div>
  );
}
