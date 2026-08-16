// packages/shared/src/schemas/comment.schema.ts
import { z } from "zod";

export const commentStatusEnumSchema = z.enum([
  "APPROVED",
  "PENDING",
  "SPAM",
  "REJECTED",
]);

export const commentReportReasonEnumSchema = z.enum([
  "SPAM",
  "HARASSMENT",
  "HATE_SPEECH",
  "INAPPROPRIATE",
  "MISINFORMATION",
  "OTHER",
]);

export const commentReportStatusEnumSchema = z.enum([
  "PENDING",
  "REVIEWED",
  "DISMISSED",
  "ACTION_TAKEN",
]);

export const postCommentSchema = z.object({
  slug: z.string().min(1, "Post slug is required"),
  content: z
    .string()
    .min(1, "Comment content cannot be empty")
    .max(3000, "Comment cannot exceed 3000 characters")
    .transform((val) => val.trim()),
  parentId: z.string().uuid("Invalid parent comment ID format").optional().nullable(),
  guestName: z.string().min(2, "Name must be at least 2 characters").max(60).optional().nullable(),
  guestEmail: z.string().email("Invalid email format").optional().nullable(),
});

export const createCommentSchema = postCommentSchema;

export const updateCommentStatusSchema = z.object({
  status: commentStatusEnumSchema.optional(),
  isPinned: z.boolean().optional(),
  content: z
    .string()
    .min(1, "Comment content cannot be empty")
    .max(3000)
    .transform((val) => val.trim())
    .optional(),
});

export const postReactionSchema = z.object({
  slug: z.string().min(1, "Post slug is required").optional(),
  reactionType: z
    .enum([
      "like",
      "heart",
      "fire",
      "insightful",
      "fast",
      "rocket",
      "unicorn",
      "clap",
      "thumbsUp",
    ])
    .default("like"),
});

export const reportCommentSchema = z.object({
  reason: commentReportReasonEnumSchema,
  details: z
    .string()
    .max(1000, "Details cannot exceed 1000 characters")
    .optional()
    .nullable()
    .transform((val) => val?.trim() || ""),
  reporterName: z.string().max(60).optional().nullable(),
  reporterEmail: z.string().email("Invalid email address").optional().nullable(),
});

export const resolveCommentReportSchema = z.object({
  status: commentReportStatusEnumSchema,
  resolutionNotes: z.string().max(1000).optional().nullable(),
  action: z
    .enum([
      "NO_ACTION",
      "DISMISS",
      "APPROVE_COMMENT",
      "DELETE_COMMENT",
      "MARK_SPAM",
      "REJECT_COMMENT",
    ])
    .optional()
    .default("NO_ACTION"),
});

export const listPublicCommentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
  sortBy: z.enum(["newest", "oldest", "top"]).optional().default("newest"),
});

export const listAdminCommentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().trim().optional(),
  status: commentStatusEnumSchema.optional(),
  postId: z.string().uuid().optional(),
  postSlug: z.string().optional(),
  reportedOnly: z
    .string()
    .optional()
    .transform((v) => v === "true" || v === "1")
    .or(z.boolean().optional()),
  sortBy: z.enum(["createdAt", "likesCount", "updatedAt"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const listAdminReportsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: commentReportStatusEnumSchema.optional(),
  reason: commentReportReasonEnumSchema.optional(),
  commentId: z.string().uuid().optional(),
  search: z.string().trim().optional(),
  sortBy: z.enum(["createdAt", "status", "reason"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const bulkCommentStatusSchema = z.object({
  commentIds: z
    .array(z.string().uuid("Invalid comment ID"))
    .min(1, "At least one comment ID must be provided"),
  status: commentStatusEnumSchema,
});

export const bulkCommentDeleteSchema = z.object({
  commentIds: z
    .array(z.string().uuid("Invalid comment ID"))
    .min(1, "At least one comment ID must be provided"),
});
