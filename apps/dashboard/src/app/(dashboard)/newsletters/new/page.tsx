// apps/dashboard/src/app/(dashboard)/newsletters/new/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Send,
  Eye,
  Mail,
  Users,
  ShieldCheck,
  Zap,
} from "lucide-react";
import type {
  AudienceType,
  NewsletterSpamReport,
} from "@workspace/shared";
import { NewsletterApi } from "@/lib/api";
import { PRESET_TEMPLATES } from "../components/preset-templates-modal";
import { CampaignComposer } from "../components/campaign-composer";
import { AudienceSelector } from "../components/audience-selector";
import { EmailPreviewCard } from "../components/email-preview-card";
import { SpamAnalyzerCard } from "../components/spam-analyzer-card";
import { TestSendDialog } from "../components/test-send-dialog";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { toast } from "@workspace/ui/components/sonner";

export default function NewNewsletterPage() {
  const router = useRouter();

  // Preset default
  const defaultTpl = PRESET_TEMPLATES[0]!;

  // Form State
  const [title, setTitle] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [previewText, setPreviewText] = React.useState("");
  const [content, setContent] = React.useState("");
  const [senderName, setSenderName] = React.useState("");
  const [senderEmail, setSenderEmail] = React.useState("");
  const [replyTo, setReplyTo] = React.useState("");

  // Audience State
  const [targetAudience, setTargetAudience] =
    React.useState<AudienceType>("ALL");
  const [includedSources, setIncludedSources] = React.useState<string[]>([]);
  const [includedEmails, setIncludedEmails] = React.useState<string[]>([]);
  const [excludedEmails, setExcludedEmails] = React.useState<string[]>([]);
  const [excludedSources, setExcludedSources] = React.useState<string[]>([]);

  // Deliverability State
  const [spamReport, setSpamReport] =
    React.useState<NewsletterSpamReport | null>(null);
  const [isAuditingSpam, setIsAuditingSpam] = React.useState(false);

  // Modals & Submitting
  const [isTestSendOpen, setIsTestSendOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("composer");

  // Trigger Anti-Spam audit when content changes
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

  const handleSaveDraft = async () => {
    if (!title.trim() || !subject.trim() || !content.trim()) {
      toast.error("Required fields missing", {
        description: "Please provide a title, subject line, and body content.",
      });
      return;
    }

    try {
      setIsSaving(true);
      const res = await NewsletterApi.create({
        title,
        subject,
        previewText: previewText || undefined,
        content,
        senderName: senderName || undefined,
        senderEmail: senderEmail || undefined,
        replyTo: replyTo || undefined,
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
        toast.error("Failed to create campaign", { description: res.error });
      }
    } catch (err: any) {
      toast.error("Error creating campaign", { description: err?.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon" className="size-8">
            <Link href="/newsletters">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight md:text-2xl">
                Create Newsletter Campaign
              </h1>
              <Badge variant="outline" className="font-mono text-xs">
                Drafting
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Configure content, audience targeting, live preview, and anti-spam
              deliverability rules.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
            {isSaving ? "Saving..." : "Save & Continue"}
          </Button>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="composer" className="gap-1.5 text-xs">
            <Zap className="size-3.5" />
            <span>Composer</span>
          </TabsTrigger>
          <TabsTrigger value="audience" className="gap-1.5 text-xs">
            <Users className="size-3.5" />
            <span>Audience &amp; Filter</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-1.5 text-xs">
            <Eye className="size-3.5" />
            <span>Preview &amp; Spam Audit</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Composer */}
        <TabsContent value="composer" className="space-y-4">
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
        </TabsContent>

        {/* Tab 2: Audience Targeting */}
        <TabsContent value="audience" className="space-y-4">
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
        </TabsContent>

        {/* Tab 3: Preview & Spam Audit */}
        <TabsContent value="preview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <EmailPreviewCard
                subject={subject}
                previewText={previewText}
                content={content}
                senderName={senderName}
                senderEmail={senderEmail}
              />
            </div>
            <div>
              <SpamAnalyzerCard
                report={spamReport}
                isLoading={isAuditingSpam}
              />
            </div>
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
