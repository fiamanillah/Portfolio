"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import type { FeatureItem } from "@workspace/shared"
import { FeatureCardItem } from "./features/feature-card-item"

interface FeaturesTabProps {
  features: FeatureItem[]
  setFeatures: (features: FeatureItem[]) => void
}

export function FeaturesTab({ features, setFeatures }: FeaturesTabProps) {
  const handleAddFeature = () => {
    setFeatures([
      ...features,
      {
        title: "",
        description: "",
        mediaType: "Image / Video",
        mediaLabel: "",
        media: "",
        tags: [],
        highlights: [],
      },
    ])
  }

  const handleUpdateFeature = (
    index: number,
    field: keyof FeatureItem,
    value: any
  ) => {
    const updated = [...features]
    updated[index] = { ...updated[index], [field]: value }
    setFeatures(updated)
  }

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index))
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-base font-bold">
            Section 03: Key Technical Features ({features.length})
          </CardTitle>
          <CardDescription className="text-xs">
            Deep dive into key features with side-by-side screenshot visuals, tags, and bulleted engineering highlights.
          </CardDescription>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={handleAddFeature}
          className="h-8 gap-1 text-xs"
        >
          <Plus className="size-3.5" /> Add Feature
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {features.map((feature, featureIndex) => (
            <FeatureCardItem
              key={featureIndex}
              feature={feature}
              index={featureIndex}
              onUpdate={(field, val) =>
                handleUpdateFeature(featureIndex, field, val)
              }
              onRemove={() => handleRemoveFeature(featureIndex)}
            />
          ))}
        </div>

        {!features.length && (
          <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-border text-center">
            <p className="text-xs text-muted-foreground">
              No key features added. Click "Add Feature" above.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
