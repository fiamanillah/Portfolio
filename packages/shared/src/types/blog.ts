// packages/shared/src/types/blog.ts
import { z } from "zod";
import type {
  createBlogPostSchema,
  updateBlogPostSchema,
  createBlogCategorySchema,
  updateBlogCategorySchema,
  createBlogTagSchema,
  updateBlogTagSchema,
  listBlogPostsQuerySchema,
  publicBlogQuerySchema,
  bulkBlogStatusSchema,
  bulkBlogDeleteSchema,
  seoPreviewSchema,
} from "../schemas/blog.schema";

export type BlogStatus = "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED";
export type BlogArticleType = "TechArticle" | "BlogPosting" | "Article";

export interface BlogAuthorData {
  id?: string;
  name: string;
  role?: string | null;
  avatar?: string | null;
  twitter?: string | null;
  linkedin?: string | null;
  github?: string | null;
}

export interface BlogSEOData {
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string[];
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  ogType?: "article" | "website";
  twitterCard?: "summary" | "summary_large_image";
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterImage?: string | null;
  canonicalUrl?: string | null;
  articleType?: BlogArticleType;
  noIndex?: boolean;
  noFollow?: boolean;
  structuredData?: Record<string, any> | null;
}

export interface BlogCategoryDTO {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  order: number;
  postCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogTagDTO {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  postCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogPostDTO {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  summary: string;
  content: string;
  thumbnail?: string | null;
  status: BlogStatus;
  featured: boolean;
  pinned: boolean;
  readTime: string;
  readTimeMinutes: number;
  wordCount: number;
  date?: string | null;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  modifiedAt?: string | null;
  views: number;
  likesCount: number;
  commentsCount: number;
  keyTakeaways: string[];
  tags: string[];
  categoryId?: string | null;
  category?: BlogCategoryDTO | null;
  authorId?: string | null;
  author?: BlogAuthorData | null;
  seo?: BlogSEOData;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostListItemDTO {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  summary: string;
  thumbnail?: string | null;
  status: BlogStatus;
  featured: boolean;
  pinned: boolean;
  readTime: string;
  readTimeMinutes: number;
  wordCount: number;
  date?: string | null;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  views: number;
  likesCount: number;
  commentsCount: number;
  keyTakeaways: string[];
  tags: string[];
  categoryId?: string | null;
  category?: {
    id: string;
    slug: string;
    name: string;
    color?: string | null;
  } | null;
  author?: BlogAuthorData | null;
  seo?: BlogSEOData;
  createdAt: string;
  updatedAt: string;
}

export interface BlogStatsDTO {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  scheduledPosts: number;
  archivedPosts: number;
  featuredPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  topPosts: Array<{
    id: string;
    title: string;
    slug: string;
    views: number;
    likesCount: number;
    commentsCount: number;
    status: BlogStatus;
    publishedAt?: string | null;
  }>;
  categoryBreakdown: Array<{
    id: string;
    name: string;
    slug: string;
    color?: string | null;
    count: number;
  }>;
}

export type SeoHealthLevel = "pass" | "warning" | "fail" | "info";

export interface SeoHealthCheckItem {
  field: string;
  level: SeoHealthLevel;
  title: string;
  message: string;
  recommendation?: string;
}

export interface SeoAnalysisResult {
  score: number; // 0 - 100
  rating: "Excellent" | "Good" | "Needs Improvement" | "Poor";
  checks: SeoHealthCheckItem[];
  previews: {
    googleSearchDesktop: {
      title: string;
      url: string;
      description: string;
    };
    googleSearchMobile: {
      title: string;
      url: string;
      description: string;
    };
    openGraph: {
      title: string;
      description: string;
      image: string;
      type: string;
      siteName: string;
      url: string;
    };
    twitterCard: {
      card: string;
      title: string;
      description: string;
      image: string;
      site: string;
    };
    jsonLd: Record<string, any>;
  };
}

export interface PublicBlogPostAdjacent {
  slug: string;
  title: string;
  summary: string;
  thumbnail?: string | null;
  publishedAt?: string | null;
  category?: string | null;
}

export interface PublicBlogPostDetail {
  post: BlogPostDTO;
  prevPost: PublicBlogPostAdjacent | null;
  nextPost: PublicBlogPostAdjacent | null;
  relatedPosts: Array<{
    id: string;
    slug: string;
    title: string;
    summary: string;
    thumbnail?: string | null;
    readTime: string;
    publishedAt?: string | null;
    category?: string | null;
    tags: string[];
  }>;
  breadcrumbs: Array<{
    name: string;
    url: string;
  }>;
  jsonLd: Record<string, any>;
  redirected?: boolean;
  destination?: string;
  statusCode?: number;
}

export type CreateBlogPostDTO = z.input<typeof createBlogPostSchema>;
export type UpdateBlogPostDTO = z.input<typeof updateBlogPostSchema>;
export type CreateBlogCategoryDTO = z.input<typeof createBlogCategorySchema>;
export type UpdateBlogCategoryDTO = z.input<typeof updateBlogCategorySchema>;
export type CreateBlogTagDTO = z.input<typeof createBlogTagSchema>;
export type UpdateBlogTagDTO = z.input<typeof updateBlogTagSchema>;
export interface ListBlogPostsQueryDTO {
  page?: number;
  limit?: number;
  search?: string;
  status?: BlogStatus;
  categoryId?: string;
  category?: string;
  tag?: string;
  featured?: boolean;
  sortBy?: "publishedAt" | "createdAt" | "views" | "likesCount" | "title" | "updatedAt";
  sortOrder?: "asc" | "desc";
  startDate?: string;
  endDate?: string;
}
export interface PublicBlogQueryDTO {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  search?: string;
  featured?: boolean;
  sortBy?: "publishedAt" | "views" | "likesCount";
  sortOrder?: "asc" | "desc";
}
export type BulkBlogStatusDTO = z.input<typeof bulkBlogStatusSchema>;
export type BulkBlogDeleteDTO = z.input<typeof bulkBlogDeleteSchema>;
export type SeoPreviewDTO = z.input<typeof seoPreviewSchema>;
