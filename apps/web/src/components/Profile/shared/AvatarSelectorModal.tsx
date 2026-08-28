// src/components/Profile/shared/AvatarSelectorModal.tsx
import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { AuthApi } from "@/lib/api/authApi"
import { toast } from "@workspace/ui/components/sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Upload02Icon,
  Loading03Icon,
  Delete02Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"

interface AvatarSelectorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentAvatar?: string | null
  onSaveAvatar: (newAvatar: string) => void
  onRemoveAvatar?: () => void
}

interface CompressedImageState {
  file: File
  previewUrl: string
  originalSize: number
  compressedSize: number
  width: number
  height: number
}

/**
 * Compresses and crops an image file to a lightweight WebP/JPEG avatar (max 384x384, ~15-40KB).
 */
async function compressImageToAvatar(
  file: File,
  maxDimension = 384,
  quality = 0.85
): Promise<CompressedImageState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          return reject(new Error("Failed to initialize image canvas context"))
        }

        // Center crop to a perfect square
        const minSide = Math.min(img.width, img.height)
        const sx = (img.width - minSide) / 2
        const sy = (img.height - minSide) / 2

        const outputSize = Math.min(minSide, maxDimension)
        canvas.width = outputSize
        canvas.height = outputSize

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"

        ctx.drawImage(
          img,
          sx,
          sy,
          minSide,
          minSide,
          0,
          0,
          outputSize,
          outputSize
        )

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error("Failed to compress avatar image."))
            }

            const cleanFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp"
            const compressedFile = new File([blob], cleanFileName, {
              type: "image/webp",
              lastModified: Date.now(),
            })

            const previewUrl = URL.createObjectURL(blob)
            resolve({
              file: compressedFile,
              previewUrl,
              originalSize: file.size,
              compressedSize: blob.size,
              width: outputSize,
              height: outputSize,
            })
          },
          "image/webp",
          quality
        )
      }
      img.onerror = () =>
        reject(new Error("Invalid image format or corrupted file."))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error("Could not read selected file."))
    reader.readAsDataURL(file)
  })
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function AvatarSelectorModal({
  open,
  onOpenChange,
  currentAvatar,
  onSaveAvatar,
  onRemoveAvatar,
}: AvatarSelectorModalProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [compressed, setCompressed] = useState<CompressedImageState | null>(
    null
  )

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleProcessFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WebP, GIF).")
      return
    }

    if (file.size > 15 * 1024 * 1024) {
      setError("Image file exceeds the maximum 15MB limit.")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const result = await compressImageToAvatar(file)
      setCompressed(result)
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to process image file."
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleProcessFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleProcessFile(file)
    }
  }

  const handleUploadAndSave = async () => {
    if (!compressed) {
      setError("Please select an image file to upload.")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const res = await AuthApi.uploadAvatar(compressed.file)
      if (res.success && res.data?.avatar) {
        onSaveAvatar(res.data.avatar)
        toast.success("Avatar uploaded and optimized successfully!")
        handleClose()
      } else {
        setError(
          res.error ||
            res.message ||
            "Failed to upload avatar to cloud storage."
        )
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to upload avatar.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = async () => {
    setIsUploading(true)
    setError(null)
    try {
      const res = await AuthApi.deleteAvatar()
      if (res.success) {
        onRemoveAvatar?.()
        onSaveAvatar("/fi-avatar.webp")
        toast.success("Profile avatar removed.")
        handleClose()
      } else {
        setError(res.error || "Failed to remove avatar.")
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to remove avatar.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    if (compressed?.previewUrl) {
      URL.revokeObjectURL(compressed.previewUrl)
    }
    setCompressed(null)
    setError(null)
    onOpenChange(false)
  }

  const savingsPercent =
    compressed && compressed.originalSize > 0
      ? Math.max(
          0,
          Math.round(
            ((compressed.originalSize - compressed.compressedSize) /
              compressed.originalSize) *
              100
          )
        )
      : 0

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md rounded-none border border-border bg-card p-5 font-mono sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-foreground">
            Upload Profile Avatar
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Upload an image from your device. It will be automatically cropped
            to a square and compressed to WebP format to minimize storage size.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Avatar Preview & Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`group relative flex cursor-pointer flex-col items-center justify-center border-2 border-dashed p-6 transition-all ${
              isDragging
                ? "border-primary bg-primary/10"
                : "border-border/80 bg-background/50 hover:border-primary/60 hover:bg-muted/30"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Circular Avatar Visualizer */}
            <div className="relative mb-3 size-24 shrink-0 overflow-hidden rounded-full border-2 border-border bg-muted/40 shadow-inner sm:size-28">
              <img
                src={
                  compressed?.previewUrl || currentAvatar || "/fi-avatar.webp"
                }
                alt="Avatar preview"
                referrerPolicy="no-referrer"
                className="size-full object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = "/fi-avatar.webp"
                }}
              />
              {(isProcessing || isUploading) && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-xs">
                  <HugeiconsIcon
                    icon={Loading03Icon}
                    className="size-6 animate-spin text-primary"
                  />
                </div>
              )}
            </div>

            <div className="text-center">
              <p className="text-xs font-semibold text-foreground group-hover:text-primary">
                {compressed
                  ? "Click or drop to replace image"
                  : "Drop image here, or click to browse"}
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Supports PNG, JPG, WebP (Max 15MB)
              </p>
            </div>
          </div>

          {/* Compression & Storage Optimization Stats */}
          {compressed && (
            <div className="rounded-none border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs">
              <div className="flex items-center justify-between text-emerald-500">
                <span className="flex items-center gap-1.5 font-semibold">
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    className="size-3.5"
                  />
                  Optimized for Cloud Storage
                </span>
                <span className="font-bold">{savingsPercent}% smaller</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                <div>
                  Original:{" "}
                  <span className="font-semibold text-foreground">
                    {formatBytes(compressed.originalSize)}
                  </span>
                </div>
                <div>
                  Compressed:{" "}
                  <span className="font-semibold text-emerald-500">
                    {formatBytes(compressed.compressedSize)} (WebP)
                  </span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <p className="rounded-none border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="flex flex-col gap-2 border-t border-border/60 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {currentAvatar && !currentAvatar.includes("fi-avatar.webp") && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isUploading || isProcessing}
                onClick={handleRemove}
                className="h-8 cursor-pointer gap-1 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
                <span>Remove Avatar</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading || isProcessing}
              onClick={handleClose}
              className="h-8 cursor-pointer rounded-none text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!compressed || isUploading || isProcessing}
              onClick={handleUploadAndSave}
              className="h-8 cursor-pointer gap-1.5 rounded-none bg-primary text-xs font-bold text-primary-foreground hover:bg-primary/90"
            >
              {isUploading ? (
                <>
                  <HugeiconsIcon
                    icon={Loading03Icon}
                    className="size-3.5 animate-spin"
                  />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={Upload02Icon} className="size-3.5" />
                  <span>Save Avatar</span>
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
