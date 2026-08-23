"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent } from "@workspace/ui/components/tabs"
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
import { EditorHeader } from "./header/editor-header"
import { EditorTabsNav } from "./header/editor-tabs-nav"
import { HeroTab } from "./hero-tab"
import { MetadataTab } from "./metadata-tab"
import { ContextTab } from "./context-tab"
import { ArchitectureTab } from "./architecture-tab"
import { FeaturesTab } from "./features-tab"
import { MetricsTab } from "./metrics-tab"
import { PostMortemTab } from "./post-mortem-tab"
import { SeoTab } from "./seo-tab"
import { FrontendCaseStudyPreview } from "../preview/frontend-case-study-preview"

interface CaseStudyEditorFormProps {
  initialStudy?: CaseStudyDTO | null
  isEdit?: boolean
  onSuccessRedirect?: string
}

export function CaseStudyEditorForm({
  initialStudy,
  isEdit = false,
  onSuccessRedirect = "/case-studies",
}: CaseStudyEditorFormProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = React.useState("hero")
  const [isSaving, setIsSaving] = React.useState(false)
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({})

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

  const getTabForErrorKey = (key: string): string => {
    if (
      key.startsWith("seo.") ||
      key === "canonicalUrl" ||
      key === "metaTitle" ||
      key === "metaDescription" ||
      key === "ogTitle" ||
      key === "ogDescription" ||
      key === "ogImage"
    ) {
      return "seo"
    }
    if (key.startsWith("metadata") || key === "metadata") return "metadata"
    if (key.startsWith("contextBlocks") || key === "contextBlocks") return "context"
    if (key.startsWith("architectureLayers") || key === "architectureLayers")
      return "architecture"
    if (key.startsWith("features") || key === "features") return "features"
    if (key.startsWith("metrics") || key === "metrics") return "metrics"
    if (key.startsWith("postMortem") || key === "postMortem")
      return "post-mortem"
    return "hero"
  }

  // 1. General Info
  const [title, setTitle] = React.useState(initialStudy?.title || "")
  const [subtitle, setSubtitle] = React.useState(initialStudy?.subtitle || "")
  const [slug, setSlug] = React.useState(initialStudy?.slug || "")
  const [description, setDescription] = React.useState(initialStudy?.description || "")
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
  const [featured, setFeatured] = React.useState(Boolean(initialStudy?.featured))
  const [pinned, setPinned] = React.useState(Boolean(initialStudy?.pinned))
  const [image, setImage] = React.useState(
    initialStudy?.image || "/assets/images/mickanic-cover.png"
  )
  const [imageLabel, setImageLabel] = React.useState(initialStudy?.imageLabel || "")
  const [liveUrl, setLiveUrl] = React.useState(initialStudy?.liveUrl || "")
  const [githubUrl, setGithubUrl] = React.useState(initialStudy?.githubUrl || "")
  const [role, setRole] = React.useState(initialStudy?.role || "")
  const [timeline, setTimeline] = React.useState(initialStudy?.timeline || "")
  const [client, setClient] = React.useState(initialStudy?.client || "")
  const [impact, setImpact] = React.useState(initialStudy?.impact || "")
  const [highlights, setHighlights] = React.useState<string[]>(
    initialStudy?.highlights || []
  )
  const [techStack, setTechStack] = React.useState<string[]>(
    initialStudy?.techStack || []
  )

  // 2. Sections
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

  // 3. SEO
  const [seo, setSeo] = React.useState<CaseStudySeo>(
    initialStudy?.seo || {
      metaTitle: "",
      metaDescription: "",
      metaKeywords: [],
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      twitterCard: "summary_large_image",
      canonicalUrl: "",
    }
  )

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
    // 1. Client-Side Pre-Validation
    const clientErrors: Record<string, string> = {}

    if (!title.trim()) {
      clientErrors.title = "Project / Case Study title is required"
    } else if (title.trim().length < 3) {
      clientErrors.title = "Title must be at least 3 characters"
    }

    if (!description.trim()) {
      clientErrors.description = "Summary description is required"
    } else if (description.trim().length < 10) {
      clientErrors.description = "Description must be at least 10 characters"
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
        const targetTab = getTabForErrorKey(firstKey)
        setActiveTab(targetTab)
        toast.error(`Please fix validation error: ${clientErrors[firstKey]}`)
      }
      return
    }

    setFieldErrors({})
    setIsSaving(true)

    try {
      const payload = buildPayload(overrideStatus)

      if (isEdit && initialStudy?.id) {
        const res = await CaseStudyApi.update(initialStudy.id, payload as UpdateCaseStudyDTO)
        if (res.success && res.data) {
          toast.success(
            overrideStatus === "PUBLISHED"
              ? "Project published successfully"
              : "Project changes saved"
          )
          router.push(onSuccessRedirect)
          router.refresh()
        } else {
          showApiError(res, "Failed to update project")
          const fErrors = extractFieldErrors(res)
          if (Object.keys(fErrors).length > 0) {
            setFieldErrors(fErrors)
            const firstKey = Object.keys(fErrors)[0]
            if (firstKey) setActiveTab(getTabForErrorKey(firstKey))
          }
        }
      } else {
        const res = await CaseStudyApi.create(payload as CreateCaseStudyDTO)
        if (res.success && res.data) {
          toast.success(
            overrideStatus === "PUBLISHED"
              ? "Project created & published successfully"
              : "Draft created successfully"
          )
          router.push(onSuccessRedirect)
          router.refresh()
        } else {
          showApiError(res, "Failed to create project")
          const fErrors = extractFieldErrors(res)
          if (Object.keys(fErrors).length > 0) {
            setFieldErrors(fErrors)
            const firstKey = Object.keys(fErrors)[0]
            if (firstKey) setActiveTab(getTabForErrorKey(firstKey))
          }
        }
      }
    } catch (err) {
      toast.error("An unexpected network error occurred while saving")
    } finally {
      setIsSaving(false)
    }
  }

  // Construct mock preview object for FrontendCaseStudyPreview component
  const previewObject: CaseStudyDTO = {
    id: initialStudy?.id || "preview-id",
    slug: slug || "preview-slug",
    title: title || "Untitled Project",
    subtitle: subtitle || null,
    description: description || "No description provided yet.",
    projectType,
    status,
    projectStatus: projectStatus || "Status: Completed",
    order,
    featured,
    pinned,
    techStack,
    liveUrl: liveUrl || null,
    githubUrl: githubUrl || null,
    image: image || "/assets/images/mickanic-cover.png",
    imageLabel: imageLabel || null,
    role: role || null,
    timeline: timeline || null,
    client: client || null,
    impact: impact || null,
    highlights,
    views: initialStudy?.views ?? 1250,
    likesCount: initialStudy?.likesCount ?? 42,
    publishedAt: initialStudy?.publishedAt || new Date().toISOString(),
    authorName: initialStudy?.authorName || "Fi Amanillah",
    authorRole: initialStudy?.authorRole || "Author & Lead Architect",
    authorAvatar: initialStudy?.authorAvatar || "/fi.png",
    authorTwitter: initialStudy?.authorTwitter || "https://x.com/fiamanillah",
    authorLinkedin: initialStudy?.authorLinkedin || "https://linkedin.com/in/fiamanillah",
    authorGithub: initialStudy?.authorGithub || "https://github.com/fiamanillah",
    metadata,
    contextBlocks,
    architectureLayers,
    features,
    metrics,
    postMortem,
    seo,
    metaKeywords: seo.metaKeywords || [],
    createdAt: initialStudy?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const isProject = projectType === "PROJECT"

  return (
    <div className="space-y-6">
      {/* 1. Header with Actions & Status */}
      <EditorHeader
        isEdit={isEdit}
        title={title}
        slug={slug}
        status={status}
        isSaving={isSaving}
        onBack={() => router.push(onSuccessRedirect)}
        onSaveDraft={() => handleSave("DRAFT")}
        onPublishOrSave={() => handleSave(isEdit ? status : "PUBLISHED")}
      />

      {/* 2. Main Tabbed Navigation & Forms */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <EditorTabsNav
          projectType={projectType}
          activeTab={activeTab}
          metadataCount={metadata.length}
          contextCount={contextBlocks.length}
          architectureCount={architectureLayers.length}
          featuresCount={features.length}
          metricsCount={metrics.length}
          postMortemCount={postMortem.length}
        />

        {/* Tab 1: Hero / Overview */}
        <TabsContent value="hero" className="space-y-6">
          <HeroTab
            title={title}
            setTitle={setTitle}
            subtitle={subtitle}
            setSubtitle={setSubtitle}
            slug={slug}
            setSlug={setSlug}
            description={description}
            setDescription={setDescription}
            projectType={projectType}
            setProjectType={setProjectType}
            status={status}
            setStatus={setStatus}
            projectStatus={projectStatus}
            setProjectStatus={setProjectStatus}
            order={order}
            setOrder={setOrder}
            featured={featured}
            setFeatured={setFeatured}
            pinned={pinned}
            setPinned={setPinned}
            image={image}
            setImage={setImage}
            imageLabel={imageLabel}
            setImageLabel={setImageLabel}
            liveUrl={liveUrl}
            setLiveUrl={setLiveUrl}
            githubUrl={githubUrl}
            setGithubUrl={setGithubUrl}
            role={role}
            setRole={setRole}
            timeline={timeline}
            setTimeline={setTimeline}
            client={client}
            setClient={setClient}
            impact={impact}
            setImpact={setImpact}
            highlights={highlights}
            setHighlights={setHighlights}
            techStack={techStack}
            setTechStack={setTechStack}
            errors={fieldErrors}
          />

          <div className="flex items-center justify-between rounded-xl border border-border/80 bg-card p-4 shadow-xs">
            <div className="text-xs text-muted-foreground">
              {isProject
                ? "Step 1 of 3: Project Artwork, Details & Highlights"
                : "Step 1 of 9: Hero Artwork & High-Level Metadata"}
            </div>
            <button
              type="button"
              onClick={() => setActiveTab(isProject ? "seo" : "metadata")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90"
            >
              <span>{isProject ? "Next: 02. SEO & Social" : "Next: 02. Metadata"}</span>
              <span>→</span>
            </button>
          </div>
        </TabsContent>

        {/* Tab 2: Metadata (Deep Dive only) */}
        <TabsContent value="metadata" className="space-y-6">
          <MetadataTab metadata={metadata} setMetadata={setMetadata} />

          <div className="flex items-center justify-between rounded-xl border border-border/80 bg-card p-4 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab("hero")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <span>←</span>
              <span>Back: 01. Overview</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("context")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90"
            >
              <span>Next: 03. Context</span>
              <span>→</span>
            </button>
          </div>
        </TabsContent>

        {/* Tab 3: Context (Deep Dive only) */}
        <TabsContent value="context" className="space-y-6">
          <ContextTab
            contextBlocks={contextBlocks}
            setContextBlocks={setContextBlocks}
          />

          <div className="flex items-center justify-between rounded-xl border border-border/80 bg-card p-4 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab("metadata")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <span>←</span>
              <span>Back: 02. Metadata</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("architecture")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90"
            >
              <span>Next: 04. Architecture</span>
              <span>→</span>
            </button>
          </div>
        </TabsContent>

        {/* Tab 4: Architecture (Deep Dive only) */}
        <TabsContent value="architecture" className="space-y-6">
          <ArchitectureTab
            architectureLayers={architectureLayers}
            setArchitectureLayers={setArchitectureLayers}
          />

          <div className="flex items-center justify-between rounded-xl border border-border/80 bg-card p-4 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab("context")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <span>←</span>
              <span>Back: 03. Context</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("features")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90"
            >
              <span>Next: 05. Features</span>
              <span>→</span>
            </button>
          </div>
        </TabsContent>

        {/* Tab 5: Features (Deep Dive only) */}
        <TabsContent value="features" className="space-y-6">
          <FeaturesTab features={features} setFeatures={setFeatures} />

          <div className="flex items-center justify-between rounded-xl border border-border/80 bg-card p-4 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab("architecture")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <span>←</span>
              <span>Back: 04. Architecture</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("metrics")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90"
            >
              <span>Next: 06. Metrics</span>
              <span>→</span>
            </button>
          </div>
        </TabsContent>

        {/* Tab 6: Metrics (Deep Dive only) */}
        <TabsContent value="metrics" className="space-y-6">
          <MetricsTab metrics={metrics} setMetrics={setMetrics} />

          <div className="flex items-center justify-between rounded-xl border border-border/80 bg-card p-4 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab("features")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <span>←</span>
              <span>Back: 05. Features</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("post-mortem")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90"
            >
              <span>Next: 07. Post-Mortem</span>
              <span>→</span>
            </button>
          </div>
        </TabsContent>

        {/* Tab 7: Post-Mortem (Deep Dive only) */}
        <TabsContent value="post-mortem" className="space-y-6">
          <PostMortemTab
            postMortem={postMortem}
            setPostMortem={setPostMortem}
          />

          <div className="flex items-center justify-between rounded-xl border border-border/80 bg-card p-4 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab("metrics")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <span>←</span>
              <span>Back: 06. Metrics</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("seo")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90"
            >
              <span>Next: 08. SEO & Social</span>
              <span>→</span>
            </button>
          </div>
        </TabsContent>

        {/* Tab 8: SEO */}
        <TabsContent value="seo" className="space-y-6">
          <SeoTab
            title={title}
            slug={slug}
            description={description}
            image={image}
            seo={seo}
            setSeo={setSeo}
            errors={fieldErrors}
          />

          <div className="flex items-center justify-between rounded-xl border border-border/80 bg-card p-4 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab(isProject ? "hero" : "post-mortem")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <span>←</span>
              <span>{isProject ? "Back: 01. Project Details" : "Back: 07. Post-Mortem"}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90"
            >
              <span>{isProject ? "Next: 03. Live Preview" : "Next: 09. Live Preview"}</span>
              <span>→</span>
            </button>
          </div>
        </TabsContent>

        {/* Tab 9: Live Preview */}
        <TabsContent value="preview" className="space-y-6">
          <FrontendCaseStudyPreview caseStudy={previewObject} />

          <div className="flex items-center justify-between rounded-xl border border-border/80 bg-card p-4 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab("seo")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <span>←</span>
              <span>{isProject ? "Back: 02. SEO & Social" : "Back: 08. SEO & Social"}</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSave("DRAFT")}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-xs font-medium text-foreground hover:bg-muted"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => handleSave(status === "DRAFT" ? "PUBLISHED" : status)}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/90"
              >
                <span>{isEdit ? "Update Project" : "Publish Project"}</span>
                <span>✓</span>
              </button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
