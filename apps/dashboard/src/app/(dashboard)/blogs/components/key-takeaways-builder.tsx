"use client"

import * as React from "react"
import { Sparkles, Plus, Trash2, CheckCircle2 } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"

interface KeyTakeawaysBuilderProps {
  takeaways: string[]
  onChange: (takeaways: string[]) => void
}

export function KeyTakeawaysBuilder({
  takeaways,
  onChange,
}: KeyTakeawaysBuilderProps) {
  const [newTakeaway, setNewTakeaway] = React.useState("")

  const handleAdd = () => {
    const trimmed = newTakeaway.trim()
    if (!trimmed) return
    onChange([...takeaways, trimmed])
    setNewTakeaway("")
  }

  const handleRemove = (idx: number) => {
    onChange(takeaways.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> Key Takeaways
          (Highlights Box)
        </label>
        <span className="font-mono text-[11px] text-muted-foreground">
          {takeaways.length} highlights
        </span>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Add an architectural takeaway or key lesson..."
          value={newTakeaway}
          onChange={(e) => setNewTakeaway(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              handleAdd()
            }
          }}
          className="text-xs"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          className="shrink-0 text-xs"
        >
          <Plus className="mr-1 h-3.5 w-3.5" /> Add
        </Button>
      </div>

      {takeaways.length > 0 && (
        <div className="space-y-1.5 pt-1">
          {takeaways.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-2 rounded-md border border-border/70 bg-muted/40 p-2 text-xs"
            >
              <div className="flex min-w-0 items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="truncate text-foreground/90">{item}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => handleRemove(idx)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
