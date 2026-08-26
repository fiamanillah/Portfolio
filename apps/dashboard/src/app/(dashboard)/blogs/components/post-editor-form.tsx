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
  ChevronDown,
  ChevronUp,
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
import { EditorHeader, type EditorViewMode } from "./editor/editor-header"
import { MarkdownEditor } from "./editor/content/markdown-editor"
import { KeyTakeawaysSection } from "./editor/content/key-takeaways-section"
import { CoverImageSection } from "./editor/media/cover-image-section"
import { AuthorSection } from "./editor/author/author-section"
import { SeoSection } from "./editor/seo/seo-section"
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

  const [viewMode, setViewMode] = React.useState<EditorViewMode>("editor")

  // 1. Content State
  const [title, setTitle] = React.useState(initialPost?.title || "")
  const [subtitle, setSubtitle] = React.useState(initialPost?.subtitle || "")
  const [slug, setSlug] = React.useState(initialPost?.slug || "")
  const [hasManuallyEditedSlug, setHasManuallyEditedSlug] = React.useState(
    Boolean(initialPost?.slug)
  )
  const [summary, setSummary] = React.useState(initialPost?.summary || "")
  const [content, setContent] = React.useState(
    initialPost?.content ||
      "## Introduction\n\nWrite your technical article here with code snippets, diagrams, and explanations...\n\n```typescript\nconsole.log('Production ready architecture');\n```\n\n> [!NOTE]\n> Real-time streaming enables microsecond state sync.\n\n## Key Concepts\n\nDetails go here.\n\n## Conclusion\n\nSummary of takeaways."
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
  const [tagInput, setTagInput] = React.useState("")

  // 2. Media & Hero
  const [thumbnail, setThumbnail] = React.useState(
    initialPost?.thumbnail || "/assets/images/mickanic-cover.png"
  )

  // 3. SEO State
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

  // 4. Publishing State
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

  // 5. Author State (defaulted from user profile)
  const [authorName, setAuthorName] = React.useState(
    initialPost?.author?.name || user?.name || "Fi Amanillah"
  )
  const [authorRole, setAuthorRole] = React.useState(
    initialPost?.author?.role || user?.headline || "Full Stack Developer"
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

  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>(
    {}
  )

  // Auto-generate slug from title if not manually edited
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    clearFieldError("title")
    if (!hasManuallyEditedSlug && !isEdit) {
      const generated = newTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")
      setSlug(generated)
    }
  }

  const generateSlugFromTitle = () => {
    if (!title.trim()) {
      toast.error("Please enter a title first")
      return
    }
    const generated = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
    setSlug(generated)
    setHasManuallyEditedSlug(true)
    toast.success("Slug auto-generated from title")
  }

  const clearFieldError = (fieldKey: string) => {
    setFieldErrors((prev) => {
      if (!prev[fieldKey]) return prev
      const next = { ...prev }
      delete next[fieldKey]
      const leaf = fieldKey.split(".").pop()
      if (leaf && next[leaf]) delete next[leaf]
      return next
    })
  }

  // Tag Handlers
  const handleAddTag = (tagToAdd: string) => {
    const clean = tagToAdd
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
    if (!clean) return
    if (!selectedTags.includes(clean)) {
      setSelectedTags([...selectedTags, clean])
    }
    setTagInput("")
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tagToRemove))
  }

  const handleCategorySelect = (val: string) => {
    setCategoryId(val)
    if (val === "none") {
      setCategoryName("")
    } else {
      const found = categories.find((c) => c.id === val)
      if (found) setCategoryName(found.name)
    }
  }

  const handleResetAuthorToUser = () => {
    if (user) {
      setAuthorName(user.name || "Fi Amanillah")
      setAuthorRole(user.headline || "Full Stack Developer")
      setAuthorAvatar(user.avatar || "/fi.png")
      setAuthorTwitter(user.twitterUrl || "@fiamanillah")
      setAuthorLinkedin(user.linkedinUrl || "")
      setAuthorGithub(user.githubUrl || "")
      toast.success("Reset author info to your logged-in profile")
    }
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
            color: "#3b82f6",
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
    wordCount,
  ])

  // Real-time SEO Diagnostic Preview Generation (Debounced)
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
  const handleSubmit = async (overrideStatus?: BlogStatus) => {
    const targetStatus = overrideStatus || status

    // Client-Side Pre-Validation
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
      }
    }

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors)
      showApiError(
        {
          errorIssues: Object.entries(clientErrors).map(([path, message]) => ({
            path,
            message,
          })),
        },
        "Please fill in required fields"
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
        status: targetStatus,
        featured,
        pinned,
        publishedAt:
          targetStatus === "PUBLISHED"
            ? publishedAt
              ? new Date(publishedAt).toISOString()
              : new Date().toISOString()
            : publishedAt
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
          ogImage: ogImage.trim() || thumbnail.trim() || undefined,
          twitterCard,
          twitterTitle: twitterTitle.trim() || undefined,
          twitterDescription: twitterDescription.trim() || undefined,
          twitterImage: twitterImage.trim() || thumbnail.trim() || undefined,
        },
      }

      if (isEdit && initialPost) {
        const res = await BlogApi.update(
          initialPost.id,
          payload as UpdateBlogPostDTO
        )
        if (res.success && res.data) {
          setFieldErrors({})
          toast.success(
            targetStatus === "PUBLISHED"
              ? `Published '${title}' successfully!`
              : `Saved changes to '${title}'`
          )
          router.push(onSuccessRedirect)
          router.refresh()
        } else {
          showApiError(res, "Failed to update article")
          setFieldErrors(extractFieldErrors(res))
        }
      } else {
        const res = await BlogApi.create(payload)
        if (res.success && res.data) {
          setFieldErrors({})
          toast.success(
            targetStatus === "PUBLISHED"
              ? `Published '${title}' successfully!`
              : `Created draft '${title}'`
          )
          router.push(onSuccessRedirect)
          router.refresh()
        } else {
          showApiError(res, "Failed to create article")
          setFieldErrors(extractFieldErrors(res))
        }
      }
    } catch (err: unknown) {
      showApiError(err, "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
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
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onSaveClick={handleSubmit}
        discardHref="/blogs"
      />

      {/* VIEW 1: MAIN 2-COLUMN WRITING & PUBLISHING STUDIO */}
      {viewMode === "editor" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* LEFT: MAIN WRITING CANVAS (8 cols) */}
          <div className="space-y-5 lg:col-span-8">
            <div className="space-y-4 rounded-xl border border-border/80 bg-card p-4 shadow-xs sm:p-5">
              {/* Title Input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                    Article Title *
                  </label>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {title.length} chars
                  </span>
                </div>
                <Input
                  placeholder="e.g. Building High-Concurrency WebSocket Gateways in TypeScript"
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

              {/* Subtitle (Optional) */}
              <div className="space-y-1">
                <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  Subtitle / Lead Hook (Optional)
                </label>
                <Input
                  placeholder="e.g. Architectural breakdown of distributed event buses and horizontal scaling"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="h-8.5 border-border/90 bg-background text-xs"
                />
              </div>

              {/* Summary / Excerpt */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                    Summary / Excerpt *
                  </label>
                  <span
                    className={`font-mono text-[10px] ${
                      summary.length > 200
                        ? "font-semibold text-amber-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    {summary.length}/200 chars
                  </span>
                </div>
                <Textarea
                  placeholder="Brief 2-3 sentence overview shown on blog cards, RSS feeds, and Google search snippets..."
                  value={summary}
                  onChange={(e) => {
                    setSummary(e.target.value)
                    clearFieldError("summary")
                  }}
                  rows={2}
                  className={`bg-background text-xs leading-relaxed ${
                    fieldErrors.summary
                      ? "border-destructive focus:border-destructive"
                      : "border-border/90"
                  }`}
                  required
                />
                {fieldErrors.summary && (
                  <p className="font-mono text-xs text-destructive">
                    ⚠ {fieldErrors.summary}
                  </p>
                )}
              </div>

              {/* Article Markdown Body */}
              <div className="space-y-1.5 pt-1">
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

              {/* Key Takeaways Builder */}
              <div className="border-t border-border/70 pt-3">
                <KeyTakeawaysSection
                  keyTakeaways={keyTakeaways}
                  setKeyTakeaways={setKeyTakeaways}
                />
              </div>
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

              {/* Primary 1-Click Action Button */}
              <Button
                type="button"
                onClick={() => handleSubmit()}
                disabled={isSubmitting}
                className="h-9 w-full gap-2 text-xs font-bold shadow-xs"
              >
                {isSubmitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : status === "PUBLISHED" ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                <span>
                  {isEdit
                    ? status === "PUBLISHED"
                      ? "Update Article"
                      : "Save Changes"
                    : status === "PUBLISHED"
                      ? "Publish Article Now"
                      : "Save Draft Post"}
                </span>
              </Button>

              {/* Quick Status Select */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">
                  Status
                </label>
                <Select
                  value={status}
                  onValueChange={(val) => setStatus(val as BlogStatus)}
                >
                  <SelectTrigger className="h-8 bg-background text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft (Unpublished)</SelectItem>
                    <SelectItem value="PUBLISHED">Published (Live)</SelectItem>
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                    <SelectItem value="ARCHIVED">Archived (Hidden)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Published Date (if scheduled or published) */}
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {status === "SCHEDULED"
                    ? "Scheduled Release Date"
                    : "Publish Date & Time"}
                </label>
                <Input
                  type="datetime-local"
                  value={status === "SCHEDULED" ? scheduledAt : publishedAt}
                  onChange={(e) => {
                    if (status === "SCHEDULED") {
                      setScheduledAt(e.target.value)
                    } else {
                      setPublishedAt(e.target.value)
                    }
                  }}
                  className="h-8 bg-background text-xs"
                />
              </div>

              {/* Featured & Pinned Switches */}
              <div className="space-y-2 border-t border-border/70 pt-2.5">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-xs font-semibold text-foreground">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />{" "}
                      Featured Article
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Show in homepage highlights
                    </div>
                  </div>
                  <Switch checked={featured} onCheckedChange={setFeatured} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-xs font-semibold text-foreground">
                      <Pin className="h-3.5 w-3.5 text-primary" /> Pinned Post
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Pin to top of blog list
                    </div>
                  </div>
                  <Switch checked={pinned} onCheckedChange={setPinned} />
                </div>
              </div>
            </div>

            {/* 2. ORGANIZATION & COVER CARD */}
            <div className="space-y-3 rounded-xl border border-border/80 bg-card p-3.5 shadow-xs">
              <div className="flex items-center justify-between border-b border-border/70 pb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  <FolderTree className="h-3.5 w-3.5 text-primary" />{" "}
                  Organization & Media
                </span>
              </div>

              {/* Primary Category */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-muted-foreground">
                    Category
                  </label>
                  {onOpenTaxonomyManager && (
                    <button
                      type="button"
                      onClick={onOpenTaxonomyManager}
                      className="font-mono text-[10px] text-primary hover:underline"
                    >
                      + Manage
                    </button>
                  )}
                </div>
                <Select value={categoryId} onValueChange={handleCategorySelect}>
                  <SelectTrigger className="h-8 bg-background text-xs">
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- No Category --</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Technical Tags */}
              <div className="space-y-1">
                <label className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                  <TagIcon className="h-3 w-3" /> Technical Tags
                </label>
                <div className="flex items-center gap-1.5">
                  <Input
                    placeholder="Add tag and press Enter..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault()
                        handleAddTag(tagInput)
                      }
                    }}
                    className="h-8 bg-background font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddTag(tagInput)}
                    disabled={!tagInput.trim()}
                    className="h-8 shrink-0 px-2.5 text-xs"
                  >
                    +
                  </Button>
                </div>

                {/* Selected Tag Chips */}
                <div className="flex min-h-5 flex-wrap gap-1 pt-0.5">
                  {selectedTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="gap-1 py-0.5 pr-1 pl-2 font-mono text-[9px]"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>

                {/* Suggested database tags */}
                {availableTags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 pt-0.5">
                    <span className="font-mono text-[9px] text-muted-foreground">
                      Suggested:
                    </span>
                    {availableTags.slice(0, 6).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleAddTag(t.slug || t.name)}
                        className="rounded border border-border/60 bg-background px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        +{t.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* URL Slug Input */}
              <div className="space-y-1 border-t border-border/70 pt-2.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                    <Globe className="h-3 w-3" /> URL Slug *
                  </label>
                  <button
                    type="button"
                    onClick={generateSlugFromTitle}
                    className="font-mono text-[10px] text-primary hover:underline"
                  >
                    Auto-generate
                  </button>
                </div>
                <div className="flex items-center rounded-lg border border-border/90 bg-background px-2.5 py-1 text-xs">
                  <span className="font-mono text-[11px] text-muted-foreground select-none">
                    /blog/
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
                    placeholder="article-slug"
                    className="flex-1 border-0 bg-transparent px-1 font-mono text-xs text-foreground outline-none"
                  />
                </div>
                {fieldErrors.slug && (
                  <p className="font-mono text-[11px] text-destructive">
                    ⚠ {fieldErrors.slug}
                  </p>
                )}
              </div>

              {/* Cover Artwork */}
              <div className="border-t border-border/70 pt-2.5">
                <CoverImageSection
                  thumbnail={thumbnail}
                  setThumbnail={setThumbnail}
                />
              </div>
            </div>

            {/* 3. SEO & SOCIAL OPTIMIZATION */}
            <div className="rounded-xl border border-border/80 bg-card p-3.5 shadow-xs">
              <SeoSection
                title={title}
                summary={summary}
                slug={slug}
                metaTitle={metaTitle}
                setMetaTitle={(val) => {
                  setMetaTitle(val)
                  clearFieldError("seo.metaTitle")
                }}
                metaTitleError={
                  fieldErrors["seo.metaTitle"] || fieldErrors.metaTitle
                }
                metaDescription={metaDescription}
                setMetaDescription={(val) => {
                  setMetaDescription(val)
                  clearFieldError("seo.metaDescription")
                }}
                metaDescriptionError={
                  fieldErrors["seo.metaDescription"] ||
                  fieldErrors.metaDescription
                }
                canonicalUrl={canonicalUrl}
                setCanonicalUrl={(val) => {
                  setCanonicalUrl(val)
                  clearFieldError("seo.canonicalUrl")
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
                seoAnalysis={seoAnalysis}
              />
            </div>

            {/* 4. AUTHOR PERSONA CARD */}
            <div className="space-y-2 rounded-xl border border-border/80 bg-card p-3.5 shadow-xs">
              <span className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                <User className="h-3.5 w-3.5 text-primary" /> Author Persona
              </span>
              <AuthorSection
                authorName={authorName}
                setAuthorName={setAuthorName}
                authorRole={authorRole}
                setAuthorRole={setAuthorRole}
                authorAvatar={authorAvatar}
                setAuthorAvatar={setAuthorAvatar}
                authorTwitter={authorTwitter}
                setAuthorTwitter={setAuthorTwitter}
                authorLinkedin={authorLinkedin}
                setAuthorLinkedin={setAuthorLinkedin}
                authorGithub={authorGithub}
                setAuthorGithub={setAuthorGithub}
                onResetToUserProfile={handleResetAuthorToUser}
              />
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: EXACT PUBLIC PORTFOLIO ARTICLE READER SIMULATION */}
      {viewMode === "preview" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-card p-3.5 shadow-xs">
            <span className="font-mono text-xs text-muted-foreground">
              // LIVE PREVIEW SIMULATION: HTTPS://FI.AMANILLAH.COM/BLOG/
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
                Back to Editor
              </Button>
              <Button
                type="button"
                onClick={() => handleSubmit()}
                disabled={isSubmitting}
                className="h-8 gap-1.5 text-xs font-bold shadow-xs"
              >
                {isSubmitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                {isEdit ? "Update Article" : "Publish / Save Article"}
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border/80 bg-card p-4 shadow-xs sm:p-8">
            <FrontendArticlePreview post={previewPostData} />
          </div>
        </div>
      )}
    </div>
  )
}
