import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Field,
  FieldLabel,
  FieldDescription,
} from "@workspace/ui/components/field"
import { AVATAR_OPTIONS } from "@/data/commentsData"
import { AuthApi } from "@/lib/api/authApi"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkBadge01Icon,
  Globe02Icon,
  Tick02Icon,
  Upload02Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"

interface AvatarSelectorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentAvatar?: string | null
  onSaveAvatar: (newAvatar: string) => void
}

const PRESET_AVATARS = [
  "/fi-avatar.webp",
  ...AVATAR_OPTIONS,
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
]

export function AvatarSelectorModal({
  open,
  onOpenChange,
  currentAvatar,
  onSaveAvatar,
}: AvatarSelectorModalProps) {
  const [selected, setSelected] = useState<string>(
    currentAvatar || "/fi-avatar.webp"
  )
  const [customUrl, setCustomUrl] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size exceeds maximum limit of 10MB.")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const res = await AuthApi.uploadAvatar(file)
      if (res.success && res.data?.avatar) {
        setSelected(res.data.avatar)
        setCustomUrl("")
        onSaveAvatar(res.data.avatar)
        onOpenChange(false)
      } else {
        setError(
          res.error ||
            res.message ||
            "Failed to upload avatar to cloud storage."
        )
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to upload avatar.")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleApply = () => {
    const target = customUrl.trim() || selected
    if (!target) {
      setError(
        "Please select a preset avatar, upload a file, or enter an image URL."
      )
      return
    }
    onSaveAvatar(target)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-lg border border-border bg-card/95 p-5 backdrop-blur-xl sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-foreground">
            Select Profile Avatar
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Choose a preset avatar or paste a custom image URL.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* Active Preview */}
          <div className="flex items-center gap-3.5 rounded-lg border border-border bg-background/60 p-3">
            <div className="relative shrink-0">
              <img
                src={
                  customUrl.trim() ||
                  selected ||
                  currentAvatar ||
                  "/fi-avatar.webp"
                }
                alt="Avatar preview"
                className="size-14 rounded-full border-2 border-primary/30 object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = "/fi-avatar.webp"
                }}
              />
              <span className="absolute -right-0.5 -bottom-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <HugeiconsIcon icon={Tick02Icon} className="size-2.5" />
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">Preview</p>
              <p className="truncate text-xs text-muted-foreground">
                Shown in comments, reviews & navbar
              </p>
            </div>
          </div>

          {/* Preset Grid */}
          <div className="space-y-1.5">
            <FieldLabel className="text-xs">Presets</FieldLabel>
            <div className="grid grid-cols-4 gap-2.5">
              {PRESET_AVATARS.map((avatar, idx) => {
                const isSelected = !customUrl && selected === avatar
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelected(avatar)
                      setCustomUrl("")
                      setError(null)
                    }}
                    className={`group relative flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-lg border p-1 transition-all ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={avatar}
                      alt={`Avatar option ${idx + 1}`}
                      className="size-full rounded-full object-cover transition-transform group-hover:scale-105"
                    />
                    {isSelected && (
                      <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-primary/20 backdrop-blur-[1px]">
                        <HugeiconsIcon
                          icon={CheckmarkBadge01Icon}
                          className="size-4 text-primary"
                        />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Direct File Upload to Cloudflare R2 / S3 */}
          <div className="space-y-1.5">
            <FieldLabel className="text-xs">Upload from Device</FieldLabel>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="h-10 w-full cursor-pointer justify-center gap-2 border-dashed border-border/80 bg-background/50 text-xs hover:bg-accent/40"
            >
              {isUploading ? (
                <>
                  <HugeiconsIcon
                    icon={Loading03Icon}
                    className="size-3.5 animate-spin"
                  />
                  Uploading to Cloud Storage...
                </>
              ) : (
                <>
                  <HugeiconsIcon
                    icon={Upload02Icon}
                    className="size-3.5 text-primary"
                  />
                  Choose Image File (JPG, PNG, WebP)
                </>
              )}
            </Button>
          </div>

          {/* Custom URL */}
          <Field className="space-y-1.5">
            <FieldLabel htmlFor="avatar-custom-url" className="text-xs">
              Or Custom URL
            </FieldLabel>
            <div className="relative">
              <Input
                id="avatar-custom-url"
                type="url"
                placeholder="https://github.com/username.png"
                value={customUrl}
                onChange={(e) => {
                  setCustomUrl(e.target.value)
                  setError(null)
                }}
                className="rounded-md pl-8 text-sm"
              />
              <HugeiconsIcon
                icon={Globe02Icon}
                className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <FieldDescription className="text-[11px] text-muted-foreground">
              Tip: Use{" "}
              <code className="text-foreground">
                https://github.com/[username].png
              </code>
            </FieldDescription>
          </Field>
        </div>

        <DialogFooter className="flex flex-row justify-end gap-2 border-t border-border/50 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer rounded-md text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleApply}
            className="cursor-pointer rounded-md text-xs"
          >
            <HugeiconsIcon icon={Tick02Icon} className="mr-1 size-3.5" />
            Save Avatar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
