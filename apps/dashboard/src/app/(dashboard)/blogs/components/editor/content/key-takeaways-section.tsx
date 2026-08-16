"use client"

import * as React from "react"
import { Sparkles, Plus, Trash2, GripVertical } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"

interface KeyTakeawaysSectionProps {
  keyTakeaways: string[]
  setKeyTakeaways: React.Dispatch<React.SetStateAction<string[]>>
}

export function KeyTakeawaysSection({
  keyTakeaways,
  setKeyTakeaways,
}: KeyTakeawaysSectionProps) {
  const [newTakeaway, setNewTakeaway] = React.useState("")

  const handleAdd = () => {
    if (!newTakeaway.trim()) return
    setKeyTakeaways([...keyTakeaways, newTakeaway.trim()])
    setNewTakeaway("")
  }

  const handleUpdate = (index: number, val: string) => {
    const updated = [...keyTakeaways]
    updated[index] = val
    setKeyTakeaways(updated)
  }

  const handleDelete = (index: number) => {
    setKeyTakeaways(keyTakeaways.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3 border-t border-border/80 pt-4">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> Key Takeaways &
          Architecture Highlights
        </label>
        <span className="font-mono text-[11px] text-muted-foreground">
          {keyTakeaways.length} bullets
        </span>
      </div>

      <div className="space-y-2">
        {keyTakeaways.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="w-4 shrink-0 text-center font-mono text-xs font-bold text-primary">
              ⚡
            </span>
            <Input
              value={item}
              onChange={(e) => handleUpdate(index, e.target.value)}
              className="h-9 border-border/90 bg-background text-xs shadow-xs hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20"
              placeholder="Key architectural takeaway..."
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(index)}
              className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {/* Add new takeaway input */}
        <div className="flex items-center gap-2">
          <Input
            placeholder="Add key takeaway (e.g. Redis pub/sub reduces gateway latency by 85%)..."
            value={newTakeaway}
            onChange={(e) => setNewTakeaway(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleAdd()
              }
            }}
            className="h-9 border-border/90 bg-background text-xs shadow-xs hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAdd}
            disabled={!newTakeaway.trim()}
            className="h-9 shrink-0 gap-1 px-3 text-xs"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>
      </div>
    </div>
  )
}
