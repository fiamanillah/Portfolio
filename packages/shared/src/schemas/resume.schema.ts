// packages/shared/src/schemas/resume.schema.ts
import { z } from "zod";

export const createResumeSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(120, "Title cannot exceed 120 characters"),
  version: z
    .string()
    .min(1, "Version is required (e.g. v2.0, 2026.1)")
    .max(30, "Version cannot exceed 30 characters"),
  description: z
    .string()
    .max(2000, "Description cannot exceed 2000 characters")
    .optional(),
  isActive: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => {
      if (typeof val === "boolean") return val;
      if (typeof val === "string") return val === "true" || val === "1";
      return false;
    }),
});

export const updateResumeSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(120, "Title cannot exceed 120 characters")
    .optional(),
  version: z
    .string()
    .min(1, "Version is required")
    .max(30, "Version cannot exceed 30 characters")
    .optional(),
  description: z
    .string()
    .max(2000, "Description cannot exceed 2000 characters")
    .nullable()
    .optional(),
  isActive: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => {
      if (typeof val === "boolean") return val;
      if (typeof val === "string") return val === "true" || val === "1";
      return undefined;
    }),
});

export const resumeQuerySchema = z.object({
  page: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (typeof val === "number") return val;
      return val ? Math.max(1, parseInt(val, 10)) : 1;
    }),
  limit: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (typeof val === "number") return val;
      return val ? Math.min(100, Math.max(1, parseInt(val, 10))) : 20;
    }),
  search: z.string().optional(),
  isActive: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((val) => {
      if (val === undefined || val === null || val === "" || val === "all")
        return undefined;
      if (typeof val === "boolean") return val;
      return val === "true" || val === "1";
    }),
  sortBy: z
    .enum(["createdAt", "updatedAt", "version", "downloadCount", "title"])
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
