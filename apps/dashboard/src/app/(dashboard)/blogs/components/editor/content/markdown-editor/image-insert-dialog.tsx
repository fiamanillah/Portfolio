"use client"

import * as React from "react"
import {
  ImageIcon,
  UploadCloud,
  FolderOpen,
  Link as LinkIcon,
  Loader2,
  Check,
} from "lucide-react"
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
import { MediaPickerModal } from "@/app/(dashboard)/media/components/media-picker-modal"
import { MediaApi } from "@/lib/api"
import type { MediaFileDTO } from "@workspace/shared"
import { toast } from "@workspace/ui/components/sonner"

interface ImageInsertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInsert: (imageMarkdown: string) => void
}

export function ImageInsertDialog({
  open,
  onOpenChange,
  onInsert,
}: ImageInsertDialogProps) {
  const [activeTab, setActiveTab] = React.useState<"media" | "upload" | "url">("media")
  const [imageUrl, setImageUrl] = React.useState("")
  const [altText, setAltText] = React.useState("")
  const [caption, setCaption] = React.useState("")
  const [isPickerOpen, setIsPickerOpen] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (open) {
      setImageUrl("")
      setAltText("")
      setCaption("")
      setActiveTab("media")
    }
  }, [open])

  const handleMediaSelect = (selected: MediaFileDTO | MediaFileDTO[]) => {
    const file = Array.isArray(selected) ? selected[0] : selected
    if (!file) return
    setImageUrl(file.url)
    if (file.altText && !altText) setAltText(file.altText)
    if (file.caption && !caption) setCaption(file.caption)
    toast.success(`Selected '${file.fileName}' from Media Library`)
  }

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    try {
      const res = await MediaApi.upload(Array.from(files), {
        folder: "blogs",
        source: "BLOG_CONTENT",
      })

      if (res.success && res.data) {
        const file = Array.isArray(res.data) ? res.data[0] : res.data
        setImageUrl(file.url)
        if (!altText) setAltText(file.fileName.replace(/\.[^/.]+$/, ""))
        toast.success("Image uploaded successfully!")
      } else {
        toast.error(res.error || "Upload failed")
      }
    } catch (err: any) {
      toast.error(err?.message || "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  const handleConfirm = () => {
    if (!imageUrl.trim()) {
      toast.error("Please provide or select an image URL")
      return
    }

    const cleanAlt = altText.trim() || "Illustration"
    let snippet = `![${cleanAlt}](${imageUrl.trim()}`
    if (caption.trim()) {
      snippet += ` "${caption.trim()}"`
    }
    snippet += ")"

    onInsert(snippet)
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] sm:min-w-[620px] md:min-w-[700px] max-w-2xl bg-card border border-border/80 p-0 overflow-hidden shadow-xl gap-0">
          <DialogHeader className="px-6 py-4 border-b border-border/80 bg-muted/20">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              Insert Article Image / Diagram
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select an asset from your Media Library, upload a new diagram, or specify an external URL.
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as any)}
            className="w-full flex flex-col"
          >
            <div className="px-6 border-b border-border/80 bg-muted/10">
              <TabsList className="bg-transparent h-10 p-0 gap-4">
                <TabsTrigger
                  value="media"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-2 font-medium text-xs gap-1.5"
                >
                  <FolderOpen className="h-3.5 w-3.5" /> Media Library
                </TabsTrigger>
                <TabsTrigger
                  value="upload"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-2 font-medium text-xs gap-1.5"
                >
                  <UploadCloud className="h-3.5 w-3.5" /> Direct Upload
                </TabsTrigger>
                <TabsTrigger
                  value="url"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-2 font-medium text-xs gap-1.5"
                >
                  <LinkIcon className="h-3.5 w-3.5" /> Web / Asset URL
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6 space-y-4">
              {/* TAB 1: Media Library */}
              <TabsContent value="media" className="m-0 space-y-3">
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsPickerOpen(true)}
                    className="h-10 text-xs font-semibold gap-2 bg-background border-border/90 hover:border-primary/50"
                  >
                    <FolderOpen className="h-4 w-4 text-primary" /> Browse Cloudflare R2 Media
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {imageUrl ? "✓ Image selected from library" : "Choose from existing uploaded assets"}
                  </span>
                </div>

                {imageUrl && (
                  <div className="relative rounded-lg overflow-hidden border border-border/80 bg-muted/40 aspect-[21/9] max-h-48">
                    <img src={imageUrl} alt="Selected preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </TabsContent>

              {/* TAB 2: Direct Upload */}
              <TabsContent value="upload" className="m-0 space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleDirectUpload}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl border-2 border-dashed border-border/90 hover:border-primary/70 p-8 text-center text-xs text-muted-foreground bg-background/50 hover:bg-background/80 cursor-pointer transition-colors space-y-2 shadow-xs"
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="font-semibold text-foreground">Uploading image to R2 storage...</span>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="h-8 w-8 mx-auto text-primary" />
                      <div className="font-semibold text-foreground">Click to browse or drag file here</div>
                      <p className="text-[11px] text-muted-foreground">Supports PNG, JPG, WebP, SVG up to 10MB</p>
                    </>
                  )}
                </div>

                {imageUrl && (
                  <div className="relative rounded-lg overflow-hidden border border-border/80 bg-muted/40 aspect-[21/9] max-h-48">
                    <img src={imageUrl} alt="Upload preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </TabsContent>

              {/* TAB 3: Direct URL */}
              <TabsContent value="url" className="m-0 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Image Source URL *
                </label>
                <Input
                  placeholder="https://images.unsplash.com/... or /assets/images/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="text-xs font-mono h-9 bg-background border-border/90 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-xs"
                />
              </TabsContent>

              {/* Metadata Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-border/80">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Alt Text (Accessibility & SEO)
                  </label>
                  <Input
                    placeholder="e.g. WebSocket connection cluster topology diagram"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    className="text-xs h-9 bg-background border-border/90 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Figcaption Caption (Optional)
                  </label>
                  <Input
                    placeholder="e.g. Figure 1: Horizontal scaling architecture"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="text-xs h-9 bg-background border-border/90 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-xs"
                  />
                </div>
              </div>
            </div>
          </Tabs>

          <DialogFooter className="px-6 py-3 border-t border-border/80 bg-muted/20 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-8 bg-background"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirm}
              disabled={!imageUrl.trim() || isUploading}
              className="text-xs h-8 gap-1.5 shadow-xs"
            >
              <Check className="h-3.5 w-3.5" /> Insert into Markdown
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Media Picker Modal */}
      <MediaPickerModal
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        onSelect={handleMediaSelect}
        defaultFolder="blogs"
        title="Select Image from Library"
        buttonText="Select Image"
      />
    </>
  )
}
