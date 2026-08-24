// apps/dashboard/src/app/(dashboard)/newsletters/[id]/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Send,
  Clock,
  Mail,
  Eye,
  Users,
  ShieldCheck,
  FileText,
  Copy,
  StopCircle,
  RefreshCw,
  Zap,
  Columns,
  Edit3,
} from "lucide-react";
import type {
  AudienceType,
  NewsletterDetail,
  NewsletterSpamReport,
} from "@workspace/shared";
import { NewsletterApi, showApiError, validateEmail } from "@/lib/api";
import { CampaignComposer } from "../components/campaign-composer";
import { AudienceSelector } from "../components/audience-selector";
import { EmailPreviewCard } from "../components/email-preview-card";
import { SpamAnalyzerCard } from "../components/spam-analyzer-card";
import { CampaignLogsTable } from "../components/campaign-logs-table";
import { TestSendDialog } from "../components/test-send-dialog";
import { ScheduleDialog } from "../components/schedule-dialog";
import { SendConfirmDialog } from "../components/send-confirm-dialog";
import { getStatusBadge } from "../components/campaign-columns";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { Card, CardContent } from "@workspace/ui/components/card";
import { toast } from "@workspace/ui/components/sonner";

export default function NewsletterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [campaign, setCampaign] = React.useState<NewsletterDetail | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("composer");
  const [viewMode, setViewMode] = React.useState<"split" | "editor" | "preview">(
    "split"
  );

  // Editable Form Fields
  const [title, setTitle] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [previewText, setPreviewText] = React.useState("");
  const [content, setContent] = React.useState("");
  const [senderName, setSenderName] = React.useState("");
  const [senderEmail, setSenderEmail] = React.useState("");
  const [replyTo, setReplyTo] = React.useState("");

  // Audience
  const [targetAudience, setTargetAudience] =
    React.useState<AudienceType>("ALL");
  const [includedSources, setIncludedSources] = React.useState<string[]>([]);
  const [includedEmails, setIncludedEmails] = React.useState<string[]>([]);
  const [excludedEmails, setExcludedEmails] = React.useState<string[]>([]);
  const [excludedSources, setExcludedSources] = React.useState<string[]>([]);

  // Spam report
  const [spamReport, setSpamReport] =
    React.useState<NewsletterSpamReport | null>(null);
  const [isAuditingSpam, setIsAuditingSpam] = React.useState(false);

  // Dialogs
  const [isTestSendOpen, setIsTestSendOpen] = React.useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = React.useState(false);
  const [isSendConfirmOpen, setIsSendConfirmOpen] = React.useState(false);
  const [isSendingImmediate, setIsSendingImmediate] = React.useState(false);

  // Fetch campaign
  const fetchCampaign = React.useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const res = await NewsletterApi.getById(id);
      if (res.success && res.data) {
        const d = res.data;
        setCampaign(d);
        setTitle(d.title);
        setSubject(d.subject);
        setPreviewText(d.previewText || "");
        setContent(d.content);
        setSenderName(d.senderName || "");
        setSenderEmail(d.senderEmail || "");
        setReplyTo(d.replyTo || "");
        setTargetAudience(d.targetAudience);
        setIncludedSources(d.includedSources || []);
        setIncludedEmails(d.includedEmails || []);
        setExcludedEmails(d.excludedEmails || []);
        setExcludedSources(d.excludedSources || []);
        if (d.spamReport) {
          setSpamReport(d.spamReport);
        }
      } else {
        toast.error("Failed to load campaign", { description: res.error });
      }
    } catch (err: any) {
      toast.error("Error loading campaign", { description: err?.message });
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

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

  // Save changes
  const handleSave = React.useCallback(async () => {
    if (!id) return;
    if (!title.trim()) {
      toast.error("Campaign title is required");
      setActiveTab("composer");
      return;
    }
    if (!subject.trim()) {
      toast.error("Subject line is required");
      setActiveTab("composer");
      return;
    }
    if (!content.trim()) {
      toast.error("Campaign content is required");
      setActiveTab("composer");
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
      const res = await NewsletterApi.update(id, {
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
        setCampaign(res.data);
        toast.success("Campaign updated successfully!");
      } else {
        showApiError(res, "Failed to update campaign");
      }
    } catch (err: any) {
      showApiError(err, "Error saving campaign");
    } finally {
      setIsSaving(false);
    }
  }, [
    id,
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
  ]);

  // Keyboard shortcut: Ctrl+S / Cmd+S to save changes
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  // Immediate send
  const handleConfirmSendNow = async () => {
    if (!id) return;
    try {
      setIsSendingImmediate(true);
      const res = await NewsletterApi.sendNow(id);
      if (res.success) {
        toast.success("Broadcast initiated!", {
          description: `Campaign is streaming to recipients.`,
        });
        setIsSendConfirmOpen(false);
        fetchCampaign();
      } else {
        showApiError(res, "Failed to start broadcast");
      }
    } catch (err: any) {
      showApiError(err, "Error broadcasting campaign");
    } finally {
      setIsSendingImmediate(false);
    }
  };

  const handleCancelBroadcast = async () => {
    if (!id) return;
    try {
      const res = await NewsletterApi.cancel(id);
      if (res.success && res.data) {
        setCampaign(res.data);
        toast.success("Campaign schedule cancelled.");
      } else {
        showApiError(res, "Cancellation failed");
      }
    } catch (err: any) {
      showApiError(err, "Error cancelling campaign schedule");
    }
  };

  const handleDuplicate = async () => {
    if (!id) return;
    toast.promise(
      NewsletterApi.duplicate(id).then((res) => {
        if (!res.success) throw new Error(res.error || "Failed to duplicate");
        router.push(`/newsletters/${res.data?.id}`);
        return res.data;
      }),
      {
        loading: "Duplicating campaign...",
        success: "Duplicate campaign created!",
        error: "Failed to duplicate campaign",
      }
    );
  };

  const handleSyncWithPlunk = async () => {
    if (!id) return;
    toast.promise(
      NewsletterApi.sync(id).then((res) => {
        if (!res.success) throw new Error(res.error || "Failed to sync with Plunk");
        fetchCampaign();
        return res.data;
      }),
      {
        loading: "Synchronizing stats and status with Plunk...",
        success: "Campaign synchronized with Plunk successfully!",
        error: (err) => err?.message || "Sync with Plunk failed",
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="space-y-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/newsletters">
            <ArrowLeft className="mr-1 size-3.5" /> Back to Newsletters
          </Link>
        </Button>
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">Campaign not found.</p>
        </Card>
      </div>
    );
  }

  const isReadOnly = campaign.status === "SENDING";

  return (
    <div className="space-y-6">
      {/* Header & Actions Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Button asChild variant="outline" size="icon" className="size-8 shrink-0">
            <Link href="/newsletters">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl truncate">
                {campaign.title}
              </h1>
              {getStatusBadge(campaign.status)}
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
              {campaign.status === "SENT"
                ? `Sent on ${campaign.sentAt ? new Date(campaign.sentAt).toLocaleString() : "—"}`
                : campaign.status === "SCHEDULED"
                ? `Scheduled for ${campaign.scheduledAt ? new Date(campaign.scheduledAt).toLocaleString() : "—"}`
                : `Created on ${new Date(campaign.createdAt).toLocaleDateString()}`}
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

          {campaign.status === "DRAFT" && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsScheduleOpen(true)}
                className="gap-1.5 text-xs text-blue-500 hover:bg-blue-500/10"
              >
                <Clock className="size-3.5" />
                Schedule
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsSendConfirmOpen(true)}
                className="gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
              >
                <Send className="size-3.5" />
                Broadcast Now
              </Button>
            </>
          )}

          {(campaign.status === "SCHEDULED" ||
            campaign.status === "SENDING") && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancelBroadcast}
              className="gap-1.5 text-xs text-amber-500 hover:bg-amber-500/10"
            >
              <StopCircle className="size-3.5" />
              Cancel Broadcast
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSyncWithPlunk}
            className="gap-1.5 text-xs text-primary hover:bg-primary/10"
            title="Pull latest statistics, open rates, and status from Plunk"
          >
            <RefreshCw className="size-3.5" />
            Sync with Plunk
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDuplicate}
            className="gap-1.5 text-xs"
          >
            <Copy className="size-3.5" />
            Duplicate
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isSaving || isReadOnly}
            className="gap-1.5 text-xs shadow-xs"
          >
            <Save className="size-3.5" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Broadcast Progress Summary Card (if sent or sending) */}
      {(campaign.status === "SENT" ||
        campaign.status === "SENDING" ||
        campaign.status === "FAILED") && (
        <Card className="border-border/80 bg-card/60">
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Broadcast Execution Summary
                  </div>
                  {campaign.plunkCampaignId && (
                    <Badge variant="outline" className="font-mono text-[10px] text-primary border-primary/30">
                      Plunk ID: {campaign.plunkCampaignId.slice(0, 8)}...
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Delivered to{" "}
                  <strong className="text-emerald-500">
                    {(campaign.deliveredCount || campaign.successfulSends).toLocaleString()}
                  </strong>{" "}
                  of{" "}
                  <strong>{campaign.totalRecipients.toLocaleString()}</strong>{" "}
                  recipients.
                  {campaign.failedSends > 0 && (
                    <span className="text-rose-500 ml-1">
                      ({campaign.failedSends} failed)
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSyncWithPlunk}
                  className="h-8 gap-1.5 text-xs text-primary hover:bg-primary/10"
                >
                  <RefreshCw className="size-3" />
                  Refresh Plunk Stats
                </Button>
                <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                  <Link href={`/newsletters/${campaign.id}/logs`}>
                    <FileText className="mr-1 size-3.5" />
                    View Full Logs
                  </Link>
                </Button>
              </div>
            </div>

            {/* Plunk Live Engagement Metric Tiles */}
            <div className="grid grid-cols-2 gap-3 pt-1 sm:grid-cols-4">
              <div className="rounded-lg border border-border/60 bg-background/50 p-2.5">
                <div className="text-[10px] uppercase font-semibold text-muted-foreground">
                  Delivered Emails
                </div>
                <div className="text-lg font-bold text-foreground">
                  {(campaign.deliveredCount || campaign.successfulSends).toLocaleString()}
                </div>
              </div>

              <div className="rounded-lg border border-border/60 bg-background/50 p-2.5">
                <div className="text-[10px] uppercase font-semibold text-muted-foreground">
                  Unique Opens
                </div>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {(campaign.openedCount || 0).toLocaleString()}
                  {campaign.deliveredCount && campaign.deliveredCount > 0 ? (
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      ({Math.round(((campaign.openedCount || 0) / campaign.deliveredCount) * 100)}%)
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="rounded-lg border border-border/60 bg-background/50 p-2.5">
                <div className="text-[10px] uppercase font-semibold text-muted-foreground">
                  Link Clicks
                </div>
                <div className="text-lg font-bold text-blue-500">
                  {(campaign.clickedCount || 0).toLocaleString()}
                  {campaign.openedCount && campaign.openedCount > 0 ? (
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      ({Math.round(((campaign.clickedCount || 0) / campaign.openedCount) * 100)}%)
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="rounded-lg border border-border/60 bg-background/50 p-2.5">
                <div className="text-[10px] uppercase font-semibold text-muted-foreground">
                  Bounced
                </div>
                <div className="text-lg font-bold text-rose-500">
                  {(campaign.bouncedCount || campaign.failedSends || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-2">
          <TabsList className="grid w-full grid-cols-4 max-w-xl">
            <TabsTrigger value="composer" className="gap-1.5 text-xs">
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
            <TabsTrigger value="logs" className="gap-1.5 text-xs">
              <FileText className="size-3.5" />
              <span>Logs ({campaign.totalRecipients})</span>
            </TabsTrigger>
          </TabsList>

          {/* View Switcher (Active on Compose tab) */}
          {activeTab === "composer" && (
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

        {/* Tab 1: Composer & Live Preview */}
        <TabsContent value="composer" className="space-y-4 pt-1">
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

        {/* Tab 2: Audience */}
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

        {/* Tab 4: Delivery Logs */}
        <TabsContent value="logs" className="space-y-4 pt-1">
          <CampaignLogsTable newsletterId={campaign.id} />
        </TabsContent>
      </Tabs>

      {/* Dialog Modals */}
      <TestSendDialog
        open={isTestSendOpen}
        onOpenChange={setIsTestSendOpen}
        newsletterId={campaign.id}
        subject={subject}
        previewText={previewText}
        content={content}
        senderName={senderName}
        senderEmail={senderEmail}
      />

      <ScheduleDialog
        open={isScheduleOpen}
        onOpenChange={setIsScheduleOpen}
        newsletterId={campaign.id}
        onScheduledSuccess={fetchCampaign}
      />

      <SendConfirmDialog
        open={isSendConfirmOpen}
        onOpenChange={setIsSendConfirmOpen}
        title={title}
        recipientCount={campaign.totalRecipients}
        spamScore={spamReport?.score ?? campaign.spamScore}
        onConfirmSend={handleConfirmSendNow}
        isSending={isSendingImmediate}
      />
    </div>
  );
}
