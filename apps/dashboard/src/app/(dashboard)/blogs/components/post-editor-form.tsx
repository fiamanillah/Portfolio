"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent } from "@workspace/ui/components/tabs"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"
import type {
  BlogPostDTO,
  BlogCategoryDTO,
  BlogTagDTO,
  BlogStatus,
  BlogArticleType,
  CreateBlogPostDTO,
  UpdateBlogPostDTO,
  SeoAnalysisResult,
} from "@workspace/shared"
import {
  BlogApi,
  showApiError,
  extractFieldErrors,
  validateUrl,
  validateSlug,
  cleanUrl,
} from "@/lib/api"
import { useAuth } from "@/providers/auth-provider"

// Editor Subcomponents
import { EditorHeader } from "./editor/editor-header"
import { EditorTabsNav } from "./editor/editor-tabs-nav"
import { TitleSlugSection } from "./editor/content/title-slug-section"
import { CategoryTagSection } from "./editor/content/category-tag-section"
import { KeyTakeawaysSection } from "./editor/content/key-takeaways-section"
import { MarkdownEditor } from "./editor/content/markdown-editor"

import { MetaTagsSection } from "./editor/seo/meta-tags-section"
import { CrawlerDirectivesSection } from "./editor/seo/crawler-directives-section"
import { SeoDiagnosticsCard } from "./editor/seo/seo-diagnostics-card"
import { SerpPreview } from "./editor/seo/serp-preview"
import { SocialSharePreview } from "./editor/seo/social-share-preview"

import { CoverImageSection } from "./editor/media/cover-image-section"
import { SocialImagesSection } from "./editor/media/social-images-section"

import { PublicationStatusSection } from "./editor/publishing/publication-status-section"
import { ReadingTimeSection } from "./editor/publishing/reading-time-section"
import { VisibilityTogglesSection } from "./editor/publishing/visibility-toggles-section"

import { AuthorProfileSection } from "./editor/author/author-profile-section"
import { AuthorSocialLinksSection } from "./editor/author/author-social-links-section"
import { FrontendArticlePreview } from "./preview/frontend-article-preview"

interface PostEditorFormProps {
  initialPost?: BlogPostDTO | null
  categories: BlogCategoryDTO[]
  tags: BlogTagDTO[]
  isEdit?: boolean
  onSuccessRedirect?: string
  onOpenTaxonomyManager?: () => void
}

