"use client"

import * as React from "react"
import {
  Copy,
  Check,
  Eye,
  Download,
  Trash2,
  Lock,
  Globe,
  MoreVertical,
  Folder,
} from "lucide-react"
import type { MediaFileDTO } from "@workspace/shared"
import { MediaPreview } from "./media-preview"
import { Badge } from "@workspace/ui/components/badge"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { toast } from "@workspace/ui/components/sonner"
import { cn } from "@workspace/ui/lib/utils"

interface MediaCardProps {
  file: MediaFileDTO
  isSelected: boolean
  onToggleSelect: (id: string) => void
  onInspect: (file: MediaFileDTO) => void
  onDelete: (file: MediaFileDTO) => void
}

export function MediaCard({
  file,
  isSelected,
  onToggleSelect,
  onInspect,
  onDelete,
}: MediaCardProps) {
  const [isCopied, setIsCopied] = React.useState(false)

  const handleCopyUrl = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(file.url)
    setIsCopied(true)
    toast.success("Asset URL copied to clipboard!")
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    const a = document.createElement("a")
    a.href = file.url
    a.download = file.fileName
    a.target = "_blank"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const ext = file.fileExtension || file.fileName.split(".").pop() || "file"

  return (
    <div
      onClick={() => onInspect(file)}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-2xs transition-all duration-200 cursor-pointer select-none",
        isSelected
          ? "border-primary ring-2 ring-primary/20 bg-primary/5"
          : "border-border/80 hover:border-primary/50 hover:shadow-md"
      )}
    >
      {/* Selection Checkbox & Privacy Indicator */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "absolute left-2.5 top-2.5 z-10 transition-opacity duration-150",
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      >
        <div className="rounded-md bg-background/90 p-1 backdrop-blur-xs shadow-xs">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(file.id)}
            aria-label={`Select ${file.fileName}`}
          />
        </div>
      </div>

      {/* Top Right Actions */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute right-2.5 top-2.5 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
      >
        <Button
          variant="secondary"
          size="icon"
          onClick={handleCopyUrl}
          className="size-7 rounded-md bg-background/90 hover:bg-background shadow-xs backdrop-blur-xs text-xs"
          title="Copy URL"
        >
          {isCopied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="size-7 rounded-md bg-background/90 hover:bg-background shadow-xs backdrop-blur-xs text-xs"
            >
              <MoreVertical className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="text-xs min-w-36">
            <DropdownMenuItem onClick={() => onInspect(file)}>
              <Eye className="mr-2 size-3.5" /> Details & Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyUrl}>
              <Copy className="mr-2 size-3.5" /> Copy Public URL
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownload}>
              <Download className="mr-2 size-3.5" /> Download File
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(file)}
              className="text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <Trash2 className="mr-2 size-3.5" /> Delete Permanently
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Media Visual Area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/20 border-b border-border/40">
        <MediaPreview
          url={file.url}
          mimeType={file.mimeType}
          fileName={file.fileName}
          altText={file.altText}
          aspectRatio="auto"
          thumbnailOnly
        />

        {/* Extension Pill on bottom left */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1">
          <Badge
            variant="secondary"
            className="h-5 px-1.5 text-[10px] font-mono uppercase bg-background/80 backdrop-blur-xs border border-border/50 text-foreground"
          >
            {ext}
          </Badge>
          {!file.isPublic && (
            <Badge
              variant="destructive"
              className="h-5 px-1 text-[10px] bg-amber-500/80 text-white gap-0.5"
              title="Private / Restricted"
            >
              <Lock className="size-2.5" />
            </Badge>
          )}
        </div>

        {/* Size Pill on bottom right */}
        <div className="absolute bottom-2 right-2">
          <Badge
            variant="secondary"
            className="h-5 px-1.5 text-[10px] font-mono bg-background/80 backdrop-blur-xs border border-border/50 text-muted-foreground"
          >
            {file.sizeFormatted}
          </Badge>
        </div>
      </div>

      {/* Card Footer Information */}
      <div className="flex flex-col p-3 gap-1">
        <div className="flex items-center justify-between gap-1.5">
          <span
            className="text-xs font-semibold truncate text-foreground hover:text-primary transition-colors"
            title={file.fileName}
          >
            {file.fileName}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1 truncate capitalize">
            <Folder className="size-3 text-primary/70 shrink-0" />
            {file.folder}
          </span>
          <span className="font-mono text-[10px] shrink-0">
            {new Date(file.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  )
}
