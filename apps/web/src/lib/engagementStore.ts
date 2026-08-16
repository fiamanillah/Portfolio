import { useSyncExternalStore, useCallback } from "react"
import type { BlogComment, PostReactions, AuthUser } from "@/data/commentsData"
import { BlogApi } from "./api/blogApi"
import { CommentsApi, type GuestCommentPayload } from "./api/commentsApi"

const ENGAGEMENT_EVENT_NAME = "portfolio:engagement-change"

interface EngagementChangeEventDetail {
  slug: string
  type: "like" | "reaction" | "comment" | "comment_like"
}

const EMPTY_REACTIONS: PostReactions = {
  likes: 0,
  fire: 0,
  insightful: 0,
  fast: 0,
  rocket: 0,
}

// In-memory cache for stable snapshots
const reactionsSnapshotCache = new Map<
  string,
  { raw: string | null; parsed: PostReactions }
>()
const commentsSnapshotCache = new Map<
  string,
  { raw: string | null; parsed: BlogComment[] }
>()

// ----------------------------------------------------
// Reaction & Post Like Helpers
// ----------------------------------------------------

export function getStoredReactions(slug: string): PostReactions {
  if (typeof window === "undefined") return EMPTY_REACTIONS

  try {
    const raw = localStorage.getItem(`portfolio_reactions_${slug}`)
    const cached = reactionsSnapshotCache.get(slug)
    if (cached && cached.raw === raw) {
      return cached.parsed
    }

    if (!raw) {
      reactionsSnapshotCache.set(slug, { raw: null, parsed: EMPTY_REACTIONS })
      return EMPTY_REACTIONS
    }

    const parsed = JSON.parse(raw) as PostReactions
    reactionsSnapshotCache.set(slug, { raw, parsed })
    return parsed
  } catch (e) {
    console.error("Failed to parse stored reactions:", e)
    return EMPTY_REACTIONS
  }
}

export function saveStoredReactions(
  slug: string,
  reactions: PostReactions
): void {
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

  // Persist to backend database via BlogApi
  BlogApi.reactToPost(slug, "like")
    .then((res) => {
      if (res) {
        const latest = getStoredReactions(slug)
        saveStoredReactions(slug, {
          ...latest,
          likes: res.likesCount,
          userLiked: res.userLiked,
        })
      }
    })
    .catch(() => {})

  return updated
}

export function toggleEmojiReaction(
  slug: string,
  key: "fire" | "insightful" | "fast" | "rocket"
): PostReactions {
  const current = getStoredReactions(slug)
  const userReactions = current.userReactions || {}
  const isCurrentlyActive = !userReactions[key]

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

  // Persist to backend database via BlogApi
  BlogApi.reactToPost(slug, key)
    .then((res) => {
      if (res) {
        const latest = getStoredReactions(slug)
        saveStoredReactions(slug, {
          ...latest,
          likes: res.likesCount,
        })
      }
    })
    .catch(() => {})

  return updated
}

// ----------------------------------------------------
// Comments & Replies Helpers
// ----------------------------------------------------

export function getStoredComments(slug: string): BlogComment[] {
  if (typeof window === "undefined") return []

  try {
    const raw = localStorage.getItem(`portfolio_comments_${slug}`)
    const cached = commentsSnapshotCache.get(slug)
    if (cached && cached.raw === raw) {
      return cached.parsed
    }

    if (!raw) {
      commentsSnapshotCache.set(slug, { raw: null, parsed: [] })
      return []
    }

    const parsed = JSON.parse(raw) as BlogComment[]
    commentsSnapshotCache.set(slug, { raw, parsed })
    return parsed
  } catch (e) {
    console.error("Failed to parse stored comments:", e)
    return []
  }
}

export function saveStoredComments(
  slug: string,
  comments: BlogComment[]
): void {
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

export async function addComment(
  slug: string,
  author: AuthUser | GuestCommentPayload,
  content: string
): Promise<BlogComment> {
  const newComment = await CommentsApi.addComment(slug, author, content)
  const current = getStoredComments(slug)
  const existingIndex = current.findIndex((c) => c.id === newComment.id)
  const updated =
    existingIndex >= 0
      ? current.map((c) => (c.id === newComment.id ? newComment : c))
      : [newComment, ...current]

  saveStoredComments(slug, updated)
  return newComment
}

export async function addReply(
  slug: string,
  parentId: string,
  author: AuthUser | GuestCommentPayload,
  content: string
): Promise<BlogComment> {
  const newReply = await CommentsApi.addReply(slug, parentId, author, content)
  const current = getStoredComments(slug)

  const updated = current.map((comment) => {
    if (comment.id === parentId) {
      const replies = comment.replies || []
      const exists = replies.some((r) => r.id === newReply.id)
      return {
        ...comment,
        replies: exists
          ? replies.map((r) => (r.id === newReply.id ? newReply : r))
          : [...replies, newReply],
      }
    }
    return comment
  })

  saveStoredComments(slug, updated)
  return newReply
}

export async function toggleCommentLike(
  slug: string,
  commentId: string,
  parentId?: string | null
): Promise<void> {
  // Optimistic local update
  const current = getStoredComments(slug)
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

  saveStoredComments(slug, updated)

  // Persist to backend database via CommentsApi
  CommentsApi.toggleLike(slug, commentId, parentId).catch(() => {})
}

export async function deleteComment(
  slug: string,
  commentId: string,
  parentId?: string | null
): Promise<void> {
  // Optimistic delete
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

  // Call API
  CommentsApi.deleteComment(slug, commentId, parentId).catch(() => {})
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
    () => EMPTY_REACTIONS
  )

  const comments = useSyncExternalStore(
    subscribe,
    () => getStoredComments(slug),
    () => []
  )

  const totalCommentsCount = comments.reduce(
    (acc, c) => acc + 1 + (c.replies ? c.replies.length : 0),
    0
  )

  return {
    reactions,
    comments,
    totalCommentsCount,
    setComments: (newComments: BlogComment[]) =>
      saveStoredComments(slug, newComments),
    setReactions: (newReactions: PostReactions) =>
      saveStoredReactions(slug, newReactions),
    toggleLike: () => togglePostLike(slug),
    toggleReaction: (key: "fire" | "insightful" | "fast" | "rocket") =>
      toggleEmojiReaction(slug, key),
    addComment: (author: AuthUser | GuestCommentPayload, content: string) =>
      addComment(slug, author, content),
    addReply: (
      parentId: string,
      author: AuthUser | GuestCommentPayload,
      content: string
    ) => addReply(slug, parentId, author, content),
    toggleCommentLike: (commentId: string, parentId?: string | null) =>
      toggleCommentLike(slug, commentId, parentId),
    deleteComment: (commentId: string, parentId?: string | null) =>
      deleteComment(slug, commentId, parentId),
  }
}
