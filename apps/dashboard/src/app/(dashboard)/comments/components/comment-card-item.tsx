// apps/dashboard/src/app/(dashboard)/comments/components/comment-card-item.tsx
import * as React from "react"
import {
  Check,
  Ban,
  Trash2,
  Eye,
  MoreVertical,
  Pin,
  X,
  Flag,
  ThumbsUp,
  MessageCircle,
  CornerDownRight,
} from "lucide-react"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import type { CommentAdminListItemDTO, CommentStatus } from "@workspace/shared"
import { renderStatusBadge } from "./comment-badge-utils"

interface CommentCardItemProps {
  comment: CommentAdminListItemDTO
  isSelected: boolean
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

export function CommentCardItem({
  comment: cm,
  isSelected,
  actionLoading,
  onToggleSelect,
  onInspect,
  onUpdateStatus,
  onDeleteConfirm,
}: CommentCardItemProps) {
  const isReply = !!cm.parentId

  return (
    <Card
      className={`border transition-all duration-150 ${
        isSelected
          ? "border-primary bg-primary/[0.02]"
          : cm.reportsCount > 0
            ? "border-rose-500/40 bg-rose-500/[0.02]"
            : "border-border/80 bg-card/60"
      }`}
    >
      <CardHeader className="p-4 pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelect(cm.id)}
              className="mt-1"
            />

            <Avatar className="size-9 shrink-0">
              <AvatarImage src={cm.author.avatar || undefined} />
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {cm.author.name?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-sm font-semibold">{cm.author.name}</span>
                {cm.author.badge && (
                  <Badge
                    variant="outline"
                    className="px-1 py-0 font-mono text-[9px] uppercase"
                  >
                    {cm.author.badge}
                  </Badge>
                )}
                {cm.author.email && (
                  <span className="truncate font-mono text-xs text-muted-foreground">
                    ({cm.author.email})
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>
                  Article:{" "}
                  <strong className="text-foreground transition-colors hover:text-primary">
                    {cm.postTitle}
                  </strong>
                </span>
                {isReply && (
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] text-primary">
                    <CornerDownRight className="size-3" />
                    Reply to {cm.parentAuthorName || "comment"}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start">
            {cm.isPinned && (
              <Badge
                variant="secondary"
                className="gap-1 border-primary/20 bg-primary/10 text-[10px] text-primary"
              >
                <Pin className="size-3" />
                Pinned
              </Badge>
            )}

            {cm.reportsCount > 0 && (
              <Badge className="gap-1 border border-rose-500/40 bg-rose-500/20 text-[10px] text-rose-600">
                <Flag className="size-3 text-rose-500" />
                {cm.reportsCount} {cm.reportsCount === 1 ? "Report" : "Reports"}
              </Badge>
            )}

            {renderStatusBadge(cm.status)}
            <span className="font-mono text-xs text-muted-foreground">
              {new Date(cm.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-4 pt-0">
        <div className="rounded-lg border border-border/50 bg-muted/20 p-3 font-sans text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
          {cm.content}
        </div>

        {/* Card Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-2 text-xs">
          <div className="flex items-center gap-4 font-mono text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <ThumbsUp className="size-3" />
              {cm.likesCount} likes
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="size-3" />
              {cm.repliesCount} replies
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Inspect Thread Details */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onInspect(cm.id)}
              className="h-8 gap-1 text-xs"
            >
              <Eye className="size-3.5" />
              Inspect
            </Button>

            {/* Quick Status Actions */}
            {cm.status !== "APPROVED" && (
              <Button
                size="sm"
                onClick={() => onUpdateStatus(cm.id, "APPROVED")}
                disabled={actionLoading}
                className="h-8 gap-1 bg-emerald-600 text-xs text-white hover:bg-emerald-700"
              >
                <Check className="size-3.5" />
                Approve
              </Button>
            )}

            {cm.status !== "SPAM" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateStatus(cm.id, "SPAM")}
                disabled={actionLoading}
                className="h-8 gap-1 text-xs text-amber-600 hover:bg-amber-500/10"
              >
                <Ban className="size-3.5" />
                Spam
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="text-xs">
                  Moderation Options
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => onUpdateStatus(cm.id, cm.status, !cm.isPinned)}
                  className="gap-2 text-xs"
                >
                  <Pin className="size-3.5" />
                  {cm.isPinned ? "Unpin Comment" : "Pin Comment"}
                </DropdownMenuItem>
                {cm.status !== "REJECTED" && (
                  <DropdownMenuItem
                    onClick={() => onUpdateStatus(cm.id, "REJECTED")}
                    className="gap-2 text-xs text-amber-600"
                  >
                    <X className="size-3.5" />
                    Reject Comment
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDeleteConfirm(cm.id)}
                  className="gap-2 text-xs text-destructive"
                >
                  <Trash2 className="size-3.5" />
                  Delete Permanently
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
