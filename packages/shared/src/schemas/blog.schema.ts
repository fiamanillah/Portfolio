// packages/shared/src/schemas/blog.schema.ts
import { z } from "zod"

export const blogStatusEnumSchema = z.enum([
  "DRAFT",
  "PUBLISHED",
  "SCHEDULED",
  "ARCHIVED",
])
export const blogArticleTypeEnumSchema = z.enum([
  "TechArticle",
  "BlogPosting",
  "Article",
])

export const blogAuthorSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  username: z.string().optional().nullable(),
  name: z.string().min(1, "Author name is required").max(100),
  role: z.string().max(100).optional().nullable(),
  avatar: z.string().max(500).optional().nullable(),
  twitter: z.string().max(100).optional().nullable(),
  linkedin: z.string().max(200).optional().nullable(),
  github: z.string().max(200).optional().nullable(),
})

export const blogSeoSchema = z.object({
  metaTitle: z
    .string()
    .max(120, "Meta title cannot exceed 120 characters")
    .optional()
    .nullable(),
  metaDescription: z
    .string()
    .max(500, "Meta description cannot exceed 500 characters")
    .optional()
    .nullable(),
  metaKeywords: z.array(z.string().trim()).optional(),
  ogTitle: z.string().max(120).optional().nullable(),
  ogDescription: z.string().max(500).optional().nullable(),
  ogImage: z.string().max(500).optional().nullable(),
  ogType: z.enum(["article", "website"]).optional().nullable(),
  twitterCard: z.enum(["summary", "summary_large_image"]).optional().nullable(),
  twitterTitle: z.string().max(120).optional().nullable(),
  twitterDescription: z.string().max(500).optional().nullable(),
  twitterImage: z.string().max(500).optional().nullable(),
  canonicalUrl: z
    .string()
    .url("Canonical URL must be a valid URL")
    .optional()
    .nullable()
    .or(z.literal("")),
  articleType: blogArticleTypeEnumSchema.optional().nullable(),
  noIndex: z.boolean().optional(),
  noFollow: z.boolean().optional(),
  structuredData: z.record(z.string(), z.any()).optional().nullable(),
})

export const createBlogPostSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(250, "Title is too long"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(250)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase alphanumeric characters and hyphens"
    )
    .optional(),
  subtitle: z.string().max(300).optional().nullable(),
  summary: z
    .string()
    .min(10, "Summary must be at least 10 characters")
    .max(1000),
  content: z.string().min(10, "Content must be at least 10 characters"),
  thumbnail: z.string().max(500).optional().nullable(),
  status: blogStatusEnumSchema.optional().default("DRAFT"),
  featured: z.boolean().optional().default(false),
  pinned: z.boolean().optional().default(false),
  readTime: z.string().max(50).optional().nullable(),
  date: z.string().max(50).optional().nullable(),
  publishedAt: z.string().datetime().or(z.date()).optional().nullable(),
  scheduledAt: z.string().datetime().or(z.date()).optional().nullable(),
  keyTakeaways: z.array(z.string().trim()).optional().default([]),
  tags: z.array(z.string().trim()).optional().default([]),
  categoryId: z
    .string()
    .uuid("Invalid category ID format")
    .optional()
    .nullable(),
  categoryName: z.string().max(60).optional().nullable(),
  authorId: z.string().uuid("Invalid author ID format").optional().nullable(),
  author: blogAuthorSchema.optional(),
  seo: blogSeoSchema.optional(),
})

export const updateBlogPostSchema = createBlogPostSchema.partial().extend({
  views: z.number().int().min(0).optional(),
  likesCount: z.number().int().min(0).optional(),
  commentsCount: z.number().int().min(0).optional(),
})

export const createBlogCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(60),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase alphanumeric characters and hyphens"
    )
    .optional(),
  description: z.string().max(300).optional().nullable(),
  color: z.string().max(50).optional().default("#3b82f6"),
  icon: z.string().max(50).optional().nullable(),
  order: z.number().int().optional().default(0),
})

export const updateBlogCategorySchema = createBlogCategorySchema.partial()

export const createBlogTagSchema = z.object({
  name: z.string().min(2, "Tag name must be at least 2 characters").max(50),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase alphanumeric characters and hyphens"
    )
    .optional(),
  description: z.string().max(200).optional().nullable(),
})

export const updateBlogTagSchema = createBlogTagSchema.partial()

export const listBlogPostsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  search: z.string().trim().optional(),
  status: blogStatusEnumSchema.optional(),
  categoryId: z.string().uuid().optional(),
  category: z.string().trim().optional(),
  tag: z.string().trim().optional(),
  featured: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .transform((val) => (typeof val === "string" ? val === "true" : val))
    .optional(),
  sortBy: z
    .enum([
      "publishedAt",
      "createdAt",
      "views",
      "likesCount",
      "title",
      "updatedAt",
    ])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export const publicBlogQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(6),
  category: z.string().trim().optional(),
  tag: z.string().trim().optional(),
  search: z.string().trim().optional(),
  featured: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .transform((val) => (typeof val === "string" ? val === "true" : val))
    .optional(),
  sortBy: z
    .enum(["publishedAt", "views", "likesCount"])
    .optional()
    .default("publishedAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
})

export const bulkBlogStatusSchema = z.object({
  ids: z
    .array(z.string().uuid())
    .min(1, "At least one blog post ID must be provided"),
  status: blogStatusEnumSchema,
})

export const bulkBlogDeleteSchema = z.object({
  ids: z
    .array(z.string().uuid())
    .min(1, "At least one blog post ID must be provided"),
})

export const seoPreviewSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  summary: z.string().optional(),
  content: z.string().optional(),
  thumbnail: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  author: blogAuthorSchema.optional(),
  seo: blogSeoSchema.optional(),
  siteUrl: z.string().url().optional().default("https://fi.amanillah.com"),
})

export const reactToBlogSchema = z.object({
  reactionType: z
    .enum(["like", "fire", "insightful", "fast", "rocket", "heart"])
    .optional()
    .default("like"),
})
