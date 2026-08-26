"use client"

import * as React from "react"
import { Search, Sparkles, ExternalLink } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Button } from "@workspace/ui/components/button"
import type { CaseStudySeo } from "@workspace/shared"
import { CaseStudySeoDialog } from "./case-study-seo-dialog"

interface CaseStudySeoSectionProps {
  title: string
  slug: string
  description: string
  image: string
  seo: CaseStudySeo
  setSeo: (seo: CaseStudySeo) => void
  errors?: Record<string, string>
}

export function CaseStudySeoSection({
  title,
  slug,
  description,
  image,
  seo,
  setSeo,
  errors = {},
}: CaseStudySeoSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  const handleUpdate = <K extends keyof CaseStudySeo>(
    field: K,
    value: CaseStudySeo[K]
  ) => {
    setSeo({ ...seo, [field]: value })
  }

  const effectiveTitle = seo.metaTitle || (title ? `${title} | Case Study` : "")
  const effectiveDesc = seo.metaDescription || description

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
          <Search className="h-3.5 w-3.5 text-primary" /> SEO & Social Media
        </span>
      </div>

      {/* Meta Title Input */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-muted-foreground">
            Meta Title
          </label>
          <span
            className={`font-mono text-[10px] ${
              effectiveTitle.length >= 30 && effectiveTitle.length <= 60
                ? "font-semibold text-emerald-500"
                : effectiveTitle.length > 60
                  ? "font-semibold text-rose-500"
                  : "text-muted-foreground"
            }`}
          >
            {effectiveTitle.length}/60
          </span>
        </div>
        <Input
          placeholder={
            title ? `${title} | Case Study` : "Auto-derived from title..."
          }
          value={seo.metaTitle || ""}
          onChange={(e) => handleUpdate("metaTitle", e.target.value)}
          className={`h-8 bg-background text-xs ${
            errors["seo.metaTitle"] || errors.metaTitle
              ? "border-destructive focus:border-destructive"
              : ""
          }`}
        />
      </div>

      {/* Meta Description Input */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-muted-foreground">
            Meta Description
          </label>
          <span
            className={`font-mono text-[10px] ${
              effectiveDesc.length >= 100 && effectiveDesc.length <= 160
                ? "font-semibold text-emerald-500"
                : effectiveDesc.length > 160
                  ? "font-semibold text-rose-500"
                  : "text-muted-foreground"
            }`}
          >
            {effectiveDesc.length}/160
          </span>
        </div>
        <Textarea
          placeholder={
            description || "Auto-derived from case study description..."
          }
          value={seo.metaDescription || ""}
          onChange={(e) => handleUpdate("metaDescription", e.target.value)}
          rows={2}
          className={`bg-background text-xs leading-relaxed ${
            errors["seo.metaDescription"] || errors.metaDescription
              ? "border-destructive focus:border-destructive"
              : ""
          }`}
        />
      </div>

      {/* Button to open full SEO Modal */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsDialogOpen(true)}
        className="h-8 w-full gap-1.5 bg-muted/30 text-xs text-foreground hover:bg-muted/60"
      >
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span>SERP & Social Previews Modal</span>
        <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
      </Button>

      {/* Full Modal */}
      <CaseStudySeoDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={title}
        slug={slug}
        description={description}
        image={image}
        seo={seo}
        setSeo={setSeo}
        errors={errors}
      />
    </div>
  )
}
