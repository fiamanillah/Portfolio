"use client"

import * as React from "react"
import { FolderInput, Trash2, AlertTriangle, Loader2 } from "lucide-react"
import type { MediaFolderStat, MediaFileDTO } from "@workspace/shared"
import { MediaApi } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog"
import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Input } from "@workspace/ui/components/input"
import { toast } from "@workspace/ui/components/sonner"

interface BulkMoveFolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedIds: string[]
  existingFolders?: MediaFolderStat[]
  onSuccess: () => void
}

export function BulkMoveFolderDialog({
  open,
  onOpenChange,
  selectedIds,
  existingFolders = [],
  onSuccess,
}: BulkMoveFolderDialogProps) {
  const [selectedFolder, setSelectedFolder] = React.useState("general")
  const [customFolder, setCustomFolder] = React.useState("")
  const [isCustom, setIsCustom] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const folderOptions = React.useMemo(() => {
    const set = new Set([
      "general",
      "blogs",
      "avatars",
      "templates",
      "documents",
    ])
    existingFolders.forEach((f) => {
      if (f.folder) set.add(f.folder)
    })
    return Array.from(set).sort()
  }, [existingFolders])

  const handleMove = async () => {
    const targetFolder = isCustom
      ? customFolder
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, "-") || "general"
      : selectedFolder

    setIsSubmitting(true)
    try {
      const res = await MediaApi.bulkUpdate({
        ids: selectedIds,
        folder: targetFolder,
      })

      if (res.success) {
        toast.success(
          `Moved ${res.data?.count || selectedIds.length} asset(s) to "${targetFolder}"`
        )
        onSuccess()
        onOpenChange(false)
      } else {
        toast.error(res.error || "Failed to move assets")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to move assets")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <FolderInput className="size-5 text-primary" />
            Move {selectedIds.length} Asset(s)
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Select a target folder to organize the selected media assets.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Choose Folder</Label>
            {!isCustom ? (
              <div className="flex items-center gap-2">
                <Select
                  value={selectedFolder}
                  onValueChange={setSelectedFolder}
                >
                  <SelectTrigger className="h-9 bg-card text-xs">
                    <SelectValue placeholder="Select target folder" />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    {folderOptions.map((f) => (
                      <SelectItem key={f} value={f} className="capitalize">
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCustom(true)}
                  className="h-9 shrink-0 text-xs"
                >
                  + New
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="New folder name..."
                  value={customFolder}
                  onChange={(e) => setCustomFolder(e.target.value)}
                  className="h-9 bg-card text-xs"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsCustom(false)
                    setCustomFolder("")
                  }}
                  className="h-9 shrink-0 text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleMove}
            disabled={isSubmitting || (isCustom && !customFolder.trim())}
            className="gap-1.5 bg-primary text-xs text-primary-foreground shadow-xs hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" /> Moving...
              </>
            ) : (
              "Move Assets"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface DeleteMediaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  singleFile?: MediaFileDTO | null
  selectedIds?: string[]
  onSuccess: () => void
}

export function DeleteMediaDialog({
  open,
  onOpenChange,
  singleFile,
  selectedIds = [],
  onSuccess,
}: DeleteMediaDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)

  const count = singleFile ? 1 : selectedIds.length
  const title = singleFile
    ? `Delete "${singleFile.fileName}"?`
    : `Delete ${count} Media Asset(s)?`

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      if (singleFile) {
        const res = await MediaApi.delete(singleFile.id)
        if (res.success) {
          toast.success(`"${singleFile.fileName}" deleted permanently.`)
          onSuccess()
          onOpenChange(false)
        } else {
          toast.error(res.error || "Failed to delete file")
        }
      } else if (selectedIds.length > 0) {
        const res = await MediaApi.bulkDelete({ ids: selectedIds })
        if (res.success) {
          toast.success(
            `Deleted ${res.data?.count || selectedIds.length} asset(s).`
          )
          onSuccess()
          onOpenChange(false)
        } else {
          toast.error(res.error || "Failed to delete assets")
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Deletion failed")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md p-6">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-base font-bold text-destructive">
            <AlertTriangle className="size-5" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs leading-relaxed text-muted-foreground">
            This action is permanent and cannot be undone. The file(s) will be
            permanently deleted from Cloudflare R2 storage and the database. Any
            links pointing to these assets will break.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="pt-3">
          <AlertDialogCancel disabled={isDeleting} className="text-xs">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={isDeleting}
            className="text-destructive-foreground gap-1.5 bg-destructive text-xs hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" /> Deleting...
              </>
            ) : (
              <>
                <Trash2 className="size-3.5" /> Delete Permanently
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
