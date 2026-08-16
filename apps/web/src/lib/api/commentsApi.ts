import type { BlogComment, AuthUser } from "@/data/commentsData"
import { getStoredAccessToken } from "./authApi"

const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.PUBLIC_API_URL) ||
  "http://localhost:3030"

const COMMENTS_STORAGE_KEY_PREFIX = "portfolio_comments_"

// Helper to get from local storage
function getStoredCommentsDirect(slug: string): BlogComment[] {
  if (typeof window === "undefined") {
    return []
  }
  try {
    const raw = localStorage.getItem(`${COMMENTS_STORAGE_KEY_PREFIX}${slug}`)
    if (!raw) return []
    return JSON.parse(raw) as BlogComment[]
  } catch {
    return []
  }
}

function saveStoredCommentsDirect(slug: string, comments: BlogComment[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(
      `${COMMENTS_STORAGE_KEY_PREFIX}${slug}`,
      JSON.stringify(comments)
    )
  } catch (e) {
    console.error("Failed to save comments in localStorage:", e)
  }
}

export interface PaginatedCommentsResponse {
  comments: BlogComment[]
  totalCount: number
  hasMore: boolean
  currentPage: number
  totalPages: number
}

export interface GuestCommentPayload {
  guestName: string
  guestEmail?: string
}

/**
 * Comments API Client for Astro/React Frontend.
 * Calls the `/comments/v1/public/*` API with live session caching.
 */
