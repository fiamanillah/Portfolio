"use client"

import * as React from "react"
import {
  ImageIcon,
  UploadCloud,
  FolderOpen,
  X,
  Loader2,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { MediaPickerModal } from "@/app/(dashboard)/media/components/media-picker-modal"
import { MediaApi } from "@/lib/api"
import type { MediaFileDTO } from "@workspace/shared"
import { toast } from "@workspace/ui/components/sonner"

interface CoverImageSectionProps {
  thumbnail: string
  setThumbnail: (val: string) => void
}

const DEFAULT_PRESETS = [
  { label: "Distributed Systems", url: "/assets/images/mickanic-cover.png" },
  {
    label: "Cloud Architecture",
    url: "/assets/images/case-studies/nexus/overview.png",
  },
  {
    label: "DevOps & CI/CD",
    url: "/assets/images/case-studies/nexus/results.png",
  },
]

export function CoverImageSection({
  thumbnail,
  setThumbnail,
}: CoverImageSectionProps) {
  const [isPickerOpen, setIsPickerOpen] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleMediaSelect = (selected: MediaFileDTO | MediaFileDTO[]) => {
    const file = Array.isArray(selected) ? selected[0] : selected
    if (!file) return
    setThumbnail(file.url)
    toast.success(`Cover image set to '${file.fileName}'`)
  }

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    try {
      const res = await MediaApi.upload(Array.from(files), {
        folder: "covers",
        source: "BLOG_COVER",
      })

      if (res.success && res.data) {
        const file = Array.isArray(res.data) ? res.data[0] : res.data
        setThumbnail(file.url)
        toast.success("Cover image uploaded and set successfully!")
      } else {
        toast.error(res.error || "Cover upload failed")
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Cover upload failed")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2.5">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
          <ImageIcon className="h-3.5 w-3.5 text-primary" /> Cover Artwork
        </label>
        <div className="flex items-center gap-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleDirectUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="h-7 gap-1 px-2 text-xs"
          >
            {isUploading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <UploadCloud className="h-3 w-3 text-primary" />
            )}
            Upload
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPickerOpen(true)}
            className="h-7 gap-1 px-2 text-xs"
          >
            <FolderOpen className="h-3 w-3 text-primary" /> Library
          </Button>
        </div>
      </div>

      {/* URL Input */}
      <div className="flex items-center gap-1.5">
        <Input
          placeholder="Image URL or choose from library / upload..."
          value={thumbnail}
          onChange={(e) => setThumbnail(e.target.value)}
          className="h-8 border-border/90 bg-background font-mono text-xs shadow-xs"
        />
        {thumbnail && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setThumbnail("")}
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
            title="Clear cover"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Live Cover Preview or Dropzone */}
      {thumbnail ? (
        <div className="group relative aspect-[16/9] overflow-hidden rounded-lg border border-border/80 bg-muted/40 shadow-xs">
          <img
            src={thumbnail}
            alt="Cover preview"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsPickerOpen(true)}
              className="h-7 bg-background/90 text-xs shadow-xs"
            >
              Change
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setThumbnail("")}
              className="h-7 text-xs shadow-xs"
            >
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer space-y-1.5 rounded-lg border-2 border-dashed border-border/80 bg-muted/10 p-5 text-center text-xs text-muted-foreground shadow-xs transition-colors hover:border-primary/70 hover:bg-muted/20"
        >
          <UploadCloud className="mx-auto h-6 w-6 text-muted-foreground/60" />
          <div className="font-semibold text-foreground text-xs">
            No cover image set
          </div>
          <p className="text-[10px] text-muted-foreground">
            Click to upload or browse library (16:9 ratio)
          </p>
        </div>
      )}

      {/* Presets */}
      <div className="flex flex-wrap items-center gap-1 pt-0.5">
        <span className="font-mono text-[10px] text-muted-foreground">
          Presets:
        </span>
        {DEFAULT_PRESETS.map((preset, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setThumbnail(preset.url)}
            className="rounded border border-border/80 bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        onSelect={handleMediaSelect}
        defaultFolder="covers"
        title="Select Cover Artwork"
        buttonText="Use as Cover Artwork"
      />
    </div>
  )
}
