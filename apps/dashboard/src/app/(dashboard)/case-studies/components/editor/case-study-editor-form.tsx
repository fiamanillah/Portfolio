"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent } from "@workspace/ui/components/tabs"
import { toast } from "@workspace/ui/components/sonner"
import type {
  CaseStudyDTO,
  CaseStudyStatus,
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
import { CaseStudyApi } from "@/lib/api"
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

  // 1. General Info
  const [title, setTitle] = React.useState(initialStudy?.title || "")
  const [subtitle, setSubtitle] = React.useState(initialStudy?.subtitle || "")
  const [slug, setSlug] = React.useState(initialStudy?.slug || "")
  const [description, setDescription] = React.useState(initialStudy?.description || "")
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
      status: finalStatus,
      projectStatus: projectStatus.trim(),
      order,
      featured,
      pinned,
      techStack,
      liveUrl: liveUrl.trim() || undefined,
      githubUrl: githubUrl.trim() || undefined,
      image: image.trim(),
      imageLabel: imageLabel.trim() || undefined,
      role: role.trim() || undefined,
      timeline: timeline.trim() || undefined,
      client: client.trim() || undefined,
      impact: impact.trim() || undefined,
      metadata,
      contextBlocks,
      architectureLayers,
      features,
      metrics,
      postMortem,
      seo,
    }
  }

  const handleSave = async (overrideStatus?: CaseStudyStatus) => {
    if (!title.trim()) {
      toast.error("Case study title is required.")
      setActiveTab("hero")
      return
    }
    if (!description.trim()) {
      toast.error("Summary description is required.")
      setActiveTab("hero")
      return
    }
    if (!image.trim()) {
      toast.error("Cover image artwork is required.")
      setActiveTab("hero")
      return
    }

    setIsSaving(true)
    const payload = buildPayload(overrideStatus)

    try {
      if (isEdit && initialStudy?.id) {
        const res = await CaseStudyApi.update(
          initialStudy.id,
          payload as UpdateCaseStudyDTO
        )
        if (res.success && res.data) {
          toast.success(
            overrideStatus === "PUBLISHED"
              ? "Case study published successfully!"
              : "Case study updated successfully!"
          )
          router.push(onSuccessRedirect)
        } else {
          toast.error(res.message || "Failed to update case study")
        }
      } else {
        const res = await CaseStudyApi.create(payload as CreateCaseStudyDTO)
        if (res.success && res.data) {
          toast.success(
            overrideStatus === "PUBLISHED"
              ? "Case study published successfully!"
              : "Case study created as draft!"
          )
          router.push(onSuccessRedirect)
        } else {
          toast.error(res.message || "Failed to create case study")
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred while saving")
    } finally {
      setIsSaving(false)
    }
  }

  const previewObject: Partial<CaseStudyDTO> = {
    title,
    subtitle,
    slug,
    description,
    status,
    projectStatus,
    order,
    featured,
    pinned,
    techStack,
    liveUrl,
    githubUrl,
    image,
    imageLabel,
    role,
    timeline,
    client,
    impact,
    metadata,
    contextBlocks,
    architectureLayers,
    features,
    metrics,
    postMortem,
    seo,
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Bar with Save & Actions */}
      <EditorHeader
        isEdit={isEdit}
        title={title}
        slug={slug}
        status={status}
        isSaving={isSaving}
        onBack={() => router.push(onSuccessRedirect)}
        onSaveDraft={() => handleSave("DRAFT")}
        onPublishOrSave={() =>
          handleSave(status === "DRAFT" ? "PUBLISHED" : status)
        }
      />

      {/* 2. Main Tabbed Navigation & Forms */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <EditorTabsNav
          metadataCount={metadata.length}
          contextCount={contextBlocks.length}
          architectureCount={architectureLayers.length}
          featuresCount={features.length}
          metricsCount={metrics.length}
          postMortemCount={postMortem.length}
        />

        {/* Tab 1: Hero */}
        <TabsContent value="hero">
          <HeroTab
            title={title}
            setTitle={setTitle}
            subtitle={subtitle}
            setSubtitle={setSubtitle}
            slug={slug}
            setSlug={setSlug}
            description={description}
            setDescription={setDescription}
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
            techStack={techStack}
            setTechStack={setTechStack}
          />
        </TabsContent>

        {/* Tab 2: Metadata */}
        <TabsContent value="metadata">
          <MetadataTab metadata={metadata} setMetadata={setMetadata} />
        </TabsContent>

        {/* Tab 3: Context */}
        <TabsContent value="context">
          <ContextTab
            contextBlocks={contextBlocks}
            setContextBlocks={setContextBlocks}
          />
        </TabsContent>

        {/* Tab 4: Architecture */}
        <TabsContent value="architecture">
          <ArchitectureTab
            architectureLayers={architectureLayers}
            setArchitectureLayers={setArchitectureLayers}
          />
        </TabsContent>

        {/* Tab 5: Features */}
        <TabsContent value="features">
          <FeaturesTab features={features} setFeatures={setFeatures} />
        </TabsContent>

        {/* Tab 6: Metrics */}
        <TabsContent value="metrics">
          <MetricsTab metrics={metrics} setMetrics={setMetrics} />
        </TabsContent>

        {/* Tab 7: Post-Mortem */}
        <TabsContent value="post-mortem">
          <PostMortemTab
            postMortem={postMortem}
            setPostMortem={setPostMortem}
          />
        </TabsContent>

        {/* Tab 8: SEO */}
        <TabsContent value="seo">
          <SeoTab
            title={title}
            slug={slug}
            description={description}
            image={image}
            seo={seo}
            setSeo={setSeo}
          />
        </TabsContent>

        {/* Tab 9: Live Preview */}
        <TabsContent value="preview">
          <FrontendCaseStudyPreview caseStudy={previewObject} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
