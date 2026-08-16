"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  Eye,
  Search,
  Code2,
  ArrowLeft,
  Edit2,
  Loader2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"
import type { BlogPostDTO, SeoAnalysisResult } from "@workspace/shared"
import { BlogApi } from "@/lib/api"
import { SeoPreviewCard } from "../../components/seo-preview-card"
import { FrontendArticlePreview } from "../../components/preview/frontend-article-preview"

export default function BlogPreviewPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : ""

  const [post, setPost] = React.useState<BlogPostDTO | null>(null)
  const [seoResult, setSeoResult] = React.useState<SeoAnalysisResult | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [isCopiedJsonLd, setIsCopiedJsonLd] = React.useState(false)

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
        <span className="text-sm font-medium">Generating live preview & SEO diagnostics...</span>
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

  const copyPublicLink = () => {
    const url = `https://fi.amanillah.com/blog/${post.slug}`
    navigator.clipboard.writeText(url)
    toast.success("Public link copied to clipboard!")
  }

  const copyJsonLd = () => {
    if (!seoResult?.previews.jsonLd) return
    navigator.clipboard.writeText(JSON.stringify(seoResult.previews.jsonLd, null, 2))
    setIsCopiedJsonLd(true)
    toast.success("Schema.org JSON-LD copied to clipboard!")
    setTimeout(() => setIsCopiedJsonLd(false), 2000)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
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
              / Live Article Preview
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
                <Eye className="h-4 w-4 mr-2" /> Live Website Article View
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

          {/* TAB 1: ARTICLE READER VIEW (Exact Website Replica) */}
          <TabsContent value="article" className="p-4 sm:p-6 lg:p-8 m-0">
            <FrontendArticlePreview post={post} />
          </TabsContent>

          {/* TAB 2: SEO & SERP PREVIEWS */}
          <TabsContent value="seo" className="p-6 md:p-8 space-y-6 m-0">
            <SeoPreviewCard seoAnalysis={seoResult} slug={post.slug} />
          </TabsContent>

          {/* TAB 3: SCHEMA.ORG JSON-LD */}
          <TabsContent value="jsonld" className="p-6 md:p-8 space-y-3 m-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Generated Schema.org Graph ({post.seo?.articleType || "TechArticle"})
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={copyJsonLd}
                className="h-7 text-xs gap-1.5"
              >
                {isCopiedJsonLd ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Copy JSON-LD
                  </>
                )}
              </Button>
            </div>
            <div className="p-4 rounded-xl border border-border bg-[#0d1117] text-[#e6edf3] font-mono text-xs overflow-x-auto max-h-96 leading-relaxed">
              <pre>
                {seoResult?.previews.jsonLd
                  ? JSON.stringify(seoResult.previews.jsonLd, null, 2)
                  : "// Generating structured data graph..."}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
