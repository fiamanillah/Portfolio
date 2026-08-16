"use client"

import * as React from "react"
import {
  ImageIcon,
  UploadCloud,
  FolderOpen,
  X,
  Loader2,
  Check,
  Sparkles,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
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
  { label: "Cloud Architecture", url: "/assets/images/case-studies/nexus/overview.png" },
  { label: "DevOps & CI/CD", url: "/assets/images/case-studies/nexus/results.png" },
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
    } catch (err: any) {
      toast.error(err?.message || "Cover upload failed")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <ImageIcon className="h-4 w-4 text-primary" /> Primary Cover / Thumbnail Artwork *
          </label>
          <p className="text-[11px] text-muted-foreground">
            Featured at the top of the article, on the home page, and across blog index cards (16:9 ratio recommended).
          </p>
        </div>

        <div className="flex items-center gap-2">
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
            className="h-8 text-xs gap-1.5 bg-background hover:bg-muted"
          >
            {isUploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <UploadCloud className="h-3.5 w-3.5 text-primary" />
            )}
            Upload File
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPickerOpen(true)}
            className="h-8 text-xs gap-1.5 bg-background hover:bg-muted"
          >
            <FolderOpen className="h-3.5 w-3.5 text-primary" /> Browse Library
          </Button>
        </div>
      </div>

      {/* URL Input */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Enter image URL or select from Media Library / Upload above..."
          value={thumbnail}
          onChange={(e) => setThumbnail(e.target.value)}
          className="text-xs font-mono h-9 bg-background border-border/90 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-xs"
        />
        {thumbnail && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setThumbnail("")}
            className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0"
            title="Clear cover"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Live Cover Preview or Dropzone */}
      {thumbnail ? (
        <div className="relative rounded-xl overflow-hidden border border-border/80 aspect-[16/9] bg-muted/40 max-h-96 group shadow-sm">
          <img
            src={thumbnail}
            alt="Cover preview"
            className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-3 left-4 text-xs font-mono text-muted-foreground">
            // COVER PREVIEW (16:9)
          </div>

          <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsPickerOpen(true)}
              className="h-7 text-xs bg-background/90 backdrop-blur-xs shadow-xs"
            >
              Change from Library
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
          className="rounded-xl border-2 border-dashed border-border/80 hover:border-primary/70 p-10 text-center text-xs text-muted-foreground bg-background/50 hover:bg-background/80 cursor-pointer transition-colors space-y-2 shadow-xs"
        >
          <UploadCloud className="size-9 mx-auto text-muted-foreground/60" />
          <div className="font-semibold text-foreground">
            No cover image set. Click to upload or browse library.
          </div>
          <p className="text-[11px] text-muted-foreground">
            Drag & drop high-resolution artwork here (PNG, JPG, WebP up to 10MB)
          </p>
        </div>
      )}

      {/* Presets */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-[11px] text-muted-foreground font-mono">Sample Presets:</span>
        {DEFAULT_PRESETS.map((preset, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setThumbnail(preset.url)}
            className="text-[11px] font-mono px-2 py-0.5 rounded bg-background hover:bg-muted text-muted-foreground hover:text-primary transition-colors border border-border/80"
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
