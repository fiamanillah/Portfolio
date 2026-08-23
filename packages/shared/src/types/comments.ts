// packages/shared/src/types/comments.ts
import { z } from "zod";
import { AuthUser } from "./user";
import {
  commentStatusEnumSchema,
  commentReportReasonEnumSchema,
  commentReportStatusEnumSchema,
  postCommentSchema,
  createCommentSchema,
  updateCommentStatusSchema,
  postReactionSchema,
  reportCommentSchema,
  resolveCommentReportSchema,
  bulkCommentStatusSchema,
  bulkCommentDeleteSchema,
} from "../schemas/comment.schema";

export type CommentStatus = z.infer<typeof commentStatusEnumSchema>;
export type CommentReportReason = z.infer<typeof commentReportReasonEnumSchema>;
export type CommentReportStatus = z.infer<typeof commentReportStatusEnumSchema>;

export type PostCommentInput = z.input<typeof postCommentSchema>;
export type CreateCommentDTO = z.input<typeof createCommentSchema>;
export type UpdateCommentStatusDTO = z.input<typeof updateCommentStatusSchema>;
export type PostReactionInput = z.input<typeof postReactionSchema>;
export type ReportCommentDTO = z.input<typeof reportCommentSchema>;
export type ResolveCommentReportDTO = z.input<typeof resolveCommentReportSchema>;
export type BulkCommentStatusDTO = z.input<typeof bulkCommentStatusSchema>;
export type BulkCommentDeleteDTO = z.input<typeof bulkCommentDeleteSchema>;

export interface GuestCommentPayload {
  guestName: string;
  guestEmail?: string;
  captchaToken?: string;
  hp_field?: string;
}

export interface ListPublicCommentsQueryDTO {
  page?: number;
  limit?: number;
  sortBy?: "newest" | "oldest" | "top";
}

export interface ListAdminCommentsQueryDTO {
  page?: number;
  limit?: number;
  search?: string;
  status?: CommentStatus;
  postId?: string;
  postSlug?: string;
  reportedOnly?: boolean;
  sortBy?: "createdAt" | "likesCount" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export interface ListAdminReportsQueryDTO {
  page?: number;
  limit?: number;
  status?: CommentReportStatus;
  reason?: CommentReportReason;
  commentId?: string;
  search?: string;
  sortBy?: "createdAt" | "status" | "reason";
  sortOrder?: "asc" | "desc";
}

export interface PostReactions {
  likes: number;
  fire: number;
  insightful: number;
  fast: number;
  rocket: number;
  hearts?: number;
  unicorns?: number;
  claps?: number;
  userLiked?: boolean;
  userReactions?: {
    fire?: boolean;
    insightful?: boolean;
    fast?: boolean;
    rocket?: boolean;
    liked?: boolean;
    hearted?: boolean;
    unicorn?: boolean;
    clapped?: boolean;
  };
}

export interface CommentAuthor {
  id?: string;
  name: string;
  username?: string;
  email?: string;
  avatar?: string | null;
  role?: string | null;
  badge?: string | null;
}

export interface BlogComment {
  id: string;
  postId?: string;
  postSlug: string;
  postTitle?: string;
  slug?: string;
  author: CommentAuthor | AuthUser;
  content: string;
  status?: CommentStatus;
  createdAt: string; // ISO string
  updatedAt?: string;
  likes: number;
  isLiked?: boolean;
  isPinned?: boolean;
  parentId?: string | null;
  replies?: BlogComment[];
  repliesCount?: number;
  reportsCount?: number;
  reactions?: {
    thumbsUp?: number;
    heart?: number;
    rocket?: number;
    eyes?: number;
  };
  userReactions?: string[];
}

export interface CommentReportDTO {
  id: string;
  commentId: string;
  comment?: {
    id: string;
    content: string;
    postId: string;
    postSlug?: string;
    postTitle?: string;
    author: CommentAuthor;
    status: CommentStatus;
    createdAt: string;
  };
  reporterId?: string | null;
  reporter?: {
    id: string;
    name: string;
    email: string;
    username: string;
    avatar?: string | null;
  } | null;
  reporterName?: string | null;
  reporterEmail?: string | null;
  reason: CommentReportReason;
  details?: string | null;
  status: CommentReportStatus;
  reviewedById?: string | null;
  reviewedBy?: {
    id: string;
    name: string;
  } | null;
  resolutionNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommentAdminListItemDTO {
  id: string;
  postId: string;
  postSlug: string;
  postTitle: string;
  author: CommentAuthor;
  content: string;
  status: CommentStatus;
  isPinned: boolean;
  likesCount: number;
  parentId?: string | null;
  parentAuthorName?: string | null;
  repliesCount: number;
  reportsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommentModerationStatsDTO {
  totalComments: number;
  pendingCount: number;
  approvedCount: number;
  spamCount: number;
  rejectedCount: number;
  totalReports: number;
  pendingReportsCount: number;
}

export interface PaginatedCommentsResponse {
  comments: BlogComment[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}

export interface PaginatedAdminCommentsResponse {
  comments: CommentAdminListItemDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedAdminReportsResponse {
  reports: CommentReportDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
