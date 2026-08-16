// packages/shared/src/schemas/comment.schema.ts
import { z } from "zod";

export const postCommentSchema = z.object({
  slug: z.string().min(1, "Post slug is required"),
  content: z
    .string()
    .min(1, "Comment content cannot be empty")
    .max(2000, "Comment cannot exceed 2000 characters")
    .transform((val) => val.trim()),
  parentId: z.string().optional().nullable(),
});

export const postReactionSchema = z.object({
  slug: z.string().min(1, "Post slug is required"),
  reactionType: z.enum([
    "like",
    "fire",
    "insightful",
    "fast",
    "rocket",
    "heart",
    "unicorn",
    "clap",
  ]),
});
