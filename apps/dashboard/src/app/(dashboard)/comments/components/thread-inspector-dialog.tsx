// apps/dashboard/src/app/(dashboard)/comments/components/thread-inspector-dialog.tsx
import * as React from "react"
import { MessageSquare, Trash2, Pin } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { renderStatusBadge, renderReasonBadge } from "./comment-badge-utils"

interface ThreadInspectorDialogProps {
  comment: any | null
  onClose: () => void
  onDeleteConfirm: (id: string) => void
}

export function ThreadInspectorDialog({
  comment,
  onClose,
  onDeleteConfirm,
}: ThreadInspectorDialogProps) {
  if (!comment) return null

  return (
    <Dialog open={!!comment} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="size-5 text-primary" />
            Comment Thread Details
          </DialogTitle>
          <DialogDescription className="text-xs">
            Complete conversation context, author metadata, nested replies, and
            filing history.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Target Post Banner */}
          <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-3 text-xs">
            <div>
              <span className="text-muted-foreground">Post: </span>
              <span className="font-semibold">{comment.post?.title}</span>
            </div>
            <Badge variant="outline" className="font-mono text-[10px]">
              /{comment.post?.slug}
            </Badge>
          </div>

          {/* Parent Context if this is a reply */}
          {comment.parent && (
            <div className="space-y-1 border-l-2 border-primary/40 py-1 pl-3">
              <span className="font-mono text-[11px] text-muted-foreground">
                Replying to {comment.parent.author?.name || "parent comment"}:
              </span>
              <p className="truncate rounded bg-muted/20 p-2 text-xs text-muted-foreground italic">
                &ldquo;{comment.parent.content}&rdquo;
              </p>
            </div>
          )}

          {/* Main Comment Card */}
          <div className="space-y-3 rounded-lg border border-border/80 bg-card/80 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Avatar className="size-8">
                  <AvatarImage src={comment.author?.avatar} />
                  <AvatarFallback className="text-xs">
                    {comment.author?.name?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="text-sm font-semibold">
                    {comment.author?.name}
                  </span>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {comment.author?.email || "No email available"} • IP:{" "}
                    {comment.ipAddress || "Unknown"}
                  </p>
                </div>
              </div>
              {renderStatusBadge(comment.status)}
            </div>

            <div className="rounded border bg-muted/30 p-3 text-xs leading-relaxed whitespace-pre-wrap text-foreground">
              {comment.content}
            </div>

            <div className="flex items-center justify-between pt-1 font-mono text-xs text-muted-foreground">
              <span>{comment.likesCount} Likes</span>
              <span>{new Date(comment.createdAt).toLocaleString()}</span>
            </div>
          </div>

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="font-mono text-xs font-bold text-muted-foreground uppercase">
                Threaded Replies ({comment.replies.length})
              </h4>
              <div className="space-y-2 border-l-2 border-border pl-4">
                {comment.replies.map((reply: any) => (
                  <div
                    key={reply.id}
                    className="space-y-1.5 rounded border bg-muted/20 p-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">
                        {reply.author?.name}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {new Date(reply.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{reply.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filing Reports list */}
          {comment.reports && comment.reports.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="font-mono text-xs font-bold text-rose-500 uppercase">
                Flagged Reports on this Comment ({comment.reports.length})
              </h4>
              <div className="space-y-2">
                {comment.reports.map((rep: any) => (
                  <div
                    key={rep.id}
                    className="space-y-1 rounded border border-rose-500/30 bg-rose-500/5 p-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {renderReasonBadge(rep.reason)}
                        <span className="font-semibold">
                          {rep.reporterName || "Reader"}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {rep.status}
                      </Badge>
                    </div>
                    {rep.details && (
                      <p className="text-foreground/90 italic">
                        &ldquo;{rep.details}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-3 sm:gap-0">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDeleteConfirm(comment.id)}
            className="gap-1 text-xs"
          >
            <Trash2 className="size-3.5" />
            Delete Comment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
