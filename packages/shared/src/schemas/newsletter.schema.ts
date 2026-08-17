// packages/shared/src/schemas/newsletter.schema.ts
import { z } from "zod";

export const newsletterStatusEnumSchema = z.enum([
  "DRAFT",
  "SCHEDULED",
  "SENDING",
  "SENT",
  "FAILED",
  "CANCELLED",
]);

export const audienceTypeEnumSchema = z.enum(["ALL", "SEGMENT", "CUSTOM"]);

export const sendLogStatusEnumSchema = z.enum([
  "PENDING",
  "SENT",
  "FAILED",
  "BOUNCED",
]);

export const createNewsletterSchema = z.object({
  title: z
    .string()
    .min(2, "Campaign title must be at least 2 characters")
    .max(150, "Campaign title must not exceed 150 characters"),
  subject: z
    .string()
    .min(1, "Subject line is required")
    .max(250, "Subject must not exceed 250 characters"),
  previewText: z
    .string()
    .max(300, "Preview text must not exceed 300 characters")
    .optional()
    .nullable(),
  content: z.string().min(1, "Newsletter content cannot be empty"),
  templateId: z.string().uuid("Invalid template ID").optional().nullable(),
  senderName: z.string().max(100).optional().nullable(),
  senderEmail: z.string().email("Invalid sender email").optional().nullable(),
  replyTo: z.string().email("Invalid reply-to email").optional().nullable(),
  targetAudience: audienceTypeEnumSchema.default("ALL"),
  includedSources: z.array(z.string()).default([]).optional(),
  includedTags: z.array(z.string()).default([]).optional(),
  includedEmails: z.array(z.string().email()).default([]).optional(),
  excludedEmails: z.array(z.string().email()).default([]).optional(),
  excludedSources: z.array(z.string()).default([]).optional(),
  scheduledAt: z.union([z.string(), z.date()]).optional().nullable(),
  metadata: z.record(z.string(), z.any()).optional().nullable(),
});

export const updateNewsletterSchema = z.object({
  title: z.string().min(2).max(150).optional(),
  subject: z.string().min(1).max(250).optional(),
  previewText: z.string().max(300).optional().nullable(),
  content: z.string().min(1).optional(),
  templateId: z.string().uuid().optional().nullable(),
  senderName: z.string().max(100).optional().nullable(),
  senderEmail: z.string().email().optional().nullable(),
  replyTo: z.string().email().optional().nullable(),
  targetAudience: audienceTypeEnumSchema.optional(),
  includedSources: z.array(z.string()).optional(),
  includedTags: z.array(z.string()).optional(),
  includedEmails: z.array(z.string().email()).optional(),
  excludedEmails: z.array(z.string().email()).optional(),
  excludedSources: z.array(z.string()).optional(),
  scheduledAt: z.union([z.string(), z.date()]).optional().nullable(),
  metadata: z.record(z.string(), z.any()).optional().nullable(),
});

export const listNewslettersQuerySchema = z.object({
  page: z.union([z.string(), z.number()]).optional().transform((val) => {
    if (typeof val === "number") return val;
    return val ? Math.max(1, parseInt(val, 10)) : 1;
  }),
  limit: z.union([z.string(), z.number()]).optional().transform((val) => {
    if (typeof val === "number") return val;
    return val ? Math.min(100, Math.max(1, parseInt(val, 10))) : 20;
  }),
  search: z.string().optional(),
  status: z.union([newsletterStatusEnumSchema, z.literal("ALL")]).optional(),
  targetAudience: z.union([audienceTypeEnumSchema, z.literal("ALL")]).optional(),
  sortBy: z
    .enum(["title", "subject", "status", "scheduledAt", "sentAt", "createdAt", "updatedAt"])
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const calculateRecipientsSchema = z.object({
  targetAudience: audienceTypeEnumSchema.default("ALL").optional(),
  includedSources: z.array(z.string()).default([]).optional(),
  includedTags: z.array(z.string()).default([]).optional(),
  includedEmails: z.array(z.string().email()).default([]).optional(),
  excludedEmails: z.array(z.string().email()).default([]).optional(),
  excludedSources: z.array(z.string()).default([]).optional(),
});

export const sendTestNewsletterSchema = z.object({
  newsletterId: z.string().uuid().optional(),
  subject: z.string().optional(),
  previewText: z.string().optional().nullable(),
  content: z.string().optional(),
  testEmails: z
    .array(z.string().email("Must be a valid email"))
    .min(1, "Provide at least one test email recipient"),
  senderName: z.string().optional().nullable(),
  senderEmail: z.string().email().optional().nullable(),
});

export const scheduleNewsletterSchema = z.object({
  scheduledAt: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid ISO date string")
    .refine((val) => new Date(val).getTime() > Date.now(), "Scheduled time must be in the future"),
});

export const spamCheckSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  previewText: z.string().optional().nullable(),
  content: z.string().min(1, "Content is required"),
  senderEmail: z.string().email().optional().nullable(),
});

export const listNewsletterLogsQuerySchema = z.object({
  page: z.union([z.string(), z.number()]).optional().transform((val) => {
    if (typeof val === "number") return val;
    return val ? Math.max(1, parseInt(val, 10)) : 1;
  }),
  limit: z.union([z.string(), z.number()]).optional().transform((val) => {
    if (typeof val === "number") return val;
    return val ? Math.min(100, Math.max(1, parseInt(val, 10))) : 50;
  }),
  search: z.string().optional(),
  status: z.union([sendLogStatusEnumSchema, z.literal("ALL")]).optional(),
  sortBy: z.enum(["email", "status", "sentAt", "createdAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
