"use client"

import * as React from "react"
import {
  FileText,
  FileCode,
  FileArchive,
  Film,
  Music,
  FileQuestion,
  ExternalLink,
  Eye,
} from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

interface MediaPreviewProps {
  url: string
  mimeType: string
  fileName: string
  altText?: string | null
  className?: string
  aspectRatio?: "square" | "video" | "auto" | "banner"
  thumbnailOnly?: boolean
  showOverlayOnHover?: boolean
  onPreviewClick?: () => void
}

export function MediaPreview({
  url,
  mimeType,
  fileName,
  altText,
  className,
  aspectRatio = "auto",
  thumbnailOnly = false,
  showOverlayOnHover = false,
  onPreviewClick,
}: MediaPreviewProps) {
  const [hasError, setHasError] = React.useState(false)
  const isImage = mimeType?.startsWith("image/")
  const isVideo = mimeType?.startsWith("video/")
  const isAudio = mimeType?.startsWith("audio/")
  const isPdf = mimeType === "application/pdf"
  const isArchive =
    mimeType?.includes("zip") ||
    mimeType?.includes("tar") ||
    mimeType?.includes("rar") ||
    mimeType?.includes("7z") ||
    mimeType?.includes("gzip")
  const isCode =
    mimeType?.includes("json") ||
    mimeType?.includes("javascript") ||
    mimeType?.includes("typescript") ||
    mimeType?.includes("html") ||
    mimeType?.includes("css") ||
    mimeType?.includes("xml")

  const aspectClass = {
    square: "aspect-square",
    video: "aspect-video",
    banner: "aspect-[21/9]",
    auto: "h-full w-full",
  }[aspectRatio]

  if (isImage && !hasError) {
    return (
      <div
        className={cn(
          "relative group overflow-hidden bg-muted/20 flex items-center justify-center select-none",
          aspectClass,
          className
        )}
      >
        <img
          src={url}
          alt={altText || fileName}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setHasError(true)}
        />
        {showOverlayOnHover && (
          <div
            onClick={onPreviewClick}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer gap-2"
          >
            <span className="p-2 rounded-full bg-background/80 text-foreground shadow-sm hover:scale-110 transition-transform">
              <Eye className="size-4" />
            </span>
          </div>
        )}
      </div>
    )
  }

  if (isVideo && !thumbnailOnly) {
    return (
      <div className={cn("relative overflow-hidden rounded-lg bg-black/90 flex items-center justify-center", aspectClass, className)}>
        <video
          src={url}
          controls
          className="w-full h-full max-h-[480px] object-contain rounded-lg"
          preload="metadata"
        >
          Your browser does not support HTML video playback.
        </video>
      </div>
    )
  }

  if (isAudio && !thumbnailOnly) {
    return (
      <div className={cn("p-6 rounded-xl bg-card border border-border flex flex-col items-center justify-center gap-4 text-center", className)}>
        <div className="size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <Music className="size-8 animate-pulse" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium truncate max-w-xs">{fileName}</p>
          <p className="text-xs text-muted-foreground font-mono">{mimeType}</p>
        </div>
        <audio src={url} controls className="w-full max-w-md h-10 mt-2" />
      </div>
    )
  }

  // Non-image Thumbnail / Fallback Representation
  return (
    <div
      className={cn(
        "relative group flex flex-col items-center justify-center p-4 bg-muted/20 text-muted-foreground select-none transition-colors group-hover:bg-muted/30",
        aspectClass,
        className
      )}
    >
      {isVideo ? (
        <div className="flex flex-col items-center gap-2">
          <div className="size-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <Film className="size-6" />
          </div>
          <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-purple-400">
            VIDEO
          </span>
        </div>
      ) : isAudio ? (
        <div className="flex flex-col items-center gap-2">
          <div className="size-12 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
            <Music className="size-6" />
          </div>
          <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-pink-400">
            AUDIO
          </span>
        </div>
      ) : isPdf ? (
        <div className="flex flex-col items-center gap-2">
          <div className="size-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <FileText className="size-6" />
          </div>
          <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-rose-400">
            PDF DOC
          </span>
        </div>
      ) : isArchive ? (
        <div className="flex flex-col items-center gap-2">
          <div className="size-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <FileArchive className="size-6" />
          </div>
          <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-amber-400">
            ARCHIVE
          </span>
        </div>
      ) : isCode ? (
        <div className="flex flex-col items-center gap-2">
          <div className="size-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <FileCode className="size-6" />
          </div>
          <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-emerald-400">
            CODE
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="size-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <FileQuestion className="size-6" />
          </div>
          <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-muted-foreground">
            FILE
          </span>
        </div>
      )}

      {showOverlayOnHover && (
        <div
          onClick={onPreviewClick}
          className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
        >
          <span className="p-2 rounded-full bg-background/80 text-foreground shadow-sm">
            <ExternalLink className="size-4" />
          </span>
        </div>
      )}
    </div>
  )
}
