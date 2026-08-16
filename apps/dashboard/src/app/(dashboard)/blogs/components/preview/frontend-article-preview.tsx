"use client"

import * as React from "react"
import {
  Calendar,
  Clock,
  ThumbsUp,
  MessageSquare,
  Link as LinkIcon,
  Sparkles,
  Share2,
  ExternalLink,
  Copy,
  Check,
  Hash,
} from "lucide-react"
import { Marked } from "marked"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"
import type { BlogPostDTO } from "@workspace/shared"

interface FrontendArticlePreviewProps {
  post: BlogPostDTO
  siteUrl?: string
}

interface TocItem {
  id: string
  text: string
  level: number
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

function processAlertCallouts(html: string): string {
  const alertTypes: Record<
    string,
    { label: string; classModifier: string; icon: string }
  > = {
    NOTE: {
      label: "NOTE",
      icon: `<svg class="h-4 w-4 text-sky-400 shrink-0 inline-block mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
      classModifier: "border-sky-500/30 bg-sky-500/5 text-sky-200",
    },
    TIP: {
      label: "TIP",
      icon: `<svg class="h-4 w-4 text-emerald-400 shrink-0 inline-block mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4"/><path d="m4.93 4.93 2.83 2.83"/><path d="M2 12h4"/><path d="m4.93 19.07 2.83-2.83"/><path d="M12 22v-4"/><path d="m19.07 19.07-2.83-2.83"/><path d="M22 12h-4"/><path d="m19.07 4.93-2.83 2.83"/><circle cx="12" cy="12" r="4"/></svg>`,
      classModifier: "border-emerald-500/30 bg-emerald-500/5 text-emerald-200",
    },
    IMPORTANT: {
      label: "IMPORTANT",
      icon: `<svg class="h-4 w-4 text-violet-400 shrink-0 inline-block mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      classModifier: "border-violet-500/30 bg-violet-500/5 text-violet-200",
    },
    WARNING: {
      label: "WARNING",
      icon: `<svg class="h-4 w-4 text-amber-400 shrink-0 inline-block mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      classModifier: "border-amber-500/30 bg-amber-500/5 text-amber-200",
    },
    CAUTION: {
      label: "CAUTION",
      icon: `<svg class="h-4 w-4 text-rose-400 shrink-0 inline-block mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
      classModifier: "border-rose-500/30 bg-rose-500/5 text-rose-200",
    },
  }

  const blockquoteRegex =
    /<blockquote>\s*<p>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(?:<br\s*\/?>)?([\s\S]*?)<\/p>\s*([\s\S]*?)<\/blockquote>/gi

  return html.replace(blockquoteRegex, (_match, type, firstLine, rest) => {
    const upperType = type.toUpperCase()
    const config = alertTypes[upperType] || alertTypes.NOTE
    const fullBody = (
      firstLine.trim() + (rest ? `\n${rest.trim()}` : "")
    ).trim()

    return `
      <div class="my-6 relative overflow-hidden rounded-md border p-4 sm:p-5 backdrop-blur-sm ${config.classModifier}">
        <div class="pointer-events-none absolute top-1.5 left-1.5 h-2 w-2 border-t border-l border-current opacity-40"></div>
        <div class="pointer-events-none absolute top-1.5 right-1.5 h-2 w-2 border-t border-r border-current opacity-40"></div>
        <div class="pointer-events-none absolute bottom-1.5 left-1.5 h-2 w-2 border-b border-l border-current opacity-40"></div>
        <div class="pointer-events-none absolute right-1.5 bottom-1.5 h-2 w-2 border-r border-b border-current opacity-40"></div>
        
        <div class="flex items-center gap-2 font-mono text-xs font-bold tracking-widest uppercase mb-2">
          ${config.icon}
          <span>// ${config.label}</span>
        </div>
        <div class="text-sm leading-relaxed text-foreground/90 prose-alert-content">
          ${fullBody}
        </div>
      </div>
    `
  })
}

function processMarkdownImages(html: string): string {
  return html.replace(
    /<p><img\s+src="([^"]+)"\s+alt="([^"]*)"(?:\s+title="([^"]*)")?\s*\/?>\s*<\/p>/gi,
    (_match, src, alt, title) => {
      const caption = title || (alt && alt !== src ? alt : "")
      return `
      <figure class="blog-image-figure my-8 overflow-hidden rounded-md border border-border/80 bg-card/60 shadow-md">
        <div class="relative overflow-hidden">
          <img
            src="${src}"
            alt="${alt}"
            loading="lazy"
            decoding="async"
            class="w-full h-auto object-cover max-h-[550px]"
          />
          <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent"></div>
        </div>
        ${
          caption
            ? `<figcaption class="border-t border-border/60 bg-muted/30 px-4 py-2.5 text-center font-mono text-xs text-muted-foreground">
                // ${caption}
              </figcaption>`
            : ""
        }
      </figure>
    `
    }
  )
}

