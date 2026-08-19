// packages/shared/src/schemas/experience.schema.ts
import { z } from "zod";

export const experienceStatusEnumSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const experienceStatItemSchema = z.object({
  label: z.string().min(1, "Stat label is required").max(100),
  value: z.string().min(1, "Stat value is required").max(200),
});

export const createExperienceSchema = z.object({
  company: z.string().min(1, "Company name is required").max(150),
  companyUrl: z.string().url("Company URL must be a valid URL").optional().nullable().or(z.literal("")),
  companyLogo: z.string().max(500).optional().nullable().or(z.literal("")),
  role: z.string().min(1, "Role is required").max(150),
  title: z.array(z.string().trim()).optional().default([]),
  location: z.string().min(1, "Location is required").max(150),
  employmentType: z.string().max(100).optional().default("Full-Time"),
  period: z.string().min(1, "Period is required").max(100),
  year: z.string().min(1, "Year is required").max(50),
  startDate: z.string().datetime({ offset: true }).optional().nullable().or(z.string().optional().nullable()),
  endDate: z.string().datetime({ offset: true }).optional().nullable().or(z.string().optional().nullable()),
  isCurrent: z.boolean().optional().default(false),
  description: z.string().min(5, "Description must be at least 5 characters"),
  highlights: z.array(z.string().trim()).optional().default([]),
  technologies: z.array(z.string().trim()).optional().default([]),
  stats: z.array(experienceStatItemSchema).optional().default([]),
  learned: z.string().optional().nullable(),
  status: experienceStatusEnumSchema.optional().default("PUBLISHED"),
  featured: z.boolean().optional().default(true),
  order: z.number().int().optional().default(0),
});

export const updateExperienceSchema = createExperienceSchema.partial();

export const listExperiencesQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  search: z.string().trim().optional(),
  status: experienceStatusEnumSchema.optional(),
  employmentType: z.string().trim().optional(),
  tech: z.string().trim().optional(),
  featured: z.preprocess((val) => {
    if (val === "true" || val === true) return true;
    if (val === "false" || val === false) return false;
    return undefined;
  }, z.boolean().optional()),
  sortBy: z.enum(["order", "year", "createdAt", "company", "role"]).optional().default("order"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
});

export const publicExperienceQuerySchema = z.object({
  featured: z.preprocess((val) => {
    if (val === "true" || val === true) return true;
    if (val === "false" || val === false) return false;
    return undefined;
  }, z.boolean().optional()),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const bulkExperienceStatusSchema = z.object({
  ids: z.array(z.string().uuid("Invalid ID format")).min(1, "At least one ID is required"),
  status: experienceStatusEnumSchema,
});

export const bulkExperienceDeleteSchema = z.object({
  ids: z.array(z.string().uuid("Invalid ID format")).min(1, "At least one ID is required"),
});

export const reorderExperiencesSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().uuid("Invalid ID format"),
        order: z.number().int(),
      })
    )
    .min(1, "Items array must not be empty"),
});
