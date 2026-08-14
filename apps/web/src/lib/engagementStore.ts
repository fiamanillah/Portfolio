import { useSyncExternalStore, useCallback } from "react"
import {
  DEFAULT_COMMENTS_REGISTRY,
  DEFAULT_REACTIONS_REGISTRY,
  type BlogComment,
  type PostReactions,
  type AuthUser,
} from "@/data/commentsData"

const ENGAGEMENT_EVENT_NAME = "portfolio:engagement-change"

interface EngagementChangeEventDetail {
  slug: string
  type: "like" | "reaction" | "comment" | "comment_like"
}

// In-memory cache for stable snapshots
const reactionsSnapshotCache = new Map<string, { raw: string | null; parsed: PostReactions }>()
const commentsSnapshotCache = new Map<string, { raw: string | null; parsed: BlogComment[] }>()

// ----------------------------------------------------
// Reaction & Post Like Helpers
// ----------------------------------------------------

export function getStoredReactions(slug: string): PostReactions {
  const defaultReactions = DEFAULT_REACTIONS_REGISTRY[slug] || {
    likes: 42,
    fire: 12,
    insightful: 18,
    fast: 8,
    rocket: 15,
  }

  if (typeof window === "undefined") return defaultReactions

  try {
    const raw = localStorage.getItem(`portfolio_reactions_${slug}`)
    const cached = reactionsSnapshotCache.get(slug)
    if (cached && cached.raw === raw) {
      return cached.parsed
    }

    if (!raw) {
      reactionsSnapshotCache.set(slug, { raw: null, parsed: defaultReactions })
      return defaultReactions
    }

    const parsed = JSON.parse(raw) as PostReactions
    reactionsSnapshotCache.set(slug, { raw, parsed })
    return parsed
  } catch (e) {
    console.error("Failed to parse stored reactions:", e)
    return defaultReactions
  }
}

export function saveStoredReactions(slug: string, reactions: PostReactions): void {
  if (typeof window === "undefined") return
  try {
    const raw = JSON.stringify(reactions)
    localStorage.setItem(`portfolio_reactions_${slug}`, raw)
    reactionsSnapshotCache.set(slug, { raw, parsed: reactions })
    window.dispatchEvent(
      new CustomEvent<EngagementChangeEventDetail>(ENGAGEMENT_EVENT_NAME, {
        detail: { slug, type: "reaction" },
      })
    )
  } catch (e) {
    console.error("Failed to save reactions:", e)
  }
}

export function togglePostLike(slug: string): PostReactions {
  const current = getStoredReactions(slug)
  const isLiked = !current.userLiked
  const updated: PostReactions = {
    ...current,
    likes: isLiked ? current.likes + 1 : Math.max(0, current.likes - 1),
    userLiked: isLiked,
  }
  saveStoredReactions(slug, updated)
  return updated
}

export function toggleEmojiReaction(
  slug: string,
  key: "fire" | "insightful" | "fast" | "rocket"
): PostReactions {
  const current = getStoredReactions(slug)
  const userReactions = current.userReactions || {}
  const isCurrentlyActive = !!userReactions[key]

  const updatedReactions = {
    ...userReactions,
    [key]: !isCurrentlyActive,
  }

  const updated: PostReactions = {
    ...current,
    [key]: !isCurrentlyActive
      ? (current[key] || 0) + 1
      : Math.max(0, (current[key] || 0) - 1),
    userReactions: updatedReactions,
  }

  saveStoredReactions(slug, updated)
  return updated
}

// ----------------------------------------------------
// Comments & Replies Helpers
// ----------------------------------------------------

export function getStoredComments(slug: string): BlogComment[] {
  const defaultComments = DEFAULT_COMMENTS_REGISTRY[slug] || []

  if (typeof window === "undefined") return defaultComments

  try {
    const raw = localStorage.getItem(`portfolio_comments_${slug}`)
    const cached = commentsSnapshotCache.get(slug)
    if (cached && cached.raw === raw) {
      return cached.parsed
    }

    if (!raw) {
      commentsSnapshotCache.set(slug, { raw: null, parsed: defaultComments })
      return defaultComments
    }

    const parsed = JSON.parse(raw) as BlogComment[]
    commentsSnapshotCache.set(slug, { raw, parsed })
    return parsed
  } catch (e) {
    console.error("Failed to parse stored comments:", e)
    return defaultComments
  }
}

