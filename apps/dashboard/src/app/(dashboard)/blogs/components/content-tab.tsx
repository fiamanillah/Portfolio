"use client"

import * as React from "react"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import type { BlogCategoryDTO } from "@workspace/shared"
import { MarkdownEditor } from "./markdown-editor"
import { KeyTakeawaysBuilder } from "./key-takeaways-builder"

interface ContentTabProps {
  title: string
  setTitle: (val: string) => void
  subtitle: string
  setSubtitle: (val: string) => void
  slug: string
  setSlug: (val: string) => void
  summary: string
  setSummary: (val: string) => void
  content: string
  setContent: (val: string) => void
  categoryId: string
  setCategoryId: (val: string) => void
  categoryName: string
  setCategoryName: (val: string) => void
  categories: BlogCategoryDTO[]
  keyTakeaways: string[]
  setKeyTakeaways: (val: string[]) => void
  selectedTags: string[]
  setSelectedTags: (val: string[]) => void
  wordCount: number
  readTime: string
}

export function ContentTab({
  title,
  setTitle,
  subtitle,
  setSubtitle,
  slug,
  setSlug,
  summary,
  setSummary,
  content,
  setContent,
  categoryId,
  setCategoryId,
  categoryName,
  setCategoryName,
  categories,
  keyTakeaways,
  setKeyTakeaways,
  selectedTags,
  setSelectedTags,
  wordCount,
  readTime,
}: ContentTabProps) {
  const [tagInput, setTagInput] = React.useState("")

  const generateSlug = () => {
    if (!title) return
    const generated = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
    setSlug(generated)
  }

  const handleAddTag = () => {
    const trimmed = tagInput.trim()
    if (!trimmed) return
    if (!selectedTags.includes(trimmed)) {
      setSelectedTags([...selectedTags, trimmed])
    }
    setTagInput("")
  }

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag))
  }

  return (
    <div className="space-y-6">
      {/* Title & Subtitle */}
      <div className="space-y-3.5">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Article Title *
          </label>
          <Input
            placeholder="e.g. Scaling Distributed Message Queues with Redis Streams & Bun"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-base font-semibold bg-card"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Subtitle / Lead Sentence
          </label>
          <Input
            placeholder="e.g. A production engineering guide to rolling deployments, concurrency, and memory optimization."
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="bg-card text-xs"
          />
        </div>
      </div>

      {/* Slug & Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              URL Slug *
            </label>
            <button
              type="button"
              onClick={generateSlug}
              className="text-[11px] text-primary hover:underline font-medium"
            >
              Generate from Title
            </button>
          </div>
          <Input
            placeholder="e.g. scaling-distributed-message-queues-redis-bun"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="font-mono text-xs bg-card"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Primary Category
          </label>
          <Select
            value={categoryId}
            onValueChange={(val) => {
              setCategoryId(val)
              const found = categories.find((c) => c.id === val)
              if (found) setCategoryName(found.name)
            }}
          >
            <SelectTrigger className="bg-card text-xs">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Uncategorized</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary / Excerpt */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Summary / Excerpt (Used on card feeds & meta tags) *
          </label>
          <span
            className={`text-[11px] font-mono ${
              summary.length > 160 ? "text-amber-500" : "text-muted-foreground"
            }`}
          >
            {summary.length} / 160 chars
          </span>
        </div>
        <Textarea
          placeholder="2-3 concise sentences summarizing the technical problem, solution, and architectural impact..."
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={3}
          className="bg-card text-xs leading-relaxed"
          required
        />
      </div>

      {/* Markdown Content Editor */}
      <MarkdownEditor
        value={content}
        onChange={setContent}
        wordCount={wordCount}
        readTime={readTime}
      />

      {/* Key Takeaways Highlights Builder */}
      <div className="p-4 rounded-xl border border-border/80 bg-muted/20">
        <KeyTakeawaysBuilder
          takeaways={keyTakeaways}
          onChange={setKeyTakeaways}
        />
      </div>

      {/* Tags Multi-Chip Input */}
      <div className="space-y-2 pt-2 border-t border-border">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Tags & Taxonomy
        </label>
        <div className="flex gap-2">
          <Input
            placeholder="Add tag and press enter (e.g. WebSockets, Redis, Microservices)..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault()
                handleAddTag()
              }
            }}
            className="text-xs bg-card"
          />
          <Button type="button" variant="outline" size="sm" onClick={handleAddTag} className="text-xs">
            Add Tag
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs flex items-center gap-1">
              #{tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-destructive font-bold ml-1"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}
