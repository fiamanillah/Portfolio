// apps/dashboard/src/app/(dashboard)/newsletters/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import {
  Mail,
  Send,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Plus,
  RefreshCw,
  Sparkles,
  Layers,
  Percent,
} from "lucide-react";
import type {
  NewsletterItem,
  NewsletterStats,
  AudienceType,
  NewsletterStatus,
} from "@workspace/shared";
import { NewsletterApi } from "@/lib/api";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/components/card";
import { toast } from "@workspace/ui/components/sonner";
import { CampaignTable } from "./components/campaign-table";
import { TestSendDialog } from "./components/test-send-dialog";
import { ScheduleDialog } from "./components/schedule-dialog";
import { SendConfirmDialog } from "./components/send-confirm-dialog";

export default function NewslettersPage() {
  const [campaigns, setCampaigns] = React.useState<NewsletterItem[]>([]);
  const [stats, setStats] = React.useState<NewsletterStats>({
    totalCampaigns: 0,
    draftsCount: 0,
    scheduledCount: 0,
    sendingCount: 0,
    sentCount: 0,
    totalEmailsSent: 0,
    totalEmailsFailed: 0,
    averageDeliveryRate: 100,
    recentCampaigns7d: 0,
  });
  const [isLoading, setIsLoading] = React.useState(true);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [audienceFilter, setAudienceFilter] = React.useState("ALL");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);
  const [totalCount, setTotalCount] = React.useState(0);

  // Dialog states
  const [selectedItem, setSelectedItem] =
    React.useState<NewsletterItem | null>(null);
  const [isTestSendOpen, setIsTestSendOpen] = React.useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = React.useState(false);
  const [isSendConfirmOpen, setIsSendConfirmOpen] = React.useState(false);
  const [isSendingImmediate, setIsSendingImmediate] = React.useState(false);

  // Debounced Search
  const [debouncedSearch, setDebouncedSearch] = React.useState(searchQuery);
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch KPI Stats
  const fetchStats = React.useCallback(async () => {
    try {
      const res = await NewsletterApi.getStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch Campaigns List
  const fetchCampaigns = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await NewsletterApi.list({
        page: currentPage,
        limit: pageSize,
        search: debouncedSearch || undefined,
        status: statusFilter !== "ALL" ? (statusFilter as NewsletterStatus) : undefined,
        targetAudience:
          audienceFilter !== "ALL" ? (audienceFilter as AudienceType) : undefined,
      });

      if (res.success && res.data) {
        setCampaigns(res.data);
        setTotalCount(res.pagination?.total || res.data.length);
      } else {
        toast.error("Failed to load campaigns", { description: res.error });
      }
    } catch (err: unknown) {
      toast.error("Network error fetching campaigns", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch, statusFilter, audienceFilter]);

  React.useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  React.useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Action Handlers
  const handleOpenSendTest = (item: NewsletterItem) => {
    setSelectedItem(item);
    setIsTestSendOpen(true);
  };

  const handleOpenSchedule = (item: NewsletterItem) => {
    setSelectedItem(item);
    setIsScheduleOpen(true);
  };

  const handleOpenSendNow = (item: NewsletterItem) => {
    setSelectedItem(item);
    setIsSendConfirmOpen(true);
  };

  const handleConfirmSendNow = async () => {
    if (!selectedItem) return;
    try {
      setIsSendingImmediate(true);
      const res = await NewsletterApi.sendNow(selectedItem.id);
      if (res.success) {
        toast.success("Broadcast initiated!", {
          description: `Campaign "${selectedItem.title}" is streaming to recipients.`,
        });
        setIsSendConfirmOpen(false);
        fetchCampaigns();
        fetchStats();
      } else {
        toast.error("Failed to start broadcast", { description: res.error });
      }
    } catch (err: unknown) {
      toast.error("Error broadcasting campaign", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setIsSendingImmediate(false);
    }
  };

  const handleCancelBroadcast = async (item: NewsletterItem) => {
    try {
      const res = await NewsletterApi.cancel(item.id);
      if (res.success) {
        toast.success("Broadcast cancelled", {
          description: `Campaign "${item.title}" schedule cancelled.`,
        });
        fetchCampaigns();
        fetchStats();
      } else {
        toast.error("Failed to cancel", { description: res.error });
      }
    } catch (err: unknown) {
      toast.error("Error cancelling broadcast", { description: err instanceof Error ? err.message : undefined });
    }
  };

  const handleDuplicate = async (item: NewsletterItem) => {
    toast.promise(
      NewsletterApi.duplicate(item.id).then((res) => {
        if (!res.success) throw new Error(res.error || "Failed to duplicate");
        fetchCampaigns();
        fetchStats();
        return res.data;
      }),
      {
        loading: `Duplicating "${item.title}"...`,
        success: (data) => `Created duplicate "${data?.title}"`,
        error: (err) => err?.message || "Failed to duplicate campaign",
      }
    );
  };

  const handleSync = async (item: NewsletterItem) => {
    toast.promise(
      NewsletterApi.sync(item.id).then((res) => {
        if (!res.success) throw new Error(res.error || "Failed to sync with Plunk");
        fetchCampaigns();
        fetchStats();
        return res.data;
      }),
      {
        loading: `Syncing "${item.title}" with Plunk...`,
        success: "Campaign synchronized with Plunk successfully!",
        error: (err) => err?.message || "Sync with Plunk failed",
      }
    );
  };

  const handleDelete = async (item: NewsletterItem) => {
    if (!confirm(`Are you sure you want to delete campaign "${item.title}"?`)) {
      return;
    }
    try {
      const res = await NewsletterApi.delete(item.id);
      if (res.success) {
        toast.success("Campaign deleted successfully.");
        fetchCampaigns();
        fetchStats();
      } else {
        toast.error("Failed to delete campaign", { description: res.error });
      }
    } catch (err: unknown) {
      toast.error("Error deleting campaign", { description: err instanceof Error ? err.message : undefined });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Newsletter Broadcasts
            </h1>
            <Badge
              variant="outline"
              className="border-primary/30 font-mono text-xs text-primary"
            >
              Plunk Engine
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Author, test, schedule, and broadcast responsive engineering
            newsletters with anti-spam compliance and rate-limited Plunk
            delivery.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchCampaigns();
              fetchStats();
              toast.info("Refreshed newsletters");
            }}
            className="h-9 gap-1.5 text-xs"
            disabled={isLoading}
          >
            <RefreshCw
              className={`size-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <Button asChild size="sm" className="h-9 gap-1.5 text-xs shadow-xs">
            <Link href="/newsletters/new">
              <Plus className="size-4" />
              New Campaign
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Campaigns */}
        <Card className="border-border/80 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Campaigns
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Mail className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats.totalCampaigns}
            </div>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <span>{stats.sentCount} sent</span>
              <span>•</span>
              <span>{stats.draftsCount} drafts</span>
            </p>
          </CardContent>
        </Card>

        {/* Delivered Emails */}
        <Card className="border-border/80 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Emails Delivered
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.totalEmailsSent.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Across all historical broadcasts
            </p>
          </CardContent>
        </Card>

        {/* Average Delivery Rate */}
        <Card className="border-border/80 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Average Delivery Rate
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <Percent className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {stats.averageDeliveryRate}%
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {stats.totalEmailsFailed} failed sends recorded
            </p>
          </CardContent>
        </Card>

        {/* Scheduled / Sending Queue */}
        <Card className="border-border/80 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Scheduled Queue
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <Clock className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {stats.scheduledCount + stats.sendingCount}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {stats.sendingCount > 0
                ? `${stats.sendingCount} actively sending now`
                : "Awaiting dispatch trigger"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Data Table */}
      <CampaignTable
        data={campaigns}
        isLoading={isLoading}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        audienceFilter={audienceFilter}
        onAudienceFilterChange={setAudienceFilter}
        onRefresh={() => {
          fetchCampaigns();
          fetchStats();
        }}
        onSendTest={handleOpenSendTest}
        onSchedule={handleOpenSchedule}
        onSendNow={handleOpenSendNow}
        onCancel={handleCancelBroadcast}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        onSync={handleSync}
      />

      {/* Dialog Modals */}
      {selectedItem && (
        <>
          <TestSendDialog
            open={isTestSendOpen}
            onOpenChange={setIsTestSendOpen}
            newsletterId={selectedItem.id}
            subject={selectedItem.subject}
            previewText={selectedItem.previewText}
            senderName={selectedItem.senderName}
            senderEmail={selectedItem.senderEmail}
          />

          <ScheduleDialog
            open={isScheduleOpen}
            onOpenChange={setIsScheduleOpen}
            newsletterId={selectedItem.id}
            onScheduledSuccess={() => {
              fetchCampaigns();
              fetchStats();
            }}
          />

          <SendConfirmDialog
            open={isSendConfirmOpen}
            onOpenChange={setIsSendConfirmOpen}
            title={selectedItem.title}
            recipientCount={selectedItem.totalRecipients}
            spamScore={selectedItem.spamScore}
            onConfirmSend={handleConfirmSendNow}
            isSending={isSendingImmediate}
          />
        </>
      )}
    </div>
  );
}
