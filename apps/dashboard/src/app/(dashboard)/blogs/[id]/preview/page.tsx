"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  Eye,
  Calendar,
  Clock,
  User,
  Share2,
  ExternalLink,
  Sparkles,
  Search,
  Code2,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  ArrowLeft,
  Edit2,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { toast } from "@workspace/ui/components/sonner"
import type { BlogPostDTO, SeoAnalysisResult } from "@workspace/shared"
import { BlogApi } from "@/lib/api"
import { SeoPreviewCard } from "../../components/seo-preview-card"

export default function BlogPreviewPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : ""

  const [post, setPost] = React.useState<BlogPostDTO | null>(null)
  const [seoResult, setSeoResult] = React.useState<SeoAnalysisResult | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!id) return

    setIsLoading(true)
    BlogApi.getById(id)
      .then((res) => {
        if (res.success && res.data) {
          setPost(res.data)
          return BlogApi.generateSeoPreview({
            title: res.data.title,
            slug: res.data.slug,
            summary: res.data.summary,
            content: res.data.content,
            thumbnail: res.data.thumbnail,
            category: res.data.category?.name,
            tags: res.data.tags,
            author: res.data.author || undefined,
            seo: res.data.seo,
          })
        } else {
          setError(res.message || "Failed to load post")
          return null
        }
      })
      .then((seoRes) => {
        if (seoRes && seoRes.success && seoRes.data) {
          setSeoResult(seoRes.data)
        }
      })
      .catch((err) => {
        setError(err?.message || "Failed to load post preview")
      })
      .finally(() => setIsLoading(false))
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-sm font-medium">Generating preview & SEO diagnostics...</span>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 rounded-xl border border-destructive/30 bg-destructive/5 text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
        <div className="space-y-1">
          <h2 className="text-base font-bold text-foreground">Error Loading Preview</h2>
          <p className="text-xs text-muted-foreground">{error || "Blog post not found"}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push("/blogs")}>
          <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Blog Posts
        </Button>
      </div>
    )
  }

  const authorName = post.author?.name || "Fi Amanillah"
  const authorRole = post.author?.role || "Full Stack & DevOps Engineer"
  const authorAvatar = post.author?.avatar || "/fi.png"
  const publishedDate = post.date || (post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "Draft")

  const copyPublicLink = () => {
    const url = `https://fi.amanillah.com/blog/${post.slug}`
    navigator.clipboard.writeText(url)
    toast.success("Public link copied to clipboard!")
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-border/80 bg-card shadow-xs">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="h-9 w-9">
            <Link href="/blogs">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <span className="text-xs text-muted-foreground font-mono">
              <Link href="/blogs" className="hover:underline">
                Blogs
              </Link>{" "}
              / Live Preview
            </span>
            <h1 className="text-base md:text-lg font-bold text-foreground line-clamp-1">
              {post.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={copyPublicLink}
            className="text-xs font-medium gap-1.5"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Copy Public URL
          </Button>
          <Button
            size="sm"
            asChild
            className="text-xs font-medium gap-1.5 shadow-xs"
          >
            <Link href={`/blogs/${post.id}/edit`}>
              <Edit2 className="h-3.5 w-3.5" />
              Edit Article
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <Tabs defaultValue="article" className="w-full">
          <div className="px-6 border-b border-border/80 bg-muted/20">
            <TabsList className="bg-transparent h-12 p-0 gap-4">
              <TabsTrigger
                value="article"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-2 font-medium text-xs md:text-sm"
              >
                <Eye className="h-4 w-4 mr-2" /> Article Reader View
              </TabsTrigger>
              <TabsTrigger
                value="seo"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-2 font-medium text-xs md:text-sm"
              >
                <Search className="h-4 w-4 mr-2" /> Search & Social Previews
              </TabsTrigger>
              <TabsTrigger
                value="jsonld"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-2 font-medium text-xs md:text-sm"
              >
                <Code2 className="h-4 w-4 mr-2" /> Schema.org JSON-LD
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: ARTICLE READER VIEW */}
          <TabsContent value="article" className="p-6 md:p-8 space-y-6 m-0">
            {/* Header info */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    {post.category?.name || "Uncategorized"}
                  </Badge>
                  <Badge
                    variant={post.status === "PUBLISHED" ? "default" : "secondary"}
                    className="capitalize text-xs"
                  >
                    {post.status.toLowerCase()}
                  </Badge>
                  {post.featured && (
                    <Badge
                      variant="outline"
                      className="bg-amber-500/10 text-amber-500 border-amber-500/20 flex items-center gap-1"
                    >
                      <Sparkles className="h-3 w-3" /> Featured
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {post.readTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> {publishedDate}
                  </span>
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                {post.title}
              </h1>
              {post.subtitle && (
                <p className="text-base text-muted-foreground leading-relaxed">
                  {post.subtitle}
                </p>
              )}
            </div>

            {/* Thumbnail */}
            {post.thumbnail && (
              <div className="rounded-xl overflow-hidden border border-border aspect-[21/9] bg-muted/40 relative max-h-80">
                <img
                  src={post.thumbnail}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Author Bar */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-border/70 bg-muted/20">
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11 border border-border">
                  <AvatarImage src={authorAvatar} alt={authorName} />
                  <AvatarFallback>{authorName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-sm text-foreground">{authorName}</div>
                  <div className="text-xs text-muted-foreground">{authorRole}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-3.5 w-3.5" /> {post.likesCount} likes
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" /> {post.commentsCount} comments
                </span>
              </div>
            </div>

            {/* Key Takeaways */}
            {post.keyTakeaways && post.keyTakeaways.length > 0 && (
              <div className="p-5 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> Key Architectural Takeaways
                </span>
                <ul className="space-y-2 text-sm text-foreground/90">
                  {post.keyTakeaways.map((takeaway, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Summary Box */}
            <div className="p-4 rounded-xl bg-muted/40 border border-border/70 text-sm italic text-foreground/90 leading-relaxed">
              "{post.summary}"
            </div>

            {/* Markdown Body */}
            <div className="space-y-4 text-sm leading-relaxed border-t border-border pt-6 whitespace-pre-wrap font-sans text-foreground/95">
              {post.content}
            </div>

            {/* Tags Footer */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-border">
                <span className="text-xs font-semibold text-muted-foreground">Topics:</span>
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs font-mono">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 2: SEO & SERP PREVIEWS */}
          <TabsContent value="seo" className="p-6 md:p-8 space-y-6 m-0">
            <SeoPreviewCard seoAnalysis={seoResult} slug={post.slug} />
          </TabsContent>

          {/* TAB 3: SCHEMA.ORG JSON-LD */}
          <TabsContent value="jsonld" className="p-6 md:p-8 space-y-3 m-0">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Generated Schema.org Graph ({post.seo?.articleType || "TechArticle"})
            </span>
            <div className="p-4 rounded-xl border border-border bg-[#0d1117] text-[#e6edf3] font-mono text-xs overflow-x-auto max-h-96">
              <pre>
                {seoResult?.previews.jsonLd
                  ? JSON.stringify(seoResult.previews.jsonLd, null, 2)
                  : "// Generating structured data..."}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
