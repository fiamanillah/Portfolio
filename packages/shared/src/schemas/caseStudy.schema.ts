// packages/shared/src/schemas/caseStudy.schema.ts
import { z } from "zod";

export const caseStudyStatusEnumSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
export const caseStudyTypeEnumSchema = z.enum(["CASE_STUDY", "PROJECT"]);

export const caseStudyMetadataItemSchema = z.object({
  label: z.string().min(1, "Metadata label is required").max(100),
  value: z.string().min(1, "Metadata value is required").max(250),
  icon: z.string().max(100).optional().nullable(),
});

export const contextBlockSchema = z.object({
  label: z.string().min(1, "Context block label is required").max(150),
  body: z.string().min(1, "Context block body is required"),
});

export const architectureItemSchema = z.object({
  title: z.string().min(1, "Item title is required").max(150),
  subtitle: z.string().max(250).optional().nullable(),
});

export const architectureLayerSchema = z.object({
  name: z.string().min(1, "Layer name is required").max(100),
  description: z.string().min(1, "Layer description is required").max(500),
  items: z.array(architectureItemSchema).default([]),
});

export const featureItemSchema = z.object({
  title: z.string().min(1, "Feature title is required").max(200),
  description: z.string().min(1, "Feature description is required"),
  mediaType: z.string().max(100).default("Image / Video"),
  mediaLabel: z.string().max(150).default("Feature Screenshot"),
  media: z.string().min(1, "Feature media URL is required"),
  tags: z.array(z.string().trim()).optional().default([]),
  highlights: z.array(z.string().trim()).optional().default([]),
  codeLang: z.string().max(50).optional().nullable(),
});

export const performanceMetricSchema = z.object({
  value: z.string().min(1, "Metric value is required").max(50),
  label: z.string().min(1, "Metric label is required").max(250),
});

export const postMortemEntrySchema = z.object({
  heading: z.string().min(1, "Post-mortem heading is required").max(200),
  detail: z.string().min(1, "Post-mortem detail is required"),
  code: z.string().optional().nullable(),
});

export const postMortemSectionSchema = z.object({
  title: z.string().min(1, "Section title is required").max(200),
  body: z.string().optional().nullable(),
  entries: z.array(postMortemEntrySchema).default([]),
});

export const caseStudyAuthorSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Author name is required").max(100),
  role: z.string().max(100).optional().nullable(),
  avatar: z.string().max(500).optional().nullable(),
  twitter: z.string().max(100).optional().nullable(),
  linkedin: z.string().max(200).optional().nullable(),
  github: z.string().max(200).optional().nullable(),
});

export const caseStudySeoSchema = z.object({
  metaTitle: z.string().max(150, "Meta title cannot exceed 150 characters").optional().nullable(),
  metaDescription: z.string().max(500, "Meta description cannot exceed 500 characters").optional().nullable(),
  metaKeywords: z.array(z.string().trim()).optional().default([]),
  ogTitle: z.string().max(150).optional().nullable(),
  ogDescription: z.string().max(500).optional().nullable(),
  ogImage: z.string().max(500).optional().nullable(),
  twitterCard: z.enum(["summary", "summary_large_image"]).optional().nullable().default("summary_large_image"),
  twitterTitle: z.string().max(150).optional().nullable(),
  twitterDescription: z.string().max(500).optional().nullable(),
  twitterImage: z.string().max(500).optional().nullable(),
  canonicalUrl: z.string().url("Canonical URL must be a valid URL").optional().nullable().or(z.literal("")),
  structuredData: z.record(z.string(), z.any()).optional().nullable(),
});

export const createCaseStudySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(250, "Title is too long"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(250)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase alphanumeric characters and hyphens")
    .optional(),
  subtitle: z.string().max(300).optional().nullable(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  projectType: caseStudyTypeEnumSchema.optional().default("CASE_STUDY"),
  status: caseStudyStatusEnumSchema.optional().default("DRAFT"),
  projectStatus: z.string().max(100).optional().default("Status: Completed"),
  order: z.number().int().optional().default(0),
  featured: z.boolean().optional().default(false),
  pinned: z.boolean().optional().default(false),
  techStack: z.array(z.string().trim()).optional().default([]),
  liveUrl: z.string().url("Live URL must be a valid URL").optional().nullable().or(z.literal("")),
  githubUrl: z.string().url("GitHub URL must be a valid URL").optional().nullable().or(z.literal("")),
  image: z.string().min(1, "Cover image URL is required").max(500),
  imageLabel: z.string().max(150).optional().nullable(),
  role: z.string().max(150).optional().nullable(),
  timeline: z.string().max(100).optional().nullable(),
  client: z.string().max(150).optional().nullable(),
  impact: z.string().max(1000).optional().nullable(),
  highlights: z.array(z.string().trim()).optional().default([]),
  publishedAt: z.string().datetime().or(z.date()).optional().nullable(),
  author: caseStudyAuthorSchema.optional(),
  metadata: z.array(caseStudyMetadataItemSchema).optional().default([]),
  contextBlocks: z.array(contextBlockSchema).optional().default([]),
  architectureLayers: z.array(architectureLayerSchema).optional().default([]),
  features: z.array(featureItemSchema).optional().default([]),
  metrics: z.array(performanceMetricSchema).optional().default([]),
  postMortem: z.array(postMortemSectionSchema).optional().default([]),
  seo: caseStudySeoSchema.optional(),
});

export const updateCaseStudySchema = createCaseStudySchema.partial().extend({
  views: z.number().int().min(0).optional(),
  likesCount: z.number().int().min(0).optional(),
});

export const listCaseStudiesQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  search: z.string().trim().optional(),
  projectType: caseStudyTypeEnumSchema.optional(),
  status: caseStudyStatusEnumSchema.optional(),
  tech: z.string().trim().optional(),
  featured: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .transform((val) => (typeof val === "string" ? val === "true" : val))
    .optional(),
  sortBy: z.enum(["order", "publishedAt", "createdAt", "views", "likesCount", "title", "updatedAt"]).optional().default("order"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
});

export const publicCaseStudyQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  search: z.string().trim().optional(),
  projectType: caseStudyTypeEnumSchema.optional(),
  tech: z.string().trim().optional(),
  featured: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .transform((val) => (typeof val === "string" ? val === "true" : val))
    .optional(),
  sortBy: z.enum(["order", "publishedAt", "views", "likesCount"]).optional().default("order"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
});

export const bulkCaseStudyStatusSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, "At least one case study ID must be provided"),
  status: caseStudyStatusEnumSchema,
});

export const bulkCaseStudyDeleteSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, "At least one case study ID must be provided"),
});

export const reorderCaseStudiesSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid(),
      order: z.number().int(),
    })
  ).min(1, "At least one item must be provided for reordering"),
});
