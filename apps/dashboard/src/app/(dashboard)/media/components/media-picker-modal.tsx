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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
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
  const [activeTab, setActiveTab] = React.useState<"library" | "upload">("library")
  const [files, setFiles] = React.useState<MediaFileDTO[]>([])
  const [folders, setFolders] = React.useState<MediaFolderStat[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [folderFilter, setFolderFilter] = React.useState<string>(defaultFolder || "all")
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
    } catch (err: any) {
      toast.error(err.message || "Upload failed")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const activeItem = selectedItems[selectedItems.length - 1] || null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:min-w-[780px] md:min-w-[920px] lg:min-w-[1040px] max-w-6xl max-h-[90vh] flex flex-col p-0 overflow-hidden gap-0 bg-card border border-border/80 shadow-2xl">
        <DialogHeader className="px-6 py-4 border-b border-border/80 bg-muted/20">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <ImageIcon className="size-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Browse and select media from your Cloudflare R2 library or upload new files.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as any)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="px-6 border-b border-border bg-card">
            <TabsList className="h-10 bg-transparent p-0 gap-4">
              <TabsTrigger
                value="library"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-2 text-xs font-semibold"
              >
                Media Library
              </TabsTrigger>
              <TabsTrigger
                value="upload"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-2 text-xs font-semibold"
              >
                Upload Files
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="library" className="flex-1 flex overflow-hidden m-0">
            {/* Library Grid Area */}
            <div className="flex-1 flex flex-col p-5 overflow-hidden">
              {/* Search & Folder Filter Bar */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search media..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-8 text-xs bg-background"
                  />
                </div>

                <Select value={folderFilter} onValueChange={setFolderFilter}>
                  <SelectTrigger className="h-8 w-[140px] text-xs bg-background">
                    <FolderOpen className="size-3.5 mr-1 text-muted-foreground" />
                    <SelectValue placeholder="Folder" />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    <SelectItem value="all">All Folders</SelectItem>
                    {folders.map((f) => (
                      <SelectItem key={f.folder} value={f.folder} className="capitalize">
                        {f.folder} ({f.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Grid of items */}
              <div className="flex-1 overflow-y-auto pr-1">
                {isLoading ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {Array.from({ length: 15 }).map((_, i) => (
                      <Skeleton key={i} className="aspect-square rounded-lg" />
                    ))}
                  </div>
                ) : files.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {files.map((file) => {
                      const isSelected = selectedItems.some((i) => i.id === file.id)
                      return (
                        <div
                          key={file.id}
                          onClick={() => toggleSelectItem(file)}
                          className={`group relative aspect-square rounded-lg overflow-hidden border cursor-pointer select-none transition-all ${
                            isSelected
                              ? "border-primary ring-2 ring-primary bg-primary/10"
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
                            <div className="absolute top-1.5 right-1.5 size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                              <Check className="size-3" />
                            </div>
                          )}
                          <div className="absolute bottom-0 inset-x-0 p-1 bg-black/60 backdrop-blur-xs text-[10px] text-white truncate px-1.5">
                            {file.fileName}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="h-48 flex flex-col items-center justify-center text-center text-xs text-muted-foreground">
                    <p>No media files found matching the criteria.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Preview & Details Sidebar */}
            {activeItem && (
              <div className="w-64 border-l border-border/80 bg-muted/10 p-4 flex flex-col justify-between overflow-y-auto text-xs space-y-4">
                <div className="space-y-3">
                  <span className="font-semibold text-foreground block">
                    Selected Attachment
                  </span>
                  <div className="aspect-[4/3] rounded-lg overflow-hidden border border-border/80 bg-background">
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
                    <p className="font-semibold text-foreground truncate">{activeItem.fileName}</p>
                    <p className="font-mono text-[11px]">{activeItem.sizeFormatted}</p>
                    <p className="font-mono text-[11px]">{activeItem.mimeType}</p>
                    {activeItem.altText && (
                      <p className="text-[11px] italic">Alt: "{activeItem.altText}"</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="flex-1 p-8 flex flex-col items-center justify-center m-0">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border/80 hover:border-primary rounded-xl cursor-pointer bg-muted/10 hover:bg-muted/20 text-center max-w-md w-full transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple={multiple}
                className="hidden"
                onChange={handleDirectUpload}
              />
              <div className="size-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                <UploadCloud className="size-7" />
              </div>
              <p className="text-sm font-semibold">Click to upload or drag files here</p>
              <p className="text-xs text-muted-foreground mt-1">
                Asset will be saved to Cloudflare R2 and immediately selected.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="px-6 py-3 border-t border-border bg-muted/20 sm:justify-between items-center">
          <span className="text-xs text-muted-foreground font-mono">
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
              className="text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
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
