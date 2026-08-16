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
    <div className="space-y-3 pt-4 border-t border-border/80">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> Key Takeaways & Architecture Highlights
        </label>
        <span className="text-[11px] font-mono text-muted-foreground">
          {keyTakeaways.length} bullets
        </span>
      </div>

      <div className="space-y-2">
        {keyTakeaways.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-primary font-mono text-xs font-bold w-4 text-center shrink-0">
              ⚡
            </span>
            <Input
              value={item}
              onChange={(e) => handleUpdate(index, e.target.value)}
              className="text-xs h-9 bg-background border-border/90 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-xs"
              placeholder="Key architectural takeaway..."
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(index)}
              className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0"
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
            className="text-xs h-9 bg-background border-border/90 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-xs"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAdd}
            disabled={!newTakeaway.trim()}
            className="h-9 px-3 text-xs gap-1 shrink-0"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>
      </div>
    </div>
  )
}
