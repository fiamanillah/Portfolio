import { useState } from "react"
import type { BlogComment, AuthUser } from "@/data/commentsData"
import type { GuestCommentPayload } from "@/lib/api/commentsApi"
import { useAuthSession } from "@/lib/authStore"
import { CommentComposer } from "./CommentComposer"
import { ReportCommentModal } from "./ReportCommentModal"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowTurnBackwardIcon,
  Delete01Icon,
  FavouriteIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  Loading03Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons"

interface CommentItemProps {
  comment: BlogComment
  postSlug: string
  onLike: (commentId: string, parentId?: string | null) => void
  onReply: (
    parentId: string,
    author: AuthUser | GuestCommentPayload,
    content: string
  ) => void
  onDelete: (commentId: string, parentId?: string | null) => void
  onOpenAuth: () => void
  isChild?: boolean
  parentCommentId?: string
}

const REPLIES_PAGE_SIZE = 2

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHrs = Math.floor(diffMin / 60)
    const diffDays = Math.floor(diffHrs / 24)

    if (diffSec < 60) return "Just now"
    if (diffMin < 60) return `${diffMin}m ago`
    if (diffHrs < 24) return `${diffHrs}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  } catch {
    return "Recently"
  }
}

// Lightweight Markdown Formatter for Comments
function renderCommentContent(content: string) {
  const lines = content.split("\n")

  return (
    <div className="space-y-1.5 font-sans text-xs leading-relaxed text-foreground/90">
      {lines.map((line, idx) => {
        if (!line.trim()) {
          return <div key={idx} className="h-1" />
        }

        if (line.startsWith("> ")) {
          return (
            <blockquote
              key={idx}
              className="border-l-2 border-primary/50 bg-primary/5 px-2.5 py-1 font-mono text-xs text-foreground/80 italic"
            >
              {line.replace(/^>\s*/, "")}
            </blockquote>
          )
        }

        const parts = line.split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
        return (
          <p key={idx}>
            {parts.map((part, pIdx) => {
              if (part.startsWith("`") && part.endsWith("`")) {
                return (
                  <code
                    key={pIdx}
                    className="border border-border bg-muted/70 px-1 py-0.5 font-mono text-[11px] text-primary"
                  >
                    {part.slice(1, -1)}
                  </code>
                )
              }
              if (part.startsWith("**") && part.endsWith("**")) {
                return (
                  <strong key={pIdx} className="font-bold text-foreground">
                    {part.slice(2, -2)}
                  </strong>
                )
              }
              return part
            })}
          </p>
        )
      })}
    </div>
  )
}

export function CommentItem({
  comment,
  postSlug,
  onLike,
  onReply,
  onDelete,
  onOpenAuth,
  isChild = false,
  parentCommentId,
}: CommentItemProps) {
  const { user } = useAuthSession()
  const [showReplyBox, setShowReplyBox] = useState(false)
  const [isRepliesExpanded, setIsRepliesExpanded] = useState(true)
  const [replyPage, setReplyPage] = useState(1)
  const [isLoadingMoreReplies, setIsLoadingMoreReplies] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)

  const isAuthorSelf =
    (user?.id && comment.author.id === user.id) ||
    (user?.username && comment.author.username === user.username)
  const isPostAuthor =
    comment.author.badge === "Author" ||
    comment.author.username === "fiamanillah"
  const totalReplies = comment.replies || []
  const hasReplies = totalReplies.length > 0

  const visibleReplies = totalReplies.slice(0, replyPage * REPLIES_PAGE_SIZE)
  const hasMoreReplies = visibleReplies.length < totalReplies.length

  const handleReplySubmit = (
    content: string,
    guestInfo?: GuestCommentPayload
  ) => {
    if (user) {
      onReply(comment.parentId || comment.id, user, content)
    } else if (guestInfo && guestInfo.guestName) {
      onReply(comment.parentId || comment.id, guestInfo, content)
    } else {
      onOpenAuth()
      return
    }
    setShowReplyBox(false)
    setIsRepliesExpanded(true)
    setReplyPage(Math.ceil((totalReplies.length + 1) / REPLIES_PAGE_SIZE))
  }

  const handleLoadMoreReplies = () => {
    if (isLoadingMoreReplies || !hasMoreReplies) return
    setIsLoadingMoreReplies(true)

    setTimeout(() => {
      setReplyPage((prev) => prev + 1)
      setIsLoadingMoreReplies(false)
    }, 350)
  }

  return (
    <div className={`group/comment relative ${isChild ? "mt-3.5" : "mt-5"}`}>
      <div
        className={`border p-4 transition-all duration-200 ${
          isPostAuthor
            ? "border-primary/40 bg-primary/[0.03]"
            : "border-border/80 bg-background/60"
        } backdrop-blur-xs`}
      >
        {/* Comment Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={comment.author.avatar || "/fi-avatar.webp"}
              alt={comment.author.name}
              referrerPolicy="no-referrer"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = "/fi-avatar.webp"
              }}
              width="32"
              height="32"
              className={`size-8 shrink-0 rounded-full border object-cover ${
                isPostAuthor ? "border-primary" : "border-border"
              }`}
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="truncate font-mono text-xs font-bold text-foreground">
                  {comment.author.name}
                </span>

                {isPostAuthor && (
                  <span className="py-0.2 bg-primary px-1.5 font-mono text-[9px] font-bold text-primary-foreground uppercase shadow-xs">
                    AUTHOR
                  </span>
                )}

                {comment.author.badge && !isPostAuthor && (
                  <span className="py-0.2 border border-primary/30 bg-primary/10 px-1.5 font-mono text-[9px] font-semibold text-primary uppercase">
                    {comment.author.badge}
                  </span>
                )}

                <span className="font-mono text-[10px] text-muted-foreground">
                  • {formatRelativeTime(comment.createdAt)}
                </span>
              </div>

              {comment.author.role && (
                <p className="truncate font-mono text-[10px] text-muted-foreground">
                  {comment.author.role}
                </p>
              )}
            </div>
          </div>

          {/* Delete Action if owner */}
          {isAuthorSelf && (
            <button
              type="button"
              onClick={() => onDelete(comment.id, parentCommentId)}
              className="cursor-pointer p-1 font-mono text-[10px] text-muted-foreground transition-colors hover:text-destructive"
              title="Delete this comment"
            >
              <HugeiconsIcon icon={Delete01Icon} className="size-3.5" />
            </button>
          )}
        </div>

        {/* Comment Body */}
        <div className="mt-3 pl-11">
          {renderCommentContent(comment.content)}

          {/* Comment Actions Footer */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-2">
            <div className="flex items-center gap-3">
              {/* Like Button */}
              <button
                type="button"
                onClick={() => onLike(comment.id, parentCommentId)}
                className={`inline-flex cursor-pointer items-center gap-1.5 font-mono text-xs transition-colors ${
                  comment.isLiked
                    ? "font-semibold text-rose-400"
                    : "text-muted-foreground hover:text-rose-400"
                }`}
              >
                <HugeiconsIcon
                  icon={FavouriteIcon}
                  className={`size-3.5 ${
                    comment.isLiked
                      ? "fill-rose-400 text-rose-400"
                      : "text-muted-foreground"
                  }`}
                />
                <span className="text-[11px]">{comment.likes || 0}</span>
              </button>

              {/* Reply Button */}
              {!isChild && (
                <button
                  type="button"
                  onClick={() => setShowReplyBox(!showReplyBox)}
                  className="inline-flex cursor-pointer items-center gap-1 font-mono text-[11px] text-muted-foreground transition-colors hover:text-primary"
                >
                  <HugeiconsIcon
                    icon={ArrowTurnBackwardIcon}
                    className="size-3"
                  />
                  <span>{showReplyBox ? "Cancel" : "Reply"}</span>
                </button>
              )}

              {/* Report Button */}
              <button
                type="button"
                onClick={() => setShowReportModal(true)}
                className="inline-flex cursor-pointer items-center gap-1 font-mono text-[11px] text-muted-foreground transition-colors hover:text-rose-400"
                title="Report this comment to moderation team"
              >
                <HugeiconsIcon
                  icon={AlertCircleIcon}
                  className="size-3 text-muted-foreground/80 hover:text-rose-400"
                />
                <span>Report</span>
              </button>
            </div>

            {/* Expand / Collapse Replies Toggle */}
            {hasReplies && !isChild && (
              <button
                type="button"
                onClick={() => setIsRepliesExpanded(!isRepliesExpanded)}
                className="inline-flex cursor-pointer items-center gap-1.5 border border-primary/20 bg-primary/5 px-2.5 py-0.5 font-mono text-[11px] text-primary transition-colors hover:border-primary/40 hover:bg-primary/10"
              >
                <HugeiconsIcon
                  icon={isRepliesExpanded ? ArrowUp01Icon : ArrowDown01Icon}
                  className="size-3"
                />
                <span>
                  {isRepliesExpanded
                    ? `Hide ${totalReplies.length} ${totalReplies.length === 1 ? "reply" : "replies"}`
                    : `View ${totalReplies.length} ${totalReplies.length === 1 ? "reply" : "replies"}`}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inline Reply Composer */}
      {showReplyBox && (
        <div className="mt-3 border-l-2 border-primary/40 pl-6 sm:pl-10">
          <CommentComposer
            isReply={true}
            replyToName={comment.author.name}
            onSubmit={handleReplySubmit}
            onOpenAuth={onOpenAuth}
            onCancelReply={() => setShowReplyBox(false)}
            autoFocus={true}
          />
        </div>
      )}

      {/* Nested Replies */}
      {hasReplies && isRepliesExpanded && (
        <div className="mt-3 ml-4 space-y-3 border-l-2 border-border/80 pl-4 transition-all duration-200 sm:ml-6 sm:pl-8">
          {visibleReplies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postSlug={postSlug}
              onLike={onLike}
              onReply={onReply}
              onDelete={onDelete}
              onOpenAuth={onOpenAuth}
              isChild={true}
              parentCommentId={comment.id}
            />
          ))}

          {/* Show More Replies Action */}
          {hasMoreReplies && (
            <div className="pt-2 pl-2">
              <button
                type="button"
                disabled={isLoadingMoreReplies}
                onClick={handleLoadMoreReplies}
                className="inline-flex cursor-pointer items-center gap-1.5 border border-primary/30 bg-primary/5 px-2.5 py-1 font-mono text-[11px] text-primary transition-colors hover:bg-primary/15 disabled:opacity-50"
              >
                {isLoadingMoreReplies ? (
                  <>
                    <HugeiconsIcon
                      icon={Loading03Icon}
                      className="size-3 animate-spin text-primary"
                    />
                    <span>Loading replies...</span>
                  </>
                ) : (
                  <>
                    <HugeiconsIcon
                      icon={ArrowDown01Icon}
                      className="size-3 text-primary"
                    />
                    <span>
                      Show more replies (
                      {totalReplies.length - visibleReplies.length} remaining)
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Report Modal */}
      <ReportCommentModal
        commentId={comment.id}
        isOpen={showReportModal}
        userName={user?.name}
        userEmail={user?.email}
        onClose={() => setShowReportModal(false)}
      />
    </div>
  )
}
