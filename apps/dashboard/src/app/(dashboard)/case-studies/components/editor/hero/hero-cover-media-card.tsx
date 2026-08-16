"use client"

import * as React from "react"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { MediaImagePicker } from "../common/media-image-picker"

interface HeroCoverMediaCardProps {
  image: string
  setImage: (image: string) => void
  imageLabel: string
  setImageLabel: (label: string) => void
}

const COVER_PRESETS = [
  { label: "Mickanic Cover", url: "/assets/images/mickanic-cover.png" },
  { label: "Moja Cares Cover", url: "/assets/images/moja-cares-cover.png" },
]

export function HeroCoverMediaCard({
  image,
  setImage,
  imageLabel,
  setImageLabel,
}: HeroCoverMediaCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-bold">
          Hero Cover Artwork
        </CardTitle>
        <CardDescription className="text-xs">
          Primary project artwork featured on cards, hero breakdown, and social previews.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <MediaImagePicker
          label="Showcase Cover Image"
          description="High-resolution architecture diagram or application interface (16:9 ratio recommended)."
          value={image}
          onChange={setImage}
          folder="case-studies/covers"
          source="CASE_STUDY_COVER"
          aspectRatio="video"
          presets={COVER_PRESETS}
          required={true}
        />

        <div className="space-y-2 pt-2 border-t border-border/60">
          <Label htmlFor="cs-image-label" className="text-xs">
            Artwork Label Caption
          </Label>
          <Input
            id="cs-image-label"
            placeholder="e.g. Mickanic_Architecture_Overview.png"
            value={imageLabel}
            onChange={(e) => setImageLabel(e.target.value)}
            className="text-xs font-mono"
          />
          <p className="text-[10px] text-muted-foreground">
            Rendered as a subtle monospace caption below the hero thumbnail.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