export function saveStoredComments(slug: string, comments: BlogComment[]): void {
  if (typeof window === "undefined") return
  try {
    const raw = JSON.stringify(comments)
    localStorage.setItem(`portfolio_comments_${slug}`, raw)
    commentsSnapshotCache.set(slug, { raw, parsed: comments })
    window.dispatchEvent(
      new CustomEvent<EngagementChangeEventDetail>(ENGAGEMENT_EVENT_NAME, {
        detail: { slug, type: "comment" },
      })
    )
  } catch (e) {
    console.error("Failed to save comments:", e)
  }
}

export function addComment(
  slug: string,
  author: AuthUser,
  content: string
): BlogComment {
  const current = getStoredComments(slug)
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
  saveStoredComments(slug, updated)
  return newComment
}

export function addReply(
  slug: string,
  parentId: string,
  author: AuthUser,
  content: string
): BlogComment | null {
  const current = getStoredComments(slug)
  let createdReply: BlogComment | null = null

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
      createdReply = newReply
      return {
        ...comment,
        replies: [...(comment.replies || []), newReply],
      }
    }
    return comment
  })

  if (createdReply) {
    saveStoredComments(slug, updated)
  }
  return createdReply
}

export function toggleCommentLike(
  slug: string,
  commentId: string,
  parentId?: string | null
): void {
  const current = getStoredComments(slug)

  const updated = current.map((comment) => {
    // If it's a top-level comment
    if (comment.id === commentId) {
      const isLiked = !comment.isLiked
      return {
        ...comment,
        isLiked,
        likes: isLiked ? comment.likes + 1 : Math.max(0, comment.likes - 1),
      }
    }

    // If it's inside replies
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

  saveStoredComments(slug, updated)
}

export function deleteComment(
  slug: string,
  commentId: string,
  parentId?: string | null
): void {
  const current = getStoredComments(slug)

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

  saveStoredComments(slug, updated)
}

// ----------------------------------------------------
// React Hook for Post Engagement
// ----------------------------------------------------

function createEngagementSubscriber(slug: string) {
  return (callback: () => void) => {
    if (typeof window === "undefined") return () => {}

    const handleCustom = (e: Event) => {
      const customEvent = e as CustomEvent<EngagementChangeEventDetail>
      if (!customEvent.detail || customEvent.detail.slug === slug) {
        callback()
      }
    }

    const handleStorage = (e: StorageEvent) => {
      if (
        e.key === `portfolio_reactions_${slug}` ||
        e.key === `portfolio_comments_${slug}`
      ) {
        callback()
      }
    }

    window.addEventListener(ENGAGEMENT_EVENT_NAME, handleCustom)
    window.addEventListener("storage", handleStorage)

    return () => {
      window.removeEventListener(ENGAGEMENT_EVENT_NAME, handleCustom)
      window.removeEventListener("storage", handleStorage)
    }
  }
}

export function usePostEngagement(slug: string) {
  const subscribe = useCallback(
    (callback: () => void) => createEngagementSubscriber(slug)(callback),
    [slug]
  )

  const reactions = useSyncExternalStore(
    subscribe,
    () => getStoredReactions(slug),
    () => DEFAULT_REACTIONS_REGISTRY[slug] || { likes: 42, fire: 12, insightful: 18, fast: 8, rocket: 15 }
  )

  const comments = useSyncExternalStore(
    subscribe,
    () => getStoredComments(slug),
    () => DEFAULT_COMMENTS_REGISTRY[slug] || []
  )

  const totalCommentsCount = comments.reduce(
    (acc, c) => acc + 1 + (c.replies ? c.replies.length : 0),
    0
  )

  return {
    reactions,
    comments,
    totalCommentsCount,
    toggleLike: () => togglePostLike(slug),
    toggleReaction: (key: "fire" | "insightful" | "fast" | "rocket") =>
      toggleEmojiReaction(slug, key),
    addComment: (author: AuthUser, content: string) =>
      addComment(slug, author, content),
    addReply: (parentId: string, author: AuthUser, content: string) =>
      addReply(slug, parentId, author, content),
    toggleCommentLike: (commentId: string, parentId?: string | null) =>
      toggleCommentLike(slug, commentId, parentId),
    deleteComment: (commentId: string, parentId?: string | null) =>
      deleteComment(slug, commentId, parentId),
  }
}
