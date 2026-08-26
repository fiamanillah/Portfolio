"use client"

import * as React from "react"
import {
  User,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  UploadCloud,
  Loader2,
} from "lucide-react"
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

interface AuthorSectionProps {
  authorName: string
  setAuthorName: (val: string) => void
  authorRole: string
  setAuthorRole: (val: string) => void
  authorAvatar: string
  setAuthorAvatar: (val: string) => void
  authorTwitter: string
  setAuthorTwitter: (val: string) => void
  authorLinkedin: string
  setAuthorLinkedin: (val: string) => void
  authorGithub: string
  setAuthorGithub: (val: string) => void
  onResetToUserProfile?: () => void
}

export function AuthorSection({
  authorName,
  setAuthorName,
  authorRole,
  setAuthorRole,
  authorAvatar,
  setAuthorAvatar,
  authorTwitter,
  setAuthorTwitter,
  authorLinkedin,
  setAuthorLinkedin,
  authorGithub,
  setAuthorGithub,
  onResetToUserProfile,
}: AuthorSectionProps) {
  const [isOpen, setIsOpen] = React.useState(false)
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
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Avatar upload failed")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-3">
      {/* Compact Author Summary */}
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-background/60 p-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="h-10 w-10 shrink-0 border border-primary/30">
            <AvatarImage src={authorAvatar} alt={authorName} />
            <AvatarFallback className="font-mono text-xs font-bold">
              {(authorName || "FA").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate text-xs font-bold text-foreground">
              {authorName || "Fi Amanillah"}
            </div>
            <div className="truncate text-[11px] text-muted-foreground">
              {authorRole || "Full Stack Developer"}
            </div>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="h-8 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <span>{isOpen ? "Close" : "Edit"}</span>
          {isOpen ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>

      {/* Collapsible Edit Form */}
      {isOpen && (
        <div className="animate-in space-y-3 rounded-lg border border-border/80 bg-muted/20 p-3.5 text-xs duration-200 fade-in-50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              Author Persona Overrides
            </span>
            {onResetToUserProfile && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onResetToUserProfile}
                className="h-6 px-1.5 font-mono text-[10px] text-primary hover:bg-primary/10"
              >
                Reset to My Profile
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">
                Name
              </label>
              <Input
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Fi Amanillah"
                className="h-8 bg-background text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">
                Role / Headline
              </label>
              <Input
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                placeholder="Full Stack Developer"
                className="h-8 bg-background text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-muted-foreground">
                Avatar Photo URL
              </label>
              <div className="flex items-center gap-1">
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
                  className="h-6 gap-1 px-1.5 text-[10px]"
                >
                  {isUploading ? (
                    <Loader2 className="h-2.5 w-2.5 animate-spin" />
                  ) : (
                    <UploadCloud className="h-2.5 w-2.5 text-primary" />
                  )}
                  Upload
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPickerOpen(true)}
                  className="h-6 gap-1 px-1.5 text-[10px]"
                >
                  <FolderOpen className="h-2.5 w-2.5 text-primary" /> Library
                </Button>
              </div>
            </div>
            <Input
              value={authorAvatar}
              onChange={(e) => setAuthorAvatar(e.target.value)}
              placeholder="/fi.png or https://..."
              className="h-8 bg-background font-mono text-xs"
            />
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-muted-foreground">
                Twitter / X
              </label>
              <Input
                value={authorTwitter}
                onChange={(e) => setAuthorTwitter(e.target.value)}
                placeholder="@fiamanillah"
                className="h-8 bg-background text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-muted-foreground">
                LinkedIn
              </label>
              <Input
                value={authorLinkedin}
                onChange={(e) => setAuthorLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="h-8 bg-background text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-muted-foreground">
                GitHub
              </label>
              <Input
                value={authorGithub}
                onChange={(e) => setAuthorGithub(e.target.value)}
                placeholder="https://github.com/..."
                className="h-8 bg-background text-xs"
              />
            </div>
          </div>
        </div>
      )}

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
