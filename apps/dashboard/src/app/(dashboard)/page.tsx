"use client"

import * as React from "react"
import Link from "next/link"
import {
  Layers,
  CalendarCheck,
  FileText,
  Cpu,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Clock,
  Briefcase,
  Mail,
  Eye,
  ThumbsUp,
  MessageSquare,
  Users,
  TrendingUp,
  RefreshCw,
  Video,
  Activity,
  BarChart3,
  Calendar,
  Check,
  Copy,
  FolderTree,
  AlertCircle,
} from "lucide-react"

import type {
  BlogStatsDTO,
  CaseStudyStatsDTO,
  BookingStats,
  Booking,
  SubscriberStats,
  SkillStatsDTO,
  CommentModerationStatsDTO,
  CaseStudyListItemDTO,
  BlogPostListItemDTO,
} from "@workspace/shared"
import {
  BlogApi,
  CaseStudyApi,
  bookingApi,
  SubscriberApi,
  SkillApi,
  CommentApi,
} from "@/lib/api"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

export default function DashboardOverviewPage() {
  const [blogStats, setBlogStats] = React.useState<BlogStatsDTO | null>(null)
  const [caseStudyStats, setCaseStudyStats] =
    React.useState<CaseStudyStatsDTO | null>(null)
  const [bookingStats, setBookingStats] = React.useState<BookingStats | null>(
    null
  )
  const [subscriberStats, setSubscriberStats] =
    React.useState<SubscriberStats | null>(null)
  const [skillStats, setSkillStats] = React.useState<SkillStatsDTO | null>(null)
  const [commentStats, setCommentStats] =
    React.useState<CommentModerationStatsDTO | null>(null)

  const [recentBookings, setRecentBookings] = React.useState<Booking[]>([])
  const [recentCaseStudies, setRecentCaseStudies] = React.useState<
    CaseStudyListItemDTO[]
  >([])
  const [topBlogPosts, setTopBlogPosts] = React.useState<BlogPostListItemDTO[]>(
    []
  )
  const [isLoading, setIsLoading] = React.useState(true)
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  const loadDashboardData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const [
        bStatsRes,
        cStatsRes,
        bkStatsRes,
        subStatsRes,
        skStatsRes,
        cmStatsRes,
        bookingsRes,
        caseStudiesRes,
        blogPostsRes,
      ] = await Promise.allSettled([
        BlogApi.getStats(),
        CaseStudyApi.getStats(),
        bookingApi.getStats(),
        SubscriberApi.getStats(),
        SkillApi.getStats(),
        CommentApi.getStats(),
        bookingApi.getBookings({ limit: 5 }),
        CaseStudyApi.getAll({ limit: 3, sortBy: "order", sortOrder: "asc" }),
        BlogApi.getAll({ limit: 5, sortBy: "views", sortOrder: "desc" }),
      ])

      if (
        bStatsRes.status === "fulfilled" &&
        bStatsRes.value.success &&
        bStatsRes.value.data
      ) {
        setBlogStats(bStatsRes.value.data)
      }
      if (
        cStatsRes.status === "fulfilled" &&
        cStatsRes.value.success &&
        cStatsRes.value.data
      ) {
        setCaseStudyStats(cStatsRes.value.data)
      }
      if (
        bkStatsRes.status === "fulfilled" &&
        bkStatsRes.value.success &&
        bkStatsRes.value.data
      ) {
        setBookingStats(bkStatsRes.value.data)
      }
      if (
        subStatsRes.status === "fulfilled" &&
        subStatsRes.value.success &&
        subStatsRes.value.data
      ) {
        setSubscriberStats(subStatsRes.value.data)
      }
      if (
        skStatsRes.status === "fulfilled" &&
        skStatsRes.value.success &&
        skStatsRes.value.data
      ) {
        setSkillStats(skStatsRes.value.data)
      }
      if (
        cmStatsRes.status === "fulfilled" &&
        cmStatsRes.value.success &&
        cmStatsRes.value.data
      ) {
        setCommentStats(cmStatsRes.value.data)
      }
      if (
        bookingsRes.status === "fulfilled" &&
        bookingsRes.value.success &&
        bookingsRes.value.data
      ) {
        setRecentBookings(bookingsRes.value.data)
      }
      if (
        caseStudiesRes.status === "fulfilled" &&
        caseStudiesRes.value.success &&
        caseStudiesRes.value.data
      ) {
        setRecentCaseStudies(caseStudiesRes.value.data)
      }
      if (
        blogPostsRes.status === "fulfilled" &&
        blogPostsRes.value.success &&
        blogPostsRes.value.data
      ) {
        setTopBlogPosts(blogPostsRes.value.data)
      }
    } catch (err) {
      console.error("Failed to load dashboard overview data:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatDateTime = (dateStr: string | Date) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    } catch {
      return String(dateStr)
    }
  }

  // Pure Real Platform Metrics
  const totalViews =
    (blogStats?.totalViews ?? 0) + (caseStudyStats?.totalViews ?? 0)
  const totalLikes =
    (blogStats?.totalLikes ?? 0) + (caseStudyStats?.totalLikes ?? 0)
  const totalArticles = blogStats?.totalPosts ?? 0
  const publishedArticles = blogStats?.publishedPosts ?? 0
  const draftArticles = blogStats?.draftPosts ?? 0
  const scheduledArticles = blogStats?.scheduledPosts ?? 0
  const totalCaseStudies = caseStudyStats?.totalCaseStudies ?? 0
  const publishedCaseStudies = caseStudyStats?.publishedCount ?? 0
  const draftCaseStudies = caseStudyStats?.draftCount ?? 0
  const totalBookings = bookingStats?.total ?? 0
  const upcomingMeetings = bookingStats?.upcoming ?? 0
  const completedMeetings = bookingStats?.completed ?? 0
  const cancelledMeetings = bookingStats?.cancelled ?? 0
  const totalSubscribers = subscriberStats?.total ?? 0
  const activeSubscribers = subscriberStats?.subscribed ?? 0
  const pendingSubscribers = subscriberStats?.pending ?? 0
  const totalSkills = skillStats?.totalSkills ?? 0
  const totalSkillCategories = skillStats?.totalCategories ?? 0
  const totalComments = commentStats?.totalComments ?? 0
  const pendingComments = commentStats?.pendingCount ?? 0
  // Real Tech Stack Breakdown from Case Studies or Skills
  const realTechBreakdown = React.useMemo(() => {
    if (
      caseStudyStats?.techStackBreakdown &&
      caseStudyStats.techStackBreakdown.length > 0
    ) {
      return caseStudyStats.techStackBreakdown.slice(0, 6)
    }
    if (skillStats?.topTags && skillStats.topTags.length > 0) {
      return skillStats.topTags.slice(0, 6)
    }
    return []
  }, [caseStudyStats, skillStats])

  const maxTechCount = Math.max(...realTechBreakdown.map((t) => t.count), 1)

  // Real Platform Engagement Datasets
  const realEngagementMetrics = React.useMemo(() => {
    return [
      {
        label: "Blog Article Views",
        value: blogStats?.totalViews ?? 0,
        color: "oklch(var(--primary))",
        icon: Eye,
      },
      {
        label: "Case Study Reads",
        value: caseStudyStats?.totalViews ?? 0,
        color: "oklch(var(--chart-2))",
        icon: Layers,
      },
      {
        label: "Total Platform Likes",
        value: totalLikes,
        color: "oklch(var(--chart-3))",
        icon: ThumbsUp,
      },
      {
        label: "Active Subscribers",
        value: activeSubscribers,
        color: "oklch(var(--chart-4))",
        icon: Users,
      },
      {
        label: "Total Discussions",
        value: totalComments,
        color: "oklch(var(--chart-5))",
        icon: MessageSquare,
      },
    ]
  }, [blogStats, caseStudyStats, totalLikes, activeSubscribers, totalComments])

  const maxEngagementValue = Math.max(
    ...realEngagementMetrics.map((d) => d.value),
    1
  )

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Platform Overview
            </h1>
            <Badge
              variant="secondary"
              className="border border-primary/30 bg-primary/10 font-mono text-xs text-primary"
            >
              Live Telemetry
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Central real-time telemetry hub for case studies, technical
            articles, client bookings, and platform engagement.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboardData}
            disabled={isLoading}
            className="gap-1.5"
          >
            <RefreshCw
              className={`size-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </Button>

          <Button variant="outline" size="sm" asChild>
            <Link href="/resume" className="gap-1.5">
              <FileText className="size-3.5 text-primary" />
              <span>Resume</span>
            </Link>
          </Button>

          <Button
            size="sm"
            asChild
            className="bg-primary text-primary-foreground hover:brightness-110"
          >
            <Link href="/bookings" className="gap-1.5">
              <CalendarCheck className="size-3.5" />
              <span>Manage Bookings</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Top 6 KPI Performance Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* Case Studies */}
        <Card className="relative overflow-hidden border-border/80 bg-card/60 backdrop-blur-xs transition-all hover:border-primary/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-mono text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Case Studies
            </CardTitle>
            <div className="flex size-7 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
              <Layers className="size-3.5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold tracking-tight text-foreground">
              {totalCaseStudies}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>{publishedCaseStudies} Published</span>
              <span className="font-mono text-[10px] font-semibold text-emerald-500">
                [{draftCaseStudies} Draft]
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Consultations */}
        <Card className="relative overflow-hidden border-border/80 bg-card/60 backdrop-blur-xs transition-all hover:border-primary/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-mono text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Consultations
            </CardTitle>
            <div className="flex size-7 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
              <CalendarCheck className="size-3.5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold tracking-tight text-foreground">
              {upcomingMeetings}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>{totalBookings} Total Calls</span>
              <span className="font-mono text-[10px] font-semibold text-primary">
                [{completedMeetings} Done]
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Blog Posts */}
        <Card className="relative overflow-hidden border-border/80 bg-card/60 backdrop-blur-xs transition-all hover:border-primary/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-mono text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Articles & SEO
            </CardTitle>
            <div className="flex size-7 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
              <FileText className="size-3.5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold tracking-tight text-foreground">
              {totalArticles}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>{publishedArticles} Published</span>
              <span className="font-mono text-[10px] font-semibold text-blue-400">
                [{draftArticles} Draft]
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Total Traffic / Reads */}
        <Card className="relative overflow-hidden border-border/80 bg-card/60 backdrop-blur-xs transition-all hover:border-primary/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-mono text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Total Reads
            </CardTitle>
            <div className="flex size-7 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
              <Eye className="size-3.5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold tracking-tight text-foreground">
              {totalViews > 999
                ? `${(totalViews / 1000).toFixed(1)}k`
                : totalViews}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>{totalLikes} Total Likes</span>
              <span className="font-mono text-[10px] font-semibold text-purple-400">
                [{blogStats?.totalViews ?? 0} Blog]
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Newsletter Subscribers */}
        <Card className="relative overflow-hidden border-border/80 bg-card/60 backdrop-blur-xs transition-all hover:border-primary/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-mono text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Subscribers
            </CardTitle>
            <div className="flex size-7 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
              <Mail className="size-3.5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold tracking-tight text-foreground">
              {totalSubscribers}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>{activeSubscribers} Active</span>
              <span className="font-mono text-[10px] font-semibold text-emerald-400">
                [{pendingSubscribers} Pending]
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Verified Skills & Stack */}
        <Card className="relative overflow-hidden border-border/80 bg-card/60 backdrop-blur-xs transition-all hover:border-primary/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-mono text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Verified Skills
            </CardTitle>
            <div className="flex size-7 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
              <Cpu className="size-3.5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold tracking-tight text-foreground">
              {totalSkills}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>{totalSkillCategories} Domains</span>
              <span className="font-mono text-[10px] text-muted-foreground">
                Stack verified
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics & Graphs Section */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Real Engagement & Reach Telemetry (7 cols) */}
        <Card className="border-border/80 lg:col-span-7">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                <BarChart3 className="size-4 text-primary" />
                Audience & Traffic Distribution
              </CardTitle>
              <CardDescription>
                Live comparison of readership, case study deep-dives, community
                reactions, and audience reach.
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="border-primary/30 font-mono text-xs text-primary"
            >
              Live Data
            </Badge>
          </CardHeader>
          <CardContent className="space-y-5 pt-2">
            {/* Real SVG Activity Chart */}
            <div className="relative flex h-28 w-full flex-col justify-between overflow-hidden rounded-md border border-border/50 bg-card/40 p-3">
              <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-primary" /> Blog
                  Views: {blogStats?.totalViews ?? 0}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-chart-2" /> Systems
                  Reads: {caseStudyStats?.totalViews ?? 0}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500" />{" "}
                  Subscribers: {activeSubscribers}
                </span>
              </div>

              {/* Dynamic SVG Bars based on real counts */}
              <div className="flex h-14 w-full items-end gap-3 pt-2">
                {realEngagementMetrics.map((m) => {
                  const barHeight =
                    maxEngagementValue > 0
                      ? Math.max((m.value / maxEngagementValue) * 100, 6)
                      : 6
                  return (
                    <div
                      key={m.label}
                      className="group flex h-full flex-1 flex-col items-center justify-end gap-1"
                    >
                      <div
                        className="w-full rounded-t-sm transition-all duration-500 hover:brightness-125"
                        style={{
                          height: `${barHeight}%`,
                          backgroundColor: m.color,
                        }}
                        title={`${m.label}: ${m.value.toLocaleString()}`}
                      />
                      <span className="w-full truncate text-center font-mono text-[9px] text-muted-foreground">
                        {m.value > 999
                          ? `${(m.value / 1000).toFixed(1)}k`
                          : m.value}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Horizontal Bar Breakdown of Core Metrics */}
            <div className="space-y-3">
              {realEngagementMetrics.map((item) => {
                const percentage =
                  maxEngagementValue > 0
                    ? Math.round((item.value / maxEngagementValue) * 100)
                    : 0
                const IconComponent = item.icon
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-medium text-foreground">
                        <IconComponent className="size-3.5 text-muted-foreground" />
                        {item.label}
                      </span>
                      <span className="font-mono font-semibold text-foreground">
                        {item.value.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(percentage, item.value > 0 ? 3 : 0)}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tech Stack Distribution & Platform Pipelines (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Tech Stack & Architectural Domains Graph */}
          <Card className="border-border/80">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                  <Cpu className="size-4 text-primary" />
                  Tech Stack Ecosystem
                </CardTitle>
                <CardDescription>
                  Real architectural distribution across platform records.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="gap-1 text-xs"
              >
                <Link href="/skills">
                  View Skills
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {realTechBreakdown.length > 0 ? (
                realTechBreakdown.map((tech) => {
                  const percent = Math.round((tech.count / maxTechCount) * 100)
                  return (
                    <div key={tech.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">
                          {tech.name}
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {tech.count} {tech.count === 1 ? "record" : "records"}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
                        <div
                          className="h-full rounded-full bg-primary/80 transition-all duration-500"
                          style={{ width: `${Math.max(percent, 8)}%` }}
                        />
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="rounded-md border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                  No technologies recorded yet. Add skills or case studies to
                  populate the ecosystem graph.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Platform Status & Lifecycle Breakdown */}
          <Card className="border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Activity className="size-4 text-primary" />
                Platform Lifecycle & Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {/* Blog Status Segment */}
              <div className="space-y-1">
                <div className="flex justify-between text-muted-foreground">
                  <span>Articles Status</span>
                  <span className="font-mono text-[11px]">
                    {publishedArticles} Pub / {draftArticles} Draft /{" "}
                    {scheduledArticles} Sched
                  </span>
                </div>
                <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                  {totalArticles > 0 ? (
                    <>
                      <div
                        className="bg-emerald-500 transition-all"
                        style={{
                          width: `${(publishedArticles / totalArticles) * 100}%`,
                        }}
                        title="Published"
                      />
                      <div
                        className="bg-amber-500 transition-all"
                        style={{
                          width: `${(draftArticles / totalArticles) * 100}%`,
                        }}
                        title="Drafts"
                      />
                      <div
                        className="bg-blue-500 transition-all"
                        style={{
                          width: `${(scheduledArticles / totalArticles) * 100}%`,
                        }}
                        title="Scheduled"
                      />
                    </>
                  ) : (
                    <div className="size-full bg-muted" />
                  )}
                </div>
              </div>

              {/* Consultation Bookings Segment */}
              <div className="space-y-1">
                <div className="flex justify-between text-muted-foreground">
                  <span>Consultations Pipeline</span>
                  <span className="font-mono text-[11px]">
                    {upcomingMeetings} Upcoming / {completedMeetings} Done /{" "}
                    {cancelledMeetings} Canc
                  </span>
                </div>
                <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                  {totalBookings > 0 ? (
                    <>
                      <div
                        className="bg-primary transition-all"
                        style={{
                          width: `${(upcomingMeetings / totalBookings) * 100}%`,
                        }}
                        title="Upcoming"
                      />
                      <div
                        className="bg-slate-400 transition-all"
                        style={{
                          width: `${(completedMeetings / totalBookings) * 100}%`,
                        }}
                        title="Completed"
                      />
                      <div
                        className="bg-rose-500 transition-all"
                        style={{
                          width: `${(cancelledMeetings / totalBookings) * 100}%`,
                        }}
                        title="Cancelled"
                      />
                    </>
                  ) : (
                    <div className="size-full bg-muted" />
                  )}
                </div>
              </div>

              {/* Community & Comments Status */}
              <div className="flex items-center justify-between border-t border-border/50 pt-1 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MessageSquare className="size-3.5" /> Comments Queue
                </span>
                <span className="font-mono font-medium text-foreground">
                  {pendingComments} pending review / {totalComments} total
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Bottom Grid: Live Consultations + Featured Case Studies */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Client & Recruiter Consultations Table (7 Cols) */}
        <Card className="border-border/80 lg:col-span-7">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                <Calendar className="size-4 text-primary" />
                Client & Recruiter Consultations
              </CardTitle>
              <CardDescription>
                Live bookings, advisory sessions, and Google Meet appointments.
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
              <Link href="/bookings">
                Manage
                <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Attendee & Topic</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6 text-right">
                    Schedule & Link
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBookings.length > 0 ? (
                  recentBookings.map((inq) => (
                    <TableRow key={inq.id} className="hover:bg-muted/40">
                      <TableCell className="pl-6">
                        <div className="text-xs font-medium text-foreground">
                          {inq.guestName}
                        </div>
                        <div
                          className="max-w-[200px] truncate text-[11px] text-muted-foreground"
                          title={inq.guestNotes || inq.guestEmail}
                        >
                          {inq.guestNotes || inq.guestEmail}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {inq.meetingType || "Consultation"}
                      </TableCell>
                      <TableCell>
                        {inq.status === "CONFIRMED" ? (
                          <Badge
                            variant="default"
                            className="gap-1 border-emerald-500/20 bg-emerald-500/10 text-[10px] text-emerald-400"
                          >
                            <CheckCircle2 className="size-2.5" />
                            Confirmed
                          </Badge>
                        ) : inq.status === "PENDING" ? (
                          <Badge
                            variant="secondary"
                            className="gap-1 border-primary/20 bg-primary/10 text-[10px] text-primary"
                          >
                            <Clock className="size-2.5" />
                            Pending
                          </Badge>
                        ) : inq.status === "COMPLETED" ? (
                          <Badge
                            variant="outline"
                            className="gap-1 text-[10px] text-muted-foreground"
                          >
                            Completed
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="gap-1 border-destructive/20 bg-destructive/10 text-[10px] text-destructive"
                          >
                            Cancelled
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="pr-6 text-right font-mono text-[11px] text-muted-foreground">
                        <div>{formatDateTime(inq.startTime)}</div>
                        {inq.googleMeetLink && (
                          <div className="mt-0.5 flex items-center justify-end gap-1">
                            <a
                              href={inq.googleMeetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
                            >
                              <Video className="size-2.5 text-blue-400" />
                              Join Meet
                            </a>
                            <button
                              type="button"
                              onClick={() =>
                                copyToClipboard(inq.googleMeetLink!, inq.id)
                              }
                              className="text-muted-foreground hover:text-foreground"
                              title="Copy Link"
                            >
                              {copiedId === inq.id ? (
                                <Check className="size-2.5 text-emerald-400" />
                              ) : (
                                <Copy className="size-2.5" />
                              )}
                            </button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-28 text-center text-xs text-muted-foreground"
                    >
                      No consultation bookings found in the database.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Featured Case Studies & Quick Hub Actions (5 Cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Top Featured Case Studies */}
          <Card className="border-border/80">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                  <Layers className="size-4 text-primary" />
                  Featured Case Studies
                </CardTitle>
                <CardDescription>
                  High-impact systems & technical deep dives.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="gap-1 text-xs"
              >
                <Link href="/case-studies">
                  Manage
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentCaseStudies.length > 0 ? (
                recentCaseStudies.map((sys) => (
                  <div
                    key={sys.id}
                    className="rounded-md border border-border bg-card/40 p-3 text-xs transition-colors hover:border-primary/40 hover:bg-card/70"
                  >
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/case-studies/${sys.id}/preview`}
                        className="flex items-center gap-1 font-semibold text-foreground transition-colors hover:text-primary"
                      >
                        {sys.title}
                        <ExternalLink className="size-3 text-muted-foreground" />
                      </Link>
                      <Badge
                        variant="outline"
                        className="border-primary/20 font-mono text-[9px] text-primary"
                      >
                        {sys.role || sys.projectType}
                      </Badge>
                    </div>
                    <p className="mt-1 line-clamp-2 leading-relaxed text-muted-foreground">
                      {sys.impact || sys.description}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-1 font-mono text-[10px] text-muted-foreground/80">
                      {sys.techStack.slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="rounded bg-muted/60 px-1 py-0.5"
                        >
                          {tech}
                        </span>
                      ))}
                      {sys.views > 0 && (
                        <span className="ml-auto flex items-center gap-0.5 text-primary">
                          <Eye className="size-2.5" /> {sys.views}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  No case studies published yet. Create one to showcase
                  architectural impact.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Hub Navigation */}
          <Card className="border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground">
                Platform Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 justify-start gap-2 text-xs"
                asChild
              >
                <Link href="/case-studies">
                  <Layers className="size-3.5 text-primary" />
                  <span>Case Studies</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 justify-start gap-2 text-xs"
                asChild
              >
                <Link href="/blogs">
                  <FileText className="size-3.5 text-primary" />
                  <span>Blog Posts</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 justify-start gap-2 text-xs"
                asChild
              >
                <Link href="/bookings">
                  <CalendarCheck className="size-3.5 text-primary" />
                  <span>Bookings</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 justify-start gap-2 text-xs"
                asChild
              >
                <Link href="/newsletters">
                  <Mail className="size-3.5 text-primary" />
                  <span>Newsletters</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 justify-start gap-2 text-xs"
                asChild
              >
                <Link href="/comments">
                  <MessageSquare className="size-3.5 text-primary" />
                  <span>Comments</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 justify-start gap-2 text-xs"
                asChild
              >
                <Link href="/skills">
                  <Cpu className="size-3.5 text-primary" />
                  <span>Skills & Stack</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
