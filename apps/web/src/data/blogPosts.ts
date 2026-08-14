import buildingDistributedSystemsData from "./blog-posts/building-distributed-systems-websockets-redis.json"
import scalingRabbitmqRedisData from "./blog-posts/scaling-rabbitmq-redis.json"
import realtimeWebsocketsStripeData from "./blog-posts/realtime-websockets-stripe.json"
import dockerVpsCicdDeploymentData from "./blog-posts/docker-vps-cicd-deployment.json"
import prismaPostgresOptimizationData from "./blog-posts/prisma-postgres-optimization.json"
import restApiSecurityBestPracticesData from "./blog-posts/rest-api-security-best-practices.json"
import typescriptMonorepoTurboData from "./blog-posts/typescript-monorepo-turbo.json"
import distributedTracingOpentelemetryData from "./blog-posts/distributed-tracing-opentelemetry.json"
import cicdArtifactSigningSecurityData from "./blog-posts/cicd-artifact-signing-security.json"

export interface BlogAuthor {
  name: string
  role: string
  avatar: string
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  subtitle?: string
  summary: string
  date: string
  readTime: string
  category: "Architecture" | "Database" | "Performance" | "WebSockets" | "DevOps" | "Security"
  tags: string[]
  thumbnail: string
  featured?: boolean
  views?: string
  author: BlogAuthor
  keyTakeaways?: string[]
  content: string
}

export const blogPostsRegistry: Record<string, BlogPost> = {
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
