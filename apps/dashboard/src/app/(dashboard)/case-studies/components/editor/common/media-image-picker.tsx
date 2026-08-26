"use client"

import * as React from "react"
import {
  ImageIcon,
  UploadCloud,
  FolderOpen,
  X,
  Loader2,
  ExternalLink,
  Sparkles,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { MediaPickerModal } from "@/app/(dashboard)/media/components/media-picker-modal"
import { MediaApi } from "@/lib/api"
import type { MediaFileDTO } from "@workspace/shared"
import { toast } from "@workspace/ui/components/sonner"

interface MediaImagePickerProps {
  label?: string
  description?: string
  value: string
  onChange: (url: string) => void
  folder?: string
  source?: string
  aspectRatio?: "video" | "square" | "wide"
  presets?: { label: string; url: string }[]
  required?: boolean
}

export function MediaImagePicker({
  label = "Image Asset",
  description,
  value,
  onChange,
  folder = "case-studies",
  source = "CASE_STUDY",
  aspectRatio = "video",
  presets = [],
  required = false,
}: MediaImagePickerProps) {
  const [isPickerOpen, setIsPickerOpen] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleMediaSelect = (selected: MediaFileDTO | MediaFileDTO[]) => {
    const file = Array.isArray(selected) ? selected[0] : selected
    if (!file) return
    onChange(file.url)
    toast.success(`Selected media asset '${file.fileName}'`)
  }

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    try {
      const res = await MediaApi.upload(Array.from(files), {
        folder,
        source,
        isPublic: true,
      })

      if (res.success && res.data) {
        const file = Array.isArray(res.data) ? res.data[0] : res.data
        onChange(file.url)
        toast.success("Image uploaded to Cloudflare R2 and selected!")
      } else {
        toast.error(res.error || "Image upload failed")
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Image upload failed"
      toast.error(msg)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const aspectClass =
    aspectRatio === "square"
      ? "aspect-square"
      : aspectRatio === "wide"
        ? "aspect-[21/9]"
        : "aspect-video"

  return (
    <div className="space-y-3">
      {/* Header Label and Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-0.5">
          <label className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
            <ImageIcon className="size-3.5 text-primary" />
            {label} {required && <span className="text-destructive">*</span>}
          </label>
          {description && (
            <p className="text-[11px] text-muted-foreground">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleDirectUpload}
            disabled={isUploading}
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <UploadCloud className="size-3 text-primary" />
            )}
            {isUploading ? "Uploading..." : "Upload File"}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() => setIsPickerOpen(true)}
          >
            <FolderOpen className="size-3 text-primary" />
            Media Library
          </Button>

          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
              onClick={() => onChange("")}
              title="Remove Image"
            >
              <X className="size-3" />
            </Button>
          )}
        </div>
      </div>

      {/* URL Input */}
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... or /assets/images/... or select from library"
          className="h-8 text-xs font-mono pr-8"
        />
        {value && (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            title="Open Image in new tab"
          >
            <ExternalLink className="size-3" />
          </a>
        )}
      </div>

      {/* Preview Card */}
      <div
        className={`group relative overflow-hidden rounded-lg border border-border/80 bg-muted/20 ${aspectClass} flex items-center justify-center`}
      >
        {value ? (
          <>
            <img
              src={value}
              alt="Media Preview"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-102"
              onError={(e) => {
                ;(e.target as HTMLElement).style.display = "none"
              }}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 backdrop-blur-xs transition-opacity duration-200 group-hover:opacity-100 flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setIsPickerOpen(true)}
              >
                <FolderOpen className="mr-1 size-3" /> Change
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="h-7 text-xs"
                onClick={() => onChange("")}
              >
                <X className="mr-1 size-3" /> Remove
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5 p-4 text-center text-muted-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/60">
              <ImageIcon className="size-4 text-muted-foreground/60" />
            </div>
            <p className="text-xs font-medium">No image selected</p>
            <p className="text-[10px] text-muted-foreground/70">
              Upload an image or select from your Media Library
            </p>
          </div>
        )}
      </div>

      {/* Presets if provided */}
      {presets.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
            <Sparkles className="size-2.5 text-primary" /> Presets:
          </span>
          {presets.map((preset) => (
            <Badge
              key={preset.label}
              variant="outline"
              className="cursor-pointer text-[10px] hover:border-primary/50 hover:bg-primary/5"
              onClick={() => onChange(preset.url)}
            >
              {preset.label}
            </Badge>
          ))}
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        onSelect={handleMediaSelect}
        defaultFolder={folder}
        title={`Select ${label}`}
        buttonText="Select Image"
      />
    </div>
  )
}
