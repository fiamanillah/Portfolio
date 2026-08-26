"use client"

import * as React from "react"
import {
  Copy,
  Check,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Info,
  Tag,
  Folder,
  Globe,
  Lock,
  Loader2,
  Save,
  FileCode2,
  Code,
  X,
} from "lucide-react"
import type { MediaFileDTO, MediaFolderStat } from "@workspace/shared"
import { MediaApi } from "@/lib/api"
import { MediaPreview } from "./media-preview"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Label } from "@workspace/ui/components/label"
import { Badge } from "@workspace/ui/components/badge"
import { Switch } from "@workspace/ui/components/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { toast } from "@workspace/ui/components/sonner"

interface MediaDetailsDialogProps {
  file: MediaFileDTO | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateFile: (updated: MediaFileDTO) => void
  onDeleteFile: (file: MediaFileDTO) => void
  onPrev?: () => void
  onNext?: () => void
  hasPrev?: boolean
  hasNext?: boolean
  existingFolders?: MediaFolderStat[]
}

export function MediaDetailsDialog({
  file,
  open,
  onOpenChange,
  onUpdateFile,
  onDeleteFile,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
  existingFolders = [],
}: MediaDetailsDialogProps) {
  const [fileName, setFileName] = React.useState("")
  const [altText, setAltText] = React.useState("")
  const [caption, setCaption] = React.useState("")
  const [folder, setFolder] = React.useState("general")
  const [tags, setTags] = React.useState<string[]>([])
  const [tagInput, setTagInput] = React.useState("")
  const [isPublic, setIsPublic] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [copiedType, setCopiedType] = React.useState<
    "url" | "markdown" | "html" | null
  >(null)

  // Sync form whenever the selected file changes
  React.useEffect(() => {
    if (file) {
      setFileName(file.fileName || "")
      setAltText(file.altText || "")
      setCaption(file.caption || "")
      setFolder(file.folder || "general")
      setTags(file.tags || [])
      setTagInput("")
      setIsPublic(file.isPublic ?? true)
    }
  }, [file])

  if (!file) return null

  const handleCopy = (text: string, type: "url" | "markdown" | "html") => {
    navigator.clipboard.writeText(text)
    setCopiedType(type)
    toast.success(
      type === "url"
        ? "Public URL copied!"
        : type === "markdown"
          ? "Markdown code copied!"
          : "HTML snippet copied!"
    )
    setTimeout(() => setCopiedType(null), 2000)
  }

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter" && e.key !== ",") return
    if ("key" in e) e.preventDefault()

    const trimmed = tagInput.trim().replace(/^,+|,+$/g, "")
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)
    try {
      const res = await MediaApi.update(file.id, {
        fileName: fileName.trim() || file.fileName,
        altText: altText.trim() || null,
        caption: caption.trim() || null,
        folder,
        tags,
        isPublic,
      })

      if (res.success && res.data) {
        toast.success("Attachment details saved successfully!")
        onUpdateFile(res.data)
      } else {
        toast.error(res.error || "Failed to update media details")
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save changes")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownload = () => {
    const a = document.createElement("a")
    a.href = file.url
    a.download = file.fileName
    a.target = "_blank"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const folderOptions = Array.from(
    new Set([
      "general",
      "blogs",
      "avatars",
      "templates",
      "documents",
      ...existingFolders.map((f) => f.folder),
    ])
  ).sort()

  const formattedCreated = new Date(file.createdAt).toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[94vh] w-[96vw] max-w-none min-w-[94vw] flex-col gap-0 overflow-hidden border-border p-0 shadow-2xl sm:max-w-none lg:min-w-[88vw] xl:min-w-[1340px] 2xl:min-w-[1500px]">
        {/* Header & Navigation */}
        <div className="flex items-center justify-between border-b border-border/80 bg-muted/20 px-6 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <DialogTitle className="truncate text-base font-bold">
              Attachment Details
            </DialogTitle>
            <Badge
              variant="outline"
              className="font-mono text-[10px] uppercase"
            >
              {file.fileExtension || file.mimeType.split("/")[1] || "FILE"}
            </Badge>
          </div>

          <div className="flex items-center gap-1.5">
            {onPrev && (
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={onPrev}
                disabled={!hasPrev}
                title="Previous media (Left arrow)"
              >
                <ChevronLeft className="size-4" />
              </Button>
            )}
            {onNext && (
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={onNext}
                disabled={!hasNext}
                title="Next media (Right arrow)"
              >
                <ChevronRight className="size-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Dual-Column Body */}
        <div className="grid flex-1 grid-cols-1 divide-y divide-border overflow-y-auto lg:grid-cols-12 lg:divide-x lg:divide-y-0">
          {/* Left Side: Media Preview (Cols 1-8) */}
          <div className="flex min-h-[380px] flex-col items-center justify-center bg-muted/10 p-6 lg:col-span-8 lg:min-h-[580px] lg:p-8">
            <div className="flex h-full max-h-[560px] w-full items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-background/50 shadow-xs">
              <MediaPreview
                url={file.url}
                mimeType={file.mimeType}
                fileName={file.fileName}
                altText={file.altText}
                aspectRatio="auto"
                className="max-h-[560px] object-contain"
              />
            </div>

            {/* Quick Action Pills Below Preview */}
            <div className="mt-5 flex w-full flex-wrap items-center justify-center gap-2.5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleCopy(file.url, "url")}
                className="h-8 gap-1.5 text-xs"
              >
                {copiedType === "url" ? (
                  <Check className="size-3.5 text-emerald-500" />
                ) : (
                  <Copy className="size-3.5" />
                )}
                Copy URL
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  handleCopy(
                    `![${altText || file.fileName}](${file.url})`,
                    "markdown"
                  )
                }
                className="h-8 gap-1.5 text-xs"
              >
                {copiedType === "markdown" ? (
                  <Check className="size-3.5 text-emerald-500" />
                ) : (
                  <FileCode2 className="size-3.5" />
                )}
                Markdown
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  handleCopy(
                    `<img src="${file.url}" alt="${altText || file.fileName}" />`,
                    "html"
                  )
                }
                className="h-8 gap-1.5 text-xs"
              >
                {copiedType === "html" ? (
                  <Check className="size-3.5 text-emerald-500" />
                ) : (
                  <Code className="size-3.5" />
                )}
                HTML
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="h-8 gap-1.5 text-xs"
              >
                <Download className="size-3.5" />
                Download
              </Button>

              <Button
                variant="outline"
                size="sm"
                asChild
                className="h-8 gap-1.5 text-xs"
              >
                <a href={file.url} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-3.5" />
                  View Original
                </a>
              </Button>
            </div>
          </div>

          {/* Right Side: Metadata & Interactive Editing (Cols 9-12) */}
          <div className="flex flex-col justify-between space-y-6 overflow-y-auto bg-card p-6 lg:col-span-4 lg:p-7">
            <div className="space-y-5">
              {/* File Info Block */}
              <div className="space-y-2 rounded-xl border border-border/80 bg-muted/20 p-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-muted-foreground">
                    Uploaded on:
                  </span>
                  <span className="font-mono text-foreground">
                    {formattedCreated}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-muted-foreground">
                    File size:
                  </span>
                  <span className="font-mono font-semibold text-foreground">
                    {file.sizeFormatted}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-muted-foreground">
                    MIME type:
                  </span>
                  <span className="font-mono text-foreground">
                    {file.mimeType}
                  </span>
                </div>
                {file.uploader && (
                  <div className="flex items-center justify-between border-t border-border/60 pt-1">
                    <span className="font-medium text-muted-foreground">
                      Uploaded by:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Avatar className="size-4">
                        <AvatarImage src={file.uploader.avatar || undefined} />
                        <AvatarFallback className="text-[8px]">
                          {file.uploader.name?.slice(0, 2).toUpperCase() ||
                            "AD"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground">
                        {file.uploader.name || file.uploader.email}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Editable Fields */}
              <div className="space-y-4 text-xs">
                {/* File Title */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Title / Display Name
                  </Label>
                  <Input
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="h-8 bg-background text-xs"
                  />
                </div>

                {/* Alt Text (Alternative Text for SEO) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">
                      Alternative Text (Alt Text)
                    </Label>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Info className="size-3 text-primary" /> Crucial for SEO &
                      A11y
                    </span>
                  </div>
                  <Input
                    placeholder="Describe the purpose of this asset..."
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    className="h-8 bg-background text-xs"
                  />
                </div>

                {/* Caption */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Caption</Label>
                  <Textarea
                    placeholder="Optional caption displayed under the asset..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={2}
                    className="min-h-[56px] resize-none bg-background text-xs"
                  />
                </div>

                {/* Folder & Visibility Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1 text-xs font-semibold">
                      <Folder className="size-3 text-primary" /> Folder
                    </Label>
                    <Select value={folder} onValueChange={setFolder}>
                      <SelectTrigger className="h-8 bg-background text-xs">
                        <SelectValue placeholder="Folder" />
                      </SelectTrigger>
                      <SelectContent className="text-xs">
                        {folderOptions.map((f) => (
                          <SelectItem key={f} value={f} className="capitalize">
                            {f}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1 text-xs font-semibold">
                      {isPublic ? (
                        <Globe className="size-3 text-emerald-500" />
                      ) : (
                        <Lock className="size-3 text-amber-500" />
                      )}
                      Visibility
                    </Label>
                    <div className="flex h-8 items-center justify-between rounded-lg border border-border bg-background px-2">
                      <span className="text-[11px] text-muted-foreground">
                        {isPublic ? "Public" : "Private"}
                      </span>
                      <Switch
                        checked={isPublic}
                        onCheckedChange={setIsPublic}
                      />
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1 text-xs font-semibold">
                    <Tag className="size-3 text-primary" /> Tags
                  </Label>
                  <div className="flex min-h-[36px] flex-wrap items-center gap-1.5 rounded-lg border border-border bg-background p-1.5">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="h-5 gap-1 px-1.5 text-[11px] font-normal"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="size-2.5" />
                        </button>
                      </Badge>
                    ))}
                    <input
                      type="text"
                      placeholder={tags.length === 0 ? "Add tags..." : "+"}
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      className="min-w-[80px] flex-1 bg-transparent px-1 text-xs outline-hidden placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between border-t border-border/80 pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteFile(file)}
                className="h-8 gap-1.5 px-2.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
                Delete Permanently
              </Button>

              <Button
                onClick={handleSaveChanges}
                disabled={isSaving}
                size="sm"
                className="h-8 gap-1.5 bg-primary text-xs text-primary-foreground shadow-xs hover:bg-primary/90"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="size-3.5" /> Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
