// apps/dashboard/src/app/(dashboard)/comments/components/comments-table-view.tsx
import * as React from "react"
import { Trash2 } from "lucide-react"
import { Card } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import type { CommentAdminListItemDTO, CommentStatus } from "@workspace/shared"
import { renderStatusBadge } from "./comment-badge-utils"

interface CommentsTableViewProps {
  comments: CommentAdminListItemDTO[]
  selectedCommentIds: string[]
  onToggleSelect: (id: string) => void
  onSelectAllPage: (checked: boolean) => void
  onInspect: (id: string) => void
  onUpdateStatus: (id: string, status: CommentStatus) => void
  onDeleteConfirm: (id: string) => void
}

export function CommentsTableView({
  comments,
  selectedCommentIds,
  onToggleSelect,
  onSelectAllPage,
  onInspect,
  onUpdateStatus,
  onDeleteConfirm,
}: CommentsTableViewProps) {
  const isAllSelected =
    comments.length > 0 && selectedCommentIds.length === comments.length

  return (
    <Card className="overflow-hidden border-border/80">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-border/80 bg-muted/40 font-mono text-muted-foreground">
              <th className="w-10 p-3">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={(checked) => onSelectAllPage(!!checked)}
                />
              </th>
              <th className="p-3">Author</th>
              <th className="p-3">Comment Excerpt</th>
              <th className="p-3">Blog Article</th>
              <th className="p-3">Status</th>
              <th className="p-3">Engagement</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 font-sans">
            {comments.map((cm) => (
              <tr key={cm.id} className="transition-colors hover:bg-muted/20">
                <td className="p-3">
                  <Checkbox
                    checked={selectedCommentIds.includes(cm.id)}
                    onCheckedChange={() => onToggleSelect(cm.id)}
                  />
                </td>
                <td className="p-3 font-medium">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-6">
                      <AvatarFallback className="text-[10px]">
                        {cm.author.name?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="font-semibold">{cm.author.name}</span>
                      {cm.author.email && (
                        <p className="font-mono text-[10px] text-muted-foreground">
                          {cm.author.email}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="max-w-xs truncate p-3 text-muted-foreground">
                  &ldquo;{cm.content}&rdquo;
                </td>
                <td className="max-w-[200px] truncate p-3 font-medium text-foreground">
                  {cm.postTitle}
                </td>
                <td className="p-3">{renderStatusBadge(cm.status)}</td>
                <td className="p-3 font-mono text-[11px] text-muted-foreground">
                  {cm.likesCount}L • {cm.repliesCount}R
                </td>
                <td className="space-x-1 p-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onInspect(cm.id)}
                    className="h-7 text-xs"
                  >
                    Inspect
                  </Button>
                  {cm.status !== "APPROVED" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateStatus(cm.id, "APPROVED")}
                      className="h-7 text-xs text-emerald-600"
                    >
                      Approve
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteConfirm(cm.id)}
                    className="h-7 text-xs text-destructive"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
