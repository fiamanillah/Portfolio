// packages/shared/src/schemas/template.schema.ts
import { z } from "zod";

export const templateTypeEnumSchema = z.enum(["TRANSACTIONAL", "MARKETING", "HEADLESS"]);

export const createTemplateSchema = z.object({
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(80, "Slug must not exceed 80 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    .optional(),
  name: z
    .string()
    .min(2, "Template name must be at least 2 characters")
    .max(120, "Template name must not exceed 120 characters"),
  description: z.string().max(500, "Description must not exceed 500 characters").optional(),
  subject: z.string().min(1, "Subject line is required").max(250, "Subject must not exceed 250 characters"),
  body: z.string().min(1, "HTML body is required"),
  from: z.string().email("Invalid sender email address").optional(),
  fromName: z.string().max(100, "Sender name must not exceed 100 characters").optional(),
  replyTo: z.string().email("Invalid reply-to email address").optional(),
  type: templateTypeEnumSchema.default("MARKETING"),
  syncToPlunk: z.boolean().default(true).optional(),
});

export const updateTemplateSchema = z.object({
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(80, "Slug must not exceed 80 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    .optional(),
  name: z.string().min(2).max(120).optional(),
  description: z.string().max(500).optional().nullable(),
  subject: z.string().min(1).max(250).optional(),
  body: z.string().min(1).optional(),
  from: z.string().email().optional().nullable(),
  fromName: z.string().max(100).optional().nullable(),
  replyTo: z.string().email().optional().nullable(),
  type: templateTypeEnumSchema.optional(),
  isActive: z.boolean().optional(),
  sampleData: z.record(z.string(), z.unknown()).optional(),
  syncToPlunk: z.boolean().default(true).optional(),
});

export const previewTemplateSchema = z.object({
  templateId: z.string().uuid("Invalid template ID").optional(),
  slug: z.string().optional(),
  subject: z.string().optional(),
  body: z.string().optional(),
  sampleData: z.record(z.string(), z.unknown()).optional().default({}),
});

export const sendTestEmailSchema = z.object({
  to: z.string().email("Valid recipient email is required"),
  templateId: z.string().uuid("Invalid template ID").optional(),
  slug: z.string().optional(),
  subject: z.string().optional(),
  body: z.string().optional(),
  data: z.record(z.string(), z.unknown()).optional().default({}),
});

export const listTemplatesQuerySchema = z.object({
  page: z.union([z.string(), z.number()]).optional().transform((val) => {
    if (typeof val === "number") return val;
    return val ? Math.max(1, parseInt(val, 10)) : 1;
  }),
  limit: z.union([z.string(), z.number()]).optional().transform((val) => {
    if (typeof val === "number") return val;
    return val ? Math.min(100, Math.max(1, parseInt(val, 10))) : 20;
  }),
  search: z.string().optional(),
  type: z.union([templateTypeEnumSchema, z.literal("ALL")]).optional(),
  source: z.enum(["ALL", "CODEBASE", "CUSTOM"]).optional(),
  syncStatus: z.enum(["ALL", "SYNCED", "LOCAL"]).optional(),
  isSystem: z.union([z.boolean(), z.enum(["true", "false"])]).optional().transform((val) => {
    if (typeof val === "boolean") return val;
    if (val === "true") return true;
    if (val === "false") return false;
    return undefined;
  }),
  sortBy: z.enum(["name", "slug", "type", "createdAt", "updatedAt", "syncedAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