export function PostEditorForm({
  initialPost,
  categories,
  tags: availableTags,
  isEdit = false,
  onSuccessRedirect = "/blogs",
  onOpenTaxonomyManager,
}: PostEditorFormProps) {
  const router = useRouter()
  const { user } = useAuth()

  // 1. Content State
  const [title, setTitle] = React.useState(initialPost?.title || "")
  const [subtitle, setSubtitle] = React.useState(initialPost?.subtitle || "")
  const [slug, setSlug] = React.useState(initialPost?.slug || "")
  const [summary, setSummary] = React.useState(initialPost?.summary || "")
  const [content, setContent] = React.useState(
    initialPost?.content ||
      "## Introduction\n\nWrite your technical article here with code snippets, diagrams, and explanations...\n\n```typescript\nconsole.log('Production ready architecture');\n```\n\n> [!NOTE]\n> Real-time streaming enables microsecond state sync.\n\n## Conclusion\n\nSummary of takeaways."
  )
  const [categoryId, setCategoryId] = React.useState<string>(
    initialPost?.categoryId || "none"
  )
  const [categoryName, setCategoryName] = React.useState(
    initialPost?.category?.name || ""
  )
  const [keyTakeaways, setKeyTakeaways] = React.useState<string[]>(
    initialPost?.keyTakeaways || []
  )
  const [selectedTags, setSelectedTags] = React.useState<string[]>(
    initialPost?.tags || []
  )

  // 2. SEO State
  const [metaTitle, setMetaTitle] = React.useState(
    initialPost?.seo?.metaTitle || ""
  )
  const [metaDescription, setMetaDescription] = React.useState(
    initialPost?.seo?.metaDescription || ""
  )
  const [canonicalUrl, setCanonicalUrl] = React.useState(
    initialPost?.seo?.canonicalUrl || ""
  )
  const [articleType, setArticleType] = React.useState<BlogArticleType>(
    initialPost?.seo?.articleType || "TechArticle"
  )
  const [noIndex, setNoIndex] = React.useState(
    Boolean(initialPost?.seo?.noIndex)
  )
  const [noFollow, setNoFollow] = React.useState(
    Boolean(initialPost?.seo?.noFollow)
  )
  const [ogTitle, setOgTitle] = React.useState(initialPost?.seo?.ogTitle || "")
  const [ogDescription, setOgDescription] = React.useState(
    initialPost?.seo?.ogDescription || ""
  )
  const [ogImage, setOgImage] = React.useState(initialPost?.seo?.ogImage || "")
  const [twitterCard, setTwitterCard] = React.useState<
    "summary" | "summary_large_image"
  >(initialPost?.seo?.twitterCard || "summary_large_image")
  const [twitterTitle, setTwitterTitle] = React.useState(
    initialPost?.seo?.twitterTitle || ""
  )
  const [twitterDescription, setTwitterDescription] = React.useState(
    initialPost?.seo?.twitterDescription || ""
  )
  const [twitterImage, setTwitterImage] = React.useState(
    initialPost?.seo?.twitterImage || ""
  )
  const [seoAnalysis, setSeoAnalysis] =
    React.useState<SeoAnalysisResult | null>(null)

  // 3. Publishing State
  const [status, setStatus] = React.useState<BlogStatus>(
    initialPost?.status || "DRAFT"
  )
  const [featured, setFeatured] = React.useState(Boolean(initialPost?.featured))
  const [pinned, setPinned] = React.useState(Boolean(initialPost?.pinned))
  const [publishedAt, setPublishedAt] = React.useState(
    initialPost?.publishedAt
      ? new Date(initialPost.publishedAt).toISOString().slice(0, 16)
      : ""
  )
  const [scheduledAt, setScheduledAt] = React.useState(
    initialPost?.scheduledAt
      ? new Date(initialPost.scheduledAt).toISOString().slice(0, 16)
      : ""
  )
  const [dateDisplay, setDateDisplay] = React.useState(initialPost?.date || "")
  const [readTimeOverride, setReadTimeOverride] = React.useState(
    initialPost?.readTime || ""
  )

  // 4. Media State
  const [thumbnail, setThumbnail] = React.useState(
    initialPost?.thumbnail || "/assets/images/mickanic-cover.png"
  )

  // 5. Author State
  const [authorName, setAuthorName] = React.useState(
    initialPost?.author?.name || user?.name || "Fi Amanillah"
  )
  const [authorRole, setAuthorRole] = React.useState(
    initialPost?.author?.role ||
      user?.headline ||
      "Full Stack Developer"
  )
  const [authorAvatar, setAuthorAvatar] = React.useState(
    initialPost?.author?.avatar || user?.avatar || "/fi.png"
  )
  const [authorTwitter, setAuthorTwitter] = React.useState(
    initialPost?.author?.twitter || user?.twitterUrl || "@fiamanillah"
  )
  const [authorLinkedin, setAuthorLinkedin] = React.useState(
    initialPost?.author?.linkedin || user?.linkedinUrl || ""
  )
  const [authorGithub, setAuthorGithub] = React.useState(
    initialPost?.author?.github || user?.githubUrl || ""
  )

  const [activeTab, setActiveTab] = React.useState("content")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({})

  const clearFieldError = (fieldKey: string) => {
    setFieldErrors((prev) => {
      if (!prev[fieldKey]) return prev
      const next = { ...prev }
      delete next[fieldKey]
      // Also delete without prefix if nested
      const leaf = fieldKey.split(".").pop()
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
      key === "articleType" ||
      key === "ogTitle" ||
      key === "ogDescription"
    ) {
      return "seo"
    }
    if (
      key.startsWith("author.") ||
      key === "authorName" ||
      key === "authorAvatar" ||
      key === "authorRole" ||
      key === "authorTwitter" ||
      key === "authorLinkedin" ||
      key === "authorGithub"
    ) {
      return "author"
    }
    if (key === "thumbnail" || key === "ogImage" || key === "twitterImage") {
      return "media"
    }
    if (
      key === "publishedAt" ||
      key === "scheduledAt" ||
      key === "status" ||
      key === "dateDisplay" ||
      key === "readTimeOverride"
    ) {
      return "publishing"
    }
    return "content"
  }

  // Live Word Count & Reading Time
  const wordCount = React.useMemo(() => {
    return content
      .replace(/```[\s\S]*?```/g, "")
      .replace(/<[^>]*>/g, "")
      .split(/\s+/)
      .filter(Boolean).length
  }, [content])

  const calculatedReadTime = React.useMemo(() => {
    const mins = Math.max(1, Math.ceil(wordCount / 200))
    return `${mins} MIN READ`
  }, [wordCount])

  // Draft Post Object for Live Website Simulation
  const previewPostData: BlogPostDTO = React.useMemo(() => {
    return {
      id: initialPost?.id || "draft-preview",
      title: title || "Untitled Technical Guide",
      subtitle: subtitle || undefined,
      slug: slug || "untitled-technical-guide",
      summary: summary || "Technical guide overview.",
      content: content || "",
      thumbnail: thumbnail || "/assets/images/mickanic-cover.png",
      category: categoryName
        ? {
            id: categoryId,
            name: categoryName,
            slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            color: "blue",
            order: 0,
          }
        : null,
      categoryId: categoryId === "none" ? undefined : categoryId,
      tags: selectedTags,
      keyTakeaways: keyTakeaways.filter((k) => k.trim()),
      status,
      featured,
      pinned,
      date: dateDisplay || "Aug 2026",
      publishedAt: publishedAt || new Date().toISOString(),
      scheduledAt: scheduledAt || undefined,
      readTime: readTimeOverride || calculatedReadTime,
      readTimeMinutes: Math.max(1, Math.ceil(wordCount / 200)),
      wordCount: wordCount,
      author: {
        name: authorName || "Fi Amanillah",
        role: authorRole || "Full Stack Developer",
        avatar: authorAvatar || "/fi.png",
        twitter: authorTwitter || "@fiamanillah",
        linkedin: authorLinkedin || "",
        github: authorGithub || "",
      },
      views: initialPost?.views || 1420,
      likesCount: initialPost?.likesCount || 68,
      commentsCount: initialPost?.commentsCount || 12,
      seo: {
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
        metaKeywords: selectedTags,
        canonicalUrl: canonicalUrl || undefined,
        articleType,
        noIndex,
        noFollow,
        ogTitle: ogTitle || undefined,
        ogDescription: ogDescription || undefined,
        ogImage: ogImage || undefined,
        twitterCard,
        twitterTitle: twitterTitle || undefined,
        twitterDescription: twitterDescription || undefined,
        twitterImage: twitterImage || undefined,
      },
      createdAt: initialPost?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }, [
    initialPost,
    title,
    subtitle,
    slug,
    summary,
    content,
    thumbnail,
    categoryId,
    categoryName,
    selectedTags,
    keyTakeaways,
    status,
    featured,
    pinned,
    dateDisplay,
    publishedAt,
    scheduledAt,
    readTimeOverride,
    calculatedReadTime,
    authorName,
    authorRole,
    authorAvatar,
    authorTwitter,
    authorLinkedin,
    authorGithub,
    metaTitle,
    metaDescription,
    canonicalUrl,
    articleType,
    noIndex,
    noFollow,
    ogTitle,
    ogDescription,
    ogImage,
    twitterCard,
    twitterTitle,
    twitterDescription,
    twitterImage,
  ])

  // Real-time SEO Diagnostic Preview Generation
  React.useEffect(() => {
    if (!title.trim() && !summary.trim()) return

    const timer = setTimeout(() => {
      BlogApi.generateSeoPreview({
        title: title || "Technical Guide",
        slug: slug || "article-slug",
        summary: summary || metaDescription,
        content,
        thumbnail: thumbnail || ogImage,
        category: categoryName || undefined,
        tags: selectedTags,
        author: {
          name: authorName,
          role: authorRole,
          avatar: authorAvatar,
        },
        seo: {
          metaTitle: metaTitle || undefined,
          metaDescription: metaDescription || undefined,
          canonicalUrl: cleanUrl(canonicalUrl),
          articleType,
          noIndex,
          noFollow,
          ogTitle: ogTitle || undefined,
          ogDescription: ogDescription || undefined,
          ogImage: ogImage || undefined,
          twitterCard,
          twitterTitle: twitterTitle || undefined,
          twitterDescription: twitterDescription || undefined,
          twitterImage: twitterImage || undefined,
        },
      })
        .then((res) => {
          if (res.success && res.data) {
            setSeoAnalysis(res.data)
          }
        })
        .catch(() => {})
    }, 400)

    return () => clearTimeout(timer)
  }, [
    title,
    slug,
    summary,
    content,
    thumbnail,
    categoryName,
    selectedTags,
    authorName,
    authorRole,
    authorAvatar,
    metaTitle,
    metaDescription,
    canonicalUrl,
    articleType,
    noIndex,
    noFollow,
    ogTitle,
    ogDescription,
    ogImage,
    twitterCard,
    twitterTitle,
    twitterDescription,
    twitterImage,
  ])

  // Form Submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    // 1. Client-Side Pre-Validation
    const clientErrors: Record<string, string> = {}

    if (!title.trim()) {
      clientErrors.title = "Article title is required"
    } else if (title.trim().length < 3) {
      clientErrors.title = "Title must be at least 3 characters"
    }

    if (!summary.trim()) {
      clientErrors.summary = "Summary excerpt is required"
    } else if (summary.trim().length < 10) {
      clientErrors.summary = "Summary must be at least 10 characters"
    }

    if (!content.trim()) {
      clientErrors.content = "Article content body cannot be empty"
    } else if (content.trim().length < 10) {
      clientErrors.content = "Content must be at least 10 characters"
    }

    if (slug.trim()) {
      const slugValidation = validateSlug(slug, "URL Slug")
      if (!slugValidation.valid && slugValidation.error) {
        clientErrors.slug = slugValidation.error
      }
    }

    if (canonicalUrl.trim()) {
      const canonValidation = validateUrl(canonicalUrl, "Canonical URL")
      if (!canonValidation.valid && canonValidation.error) {
        clientErrors["seo.canonicalUrl"] = canonValidation.error
        clientErrors.canonicalUrl = canonValidation.error
      }
    }

    if (metaTitle.trim() && metaTitle.trim().length > 120) {
      clientErrors["seo.metaTitle"] = "Meta title cannot exceed 120 characters"
      clientErrors.metaTitle = "Meta title cannot exceed 120 characters"
    }

    if (metaDescription.trim() && metaDescription.trim().length > 500) {
      clientErrors["seo.metaDescription"] =
        "Meta description cannot exceed 500 characters"
      clientErrors.metaDescription =
        "Meta description cannot exceed 500 characters"
    }

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors)
      const firstErrorKey = Object.keys(clientErrors)[0] || "title"
      setActiveTab(getTabForErrorKey(firstErrorKey))
      showApiError(
        {
          errorIssues: Object.entries(clientErrors).map(([path, message]) => ({
            path,
            message,
          })),
        },
        "Validation Failed"
      )
      return
    }

    setIsSubmitting(true)
    try {
      const payload: CreateBlogPostDTO = {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        slug: slug.trim() || undefined,
        summary: summary.trim(),
        content: content.trim(),
        thumbnail: thumbnail.trim() || undefined,
        categoryId: categoryId === "none" ? undefined : categoryId,
        categoryName: categoryName.trim() || undefined,
        tags: selectedTags,
        keyTakeaways: keyTakeaways.filter((k) => k.trim()),
        status,
        featured,
        pinned,
        publishedAt: publishedAt
          ? new Date(publishedAt).toISOString()
          : undefined,
        scheduledAt: scheduledAt
          ? new Date(scheduledAt).toISOString()
          : undefined,
        date: dateDisplay.trim() || undefined,
        readTime: readTimeOverride.trim() || calculatedReadTime,
        author: {
          name: authorName.trim() || "Fi Amanillah",
          role: authorRole.trim() || undefined,
          avatar: authorAvatar.trim() || undefined,
          twitter: authorTwitter.trim() || undefined,
          linkedin: authorLinkedin.trim() || undefined,
          github: authorGithub.trim() || undefined,
        },
        seo: {
          metaTitle: metaTitle.trim() || undefined,
          metaDescription: metaDescription.trim() || undefined,
          metaKeywords: selectedTags,
          canonicalUrl: cleanUrl(canonicalUrl),
          articleType,
          noIndex,
          noFollow,
          ogTitle: ogTitle.trim() || undefined,
          ogDescription: ogDescription.trim() || undefined,
          ogImage: ogImage.trim() || undefined,
          twitterCard,
          twitterTitle: twitterTitle.trim() || undefined,
          twitterDescription: twitterDescription.trim() || undefined,
          twitterImage: twitterImage.trim() || undefined,
        },
      }

      if (isEdit && initialPost) {
        const res = await BlogApi.update(
          initialPost.id,
          payload as UpdateBlogPostDTO
        )
        if (res.success && res.data) {
          setFieldErrors({})
          toast.success(`Updated '${title}' successfully`)
          router.push(onSuccessRedirect)
          router.refresh()
        } else {
          showApiError(res, "Failed to update article")
          const extracted = extractFieldErrors(res)
          setFieldErrors(extracted)
          const firstKey = Object.keys(extracted)[0]
          if (firstKey) setActiveTab(getTabForErrorKey(firstKey))
        }
      } else {
        const res = await BlogApi.create(payload)
        if (res.success && res.data) {
          setFieldErrors({})
          toast.success(`Created '${title}' successfully`)
          router.push(onSuccessRedirect)
          router.refresh()
        } else {
          showApiError(res, "Failed to create article")
          const extracted = extractFieldErrors(res)
          setFieldErrors(extracted)
          const firstKey = Object.keys(extracted)[0]
          if (firstKey) setActiveTab(getTabForErrorKey(firstKey))
        }
      }
    } catch (err: any) {
      showApiError(err, "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePreviewNavigate = () => {
    setActiveTab("preview")
  }

  return (
    <div className="space-y-6">
      {/* Sticky Header Action Bar */}
      <EditorHeader
        title={title}
        status={status}
        onStatusChange={setStatus}
        isEdit={isEdit}
        isSubmitting={isSubmitting}
        onPreviewClick={handlePreviewNavigate}
        onSaveClick={() => handleSubmit()}
        discardHref="/blogs"
      />

      {/* Main Multi-tab Editor Box */}
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Navigation Bar */}
          <EditorTabsNav
            activeTab={activeTab}
            seoAnalysis={seoAnalysis}
            hasCoverImage={Boolean(thumbnail)}
            hasRequiredContent={Boolean(title && summary && content)}
          />

          {/* Content Bodies */}
          <div className="p-6 md:p-8">
            {/* TAB 1: Content & Editor */}
            <TabsContent
              value="content"
              className="m-0 space-y-6 focus-visible:outline-hidden"
            >
              <TitleSlugSection
                title={title}
                setTitle={(val) => {
                  setTitle(val)
                  clearFieldError("title")
                }}
                subtitle={subtitle}
                setSubtitle={setSubtitle}
                slug={slug}
                setSlug={(val) => {
                  setSlug(val)
                  clearFieldError("slug")
                }}
                summary={summary}
                setSummary={(val) => {
                  setSummary(val)
                  clearFieldError("summary")
                }}
                errors={fieldErrors}
              />

              <CategoryTagSection
                categoryId={categoryId}
                setCategoryId={setCategoryId}
                categoryName={categoryName}
                setCategoryName={setCategoryName}
                categories={categories}
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
                availableTags={availableTags}
                onOpenTaxonomyManager={onOpenTaxonomyManager}
              />

              <KeyTakeawaysSection
                keyTakeaways={keyTakeaways}
                setKeyTakeaways={setKeyTakeaways}
              />

              <div className="space-y-2 border-t border-border/80 pt-4">
                <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  Article Markdown Body *
                </label>
                <MarkdownEditor
                  value={content}
                  onChange={(val) => {
                    setContent(val)
                    clearFieldError("content")
                  }}
                  wordCount={wordCount}
                  readTime={calculatedReadTime}
                />
                {fieldErrors.content && (
                  <p className="font-mono text-xs text-destructive">
                    ⚠ {fieldErrors.content}
                  </p>
                )}
              </div>

              {/* Step Navigation Footer */}
              <div className="flex items-center justify-between border-t border-border/80 pt-6">
                <div className="text-xs text-muted-foreground">
                  Step 1 of 6: Basic details & article body
                </div>
                <Button
                  type="button"
                  onClick={() => setActiveTab("media")}
                  className="gap-2"
                >
                  <span>Next: 02. Media & Hero</span>
                  <span>→</span>
                </Button>
              </div>
            </TabsContent>

            {/* TAB 2: Media & Hero */}
            <TabsContent
              value="media"
              className="m-0 space-y-6 focus-visible:outline-hidden"
            >
              <CoverImageSection
                thumbnail={thumbnail}
                setThumbnail={setThumbnail}
              />

              <SocialImagesSection
                coverImage={thumbnail}
                ogImage={ogImage}
                setOgImage={setOgImage}
                twitterImage={twitterImage}
                setTwitterImage={setTwitterImage}
              />

              {/* Step Navigation Footer */}
              <div className="flex items-center justify-between border-t border-border/80 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("content")}
                  className="gap-2"
                >
                  <span>←</span>
                  <span>Back: 01. Content</span>
                </Button>
                <Button
                  type="button"
                  onClick={() => setActiveTab("seo")}
                  className="gap-2"
                >
                  <span>Next: 03. SEO & Previews</span>
                  <span>→</span>
                </Button>
              </div>
            </TabsContent>

            {/* TAB 3: SEO & Previews */}
            <TabsContent
              value="seo"
              className="m-0 space-y-6 focus-visible:outline-hidden"
            >
              <MetaTagsSection
                title={title}
                summary={summary}
                metaTitle={metaTitle}
                setMetaTitle={(val) => {
                  setMetaTitle(val)
                  clearFieldError("seo.metaTitle")
                  clearFieldError("metaTitle")
                }}
                metaTitleError={
                  fieldErrors["seo.metaTitle"] || fieldErrors.metaTitle
                }
                metaDescription={metaDescription}
                setMetaDescription={(val) => {
                  setMetaDescription(val)
                  clearFieldError("seo.metaDescription")
                  clearFieldError("metaDescription")
                }}
                metaDescriptionError={
                  fieldErrors["seo.metaDescription"] ||
                  fieldErrors.metaDescription
                }
              />

              <CrawlerDirectivesSection
                slug={slug}
                canonicalUrl={canonicalUrl}
                setCanonicalUrl={(val) => {
                  setCanonicalUrl(val)
                  clearFieldError("seo.canonicalUrl")
                  clearFieldError("canonicalUrl")
                }}
                canonicalUrlError={
                  fieldErrors["seo.canonicalUrl"] || fieldErrors.canonicalUrl
                }
                articleType={articleType}
                setArticleType={setArticleType}
                noIndex={noIndex}
                setNoIndex={setNoIndex}
                noFollow={noFollow}
                setNoFollow={setNoFollow}
              />

              <SeoDiagnosticsCard seoAnalysis={seoAnalysis} />

              <div className="grid grid-cols-1 gap-6 border-t border-border pt-4 lg:grid-cols-2">
                <SerpPreview
                  desktop={seoAnalysis?.previews.googleSearchDesktop}
                  mobile={seoAnalysis?.previews.googleSearchMobile}
                  slug={slug}
                />
                <SocialSharePreview
                  twitter={seoAnalysis?.previews.twitterCard}
                  og={seoAnalysis?.previews.openGraph}
                />
              </div>

              {/* Step Navigation Footer */}
              <div className="flex items-center justify-between border-t border-border/80 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("media")}
                  className="gap-2"
                >
                  <span>←</span>
                  <span>Back: 02. Media</span>
                </Button>
                <Button
                  type="button"
                  onClick={() => setActiveTab("publishing")}
                  className="gap-2"
                >
                  <span>Next: 04. Publishing & Schedule</span>
                  <span>→</span>
                </Button>
              </div>
            </TabsContent>

            {/* TAB 4: Publishing & Schedule */}
            <TabsContent
              value="publishing"
              className="m-0 space-y-6 focus-visible:outline-hidden"
            >
              <PublicationStatusSection
                status={status}
                setStatus={setStatus}
                publishedAt={publishedAt}
                setPublishedAt={setPublishedAt}
                scheduledAt={scheduledAt}
                setScheduledAt={setScheduledAt}
                dateDisplay={dateDisplay}
                setDateDisplay={setDateDisplay}
              />

              <ReadingTimeSection
                readTimeOverride={readTimeOverride}
                setReadTimeOverride={setReadTimeOverride}
                calculatedReadTime={calculatedReadTime}
                wordCount={wordCount}
              />

              <VisibilityTogglesSection
                featured={featured}
                setFeatured={setFeatured}
                pinned={pinned}
                setPinned={setPinned}
              />

              {/* Step Navigation Footer */}
              <div className="flex items-center justify-between border-t border-border/80 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("seo")}
                  className="gap-2"
                >
                  <span>←</span>
                  <span>Back: 03. SEO</span>
                </Button>
                <Button
                  type="button"
                  onClick={() => setActiveTab("author")}
                  className="gap-2"
                >
                  <span>Next: 05. Author Persona</span>
                  <span>→</span>
                </Button>
              </div>
            </TabsContent>

            {/* TAB 5: Author Persona */}
            <TabsContent
              value="author"
              className="m-0 space-y-6 focus-visible:outline-hidden"
            >
              <AuthorProfileSection
                authorName={authorName}
                setAuthorName={setAuthorName}
                authorRole={authorRole}
                setAuthorRole={setAuthorRole}
                authorAvatar={authorAvatar}
                setAuthorAvatar={setAuthorAvatar}
                authorTwitter={authorTwitter}
              />

              <AuthorSocialLinksSection
                authorTwitter={authorTwitter}
                setAuthorTwitter={setAuthorTwitter}
                authorLinkedin={authorLinkedin}
                setAuthorLinkedin={setAuthorLinkedin}
                authorGithub={authorGithub}
                setAuthorGithub={setAuthorGithub}
              />

              {/* Step Navigation Footer */}
              <div className="flex items-center justify-between border-t border-border/80 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("publishing")}
                  className="gap-2"
                >
                  <span>←</span>
                  <span>Back: 04. Publishing</span>
                </Button>
                <Button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className="gap-2"
                >
                  <span>Next: 06. Live Website Preview</span>
                  <span>→</span>
                </Button>
              </div>
            </TabsContent>

            {/* TAB 6: LIVE WEBSITE PREVIEW */}
            <TabsContent
              value="preview"
              className="m-0 space-y-4 focus-visible:outline-hidden"
            >
              <div className="flex items-center justify-between rounded-lg border border-border/80 bg-muted/20 p-3">
                <span className="font-mono text-xs text-muted-foreground">
                  // REAL-TIME RENDERING SIMULATION AS VIEWED ON
                  HTTPS://FI.AMANILLAH.COM/BLOG/{slug || "SLUG"}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />{" "}
                  Live Frontend Sync
                </span>
              </div>

              <FrontendArticlePreview post={previewPostData} />

              {/* Step Navigation Footer */}
              <div className="flex items-center justify-between border-t border-border/80 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("author")}
                  className="gap-2"
                >
                  <span>←</span>
                  <span>Back: 05. Author Persona</span>
                </Button>
                <Button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={isSubmitting}
                  className="gap-2 font-bold shadow-md"
                >
                  <span>{isEdit ? "Update Article" : "Publish / Save Article"}</span>
                  <span>✓</span>
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