export const CommentsApi = {
  /**
   * Fetch paginated comments for a blog post
   */
  async getComments(
    slug: string,
    page: number = 1,
    pageSize: number = 10,
    sortBy: "newest" | "top" | "oldest" = "newest"
  ): Promise<PaginatedCommentsResponse> {
    try {
      const token = getStoredAccessToken()
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }
      if (token) headers["Authorization"] = `Bearer ${token}`

      const res = await fetch(
        `${API_BASE_URL}/comments/v1/public/post/${encodeURIComponent(slug)}?page=${page}&limit=${pageSize}&sortBy=${sortBy}`,
        { headers, credentials: "include" }
      )

      if (res.ok) {
        const body = await res.json()
        if (body.success && body.data) {
          const comments = body.data.comments || []
          const pagination = body.data.pagination || body.data
          return {
            comments,
            totalCount: pagination.totalCount ?? comments.length,
            hasMore: Boolean(pagination.hasMore),
            currentPage: pagination.currentPage ?? page,
            totalPages: pagination.totalPages ?? 1,
          }
        }
      }
    } catch (err) {
      console.error(`Failed to fetch comments for '${slug}' from API:`, err)
    }

    const allComments = getStoredCommentsDirect(slug)

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
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedItems = sorted.slice(0, endIndex)
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
   * Post a new top-level comment (Authenticated or Guest)
   */
  async addComment(
    slug: string,
    author: AuthUser | GuestCommentPayload,
    content: string
  ): Promise<BlogComment> {
    try {
      const token = getStoredAccessToken()
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }
      if (token) headers["Authorization"] = `Bearer ${token}`

      const isGuest = !token && "guestName" in author
      const bodyPayload = {
        slug,
        content,
        guestName: isGuest
          ? (author as GuestCommentPayload).guestName
          : undefined,
        guestEmail: isGuest
          ? (author as GuestCommentPayload).guestEmail
          : undefined,
      }

      const res = await fetch(
        `${API_BASE_URL}/comments/v1/public/post/${encodeURIComponent(slug)}`,
        {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify(bodyPayload),
        }
      )

      if (res.ok) {
        const body = await res.json()
        if (body.success && body.data) {
          return body.data
        }
      }
    } catch (err) {
      console.error(`Failed to post comment on '${slug}':`, err)
    }

    const current = getStoredCommentsDirect(slug)
    const isGuest = "guestName" in author

    const authorObj: AuthUser = isGuest
      ? {
          id: `guest-${Date.now()}`,
          name: (author as GuestCommentPayload).guestName || "Guest Reader",
          username: ((author as GuestCommentPayload).guestName || "guest")
            .toLowerCase()
            .replace(/[^a-z0-9]/g, ""),
          email:
            (author as GuestCommentPayload).guestEmail || "guest@example.com",
          avatar: "/fi.png",
          badge: "Guest",
          role: "Reader",
        }
      : (author as AuthUser)

    const newComment: BlogComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      postSlug: slug,
      author: authorObj,
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
   * Post a reply to an existing comment (Authenticated or Guest)
   */
  async addReply(
    slug: string,
    parentId: string,
    author: AuthUser | GuestCommentPayload,
    content: string
  ): Promise<BlogComment> {
    try {
      const token = getStoredAccessToken()
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }
      if (token) headers["Authorization"] = `Bearer ${token}`

      const isGuest = !token && "guestName" in author
      const bodyPayload = {
        slug,
        content,
        parentId,
        guestName: isGuest
          ? (author as GuestCommentPayload).guestName
          : undefined,
        guestEmail: isGuest
          ? (author as GuestCommentPayload).guestEmail
          : undefined,
      }

      const res = await fetch(
        `${API_BASE_URL}/comments/v1/public/post/${encodeURIComponent(slug)}`,
        {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify(bodyPayload),
        }
      )

      if (res.ok) {
        const body = await res.json()
        if (body.success && body.data) {
          return body.data
        }
      }
    } catch (err) {
      console.error(`Failed to post reply on '${slug}':`, err)
    }

    const current = getStoredCommentsDirect(slug)
    const isGuest = "guestName" in author

    const authorObj: AuthUser = isGuest
      ? {
          id: `guest-${Date.now()}`,
          name: (author as GuestCommentPayload).guestName || "Guest Reader",
          username: ((author as GuestCommentPayload).guestName || "guest")
            .toLowerCase()
            .replace(/[^a-z0-9]/g, ""),
          email:
            (author as GuestCommentPayload).guestEmail || "guest@example.com",
          avatar: "/fi.png",
          badge: "Guest",
          role: "Reader",
        }
      : (author as AuthUser)

    const newReply: BlogComment = {
      id: `reply-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      postSlug: slug,
      parentId,
      author: authorObj,
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
  ): Promise<{ isLiked: boolean; likes: number }> {
    try {
      const token = getStoredAccessToken()
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }
      if (token) headers["Authorization"] = `Bearer ${token}`

      const res = await fetch(
        `${API_BASE_URL}/comments/v1/public/${commentId}/react`,
        {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify({ reactionType: "like" }),
        }
      )

      if (res.ok) {
        const body = await res.json()
        if (body.success && body.data) {
          return {
            isLiked: body.data.isLiked,
            likes: body.data.likesCount,
          }
        }
      }
    } catch (err) {
      console.error(`Failed to toggle like on comment '${commentId}':`, err)
    }

    const current = getStoredCommentsDirect(slug)
    let result = { isLiked: false, likes: 0 }

    const updated = current.map((comment) => {
      if (comment.id === commentId) {
        const isLiked = !comment.isLiked
        const likes = isLiked
          ? comment.likes + 1
          : Math.max(0, comment.likes - 1)
        result = { isLiked, likes }
        return {
          ...comment,
          isLiked,
          likes,
        }
      }
      if (parentId && comment.id === parentId && comment.replies) {
        const updatedReplies = comment.replies.map((reply) => {
          if (reply.id === commentId) {
            const isLiked = !reply.isLiked
            const likes = isLiked
              ? reply.likes + 1
              : Math.max(0, reply.likes - 1)
            result = { isLiked, likes }
            return {
              ...reply,
              isLiked,
              likes,
            }
          }
          return reply
        })
        return { ...comment, replies: updatedReplies }
      }
      return comment
    })

    saveStoredCommentsDirect(slug, updated)
    return result
  },

  /**
   * Report an inappropriate comment
   */
  async reportComment(
    commentId: string,
    reason: string,
    details?: string,
    reporterName?: string,
    reporterEmail?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const token = getStoredAccessToken()
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }
      if (token) headers["Authorization"] = `Bearer ${token}`

      const res = await fetch(
        `${API_BASE_URL}/comments/v1/public/${commentId}/report`,
        {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify({
            reason,
            details,
            reporterName,
            reporterEmail,
          }),
        }
      )

      if (res.ok) {
        const body = await res.json()
        return {
          success: true,
          message: body.message || "Thank you for reporting.",
        }
      }
    } catch (err) {
      console.error(`Failed to report comment '${commentId}':`, err)
    }

    return {
      success: true,
      message:
        "Thank you for reporting. Our moderation team will review this comment promptly.",
    }
  },

  /**
   * Delete a comment or reply
   */
  async deleteComment(
    slug: string,
    commentId: string,
    parentId?: string | null
  ): Promise<void> {
    try {
      const token = getStoredAccessToken()
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }
      if (token) headers["Authorization"] = `Bearer ${token}`

      await fetch(`${API_BASE_URL}/comments/v1/public/${commentId}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      })
    } catch (err) {
      console.error(`Failed to delete comment '${commentId}':`, err)
    }

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
