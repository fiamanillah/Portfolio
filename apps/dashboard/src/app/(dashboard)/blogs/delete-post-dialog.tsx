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
      <AlertDialogContent className="w-[95vw] sm:min-w-[480px] md:min-w-[540px] max-w-lg bg-card border border-border/80 p-6 shadow-xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <AlertDialogTitle className="text-base font-bold">
                {isBulk ? `Delete ${bulkCount} Blog Posts?` : "Delete Blog Post?"}
              </AlertDialogTitle>
              <AlertDialogDescription className="mt-1 text-xs text-muted-foreground">
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

        <AlertDialogFooter className="mt-4 gap-2">
          <AlertDialogCancel disabled={isProcessing} className="text-xs h-8">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={isProcessing}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs h-8 gap-1.5"
          >
            {isProcessing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : null}
            {isBulk ? `Delete ${bulkCount} Posts` : "Delete Post"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