function processMarkdownTables(html: string): string {
  return html.replace(
    /<table>([\s\S]*?)<\/table>/gi,
    '<div class="blog-table-wrapper my-6 overflow-x-auto rounded-md border border-border/80 bg-card/60 shadow-sm"><table class="w-full text-left text-sm">$1</table></div>'
  )
}

function processCodeBlocks(html: string): string {
  // Add macOS terminal header dots to code blocks
  return html.replace(
    /<pre><code class="language-([^"]+)">([\s\S]*?)<\/code><\/pre>/gi,
    (_match, lang, code) => {
      const displayLang = lang.toUpperCase()
      return `
      <div class="code-block-container relative my-6 overflow-hidden rounded-md border border-border/80 shadow-lg bg-[#0d1117]">
        <div class="code-header flex items-center justify-between border-b border-border/40 bg-muted/20 px-4 py-2 text-xs font-mono select-none">
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1.5">
              <span class="h-2.5 w-2.5 rounded-full bg-red-500/70 inline-block"></span>
              <span class="h-2.5 w-2.5 rounded-full bg-amber-500/70 inline-block"></span>
              <span class="h-2.5 w-2.5 rounded-full bg-emerald-500/70 inline-block"></span>
            </div>
            <span class="ml-2 font-medium text-foreground/80 font-mono text-[11px]">// Snippet</span>
          </div>
          <span class="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary uppercase tracking-wider border border-primary/20">
            ${displayLang}
          </span>
        </div>
        <pre class="p-4 overflow-x-auto text-[13px] font-mono leading-relaxed text-[#e6edf3]"><code>${code}</code></pre>
      </div>
    `
    }
  )
}

