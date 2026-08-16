"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import type { CaseStudyMetadataItem } from "@workspace/shared"
import { MetadataPresetsBar } from "./metadata/metadata-presets-bar"
import { MetadataItemRow } from "./metadata/metadata-item-row"

interface MetadataTabProps {
  metadata: CaseStudyMetadataItem[]
  setMetadata: (meta: CaseStudyMetadataItem[]) => void
}

export function MetadataTab({ metadata, setMetadata }: MetadataTabProps) {
  const handleAddItem = (preset?: CaseStudyMetadataItem) => {
    setMetadata([
      ...metadata,
      preset || {
        label: "Domain",
        value: "Automotive Marketplace / B2B",
      },
    ])
  }

  const handleUpdateItem = (
    index: number,
    field: keyof CaseStudyMetadataItem,
    value: string
  ) => {
    const updated = [...metadata]
    updated[index] = { ...updated[index], [field]: value }
    setMetadata(updated)
  }

  const handleRemoveItem = (index: number) => {
    setMetadata(metadata.filter((_, i) => i !== index))
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-base font-bold">
            Project Metadata Grid ({metadata.length})
          </CardTitle>
          <CardDescription className="text-xs">
            4-column metadata grid rendered in the case study hero footer (Role, Timeline, Client, Stack, etc.).
          </CardDescription>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => handleAddItem()}
          className="h-8 gap-1 text-xs"
        >
          <Plus className="size-3.5" /> Add Item
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <MetadataPresetsBar onAddPreset={handleAddItem} />

        {metadata.map((item, index) => (
          <MetadataItemRow
            key={index}
            item={item}
            index={index}
            onUpdate={(field, val) => handleUpdateItem(index, field, val)}
            onRemove={() => handleRemoveItem(index)}
          />
        ))}

        {!metadata.length && (
          <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-border text-center">
            <p className="text-xs text-muted-foreground">
              No metadata items defined. Click "Add Item" or use quick presets above.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
