// apps/api/src/Modules/Media/MediaDTO.ts
import { z } from "zod";
export {
  presignedUrlSchema,
  confirmPresignedSchema,
  updateMediaSchema,
  listMediaQuerySchema,
  bulkDeleteMediaSchema,
  bulkUpdateMediaSchema,
} from "@workspace/shared";

export const uploadMediaBodySchema = z.object({
  folder: z
    .string()
    .regex(/^[a-zA-Z0-9_-]+$/, "Folder name must be alphanumeric with hyphens or underscores")
    .optional()
    .default("general"),
  source: z.string().optional().default("API"),
  entityType: z.string().optional(),
  entityId: z.string().uuid("Invalid entity UUID").optional(),
  tags: z
    .union([z.array(z.string()), z.string()])
    .optional()
    .transform((val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [val];
      } catch {
        return val.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }),
  altText: z.string().max(255).optional(),
  caption: z.string().max(500).optional(),
  isPublic: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => {
      if (typeof val === "boolean") return val;
      if (val === "true" || val === "1") return true;
      if (val === "false" || val === "0") return false;
      return true;
    }),
  metadata: z
    .union([z.record(z.string(), z.any()), z.string()])
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      if (typeof val === "object") return val;
      try {
        return JSON.parse(val);
      } catch {
        return undefined;
      }
    }),
  allowDuplicate: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => {
      if (typeof val === "boolean") return val;
      if (val === "true" || val === "1") return true;
      return false;
    }),
});

export const mediaIdParamSchema = z.object({
  id: z.string().uuid("Invalid media UUID"),
});

export const cleanupMediaSchema = z.object({
  olderThanDays: z.coerce.number().min(0).max(365).optional().default(1),
  type: z.enum(["all", "avatars", "blog", "temp"]).optional().default("all"),
  dryRun: z.coerce.boolean().optional().default(false),
});

export interface UploadMediaOptions {
  folder?: string;
  source?: string;
  entityType?: string;
  entityId?: string;
  tags?: string[];
  altText?: string;
  caption?: string;
  isPublic?: boolean;
  allowDuplicate?: boolean;
  metadata?: Record<string, any>;
}

export type UploadMediaBody = z.infer<typeof uploadMediaBodySchema>;
export type MediaIdParam = z.infer<typeof mediaIdParamSchema>;
export type CleanupMediaBody = z.infer<typeof cleanupMediaSchema>;
