"use client"

import * as React from "react"
import { Sparkles, Link as LinkIcon } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"

interface TitleSlugSectionProps {
  title: string
  setTitle: (val: string) => void
  subtitle: string
  setSubtitle: (val: string) => void
  slug: string
  setSlug: (val: string) => void
  summary: string
  setSummary: (val: string) => void
}

export function TitleSlugSection({
  title,
  setTitle,
  subtitle,
  setSubtitle,
  slug,
  setSlug,
  summary,
  setSummary,
}: TitleSlugSectionProps) {
  const generateSlug = () => {
    if (!title.trim()) {
      toast.error("Please enter an article title first")
      return
    }
    const autoSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
    setSlug(autoSlug)
    toast.success("Slug generated from title")
  }

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
            Article Title *
          </label>
          <span className="font-mono text-[11px] text-muted-foreground">
            {title.length} characters
          </span>
        </div>
        <Input
          placeholder="e.g. Building High-Concurrency WebSocket Gateways in TypeScript"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-11 border-border/90 bg-background text-base font-bold shadow-xs hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20 sm:text-lg"
          required
        />
      </div>

      {/* Subtitle */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
          Subtitle / Lead Hook (Optional)
        </label>
        <Input
          placeholder="e.g. Architectural breakdown of distributed event buses and horizontal scaling"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="h-9 border-border/90 bg-background text-sm shadow-xs hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20"
        />
      </div>

      {/* URL Slug */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
            <LinkIcon className="h-3.5 w-3.5 text-primary" /> URL Slug *
          </label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={generateSlug}
            className="h-6 gap-1 px-2 font-mono text-[11px] text-primary hover:bg-primary/10 hover:text-primary"
          >
            <Sparkles className="h-3 w-3" /> Auto-generate
          </Button>
        </div>
        <div className="flex items-center rounded-lg border border-border/90 bg-background px-3 py-1 shadow-xs focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 hover:border-primary/50">
          <span className="font-mono text-xs text-muted-foreground/70 select-none">
            fi.amanillah.com/blog/
          </span>
          <input
            placeholder="building-high-concurrency-websocket-gateways"
            value={slug}
            onChange={(e) =>
              setSlug(
                e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9-]/g, "")
                  .replace(/--+/g, "-")
              )
            }
            className="flex-1 border-0 bg-transparent px-1 py-1 font-mono text-xs text-foreground outline-none"
          />
        </div>
      </div>

      {/* Summary Excerpt */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
            Summary Excerpt *
          </label>
          <span
            className={`font-mono text-[11px] ${
              summary.length > 200
                ? "font-semibold text-amber-500"
                : "text-muted-foreground"
            }`}
          >
            {summary.length}/200 chars
          </span>
        </div>
        <Textarea
          placeholder="Brief 2-3 sentence overview shown on blog index cards, feed items, and social previews..."
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={3}
          className="border-border/90 bg-background text-xs leading-relaxed shadow-xs hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20"
          required
        />
      </div>
    </div>
  )
}
