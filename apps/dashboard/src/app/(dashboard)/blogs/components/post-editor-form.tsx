"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  FileText,
  Search,
  Calendar,
  Image as ImageIcon,
  User,
  BadgeAlert,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Badge } from "@workspace/ui/components/badge"
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
import { BlogApi } from "@/lib/api"
import { useAuth } from "@/providers/auth-provider"

import { EditorHeader } from "./editor-header"
import { ContentTab } from "./content-tab"
import { SeoTab } from "./seo-tab"
import { PublishingTab } from "./publishing-tab"
import { MediaTab } from "./media-tab"
import { AuthorTab } from "./author-tab"

interface PostEditorFormProps {
  initialPost?: BlogPostDTO | null
  categories: BlogCategoryDTO[]
  tags: BlogTagDTO[]
  isEdit?: boolean
  onSuccessRedirect?: string
}

export function PostEditorForm({
  initialPost,
  categories,
  tags: availableTags,
  isEdit = false,
  onSuccessRedirect = "/blogs",
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
      "## Introduction\n\nWrite your technical article here...\n\n```typescript\nconsole.log('Hello World');\n```\n\n## Conclusion\n\nKey takeaways here."
  )
  const [categoryId, setCategoryId] = React.useState<string>(initialPost?.categoryId || "none")
  const [categoryName, setCategoryName] = React.useState(initialPost?.category?.name || "")
  const [keyTakeaways, setKeyTakeaways] = React.useState<string[]>(initialPost?.keyTakeaways || [])
  const [selectedTags, setSelectedTags] = React.useState<string[]>(initialPost?.tags || [])

  // 2. SEO State
  const [metaTitle, setMetaTitle] = React.useState(initialPost?.seo?.metaTitle || "")
  const [metaDescription, setMetaDescription] = React.useState(initialPost?.seo?.metaDescription || "")
  const [canonicalUrl, setCanonicalUrl] = React.useState(initialPost?.seo?.canonicalUrl || "")
  const [articleType, setArticleType] = React.useState<BlogArticleType>(
    initialPost?.seo?.articleType || "TechArticle"
  )
  const [noIndex, setNoIndex] = React.useState(Boolean(initialPost?.seo?.noIndex))
  const [noFollow, setNoFollow] = React.useState(Boolean(initialPost?.seo?.noFollow))
  const [ogTitle, setOgTitle] = React.useState(initialPost?.seo?.ogTitle || "")
  const [ogDescription, setOgDescription] = React.useState(initialPost?.seo?.ogDescription || "")
  const [ogImage, setOgImage] = React.useState(initialPost?.seo?.ogImage || "")
  const [twitterCard, setTwitterCard] = React.useState<"summary" | "summary_large_image">(
    initialPost?.seo?.twitterCard || "summary_large_image"
  )
  const [twitterTitle, setTwitterTitle] = React.useState(initialPost?.seo?.twitterTitle || "")
  const [twitterDescription, setTwitterDescription] = React.useState(initialPost?.seo?.twitterDescription || "")
  const [twitterImage, setTwitterImage] = React.useState(initialPost?.seo?.twitterImage || "")
  const [seoAnalysis, setSeoAnalysis] = React.useState<SeoAnalysisResult | null>(null)

  // 3. Publishing State
  const [status, setStatus] = React.useState<BlogStatus>(initialPost?.status || "DRAFT")
  const [featured, setFeatured] = React.useState(Boolean(initialPost?.featured))
  const [pinned, setPinned] = React.useState(Boolean(initialPost?.pinned))
  const [publishedAt, setPublishedAt] = React.useState(
    initialPost?.publishedAt ? new Date(initialPost.publishedAt).toISOString().slice(0, 16) : ""
  )
  const [scheduledAt, setScheduledAt] = React.useState(
    initialPost?.scheduledAt ? new Date(initialPost.scheduledAt).toISOString().slice(0, 16) : ""
  )
  const [dateDisplay, setDateDisplay] = React.useState(initialPost?.date || "")
  const [readTimeOverride, setReadTimeOverride] = React.useState(initialPost?.readTime || "")

  // 4. Media State
  const [thumbnail, setThumbnail] = React.useState(
    initialPost?.thumbnail || "/assets/images/mickanic-cover.png"
  )

  // 5. Author State
  const [authorName, setAuthorName] = React.useState(
    initialPost?.author?.name || user?.name || "Fi Amanillah"
  )
  const [authorRole, setAuthorRole] = React.useState(
    initialPost?.author?.role || user?.headline || "Full Stack & DevOps Engineer"
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

  // Live Word Count & Reading Time
  const wordCount = React.useMemo(() => {
    return content.replace(/```[\s\S]*?```/g, "").replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length
  }, [content])

  const calculatedReadTime = React.useMemo(() => {
    const mins = Math.max(1, Math.ceil(wordCount / 200))
    return `${mins} MIN READ`
  }, [wordCount])

  // Real-time SEO Diagnostic Preview
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

    if (!title.trim()) {
      toast.error("Article title is required")
      setActiveTab("content")
      return
    }
    if (!summary.trim()) {
      toast.error("Summary excerpt is required")
      setActiveTab("content")
      return
    }
    if (!content.trim()) {
      toast.error("Article content body cannot be empty")
      setActiveTab("content")
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
        publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
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
          canonicalUrl: canonicalUrl.trim() || undefined,
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
        const res = await BlogApi.update(initialPost.id, payload as UpdateBlogPostDTO)
        if (res.success && res.data) {
          toast.success(`Updated '${title}' successfully`)
          router.push(onSuccessRedirect)
          router.refresh()
        } else {
          toast.error(res.message || "Failed to update article")
        }
      } else {
        const res = await BlogApi.create(payload)
        if (res.success && res.data) {
          toast.success(`Created '${title}' successfully`)
          router.push(onSuccessRedirect)
          router.refresh()
        } else {
          toast.error(res.message || "Failed to create article")
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePreviewNavigate = () => {
    if (initialPost?.id) {
      router.push(`/blogs/${initialPost.id}/preview`)
    } else {
      setActiveTab("seo")
      toast.info("Showing live SERP and social card simulation below")
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
        onPreviewClick={handlePreviewNavigate}
        onSaveClick={() => handleSubmit()}
        discardHref="/blogs"
      />

      {/* Main Tabs Container */}
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 border-b border-border/80 bg-muted/20">
            <TabsList className="bg-transparent h-12 p-0 gap-4">
              <TabsTrigger
                value="content"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-2 font-medium text-xs md:text-sm"
              >
                <FileText className="h-4 w-4 mr-2" /> 1. Content & Editor
              </TabsTrigger>
              <TabsTrigger
                value="seo"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-2 font-medium text-xs md:text-sm"
              >
                <Search className="h-4 w-4 mr-2" /> 2. SEO & Previews
                {seoAnalysis && (
                  <Badge
                    variant="outline"
                    className={`ml-2 text-[10px] h-4 px-1.5 ${
                      seoAnalysis.score >= 90
                        ? "text-emerald-500 border-emerald-500/30"
                        : seoAnalysis.score >= 75
                        ? "text-amber-500 border-amber-500/30"
                        : "text-rose-500 border-rose-500/30"
                    }`}
                  >
                    {seoAnalysis.score}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="publishing"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-2 font-medium text-xs md:text-sm"
              >
                <Calendar className="h-4 w-4 mr-2" /> 3. Publishing & Schedule
              </TabsTrigger>
              <TabsTrigger
                value="media"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-2 font-medium text-xs md:text-sm"
              >
                <ImageIcon className="h-4 w-4 mr-2" /> 4. Media & Hero
              </TabsTrigger>
              <TabsTrigger
                value="author"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-2 font-medium text-xs md:text-sm"
              >
                <User className="h-4 w-4 mr-2" /> 5. Author Persona
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6 md:p-8">
            <TabsContent value="content" className="m-0 focus-visible:outline-hidden">
              <ContentTab
                title={title}
                setTitle={setTitle}
                subtitle={subtitle}
                setSubtitle={setSubtitle}
                slug={slug}
                setSlug={setSlug}
                summary={summary}
                setSummary={setSummary}
                content={content}
                setContent={setContent}
                categoryId={categoryId}
                setCategoryId={setCategoryId}
                categoryName={categoryName}
                setCategoryName={setCategoryName}
                categories={categories}
                keyTakeaways={keyTakeaways}
                setKeyTakeaways={setKeyTakeaways}
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
                wordCount={wordCount}
                readTime={calculatedReadTime}
              />
            </TabsContent>

            <TabsContent value="seo" className="m-0 focus-visible:outline-hidden">
              <SeoTab
                title={title}
                summary={summary}
                slug={slug}
                metaTitle={metaTitle}
                setMetaTitle={setMetaTitle}
                metaDescription={metaDescription}
                setMetaDescription={setMetaDescription}
                canonicalUrl={canonicalUrl}
                setCanonicalUrl={setCanonicalUrl}
                articleType={articleType}
                setArticleType={setArticleType}
                noIndex={noIndex}
                setNoIndex={setNoIndex}
                noFollow={noFollow}
                setNoFollow={setNoFollow}
                seoAnalysis={seoAnalysis}
              />
            </TabsContent>

            <TabsContent value="publishing" className="m-0 focus-visible:outline-hidden">
              <PublishingTab
                status={status}
                setStatus={setStatus}
                publishedAt={publishedAt}
                setPublishedAt={setPublishedAt}
                scheduledAt={scheduledAt}
                setScheduledAt={setScheduledAt}
                dateDisplay={dateDisplay}
                setDateDisplay={setDateDisplay}
                readTimeOverride={readTimeOverride}
                setReadTimeOverride={setReadTimeOverride}
                calculatedReadTime={calculatedReadTime}
                featured={featured}
                setFeatured={setFeatured}
                pinned={pinned}
                setPinned={setPinned}
              />
            </TabsContent>

            <TabsContent value="media" className="m-0 focus-visible:outline-hidden">
              <MediaTab
                thumbnail={thumbnail}
                setThumbnail={setThumbnail}
                ogImage={ogImage}
                setOgImage={setOgImage}
                twitterImage={twitterImage}
                setTwitterImage={setTwitterImage}
              />
            </TabsContent>

            <TabsContent value="author" className="m-0 focus-visible:outline-hidden">
              <AuthorTab
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
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
