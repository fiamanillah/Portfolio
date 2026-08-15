import buildingDistributedSystemsData from "./blog-posts/building-distributed-systems-websockets-redis.json"
import scalingRabbitmqRedisData from "./blog-posts/scaling-rabbitmq-redis.json"
import realtimeWebsocketsStripeData from "./blog-posts/realtime-websockets-stripe.json"
import dockerVpsCicdDeploymentData from "./blog-posts/docker-vps-cicd-deployment.json"
import prismaPostgresOptimizationData from "./blog-posts/prisma-postgres-optimization.json"
import restApiSecurityBestPracticesData from "./blog-posts/rest-api-security-best-practices.json"
import typescriptMonorepoTurboData from "./blog-posts/typescript-monorepo-turbo.json"
import distributedTracingOpentelemetryData from "./blog-posts/distributed-tracing-opentelemetry.json"
import cicdArtifactSigningSecurityData from "./blog-posts/cicd-artifact-signing-security.json"

import {
  DEFAULT_COMMENTS_REGISTRY,
  DEFAULT_REACTIONS_REGISTRY,
} from "./commentsData"

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

const rawRegistry: Record<string, BlogPost> = {
  "building-distributed-systems-websockets-redis": buildingDistributedSystemsData as BlogPost,
  "scaling-rabbitmq-redis": scalingRabbitmqRedisData as BlogPost,
  "realtime-websockets-stripe": realtimeWebsocketsStripeData as BlogPost,
  "docker-vps-cicd-deployment": dockerVpsCicdDeploymentData as BlogPost,
  "prisma-postgres-optimization": prismaPostgresOptimizationData as BlogPost,
  "rest-api-security-best-practices": restApiSecurityBestPracticesData as BlogPost,
  "typescript-monorepo-turbo": typescriptMonorepoTurboData as BlogPost,
  "distributed-tracing-opentelemetry": distributedTracingOpentelemetryData as BlogPost,
  "cicd-artifact-signing-security": cicdArtifactSigningSecurityData as BlogPost,
}

export const blogPostsRegistry: Record<string, BlogPost> = Object.fromEntries(
  Object.entries(rawRegistry).map(([slug, post]) => {
    const reactions = DEFAULT_REACTIONS_REGISTRY[slug]
    const comments = DEFAULT_COMMENTS_REGISTRY[slug] || []
    const totalComments = comments.reduce(
      (acc, c) => acc + 1 + (c.replies ? c.replies.length : 0),
      0
    )
    return [
      slug,
      {
        ...post,
        likesCount: reactions?.likes ?? 42,
        commentsCount: totalComments,
      },
    ]
  })
)

export const blogPostsData: BlogPost[] = Object.values(blogPostsRegistry)

// Utility Functions
export function getAllBlogPosts(): BlogPost[] {
  return blogPostsData
}

export function getFeaturedBlogPosts(): BlogPost[] {
  return blogPostsData.filter((post) => post.featured)
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPostsRegistry[slug] || blogPostsData.find((post) => post.slug === slug)
}

export function getBlogCategories(): { name: string; count: number }[] {
  const categoriesMap = new Map<string, number>()
  blogPostsData.forEach((post) => {
    const current = categoriesMap.get(post.category) || 0
    categoriesMap.set(post.category, current + 1)
  })

  const categories = Array.from(categoriesMap.entries()).map(([name, count]) => ({
    name,
    count,
  }))

  return [{ name: "All", count: blogPostsData.length }, ...categories]
}

export function getPaginatedBlogPosts(
  page: number = 1,
  limit: number = 4,
  category: string = "All"
) {
  let posts = blogPostsData
  if (category && category !== "All") {
    posts = posts.filter((p) => p.category.toLowerCase() === category.toLowerCase())
  }

  const totalCount = posts.length
  const totalPages = Math.ceil(totalCount / limit) || 1
  const currentPage = Math.max(1, Math.min(page, totalPages))
  const startIndex = (currentPage - 1) * limit
  const paginatedPosts = posts.slice(startIndex, startIndex + limit)

  return {
    posts: paginatedPosts,
    totalCount,
    totalPages,
    currentPage,
  }
}

export function getAdjacentBlogPosts(slug: string): {
  prevPost: BlogPost | null
  nextPost: BlogPost | null
} {
  const index = blogPostsData.findIndex((p) => p.slug === slug)
  if (index === -1) return { prevPost: null, nextPost: null }
  return {
    prevPost: index > 0 ? blogPostsData[index - 1] : null,
    nextPost: index < blogPostsData.length - 1 ? blogPostsData[index + 1] : null,
  }
}
