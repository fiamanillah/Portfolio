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
import { Button } from "@workspace/ui/components/button"
import type { BlogPostListItemDTO } from "@workspace/shared"

interface DeletePostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  post: BlogPostListItemDTO | null
  bulkCount?: number
  isProcessing: boolean
  onConfirm: () => Promise<void>
}

export function DeletePostDialog({
  open,
  onOpenChange,
  post,
  bulkCount,
  isProcessing,
  onConfirm,
}: DeletePostDialogProps) {
  const isBulk = typeof bulkCount === "number" && bulkCount > 1

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[480px]">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <AlertDialogTitle>
                {isBulk ? `Delete ${bulkCount} Blog Posts?` : "Delete Blog Post?"}
              </AlertDialogTitle>
              <AlertDialogDescription className="mt-1">
                {isBulk ? (
                  <span>
                    Are you sure you want to permanently delete these{" "}
                    <strong className="text-foreground">{bulkCount}</strong> blog posts?
                    This action cannot be undone.
                  </span>
                ) : (
                  <span>
                    Are you sure you want to delete{" "}
                    <strong className="text-foreground">"{post?.title}"</strong>?
                    All associated comments, metrics, and SEO links will be permanently removed.
                  </span>
                )}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 gap-2 sm:gap-0">
          <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={isProcessing}
            onClick={async (e) => {
              e.preventDefault()
              await onConfirm()
            }}
          >
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isBulk ? "Delete Selected Posts" : "Delete Post"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
