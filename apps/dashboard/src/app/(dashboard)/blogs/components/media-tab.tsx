"use client"

import * as React from "react"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { ImageIcon, FolderOpen, X } from "lucide-react"
import { MediaPickerModal } from "@/app/(dashboard)/media/components/media-picker-modal"
import type { MediaFileDTO } from "@workspace/shared"

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
  const [pickerTarget, setPickerTarget] = React.useState<
    "thumbnail" | "og" | "twitter" | null
  >(null)

  const handleSelectMedia = (selected: MediaFileDTO | MediaFileDTO[]) => {
    const file = Array.isArray(selected) ? selected[0] : selected
    if (!file) return

    if (pickerTarget === "thumbnail") {
      setThumbnail(file.url)
    } else if (pickerTarget === "og") {
      setOgImage(file.url)
    } else if (pickerTarget === "twitter") {
      setTwitterImage(file.url)
    }
  }

  return (
    <div className="space-y-6">
      {/* Cover / Thumbnail */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            <ImageIcon className="h-3.5 w-3.5 text-primary" /> Primary Cover /
            Thumbnail Image
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPickerTarget("thumbnail")}
            className="h-7 gap-1.5 text-xs"
          >
            <FolderOpen className="size-3.5 text-primary" /> Browse Media
            Library
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Enter URL or select from Media Library..."
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
            className="bg-card text-xs"
          />
          {thumbnail && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setThumbnail("")}
              className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
              title="Clear cover"
            >
              <X className="size-3.5" />
            </Button>
          )}
        </div>

        {thumbnail ? (
          <div className="group relative mt-2 aspect-[21/9] max-h-72 overflow-hidden rounded-xl border border-border bg-muted/40">
            <img
              src={thumbnail}
              alt="Cover preview"
              className="h-full w-full object-cover"
            />
            <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setPickerTarget("thumbnail")}
                className="h-7 bg-background/90 text-xs shadow-xs backdrop-blur-xs"
              >
                Change Image
              </Button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setPickerTarget("thumbnail")}
            className="cursor-pointer rounded-xl border border-dashed border-border/80 bg-muted/10 p-8 text-center text-xs text-muted-foreground transition-colors hover:border-primary hover:bg-muted/20"
          >
            <ImageIcon className="mx-auto mb-2 size-8 text-muted-foreground/60" />
            No cover image set. Click to choose from Media Library or type an
            image URL above.
          </div>
        )}
      </div>

      {/* Social Overrides */}
      <div className="grid grid-cols-1 gap-4 border-t border-border pt-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Custom OpenGraph Share Image (Optional)
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setPickerTarget("og")}
              className="h-6 px-1.5 text-[11px]"
            >
              Library
            </Button>
          </div>
          <Input
            placeholder="Defaults to cover thumbnail..."
            value={ogImage}
            onChange={(e) => setOgImage(e.target.value)}
            className="bg-card text-xs"
          />
          {ogImage && (
            <div className="aspect-[1.91/1] max-h-36 overflow-hidden rounded-lg border">
              <img
                src={ogImage}
                alt="OG Preview"
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Custom Twitter Card Image (Optional)
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setPickerTarget("twitter")}
              className="h-6 px-1.5 text-[11px]"
            >
              Library
            </Button>
          </div>
          <Input
            placeholder="Defaults to cover thumbnail..."
            value={twitterImage}
            onChange={(e) => setTwitterImage(e.target.value)}
            className="bg-card text-xs"
          />
          {twitterImage && (
            <div className="aspect-[1.91/1] max-h-36 overflow-hidden rounded-lg border">
              <img
                src={twitterImage}
                alt="Twitter Preview"
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        open={pickerTarget !== null}
        onOpenChange={(open) => {
          if (!open) setPickerTarget(null)
        }}
        onSelect={handleSelectMedia}
        mimeTypeFilter="image/*"
        defaultFolder="blogs"
        title={
          pickerTarget === "thumbnail"
            ? "Select Post Cover Image"
            : pickerTarget === "og"
              ? "Select OpenGraph Image"
              : "Select Twitter Card Image"
        }
        buttonText="Set as Post Image"
      />
    </div>
  )
}
