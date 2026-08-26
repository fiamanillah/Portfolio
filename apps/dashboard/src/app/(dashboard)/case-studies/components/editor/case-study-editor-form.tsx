"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Send,
  Save,
  Loader2,
  Calendar,
  Sparkles,
  Pin,
  FolderTree,
  Tag as TagIcon,
  Search,
  User,
  CheckCircle2,
  Globe,
  FolderGit2,
  Building,
  Layers,
  BookOpen,
  Plus,
  Trash2,
  ExternalLink,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Switch } from "@workspace/ui/components/switch"
import { Badge } from "@workspace/ui/components/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { toast } from "@workspace/ui/components/sonner"
import type {
  CaseStudyDTO,
  CaseStudyStatus,
  CaseStudyType,
  CaseStudyMetadataItem,
  ContextBlock,
  ArchitectureLayer,
  FeatureItem,
  PerformanceMetric,
  PostMortemSection,
  CaseStudySeo,
  CreateCaseStudyDTO,
  UpdateCaseStudyDTO,
} from "@workspace/shared"
import {
  CaseStudyApi,
  showApiError,
  extractFieldErrors,
  validateUrl,
  validateSlug,
  cleanUrl,
} from "@/lib/api"

// Editor Subcomponents
import { EditorHeader, type CaseStudyViewMode } from "./header/editor-header"
import { ContextTab } from "./context-tab"
import { ArchitectureTab } from "./architecture-tab"
import { FeaturesTab } from "./features-tab"
import { MetricsTab } from "./metrics-tab"
import { PostMortemTab } from "./post-mortem-tab"
import { MetadataTab } from "./metadata-tab"
import { MediaImagePicker } from "./common/media-image-picker"
import { CaseStudySeoSection } from "./seo/case-study-seo-section"
import { FrontendCaseStudyPreview } from "../preview/frontend-case-study-preview"

interface CaseStudyEditorFormProps {
  initialStudy?: CaseStudyDTO | null
  isEdit?: boolean
  onSuccessRedirect?: string
}

const POPULAR_TECHS = [
  "TypeScript",
  "Bun",
  "Node.js",
  "Next.js",
  "React",
  "PostgreSQL",
  "Prisma",
  "Redis",
  "Docker",
  "RabbitMQ",
  "Socket.IO",
  "Tailwind CSS",
  "GraphQL",
  "WebSockets",
]

