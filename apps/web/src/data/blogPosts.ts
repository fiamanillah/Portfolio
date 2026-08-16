import { BlogApi } from "@/lib/api/blogApi"

export interface BlogAuthor {
  name: string
  role: string
  avatar: string
  twitter?: string
  linkedin?: string
  github?: string
}

export interface BlogSEOData {
  metaTitle?: string
  metaDescription?: string
  ogImage?: string
  ogType?: "article" | "website"
  keywords?: string[]
  canonicalUrl?: string
  articleType?: "TechArticle" | "BlogPosting" | "Article"
  noIndex?: boolean
}

export type BlogCategory =
  | "Architecture"
  | "Database"
  | "Performance"
  | "WebSockets"
  | "DevOps"
  | "Security"
  | string

export interface BlogPost {
  id: string
  slug: string
  title: string
  subtitle?: string
  summary: string
  category: BlogCategory
  tags: string[]
  publishedAt: string
  modifiedAt?: string
  date: string
  readTime: string
  featured?: boolean
  views?: string
  likesCount?: number
  commentsCount?: number
  author: BlogAuthor
  thumbnail: string
  seo?: BlogSEOData
  keyTakeaways?: string[]
  content: string
}

export interface BlogApiResponse<T> {
  data: T
  success: boolean
  timestamp: string
}

const MONTH_MAP: Record<string, string> = {
  JAN: "01",
  FEB: "02",
  MAR: "03",
  APR: "04",
  MAY: "05",
  JUN: "06",
  JUL: "07",
  AUG: "08",
  SEP: "09",
  OCT: "10",
  NOV: "11",
  DEC: "12",
}

export function getBlogPostPublishedDate(post: BlogPost): string {
  if (post.publishedAt) return post.publishedAt
  const parts = post.date?.trim().split(/\s+/) || []
  if (parts.length === 2) {
    const month = MONTH_MAP[parts[0].toUpperCase()] || "01"
    const year = parts[1]
    return `${year}-${month}-01T00:00:00.000Z`
  }
  return new Date().toISOString()
}

export function formatViewsCount(views: string | number | undefined): string {
  if (!views) return "0"
  if (typeof views === "number") {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
    if (views >= 1000)
      return `${(views / 1000).toFixed(views % 1000 === 0 ? 0 : 1)}k`
    return `${views}`
  }
  return views
}

// Global empty fallback for static safety
export const blogPostsData: BlogPost[] = []
export const blogPostsRegistry: Record<string, BlogPost> = {}

// ============================================================================
// ASYNC API LOADERS (All data is fetched directly from backend API / DB)
// ============================================================================

/**
 * Fetch all published blog posts directly from the backend API / Database
 */
export async function getAllBlogPostsAsync(): Promise<BlogPost[]> {
  try {
    const res = await BlogApi.fetchPublicPosts({ limit: 100 })
    return res.posts || []
  } catch (err) {
    console.error("Failed to fetch blog posts from API:", err)
    return []
  }
}

/**
 * Fetch featured blog posts directly from the backend API / Database
 */
export async function getFeaturedBlogPostsAsync(): Promise<BlogPost[]> {
  try {
    const featured = await BlogApi.fetchFeaturedPosts()
    return featured || []
  } catch (err) {
    console.error("Failed to fetch featured blog posts from API:", err)
    return []
  }
}

/**
 * Fetch categories with published article counts directly from the backend API / Database
 */
export async function getBlogCategoriesAsync(): Promise<
  { name: string; count: number; slug?: string }[]
> {
  try {
    const categories = await BlogApi.fetchPublicCategories()
    if (categories && categories.length > 0) {
      return categories
    }
  } catch (err) {
    console.error("Failed to fetch blog categories from API:", err)
  }
  return [{ name: "All", count: 0 }]
}

/**
 * Fetch single post by slug with adjacent and related posts directly from the backend API / Database
 */
export async function getBlogPostBySlugAsync(
  slug: string,
  incrementView: boolean = false
): Promise<{
  post: BlogPost
  prevPost: BlogPost | null
  nextPost: BlogPost | null
  relatedPosts: BlogPost[]
} | null> {
  try {
    const res = await BlogApi.fetchPostBySlug(slug, incrementView)
    if (res && res.post) {
      return res
    }
  } catch (err) {
    console.error(`Failed to fetch post '${slug}' from API:`, err)
  }
  return null
}

// Synchronous Fallback Proxies
export function getAllBlogPosts(): BlogPost[] {
  return []
}

export function getFeaturedBlogPosts(): BlogPost[] {
  return []
}

export function getBlogPostBySlug(_slug: string): BlogPost | undefined {
  return undefined
}

export function getBlogCategories(): { name: string; count: number }[] {
  return [{ name: "All", count: 0 }]
}

export function getPaginatedBlogPosts(
  _page: number = 1,
  _limit: number = 4,
  _category: string = "All"
) {
  return {
    posts: [],
    totalCount: 0,
    totalPages: 1,
    currentPage: 1,
  }
}

export function getAdjacentBlogPosts(_slug: string): {
  prevPost: BlogPost | null
  nextPost: BlogPost | null
} {
  return { prevPost: null, nextPost: null }
}
