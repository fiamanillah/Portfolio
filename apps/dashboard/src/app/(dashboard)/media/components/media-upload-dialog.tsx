"use client"

import * as React from "react"
import {
  UploadCloud,
  File,
  X,
  CheckCircle2,
  AlertCircle,
  FolderPlus,
  Loader2,
  Tag,
  Lock,
  Globe,
  Plus,
} from "lucide-react"
import { MediaApi } from "@/lib/api"
import type { MediaFolderStat, MediaFileDTO } from "@workspace/shared"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Switch } from "@workspace/ui/components/switch"
import { Badge } from "@workspace/ui/components/badge"
import { Progress } from "@workspace/ui/components/progress"
import { toast } from "@workspace/ui/components/sonner"

interface UploadFileItem {
  id: string
  file: File
  previewUrl: string
  status: "queued" | "uploading" | "success" | "error"
  progress: number
  error?: string
  uploadedData?: MediaFileDTO
}

interface MediaUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploadSuccess: (newFiles?: MediaFileDTO[]) => void
  existingFolders?: MediaFolderStat[]
  defaultFolder?: string
}

export function MediaUploadDialog({
  open,
  onOpenChange,
  onUploadSuccess,
  existingFolders = [],
  defaultFolder = "general",
}: MediaUploadDialogProps) {
  const [dragOver, setDragOver] = React.useState(false)
  const [uploadQueue, setUploadQueue] = React.useState<UploadFileItem[]>([])
  const [selectedFolder, setSelectedFolder] =
    React.useState<string>(defaultFolder)
  const [customFolder, setCustomFolder] = React.useState<string>("")
  const [isCustomFolder, setIsCustomFolder] = React.useState(false)
  const [tags, setTags] = React.useState<string[]>([])
  const [tagInput, setTagInput] = React.useState("")
  const [isPublic, setIsPublic] = React.useState(true)
  const [isUploading, setIsUploading] = React.useState(false)

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Reset state when dialog opens
  React.useEffect(() => {
    if (open) {
      setUploadQueue([])
      setSelectedFolder(defaultFolder || "general")
      setIsCustomFolder(false)
      setCustomFolder("")
      setTags([])
      setTagInput("")
      setIsPublic(true)
      setIsUploading(false)
    }
  }, [open, defaultFolder])

  const handleFilesAdded = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const newItems: UploadFileItem[] = Array.from(files).map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file: f,
      previewUrl: f.type.startsWith("image/") ? URL.createObjectURL(f) : "",
      status: "queued",
      progress: 0,
    }))

    setUploadQueue((prev) => [...prev, ...newItems])
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    if (e.dataTransfer.files) {
      handleFilesAdded(e.dataTransfer.files)
    }
  }

  const removeQueueItem = (id: string) => {
    setUploadQueue((prev) => {
      const item = prev.find((i) => i.id === id)
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl)
      return prev.filter((i) => i.id !== id)
    })
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

  const handleStartUpload = async () => {
    if (uploadQueue.length === 0) return
    setIsUploading(true)

    const targetFolder = isCustomFolder
      ? customFolder
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, "-") || "general"
      : selectedFolder

    const completedFiles: MediaFileDTO[] = []
    let hasError = false

    for (let i = 0; i < uploadQueue.length; i++) {
      const item = uploadQueue[i]
      if (item.status === "success") continue

      setUploadQueue((prev) =>
        prev.map((it) =>
          it.id === item.id ? { ...it, status: "uploading", progress: 20 } : it
        )
      )

      try {
        const res = await MediaApi.upload(item.file, {
          folder: targetFolder,
          tags,
          isPublic,
          source: "MEDIA_LIBRARY",
          onProgress: (percent) => {
            setUploadQueue((prev) =>
              prev.map((it) =>
                it.id === item.id ? { ...it, progress: percent } : it
              )
            )
          },
        })

        if (res.success && res.data) {
          const uploadedResult = Array.isArray(res.data)
            ? res.data[0]
            : res.data
          completedFiles.push(uploadedResult)
          setUploadQueue((prev) =>
            prev.map((it) =>
              it.id === item.id
                ? {
                    ...it,
                    status: "success",
                    progress: 100,
                    uploadedData: uploadedResult,
                  }
                : it
            )
          )
        } else {
          hasError = true
          setUploadQueue((prev) =>
            prev.map((it) =>
              it.id === item.id
                ? {
                    ...it,
                    status: "error",
                    error: res.error || "Upload failed",
                  }
                : it
            )
          )
        }
      } catch (err: unknown) {
        hasError = true
        setUploadQueue((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? {
                  ...it,
                  status: "error",
                  error: err instanceof Error ? err.message : "Upload failed",
                }
              : it
          )
        )
      }
    }

    setIsUploading(false)

    if (completedFiles.length > 0) {
      toast.success(
        `Successfully uploaded ${completedFiles.length} file${completedFiles.length > 1 ? "s" : ""} to "${targetFolder}"`
      )
      onUploadSuccess(completedFiles)
      if (!hasError) {
        setTimeout(() => {
          onOpenChange(false)
        }, 600)
      }
    } else if (hasError) {
      toast.error("Some files failed to upload. Please review errors.")
    }
  }

  const folderOptions = React.useMemo(() => {
    const list = new Set([
      "general",
      "blogs",
      "avatars",
      "templates",
      "documents",
    ])
    existingFolders.forEach((f) => {
      if (f.folder) list.add(f.folder)
    })
    return Array.from(list).sort()
  }, [existingFolders])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-5 overflow-hidden p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <UploadCloud className="size-5 text-primary" />
            Upload Media Assets
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Drag and drop images, videos, audio, or documents to upload to
            Cloudflare R2 storage.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          {/* Dropzone Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
              dragOver
                ? "scale-[0.99] border-primary bg-primary/10"
                : "border-border/80 bg-muted/10 hover:border-primary/60 hover:bg-muted/20"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                handleFilesAdded(e.target.files)
                if (fileInputRef.current) fileInputRef.current.value = ""
              }}
            />
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
              <UploadCloud className="size-6" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              Drop files here or click to browse
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Supports Images, Video, Audio, PDFs & Documents (Max 50MB per
              file)
            </p>
          </div>

          {/* Upload Configuration Grid */}
          <div className="grid grid-cols-1 gap-4 rounded-xl border border-border/80 bg-card/60 p-4 md:grid-cols-2">
            {/* Target Folder Selector */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-semibold">
                <FolderPlus className="size-3.5 text-primary" />
                Target Folder
              </Label>
              {!isCustomFolder ? (
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedFolder}
                    onValueChange={setSelectedFolder}
                  >
                    <SelectTrigger className="h-8 bg-background text-xs">
                      <SelectValue placeholder="Select folder" />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      {folderOptions.map((folder) => (
                        <SelectItem
                          key={folder}
                          value={folder}
                          className="capitalize"
                        >
                          {folder}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCustomFolder(true)}
                    className="h-8 shrink-0 text-xs"
                    title="Create custom folder"
                  >
                    + New
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="e.g. portfolio-2026"
                    value={customFolder}
                    onChange={(e) => setCustomFolder(e.target.value)}
                    className="h-8 bg-background text-xs"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsCustomFolder(false)
                      setCustomFolder("")
                    }}
                    className="h-8 shrink-0 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            {/* Visibility Toggle */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-semibold">
                {isPublic ? (
                  <Globe className="size-3.5 text-emerald-500" />
                ) : (
                  <Lock className="size-3.5 text-amber-500" />
                )}
                Access Visibility
              </Label>
              <div className="flex h-8 items-center justify-between rounded-lg border border-border/80 bg-background px-3 text-xs">
                <span className="text-xs font-medium text-muted-foreground">
                  {isPublic ? "Public (CDN Enabled)" : "Protected / Private"}
                </span>
                <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              </div>
            </div>

            {/* Tags Input (Span 2 columns) */}
            <div className="space-y-1.5 md:col-span-2">
              <Label className="flex items-center gap-1.5 text-xs font-semibold">
                <Tag className="size-3.5 text-primary" />
                Asset Tags (Optional)
              </Label>
              <div className="flex min-h-[36px] flex-wrap items-center gap-1.5 rounded-lg border border-border/80 bg-background p-1.5">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="h-6 gap-1 px-2 text-xs font-normal"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
                <input
                  type="text"
                  placeholder={
                    tags.length === 0
                      ? "Type a tag and press Enter..."
                      : "Add more..."
                  }
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="min-w-[140px] flex-1 bg-transparent px-1 text-xs outline-hidden placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </div>

          {/* Upload Queue List */}
          {uploadQueue.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1 text-xs font-semibold text-muted-foreground">
                <span>Selected Files ({uploadQueue.length})</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUploadQueue([])}
                  disabled={isUploading}
                  className="h-6 px-2 text-[11px] text-muted-foreground hover:text-destructive"
                >
                  Clear all
                </Button>
              </div>

              <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                {uploadQueue.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg border border-border/80 bg-card p-2.5 text-xs"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/50 bg-muted/40">
                      {item.previewUrl ? (
                        <img
                          src={item.previewUrl}
                          alt={item.file.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <File className="size-5 text-muted-foreground" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="max-w-xs truncate font-medium">
                          {item.file.name}
                        </span>
                        <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                          {(item.file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>

                      {item.status === "uploading" && (
                        <Progress value={item.progress} className="h-1.5" />
                      )}

                      {item.status === "error" && (
                        <p className="flex items-center gap-1 text-[11px] text-destructive">
                          <AlertCircle className="size-3 shrink-0" />
                          {item.error || "Upload failed"}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      {item.status === "success" ? (
                        <CheckCircle2 className="size-4 text-emerald-500" />
                      ) : item.status === "uploading" ? (
                        <Loader2 className="size-4 animate-spin text-primary" />
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeQueueItem(item.id)}
                          disabled={isUploading}
                          className="size-6 text-muted-foreground hover:text-destructive"
                        >
                          <X className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="items-center border-t border-border pt-3 sm:justify-between">
          <span className="text-xs text-muted-foreground">
            {uploadQueue.length > 0
              ? `${uploadQueue.length} file${uploadQueue.length > 1 ? "s" : ""} queued`
              : "No files queued"}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
              className="text-xs"
            >
              Close
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleStartUpload}
              disabled={uploadQueue.length === 0 || isUploading}
              className="gap-1.5 bg-primary text-xs text-primary-foreground shadow-xs hover:bg-primary/90"
            >
              {isUploading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <UploadCloud className="size-3.5" /> Upload to R2
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
