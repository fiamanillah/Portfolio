// apps/dashboard/src/app/(dashboard)/comments/components/delete-confirm-dialog.tsx
import * as React from "react"
import { Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"

interface DeleteConfirmDialogProps {
  target: { id: string; type: "single" | "bulk" } | null
  selectedCount: number
  actionLoading: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DeleteConfirmDialog({
  target,
  selectedCount,
  actionLoading,
  onClose,
  onConfirm,
}: DeleteConfirmDialogProps) {
  if (!target) return null

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base text-destructive">
            <Trash2 className="size-5" />
            Confirm Permanent Deletion
          </DialogTitle>
          <DialogDescription className="text-xs">
            {target.type === "bulk"
              ? `Are you sure you want to delete ${selectedCount} comments? This action will cascade delete all nested replies and cannot be undone.`
              : "Are you sure you want to delete this comment? All child replies and reactions will be permanently removed."}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 pt-3 sm:gap-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={actionLoading}
            className="text-xs"
          >
            {actionLoading ? "Deleting..." : "Delete Permanently"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
