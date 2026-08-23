"use client"

import * as React from "react"
import { Plus, Trash2, CheckCircle2, ListChecks } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"

interface HeroHighlightsCardProps {
  highlights: string[]
  setHighlights: (highlights: string[]) => void
}

export function HeroHighlightsCard({
  highlights,
  setHighlights,
}: HeroHighlightsCardProps) {
  const [newHighlight, setNewHighlight] = React.useState("")

  const handleAdd = () => {
    const trimmed = newHighlight.trim()
    if (!trimmed) return
    setHighlights([...highlights, trimmed])
    setNewHighlight("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAdd()
    }
  }

  const handleRemove = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index))
  }

  const handleUpdate = (index: number, value: string) => {
    const updated = [...highlights]
    updated[index] = value
    setHighlights(updated)
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <ListChecks className="size-4 text-primary" /> Key Highlights & Takeaways
            </CardTitle>
            <CardDescription className="text-xs">
              Bullet points displayed on the project card (ideal for quick projects & boilerplates).
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-mono text-[10px]">
            {highlights.length} Highlights
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Input
            placeholder="e.g. Rate-limited SMTP dispatching with Redis token buckets..."
            value={newHighlight}
            onChange={(e) => setNewHighlight(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-xs"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAdd}
            disabled={!newHighlight.trim()}
            className="shrink-0 gap-1 text-xs"
          >
            <Plus className="size-3.5" /> Add
          </Button>
        </div>

        {highlights.length > 0 ? (
          <div className="space-y-2 pt-1">
            {highlights.map((highlight, idx) => (
              <div
                key={idx}
                className="group flex items-center gap-2 rounded-lg border border-border/70 bg-background/60 p-2 transition-all hover:border-primary/40"
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 className="size-3.5" />
                </div>
                <Input
                  value={highlight}
                  onChange={(e) => handleUpdate(idx, e.target.value)}
                  className="h-7 border-none bg-transparent px-1 text-xs focus-visible:ring-0"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(idx)}
                  className="size-6 shrink-0 text-muted-foreground opacity-60 transition-opacity group-hover:opacity-100 hover:text-destructive"
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border/80 p-3 text-center">
            <p className="font-mono text-[11px] text-muted-foreground">
              No key highlights added yet. Add 2–3 concise bullets to make this project card stand out.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
