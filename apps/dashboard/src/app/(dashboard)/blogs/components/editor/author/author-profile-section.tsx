"use client"

import * as React from "react"
import { User, FolderOpen, UploadCloud, Loader2, Sparkles } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { MediaPickerModal } from "@/app/(dashboard)/media/components/media-picker-modal"
import { MediaApi } from "@/lib/api"
import type { MediaFileDTO } from "@workspace/shared"
import { toast } from "@workspace/ui/components/sonner"

interface AuthorProfileSectionProps {
  authorName: string
  setAuthorName: (val: string) => void
  authorRole: string
  setAuthorRole: (val: string) => void
  authorAvatar: string
  setAuthorAvatar: (val: string) => void
  authorTwitter?: string
}

export function AuthorProfileSection({
  authorName,
  setAuthorName,
  authorRole,
  setAuthorRole,
  authorAvatar,
  setAuthorAvatar,
  authorTwitter,
}: AuthorProfileSectionProps) {
  const [isPickerOpen, setIsPickerOpen] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleMediaSelect = (selected: MediaFileDTO | MediaFileDTO[]) => {
    const file = Array.isArray(selected) ? selected[0] : selected
    if (!file) return
    setAuthorAvatar(file.url)
    toast.success("Author avatar selected")
  }

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    try {
      const res = await MediaApi.upload(Array.from(files), {
        folder: "authors",
        source: "AUTHOR_AVATAR",
      })

      if (res.success && res.data) {
        const file = Array.isArray(res.data) ? res.data[0] : res.data
        setAuthorAvatar(file.url)
        toast.success("Author avatar uploaded successfully!")
      } else {
        toast.error(res.error || "Avatar upload failed")
      }
    } catch (err: any) {
      toast.error(err?.message || "Avatar upload failed")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-4">
      {/* Live Author Card Preview */}
      <div className="p-4 rounded-xl border border-border/80 bg-background/80 flex items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 border-2 border-primary/40 shadow-xs">
            <AvatarImage src={authorAvatar} alt={authorName} />
            <AvatarFallback className="font-mono font-bold">
              {(authorName || "FA").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <span>{authorName || "Author Name"}</span>
              <span className="border border-primary/30 bg-primary/10 text-primary px-1.5 py-0.2 font-mono text-[9px] font-semibold uppercase">
                Author
              </span>
            </div>
            <div className="text-xs text-muted-foreground">{authorRole || "Software Engineer & DevOps"}</div>
            {authorTwitter && (
              <div className="text-[11px] text-primary font-mono mt-0.5">{authorTwitter}</div>
            )}
          </div>
        </div>

        <span className="text-[11px] font-mono text-muted-foreground">// AUTHOR PREVIEW</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-primary" /> Author Name *
          </label>
          <Input
            placeholder="Fi Amanillah"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="text-xs h-9 bg-background border-border/90 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-xs"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Author Role / Title
          </label>
          <Input
            placeholder="Full Stack & DevOps Engineer"
            value={authorRole}
            onChange={(e) => setAuthorRole(e.target.value)}
            className="text-xs h-9 bg-background border-border/90 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-xs"
          />
        </div>
      </div>

      {/* Avatar with Library Picker & Direct Upload */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Author Avatar Photo
          </label>
          <div className="flex items-center gap-1.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleDirectUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="h-7 text-xs px-2.5 gap-1 bg-background"
            >
              {isUploading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <UploadCloud className="h-3 w-3 text-primary" />
              )}
              Upload Photo
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPickerOpen(true)}
              className="h-7 text-xs px-2.5 gap-1 bg-background"
            >
              <FolderOpen className="h-3 w-3 text-primary" /> Library
            </Button>
          </div>
        </div>

        <Input
          placeholder="/fi.png or https://..."
          value={authorAvatar}
          onChange={(e) => setAuthorAvatar(e.target.value)}
          className="text-xs font-mono h-9 bg-background border-border/90 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-xs"
        />
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        onSelect={handleMediaSelect}
        defaultFolder="authors"
        title="Select Author Avatar Photo"
        buttonText="Use as Author Avatar"
      />
    </div>
  )
}
