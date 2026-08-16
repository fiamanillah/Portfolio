"use client"

import * as React from "react"
import { Input } from "@workspace/ui/components/input"
import { ImageIcon } from "lucide-react"

interface MediaTabProps {
  thumbnail: string
  setThumbnail: (val: string) => void
  ogImage: string
  setOgImage: (val: string) => void
  twitterImage: string
  setTwitterImage: (val: string) => void
}

export function MediaTab({
  thumbnail,
  setThumbnail,
  ogImage,
  setOgImage,
  twitterImage,
  setTwitterImage,
}: MediaTabProps) {
  return (
    <div className="space-y-6">
      {/* Cover / Thumbnail */}
      <div className="space-y-2.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <ImageIcon className="h-3.5 w-3.5 text-primary" /> Primary Cover / Thumbnail Image URL
        </label>
        <Input
          placeholder="/assets/images/mickanic-cover.png or https://..."
          value={thumbnail}
          onChange={(e) => setThumbnail(e.target.value)}
          className="bg-card text-xs"
        />
        {thumbnail ? (
          <div className="rounded-xl overflow-hidden border border-border aspect-[21/9] bg-muted/40 max-h-72 relative mt-2">
            <img src={thumbnail} alt="Cover preview" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-8 text-center text-xs text-muted-foreground bg-muted/10">
            No cover image set. Enter an image URL above to see live preview.
          </div>
        )}
      </div>

      {/* Social Overrides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Custom OpenGraph Share Image (Optional)
          </label>
          <Input
            placeholder="Defaults to cover thumbnail..."
            value={ogImage}
            onChange={(e) => setOgImage(e.target.value)}
            className="bg-card text-xs"
          />
          {ogImage && (
            <div className="rounded-lg overflow-hidden border aspect-[1.91/1] max-h-36">
              <img src={ogImage} alt="OG Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Custom Twitter Card Image (Optional)
          </label>
          <Input
            placeholder="Defaults to cover thumbnail..."
            value={twitterImage}
            onChange={(e) => setTwitterImage(e.target.value)}
            className="bg-card text-xs"
          />
          {twitterImage && (
            <div className="rounded-lg overflow-hidden border aspect-[1.91/1] max-h-36">
              <img src={twitterImage} alt="Twitter Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
