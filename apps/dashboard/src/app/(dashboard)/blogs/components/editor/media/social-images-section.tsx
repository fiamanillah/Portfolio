"use client"

import * as React from "react"
import { Share2, FolderOpen, X, Sparkles } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { MediaPickerModal } from "@/app/(dashboard)/media/components/media-picker-modal"
import type { MediaFileDTO } from "@workspace/shared"
import { toast } from "@workspace/ui/components/sonner"

interface SocialImagesSectionProps {
  coverImage: string
  ogImage: string
  setOgImage: (val: string) => void
  twitterImage: string
  setTwitterImage: (val: string) => void
}

export function SocialImagesSection({
  coverImage,
  ogImage,
  setOgImage,
  twitterImage,
  setTwitterImage,
}: SocialImagesSectionProps) {
  const [pickerTarget, setPickerTarget] = React.useState<"og" | "twitter" | null>(null)

  const handleMediaSelect = (selected: MediaFileDTO | MediaFileDTO[]) => {
    const file = Array.isArray(selected) ? selected[0] : selected
    if (!file) return

    if (pickerTarget === "og") {
      setOgImage(file.url)
      toast.success("OpenGraph share image updated")
    } else if (pickerTarget === "twitter") {
      setTwitterImage(file.url)
      toast.success("Twitter share image updated")
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border/80">
      {/* OpenGraph Image */}
      <div className="space-y-3 p-4 rounded-xl border border-border/80 bg-background/60">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Share2 className="h-3.5 w-3.5 text-primary" /> OpenGraph Social Image
            </label>
            <p className="text-[11px] text-muted-foreground">
              LinkedIn & Facebook link preview banner (1200×630px).
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {coverImage && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setOgImage(coverImage)
                  toast.success("Copied from cover image")
                }}
                className="h-6 text-[10px] px-1.5 text-primary hover:bg-primary/10"
              >
                Use Cover
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPickerTarget("og")}
              className="h-6 text-[10px] px-2 gap-1 bg-background"
            >
              <FolderOpen className="h-3 w-3" /> Library
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Defaults to cover thumbnail..."
            value={ogImage}
            onChange={(e) => setOgImage(e.target.value)}
            className="text-xs font-mono h-8 bg-background border-border/90 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-xs"
          />
          {ogImage && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setOgImage("")}
              className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {ogImage ? (
          <div className="rounded-lg overflow-hidden border aspect-[1.91/1] max-h-36 bg-muted/30">
            <img src={ogImage} alt="OG Preview" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="p-4 rounded-lg border border-dashed text-center text-[11px] text-muted-foreground bg-muted/10">
            Will inherit primary cover artwork
          </div>
        )}
      </div>

      {/* Twitter Image */}
      <div className="space-y-3 p-4 rounded-xl border border-border/80 bg-background/60">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Share2 className="h-3.5 w-3.5 text-sky-400" /> Twitter / X Card Image
            </label>
            <p className="text-[11px] text-muted-foreground">
              Large summary card preview for X posts.
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {(ogImage || coverImage) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTwitterImage(ogImage || coverImage)
                  toast.success("Copied from OG/Cover")
                }}
                className="h-6 text-[10px] px-1.5 text-primary hover:bg-primary/10"
              >
                Use OG / Cover
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPickerTarget("twitter")}
              className="h-6 text-[10px] px-2 gap-1 bg-background"
            >
              <FolderOpen className="h-3 w-3" /> Library
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Defaults to OG or cover thumbnail..."
            value={twitterImage}
            onChange={(e) => setTwitterImage(e.target.value)}
            className="text-xs font-mono h-8 bg-background border-border/90 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-xs"
          />
          {twitterImage && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setTwitterImage("")}
              className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {twitterImage ? (
          <div className="rounded-lg overflow-hidden border aspect-[2/1] max-h-36 bg-muted/30">
            <img src={twitterImage} alt="Twitter Preview" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="p-4 rounded-lg border border-dashed text-center text-[11px] text-muted-foreground bg-muted/10">
            Will inherit OpenGraph or cover artwork
          </div>
        )}
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        open={pickerTarget !== null}
        onOpenChange={(open) => !open && setPickerTarget(null)}
        onSelect={handleMediaSelect}
        defaultFolder="covers"
        title="Select Social Share Image"
        buttonText="Use as Social Share Image"
      />
    </div>
  )
}
