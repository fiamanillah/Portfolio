"use client"

import * as React from "react"
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
import { Loader2 } from "lucide-react"
import type { ExperienceListItemDTO } from "@workspace/shared"

interface DeleteExperienceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  experience: ExperienceListItemDTO | null
  bulkIds?: string[]
  isDeleting: boolean
  onConfirm: () => Promise<void>
}

export function DeleteExperienceDialog({
  open,
  onOpenChange,
  experience,
  bulkIds = [],
  isDeleting,
  onConfirm,
}: DeleteExperienceDialogProps) {
  const isBulk = bulkIds.length > 0

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[92vw] sm:w-auto sm:min-w-[500px] sm:max-w-none rounded-2xl border-border/80 bg-background/95 backdrop-blur-md p-6 shadow-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-mono text-base font-bold uppercase">
            {isBulk
              ? `Delete ${bulkIds.length} experiences?`
              : `Delete experience: ${experience?.company || ""}?`}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
            {isBulk
              ? `Are you sure you want to permanently remove ${bulkIds.length} professional history records? This action cannot be undone.`
              : `Are you sure you want to permanently remove "${experience?.role || ""}" at "${experience?.company || ""}"? This action cannot be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} className="font-mono text-xs">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-mono text-xs font-bold"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Deleting...
              </>
            ) : (
              "Confirm Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
