"use client"

import * as React from "react"
import { Share2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"

interface SeoSocialPreviewProps {
  title: string
  description: string
  image: string
}

export function SeoSocialPreview({
  title,
  description,
  image,
}: SeoSocialPreviewProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-1.5">
          <Share2 className="size-4 text-primary" /> Social Card Preview (Twitter / LinkedIn)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
          <div className="aspect-video w-full overflow-hidden bg-muted/40 flex items-center justify-center">
            {image ? (
              <img
                src={image}
                alt="Social Card"
                className="h-full w-full object-cover"
                onError={(e) => {
                  ;(e.target as HTMLElement).style.display = "none"
                }}
              />
            ) : (
              <span className="text-xs text-muted-foreground">No image preview</span>
            )}
          </div>
          <div className="p-3.5 space-y-1 bg-muted/20 border-t border-border/40">
            <span className="font-mono text-[10px] text-muted-foreground uppercase">
              fi.amanillah.com
            </span>
            <h5 className="text-sm font-bold text-foreground line-clamp-1">
              {title || "Social Card Title"}
            </h5>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {description || "Social share card description preview."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
