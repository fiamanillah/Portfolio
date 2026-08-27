"use client"

import * as React from "react"
import {
  User,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  UploadCloud,
  Loader2,
  Users,
  CheckCircle2,
  ExternalLink,
  X,
  Sparkles,
} from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { MediaPickerModal } from "@/app/(dashboard)/media/components/media-picker-modal"
import { AuthorSelectorDialog } from "./author-selector-dialog"
import { MediaApi } from "@/lib/api"
import type { MediaFileDTO, AuthUser } from "@workspace/shared"
import { toast } from "@workspace/ui/components/sonner"

interface AuthorSectionProps {
  authorId?: string | null
  setAuthorId?: (val: string | null) => void
  authorUsername?: string | null
  setAuthorUsername?: (val: string | null) => void
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
  authorId,
  setAuthorId,
  authorUsername,
  setAuthorUsername,
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
  const [isAuthorSelectorOpen, setIsAuthorSelectorOpen] = React.useState(false)
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

  const handleSelectRegisteredUser = (user: AuthUser) => {
    if (setAuthorId) setAuthorId(user.id)
    if (setAuthorUsername) setAuthorUsername(user.username)
    setAuthorName(user.name)
    setAuthorRole(user.headline || user.role || "Full Stack Developer")
    setAuthorAvatar(user.avatar || "")
    setAuthorTwitter(user.twitterUrl || "")
    setAuthorLinkedin(user.linkedinUrl || "")
    setAuthorGithub(user.githubUrl || "")
    toast.success(`Author set to ${user.name} (@${user.username})`)
  }

  const handleUnlinkUser = () => {
    if (setAuthorId) setAuthorId(null)
    if (setAuthorUsername) setAuthorUsername(null)
    toast.info("Unlinked user reference (custom persona active)")
  }

  return (
    <div className="space-y-3">
      {/* Compact Author Summary */}
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-background/60 p-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="h-10 w-10 shrink-0 border border-primary/30">
            <AvatarImage src={authorAvatar || undefined} alt={authorName} />
            <AvatarFallback className="font-mono text-xs font-bold">
              {(authorName || "FA").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-xs font-bold text-foreground">
                {authorName || "No Author Assigned"}
              </span>
              {authorId && (
                <span className="inline-flex items-center gap-0.5 rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-1 font-mono text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  {authorUsername ? `@${authorUsername}` : "Verified User"}
                </span>
              )}
            </div>
            <div className="truncate text-[11px] text-muted-foreground">
              {authorRole || "Custom Author Persona"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAuthorSelectorOpen(true)}
            className="h-8 gap-1 px-2.5 text-xs bg-background hover:border-primary/50"
          >
            <Users className="h-3.5 w-3.5 text-primary" />
            <span>Select User</span>
          </Button>

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
      </div>

      {/* Linked User Status Bar */}
      {authorId && (
        <div className="flex items-center justify-between gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1.5 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span className="font-mono text-[11px]">
              Linked to user account:{" "}
              <strong className="text-foreground">
                {authorUsername ? `@${authorUsername}` : authorId.slice(0, 8)}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {authorUsername && (
              <a
                href={`/authors/${authorUsername}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-mono text-[10px] text-primary hover:underline"
              >
                <span>View Public Profile</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            )}
            <button
              type="button"
              onClick={handleUnlinkUser}
              className="inline-flex items-center gap-0.5 font-mono text-[10px] text-muted-foreground hover:text-destructive transition-colors"
              title="Unlink and make custom persona"
            >
              <X className="h-2.5 w-2.5" /> Unlink
            </button>
          </div>
        </div>
      )}

      {/* Collapsible Edit Form */}
      {isOpen && (
        <div className="animate-in space-y-3 rounded-lg border border-border/80 bg-muted/20 p-3.5 text-xs duration-200 fade-in-50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              Author Persona Details
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAuthorSelectorOpen(true)}
                className="h-6 gap-1 px-2 font-mono text-[10px] text-primary hover:bg-primary/10"
              >
                <Users className="h-3 w-3" /> Select Registered User
              </Button>
              {onResetToUserProfile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onResetToUserProfile}
                  className="h-6 px-1.5 font-mono text-[10px] text-muted-foreground hover:text-foreground"
                >
                  Reset to Me
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">
                Author Display Name *
              </label>
              <Input
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Alex Johnson"
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
                placeholder="e.g. Distributed Systems Engineer"
                className="h-8 bg-background text-xs"
              />
            </div>
          </div>

          {/* Avatar Photo Section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-muted-foreground">
                Author Avatar Photo
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
                  className="h-6 gap-1 px-2 text-[10px]"
                >
                  {isUploading ? (
                    <Loader2 className="h-2.5 w-2.5 animate-spin" />
                  ) : (
                    <UploadCloud className="h-2.5 w-2.5 text-primary" />
                  )}
                  Upload Photo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPickerOpen(true)}
                  className="h-6 gap-1 px-2 text-[10px]"
                >
                  <FolderOpen className="h-2.5 w-2.5 text-primary" /> Library
                </Button>
              </div>
            </div>

            {authorAvatar ? (
              <div className="flex items-center gap-2 rounded-md border border-border/80 bg-background p-1.5">
                <Avatar className="h-8 w-8 shrink-0 border border-primary/30">
                  <AvatarImage src={authorAvatar} alt={authorName} />
                  <AvatarFallback className="font-mono text-[10px] font-bold">
                    {(authorName || "FA").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Input
                  value={authorAvatar}
                  onChange={(e) => setAuthorAvatar(e.target.value)}
                  placeholder="https://... or /assets/..."
                  className="h-7 flex-1 border-0 bg-transparent font-mono text-[11px] focus-visible:ring-0 p-0"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setAuthorAvatar("")}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  title="Remove avatar"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border/90 bg-background/50 p-3 text-center transition-colors hover:border-primary/60 hover:bg-muted/30"
              >
                <UploadCloud className="h-4 w-4 text-muted-foreground" />
                <span className="text-[11px] font-medium text-foreground">
                  No avatar assigned. Click to upload or select from library.
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  PNG, JPG, WebP, SVG up to 5MB
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-muted-foreground">
                Twitter / X
              </label>
              <Input
                value={authorTwitter}
                onChange={(e) => setAuthorTwitter(e.target.value)}
                placeholder="@username"
                className="h-8 bg-background text-xs font-mono"
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
                className="h-8 bg-background text-xs font-mono"
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
                className="h-8 bg-background text-xs font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* Registered User Selector Dialog */}
      <AuthorSelectorDialog
        open={isAuthorSelectorOpen}
        onOpenChange={setIsAuthorSelectorOpen}
        selectedAuthorId={authorId}
        onSelectUser={handleSelectRegisteredUser}
      />

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
