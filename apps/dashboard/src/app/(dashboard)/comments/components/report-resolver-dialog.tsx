// apps/dashboard/src/app/(dashboard)/comments/components/report-resolver-dialog.tsx
import * as React from "react"
import { ShieldAlert } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Textarea } from "@workspace/ui/components/textarea"
import type { CommentReportDTO } from "@workspace/shared"

interface ReportResolverDialogProps {
  report: CommentReportDTO | null
  reportAction: string
  reportResolutionNotes: string
  actionLoading: boolean
  onClose: () => void
  onSetReportAction: (action: string) => void
  onSetResolutionNotes: (notes: string) => void
  onApplyResolution: () => void
}

export function ReportResolverDialog({
  report,
  reportAction,
  reportResolutionNotes,
  actionLoading,
  onClose,
  onSetReportAction,
  onSetResolutionNotes,
  onApplyResolution,
}: ReportResolverDialogProps) {
  if (!report) return null

  return (
    <Dialog open={!!report} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <ShieldAlert className="size-5 text-rose-500" />
            Resolve Community Report
          </DialogTitle>
          <DialogDescription className="text-xs">
            Review flagged content and select an automated action to apply.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          <div className="space-y-1 rounded border bg-muted/30 p-3">
            <span className="font-mono text-muted-foreground">
              Flagged Comment:
            </span>
            <p className="font-medium text-foreground italic">
              &ldquo;{report.comment?.content}&rdquo;
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold">Action to Execute:</label>
            <Select value={reportAction} onValueChange={onSetReportAction}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DELETE_COMMENT">
                  Delete Comment Permanently
                </SelectItem>
                <SelectItem value="MARK_SPAM">
                  Mark Comment as Spam (Hidden)
                </SelectItem>
                <SelectItem value="APPROVE_COMMENT">
                  Approve Comment (False Alarm)
                </SelectItem>
                <SelectItem value="DISMISS">
                  Dismiss Report with No Comment Change
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold">
              Internal Resolution Notes (Optional):
            </label>
            <Textarea
              placeholder="E.g., Violates community guidelines on self-promotional spam..."
              value={reportResolutionNotes}
              onChange={(e) => onSetResolutionNotes(e.target.value)}
              className="min-h-[70px] text-xs"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2 sm:gap-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onApplyResolution}
            disabled={actionLoading}
            className="bg-primary text-xs text-primary-foreground"
          >
            {actionLoading ? "Applying..." : "Apply Resolution"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