export function FrontendArticlePreview({
  post,
  siteUrl = "https://fi.amanillah.com",
}: FrontendArticlePreviewProps) {
  const [copiedLink, setCopiedLink] = React.useState(false)

  const authorName = post.author?.name || "Fi Amanillah"
  const authorRole = post.author?.role || "Full Stack & DevOps Engineer"
  const authorAvatar = post.author?.avatar || "/fi.png"
  const categoryName = post.category?.name || "Architecture"
  const publishedDate =
    post.date ||
    (post.publishedAt
      ? new Date(post.publishedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Live Article")

  // Extract headings and parse HTML
  const { html, toc } = React.useMemo(() => {
    const extractedToc: TocItem[] = []
    if (!post.content) return { html: "", toc: [] }

    try {
      const markedInstance = new Marked({
        gfm: true,
        breaks: true,
      })

      markedInstance.use({
        renderer: {
          heading({ depth, text }) {
            const rawText = text.replace(/<[^>]*>/g, "").trim()
            const slug = slugify(rawText)

            if (depth === 2 || depth === 3) {
              extractedToc.push({
                id: slug,
                text: rawText,
                level: depth,
              })
            }

            const tag = `h${depth}`
            const headingClasses: Record<number, string> = {
              1: "text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mt-12 mb-6 border-b border-border/60 pb-3",
              2: "text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-10 mb-4 border-b border-border/40 pb-2.5",
              3: "text-xl sm:text-2xl font-semibold tracking-tight text-foreground mt-8 mb-3",
              4: "text-lg sm:text-xl font-semibold text-foreground mt-6 mb-2",
              5: "text-base font-semibold text-foreground mt-4 mb-2",
              6: "text-sm font-semibold tracking-wider uppercase text-muted-foreground mt-4 mb-2",
            }
            const cls = headingClasses[depth] || headingClasses[2]

            return `
              <${tag} id="${slug}" class="group scroll-mt-28 flex items-center gap-2 ${cls}">
                <a href="#${slug}" class="heading-anchor text-muted-foreground/30 hover:text-primary transition-opacity duration-150 no-underline font-mono text-sm" aria-label="Link to section ${rawText}">#</a>
                <span>${text}</span>
              </${tag}>
            `
          },
        },
      })

      let parsed = markedInstance.parse(post.content) as string
      parsed = processAlertCallouts(parsed)
      parsed = processMarkdownImages(parsed)
      parsed = processMarkdownTables(parsed)
      parsed = processCodeBlocks(parsed)

      return { html: parsed, toc: extractedToc }
    } catch {
      return { html: post.content, toc: [] }
    }
  }, [post.content])

  const copyPublicUrl = () => {
    const url = `${siteUrl}/blog/${post.slug}`
    navigator.clipboard.writeText(url)
    setCopiedLink(true)
    toast.success("Public URL copied!")
    setTimeout(() => setCopiedLink(false), 2000)
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border/80 bg-background text-foreground shadow-md">
      {/* 1. Top Breadcrumbs Bar (Matching Frontend) */}
      <nav
        aria-label="Breadcrumbs"
        className="border-b border-border/60 bg-muted/20 px-4 py-3 sm:px-6"
      >
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
          <span className="cursor-pointer hover:text-foreground">Home</span>
          <span>/</span>
          <span className="cursor-pointer hover:text-foreground">Blog</span>
          <span>/</span>
          <span className="cursor-pointer text-primary hover:underline">
            {categoryName}
          </span>
          <span>/</span>
          <span className="max-w-xs truncate font-semibold text-foreground">
            {post.title}
          </span>
        </div>
      </nav>

      {/* 2. Main Article Body Container */}
      <div className="p-4 sm:p-6 lg:p-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Main Article Reading Column (8 cols lg) */}
          <article className="min-w-0 lg:col-span-8">
            {/* Header: Category & Featured */}
            <header className="border-b border-border/80 pb-8 text-left">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center border border-primary/40 bg-primary/10 px-2.5 py-1 font-mono text-xs font-semibold text-primary uppercase">
                  {categoryName}
                </span>
                {post.featured && (
                  <span className="inline-flex items-center bg-primary px-2.5 py-1 font-mono text-xs font-bold text-primary-foreground uppercase shadow-xs">
                    FEATURED STORY
                  </span>
                )}
              </div>

              {/* Main Article Title */}
              <h1 className="text-3xl leading-[1.15] font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {post.title}
              </h1>

              {/* Subtitle */}
              {post.subtitle && (
                <p className="mt-4 text-base leading-relaxed font-medium text-muted-foreground sm:text-lg">
                  {post.subtitle}
                </p>
              )}

              {/* Author & Reading Metadata Station (Matching Frontend) */}
              <div className="mt-8 border-t border-border/80 pt-6">
                <div className="relative flex flex-col gap-4 border border-border/70 bg-background/50 p-4 backdrop-blur-xs sm:p-5 lg:flex-row lg:items-center lg:justify-between">
                  {/* Cyberpunk corner accents */}
                  <div className="pointer-events-none absolute top-1 left-1 h-2 w-2 border-t border-l border-primary/40" />
                  <div className="pointer-events-none absolute top-1 right-1 h-2 w-2 border-t border-r border-primary/40" />
                  <div className="pointer-events-none absolute bottom-1 left-1 h-2 w-2 border-b border-l border-primary/40" />
                  <div className="pointer-events-none absolute right-1 bottom-1 h-2 w-2 border-r border-b border-primary/40" />

                  {/* Left: Author Profile */}
                  <div className="flex min-w-0 items-center gap-3.5">
                    <div className="relative shrink-0">
                      <img
                        src={authorAvatar}
                        alt={authorName}
                        className="h-11 w-11 rounded-full border-2 border-primary/50 object-cover shadow-xs"
                      />
                      <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-background bg-emerald-500 shadow-xs" />
                    </div>
                    <div className="flex min-w-0 flex-col justify-center">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-mono text-sm font-bold text-foreground">
                          {authorName}
                        </span>
                        <span className="py-0.2 border border-primary/30 bg-primary/10 px-1.5 font-mono text-[9px] font-semibold text-primary uppercase">
                          Author
                        </span>
                      </div>
                      <span className="truncate font-mono text-xs text-muted-foreground">
                        {authorRole}
                      </span>
                    </div>
                  </div>

                  {/* Right: Metrics Badges & Social Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-3 lg:justify-end lg:border-t-0 lg:pt-0">
                    <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs text-muted-foreground">
                      <div className="inline-flex items-center gap-1.5 border border-border/70 bg-muted/20 px-2 py-1">
                        <Calendar className="size-3 text-primary/70" />
                        <span>{publishedDate}</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 border border-border/70 bg-muted/20 px-2 py-1">
                        <Clock className="size-3 text-primary/70" />
                        <span>{post.readTime}</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 border border-border/70 bg-muted/20 px-2 py-1">
                        <ThumbsUp className="size-3 text-rose-500" />
                        <span>{post.likesCount || 0}</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyPublicUrl}
                      className="h-7 gap-1 font-mono text-xs"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="size-3 text-emerald-500" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="size-3" /> Share
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </header>

            {/* 3. Main Cover Artwork */}
            {post.thumbnail && (
              <div className="relative my-8 aspect-[16/9] w-full overflow-hidden border border-border bg-muted/30">
                <img
                  src={post.thumbnail}
                  alt={`Cover illustration for ${post.title}`}
                  className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 font-mono text-xs text-muted-foreground">
                  // COVER IMAGE: {post.title}
                </div>
              </div>
            )}

            {/* 4. Key Takeaways Callout Box */}
            {post.keyTakeaways && post.keyTakeaways.length > 0 && (
              <div className="relative my-8 overflow-hidden border border-primary/30 bg-primary/5 p-6 backdrop-blur-xs">
                {/* Cyberpunk corner accents */}
                <div className="pointer-events-none absolute top-2 left-2 z-10 h-3 w-3 border-t border-l border-primary" />
                <div className="pointer-events-none absolute top-2 right-2 z-10 h-3 w-3 border-t border-r border-primary" />
                <div className="pointer-events-none absolute bottom-2 left-2 z-10 h-3 w-3 border-b border-l border-primary" />
                <div className="pointer-events-none absolute right-2 bottom-2 z-10 h-3 w-3 border-r border-b border-primary" />

                <h3 className="font-mono text-xs font-bold tracking-widest text-primary uppercase">
                  // KEY TAKEAWAYS & ARCHITECTURE HIGHLIGHTS
                </h3>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/90">
                  {post.keyTakeaways.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="mt-0.5 font-bold text-primary">⚡</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 5. Main Markdown Rendered Content */}
            <div
              className="markdown-content max-w-3xl space-y-6 text-base leading-relaxed text-foreground/90"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            {/* 6. Decorative End-of-Article Divider */}
            <div className="my-12 flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              <span className="font-mono text-[10px] tracking-widest text-muted-foreground/50 uppercase">
                END OF ARTICLE
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>

            {/* 7. Article Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-6">
                <span className="font-mono text-xs text-muted-foreground">
                  TAGS:
                </span>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center border border-border bg-muted/60 px-2.5 py-0.5 font-mono text-xs text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* 8. Author Bio Card (Matching Frontend) */}
            <div className="relative mt-8 overflow-hidden border border-border/80 bg-background/80 p-6 backdrop-blur-md sm:p-7">
              {/* Cyberpunk corner brackets */}
              <div className="pointer-events-none absolute top-2 left-2 h-3.5 w-3.5 border-t-[1.5px] border-l-[1.5px] border-primary/40" />
              <div className="pointer-events-none absolute top-2 right-2 h-3.5 w-3.5 border-t-[1.5px] border-r-[1.5px] border-primary/40" />
              <div className="pointer-events-none absolute bottom-2 left-2 h-3.5 w-3.5 border-b-[1.5px] border-l-[1.5px] border-primary/40" />
              <div className="pointer-events-none absolute right-2 bottom-2 h-3.5 w-3.5 border-r-[1.5px] border-b-[1.5px] border-primary/40" />

              <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                <div className="relative shrink-0">
                  <img
                    src={authorAvatar}
                    alt={authorName}
                    className="h-16 w-16 rounded-full border-2 border-primary/50 object-cover shadow-md"
                  />
                  <span className="absolute right-0 bottom-0 h-4 w-4 rounded-full border-2 border-background bg-emerald-500 shadow-xs" />
                </div>

                <div className="space-y-1 text-center sm:text-left">
                  <span className="inline-block font-mono text-[10px] font-semibold tracking-wider text-primary uppercase">
                    [ AUTHOR // LEAD_ARCHITECT ]
                  </span>
                  <h4 className="font-mono text-base leading-tight font-bold text-foreground">
                    {authorName}
                  </h4>
                  <p className="font-mono text-xs leading-none text-muted-foreground">
                    {authorRole}
                  </p>
                  <p className="pt-2 text-xs leading-relaxed text-muted-foreground/90">
                    Full Stack Engineer specializing in TypeScript backend
                    architecture, event-driven microservices with RabbitMQ &
                    Redis, Prisma ORM tuning, and cloud VPS deployments.
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* Right Sidebar Column: Sticky Table of Contents (4 cols lg) */}
          <aside className="h-full min-w-0 lg:col-span-4">
            <div className="sticky top-24 space-y-4 rounded-xl border border-border/80 bg-card/60 p-5 backdrop-blur-xs">
              <div className="flex items-center gap-2 border-b border-border/60 pb-3 font-mono text-xs font-bold tracking-wider text-primary uppercase">
                <Hash className="size-3.5" />
                <span>Table of Contents</span>
              </div>

              {toc.length > 0 ? (
                <ul className="space-y-2 font-mono text-xs">
                  {toc.map((item, index) => (
                    <li
                      key={index}
                      style={{
                        paddingLeft: item.level === 3 ? "0.75rem" : "0",
                      }}
                      className="line-clamp-1"
                    >
                      <a
                        href={`#${item.id}`}
                        className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
                      >
                        <span className="text-primary/40">›</span>
                        <span className="truncate">{item.text}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  Headings (H2, H3) in your markdown content will appear here
                  automatically.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
