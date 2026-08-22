import type { BlogPost, BlogCategory, BlogAuthor } from "@/data/blogPosts"
import { getStoredAccessToken } from "./authApi"

const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.PUBLIC_API_URL) ||
  "http://localhost:3040"

export interface PublicBlogQuery {
  page?: number
  limit?: number
  category?: string
  tag?: string
  search?: string
  featured?: boolean
  sortBy?: "publishedAt" | "views" | "likesCount"
  sortOrder?: "asc" | "desc"
}

export interface PublicCategoryItem {
  id: string
  name: string
  slug: string
  description?: string | null
  color?: string | null
  icon?: string | null
  count: number
}

export interface PublicTagItem {
  id: string
  name: string
  slug: string
  description?: string | null
  count: number
}

export interface PaginatedBlogPostsResponse {
  posts: BlogPost[]
  totalCount: number
  totalPages: number
  currentPage: number
  hasMore: boolean
}

export interface SingleBlogPostResponse {
  post: BlogPost
  prevPost: BlogPost | null
  nextPost: BlogPost | null
  relatedPosts: BlogPost[]
}

/**
 * Format raw API post DTO into frontend BlogPost interface
 */
export function mapApiPostToBlogPost(dto: any): BlogPost {
  const author: BlogAuthor = {
    name: dto.author?.name || dto.authorName || "Fi Amanillah",
    role:
      dto.author?.role ||
      dto.authorRole ||
      "Lead Full Stack & Distributed Systems Engineer",
    avatar: dto.author?.avatar || dto.authorAvatar || "/fi.png",
    twitter: dto.author?.twitter || dto.authorTwitter,
    linkedin: dto.author?.linkedin || dto.authorLinkedin,
    github: dto.author?.github || dto.authorGithub,
  }

  const rawViews = dto.views
  let formattedViews: string | undefined
  if (typeof rawViews === "number") {
    formattedViews =
      rawViews >= 1000
        ? `${(rawViews / 1000).toFixed(rawViews % 1000 === 0 ? 0 : 1)}k`
        : `${rawViews}`
  } else if (typeof rawViews === "string") {
    formattedViews = rawViews
  }

  const categoryName = (dto.category?.name ||
    dto.categoryName ||
    "Architecture") as BlogCategory

  return {
    id: dto.id || dto.slug,
    slug: dto.slug,
    title: dto.title,
    subtitle: dto.subtitle || undefined,
    summary: dto.summary,
    category: categoryName,
    tags: Array.isArray(dto.tags) ? dto.tags : [],
    publishedAt: dto.publishedAt || dto.createdAt || new Date().toISOString(),
    modifiedAt: dto.modifiedAt || dto.updatedAt,
    date:
      dto.date ||
      (dto.publishedAt
        ? new Date(dto.publishedAt)
            .toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
            .toUpperCase()
        : "RECENT"),
    readTime: dto.readTime || `${dto.readTimeMinutes || 5} MIN READ`,
    featured: Boolean(dto.featured),
    views: formattedViews,
    likesCount: typeof dto.likesCount === "number" ? dto.likesCount : 0,
    commentsCount:
      typeof dto.commentsCount === "number" ? dto.commentsCount : 0,
    author,
    thumbnail:
      dto.thumbnail ||
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80",
    keyTakeaways: Array.isArray(dto.keyTakeaways) ? dto.keyTakeaways : [],
    content: dto.content || "",
    seo: dto.seo
      ? {
          metaTitle: dto.seo.metaTitle,
          metaDescription: dto.seo.metaDescription,
          ogImage: dto.seo.ogImage,
          ogType: dto.seo.ogType,
          keywords: dto.seo.metaKeywords,
          canonicalUrl: dto.seo.canonicalUrl,
          articleType: dto.seo.articleType,
          noIndex: dto.seo.noIndex,
        }
      : undefined,
  }
}