export function CaseStudyEditorForm({
  initialStudy,
  isEdit = false,
  onSuccessRedirect = "/case-studies",
}: CaseStudyEditorFormProps) {
  const router = useRouter()
  const [viewMode, setViewMode] = React.useState<CaseStudyViewMode>("editor")
  const [activeStoryTab, setActiveStoryTab] = React.useState("context")
  const [isSaving, setIsSaving] = React.useState(false)
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>(
    {}
  )

  const clearFieldError = (key: string) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      const leaf = key.split(".").pop()
      if (leaf && next[leaf]) delete next[leaf]
      return next
    })
  }

  // 1. Core General Info
  const [title, setTitle] = React.useState(initialStudy?.title || "")
  const [subtitle, setSubtitle] = React.useState(initialStudy?.subtitle || "")
  const [slug, setSlug] = React.useState(initialStudy?.slug || "")
  const [hasManuallyEditedSlug, setHasManuallyEditedSlug] = React.useState(
    Boolean(initialStudy?.slug)
  )
  const [description, setDescription] = React.useState(
    initialStudy?.description || ""
  )
  const [impact, setImpact] = React.useState(initialStudy?.impact || "")
  const [projectType, setProjectType] = React.useState<CaseStudyType>(
    initialStudy?.projectType || "CASE_STUDY"
  )
  const [status, setStatus] = React.useState<CaseStudyStatus>(
    initialStudy?.status || "DRAFT"
  )
  const [projectStatus, setProjectStatus] = React.useState(
    initialStudy?.projectStatus || "Status: Completed"
  )
  const [order, setOrder] = React.useState(initialStudy?.order ?? 0)
  const [featured, setFeatured] = React.useState(
    Boolean(initialStudy?.featured)
  )
  const [pinned, setPinned] = React.useState(Boolean(initialStudy?.pinned))
  const [image, setImage] = React.useState(initialStudy?.image || "")
  const [imageLabel, setImageLabel] = React.useState(
    initialStudy?.imageLabel || ""
  )
  const [liveUrl, setLiveUrl] = React.useState(initialStudy?.liveUrl || "")
  const [githubUrl, setGithubUrl] = React.useState(
    initialStudy?.githubUrl || ""
  )
  const [role, setRole] = React.useState(initialStudy?.role || "")
  const [timeline, setTimeline] = React.useState(initialStudy?.timeline || "")
  const [client, setClient] = React.useState(initialStudy?.client || "")
  const [highlights, setHighlights] = React.useState<string[]>(
    initialStudy?.highlights || []
  )
  const [techStack, setTechStack] = React.useState<string[]>(
    initialStudy?.techStack || []
  )

  // 2. Interactive Technical Modules
  const [metadata, setMetadata] = React.useState<CaseStudyMetadataItem[]>(
    initialStudy?.metadata || []
  )
  const [contextBlocks, setContextBlocks] = React.useState<ContextBlock[]>(
    initialStudy?.contextBlocks || []
  )
  const [architectureLayers, setArchitectureLayers] = React.useState<
    ArchitectureLayer[]
  >(initialStudy?.architectureLayers || [])
  const [features, setFeatures] = React.useState<FeatureItem[]>(
    initialStudy?.features || []
  )
  const [metrics, setMetrics] = React.useState<PerformanceMetric[]>(
    initialStudy?.metrics || []
  )
  const [postMortem, setPostMortem] = React.useState<PostMortemSection[]>(
    initialStudy?.postMortem || []
  )

  // 3. SEO Settings
  const [seo, setSeo] = React.useState<CaseStudySeo>(
    initialStudy?.seo || {
      metaTitle: initialStudy?.metaTitle || "",
      metaDescription: initialStudy?.metaDescription || "",
      metaKeywords: initialStudy?.metaKeywords || [],
      ogTitle: initialStudy?.ogTitle || "",
      ogDescription: initialStudy?.ogDescription || "",
      ogImage: initialStudy?.ogImage || "",
      twitterCard: (initialStudy?.twitterCard as any) || "summary_large_image",
      canonicalUrl: initialStudy?.canonicalUrl || "",
    }
  )

  // Tech & Highlights Adder States
  const [techInput, setTechInput] = React.useState("")
  const [highlightInput, setHighlightInput] = React.useState("")

  // Auto-generate slug when title changes
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    clearFieldError("title")
    if (!hasManuallyEditedSlug && !isEdit) {
      const generated = newTitle
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")
      setSlug(generated)
    }
  }

  const handleGenerateSlug = () => {
    if (!title) return
    const generated = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
    setSlug(generated)
    clearFieldError("slug")
  }

  const handleAddTech = (techToAdd?: string) => {
    const target = (techToAdd || techInput).trim()
    if (target && !techStack.includes(target)) {
      setTechStack([...techStack, target])
      if (!techToAdd) setTechInput("")
    }
  }

  const handleRemoveTech = (techToRemove: string) => {
    setTechStack(techStack.filter((t) => t !== techToRemove))
  }

  const handleAddHighlight = () => {
    const val = highlightInput.trim()
    if (val && !highlights.includes(val)) {
      setHighlights([...highlights, val])
      setHighlightInput("")
    }
  }

  const handleRemoveHighlight = (item: string) => {
    setHighlights(highlights.filter((h) => h !== item))
  }

  const buildPayload = (overrideStatus?: CaseStudyStatus) => {
    const finalStatus = overrideStatus || status
    return {
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      slug: slug.trim() || undefined,
      description: description.trim(),
      projectType,
      status: finalStatus,
      projectStatus: projectStatus.trim(),
      order,
      featured,
      pinned,
      techStack,
      liveUrl: cleanUrl(liveUrl),
      githubUrl: cleanUrl(githubUrl),
      image: image.trim(),
      imageLabel: imageLabel.trim() || undefined,
      role: role.trim() || undefined,
      timeline: timeline.trim() || undefined,
      client: client.trim() || undefined,
      impact: impact.trim() || undefined,
      highlights,
      metadata,
      contextBlocks,
      architectureLayers,
      features,
      metrics,
      postMortem,
      seo: {
        ...seo,
        metaTitle: seo.metaTitle?.trim() || undefined,
        metaDescription: seo.metaDescription?.trim() || undefined,
        canonicalUrl: cleanUrl(seo.canonicalUrl),
        ogTitle: seo.ogTitle?.trim() || undefined,
        ogDescription: seo.ogDescription?.trim() || undefined,
        ogImage: seo.ogImage?.trim() || undefined,
        twitterTitle: seo.twitterTitle?.trim() || undefined,
        twitterDescription: seo.twitterDescription?.trim() || undefined,
        twitterImage: seo.twitterImage?.trim() || undefined,
      },
    }
  }

  const handleSave = async (overrideStatus?: CaseStudyStatus) => {
    const clientErrors: Record<string, string> = {}

    if (!title.trim()) {
      clientErrors.title = "Case Study title is required"
    }
    if (!description.trim()) {
      clientErrors.description = "Summary description is required"
    }
    if (!image.trim()) {
      clientErrors.image = "Cover image artwork is required"
    }

    if (slug.trim()) {
      const slugValidation = validateSlug(slug, "URL Slug")
      if (!slugValidation.valid && slugValidation.error) {
        clientErrors.slug = slugValidation.error
      }
    }

    if (liveUrl.trim()) {
      const liveValidation = validateUrl(liveUrl, "Live Demo URL")
      if (!liveValidation.valid && liveValidation.error) {
        clientErrors.liveUrl = liveValidation.error
      }
    }

    if (githubUrl.trim()) {
      const githubValidation = validateUrl(githubUrl, "GitHub URL")
      if (!githubValidation.valid && githubValidation.error) {
        clientErrors.githubUrl = githubValidation.error
      }
    }

    if (seo.canonicalUrl && seo.canonicalUrl.trim()) {
      const canonValidation = validateUrl(seo.canonicalUrl, "Canonical URL")
      if (!canonValidation.valid && canonValidation.error) {
        clientErrors["seo.canonicalUrl"] = canonValidation.error
      }
    }

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors)
      const firstKey = Object.keys(clientErrors)[0]
      if (firstKey) {
        toast.error(`Validation Error: ${clientErrors[firstKey]}`)
      }
      return
    }

    setFieldErrors({})
    setIsSaving(true)

    try {
      const payload = buildPayload(overrideStatus)

      if (isEdit && initialStudy?.id) {
        const res = await CaseStudyApi.update(
          initialStudy.id,
          payload as UpdateCaseStudyDTO
        )
        if (res.success && res.data) {
          toast.success(
            overrideStatus === "PUBLISHED"
              ? "Case study published successfully!"
              : "Saved changes to case study"
          )
          router.push(onSuccessRedirect)
          router.refresh()
        } else {
          showApiError(res, "Failed to update case study")
          setFieldErrors(extractFieldErrors(res))
        }
      } else {
        const res = await CaseStudyApi.create(payload as CreateCaseStudyDTO)
        if (res.success && res.data) {
          toast.success(
            overrideStatus === "PUBLISHED"
              ? "Case study published successfully!"
              : "Created draft case study"
          )
          router.push(onSuccessRedirect)
          router.refresh()
        } else {
          showApiError(res, "Failed to create case study")
          setFieldErrors(extractFieldErrors(res))
        }
      }
    } catch (err: unknown) {
      showApiError(err, "An unexpected error occurred")
    } finally {
      setIsSaving(false)
    }
  }

  // Current preview data representation
  const previewData: Partial<CaseStudyDTO> = {
    title: title || "Untitled Case Study",
    subtitle,
    slug: slug || "case-study-slug",
    description,
    impact,
    projectType,
    status,
    projectStatus,
    role,
    timeline,
    client,
    image: image || "/assets/images/mickanic-cover.png",
    imageLabel,
    liveUrl,
    githubUrl,
    highlights,
    techStack,
    metadata,
    contextBlocks,
    architectureLayers,
    features,
    metrics,
    postMortem,
    views: initialStudy?.views ?? 1250,
    likesCount: initialStudy?.likesCount ?? 48,
  }

  return (
    <div className="space-y-6">
      {/* Sticky Header Action Bar */}
      <EditorHeader
        isEdit={isEdit}
        title={title}
        slug={slug}
        status={status}
        onStatusChange={setStatus}
        isSaving={isSaving}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onBack={() => router.push(onSuccessRedirect)}
        onSaveDraft={() => handleSave("DRAFT")}
        onPublishOrSave={() => handleSave()}
      />

      {/* VIEW 1: 2-COLUMN MAIN WORKSTATION */}
      {viewMode === "editor" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* LEFT: MAIN CONTENT CANVAS (8 cols) */}
          <div className="space-y-5 lg:col-span-8">
            {/* 1. Overview & Narrative Card */}
            <div className="space-y-4 rounded-xl border border-border/80 bg-card p-4 shadow-xs sm:p-5">
              {/* Title */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                    Project / Case Study Title *
                  </label>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {title.length} chars
                  </span>
                </div>
                <Input
                  placeholder="e.g. Mickanic — Real-Time Bidding & High-Throughput Service Marketplace"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className={`h-10 bg-background text-sm font-bold sm:text-base ${
                    fieldErrors.title
                      ? "border-destructive focus:border-destructive"
                      : "border-border/90"
                  }`}
                  required
                />
                {fieldErrors.title && (
                  <p className="font-mono text-xs text-destructive">
                    ⚠ {fieldErrors.title}
                  </p>
                )}
              </div>

              {/* Subtitle & Role/Timeline Bar */}
              <div className="space-y-1">
                <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  Subtitle / Elevator Pitch
                </label>
                <Input
                  placeholder="e.g. Distributed Event-Driven Automotive Platform with WebSockets & Redis Pub/Sub"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="h-8.5 border-border/90 bg-background text-xs"
                />
              </div>

              {/* Summary Description */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                    Summary Description *
                  </label>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {description.length} chars
                  </span>
                </div>
                <Textarea
                  placeholder="Comprehensive architectural summary and core problem domain..."
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value)
                    clearFieldError("description")
                  }}
                  rows={3}
                  className={`bg-background text-xs leading-relaxed ${
                    fieldErrors.description
                      ? "border-destructive focus:border-destructive"
                      : "border-border/90"
                  }`}
                  required
                />
                {fieldErrors.description && (
                  <p className="font-mono text-xs text-destructive">
                    ⚠ {fieldErrors.description}
                  </p>
                )}
              </div>

              {/* Impact & Key Engineering Achievements */}
              <div className="space-y-1">
                <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  Impact & Key Engineering Metrics
                </label>
                <Textarea
                  placeholder="Key metrics: 85% latency reduction, 10x concurrent bidding capacity, zero data loss..."
                  value={impact}
                  onChange={(e) => setImpact(e.target.value)}
                  rows={2}
                  className="border-border/90 bg-background text-xs leading-relaxed"
                />
              </div>

              {/* Live Demo & GitHub Repository Links */}
              <div className="grid grid-cols-1 gap-3 border-t border-border/70 pt-1 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                    <Globe className="h-3 w-3 text-primary" /> Live Demo URL
                  </label>
                  <Input
                    placeholder="https://mickanic.ca/"
                    value={liveUrl}
                    onChange={(e) => {
                      setLiveUrl(e.target.value)
                      clearFieldError("liveUrl")
                    }}
                    className={`h-8 bg-background font-mono text-xs ${
                      fieldErrors.liveUrl
                        ? "border-destructive focus:border-destructive"
                        : ""
                    }`}
                  />
                  {fieldErrors.liveUrl && (
                    <p className="font-mono text-[10px] text-destructive">
                      ⚠ {fieldErrors.liveUrl}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                    <FolderGit2 className="h-3 w-3 text-primary" /> GitHub
                    Repository URL
                  </label>
                  <Input
                    placeholder="https://github.com/..."
                    value={githubUrl}
                    onChange={(e) => {
                      setGithubUrl(e.target.value)
                      clearFieldError("githubUrl")
                    }}
                    className={`h-8 bg-background font-mono text-xs ${
                      fieldErrors.githubUrl
                        ? "border-destructive focus:border-destructive"
                        : ""
                    }`}
                  />
                  {fieldErrors.githubUrl && (
                    <p className="font-mono text-[10px] text-destructive">
                      ⚠ {fieldErrors.githubUrl}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Technical Story & Architecture Chapters */}
            <div className="space-y-4 rounded-xl border border-border/80 bg-card p-4 shadow-xs sm:p-5">
              <div className="flex items-center justify-between border-b border-border/70 pb-3">
                <span className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  <Layers className="h-3.5 w-3.5 text-primary" /> Technical
                  Architecture Studio
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  Interactive Modular Breakdown
                </span>
              </div>

              <Tabs
                value={activeStoryTab}
                onValueChange={setActiveStoryTab}
                className="space-y-4"
              >
                <TabsList className="grid h-auto w-full grid-cols-3 gap-1 border border-border/80 bg-muted/40 p-1 sm:grid-cols-6">
                  <TabsTrigger
                    value="context"
                    className="flex items-center justify-center gap-1 px-1.5 py-1 text-[11px] font-medium"
                  >
                    <span>Context</span>
                    {contextBlocks.length > 0 && (
                      <span className="rounded-full bg-primary/20 px-1 font-mono text-[9px] text-primary">
                        {contextBlocks.length}
                      </span>
                    )}
                  </TabsTrigger>

                  <TabsTrigger
                    value="architecture"
                    className="flex items-center justify-center gap-1 px-1.5 py-1 text-[11px] font-medium"
                  >
                    <span>Layers</span>
                    {architectureLayers.length > 0 && (
                      <span className="rounded-full bg-primary/20 px-1 font-mono text-[9px] text-primary">
                        {architectureLayers.length}
                      </span>
                    )}
                  </TabsTrigger>

                  <TabsTrigger
                    value="features"
                    className="flex items-center justify-center gap-1 px-1.5 py-1 text-[11px] font-medium"
                  >
                    <span>Features</span>
                    {features.length > 0 && (
                      <span className="rounded-full bg-primary/20 px-1 font-mono text-[9px] text-primary">
                        {features.length}
                      </span>
                    )}
                  </TabsTrigger>

                  <TabsTrigger
                    value="metrics"
                    className="flex items-center justify-center gap-1 px-1.5 py-1 text-[11px] font-medium"
                  >
                    <span>Metrics</span>
                    {metrics.length > 0 && (
                      <span className="rounded-full bg-primary/20 px-1 font-mono text-[9px] text-primary">
                        {metrics.length}
                      </span>
                    )}
                  </TabsTrigger>

                  <TabsTrigger
                    value="post-mortem"
                    className="flex items-center justify-center gap-1 px-1.5 py-1 text-[11px] font-medium"
                  >
                    <span>Lessons</span>
                    {postMortem.length > 0 && (
                      <span className="rounded-full bg-primary/20 px-1 font-mono text-[9px] text-primary">
                        {postMortem.length}
                      </span>
                    )}
                  </TabsTrigger>

                  <TabsTrigger
                    value="metadata"
                    className="flex items-center justify-center gap-1 px-1.5 py-1 text-[11px] font-medium"
                  >
                    <span>Specs</span>
                    {metadata.length > 0 && (
                      <span className="rounded-full bg-primary/20 px-1 font-mono text-[9px] text-primary">
                        {metadata.length}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>

                {/* Chapter 1: Context & Problems */}
                <TabsContent value="context" className="pt-1">
                  <ContextTab
                    contextBlocks={contextBlocks}
                    setContextBlocks={setContextBlocks}
                  />
                </TabsContent>

                {/* Chapter 2: Architecture Layers */}
                <TabsContent value="architecture" className="pt-1">
                  <ArchitectureTab
                    architectureLayers={architectureLayers}
                    setArchitectureLayers={setArchitectureLayers}
                  />
                </TabsContent>

                {/* Chapter 3: Key Features */}
                <TabsContent value="features" className="pt-1">
                  <FeaturesTab features={features} setFeatures={setFeatures} />
                </TabsContent>

                {/* Chapter 4: Performance Metrics */}
                <TabsContent value="metrics" className="pt-1">
                  <MetricsTab metrics={metrics} setMetrics={setMetrics} />
                </TabsContent>

                {/* Chapter 5: Post-Mortem & Lessons */}
                <TabsContent value="post-mortem" className="pt-1">
                  <PostMortemTab
                    postMortem={postMortem}
                    setPostMortem={setPostMortem}
                  />
                </TabsContent>

                {/* Chapter 6: Specs & Metadata */}
                <TabsContent value="metadata" className="pt-1">
                  <MetadataTab metadata={metadata} setMetadata={setMetadata} />
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* RIGHT: SETTINGS & PUBLISHING SIDEBAR (4 cols) */}
          <div className="space-y-4 lg:col-span-4">
            {/* 1. PUBLISH CONTROLS CARD */}
            <div className="space-y-3 rounded-xl border border-border/80 bg-card p-3.5 shadow-xs">
              <div className="flex items-center justify-between border-b border-border/70 pb-2.5">
                <span className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  <Send className="h-3.5 w-3.5 text-primary" /> Publishing
                  Actions
                </span>
                <Badge
                  variant={status === "PUBLISHED" ? "default" : "secondary"}
                  className="px-1.5 py-0 font-mono text-[9px] uppercase"
                >
                  {status}
                </Badge>
              </div>

              {/* Primary Action Button */}
              <Button
                type="button"
                onClick={() => handleSave()}
                disabled={isSaving}
                className="h-9 w-full gap-2 text-xs font-bold shadow-xs"
              >
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : status === "PUBLISHED" ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                <span>
                  {isEdit
                    ? status === "PUBLISHED"
                      ? "Update Case Study"
                      : "Save Changes"
                    : status === "PUBLISHED"
                      ? "Publish Study Now"
                      : "Save Draft Study"}
                </span>
              </Button>

              {/* Status Select */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">
                  Publication Status
                </label>
                <Select
                  value={status}
                  onValueChange={(val) => setStatus(val as CaseStudyStatus)}
                >
                  <SelectTrigger className="h-8 bg-background text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft (Unpublished)</SelectItem>
                    <SelectItem value="PUBLISHED">Published (Live)</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Showcase Depth Mode */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">
                  Showcase Depth Mode
                </label>
                <Select
                  value={projectType}
                  onValueChange={(val) => setProjectType(val as CaseStudyType)}
                >
                  <SelectTrigger className="h-8 bg-background text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASE_STUDY" className="text-xs">
                      🔬 Deep-Dive Architectural Study
                    </SelectItem>
                    <SelectItem value="PROJECT" className="text-xs">
                      ⚡ Quick Project Showcase
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Badge Text & Order */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">
                    Display Badge
                  </label>
                  <Input
                    placeholder="Status: Completed"
                    value={projectStatus}
                    onChange={(e) => setProjectStatus(e.target.value)}
                    className="h-8 bg-background font-mono text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">
                    Order Index
                  </label>
                  <Input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                    className="h-8 bg-background font-mono text-xs"
                  />
                </div>
              </div>

              {/* Featured & Pinned Switches */}
              <div className="space-y-2 border-t border-border/70 pt-2.5">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-xs font-semibold text-foreground">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />{" "}
                      Featured Project
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Display on homepage highlights
                    </div>
                  </div>
                  <Switch checked={featured} onCheckedChange={setFeatured} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-xs font-semibold text-foreground">
                      <Pin className="h-3.5 w-3.5 text-primary" /> Pinned
                      Project
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Pin to top of case study index
                    </div>
                  </div>
                  <Switch checked={pinned} onCheckedChange={setPinned} />
                </div>
              </div>
            </div>

            {/* 2. SPECIFICATIONS, TECH STACK & MEDIA CARD */}
            <div className="space-y-3 rounded-xl border border-border/80 bg-card p-3.5 shadow-xs">
              <div className="flex items-center justify-between border-b border-border/70 pb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  <FolderTree className="h-3.5 w-3.5 text-primary" /> Specs &
                  Tech Stack
                </span>
              </div>

              {/* Stakeholders: Role, Client, Timeline */}
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-muted-foreground">
                    My Role
                  </label>
                  <Input
                    placeholder="Lead Architect"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="h-8 bg-background text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-muted-foreground">
                    Client
                  </label>
                  <Input
                    placeholder="Mickanic Inc."
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    className="h-8 bg-background text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-muted-foreground">
                    Timeline
                  </label>
                  <Input
                    placeholder="2025 - 2026"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="h-8 bg-background text-xs"
                  />
                </div>
              </div>

              {/* URL Slug Input */}
              <div className="space-y-1 border-t border-border/70 pt-2.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                    <Globe className="h-3 w-3" /> URL Slug *
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateSlug}
                    className="font-mono text-[10px] text-primary hover:underline"
                  >
                    Auto-generate
                  </button>
                </div>
                <div className="flex items-center rounded-lg border border-border/90 bg-background px-2.5 py-1 text-xs">
                  <span className="font-mono text-[11px] text-muted-foreground select-none">
                    /case-study/
                  </span>
                  <input
                    value={slug}
                    onChange={(e) => {
                      setSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "")
                          .replace(/--+/g, "-")
                      )
                      setHasManuallyEditedSlug(true)
                      clearFieldError("slug")
                    }}
                    placeholder="my-case-study"
                    className="flex-1 border-0 bg-transparent px-1 font-mono text-xs text-foreground outline-none"
                  />
                </div>
                {fieldErrors.slug && (
                  <p className="font-mono text-[10px] text-destructive">
                    ⚠ {fieldErrors.slug}
                  </p>
                )}
              </div>

              {/* Tech Stack Chips & Adder */}
              <div className="space-y-1 border-t border-border/70 pt-2.5">
                <label className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                  <TagIcon className="h-3 w-3" /> Technology Stack
                </label>
                <div className="flex items-center gap-1.5">
                  <Input
                    placeholder="Add tech (e.g. Bun, Redis)..."
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault()
                        handleAddTech()
                      }
                    }}
                    className="h-8 bg-background font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddTech()}
                    disabled={!techInput.trim()}
                    className="h-8 shrink-0 px-2.5 text-xs"
                  >
                    +
                  </Button>
                </div>

                {/* Selected Stack Chips */}
                <div className="flex min-h-5 flex-wrap gap-1 pt-0.5">
                  {techStack.map((tech) => (
                    <Badge
                      key={tech}
                      variant="secondary"
                      className="gap-1 py-0.5 pr-1 pl-2 font-mono text-[9px]"
                    >
                      <span>{tech}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTech(tech)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>

                {/* Quick Tech Suggestions */}
                <div className="flex flex-wrap items-center gap-1 pt-0.5">
                  <span className="font-mono text-[9px] text-muted-foreground">
                    Suggestions:
                  </span>
                  {POPULAR_TECHS.slice(0, 6).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleAddTech(t)}
                      className="rounded border border-border/60 bg-background px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      +{t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Key Highlights Chips */}
              <div className="space-y-1 border-t border-border/70 pt-2.5">
                <label className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-amber-500" /> Key Highlights
                </label>
                <div className="flex items-center gap-1.5">
                  <Input
                    placeholder="Add bullet highlight..."
                    value={highlightInput}
                    onChange={(e) => setHighlightInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddHighlight()
                      }
                    }}
                    className="h-8 bg-background text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddHighlight}
                    disabled={!highlightInput.trim()}
                    className="h-8 shrink-0 px-2.5 text-xs"
                  >
                    +
                  </Button>
                </div>

                <div className="flex min-h-5 flex-wrap gap-1 pt-0.5">
                  {highlights.map((item) => (
                    <Badge
                      key={item}
                      variant="secondary"
                      className="gap-1 py-0.5 pr-1 pl-2 text-[9px]"
                    >
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveHighlight(item)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Cover Hero Image */}
              <div className="space-y-1.5 border-t border-border/70 pt-2.5">
                <label className="text-[11px] font-semibold text-muted-foreground">
                  Hero Cover Artwork *
                </label>
                <MediaImagePicker
                  value={image}
                  onChange={(val) => {
                    setImage(val)
                    clearFieldError("image")
                  }}
                  label="Hero Cover Artwork"
                  required
                />
              </div>
            </div>

            {/* 3. SEO & SOCIAL OPTIMIZATION */}
            <div className="rounded-xl border border-border/80 bg-card p-3.5 shadow-xs">
              <CaseStudySeoSection
                title={title}
                slug={slug}
                description={description}
                image={image}
                seo={seo}
                setSeo={setSeo}
                errors={fieldErrors}
              />
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: EXACT PUBLIC PORTFOLIO CASE STUDY READER SIMULATION */}
      {viewMode === "preview" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-card p-3.5 shadow-xs">
            <span className="font-mono text-xs text-muted-foreground">
              // LIVE CASE STUDY PREVIEW: HTTPS://FI.AMANILLAH.COM/CASE-STUDY/
              {slug || "SLUG"}
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setViewMode("editor")}
                className="h-8 gap-1.5 text-xs font-medium"
              >
                Back to Studio Editor
              </Button>
              <Button
                type="button"
                onClick={() => handleSave()}
                disabled={isSaving}
                className="h-8 gap-1.5 text-xs font-bold shadow-xs"
              >
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                {isEdit ? "Update Case Study" : "Publish Case Study"}
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border/80 bg-card p-4 shadow-xs sm:p-8">
            <FrontendCaseStudyPreview caseStudy={previewData} />
          </div>
        </div>
      )}
    </div>
  )
}
