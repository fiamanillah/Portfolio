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
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Article Title *
          </label>
          <span className="text-[11px] font-mono text-muted-foreground">
            {title.length} characters
          </span>
        </div>
        <Input
          placeholder="e.g. Building High-Concurrency WebSocket Gateways in TypeScript"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-base sm:text-lg font-bold h-11 bg-background border-border/90 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-xs"
          required
        />
      </div>

      {/* Subtitle */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Subtitle / Lead Hook (Optional)
        </label>
        <Input
          placeholder="e.g. Architectural breakdown of distributed event buses and horizontal scaling"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="text-sm h-9 bg-background border-border/90 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-xs"
        />
      </div>

      {/* URL Slug */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <LinkIcon className="h-3.5 w-3.5 text-primary" /> URL Slug *
          </label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={generateSlug}
            className="h-6 text-[11px] px-2 text-primary hover:text-primary hover:bg-primary/10 gap-1 font-mono"
          >
            <Sparkles className="h-3 w-3" /> Auto-generate
          </Button>
        </div>
        <div className="flex items-center rounded-lg border border-border/90 bg-background hover:border-primary/50 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 shadow-xs px-3 py-1">
          <span className="text-xs text-muted-foreground/70 font-mono select-none">
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
            className="flex-1 bg-transparent border-0 outline-none text-xs font-mono text-foreground px-1 py-1"
          />
        </div>
      </div>

      {/* Summary Excerpt */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Summary Excerpt *
          </label>
          <span
            className={`text-[11px] font-mono ${
              summary.length > 200 ? "text-amber-500 font-semibold" : "text-muted-foreground"
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
          className="text-xs leading-relaxed bg-background border-border/90 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-xs"
          required
        />
      </div>
    </div>
  )
}
