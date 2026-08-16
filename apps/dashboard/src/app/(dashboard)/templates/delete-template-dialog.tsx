"use client"

import * as React from "react"
import { AlertTriangle, Code2, RotateCcw, Trash2 } from "lucide-react"

import type { EmailTemplate } from "@workspace/shared"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

interface DeleteTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: EmailTemplate | null
  onConfirmDelete: (template: EmailTemplate) => Promise<boolean>
  onResetDefault?: (template: EmailTemplate) => void
  isProcessing?: boolean
}

export function DeleteTemplateDialog({
  open,
  onOpenChange,
  template,
  onConfirmDelete,
  onResetDefault,
  isProcessing = false,
}: DeleteTemplateDialogProps) {
  if (!template) return null

  const isSystem = template.isSystem

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] border-border/80 bg-background/95 backdrop-blur-md sm:w-[90vw] sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div
              className={`flex size-9 items-center justify-center rounded-lg ${
                isSystem
                  ? "border border-blue-500/20 bg-blue-500/10 text-blue-400"
                  : "border border-destructive/20 bg-destructive/10 text-destructive"
              }`}
            >
              {isSystem ? (
                <Code2 className="size-5" />
              ) : (
                <Trash2 className="size-5" />
              )}
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                {isSystem
                  ? "Codebase Template Protected"
                  : "Delete Email Template"}
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
                {isSystem
                  ? "System email templates cannot be deleted from the dashboard."
                  : "Are you sure you want to permanently delete this template?"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5 rounded-lg border border-border/60 bg-muted/20 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                {template.name}
              </span>
              <Badge
                variant="outline"
                className={`text-[10px] ${
                  isSystem
                    ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                }`}
              >
                {isSystem ? "Codebase (System)" : "Custom Made"}
              </Badge>
            </div>
            <code className="block font-mono text-xs text-muted-foreground">
              slug: {template.slug}
            </code>
          </div>

          {isSystem ? (
            <div className="space-y-2 rounded-lg border border-blue-500/30 bg-blue-500/5 p-3.5 text-xs text-blue-200">
              <p className="font-semibold text-blue-300">
                Why is this template protected?
              </p>
              <p className="leading-relaxed text-blue-200/80">
                This template is required by core application features (such as
                user email verification, password reset, or contact forms).
                Deleting it would cause backend errors during auth or contact
                flows.
              </p>
              <p className="leading-relaxed text-blue-200/80">
                If you made customizations that you wish to remove, you can
                reset it to the original codebase default layout.
              </p>
            </div>
          ) : (
            <div className="space-y-1 rounded-lg border border-destructive/30 bg-destructive/5 p-3.5 text-xs text-destructive">
              <div className="flex items-center gap-1.5 font-semibold">
                <AlertTriangle className="size-4 shrink-0" />
                <span>This action cannot be undone</span>
              </div>
              <p className="leading-relaxed text-destructive/80">
                This template will be removed from your database and deleted
                from Plunk. Any automations referring to this template slug will
                stop working.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between pt-2 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
            disabled={isProcessing}
          >
            Cancel
          </Button>

          {isSystem ? (
            onResetDefault && (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onOpenChange(false)
                  onResetDefault(template)
                }}
                className="gap-1.5 bg-amber-500 text-xs font-semibold text-black hover:bg-amber-400"
              >
                <RotateCcw className="size-3.5" />
                Reset to Codebase Default
              </Button>
            )
          ) : (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={async () => {
                const success = await onConfirmDelete(template)
                if (success) onOpenChange(false)
              }}
              className="gap-1.5 text-xs font-semibold"
              disabled={isProcessing}
            >
              {isProcessing ? "Deleting..." : "Delete Template"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