export const BlogApi = {
  /**
   * Fetch published blog posts from API with pagination, filter, and search
   */
  async fetchPublicPosts(
    query: PublicBlogQuery = {}
  ): Promise<PaginatedBlogPostsResponse> {
    try {
      const params = new URLSearchParams()
      if (query.page) params.set("page", String(query.page))
      if (query.limit) params.set("limit", String(query.limit))
      if (query.category && query.category.toLowerCase() !== "all")
        params.set("category", query.category)
      if (query.tag) params.set("tag", query.tag)
      if (query.search) params.set("search", query.search)
      if (query.featured !== undefined)
        params.set("featured", String(query.featured))
      if (query.sortBy) params.set("sortBy", query.sortBy)
      if (query.sortOrder) params.set("sortOrder", query.sortOrder)

      const res = await fetch(
        `${API_BASE_URL}/blogs/v1/public?${params.toString()}`,
        {
          headers: { "Content-Type": "application/json" },
        }
      )

      if (res.ok) {
        const body = await res.json()
        if (body.success && Array.isArray(body.data)) {
          const posts = body.data.map(mapApiPostToBlogPost)
          const pagination = body.pagination || {
            totalItems: posts.length,
            totalPages: 1,
            currentPage: 1,
            hasNextPage: false,
          }
          return {
            posts,
            totalCount: pagination.totalItems ?? posts.length,
            totalPages: pagination.totalPages ?? 1,
            currentPage: pagination.currentPage ?? 1,
            hasMore: Boolean(pagination.hasNextPage),
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch public posts from API:", err)
    }

    return {
      posts: [],
      totalCount: 0,
      totalPages: 1,
      currentPage: query.page || 1,
      hasMore: false,
    }
  },

  /**
   * Fetch featured published articles
   */
  async fetchFeaturedPosts(): Promise<BlogPost[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/blogs/v1/public/featured`, {
        headers: { "Content-Type": "application/json" },
      })

      if (res.ok) {
        const body = await res.json()
        if (body.success && Array.isArray(body.data)) {
          return body.data.map(mapApiPostToBlogPost)
        }
      }
    } catch (err) {
      console.error("Failed to fetch featured posts from API:", err)
    }

    return []
  },

  /**
   * Fetch categories with published post counts
   */
  async fetchPublicCategories(): Promise<
    { name: string; count: number; slug?: string }[]
  > {
    try {
      const res = await fetch(`${API_BASE_URL}/blogs/v1/public/categories`, {
        headers: { "Content-Type": "application/json" },
      })

      if (res.ok) {
        const body = await res.json()
        if (body.success && Array.isArray(body.data)) {
          const nonAllCategories = body.data
            .filter((c: any) => c.name && c.name.toLowerCase() !== "all")
            .map((c: any) => ({
              name: c.name,
              count: typeof c.count === "number" ? c.count : 0,
              slug: c.slug,
            }))
          const existingAll = body.data.find(
            (c: any) => c.name && c.name.toLowerCase() === "all"
          )
          const totalPublished =
            existingAll && typeof existingAll.count === "number"
              ? existingAll.count
              : nonAllCategories.reduce((acc: number, c: any) => acc + c.count, 0)

          return [
            { name: "All", count: totalPublished, slug: "all" },
            ...nonAllCategories,
          ]
        }
      }
    } catch (err) {
      console.error("Failed to fetch public categories from API:", err)
    }

    return [{ name: "All", count: 0, slug: "all" }]
  },

  /**
   * Fetch tags with published post counts
   */
  async fetchPublicTags(): Promise<PublicTagItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/blogs/v1/public/tags`, {
        headers: { "Content-Type": "application/json" },
      })

      if (res.ok) {
        const body = await res.json()
        if (body.success && Array.isArray(body.data)) {
          return body.data
        }
      }
    } catch (err) {
      console.error("Failed to fetch public tags from API:", err)
    }

    return []
  },

  /**
   * Fetch single blog post details by slug with adjacent posts and related articles
   */
  async fetchPostBySlug(
    slug: string,
    incrementView: boolean = false
  ): Promise<SingleBlogPostResponse | null> {
    try {
      const url = `${API_BASE_URL}/blogs/v1/public/slug/${encodeURIComponent(slug)}${incrementView ? "" : "?noView=true"}`
      const res = await fetch(url, {
        headers: { "Content-Type": "application/json" },
      })

      if (res.ok) {
        const body = await res.json()
        if (body.success && body.data) {
          const raw = body.data
          const post = mapApiPostToBlogPost(raw.post || raw)
          const prevPost = raw.prevPost
            ? mapApiPostToBlogPost(raw.prevPost)
            : null
          const nextPost = raw.nextPost
            ? mapApiPostToBlogPost(raw.nextPost)
            : null
          const relatedPosts = Array.isArray(raw.relatedPosts)
            ? raw.relatedPosts.map(mapApiPostToBlogPost)
            : []

          return {
            post,
            prevPost,
            nextPost,
            relatedPosts,
          }
        }
      }
    } catch (err) {
      console.error(`Failed to fetch post '${slug}' from API:`, err)
    }

    return null
  },

  /**
   * Record page view for a blog post
   */
  async recordPostView(slug: string): Promise<{ views: number } | null> {
    try {
      const res = await fetch(
        `${API_BASE_URL}/blogs/v1/public/slug/${encodeURIComponent(slug)}`,
        {
          headers: { "Content-Type": "application/json" },
        }
      )

      if (res.ok) {
        const body = await res.json()
        if (body.success && body.data) {
          const views = body.data.post?.views ?? body.data.views
          return {
            views:
              typeof views === "number" ? views : parseInt(String(views)) || 0,
          }
        }
      }
    } catch (err) {
      console.error(`Failed to record view for '${slug}':`, err)
    }
    return null
  },

  /**
   * Fetch real-time aggregated reactions and user given reactions
   */
  async fetchPostReactions(slug: string): Promise<{
    success: boolean
    likesCount: number
    reactionsCount: number
    reactions: {
      likes: number
      fire: number
      insightful: number
      fast: number
      rocket: number
    }
    userReactions: Record<string, boolean>
    userLiked: boolean
  } | null> {
    try {
      const token = getStoredAccessToken()
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }
      if (token) headers["Authorization"] = `Bearer ${token}`

      const res = await fetch(
        `${API_BASE_URL}/blogs/v1/public/slug/${encodeURIComponent(slug)}/reactions`,
        {
          headers,
          credentials: "include",
        }
      )

      if (res.ok) {
        const body = await res.json()
        if (body.success && body.data) {
          return {
            success: true,
            likesCount: body.data.likesCount,
            reactionsCount: body.data.reactionsCount,
            reactions: body.data.reactions || {
              likes: body.data.likesCount,
              fire: 0,
              insightful: 0,
              fast: 0,
              rocket: 0,
            },
            userReactions: body.data.userReactions || {},
            userLiked: !!body.data.userLiked,
          }
        }
      }
    } catch (err) {
      console.error(`Failed to fetch reactions for '${slug}':`, err)
    }
    return null
  },

  /**
   * React to blog post (e.g. like, fire, insightful, fast, rocket)
   */
  async reactToPost(
    slug: string,
    reactionType: string = "like"
  ): Promise<{
    success: boolean
    reacted: boolean
    reactionType: string
    likesCount: number
    reactionsCount: number
    reactions: {
      likes: number
      fire: number
      insightful: number
      fast: number
      rocket: number
    }
    userReactions: Record<string, boolean>
    userLiked: boolean
  } | null> {
    try {
      const token = getStoredAccessToken()
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }
      if (token) headers["Authorization"] = `Bearer ${token}`

      const res = await fetch(
        `${API_BASE_URL}/blogs/v1/public/slug/${encodeURIComponent(slug)}/react`,
        {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify({ reactionType }),
        }
      )

      if (res.ok) {
        const body = await res.json()
        if (body.success && body.data) {
          return {
            success: true,
            reacted: body.data.reacted,
            reactionType: body.data.reactionType,
            likesCount: body.data.likesCount,
            reactionsCount: body.data.reactionsCount,
            reactions: body.data.reactions || {
              likes: body.data.likesCount,
              fire: 0,
              insightful: 0,
              fast: 0,
              rocket: 0,
            },
            userReactions: body.data.userReactions || {},
            userLiked: !!body.data.userLiked,
          }
        }
      }
    } catch (err) {
      console.error(`Failed to react to post '${slug}':`, err)
    }
    return null
  },
}
