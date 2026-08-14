import {
  DEFAULT_COMMENTS_REGISTRY,
  type BlogComment,
  type AuthUser,
} from "@/data/commentsData"

const COMMENTS_STORAGE_KEY_PREFIX = "portfolio_comments_"

// Helper to get from local storage or default
function getStoredCommentsDirect(slug: string): BlogComment[] {
  if (typeof window === "undefined") {
    return DEFAULT_COMMENTS_REGISTRY[slug] || []
  }
  try {
    const raw = localStorage.getItem(`${COMMENTS_STORAGE_KEY_PREFIX}${slug}`)
    if (!raw) return DEFAULT_COMMENTS_REGISTRY[slug] || []
    return JSON.parse(raw) as BlogComment[]
  } catch {
    return DEFAULT_COMMENTS_REGISTRY[slug] || []
  }
}

function saveStoredCommentsDirect(slug: string, comments: BlogComment[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(`${COMMENTS_STORAGE_KEY_PREFIX}${slug}`, JSON.stringify(comments))
  } catch (e) {
    console.error("Failed to save comments in localStorage:", e)
  }
}

// Simulated network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export interface PaginatedCommentsResponse {
  comments: BlogComment[]
  totalCount: number
  hasMore: boolean
  currentPage: number
  totalPages: number
}

/**
 * Simulated Async API Client.
 * When integrating with a real backend (e.g. Next.js, Express, Fastify, Supabase, Postgres),
 * simply replace the simulated delays and localStorage calls with `fetch('/api/...')`.
 */
export const CommentsApi = {
  /**
   * Fetch paginated comments for a blog post
   */
  async getComments(
    slug: string,
    page: number = 1,
    pageSize: number = 3,
    sortBy: "newest" | "top" | "oldest" = "newest"
  ): Promise<PaginatedCommentsResponse> {
    // Simulate real API latency
    await delay(350)

    const allComments = getStoredCommentsDirect(slug)

    // Sort top-level comments
    const sorted = [...allComments].sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
      if (sortBy === "top") {
        return (b.likes || 0) - (a.likes || 0)
      }
      return 0
    })

    const totalCount = sorted.reduce(
      (acc, c) => acc + 1 + (c.replies ? c.replies.length : 0),
      0
    )

    const totalPages = Math.ceil(sorted.length / pageSize) || 1
    const startIndex = 0
    const endIndex = page * pageSize
    const paginatedItems = sorted.slice(startIndex, endIndex)
    const hasMore = endIndex < sorted.length

    return {
      comments: paginatedItems,
      totalCount,
      hasMore,
      currentPage: page,
      totalPages,
    }
  },

  /**
   * Post a new top-level comment
   */
  async addComment(slug: string, author: AuthUser, content: string): Promise<BlogComment> {
    await delay(400)

    const current = getStoredCommentsDirect(slug)
    const newComment: BlogComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      postSlug: slug,
      author,
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
      replies: [],
    }

    const updated = [newComment, ...current]
    saveStoredCommentsDirect(slug, updated)
    return newComment
  },

  /**
   * Post a reply to an existing comment
   */
  async addReply(
    slug: string,
    parentId: string,
    author: AuthUser,
    content: string
  ): Promise<BlogComment> {
    await delay(350)

    const current = getStoredCommentsDirect(slug)
    const newReply: BlogComment = {
      id: `reply-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      postSlug: slug,
      parentId,
      author,
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
    }

    const updated = current.map((comment) => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newReply],
        }
      }
      return comment
    })

    saveStoredCommentsDirect(slug, updated)
    return newReply
  },

  /**
   * Toggle like/upvote on a comment or reply
   */
  async toggleLike(
    slug: string,
    commentId: string,
    parentId?: string | null
  ): Promise<void> {
    await delay(150)

    const current = getStoredCommentsDirect(slug)
    const updated = current.map((comment) => {
      if (comment.id === commentId) {
        const isLiked = !comment.isLiked
        return {
          ...comment,
          isLiked,
          likes: isLiked ? comment.likes + 1 : Math.max(0, comment.likes - 1),
        }
      }
      if (parentId && comment.id === parentId && comment.replies) {
        const updatedReplies = comment.replies.map((reply) => {
          if (reply.id === commentId) {
            const isLiked = !reply.isLiked
            return {
              ...reply,
              isLiked,
              likes: isLiked ? reply.likes + 1 : Math.max(0, reply.likes - 1),
            }
          }
          return reply
        })
        return { ...comment, replies: updatedReplies }
      }
      return comment
    })

    saveStoredCommentsDirect(slug, updated)
  },

  /**
   * Delete a comment or reply
   */
  async deleteComment(
    slug: string,
    commentId: string,
    parentId?: string | null
  ): Promise<void> {
    await delay(250)

    const current = getStoredCommentsDirect(slug)
    let updated: BlogComment[]
    if (parentId) {
      updated = current.map((comment) => {
        if (comment.id === parentId && comment.replies) {
          return {
            ...comment,
            replies: comment.replies.filter((r) => r.id !== commentId),
          }
        }
        return comment
      })
    } else {
      updated = current.filter((c) => c.id !== commentId)
    }

    saveStoredCommentsDirect(slug, updated)
  },
}
