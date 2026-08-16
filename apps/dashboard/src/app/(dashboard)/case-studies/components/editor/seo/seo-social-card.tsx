"use client"

import * as React from "react"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Label } from "@workspace/ui/components/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import type { CaseStudySeo } from "@workspace/shared"
import { MediaImagePicker } from "../common/media-image-picker"

interface SeoSocialCardProps {
  title: string
  description: string
  image: string
  seo: CaseStudySeo
  onUpdate: (field: keyof CaseStudySeo, value: any) => void
}

export function SeoSocialCard({
  title,
  description,
  image,
  seo,
  onUpdate,
}: SeoSocialCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-bold">
          Social Media & OpenGraph
        </CardTitle>
        <CardDescription className="text-xs">
          Social share preview card metadata for Twitter, LinkedIn, and Discord.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="seo-og-title" className="text-xs">Social Share Title</Label>
          <Input
            id="seo-og-title"
            placeholder={title || "Social Title"}
            value={seo.ogTitle || ""}
            onChange={(e) => onUpdate("ogTitle", e.target.value)}
            className="text-xs h-8"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="seo-og-desc" className="text-xs">Social Share Description</Label>
          <Textarea
            id="seo-og-desc"
            placeholder={description || "Social Description..."}
            rows={2}
            value={seo.ogDescription || ""}
            onChange={(e) => onUpdate("ogDescription", e.target.value)}
            className="text-xs leading-relaxed"
          />
        </div>

        <div className="pt-2 border-t border-border/40">
          <MediaImagePicker
            label="OpenGraph Share Image"
            description="Custom 1200x630 social share card banner."
            value={seo.ogImage || image}
            onChange={(url) => onUpdate("ogImage", url)}
            folder="case-studies/seo"
            source="CASE_STUDY_SEO"
            aspectRatio="wide"
          />
        </div>
      </CardContent>
    </Card>
  )
}
