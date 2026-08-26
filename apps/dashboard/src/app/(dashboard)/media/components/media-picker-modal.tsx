"use client"

import * as React from "react"
import {
  Image as ImageIcon,
  UploadCloud,
  Search,
  Check,
  Filter,
  CheckCircle2,
  FolderOpen,
} from "lucide-react"
import { MediaApi } from "@/lib/api"
import type { MediaFileDTO, MediaFolderStat } from "@workspace/shared"
import { MediaPreview } from "./media-preview"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { toast } from "@workspace/ui/components/sonner"

interface MediaPickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (selected: MediaFileDTO | MediaFileDTO[]) => void
  multiple?: boolean
  mimeTypeFilter?: string
  defaultFolder?: string
  title?: string
  buttonText?: string
}

export function MediaPickerModal({
  open,
  onOpenChange,
  onSelect,
  multiple = false,
  mimeTypeFilter = "image/*",
  defaultFolder,
  title = "Select Media Asset",
  buttonText = "Insert Selected Asset",
}: MediaPickerModalProps) {
  const [activeTab, setActiveTab] = React.useState<"library" | "upload">(
    "library"
  )
  const [files, setFiles] = React.useState<MediaFileDTO[]>([])
  const [folders, setFolders] = React.useState<MediaFolderStat[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [folderFilter, setFolderFilter] = React.useState<string>(
    defaultFolder || "all"
  )
  const [selectedItems, setSelectedItems] = React.useState<MediaFileDTO[]>([])

  // Upload tab states
  const [uploading, setUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const loadMedia = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const [filesRes, statsRes] = await Promise.all([
        MediaApi.getAll({
          limit: 50,
          mimeType: mimeTypeFilter !== "all" ? mimeTypeFilter : undefined,
          folder: folderFilter !== "all" ? folderFilter : undefined,
          search: searchQuery.trim() || undefined,
          sortBy: "createdAt",
          sortOrder: "desc",
        }),
        MediaApi.getStats(),
      ])

      if (filesRes.success && filesRes.data) {
        setFiles(filesRes.data)
      }
      if (statsRes.success && statsRes.data) {
        setFolders(statsRes.data.folders || [])
      }
    } catch {
      toast.error("Failed to load media files")
    } finally {
      setIsLoading(false)
    }
  }, [mimeTypeFilter, folderFilter, searchQuery])

  React.useEffect(() => {
    if (open) {
      loadMedia()
      setSelectedItems([])
      setActiveTab("library")
    }
  }, [open, loadMedia])

  const toggleSelectItem = (file: MediaFileDTO) => {
    if (multiple) {
      if (selectedItems.some((i) => i.id === file.id)) {
        setSelectedItems(selectedItems.filter((i) => i.id !== file.id))
      } else {
        setSelectedItems([...selectedItems, file])
      }
    } else {
      setSelectedItems([file])
    }
  }

  const handleConfirmSelect = () => {
    if (selectedItems.length === 0) return
    onSelect(multiple ? selectedItems : selectedItems[0])
    onOpenChange(false)
  }

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files
    if (!uploadedFiles || uploadedFiles.length === 0) return

    setUploading(true)
    try {
      const res = await MediaApi.upload(Array.from(uploadedFiles), {
        folder: defaultFolder || "general",
        source: "PICKER",
      })

      if (res.success && res.data) {
        const resultFiles = Array.isArray(res.data) ? res.data : [res.data]
        toast.success("Uploaded and selected successfully!")
        onSelect(multiple ? resultFiles : resultFiles[0])
        onOpenChange(false)
      } else {
        toast.error(res.error || "Upload failed")
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const activeItem = selectedItems[selectedItems.length - 1] || null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-[95vw] max-w-6xl flex-col gap-0 overflow-hidden border border-border/80 bg-card p-0 shadow-2xl sm:min-w-[780px] md:min-w-[920px] lg:min-w-[1040px]">
        <DialogHeader className="border-b border-border/80 bg-muted/20 px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <ImageIcon className="size-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Browse and select media from your Cloudflare R2 library or upload
            new files.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as "library" | "upload")}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="border-b border-border bg-card px-6">
            <TabsList className="h-10 gap-4 bg-transparent p-0">
              <TabsTrigger
                value="library"
                className="rounded-none px-2 text-xs font-semibold data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Media Library
              </TabsTrigger>
              <TabsTrigger
                value="upload"
                className="rounded-none px-2 text-xs font-semibold data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Upload Files
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="library"
            className="m-0 flex flex-1 overflow-hidden"
          >
            {/* Library Grid Area */}
            <div className="flex flex-1 flex-col overflow-hidden p-5">
              {/* Search & Folder Filter Bar */}
              <div className="mb-4 flex items-center gap-3">
                <div className="relative max-w-sm flex-1">
                  <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search media..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 bg-background pl-8 text-xs"
                  />
                </div>

                <Select value={folderFilter} onValueChange={setFolderFilter}>
                  <SelectTrigger className="h-8 w-[140px] bg-background text-xs">
                    <FolderOpen className="mr-1 size-3.5 text-muted-foreground" />
                    <SelectValue placeholder="Folder" />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    <SelectItem value="all">All Folders</SelectItem>
                    {folders.map((f) => (
                      <SelectItem
                        key={f.folder}
                        value={f.folder}
                        className="capitalize"
                      >
                        {f.folder} ({f.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Grid of items */}
              <div className="flex-1 overflow-y-auto pr-1">
                {isLoading ? (
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                    {Array.from({ length: 15 }).map((_, i) => (
                      <Skeleton key={i} className="aspect-square rounded-lg" />
                    ))}
                  </div>
                ) : files.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                    {files.map((file) => {
                      const isSelected = selectedItems.some(
                        (i) => i.id === file.id
                      )
                      return (
                        <div
                          key={file.id}
                          onClick={() => toggleSelectItem(file)}
                          className={`group relative aspect-square cursor-pointer overflow-hidden rounded-lg border transition-all select-none ${
                            isSelected
                              ? "border-primary bg-primary/10 ring-2 ring-primary"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <MediaPreview
                            url={file.url}
                            mimeType={file.mimeType}
                            fileName={file.fileName}
                            altText={file.altText}
                            aspectRatio="square"
                            thumbnailOnly
                          />
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
                              <Check className="size-3" />
                            </div>
                          )}
                          <div className="absolute inset-x-0 bottom-0 truncate bg-black/60 p-1 px-1.5 text-[10px] text-white backdrop-blur-xs">
                            {file.fileName}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex h-48 flex-col items-center justify-center text-center text-xs text-muted-foreground">
                    <p>No media files found matching the criteria.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Preview & Details Sidebar */}
            {activeItem && (
              <div className="flex w-64 flex-col justify-between space-y-4 overflow-y-auto border-l border-border/80 bg-muted/10 p-4 text-xs">
                <div className="space-y-3">
                  <span className="block font-semibold text-foreground">
                    Selected Attachment
                  </span>
                  <div className="aspect-[4/3] overflow-hidden rounded-lg border border-border/80 bg-background">
                    <MediaPreview
                      url={activeItem.url}
                      mimeType={activeItem.mimeType}
                      fileName={activeItem.fileName}
                      altText={activeItem.altText}
                      aspectRatio="auto"
                      thumbnailOnly
                    />
                  </div>

                  <div className="space-y-1.5 text-muted-foreground">
                    <p className="truncate font-semibold text-foreground">
                      {activeItem.fileName}
                    </p>
                    <p className="font-mono text-[11px]">
                      {activeItem.sizeFormatted}
                    </p>
                    <p className="font-mono text-[11px]">
                      {activeItem.mimeType}
                    </p>
                    {activeItem.altText && (
                      <p className="text-[11px] italic">
                        Alt: "{activeItem.altText}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="upload"
            className="m-0 flex flex-1 flex-col items-center justify-center p-8"
          >
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full max-w-md cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/80 bg-muted/10 p-12 text-center transition-colors hover:border-primary hover:bg-muted/20"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple={multiple}
                className="hidden"
                onChange={handleDirectUpload}
              />
              <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UploadCloud className="size-7" />
              </div>
              <p className="text-sm font-semibold">
                Click to upload or drag files here
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Asset will be saved to Cloudflare R2 and immediately selected.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="items-center border-t border-border bg-muted/20 px-6 py-3 sm:justify-between">
          <span className="font-mono text-xs text-muted-foreground">
            {selectedItems.length > 0
              ? `${selectedItems.length} asset${selectedItems.length > 1 ? "s" : ""} selected`
              : "No asset selected"}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmSelect}
              disabled={selectedItems.length === 0}
              className="gap-1.5 bg-primary text-xs text-primary-foreground shadow-xs hover:bg-primary/90"
            >
              <CheckCircle2 className="size-3.5" />
              {buttonText}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
