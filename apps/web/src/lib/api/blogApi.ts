import type { BlogPost, BlogCategory, BlogAuthor } from "@/data/blogPosts"
import { getStoredAccessToken } from "./authApi"
import { RedirectApi } from "./redirectApi"
import { getApiBaseUrl } from "./baseUrl"

const API_BASE_URL = getApiBaseUrl()

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
  post?: BlogPost
  prevPost: BlogPost | null
  nextPost: BlogPost | null
  relatedPosts: BlogPost[]
  redirected?: boolean
  destination?: string
  statusCode?: number
}

export interface PublicAuthorProfile {
  id: string
  name: string
  username: string
  avatar: string | null
  headline: string | null
  bio: string | null
  location: string | null
  website: string | null
  githubUrl: string | null
  twitterUrl: string | null
  linkedinUrl: string | null
  badge: string | null
  role: string
  createdAt: string
  stats: {
    totalPosts: number
    totalViews: number
    totalLikes: number
    totalComments: number
  }
  posts: BlogPost[]
}

export function mapApiPostToBlogPost(dto: {
  id?: string
  slug?: string
  title?: string
  subtitle?: string | null
  summary?: string
  content?: string
  tags?: string[]
  views?: number | string
  likesCount?: number
  commentsCount?: number
  publishedAt?: string
  createdAt?: string
  updatedAt?: string
  modifiedAt?: string
  date?: string
  readTime?: string
  readTimeMinutes?: number
  authorName?: string
  authorRole?: string
  authorAvatar?: string
  authorTwitter?: string
  authorLinkedin?: string
  authorGithub?: string
  categoryName?: string
  categoryColor?: string
  categorySlug?: string
  featured?: boolean
  pinned?: boolean
  thumbnail?: string
  keyTakeaways?: string[]
  authorId?: string
  author?: {
    id?: string
    username?: string
    name?: string
    role?: string
    avatar?: string
    twitter?: string
    linkedin?: string
    github?: string
  }
  category?: { name?: string; color?: string; slug?: string }
  seo?: {
    metaTitle?: string
    metaDescription?: string
    ogImage?: string
    ogType?: string
    metaKeywords?: string[]
    canonicalUrl?: string
    articleType?: string
    noIndex?: boolean
  }
}): BlogPost {
  const author: BlogAuthor = {
    id: dto.author?.id || dto.authorId,
    username: dto.author?.username,
    name: dto.author?.name || dto.authorName || "Fi Amanillah",
    role:
      dto.author?.role || dto.authorRole || "Software Engineer & Tech Writer",
    avatar: dto.author?.avatar || dto.authorAvatar || "/fi-avatar.webp",
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
    "Technology") as BlogCategory

  const categoryColor = dto.category?.color || dto.categoryColor || "#3b82f6"
  const categorySlug = dto.category?.slug || dto.categorySlug || ""

  return {
    id: dto.id || dto.slug || "post",
    slug: dto.slug || "",
    title: dto.title || "",
    subtitle: dto.subtitle || undefined,
    summary: dto.summary || "",
    category: categoryName,
    categoryColor,
    categorySlug,
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
          ogType: (dto.seo.ogType === "website" ? "website" : "article") as
            | "article"
            | "website",
          keywords: dto.seo.metaKeywords,
          canonicalUrl: dto.seo.canonicalUrl,
          articleType: (dto.seo.articleType === "BlogPosting" ||
          dto.seo.articleType === "Article"
            ? dto.seo.articleType
            : "TechArticle") as "TechArticle" | "BlogPosting" | "Article",
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
    {
      id?: string
      name: string
      count: number
      slug?: string
      color?: string
    }[]
  > {
    try {
      const res = await fetch(`${API_BASE_URL}/blogs/v1/public/categories`, {
        headers: { "Content-Type": "application/json" },
      })

      if (res.ok) {
        const body = await res.json()
        if (body.success && Array.isArray(body.data)) {
          const rawCategories = body.data as Array<{
            id?: string
            name?: string
            count?: number
            slug?: string
            color?: string
          }>
          const nonAllCategories = rawCategories
            .filter((c) => c.name && c.name.toLowerCase() !== "all")
            .map((c) => ({
              id: c.id || c.slug || "cat",
              name: c.name || "",
              count: typeof c.count === "number" ? c.count : 0,
              slug: c.slug || "",
              color: c.color || "#3b82f6",
            }))
          const existingAll = rawCategories.find(
            (c) => c.name && c.name.toLowerCase() === "all"
          )
          const totalPublished =
            existingAll && typeof existingAll.count === "number"
              ? existingAll.count
              : nonAllCategories.reduce((acc: number, c) => acc + c.count, 0)

          return [
            {
              id: "all",
              name: "All",
              count: totalPublished,
              slug: "all",
              color: "#3b82f6",
            },
            ...nonAllCategories,
          ]
        }
      }
    } catch (err) {
      console.error("Failed to fetch public categories from API:", err)
    }

    return [{ id: "all", name: "All", count: 0, slug: "all", color: "#3b82f6" }]
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

          // If backend indicated a 301/308 redirect for this slug
          if (raw.redirected && raw.destination) {
            return {
              post: undefined,
              prevPost: null,
              nextPost: null,
              relatedPosts: [],
              redirected: true,
              destination: raw.destination,
              statusCode: raw.statusCode || 301,
            }
          }

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
      } else {
        // If 404, check fallback redirect resolver
        const directRedirect = await RedirectApi.resolveRedirect(
          `/blog/${slug}`
        )
        if (directRedirect?.redirected && directRedirect.destination) {
          return {
            post: undefined,
            prevPost: null,
            nextPost: null,
            relatedPosts: [],
            redirected: true,
            destination: directRedirect.destination,
            statusCode: directRedirect.statusCode || 301,
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

  /**
   * Fetch public author profile, engagement telemetry, and their published posts
   */
  async fetchPublicAuthorProfile(
    username: string
  ): Promise<PublicAuthorProfile | null> {
    try {
      const res = await fetch(
        `${API_BASE_URL}/users/v1/public/authors/${encodeURIComponent(username)}`,
        {
          headers: { "Content-Type": "application/json" },
        }
      )

      if (res.ok) {
        const body = await res.json()
        if (body.success && body.data) {
          const raw = body.data
          const posts: BlogPost[] = Array.isArray(raw.posts)
            ? raw.posts.map(mapApiPostToBlogPost)
            : []

          return {
            id: raw.id,
            name: raw.name,
            username: raw.username,
            avatar: raw.avatar || null,
            headline: raw.headline || null,
            bio: raw.bio || null,
            location: raw.location || null,
            website: raw.website || null,
            githubUrl: raw.githubUrl || null,
            twitterUrl: raw.twitterUrl || null,
            linkedinUrl: raw.linkedinUrl || null,
            badge: raw.badge || null,
            role: raw.role || "USER",
            createdAt: raw.createdAt,
            stats: raw.stats || {
              totalPosts: posts.length,
              totalViews: 0,
              totalLikes: 0,
              totalComments: 0,
            },
            posts,
          }
        }
      }
    } catch (err) {
      console.error(`Failed to fetch public author profile '${username}':`, err)
    }
    return null
  },
}
