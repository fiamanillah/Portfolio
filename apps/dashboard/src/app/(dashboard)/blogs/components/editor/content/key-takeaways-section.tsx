"use client"

import * as React from "react"
import { Sparkles, Plus, Trash2 } from "lucide-react"
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
    <div className="space-y-2.5 pt-1">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> Key Takeaways & Architecture Highlights
        </label>
        <span className="font-mono text-[10px] text-muted-foreground">
          {keyTakeaways.length} bullets
        </span>
      </div>

      <div className="space-y-1.5">
        {keyTakeaways.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="w-4 shrink-0 text-center font-mono text-xs font-bold text-primary">
              ⚡
            </span>
            <Input
              value={item}
              onChange={(e) => handleUpdate(index, e.target.value)}
              className="h-8 border-border/80 bg-background text-xs"
              placeholder="Key architectural takeaway..."
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(index)}
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}

        {/* Add new takeaway input */}
        <div className="flex items-center gap-1.5">
          <Input
            placeholder="Add key takeaway (e.g. Redis pub/sub reduces latency by 85%)..."
            value={newTakeaway}
            onChange={(e) => setNewTakeaway(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleAdd()
              }
            }}
            className="h-8 border-border/80 bg-background text-xs"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAdd}
            disabled={!newTakeaway.trim()}
            className="h-8 shrink-0 gap-1 px-2.5 text-xs"
          >
            <Plus className="h-3 w-3" /> Add
          </Button>
        </div>
      </div>
    </div>
  )
}
