// packages/shared/src/schemas/skill.schema.ts
import { z } from "zod";

export const skillStatusEnumSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

// =========================================================================
// SKILL CATEGORY SCHEMAS
// =========================================================================

export const createSkillCategorySchema = z.object({
  slug: z.string().min(1, "Slug is required").max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  code: z.string().min(1, "Code is required").max(50),
  title: z.string().min(1, "Title is required").max(150),
  badge: z.string().min(1, "Badge is required").max(100),
  ordinal: z.string().max(10).optional().default("01"),
  suffix: z.string().max(10).optional().default("ST"),
  icon: z.string().max(100).optional().nullable().or(z.literal("")),
  color: z.string().max(50).optional().default("blue"),
  description: z.string().max(500).optional().nullable().or(z.literal("")),
  order: z.number().int().optional().default(0),
  status: skillStatusEnumSchema.optional().default("PUBLISHED"),
});

export const updateSkillCategorySchema = createSkillCategorySchema.partial();

export const reorderSkillCategoriesSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().uuid("Invalid category ID format"),
        order: z.number().int(),
      })
    )
    .min(1, "Items array must not be empty"),
});

// =========================================================================
// SKILL ITEM SCHEMAS
// =========================================================================

export const createSkillSchema = z.object({
  name: z.string().min(1, "Skill name is required").max(150),
  leftLabel: z.string().max(100).optional().nullable().or(z.literal("")),
  rightLabel: z.string().max(100).optional().nullable().or(z.literal("")),
  level: z.coerce.number().int().min(1).max(5).optional().default(5),
  icon: z.string().max(255).optional().nullable().or(z.literal("")),
  tags: z.array(z.string().trim()).optional().default([]),
  featured: z.boolean().optional().default(false),
  order: z.number().int().optional().default(0),
  status: skillStatusEnumSchema.optional().default("PUBLISHED"),
  categoryId: z.string().uuid("Invalid category ID").optional().nullable().or(z.literal("")),
});

export const updateSkillSchema = createSkillSchema.partial();

export const listSkillsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().trim().optional(),
  categoryId: z.string().trim().optional(),
  status: skillStatusEnumSchema.optional(),
  featured: z.preprocess((val) => {
    if (val === "true" || val === true) return true;
    if (val === "false" || val === false) return false;
    return undefined;
  }, z.boolean().optional()),
  tag: z.string().trim().optional(),
  sortBy: z.enum(["order", "name", "level", "createdAt", "updatedAt"]).optional().default("order"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
});

export const publicSkillQuerySchema = z.object({
  featured: z.preprocess((val) => {
    if (val === "true" || val === true) return true;
    if (val === "false" || val === false) return false;
    return undefined;
  }, z.boolean().optional()),
});

export const bulkSkillStatusSchema = z.object({
  ids: z.array(z.string().uuid("Invalid ID format")).min(1, "At least one ID is required"),
  status: skillStatusEnumSchema,
});

export const bulkSkillDeleteSchema = z.object({
  ids: z.array(z.string().uuid("Invalid ID format")).min(1, "At least one ID is required"),
});

export const reorderSkillsSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().uuid("Invalid ID format"),
        order: z.number().int(),
        categoryId: z.string().uuid("Invalid Category ID").optional().nullable(),
      })
    )
    .min(1, "Items array must not be empty"),
});
