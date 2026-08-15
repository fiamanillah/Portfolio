// src/Modules/Template/TemplateDTO.ts
import { z } from "zod";

export const TemplateTypeEnum = z.enum(["TRANSACTIONAL", "MARKETING", "HEADLESS"]);

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
  type: TemplateTypeEnum.default("MARKETING"),
  syncToPlunk: z.boolean().default(true).optional(),
});

export type CreateTemplateDTO = z.infer<typeof createTemplateSchema>;

export const updateTemplateSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  description: z.string().max(500).optional().nullable(),
  subject: z.string().min(1).max(250).optional(),
  body: z.string().min(1).optional(),
  from: z.string().email().optional().nullable(),
  fromName: z.string().max(100).optional().nullable(),
  replyTo: z.string().email().optional().nullable(),
  type: TemplateTypeEnum.optional(),
  syncToPlunk: z.boolean().default(true).optional(),
});

export type UpdateTemplateDTO = z.infer<typeof updateTemplateSchema>;

export const previewTemplateSchema = z.object({
  templateId: z.string().uuid("Invalid template ID").optional(),
  slug: z.string().optional(),
  subject: z.string().optional(),
  body: z.string().optional(),
  sampleData: z.record(z.string(), z.any()).optional().default({}),
});

export type PreviewTemplateDTO = z.infer<typeof previewTemplateSchema>;

export const sendTestEmailSchema = z.object({
  to: z.string().email("Valid recipient email is required"),
  templateId: z.string().uuid("Invalid template ID").optional(),
  slug: z.string().optional(),
  subject: z.string().optional(),
  body: z.string().optional(),
  data: z.record(z.string(), z.any()).optional().default({}),
});

export type SendTestEmailDTO = z.infer<typeof sendTestEmailSchema>;

export const listTemplatesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  type: TemplateTypeEnum.optional(),
  isSystem: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
});

export type ListTemplatesQueryDTO = z.infer<typeof listTemplatesQuerySchema>;
