"use client"

import * as React from "react"
import { Marked } from "marked"

interface MarkdownPreviewProps {
  content: string
  className?: string
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

export function MarkdownPreview({
  content,
  className = "",
}: MarkdownPreviewProps) {
  const renderedHtml = React.useMemo(() => {
    if (!content.trim()) return ""
    try {
      const markedInstance = new Marked({
        gfm: true,
        breaks: true,
      })
      let html = markedInstance.parse(content) as string
      html = processAlertCallouts(html)
      html = processMarkdownImages(html)
      html = processMarkdownTables(html)
      html = processCodeBlocks(html)
      return html
    } catch {
      return `<p class="text-destructive">Failed to parse markdown.</p>`
    }
  }, [content])

  if (!content.trim()) {
    return (
      <div
        className={`rounded-xl border border-dashed border-border bg-muted/10 p-8 text-center text-xs text-muted-foreground italic ${className}`}
      >
        No article content written yet. Switch to Write mode or type in the
        editor...
      </div>
    )
  }

  return (
    <div
      className={`markdown-content max-h-[700px] overflow-y-auto rounded-xl border border-border/80 bg-background p-6 text-base leading-relaxed shadow-xs md:p-8 ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  )
}
