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
import {
  autoGenerateSeoMetadata,
  calculateClientSeoAnalysis,
  generateSeoSlug,
} from "@/lib/seo-utils"
import {
  DUMMY_MARKDOWN_CONTENT,
  DUMMY_BLOG_POST_DATA,
} from "./editor/content/markdown-editor/dummy-content"

interface PostEditorFormProps {
  initialPost?: BlogPostDTO | null
  categories: BlogCategoryDTO[]
  tags: BlogTagDTO[]
  latestCreatedCategory?: BlogCategoryDTO | null
  isEdit?: boolean
  onSuccessRedirect?: string
  onOpenTaxonomyManager?: () => void
}

export function PostEditorForm({
  initialPost,
  categories,
  tags: availableTagsProp,
  latestCreatedCategory,
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
  const [content, setContent] = React.useState(initialPost?.content || "")
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
  const [localAvailableTags, setLocalAvailableTags] = React.useState<
    BlogTagDTO[]
  >(availableTagsProp || [])

  // Sync available tags with prop updates
  React.useEffect(() => {
    setLocalAvailableTags(availableTagsProp || [])
  }, [availableTagsProp])

  // Auto-select newly created category if added via taxonomy dialog
  React.useEffect(() => {
    if (latestCreatedCategory) {
      setCategoryId(latestCreatedCategory.id)
      setCategoryName(latestCreatedCategory.name)
    }
  }, [latestCreatedCategory])

  // 2. Media & Hero (default empty, prompt user to upload/select)
  const [thumbnail, setThumbnail] = React.useState(initialPost?.thumbnail || "")

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
  const [ogImage, setOgImage] = React.useState(initialPost?.seo?.ogImage || "")
  const [twitterCard, setTwitterCard] = React.useState<
    "summary" | "summary_large_image"
  >(initialPost?.seo?.twitterCard || "summary_large_image")
  const [twitterImage, setTwitterImage] = React.useState(
    initialPost?.seo?.twitterImage || ""
  )
  const [seoAnalysis, setSeoAnalysis] =
    React.useState<SeoAnalysisResult | null>(null)

  // Tracks SEO fields the user has manually edited — auto-gen skips these
  const seoManualFields = React.useRef(new Set<string>())

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
  const [authorId, setAuthorId] = React.useState<string | null>(
    initialPost?.authorId || initialPost?.author?.id || user?.id || null
  )
  const [authorUsername, setAuthorUsername] = React.useState<string | null>(
    initialPost?.author?.username || user?.username || null
  )
  const [authorName, setAuthorName] = React.useState(
    initialPost?.author?.name || user?.name || "Fi Amanillah"
  )
  const [authorRole, setAuthorRole] = React.useState(
    initialPost?.author?.role || user?.headline || "Full Stack Developer"
  )
  const [authorAvatar, setAuthorAvatar] = React.useState(
    initialPost?.author?.avatar || user?.avatar || ""
  )
  const [authorTwitter, setAuthorTwitter] = React.useState(
    initialPost?.author?.twitter || user?.twitterUrl || ""
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

  // Auto-generate SEO-friendly slug from title if not manually edited
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    clearFieldError("title")
    if (!hasManuallyEditedSlug && !isEdit) {
      const generated = generateSeoSlug(newTitle)
      setSlug(generated)
    }
  }

  const generateSlugFromTitle = () => {
    if (!title.trim()) {
      toast.error("Please enter a title first")
      return
    }
    const generated = generateSeoSlug(title)
    setSlug(generated)
    setHasManuallyEditedSlug(true)
    toast.success("SEO-friendly slug auto-generated")
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

  // Tag Handlers with Comma-Separated Support & DB Persistence
  const handleAddTag = React.useCallback(
    (inputVal: string) => {
      if (!inputVal) return
      // Support comma, semicolon, newline separated multiple tags
      const rawTags = inputVal.split(/[,;\n]+/)
      const tagsToAdd: string[] = []

      for (const raw of rawTags) {
        const clean = raw
          .trim()
          .toLowerCase()
          .replace(/^#+/, "")
          .replace(/[^a-z0-9-_]/g, "")
        if (
          clean &&
          !selectedTags.includes(clean) &&
          !tagsToAdd.includes(clean)
        ) {
          tagsToAdd.push(clean)
        }
      }

      if (tagsToAdd.length === 0) {
        setTagInput("")
        return
      }

      setSelectedTags((prev) => [...prev, ...tagsToAdd])
      setTagInput("")

      // Persist each new tag to the database in background
      tagsToAdd.forEach((t) => {
        BlogApi.createTag({ name: t })
          .then((res) => {
            if (res.success && res.data) {
              const newTag = res.data
              setLocalAvailableTags((prev) => {
                if (
                  prev.some(
                    (existing) =>
                      existing.id === newTag.id || existing.slug === newTag.slug
                  )
                ) {
                  return prev
                }
                return [...prev, newTag]
              })
            }
          })
          .catch(() => {})
      })
    },
    [selectedTags]
  )

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tagToRemove))
  }

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val.includes(",") || val.includes(";")) {
      const parts = val.split(/[,;]+/)
      const toAdd = parts.slice(0, -1).join(",")
      const remaining = parts[parts.length - 1] || ""
      if (toAdd.trim()) {
        handleAddTag(toAdd)
      }
      setTagInput(remaining)
    } else {
      setTagInput(val)
    }
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      handleAddTag(tagInput)
    }
  }

  const handleTagInputPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text")
    if (
      pasted &&
      (pasted.includes(",") || pasted.includes(";") || pasted.includes("\n"))
    ) {
      e.preventDefault()
      handleAddTag(pasted)
    }
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
      setAuthorId(user.id)
      setAuthorUsername(user.username)
      setAuthorName(user.name || "Fi Amanillah")
      setAuthorRole(user.headline || user.role || "Full Stack Developer")
      setAuthorAvatar(user.avatar || "")
      setAuthorTwitter(user.twitterUrl || "")
      setAuthorLinkedin(user.linkedinUrl || "")
      setAuthorGithub(user.githubUrl || "")
      toast.success("Reset author persona to your active profile")
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

  // Single debounced effect: auto-fills SEO from content + computes live score.
  // Skips fields the user has manually edited (tracked in seoManualFields ref).
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (title || summary || content) {
        const gen = autoGenerateSeoMetadata({ title, summary, content, slug })

        // Auto-fill each field only if user hasn't manually touched it
        if (!seoManualFields.current.has("slug") && !slug) setSlug(gen.slug)
        if (!seoManualFields.current.has("metaTitle"))
          setMetaTitle(gen.metaTitle)
        if (!seoManualFields.current.has("metaDescription"))
          setMetaDescription(gen.metaDescription)
        if (!seoManualFields.current.has("canonicalUrl"))
          setCanonicalUrl(gen.canonicalUrl)
        if (!seoManualFields.current.has("articleType"))
          setArticleType(gen.articleType)
      }

      // Always recompute the live SEO score
      setSeoAnalysis(
        calculateClientSeoAnalysis({
          title,
          summary,
          content,
          slug,
          metaTitle,
          metaDescription,
          canonicalUrl,
          coverImage: thumbnail,
          tags: selectedTags,
        })
      )
    }, 350)

    return () => clearTimeout(timer)
  }, [
    title,
    summary,
    content,
    slug,
    metaTitle,
    metaDescription,
    canonicalUrl,
    thumbnail,
    selectedTags,
  ])

  // One-click "Regenerate SEO" — clears all dirty flags and forces a full re-derive
  const handleAutoGenerateSeo = React.useCallback(() => {
    if (!title.trim() && !summary.trim() && !content.trim()) {
      toast.error("Please enter a title, summary, or content first")
      return
    }

    seoManualFields.current.clear()

    const generated = autoGenerateSeoMetadata({ title, summary, content, slug })
    if (!slug) setSlug(generated.slug)
    setMetaTitle(generated.metaTitle)
    setMetaDescription(generated.metaDescription)
    setCanonicalUrl(generated.canonicalUrl)
    setArticleType(generated.articleType)

    toast.success("✨ SEO metadata regenerated from content")
  }, [title, summary, content, slug])

  // Handlers for inserting dummy content and full sample post
  const handleInsertDummyContent = React.useCallback(() => {
    setContent(DUMMY_MARKDOWN_CONTENT)
    clearFieldError("content")
    toast.success("Loaded sample markdown content with all blocks & styles!")
  }, [])

  const handleFillFullSamplePost = React.useCallback(() => {
    setTitle(DUMMY_BLOG_POST_DATA.title)
    setSubtitle(DUMMY_BLOG_POST_DATA.subtitle)
    setSlug(DUMMY_BLOG_POST_DATA.slug)
    setHasManuallyEditedSlug(true)
    setSummary(DUMMY_BLOG_POST_DATA.summary)
    setContent(DUMMY_BLOG_POST_DATA.content)
    setKeyTakeaways(DUMMY_BLOG_POST_DATA.keyTakeaways)
    setSelectedTags(DUMMY_BLOG_POST_DATA.tags)
    setThumbnail(DUMMY_BLOG_POST_DATA.thumbnail)
    setMetaTitle(DUMMY_BLOG_POST_DATA.seo.metaTitle)
    setMetaDescription(DUMMY_BLOG_POST_DATA.seo.metaDescription)
    setCanonicalUrl(DUMMY_BLOG_POST_DATA.seo.canonicalUrl)
    setArticleType(DUMMY_BLOG_POST_DATA.seo.articleType)

    // Select first category if available
    if (categories.length > 0 && categoryId === "none") {
      setCategoryId(categories[0].id)
      setCategoryName(categories[0].name)
    }

    setFieldErrors({})
    toast.success("✨ Populated full sample blog post with all fields!")
  }, [categories, categoryId])

  // Draft Post Object for Live Website Simulation
  const previewPostData: BlogPostDTO = React.useMemo(() => {
    return {
      id: initialPost?.id || "draft-preview",
      title: title || "Untitled Technical Guide",
      subtitle: subtitle || undefined,
      slug: slug || "untitled-technical-guide",
      summary: summary || "Technical guide overview.",
      content: content || "",
      thumbnail: thumbnail || "",
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
        id: authorId || undefined,
        username: authorUsername || undefined,
        name: authorName || "Fi Amanillah",
        role: authorRole || "Full Stack Developer",
        avatar: authorAvatar || "",
        twitter: authorTwitter || undefined,
        linkedin: authorLinkedin || undefined,
        github: authorGithub || undefined,
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
        ogTitle: metaTitle || title || undefined,
        ogDescription: metaDescription || summary || undefined,
        ogImage: ogImage || undefined,
        twitterCard,
        twitterTitle: metaTitle || title || undefined,
        twitterDescription: metaDescription || summary || undefined,
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
    ogImage,
    twitterCard,
    twitterImage,
    wordCount,
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
      let finalTags = [...selectedTags]
      if (tagInput.trim()) {
        const leftoverTags = tagInput
          .split(/[,;\n]+/)
          .map((t) =>
            t
              .trim()
              .toLowerCase()
              .replace(/^#+/, "")
              .replace(/[^a-z0-9-_]/g, "")
          )
          .filter((t) => t && !finalTags.includes(t))
        if (leftoverTags.length > 0) {
          finalTags = [...finalTags, ...leftoverTags]
          setSelectedTags(finalTags)
          setTagInput("")
        }
      }

      const payload: CreateBlogPostDTO = {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        slug: slug.trim() || undefined,
        summary: summary.trim(),
        content: content.trim(),
        thumbnail: thumbnail.trim() || undefined,
        categoryId: categoryId === "none" ? undefined : categoryId,
        categoryName: categoryName.trim() || undefined,
        tags: finalTags,
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
        date: dateDisplay.trim() || null,
        readTime: readTimeOverride.trim() || calculatedReadTime,
        authorId: authorId || undefined,
        author: {
          id: authorId || undefined,
          username: authorUsername || undefined,
          name: authorName.trim() || "Fi Amanillah",
          role: authorRole.trim() || null,
          avatar: authorAvatar.trim() || null,
          twitter: authorTwitter.trim() || null,
          linkedin: authorLinkedin.trim() || null,
          github: authorGithub.trim() || null,
        },
        seo: {
          metaTitle: metaTitle.trim() || null,
          metaDescription: metaDescription.trim() || null,
          metaKeywords: finalTags,
          canonicalUrl: cleanUrl(canonicalUrl),
          articleType,
          noIndex,
          noFollow,
          // OG and Twitter fields derive from meta equivalents — no separate state needed
          ogTitle: metaTitle.trim() || title.trim() || null,
          ogDescription: metaDescription.trim() || summary.trim() || null,
          ogImage: ogImage.trim() || thumbnail.trim() || null,
          twitterCard,
          twitterTitle: metaTitle.trim() || title.trim() || null,
          twitterDescription: metaDescription.trim() || summary.trim() || null,
          twitterImage: twitterImage.trim() || thumbnail.trim() || null,
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
                  onInsertDummyContent={handleInsertDummyContent}
                  onFillFullSamplePost={handleFillFullSamplePost}
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
                    placeholder="Add tags (comma-separated, e.g. redis, k8s)..."
                    value={tagInput}
                    onChange={handleTagInputChange}
                    onKeyDown={handleTagInputKeyDown}
                    onPaste={handleTagInputPaste}
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
                {localAvailableTags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 pt-0.5">
                    <span className="font-mono text-[9px] text-muted-foreground">
                      Suggested:
                    </span>
                    {localAvailableTags.slice(0, 8).map((t) => (
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
                  seoManualFields.current.add("metaTitle")
                  setMetaTitle(val)
                  clearFieldError("seo.metaTitle")
                }}
                metaTitleError={
                  fieldErrors["seo.metaTitle"] || fieldErrors.metaTitle
                }
                metaDescription={metaDescription}
                setMetaDescription={(val) => {
                  seoManualFields.current.add("metaDescription")
                  setMetaDescription(val)
                  clearFieldError("seo.metaDescription")
                }}
                metaDescriptionError={
                  fieldErrors["seo.metaDescription"] ||
                  fieldErrors.metaDescription
                }
                canonicalUrl={canonicalUrl}
                setCanonicalUrl={(val) => {
                  seoManualFields.current.add("canonicalUrl")
                  setCanonicalUrl(val)
                  clearFieldError("seo.canonicalUrl")
                }}
                canonicalUrlError={
                  fieldErrors["seo.canonicalUrl"] || fieldErrors.canonicalUrl
                }
                articleType={articleType}
                setArticleType={(val) => {
                  seoManualFields.current.add("articleType")
                  setArticleType(val)
                }}
                noIndex={noIndex}
                setNoIndex={setNoIndex}
                noFollow={noFollow}
                setNoFollow={setNoFollow}
                seoAnalysis={seoAnalysis}
                onAutoGenerateSeo={handleAutoGenerateSeo}
              />
            </div>

            {/* 4. AUTHOR PERSONA CARD */}
            <div className="space-y-2 rounded-xl border border-border/80 bg-card p-3.5 shadow-xs">
              <span className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                <User className="h-3.5 w-3.5 text-primary" /> Author Persona
              </span>
              <AuthorSection
                authorId={authorId}
                setAuthorId={setAuthorId}
                authorUsername={authorUsername}
                setAuthorUsername={setAuthorUsername}
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
