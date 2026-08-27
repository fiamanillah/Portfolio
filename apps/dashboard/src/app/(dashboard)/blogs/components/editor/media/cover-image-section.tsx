"use client"

import * as React from "react"
import {
  ImageIcon,
  UploadCloud,
  FolderOpen,
  X,
  Loader2,
  CheckCircle2,
  Info,
  Maximize2,
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

export function CoverImageSection({
  thumbnail,
  setThumbnail,
}: CoverImageSectionProps) {
  const [isPickerOpen, setIsPickerOpen] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const [imageMeta, setImageMeta] = React.useState<{
    width?: number
    height?: number
    aspectRatio?: string
    format?: string
  }>({})

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Measure natural dimensions & format from image url
  React.useEffect(() => {
    if (!thumbnail) {
      setImageMeta({})
      return
    }

    const img = new Image()
    img.onload = () => {
      const w = img.naturalWidth
      const h = img.naturalHeight
      const ratio = (w / h).toFixed(2)
      let aspectLabel = `${w} × ${h}px`
      if (Math.abs(w / h - 16 / 9) < 0.05) {
        aspectLabel += " (16:9)"
      } else if (Math.abs(w / h - 4 / 3) < 0.05) {
        aspectLabel += " (4:3)"
      } else if (Math.abs(w / h - 1) < 0.05) {
        aspectLabel += " (1:1 Square)"
      }

      // Extract format from extension or data url
      let format = "Image"
      const extMatch = thumbnail.match(/\.(png|jpe?g|webp|svg|gif|avif)($|\?)/i)
      if (extMatch) {
        format = extMatch[1].toUpperCase()
      } else if (thumbnail.startsWith("data:image/")) {
        format = thumbnail.substring(11, thumbnail.indexOf(";")).toUpperCase()
      }

      setImageMeta({
        width: w,
        height: h,
        aspectRatio: aspectLabel,
        format,
      })
    }
    img.src = thumbnail
  }, [thumbnail])

  const handleMediaSelect = (selected: MediaFileDTO | MediaFileDTO[]) => {
    const file = Array.isArray(selected) ? selected[0] : selected
    if (!file) return
    setThumbnail(file.url)
    toast.success(`Cover image set to '${file.fileName}'`)
  }

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return
    const file = files[0]
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, WebP, SVG)")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File exceeds maximum allowed size of 5MB")
      return
    }

    setIsUploading(true)
    try {
      const res = await MediaApi.upload([file], {
        folder: "covers",
        source: "BLOG_COVER",
      })

      if (res.success && res.data) {
        const uploaded = Array.isArray(res.data) ? res.data[0] : res.data
        setThumbnail(uploaded.url)
        toast.success(`Cover image '${file.name}' uploaded successfully!`)
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

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    await uploadFiles(Array.from(files))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFiles(Array.from(e.dataTransfer.files))
    }
  }

  return (
    <div className="space-y-3">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
          <ImageIcon className="h-3.5 w-3.5 text-primary" /> Cover Artwork
        </label>
        <div className="flex items-center gap-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
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
            Upload Image
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

      {/* Main Cover Display / Dropzone */}
      {thumbnail ? (
        <div className="space-y-2">
          {/* 16:9 Image Preview Box */}
          <div className="group relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-border/80 bg-muted/40 shadow-xs">
            <img
              src={thumbnail}
              alt="Cover artwork preview"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 backdrop-blur-xs transition-opacity group-hover:opacity-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="h-7 bg-background/95 text-xs shadow-xs"
              >
                <UploadCloud className="mr-1 h-3 w-3 text-primary" /> Replace
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsPickerOpen(true)}
                className="h-7 bg-background/95 text-xs shadow-xs"
              >
                <FolderOpen className="mr-1 h-3 w-3 text-primary" /> Library
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setThumbnail("")}
                className="h-7 text-xs shadow-xs"
              >
                <X className="mr-1 h-3 w-3" /> Remove
              </Button>
            </div>
          </div>

          {/* Image Metadata & URL Manager */}
          <div className="space-y-2 rounded-lg border border-border/60 bg-muted/20 p-2.5">
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5">
                {imageMeta.format && (
                  <Badge
                    variant="outline"
                    className="border-primary/30 bg-primary/10 font-mono text-[9px] font-bold text-primary uppercase"
                  >
                    {imageMeta.format}
                  </Badge>
                )}
                {imageMeta.aspectRatio && (
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {imageMeta.aspectRatio}
                  </span>
                )}
              </div>
              <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-500">
                <CheckCircle2 className="h-3 w-3" /> Ready for publishing
              </span>
            </div>

            {/* Direct Image URL input */}
            <div className="flex items-center gap-1.5">
              <Input
                placeholder="Image URL..."
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                className="h-7 border-border/80 bg-background font-mono text-[11px] shadow-xs"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setThumbnail("")}
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                title="Clear cover"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Dropzone with Clear Upload Instructions */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer space-y-2 rounded-xl border-2 border-dashed p-6 text-center transition-all ${
            isDragging
              ? "border-primary bg-primary/10 shadow-md"
              : "border-border/80 bg-muted/10 hover:border-primary/60 hover:bg-muted/20"
          }`}
        >
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <UploadCloud className="h-5 w-5" />
            )}
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold text-foreground">
              Upload Cover Artwork
            </div>
            <p className="text-[11px] text-muted-foreground">
              Drag & drop image here or click to browse from device
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-[10px] text-muted-foreground">
            <Badge variant="secondary" className="font-mono text-[9px]">
              16:9 Landscape
            </Badge>
            <Badge variant="secondary" className="font-mono text-[9px]">
              1200×630 or 1920×1080
            </Badge>
            <Badge variant="secondary" className="font-mono text-[9px]">
              PNG, JPG, WebP, SVG
            </Badge>
            <Badge variant="secondary" className="font-mono text-[9px]">
              Max 5MB
            </Badge>
          </div>
        </div>
      )}

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
