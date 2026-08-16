"use client"

import * as React from "react"
import { AlertTriangle, Loader2 } from "lucide-react"
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
import { buttonVariants } from "@workspace/ui/components/button"
import type { CaseStudyListItemDTO } from "@workspace/shared"

interface DeleteCaseStudyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  study: CaseStudyListItemDTO | null
  bulkCount?: number
  onConfirm: () => Promise<void>
  isDeleting?: boolean
}

export function DeleteCaseStudyDialog({
  open,
  onOpenChange,
  study,
  bulkCount = 0,
  onConfirm,
  isDeleting = false,
}: DeleteCaseStudyDialogProps) {
  const isBulk = bulkCount > 0

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <AlertDialogTitle>
                {isBulk
                  ? `Delete ${bulkCount} Case Studies?`
                  : `Delete "${study?.title}"?`}
              </AlertDialogTitle>
              <AlertDialogDescription className="mt-1">
                {isBulk
                  ? `Are you sure you want to delete these ${bulkCount} case studies? This action cannot be undone and will permanently remove them from the database.`
                  : "Are you sure you want to delete this case study? This action cannot be undone."}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={isDeleting}
            className={buttonVariants({ variant: "destructive" })}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
