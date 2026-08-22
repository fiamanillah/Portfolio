"use client"

import * as React from "react"
import { Sparkles } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Label } from "@workspace/ui/components/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { FieldError } from "@workspace/ui/components/field"

interface HeroBasicInfoCardProps {
  title: string
  setTitle: (title: string) => void
  subtitle: string
  setSubtitle: (subtitle: string) => void
  slug: string
  setSlug: (slug: string) => void
  description: string
  setDescription: (desc: string) => void
  impact: string
  setImpact: (impact: string) => void
  errors?: Record<string, string>
}

export function HeroBasicInfoCard({
  title,
  setTitle,
  subtitle,
  setSubtitle,
  slug,
  setSlug,
  description,
  setDescription,
  impact,
  setImpact,
  errors = {},
}: HeroBasicInfoCardProps) {
  const handleGenerateSlug = () => {
    if (!title) return
    const generated = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
    setSlug(generated)
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-bold">
          Overview & Narrative
        </CardTitle>
        <CardDescription className="text-xs">
          Headline, URL slug, and architectural elevator pitch for this case study.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cs-title">Title *</Label>
          <Input
            id="cs-title"
            placeholder="e.g. Mickanic — Real-Time Bidding & Service Marketplace"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => {
              if (!slug) handleGenerateSlug()
            }}
            className={`font-medium text-sm ${
              errors.title ? "border-destructive focus:border-destructive" : ""
            }`}
          />
          {errors.title && <FieldError errors={errors.title} />}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="cs-slug">URL Slug *</Label>
              <button
                type="button"
                onClick={handleGenerateSlug}
                className="font-mono text-[11px] text-primary hover:underline flex items-center gap-1"
              >
                <Sparkles className="size-2.5" /> Auto-generate
              </button>
            </div>
            <Input
              id="cs-slug"
              placeholder="e.g. mickanic"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className={`font-mono text-xs ${
                errors.slug ? "border-destructive focus:border-destructive" : ""
              }`}
            />
            {errors.slug && <FieldError errors={errors.slug} />}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cs-subtitle">Subtitle</Label>
            <Input
              id="cs-subtitle"
              placeholder="e.g. Real-Time Bidding & Service Platform"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cs-description">Summary Description *</Label>
          <Textarea
            id="cs-description"
            placeholder="Write a comprehensive architectural summary of this case study..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`text-sm leading-relaxed ${
              errors.description
                ? "border-destructive focus:border-destructive"
                : ""
            }`}
          />
          {errors.description && <FieldError errors={errors.description} />}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cs-impact">Impact & Engineering Highlights</Label>
          <Textarea
            id="cs-impact"
            placeholder="Key business metrics, latency improvements, and architectural achievements..."
            rows={2}
            value={impact}
            onChange={(e) => setImpact(e.target.value)}
            className="text-sm leading-relaxed"
          />
        </div>
      </CardContent>
    </Card>
  )
}
