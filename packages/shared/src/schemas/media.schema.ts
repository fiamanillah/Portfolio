// packages/shared/src/schemas/media.schema.ts
import { z } from "zod";

export const presignedUrlSchema = z.object({
  fileName: z
    .string()
    .min(1, "Filename is required")
    .max(255, "Filename is too long"),
  mimeType: z
    .string()
    .min(1, "MIME type is required")
    .regex(/^[a-zA-Z0-9.+_-]+\/[a-zA-Z0-9.+_-]+$/, "Invalid MIME type format"),
  size: z
    .number()
    .int()
    .positive("File size must be positive")
    .max(104857600, "File size exceeds maximum limit of 100MB"),
  folder: z
    .string()
    .regex(/^[a-zA-Z0-9_-]+$/, "Folder name must be alphanumeric with hyphens or underscores")
    .optional()
    .default("general"),
  source: z.string().optional().default("API"),
  entityType: z.string().optional(),
  entityId: z.string().uuid("Invalid entity UUID").optional(),
  tags: z.array(z.string().trim().min(1)).optional().default([]),
  altText: z.string().max(255).optional(),
  caption: z.string().max(500).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  isPublic: z.boolean().optional().default(true),
  expiresInSeconds: z.number().int().min(60).max(3600).optional().default(900),
});

export const confirmPresignedSchema = z.object({
  id: z.string().uuid("Invalid media ID").optional(),
  key: z.string().min(1, "Object key is required"),
  size: z.number().int().positive().optional(),
  etag: z.string().optional(),
  altText: z.string().max(255).optional(),
  caption: z.string().max(500).optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const updateMediaSchema = z.object({
  fileName: z.string().min(1, "Filename cannot be empty").max(255).optional(),
  altText: z.string().max(255).nullable().optional(),
  caption: z.string().max(500).nullable().optional(),
  folder: z
    .string()
    .regex(/^[a-zA-Z0-9_-]+$/, "Folder name must be alphanumeric with hyphens or underscores")
    .optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
  metadata: z.record(z.string(), z.any()).nullable().optional(),
  isPublic: z.boolean().optional(),
});

export const listMediaQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  folder: z.string().optional(),
  source: z.string().optional(),
  mimeType: z.string().optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  tag: z.string().optional(),
  uploaderId: z.string().optional(),
  isPublic: z
    .enum(["true", "false", "all"])
    .optional()
    .transform((val) => (val === "true" ? true : val === "false" ? false : undefined)),
  sortBy: z
    .enum(["createdAt", "size", "fileName", "updatedAt"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const bulkDeleteMediaSchema = z.object({
  ids: z.array(z.string().uuid("Invalid media ID")).optional(),
  keys: z.array(z.string().min(1)).optional(),
}).refine(
  (data) => (data.ids && data.ids.length > 0) || (data.keys && data.keys.length > 0),
  { message: "Either 'ids' or 'keys' must be provided with at least one item" }
);

export const bulkUpdateMediaSchema = z.object({
  ids: z.array(z.string().uuid("Invalid media ID")).min(1, "At least one media ID is required"),
  folder: z
    .string()
    .regex(/^[a-zA-Z0-9_-]+$/, "Folder name must be alphanumeric with hyphens or underscores")
    .optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
  isPublic: z.boolean().optional(),
});

export type PresignedUrlInput = z.infer<typeof presignedUrlSchema>;
export type ConfirmPresignedInput = z.infer<typeof confirmPresignedSchema>;
export type UpdateMediaInput = z.infer<typeof updateMediaSchema>;
export type ListMediaQueryInput = z.infer<typeof listMediaQuerySchema>;
export type BulkDeleteMediaInput = z.infer<typeof bulkDeleteMediaSchema>;
export type BulkUpdateMediaInput = z.infer<typeof bulkUpdateMediaSchema>;
