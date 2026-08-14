import { useState, useMemo } from "react"
import { usePostEngagement } from "@/lib/engagementStore"
import { useAuthSession } from "@/lib/authStore"
import { CommentComposer } from "./CommentComposer"
import { CommentItem } from "./CommentItem"
import { AuthModal } from "./AuthModal"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Message01Icon,
  Loading03Icon,
  ArrowDown01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"

interface BlogCommentsSectionProps {
  postSlug: string
  postTitle?: string
}

type SortOrder = "newest" | "top" | "oldest"

const PAGE_SIZE = 3

export function BlogCommentsSection({
  postSlug,
}: BlogCommentsSectionProps) {
  const {
    comments,
    totalCommentsCount,
    addComment,
    addReply,
    toggleCommentLike,
    deleteComment,
  } = usePostEngagement(postSlug)

  const { user } = useAuthSession()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [sortBy, setSortBy] = useState<SortOrder>("newest")
  const [page, setPage] = useState(1)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Sort comments based on selected order
  const sortedComments = useMemo(() => {
    const list = [...comments]
    if (sortBy === "newest") {
      return list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    }
    if (sortBy === "oldest") {
      return list.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    }
    if (sortBy === "top") {
      return list.sort((a, b) => (b.likes || 0) - (a.likes || 0))
    }
    return list
  }, [comments, sortBy])

  // Paginated visible top-level comments
  const visibleComments = useMemo(() => {
    return sortedComments.slice(0, page * PAGE_SIZE)
  }, [sortedComments, page])

  const hasMore = visibleComments.length < sortedComments.length

  const handleSortChange = (newSort: SortOrder) => {
    if (newSort === sortBy) return
    setSortBy(newSort)
    setPage(1)
  }

  const handleLoadMore = () => {
    if (isLoadingMore || !hasMore) return
    setIsLoadingMore(true)

    // Simulate realistic async network API latency
    setTimeout(() => {
      setPage((prev) => prev + 1)
      setIsLoadingMore(false)
    }, 450)
  }

  const handleTopLevelCommentSubmit = (content: string) => {
    if (!user) {
      setAuthModalOpen(true)
      return
    }
    addComment(user, content)
  }

  return (
    <section
      id="discussion-section"
      className="relative mt-12 border-t border-border/80 pt-10"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold tracking-widest text-primary uppercase">
              // DISCUSSION_THREAD
            </span>
            <span className="border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold text-primary">
              {totalCommentsCount} {totalCommentsCount === 1 ? "COMMENT" : "COMMENTS"}
            </span>
          </div>
          <h3 className="font-mono text-lg font-bold text-foreground mt-1">
            Community Insights & Architectural Q&A
          </h3>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-muted-foreground">
            Sort:
          </span>
          <div className="inline-flex border border-border bg-background p-0.5">
            <button
              type="button"
              onClick={() => handleSortChange("newest")}
              className={`px-2.5 py-1 font-mono text-[11px] transition-colors cursor-pointer ${
                sortBy === "newest"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Newest
            </button>
            <button
              type="button"
              onClick={() => handleSortChange("top")}
              className={`px-2.5 py-1 font-mono text-[11px] transition-colors cursor-pointer ${
                sortBy === "top"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Top Rated
            </button>
            <button
              type="button"
              onClick={() => handleSortChange("oldest")}
              className={`px-2.5 py-1 font-mono text-[11px] transition-colors cursor-pointer ${
                sortBy === "oldest"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Oldest
            </button>
          </div>
        </div>
      </div>

      {/* Main Comment Composer */}
      <div className="mb-6">
        <CommentComposer
          onSubmit={handleTopLevelCommentSubmit}
          onOpenAuth={() => setAuthModalOpen(true)}
        />
      </div>

      {/* Scrollable Comments Stream Container */}
      <div className="relative border border-border/80 bg-background/60 backdrop-blur-sm">
        {/* Cyberpunk corner accents */}
        <div className="pointer-events-none absolute top-1.5 left-1.5 z-10 h-2.5 w-2.5 border-t border-l border-primary/50" />
        <div className="pointer-events-none absolute top-1.5 right-1.5 z-10 h-2.5 w-2.5 border-t border-r border-primary/50" />
        <div className="pointer-events-none absolute bottom-1.5 left-1.5 z-10 h-2.5 w-2.5 border-b border-l border-primary/50" />
        <div className="pointer-events-none absolute right-1.5 bottom-1.5 z-10 h-2.5 w-2.5 border-r border-b border-primary/50" />

        {/* Stream Status Header Bar */}
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-4 py-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            // ACTIVE_THREAD_STREAM ({sortedComments.length} {sortedComments.length === 1 ? "thread" : "threads"})
          </span>
          <span className="font-mono text-[10px] text-primary/80">
            Showing {Math.min(visibleComments.length, sortedComments.length)} of {sortedComments.length}
          </span>
        </div>

        {/* Scrollable Viewport with Min & Max Fixed Bounds */}
        <div className="h-[500px] min-h-[380px] max-h-[620px] overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-4">
          {visibleComments.length > 0 ? (
            <div className="space-y-4 pr-1">
              {visibleComments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  postSlug={postSlug}
                  onLike={toggleCommentLike}
                  onReply={addReply}
                  onDelete={deleteComment}
                  onOpenAuth={() => setAuthModalOpen(true)}
                />
              ))}

              {/* Simulated Loading Skeleton during Pagination */}
              {isLoadingMore && (
                <div className="border border-primary/20 bg-primary/[0.02] p-4 animate-pulse space-y-3 mt-4">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-muted/60" />
                    <div className="space-y-1.5">
                      <div className="h-3 w-28 bg-muted/60" />
                      <div className="h-2 w-20 bg-muted/40" />
                    </div>
                  </div>
                  <div className="space-y-1 pl-11">
                    <div className="h-3 w-full bg-muted/50" />
                    <div className="h-3 w-3/4 bg-muted/40" />
                  </div>
                </div>
              )}

              {/* Pagination / Load More Footer Action */}
              <div className="pt-4 border-t border-border/40 flex flex-col items-center justify-center gap-2">
                {hasMore ? (
                  <button
                    type="button"
                    disabled={isLoadingMore}
                    onClick={handleLoadMore}
                    className="inline-flex items-center gap-2 border border-primary/40 bg-primary/10 px-5 py-2 font-mono text-xs font-semibold text-primary transition-all duration-200 hover:border-primary hover:bg-primary/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_12px_-3px_oklch(var(--primary)/20%)]"
                  >
                    {isLoadingMore ? (
                      <>
                        <HugeiconsIcon icon={Loading03Icon} className="size-3.5 animate-spin" />
                        <span>Loading next batch...</span>
                      </>
                    ) : (
                      <>
                        <HugeiconsIcon icon={ArrowDown01Icon} className="size-3.5" />
                        <span>
                          Load More ({sortedComments.length - visibleComments.length} remaining)
                        </span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground/80 py-2">
                    <HugeiconsIcon icon={Tick02Icon} className="size-3.5 text-primary" />
                    <span>// ALL THREADS LOADED — {sortedComments.length} total discussions</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center border border-dashed border-border/80 bg-muted/10 p-8 text-center">
              <div className="flex size-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
                <HugeiconsIcon icon={Message01Icon} className="size-6" />
              </div>
              <h4 className="font-mono text-sm font-bold text-foreground mt-4">
                No discussion yet
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mt-1 leading-relaxed">
                Be the first engineer to start the conversation on this architecture breakdown!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        actionLabel="to leave a comment"
      />
    </section>
  )
}

