"use client"

import * as React from "react"
import { Search, Globe, Share2, Shield } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import type { CaseStudySeo } from "@workspace/shared"
import { SeoMetaCard } from "./seo-meta-card"
import { SeoSocialCard } from "./seo-social-card"
import { SeoSerpPreview } from "./seo-serp-preview"
import { SeoSocialPreview } from "./seo-social-preview"

interface CaseStudySeoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  slug: string
  description: string
  image: string
  seo: CaseStudySeo
  setSeo: (seo: CaseStudySeo) => void
  errors?: Record<string, string>
}

export function CaseStudySeoDialog({
  open,
  onOpenChange,
  title,
  slug,
  description,
  image,
  seo,
  setSeo,
  errors = {},
}: CaseStudySeoDialogProps) {
  const handleUpdate = <K extends keyof CaseStudySeo>(
    field: K,
    value: CaseStudySeo[K]
  ) => {
    setSeo({ ...seo, [field]: value })
  }

  const displayTitle = seo.metaTitle || title || "Technical Case Study"
  const displayDescription =
    seo.metaDescription ||
    description ||
    "In-depth architectural breakdown and systems engineering metrics."
  const displayImage =
    seo.ogImage || image || "/assets/images/mickanic-cover.png"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-4xl overflow-y-auto border border-border/80 bg-card p-6 shadow-2xl sm:min-w-[700px] md:min-w-[800px]">
        <DialogHeader>
          <div className="space-y-0.5">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Search className="h-5 w-5 text-primary" />
              Case Study SEO & Social Media Studio
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure Google SERP snippet simulation, OpenGraph cards,
              Twitter/X cards, and search keywords.
            </DialogDescription>
          </div>
        </DialogHeader>

        <Tabs defaultValue="previews" className="mt-2">
          <TabsList className="grid w-full grid-cols-2 border border-border bg-muted/60 p-1">
            <TabsTrigger
              value="previews"
              className="flex items-center gap-2 text-xs font-semibold"
            >
              <Globe className="h-3.5 w-3.5" />
              SERP & Social Previews
            </TabsTrigger>
            <TabsTrigger
              value="tags"
              className="flex items-center gap-2 text-xs font-semibold"
            >
              <Shield className="h-3.5 w-3.5" />
              Meta Tags & OpenGraph
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: PREVIEWS */}
          <TabsContent value="previews" className="space-y-4 pt-3">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <SeoSerpPreview
                title={displayTitle}
                slug={slug}
                description={displayDescription}
              />
              <SeoSocialPreview
                title={seo.ogTitle || displayTitle}
                description={seo.ogDescription || displayDescription}
                image={displayImage}
              />
            </div>
          </TabsContent>

          {/* TAB 2: META TAGS & OPENGRAPH */}
          <TabsContent value="tags" className="space-y-4 pt-3">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <SeoMetaCard
                title={title}
                slug={slug}
                description={description}
                seo={seo}
                onUpdate={handleUpdate}
                errors={errors}
              />
              <SeoSocialCard
                title={title}
                description={description}
                image={image}
                seo={seo}
                onUpdate={handleUpdate}
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
