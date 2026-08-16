// apps/dashboard/src/app/(dashboard)/comments/components/comments-feed-view.tsx
import * as React from "react"
import { MessageSquare } from "lucide-react"
import { Card } from "@workspace/ui/components/card"
import type { CommentAdminListItemDTO, CommentStatus } from "@workspace/shared"
import { CommentCardItem } from "./comment-card-item"

interface CommentsFeedViewProps {
  comments: CommentAdminListItemDTO[]
  loading: boolean
  selectedCommentIds: string[]
  actionLoading: boolean
  onToggleSelect: (id: string) => void
  onInspect: (id: string) => void
  onUpdateStatus: (
    id: string,
    status: CommentStatus,
    isPinned?: boolean
  ) => void
  onDeleteConfirm: (id: string) => void
}

export function CommentsFeedView({
  comments,
  loading,
  selectedCommentIds,
  actionLoading,
  onToggleSelect,
  onInspect,
  onUpdateStatus,
  onDeleteConfirm,
}: CommentsFeedViewProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse bg-card/40 p-6">
            <div className="flex gap-4">
              <div className="size-10 rounded-full bg-muted/60" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 bg-muted/60" />
                <div className="h-3 w-full bg-muted/40" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <Card className="border-dashed p-12 text-center">
        <MessageSquare className="mx-auto mb-3 size-10 text-muted-foreground" />
        <h3 className="text-base font-semibold">No comments found</h3>
        <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
          Try adjusting your search query, status filters, or check back when
          readers leave new remarks.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {comments.map((cm) => (
        <CommentCardItem
          key={cm.id}
          comment={cm}
          isSelected={selectedCommentIds.includes(cm.id)}
          actionLoading={actionLoading}
          onToggleSelect={onToggleSelect}
          onInspect={onInspect}
          onUpdateStatus={onUpdateStatus}
          onDeleteConfirm={onDeleteConfirm}
        />
      ))}
    </div>
  )
}
