"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import type { ArchitectureLayer, ArchitectureItem } from "@workspace/shared"
import { ArchitecturePresetsBar } from "./architecture/architecture-presets-bar"
import { ArchitectureLayerCard } from "./architecture/architecture-layer-card"

interface ArchitectureTabProps {
  architectureLayers: ArchitectureLayer[]
  setArchitectureLayers: (layers: ArchitectureLayer[]) => void
}

export function ArchitectureTab({
  architectureLayers,
  setArchitectureLayers,
}: ArchitectureTabProps) {
  const handleAddLayer = (preset?: ArchitectureLayer) => {
    setArchitectureLayers([
      ...architectureLayers,
      preset || {
        name: "New System Layer",
        description: "Layer description outlining component responsibilities.",
        items: [
          { title: "Service Name", subtitle: "Responsibilities & framework" },
        ],
      },
    ])
  }

  const handleUpdateLayer = (
    index: number,
    field: "name" | "description",
    value: string
  ) => {
    const updated = [...architectureLayers]
    updated[index] = { ...updated[index], [field]: value }
    setArchitectureLayers(updated)
  }

  const handleRemoveLayer = (index: number) => {
    setArchitectureLayers(architectureLayers.filter((_, i) => i !== index))
  }

  const handleAddItemToLayer = (layerIndex: number) => {
    const updated = [...architectureLayers]
    updated[layerIndex].items = [
      ...(updated[layerIndex].items || []),
      { title: "Component Title", subtitle: "Tech / Role" },
    ]
    setArchitectureLayers(updated)
  }

  const handleUpdateLayerItem = (
    layerIndex: number,
    itemIndex: number,
    field: "title" | "subtitle",
    value: string
  ) => {
    const updated = [...architectureLayers]
    const items = [...(updated[layerIndex].items || [])]
    items[itemIndex] = { ...items[itemIndex], [field]: value }
    updated[layerIndex].items = items
    setArchitectureLayers(updated)
  }

  const handleRemoveLayerItem = (layerIndex: number, itemIndex: number) => {
    const updated = [...architectureLayers]
    updated[layerIndex].items = updated[layerIndex].items.filter(
      (_, i) => i !== itemIndex
    )
    setArchitectureLayers(updated)
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-base font-bold">
            Section 02: Architecture Topology & Infrastructure ({architectureLayers.length})
          </CardTitle>
          <CardDescription className="text-xs">
            Deconstruct your system architecture into 4 distinct tier layers (Client / UI, API & Compute, Data Layer, Infra / Delivery).
          </CardDescription>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => handleAddLayer()}
          className="h-8 gap-1 text-xs"
        >
          <Plus className="size-3.5" /> Add Layer
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <ArchitecturePresetsBar onAddLayer={handleAddLayer} />

        <div className="space-y-4">
          {architectureLayers.map((layer, layerIndex) => (
            <ArchitectureLayerCard
              key={layerIndex}
              layer={layer}
              index={layerIndex}
              onUpdateLayer={(field, val) =>
                handleUpdateLayer(layerIndex, field, val)
              }
              onRemoveLayer={() => handleRemoveLayer(layerIndex)}
              onAddItem={() => handleAddItemToLayer(layerIndex)}
              onUpdateItem={(itemIdx, field, val) =>
                handleUpdateLayerItem(layerIndex, itemIdx, field, val)
              }
              onRemoveItem={(itemIdx) =>
                handleRemoveLayerItem(layerIndex, itemIdx)
              }
            />
          ))}
        </div>

        {!architectureLayers.length && (
          <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-border text-center">
            <p className="text-xs text-muted-foreground">
              No architecture layers added. Click "Add Layer" or use quick presets above.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
