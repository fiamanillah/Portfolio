"use client"

import * as React from "react"
import type { CaseStudySeo } from "@workspace/shared"
import { SeoMetaCard } from "./seo/seo-meta-card"
import { SeoSocialCard } from "./seo/seo-social-card"
import { SeoSerpPreview } from "./seo/seo-serp-preview"
import { SeoSocialPreview } from "./seo/seo-social-preview"

interface SeoTabProps {
  title: string
  slug: string
  description: string
  image: string
  seo: CaseStudySeo
  setSeo: (seo: CaseStudySeo) => void
}

export function SeoTab({
  title,
  slug,
  description,
  image,
  seo,
  setSeo,
}: SeoTabProps) {
  const handleUpdate = (field: keyof CaseStudySeo, value: any) => {
    setSeo({ ...seo, [field]: value })
  }

  const displayTitle = seo.metaTitle || title || "Technical Case Study"
  const displayDescription =
    seo.metaDescription ||
    description ||
    "In-depth architectural breakdown and systems engineering metrics."
  const displayImage = seo.ogImage || image || "/assets/images/mickanic-cover.png"

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Left Column: Form Fields */}
      <div className="space-y-6 lg:col-span-7">
        <SeoMetaCard
          title={title}
          slug={slug}
          description={description}
          seo={seo}
          onUpdate={handleUpdate}
        />

        <SeoSocialCard
          title={title}
          description={description}
          image={image}
          seo={seo}
          onUpdate={handleUpdate}
        />
      </div>

      {/* Right Column: Real-time SERP & Social Previews */}
      <div className="space-y-6 lg:col-span-5">
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
    </div>
  )
}
