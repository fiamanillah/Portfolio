// packages/shared/src/types/comments.ts
import { z } from "zod";
import { AuthUser } from "./user";
import { postCommentSchema, postReactionSchema } from "../schemas/comment.schema";

export type PostCommentInput = z.infer<typeof postCommentSchema>;
export type PostReactionInput = z.infer<typeof postReactionSchema>;

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

export interface BlogComment {
  id: string;
  postSlug: string;
  slug?: string;
  author: AuthUser;
  content: string;
  createdAt: string; // ISO string
  likes: number;
  isLiked?: boolean;
  parentId?: string | null;
  replies?: BlogComment[];
  reactions?: {
    thumbsUp?: number;
    heart?: number;
    rocket?: number;
    eyes?: number;
  };
  userReactions?: string[];
  isPinned?: boolean;
}

export interface PaginatedCommentsResponse {
  comments: BlogComment[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}
