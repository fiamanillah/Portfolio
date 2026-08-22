"use client"

import * as React from "react"
import { User, FolderOpen, UploadCloud, Loader2, Sparkles } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
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
      <div className="flex items-center justify-between gap-4 rounded-xl border border-border/80 bg-background/80 p-4 shadow-xs">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 border-2 border-primary/40 shadow-xs">
            <AvatarImage src={authorAvatar} alt={authorName} />
            <AvatarFallback className="font-mono font-bold">
              {(authorName || "FA").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
              <span>{authorName || "Author Name"}</span>
              <span className="py-0.2 border border-primary/30 bg-primary/10 px-1.5 font-mono text-[9px] font-semibold text-primary uppercase">
                Author
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {authorRole || "Software Engineer & DevOps"}
            </div>
            {authorTwitter && (
              <div className="mt-0.5 font-mono text-[11px] text-primary">
                {authorTwitter}
              </div>
            )}
          </div>
        </div>

        <span className="font-mono text-[11px] text-muted-foreground">
          // AUTHOR PREVIEW
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
            <User className="h-3.5 w-3.5 text-primary" /> Author Name *
          </label>
          <Input
            placeholder="Fi Amanillah"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="h-9 border-border/90 bg-background text-xs shadow-xs hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
            Author Role / Title
          </label>
          <Input
            placeholder="Full Stack Developer"
            value={authorRole}
            onChange={(e) => setAuthorRole(e.target.value)}
            className="h-9 border-border/90 bg-background text-xs shadow-xs hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Avatar with Library Picker & Direct Upload */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
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
              className="h-7 gap-1 bg-background px-2.5 text-xs"
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
              className="h-7 gap-1 bg-background px-2.5 text-xs"
            >
              <FolderOpen className="h-3 w-3 text-primary" /> Library
            </Button>
          </div>
        </div>

        <Input
          placeholder="/fi.png or https://..."
          value={authorAvatar}
          onChange={(e) => setAuthorAvatar(e.target.value)}
          className="h-9 border-border/90 bg-background font-mono text-xs shadow-xs hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20"
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
