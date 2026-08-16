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
          "group relative flex items-center justify-center overflow-hidden bg-muted/20 select-none",
          aspectClass,
          className
        )}
      >
        <img
          src={url}
          alt={altText || fileName}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setHasError(true)}
        />
        {showOverlayOnHover && (
          <div
            onClick={onPreviewClick}
            className="absolute inset-0 flex cursor-pointer items-center justify-center gap-2 bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100"
          >
            <span className="rounded-full bg-background/80 p-2 text-foreground shadow-sm transition-transform hover:scale-110">
              <Eye className="size-4" />
            </span>
          </div>
        )}
      </div>
    )
  }

  if (isVideo && !thumbnailOnly) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden rounded-lg bg-black/90",
          aspectClass,
          className
        )}
      >
        <video
          src={url}
          controls
          className="h-full max-h-[480px] w-full rounded-lg object-contain"
          preload="metadata"
        >
          Your browser does not support HTML video playback.
        </video>
      </div>
    )
  }

  if (isAudio && !thumbnailOnly) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-card p-6 text-center",
          className
        )}
      >
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Music className="size-8 animate-pulse" />
        </div>
        <div className="space-y-1">
          <p className="max-w-xs truncate text-sm font-medium">{fileName}</p>
          <p className="font-mono text-xs text-muted-foreground">{mimeType}</p>
        </div>
        <audio src={url} controls className="mt-2 h-10 w-full max-w-md" />
      </div>
    )
  }

  // Non-image Thumbnail / Fallback Representation
  return (
    <div
      className={cn(
        "group relative flex flex-col items-center justify-center bg-muted/20 p-4 text-muted-foreground transition-colors select-none group-hover:bg-muted/30",
        aspectClass,
        className
      )}
    >
      {isVideo ? (
        <div className="flex flex-col items-center gap-2">
          <div className="flex size-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
            <Film className="size-6" />
          </div>
          <span className="font-mono text-[10px] font-medium tracking-wider text-purple-400 uppercase">
            VIDEO
          </span>
        </div>
      ) : isAudio ? (
        <div className="flex flex-col items-center gap-2">
          <div className="flex size-12 items-center justify-center rounded-xl bg-pink-500/10 text-pink-500">
            <Music className="size-6" />
          </div>
          <span className="font-mono text-[10px] font-medium tracking-wider text-pink-400 uppercase">
            AUDIO
          </span>
        </div>
      ) : isPdf ? (
        <div className="flex flex-col items-center gap-2">
          <div className="flex size-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
            <FileText className="size-6" />
          </div>
          <span className="font-mono text-[10px] font-medium tracking-wider text-rose-400 uppercase">
            PDF DOC
          </span>
        </div>
      ) : isArchive ? (
        <div className="flex flex-col items-center gap-2">
          <div className="flex size-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <FileArchive className="size-6" />
          </div>
          <span className="font-mono text-[10px] font-medium tracking-wider text-amber-400 uppercase">
            ARCHIVE
          </span>
        </div>
      ) : isCode ? (
        <div className="flex flex-col items-center gap-2">
          <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
            <FileCode className="size-6" />
          </div>
          <span className="font-mono text-[10px] font-medium tracking-wider text-emerald-400 uppercase">
            CODE
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="flex size-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
            <FileQuestion className="size-6" />
          </div>
          <span className="font-mono text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
            FILE
          </span>
        </div>
      )}

      {showOverlayOnHover && (
        <div
          onClick={onPreviewClick}
          className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <span className="rounded-full bg-background/80 p-2 text-foreground shadow-sm">
            <ExternalLink className="size-4" />
          </span>
        </div>
      )}
    </div>
  )
}
