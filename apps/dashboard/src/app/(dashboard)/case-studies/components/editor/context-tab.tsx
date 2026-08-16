"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import type { ContextBlock } from "@workspace/shared"
import { ContextPresetsBar } from "./context/context-presets-bar"
import { ContextBlockCard } from "./context/context-block-card"

interface ContextTabProps {
  contextBlocks: ContextBlock[]
  setContextBlocks: (blocks: ContextBlock[]) => void
}

export function ContextTab({
  contextBlocks,
  setContextBlocks,
}: ContextTabProps) {
  const handleAddBlock = (preset?: ContextBlock) => {
    setContextBlocks([
      ...contextBlocks,
      preset || {
        label: "The Solution",
        body: "Describe how you engineered and delivered the solution...",
      },
    ])
  }

  const handleUpdateBlock = (
    index: number,
    field: keyof ContextBlock,
    value: string
  ) => {
    const updated = [...contextBlocks]
    updated[index] = { ...updated[index], [field]: value }
    setContextBlocks(updated)
  }

  const handleRemoveBlock = (index: number) => {
    setContextBlocks(contextBlocks.filter((_, i) => i !== index))
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-base font-bold">
            Section 01: Context & Problem Space ({contextBlocks.length})
          </CardTitle>
          <CardDescription className="text-xs">
            Articulate the core problem space, domain friction, and your engineered solution.
          </CardDescription>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => handleAddBlock()}
          className="h-8 gap-1 text-xs"
        >
          <Plus className="size-3.5" /> Add Block
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <ContextPresetsBar onAddBlock={handleAddBlock} />

        <div className="grid gap-4 sm:grid-cols-2">
          {contextBlocks.map((block, index) => (
            <ContextBlockCard
              key={index}
              block={block}
              index={index}
              onUpdate={(field, val) => handleUpdateBlock(index, field, val)}
              onRemove={() => handleRemoveBlock(index)}
            />
          ))}
        </div>

        {!contextBlocks.length && (
          <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-border text-center">
            <p className="text-xs text-muted-foreground">
              No context blocks added. Click "Add Block" or use quick presets above.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
