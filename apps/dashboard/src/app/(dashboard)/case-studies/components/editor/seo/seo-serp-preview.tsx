"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"

interface SeoSerpPreviewProps {
  title: string
  slug: string
  description: string
}

export function SeoSerpPreview({
  title,
  slug,
  description,
}: SeoSerpPreviewProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-1.5">
          <Search className="size-4 text-primary" /> Google Search SERP Snippet
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border/80 bg-background p-4 space-y-1 font-sans">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">fi.amanillah.com</span>
            <span>› case-study › {slug || "slug"}</span>
          </div>
          <h4 className="text-base font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer line-clamp-1">
            {title || "Technical Case Study"}
          </h4>
          <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
            {description || "Architectural case study breakdown and systems engineering metrics."}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
