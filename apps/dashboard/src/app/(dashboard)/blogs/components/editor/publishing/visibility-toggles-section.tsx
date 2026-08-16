"use client"

import * as React from "react"
import { Sparkles, Pin } from "lucide-react"
import { Switch } from "@workspace/ui/components/switch"

interface VisibilityTogglesSectionProps {
  featured: boolean
  setFeatured: (val: boolean) => void
  pinned: boolean
  setPinned: (val: boolean) => void
}

export function VisibilityTogglesSection({
  featured,
  setFeatured,
  pinned,
  setPinned,
}: VisibilityTogglesSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2">
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-amber-500" /> Featured Article
          </div>
          <div className="text-xs text-muted-foreground">
            Display in the featured stories carousel/grid on the home and blog
            index.
          </div>
        </div>
        <Switch checked={featured} onCheckedChange={setFeatured} />
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Pin className="h-4 w-4 text-primary" /> Pinned Article
          </div>
          <div className="text-xs text-muted-foreground">
            Pin to the top of all blog post listings and archives.
          </div>
        </div>
        <Switch checked={pinned} onCheckedChange={setPinned} />
      </div>
    </div>
  )
}
