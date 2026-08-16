import {
  DEFAULT_COMMENTS_REGISTRY,
  type BlogComment,
  type AuthUser,
} from "@/data/commentsData";
import { getStoredAccessToken } from "./authApi";

const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.PUBLIC_API_URL) ||
  "http://localhost:3030";

const COMMENTS_STORAGE_KEY_PREFIX = "portfolio_comments_";

// Helper to get from local storage or default
function getStoredCommentsDirect(slug: string): BlogComment[] {
  if (typeof window === "undefined") {
    return DEFAULT_COMMENTS_REGISTRY[slug] || [];
  }
  try {
    const raw = localStorage.getItem(`${COMMENTS_STORAGE_KEY_PREFIX}${slug}`);
    if (!raw) return DEFAULT_COMMENTS_REGISTRY[slug] || [];
    return JSON.parse(raw) as BlogComment[];
  } catch {
    return DEFAULT_COMMENTS_REGISTRY[slug] || [];
  }
}

function saveStoredCommentsDirect(slug: string, comments: BlogComment[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${COMMENTS_STORAGE_KEY_PREFIX}${slug}`, JSON.stringify(comments));
  } catch (e) {
    console.error("Failed to save comments in localStorage:", e);
  }
}

// Simulated network delay helper
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface PaginatedCommentsResponse {
  comments: BlogComment[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}

/**
 * Comments API Client for Astro/React Frontend.
 * Seamlessly calls the `/comments/v1/public/*` API with offline LocalStorage fallback.
 */
export const CommentsApi = {
  /**
   * Fetch paginated comments for a blog post
   */
  async getComments(
    slug: string,
    page: number = 1,
    pageSize: number = 5,
    sortBy: "newest" | "top" | "oldest" = "newest"
  ): Promise<PaginatedCommentsResponse> {
    try {
      const token = getStoredAccessToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(
        `${API_BASE_URL}/comments/v1/public/post/${encodeURIComponent(slug)}?page=${page}&limit=${pageSize}&sortBy=${sortBy}`,
        { headers, credentials: "include" }
      );

      if (res.ok) {
        const body = await res.json();
        if (body.success && body.data) {
          return {
            comments: body.data.comments,
            totalCount: body.data.totalCount,
            hasMore: body.data.hasMore,
            currentPage: body.data.currentPage,
            totalPages: body.data.totalPages,
          };
        }
      }
    } catch {
      // Fallback to local storage if API is offline
    }

    await delay(250);
    const allComments = getStoredCommentsDirect(slug);

    const sorted = [...allComments].sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "top") {
        return (b.likes || 0) - (a.likes || 0);
      }
      return 0;
    });

    const totalCount = sorted.reduce(
      (acc, c) => acc + 1 + (c.replies ? c.replies.length : 0),
      0
    );

    const totalPages = Math.ceil(sorted.length / pageSize) || 1;
    const startIndex = 0;
    const endIndex = page * pageSize;
    const paginatedItems = sorted.slice(startIndex, endIndex);
    const hasMore = endIndex < sorted.length;

    return {
      comments: paginatedItems,
      totalCount,
      hasMore,
      currentPage: page,
      totalPages,
    };
  },

  /**
   * Post a new top-level comment
   */
  async addComment(slug: string, author: AuthUser, content: string): Promise<BlogComment> {
    try {
      const token = getStoredAccessToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/comments/v1/public/post/${encodeURIComponent(slug)}`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ slug, content }),
      });

      if (res.ok) {
        const body = await res.json();
        if (body.success && body.data) {
          return body.data;
        }
      }
    } catch {
      // Fallback
    }

    await delay(300);
    const current = getStoredCommentsDirect(slug);
    const newComment: BlogComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      postSlug: slug,
      author,
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
      replies: [],
    };

    const updated = [newComment, ...current];
    saveStoredCommentsDirect(slug, updated);
    return newComment;
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
    try {
      const token = getStoredAccessToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/comments/v1/public/post/${encodeURIComponent(slug)}`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ slug, content, parentId }),
      });

      if (res.ok) {
        const body = await res.json();
        if (body.success && body.data) {
          return body.data;
        }
      }
    } catch {
      // Fallback
    }

    await delay(300);
    const current = getStoredCommentsDirect(slug);
    const newReply: BlogComment = {
      id: `reply-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      postSlug: slug,
      parentId,
      author,
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
    };

    const updated = current.map((comment) => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newReply],
        };
      }
      return comment;
    });

    saveStoredCommentsDirect(slug, updated);
    return newReply;
  },

  /**
   * Toggle like/upvote on a comment or reply
   */
  async toggleLike(
    slug: string,
    commentId: string,
    parentId?: string | null
  ): Promise<void> {
    try {
      const token = getStoredAccessToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      await fetch(`${API_BASE_URL}/comments/v1/public/${commentId}/react`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ reactionType: "like" }),
      });
    } catch {
      // Fallback
    }

    const current = getStoredCommentsDirect(slug);
    const updated = current.map((comment) => {
      if (comment.id === commentId) {
        const isLiked = !comment.isLiked;
        return {
          ...comment,
          isLiked,
          likes: isLiked ? comment.likes + 1 : Math.max(0, comment.likes - 1),
        };
      }
      if (parentId && comment.id === parentId && comment.replies) {
        const updatedReplies = comment.replies.map((reply) => {
          if (reply.id === commentId) {
            const isLiked = !reply.isLiked;
            return {
              ...reply,
              isLiked,
              likes: isLiked ? reply.likes + 1 : Math.max(0, reply.likes - 1),
            };
          }
          return reply;
        });
        return { ...comment, replies: updatedReplies };
      }
      return comment;
    });

    saveStoredCommentsDirect(slug, updated);
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
      const token = getStoredAccessToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/comments/v1/public/${commentId}/report`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ reason, details, reporterName, reporterEmail }),
      });

      if (res.ok) {
        const body = await res.json();
        return { success: true, message: body.message || "Thank you for reporting." };
      }
    } catch {
      // Fallback
    }

    await delay(300);
    return {
      success: true,
      message: "Thank you for reporting. Our moderation team will review this comment promptly.",
    };
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
      const token = getStoredAccessToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      await fetch(`${API_BASE_URL}/comments/v1/public/${commentId}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });
    } catch {
      // Fallback
    }

    const current = getStoredCommentsDirect(slug);
    let updated: BlogComment[];
    if (parentId) {
      updated = current.map((comment) => {
        if (comment.id === parentId && comment.replies) {
          return {
            ...comment,
            replies: comment.replies.filter((r) => r.id !== commentId),
          };
        }
        return comment;
      });
    } else {
      updated = current.filter((c) => c.id !== commentId);
    }

    saveStoredCommentsDirect(slug, updated);
  },
};
