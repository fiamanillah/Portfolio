// src/Modules/Blog/blog.service.ts
import { prisma, BlogStatus, BlogPost, BlogCategory, Role } from "@workspace/db"
import { AppLogger } from "@workspace/logger"
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
} from "@/core/errors/AppError"
import { AuthenticatedUserPayload } from "@/types/express"
import {
  BlogPostDTO,
  BlogPostListItemDTO,
  BlogCategoryDTO,
  BlogTagDTO,
  BlogStatsDTO,
  SeoAnalysisResult,
  SeoHealthCheckItem,
  PublicBlogPostDetail,
  CreateBlogPostDTO,
  UpdateBlogPostDTO,
  CreateBlogCategoryDTO,
  UpdateBlogCategoryDTO,
  CreateBlogTagDTO,
  UpdateBlogTagDTO,
  ListBlogPostsQueryDTO,
  PublicBlogQueryDTO,
  SeoPreviewDTO,
} from "./BlogDTO"
import { StorageService } from "@/services/StorageService"
import { RedirectService } from "../Redirect/redirect.service"
import { config } from "@/core/config"
import fs from "fs/promises"
import path from "path"

export class BlogService {
  private logger = new AppLogger("BlogService")
  private readonly redirectService = new RedirectService()

  constructor(
    private readonly db: typeof prisma = prisma,
    private readonly storage: StorageService = new StorageService()
  ) {}

  /**
   * Automatically trigger background sitemap & RSS cache refresh
   */
  private triggerSitemapAutoUpdate(slug: string, action: string): void {
    const allowed = config.security.cors.allowedOrigins
    const origin =
      typeof allowed === "string"
        ? allowed.split(",")[0]?.trim()
        : "http://localhost:4321"
    const webUrl = config.site.webUrl || origin || "http://localhost:4321"

    this.logger.info(
      `✔ [Sitemap / SEO Sync] Auto-updating sitemap for blog: '${slug}' (action: ${action})`
    )

    setTimeout(async () => {
      try {
        const sitemapUrl = `${webUrl.replace(/\/$/, "")}/sitemap.xml`
        const rssUrl = `${webUrl.replace(/\/$/, "")}/rss.xml`
        await Promise.allSettled([
          fetch(sitemapUrl, {
            method: "GET",
            headers: { "User-Agent": "Portfolio-API-Sitemap-Ping/1.0" },
          }),
          fetch(rssUrl, {
            method: "GET",
            headers: { "User-Agent": "Portfolio-API-RSS-Ping/1.0" },
          }),
        ])
      } catch (err) {
        this.logger.warn(`Failed to auto-ping sitemap/rss for '${slug}':`, err)
      }
    }, 100)
  }

  // =========================================================================
  // UTILITY & TEXT COMPUTATION HELPERS
  // =========================================================================

  /**
   * Calculate clean word count from markdown content
   */
  private calculateWordCount(content?: string): number {
    if (!content) return 0
    // Strip markdown formatting, code blocks, html tags
    const cleanText = content
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`[^`]*`/g, "")
      .replace(/<[^>]*>/g, "")
      .replace(/[#*_\-\[\]\(\)!]/g, " ")
      .trim()

    const words = cleanText.split(/\s+/).filter(Boolean)
    return words.length
  }

  /**
   * Calculate estimated reading time in minutes and formatted string
   */
  private calculateReadingTime(wordCount: number): {
    minutes: number
    text: string
  } {
    const minutes = Math.max(1, Math.ceil(wordCount / 200))
    return {
      minutes,
      text: `${minutes} MIN READ`,
    }
  }

  /**
   * Generate URL-friendly slug from string
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  /**
   * Ensure unique slug in database
   */
  private async ensureUniqueSlug(
    baseSlug: string,
    excludeId?: string
  ): Promise<string> {
    let slug = this.slugify(baseSlug)
    if (!slug) slug = `post-${Date.now()}`

    let count = 0
    let finalSlug = slug

    while (true) {
      const existing = await prisma.blogPost.findUnique({
        where: { slug: finalSlug },
        select: { id: true },
      })

      if (!existing || (excludeId && existing.id === excludeId)) {
        return finalSlug
      }

      count++
      finalSlug = `${slug}-${count}`
    }
  }

  /**
   * Format display date string (e.g. "AUG 2025")
   */
  private formatDisplayDate(date: Date): string {
    const months = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ]
    return `${months[date.getMonth()]} ${date.getFullYear()}`
  }

  /**
   * Format raw DB record into BlogPostDTO
   */
  private mapToBlogPostDTO(post: any): BlogPostDTO {
    return {
      id: post.id,
      slug: post.slug,
      title: post.title,
      subtitle: post.subtitle,
      summary: post.summary,
      content: post.content,
      thumbnail: post.thumbnail,
      status: post.status,
      featured: post.featured,
      pinned: post.pinned,
      readTime: post.readTime || `${post.readTimeMinutes || 5} MIN READ`,
      readTimeMinutes: post.readTimeMinutes || 5,
      wordCount: post.wordCount || 0,
      date: post.date,
      publishedAt: post.publishedAt?.toISOString() || null,
      scheduledAt: post.scheduledAt?.toISOString() || null,
      modifiedAt: post.modifiedAt?.toISOString() || null,
      views: post.views,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      keyTakeaways: post.keyTakeaways || [],
      tags: post.tags || [],
      categoryId: post.categoryId,
      category: post.category
        ? {
            id: post.category.id,
            slug: post.category.slug,
            name: post.category.name,
            description: post.category.description,
            color: post.category.color,
            icon: post.category.icon,
            order: post.category.order,
          }
        : null,
      authorId: post.authorId,
      author: post.author
        ? {
            id: post.author.id,
            name: post.authorName || post.author.name,
            role: post.authorRole || post.author.headline,
            avatar: post.authorAvatar || post.author.avatar,
            twitter: post.authorTwitter || post.author.twitterUrl,
            linkedin: post.authorLinkedin || post.author.linkedinUrl,
            github: post.authorGithub || post.author.githubUrl,
          }
        : post.authorName
          ? {
              name: post.authorName,
              role: post.authorRole,
              avatar: post.authorAvatar,
              twitter: post.authorTwitter,
              linkedin: post.authorLinkedin,
              github: post.authorGithub,
            }
          : null,
      seo: {
        metaTitle: post.metaTitle,
        metaDescription: post.metaDescription,
        metaKeywords: post.metaKeywords || [],
        ogTitle: post.ogTitle,
        ogDescription: post.ogDescription,
        ogImage: post.ogImage,
        ogType: post.ogType as any,
        twitterCard: post.twitterCard as any,
        twitterTitle: post.twitterTitle,
        twitterDescription: post.twitterDescription,
        twitterImage: post.twitterImage,
        canonicalUrl: post.canonicalUrl,
        articleType: post.articleType as any,
        noIndex: post.noIndex,
        noFollow: post.noFollow,
        structuredData: post.structuredData as any,
      },
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    }
  }

  /**
   * Format DB record into lightweight list item
   */
  private mapToListItemDTO(post: any): BlogPostListItemDTO {
    return {
      id: post.id,
      slug: post.slug,
      title: post.title,
      subtitle: post.subtitle,
      summary: post.summary,
      thumbnail: post.thumbnail,
      status: post.status,
      featured: post.featured,
      pinned: post.pinned,
      readTime: post.readTime || `${post.readTimeMinutes || 5} MIN READ`,
      readTimeMinutes: post.readTimeMinutes || 5,
      wordCount: post.wordCount || 0,
      date: post.date,
      publishedAt: post.publishedAt?.toISOString() || null,
      scheduledAt: post.scheduledAt?.toISOString() || null,
      views: post.views,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      keyTakeaways: post.keyTakeaways || [],
      tags: post.tags || [],
      categoryId: post.categoryId,
      category: post.category
        ? {
            id: post.category.id,
            slug: post.category.slug,
            name: post.category.name,
            color: post.category.color,
          }
        : null,
      author: post.author
        ? {
            id: post.author.id,
            name: post.authorName || post.author.name,
            avatar: post.authorAvatar || post.author.avatar,
          }
        : post.authorName
          ? {
              name: post.authorName,
              avatar: post.authorAvatar,
            }
          : null,
      seo: {
        metaTitle: post.metaTitle,
        metaDescription: post.metaDescription,
        noIndex: post.noIndex,
      },
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    }
  }

  // =========================================================================
  // ADMIN BLOG POST OPERATIONS
  // =========================================================================

  /**
   * Retrieve aggregate statistics and KPI metrics for admin overview
   */
  public async getStats(): Promise<BlogStatsDTO> {
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      scheduledPosts,
      archivedPosts,
      featuredPosts,
      aggregations,
      topPostsRaw,
      categoriesWithCounts,
    ] = await Promise.all([
      prisma.blogPost.count(),
      prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
      prisma.blogPost.count({ where: { status: "DRAFT" } }),
      prisma.blogPost.count({ where: { status: "SCHEDULED" } }),
      prisma.blogPost.count({ where: { status: "ARCHIVED" } }),
      prisma.blogPost.count({ where: { featured: true } }),
      prisma.blogPost.aggregate({
        _sum: {
          views: true,
          likesCount: true,
          commentsCount: true,
        },
      }),
      prisma.blogPost.findMany({
        take: 5,
        orderBy: [{ views: "desc" }, { likesCount: "desc" }],
        select: {
          id: true,
          title: true,
          slug: true,
          views: true,
          likesCount: true,
          commentsCount: true,
          status: true,
          publishedAt: true,
        },
      }),
      prisma.blogCategory.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
          _count: {
            select: { posts: true },
          },
        },
        orderBy: { order: "asc" },
      }),
    ])

    return {
      totalPosts,
      publishedPosts,
      draftPosts,
      scheduledPosts,
      archivedPosts,
      featuredPosts,
      totalViews: aggregations._sum.views || 0,
      totalLikes: aggregations._sum.likesCount || 0,
      totalComments: aggregations._sum.commentsCount || 0,
      topPosts: topPostsRaw.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        views: p.views,
        likesCount: p.likesCount,
        commentsCount: p.commentsCount,
        status: p.status,
        publishedAt: p.publishedAt?.toISOString() || null,
      })),
      categoryBreakdown: categoriesWithCounts.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        color: c.color,
        count: c._count.posts,
      })),
    }
  }

  /**
   * List all blog posts with rich filtering and pagination for admin dashboard
   */
  public async getAllAdmin(query: ListBlogPostsQueryDTO) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      categoryId,
      category,
      tag,
      featured,
      sortBy = "createdAt",
      sortOrder = "desc",
      startDate,
      endDate,
    } = query

    const pageNum = Number(page) || 1
    const limitNum = Number(limit) || 10
    const offset = (pageNum - 1) * limitNum
    const where: any = {}

    // Status filter
    if (status) {
      where.status = status
    }

    // Category filter
    if (categoryId) {
      where.categoryId = categoryId
    } else if (category) {
      where.category = {
        OR: [
          { slug: { equals: category.toLowerCase(), mode: "insensitive" } },
          { name: { equals: category, mode: "insensitive" } },
        ],
      }
    }

    // Tag filter
    if (tag) {
      where.tags = { has: tag }
    }

    // Featured filter
    if (typeof featured === "boolean") {
      where.featured = featured
    }

    // Date range filter
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    // Search query (Title, summary, content, tags)
    if (search && search.trim()) {
      const q = search.trim()
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { summary: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
        { tags: { has: q } },
      ]
    }

    const [total, posts] = await Promise.all([
      prisma.blogPost.count({ where }),
      prisma.blogPost.findMany({
        where,
        skip: offset,
        take: limitNum,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: {
            select: { id: true, slug: true, name: true, color: true },
          },
          author: {
            select: { id: true, name: true, avatar: true, headline: true },
          },
        },
      }),
    ])

    const totalPages = Math.ceil(total / limitNum) || 1

    return {
      data: posts.map((p) => this.mapToListItemDTO(p)),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrevious: pageNum > 1,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1,
      },
    }
  }

  /**
   * Get complete blog post details by ID for admin editing
   */
  public async getById(id: string): Promise<BlogPostDTO> {
    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            headline: true,
            twitterUrl: true,
            linkedinUrl: true,
            githubUrl: true,
          },
        },
      },
    })

    if (!post) {
      throw new NotFoundError(`Blog post with ID '${id}' not found`)
    }

    return this.mapToBlogPostDTO(post)
  }

  /**
   * Create a new blog post
   */
  public async create(
    data: CreateBlogPostDTO,
    user?: AuthenticatedUserPayload
  ): Promise<BlogPostDTO> {
    // Generate unique slug
    const slug = await this.ensureUniqueSlug(data.slug || data.title)

    // Compute word count and reading time
    const wordCount = this.calculateWordCount(data.content)
    const readingTime = this.calculateReadingTime(wordCount)

    // Handle Category Resolution
    let resolvedCategoryId = data.categoryId || null
    if (!resolvedCategoryId && data.categoryName) {
      const categorySlug = this.slugify(data.categoryName)
      const existingCategory = await prisma.blogCategory.upsert({
        where: { slug: categorySlug },
        update: { name: data.categoryName },
        create: { name: data.categoryName, slug: categorySlug },
      })
      resolvedCategoryId = existingCategory.id
    }

    // Publishing dates resolution
    const now = new Date()
    let publishedAt: Date | null = null
    if (data.status === "PUBLISHED") {
      publishedAt = data.publishedAt ? new Date(data.publishedAt) : now
    } else if (data.publishedAt) {
      publishedAt = new Date(data.publishedAt)
    }

    const scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null
    const dateStr = data.date || this.formatDisplayDate(publishedAt || now)

    // Default SEO Fallbacks
    const metaTitle = data.seo?.metaTitle || `${data.title} | Fi Amanillah`
    const metaDescription = data.seo?.metaDescription || data.summary
    const ogImage =
      data.seo?.ogImage || data.thumbnail || "/assets/images/mickanic-cover.png"

    const created = await prisma.blogPost.create({
      data: {
        slug,
        title: data.title,
        subtitle: data.subtitle || null,
        summary: data.summary,
        content: data.content,
        thumbnail: data.thumbnail || null,
        status: data.status || "DRAFT",
        featured: Boolean(data.featured),
        pinned: Boolean(data.pinned),
        readTime: data.readTime || readingTime.text,
        readTimeMinutes: readingTime.minutes,
        wordCount,
        date: dateStr,
        publishedAt,
        scheduledAt,
        keyTakeaways: data.keyTakeaways || [],
        tags: data.tags || [],
        categoryId: resolvedCategoryId,
        authorId: user?.id || null,
        authorName: data.author?.name || user?.name || "Fi Amanillah",
        authorRole: data.author?.role || "Full Stack Developer",
        authorAvatar: data.author?.avatar || user?.avatar || "/fi.png",
        authorTwitter: data.author?.twitter || null,
        authorLinkedin: data.author?.linkedin || null,
        authorGithub: data.author?.github || null,
        metaTitle,
        metaDescription,
        metaKeywords: data.seo?.metaKeywords || data.tags || [],
        ogTitle: data.seo?.ogTitle || metaTitle,
        ogDescription: data.seo?.ogDescription || metaDescription,
        ogImage,
        ogType: data.seo?.ogType || "article",
        twitterCard: data.seo?.twitterCard || "summary_large_image",
        twitterTitle: data.seo?.twitterTitle || metaTitle,
        twitterDescription: data.seo?.twitterDescription || metaDescription,
        twitterImage: data.seo?.twitterImage || ogImage,
        canonicalUrl: data.seo?.canonicalUrl || null,
        articleType: data.seo?.articleType || "TechArticle",
        noIndex: Boolean(data.seo?.noIndex),
        noFollow: Boolean(data.seo?.noFollow),
        structuredData: data.seo?.structuredData
          ? (data.seo.structuredData as any)
          : undefined,
      },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            headline: true,
            twitterUrl: true,
            linkedinUrl: true,
            githubUrl: true,
          },
        },
      },
    })

    // Auto-upsert tags in BlogTag table
    for (const tag of data.tags || []) {
      const tagSlug = this.slugify(tag)
      if (tagSlug) {
        await prisma.blogTag
          .upsert({
            where: { slug: tagSlug },
            update: { name: tag },
            create: { name: tag, slug: tagSlug },
          })
          .catch((err) =>
            this.logger.warn(`Tag upsert warning for '${tag}':`, err)
          )
      }
    }

    this.logger.info(
      `Blog post created: '${created.title}' (slug: ${created.slug}) by ${user?.name || "Admin"}`
    )
    this.triggerSitemapAutoUpdate(created.slug, "CREATED")
    return this.mapToBlogPostDTO(created)
  }

  /**
   * Update an existing blog post
   */
  public async update(
    id: string,
    data: UpdateBlogPostDTO,
    user?: AuthenticatedUserPayload
  ): Promise<BlogPostDTO> {
    const existing = await prisma.blogPost.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        status: true,
        publishedAt: true,
        content: true,
      },
    })

    if (!existing) {
      throw new NotFoundError(`Blog post with ID '${id}' not found`)
    }

    // Slug update if changed
    let finalSlug: string | undefined = undefined
    if (data.slug && data.slug !== existing.slug) {
      finalSlug = await this.ensureUniqueSlug(data.slug, id)
    }

    // Content calculations if content updated
    let wordCount: number | undefined = undefined
    let readTimeMinutes: number | undefined = undefined
    let readTime: string | undefined = data.readTime || undefined

    if (data.content && data.content !== existing.content) {
      wordCount = this.calculateWordCount(data.content)
      const rt = this.calculateReadingTime(wordCount)
      readTimeMinutes = rt.minutes
      if (!readTime) readTime = rt.text
    }

    // Category resolution
    let categoryIdToSet: string | null | undefined = data.categoryId
    if (data.categoryName && !data.categoryId) {
      const categorySlug = this.slugify(data.categoryName)
      const cat = await prisma.blogCategory.upsert({
        where: { slug: categorySlug },
        update: { name: data.categoryName },
        create: { name: data.categoryName, slug: categorySlug },
      })
      categoryIdToSet = cat.id
    }

    // Status & Publishing transitions
    let publishedAtToSet: Date | null | undefined = undefined
    if (
      data.status === "PUBLISHED" &&
      (!existing.publishedAt || existing.status !== "PUBLISHED")
    ) {
      publishedAtToSet = data.publishedAt
        ? new Date(data.publishedAt)
        : new Date()
    } else if (data.publishedAt !== undefined) {
      publishedAtToSet = data.publishedAt ? new Date(data.publishedAt) : null
    }

    const scheduledAtToSet =
      data.scheduledAt !== undefined
        ? data.scheduledAt
          ? new Date(data.scheduledAt)
          : null
        : undefined

    const updatePayload: any = {
      ...(finalSlug ? { slug: finalSlug } : {}),
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.subtitle !== undefined ? { subtitle: data.subtitle } : {}),
      ...(data.summary !== undefined ? { summary: data.summary } : {}),
      ...(data.content !== undefined ? { content: data.content } : {}),
      ...(data.thumbnail !== undefined ? { thumbnail: data.thumbnail } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.featured !== undefined ? { featured: data.featured } : {}),
      ...(data.pinned !== undefined ? { pinned: data.pinned } : {}),
      ...(readTime ? { readTime } : {}),
      ...(readTimeMinutes ? { readTimeMinutes } : {}),
      ...(wordCount !== undefined ? { wordCount } : {}),
      ...(data.date !== undefined ? { date: data.date } : {}),
      ...(publishedAtToSet !== undefined
        ? { publishedAt: publishedAtToSet }
        : {}),
      ...(scheduledAtToSet !== undefined
        ? { scheduledAt: scheduledAtToSet }
        : {}),
      modifiedAt: new Date(),
      ...(data.views !== undefined ? { views: data.views } : {}),
      ...(data.likesCount !== undefined ? { likesCount: data.likesCount } : {}),
      ...(data.commentsCount !== undefined
        ? { commentsCount: data.commentsCount }
        : {}),
      ...(data.keyTakeaways !== undefined
        ? { keyTakeaways: data.keyTakeaways }
        : {}),
      ...(data.tags !== undefined ? { tags: data.tags } : {}),
      ...(categoryIdToSet !== undefined ? { categoryId: categoryIdToSet } : {}),
      ...(data.author?.name !== undefined
        ? { authorName: data.author.name }
        : {}),
      ...(data.author?.role !== undefined
        ? { authorRole: data.author.role }
        : {}),
      ...(data.author?.avatar !== undefined
        ? { authorAvatar: data.author.avatar }
        : {}),
      ...(data.author?.twitter !== undefined
        ? { authorTwitter: data.author.twitter }
        : {}),
      ...(data.author?.linkedin !== undefined
        ? { authorLinkedin: data.author.linkedin }
        : {}),
      ...(data.author?.github !== undefined
        ? { authorGithub: data.author.github }
        : {}),
      ...(data.seo?.metaTitle !== undefined
        ? { metaTitle: data.seo.metaTitle }
        : {}),
      ...(data.seo?.metaDescription !== undefined
        ? { metaDescription: data.seo.metaDescription }
        : {}),
      ...(data.seo?.metaKeywords !== undefined
        ? { metaKeywords: data.seo.metaKeywords }
        : {}),
      ...(data.seo?.ogTitle !== undefined ? { ogTitle: data.seo.ogTitle } : {}),
      ...(data.seo?.ogDescription !== undefined
        ? { ogDescription: data.seo.ogDescription }
        : {}),
      ...(data.seo?.ogImage !== undefined ? { ogImage: data.seo.ogImage } : {}),
      ...(data.seo?.ogType ? { ogType: data.seo.ogType } : {}),
      ...(data.seo?.twitterCard ? { twitterCard: data.seo.twitterCard } : {}),
      ...(data.seo?.twitterTitle !== undefined
        ? { twitterTitle: data.seo.twitterTitle }
        : {}),
      ...(data.seo?.twitterDescription !== undefined
        ? { twitterDescription: data.seo.twitterDescription }
        : {}),
      ...(data.seo?.twitterImage !== undefined
        ? { twitterImage: data.seo.twitterImage }
        : {}),
      ...(data.seo?.canonicalUrl !== undefined
        ? { canonicalUrl: data.seo.canonicalUrl }
        : {}),
      ...(data.seo?.articleType ? { articleType: data.seo.articleType } : {}),
      ...(data.seo?.noIndex !== undefined ? { noIndex: data.seo.noIndex } : {}),
      ...(data.seo?.noFollow !== undefined
        ? { noFollow: data.seo.noFollow }
        : {}),
      ...(data.seo?.structuredData !== undefined
        ? { structuredData: data.seo.structuredData as any }
        : {}),
    }

    const updated = await prisma.blogPost.update({
      where: { id },
      data: updatePayload,
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            headline: true,
            twitterUrl: true,
            linkedinUrl: true,
            githubUrl: true,
          },
        },
      },
    })

    // Auto-upsert updated tags
    if (data.tags) {
      for (const tag of data.tags) {
        const tagSlug = this.slugify(tag)
        if (tagSlug) {
          await prisma.blogTag
            .upsert({
              where: { slug: tagSlug },
              update: { name: tag },
              create: { name: tag, slug: tagSlug },
            })
            .catch(() => {})
        }
      }
    }

    this.logger.info(
      `Blog post updated: '${updated.title}' (ID: ${updated.id})`
    )
    if (finalSlug && existing.slug && finalSlug !== existing.slug) {
      await this.redirectService.trackEntitySlugChange({
        entityType: "BLOG_POST",
        entityId: updated.id,
        oldPath: `/blog/${existing.slug}`,
        newPath: `/blog/${finalSlug}`,
        notes: `Blog post '${updated.title}' slug renamed`,
      })
    }
    this.triggerSitemapAutoUpdate(updated.slug, "UPDATED")
    return this.mapToBlogPostDTO(updated)
  }

  /**
   * Delete a blog post by ID & clean up unreferenced thumbnail and media assets from R2/S3
   */
  public async delete(id: string): Promise<void> {
    const post = await this.db.blogPost.findUnique({
      where: { id },
      select: { id: true, title: true, thumbnail: true },
    })

    if (!post) {
      throw new NotFoundError(`Blog post with ID '${id}' not found`)
    }

    // 1. Clean up thumbnail if not used by another blog post
    if (post.thumbnail) {
      const thumbnailKey = this.storage.extractKeyFromUrl(post.thumbnail)
      if (thumbnailKey) {
        const otherWithThumb = await this.db.blogPost.count({
          where: { thumbnail: post.thumbnail, id: { not: id } },
        })
        if (otherWithThumb === 0) {
          try {
            await this.storage.deleteObject(thumbnailKey)
            await this.db.mediaFile.deleteMany({ where: { key: thumbnailKey } })
            this.logger.info(
              `✔ Deleted orphaned post thumbnail from R2: ${thumbnailKey}`
            )
          } catch (err: any) {
            this.logger.warn(
              `Could not delete post thumbnail from storage: ${err.message}`
            )
          }
        }
      }
    }

    // 2. Clean up any media files tied specifically to this post
    const postMedia = await this.db.mediaFile.findMany({
      where: { entityType: "BlogPost", entityId: id },
    })
    if (postMedia.length > 0) {
      const keys = postMedia.map((m) => m.key).filter(Boolean)
      try {
        await this.storage.deleteObjects(keys)
        await this.db.mediaFile.deleteMany({ where: { key: { in: keys } } })
      } catch (err: any) {
        this.logger.warn(
          `Could not delete post media assets from storage: ${err.message}`
        )
      }
    }

    await this.db.blogPost.delete({
      where: { id },
    })

    this.logger.info(`✔ Blog post deleted: '${post.title}' (ID: ${id})`)
    this.triggerSitemapAutoUpdate(post.title || id, "DELETED")
  }

  /**
   * Duplicate an existing blog post into a new draft copy
   */
  public async duplicate(
    id: string,
    user?: AuthenticatedUserPayload
  ): Promise<BlogPostDTO> {
    const post = await this.db.blogPost.findUnique({
      where: { id },
    })

    if (!post) {
      throw new NotFoundError(`Blog post with ID '${id}' not found`)
    }

    const newSlug = await this.ensureUniqueSlug(`${post.slug}-copy`)
    const newTitle = `${post.title} (Copy)`

    const duplicated = await this.db.blogPost.create({
      data: {
        slug: newSlug,
        title: newTitle,
        subtitle: post.subtitle,
        summary: post.summary,
        content: post.content,
        thumbnail: post.thumbnail,
        commentsCount: 0,
        keyTakeaways: post.keyTakeaways,
        tags: post.tags,
        categoryId: post.categoryId,
        authorId: user?.id || post.authorId,
        authorName: user?.name || post.authorName,
        authorRole: post.authorRole,
        authorAvatar: user?.avatar || post.authorAvatar,
        authorTwitter: post.authorTwitter,
        authorLinkedin: post.authorLinkedin,
        authorGithub: post.authorGithub,
        metaTitle: `${newTitle} | Fi Amanillah`,
        metaDescription: post.metaDescription,
        metaKeywords: post.metaKeywords,
        ogTitle: newTitle,
        ogDescription: post.ogDescription,
        ogImage: post.ogImage,
        ogType: post.ogType,
        twitterCard: post.twitterCard,
        twitterTitle: newTitle,
        twitterDescription: post.twitterDescription,
        twitterImage: post.twitterImage,
        canonicalUrl: null,
        articleType: post.articleType,
        noIndex: false,
        noFollow: false,
      },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            headline: true,
            twitterUrl: true,
            linkedinUrl: true,
            githubUrl: true,
          },
        },
      },
    })

    this.logger.info(
      `Blog post duplicated: '${post.title}' -> '${duplicated.title}' (ID: ${duplicated.id})`
    )
    this.triggerSitemapAutoUpdate(duplicated.slug, "DUPLICATED")
    return this.mapToBlogPostDTO(duplicated)
  }

  /**
   * Bulk update status for multiple posts
   */
  public async bulkUpdateStatus(
    ids: string[],
    status: BlogStatus
  ): Promise<{ count: number }> {
    const updateData: any = { status }
    if (status === "PUBLISHED") {
      updateData.publishedAt = new Date()
    }

    const result = await prisma.blogPost.updateMany({
      where: { id: { in: ids } },
      data: updateData,
    })

    this.logger.info(
      `Bulk status update to ${status} for ${result.count} posts`
    )
    this.triggerSitemapAutoUpdate(`${result.count} posts`, `BULK_STATUS_${status}`)
    return { count: result.count }
  }

  /**
   * Bulk delete multiple posts & purge unreferenced media assets
   */
  public async bulkDelete(ids: string[]): Promise<{ count: number }> {
    const posts = await this.db.blogPost.findMany({
      where: { id: { in: ids } },
      select: { id: true, thumbnail: true },
    })

    const keysToDelete: string[] = []
    for (const post of posts) {
      if (post.thumbnail) {
        const key = this.storage.extractKeyFromUrl(post.thumbnail)
        if (key) {
          const count = await this.db.blogPost.count({
            where: { thumbnail: post.thumbnail, id: { notIn: ids } },
          })
          if (count === 0 && !keysToDelete.includes(key)) {
            keysToDelete.push(key)
          }
        }
      }
    }

    const postMedia = await this.db.mediaFile.findMany({
      where: { entityType: "BlogPost", entityId: { in: ids } },
    })
    for (const m of postMedia) {
      if (m.key && !keysToDelete.includes(m.key)) {
        keysToDelete.push(m.key)
      }
    }

    if (keysToDelete.length > 0) {
      try {
        await this.storage.deleteObjects(keysToDelete)
        await this.db.mediaFile.deleteMany({
          where: { key: { in: keysToDelete } },
        })
      } catch (err: any) {
        this.logger.warn(`Could not bulk delete media assets: ${err.message}`)
      }
    }

    const result = await this.db.blogPost.deleteMany({
      where: { id: { in: ids } },
    })

    this.logger.info(
      `Bulk deleted ${result.count} posts and cleaned associated storage`
    )
    this.triggerSitemapAutoUpdate(`${result.count} posts`, "BULK_DELETED")
    return { count: result.count }
  }

  // =========================================================================
  // SEO PREVIEW & DIAGNOSTIC ANALYZER ENGINE
  // =========================================================================

  /**
   * Generate comprehensive SEO analysis, health scores, social cards, SERP previews, and JSON-LD
   */
  public generateSeoPreview(data: SeoPreviewDTO): SeoAnalysisResult {
    const siteUrl = (data.siteUrl || "https://fi.amanillah.com").replace(
      /\/$/,
      ""
    )
    const slug = data.slug ? this.slugify(data.slug) : this.slugify(data.title)
    const postUrl = `${siteUrl}/blog/${slug}`

    const rawTitle = data.title
    const metaTitle =
      data.seo?.metaTitle ||
      (rawTitle
        ? `${rawTitle} | Fi Amanillah`
        : "Fi Amanillah | Engineering Blog")
    const metaDescription =
      data.seo?.metaDescription ||
      data.summary ||
      "Explore in-depth software architecture, distributed systems, and DevOps guides."
    const ogImage =
      data.seo?.ogImage ||
      data.thumbnail ||
      `${siteUrl}/assets/images/mickanic-cover.png`
    const absoluteOgImage = ogImage.startsWith("http")
      ? ogImage
      : `${siteUrl}${ogImage.startsWith("/") ? ogImage : `/${ogImage}`}`

    const checks: SeoHealthCheckItem[] = []
    let score = 100

    // 1. Meta Title Analysis
    const titleLen = metaTitle.length
    if (titleLen === 0) {
      score -= 30
      checks.push({
        field: "metaTitle",
        level: "fail",
        title: "Missing Meta Title",
        message:
          "No title provided. Search engines require a descriptive <title> tag.",
        recommendation: "Provide a meta title between 40 and 60 characters.",
      })
    } else if (titleLen < 30) {
      score -= 10
      checks.push({
        field: "metaTitle",
        level: "warning",
        title: "Short Meta Title",
        message: `Title length (${titleLen} chars) is below the recommended 40-60 character range.`,
        recommendation:
          "Add primary target keywords or branding to maximize SERP visibility.",
      })
    } else if (titleLen > 65) {
      score -= 10
      checks.push({
        field: "metaTitle",
        level: "warning",
        title: "Long Meta Title",
        message: `Title length (${titleLen} chars) exceeds 60-65 characters and may be truncated on Google SERPs.`,
        recommendation:
          "Trim the title to under 60 characters to avoid ellipsis (...) on mobile/desktop results.",
      })
    } else {
      checks.push({
        field: "metaTitle",
        level: "pass",
        title: "Optimal Title Length",
        message: `Title is ${titleLen} characters, perfect for Google Search and social crawlers.`,
      })
    }

    // 2. Meta Description Analysis
    const descLen = metaDescription.length
    if (descLen === 0) {
      score -= 25
      checks.push({
        field: "metaDescription",
        level: "fail",
        title: "Missing Meta Description",
        message:
          "No meta description provided. Search engines may generate random snippets from your page.",
        recommendation:
          "Write a compelling description between 120 and 160 characters with key value propositions.",
      })
    } else if (descLen < 80) {
      score -= 10
      checks.push({
        field: "metaDescription",
        level: "warning",
        title: "Short Meta Description",
        message: `Description is only ${descLen} characters.`,
        recommendation:
          "Expand the summary to 120-160 characters for maximum search snippet real estate.",
      })
    } else if (descLen > 165) {
      score -= 8
      checks.push({
        field: "metaDescription",
        level: "warning",
        title: "Long Meta Description",
        message: `Description length (${descLen} chars) exceeds 160 characters and will be clipped in search results.`,
        recommendation:
          "Keep the summary concise and front-load key takeaway concepts.",
      })
    } else {
      checks.push({
        field: "metaDescription",
        level: "pass",
        title: "Optimal Description Length",
        message: `Description is ${descLen} characters, ideal for search snippet preview.`,
      })
    }

    // 3. OpenGraph Social Image Analysis
    if (!ogImage || ogImage.includes("placeholder")) {
      score -= 15
      checks.push({
        field: "ogImage",
        level: "warning",
        title: "Default or Missing OG Image",
        message:
          "Article does not specify a high-resolution social preview image.",
        recommendation:
          "Upload a 1200x630px image with 1.91:1 aspect ratio for crystal clear sharing on Twitter, LinkedIn, and Discord.",
      })
    } else {
      checks.push({
        field: "ogImage",
        level: "pass",
        title: "Social Share Image Set",
        message: "OpenGraph / Twitter card image configured.",
      })
    }

    // 4. Slug & URL Structure
    if (!slug) {
      score -= 15
      checks.push({
        field: "slug",
        level: "fail",
        title: "Missing URL Slug",
        message: "Cannot create canonical link without a valid URL slug.",
      })
    } else if (slug.length > 80) {
      score -= 5
      checks.push({
        field: "slug",
        level: "warning",
        title: "Long URL Slug",
        message: `Slug length (${slug.length} chars) is lengthy. Shorter slugs tend to perform better in SERPs.`,
      })
    } else {
      checks.push({
        field: "slug",
        level: "pass",
        title: "Clean URL Slug",
        message: `URL structure: ${postUrl}`,
      })
    }

    // 5. Canonical URL
    const canonicalUrl = data.seo?.canonicalUrl || postUrl
    checks.push({
      field: "canonicalUrl",
      level: "pass",
      title: "Canonical Link Tag",
      message: `Directs crawlers to authority source: ${canonicalUrl}`,
    })

    // 6. Keywords & Tags
    const tags = data.tags || data.seo?.metaKeywords || []
    if (tags.length === 0) {
      score -= 5
      checks.push({
        field: "tags",
        level: "info",
        title: "No Tags Specified",
        message:
          "Adding 3-6 relevant technical tags improves related post discovery and category indexing.",
      })
    } else {
      checks.push({
        field: "tags",
        level: "pass",
        title: "Topic Tags Configured",
        message: `${tags.length} tags: ${tags.join(", ")}`,
      })
    }

    // Robots indexing
    if (data.seo?.noIndex) {
      checks.push({
        field: "robots",
        level: "info",
        title: "NoIndex Directive Active",
        message: "Search engines will NOT index this page (robots: noindex).",
      })
    }

    score = Math.max(0, Math.min(100, score))
    const rating =
      score >= 90
        ? "Excellent"
        : score >= 75
          ? "Good"
          : score >= 50
            ? "Needs Improvement"
            : "Poor"

    // Build Schema.org JSON-LD graph preview
    const authorName = data.author?.name || "Fi Amanillah"
    const authorRole = data.author?.role || "Full Stack Developer"
    const authorAvatar = data.author?.avatar?.startsWith("http")
      ? data.author.avatar
      : `${siteUrl}${data.author?.avatar || "/fi.png"}`

    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": `${siteUrl}/#website`,
          url: siteUrl,
          name: "Fi Amanillah",
          inLanguage: "en-US",
        },
        {
          "@type": "Person",
          "@id": `${siteUrl}/#person`,
          name: authorName,
          jobTitle: authorRole,
          url: siteUrl,
          image: authorAvatar,
        },
        {
          "@type": [data.seo?.articleType || "TechArticle", "BlogPosting"],
          "@id": `${canonicalUrl}#article`,
          headline: rawTitle,
          name: rawTitle,
          description: metaDescription,
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": canonicalUrl,
          },
          url: canonicalUrl,
          articleSection: data.category || "Technology",
          keywords: tags.join(", "),
          image: {
            "@type": "ImageObject",
            url: absoluteOgImage,
            width: 1200,
            height: 630,
          },
          author: {
            "@type": "Person",
            "@id": `${siteUrl}/#person`,
            name: authorName,
          },
          publisher: {
            "@type": "Person",
            "@id": `${siteUrl}/#person`,
            name: "Fi Amanillah",
          },
        },
      ],
    }

    return {
      score,
      rating,
      checks,
      previews: {
        googleSearchDesktop: {
          title: metaTitle,
          url: postUrl,
          description:
            metaDescription.length > 155
              ? `${metaDescription.substring(0, 152)}...`
              : metaDescription,
        },
        googleSearchMobile: {
          title:
            metaTitle.length > 58
              ? `${metaTitle.substring(0, 55)}...`
              : metaTitle,
          url: postUrl.replace(/^https?:\/\//, ""),
          description:
            metaDescription.length > 130
              ? `${metaDescription.substring(0, 127)}...`
              : metaDescription,
        },
        openGraph: {
          title: data.seo?.ogTitle || metaTitle,
          description: data.seo?.ogDescription || metaDescription,
          image: absoluteOgImage,
          type: data.seo?.ogType || "article",
          siteName: "Fi Amanillah",
          url: postUrl,
        },
        twitterCard: {
          card: data.seo?.twitterCard || "summary_large_image",
          title: data.seo?.twitterTitle || metaTitle,
          description: data.seo?.twitterDescription || metaDescription,
          image: absoluteOgImage,
          site: "@fiamanillah",
        },
        jsonLd,
      },
    }
  }

  // =========================================================================
  // CATEGORIES & TAGS MANAGEMENT
  // =========================================================================

  public async getCategories(): Promise<BlogCategoryDTO[]> {
    const categories = await prisma.blogCategory.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    })

    return categories.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description,
      color: c.color,
      icon: c.icon,
      order: c.order,
      postCount: c._count.posts,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }))
  }

  public async createCategory(
    data: CreateBlogCategoryDTO
  ): Promise<BlogCategoryDTO> {
    const slug = data.slug ? this.slugify(data.slug) : this.slugify(data.name)

    const existing = await prisma.blogCategory.findFirst({
      where: {
        OR: [{ slug }, { name: { equals: data.name, mode: "insensitive" } }],
      },
    })

    if (existing) {
      throw new ConflictError(
        `Category with name '${data.name}' or slug '${slug}' already exists`
      )
    }

    const created = await prisma.blogCategory.create({
      data: {
        name: data.name,
        slug,
        description: data.description || null,
        color: data.color || "#3b82f6",
        icon: data.icon || null,
        order: data.order || 0,
      },
    })

    this.triggerSitemapAutoUpdate(created.slug, "CATEGORY_CREATED")
    return {
      id: created.id,
      slug: created.slug,
      name: created.name,
      description: created.description,
      color: created.color,
      icon: created.icon,
      order: created.order,
      postCount: 0,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    }
  }

  public async updateCategory(
    id: string,
    data: UpdateBlogCategoryDTO
  ): Promise<BlogCategoryDTO> {
    const existing = await prisma.blogCategory.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new NotFoundError(`Category with ID '${id}' not found`)
    }

    let slugToSet: string | undefined = undefined
    if (data.slug) slugToSet = this.slugify(data.slug)
    else if (data.name && data.name !== existing.name)
      slugToSet = this.slugify(data.name)

    const updated = await prisma.blogCategory.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(slugToSet ? { slug: slugToSet } : {}),
        ...(data.description !== undefined
          ? { description: data.description }
          : {}),
        ...(data.color !== undefined ? { color: data.color } : {}),
        ...(data.icon !== undefined ? { icon: data.icon } : {}),
        ...(data.order !== undefined ? { order: data.order } : {}),
      },
      include: {
        _count: { select: { posts: true } },
      },
    })

    if (slugToSet && existing.slug && slugToSet !== existing.slug) {
      await this.redirectService.trackEntitySlugChange({
        entityType: "BLOG_CATEGORY",
        entityId: updated.id,
        oldPath: `/blog/category/${existing.slug}`,
        newPath: `/blog/category/${updated.slug}`,
        notes: `Blog category '${updated.name}' slug renamed`,
      })
    }

    this.triggerSitemapAutoUpdate(updated.slug, "CATEGORY_UPDATED")
    return {
      id: updated.id,
      slug: updated.slug,
      name: updated.name,
      description: updated.description,
      color: updated.color,
      icon: updated.icon,
      order: updated.order,
      postCount: updated._count.posts,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    }
  }

  public async deleteCategory(id: string): Promise<void> {
    const existing = await prisma.blogCategory.findUnique({
      where: { id },
      include: { _count: { select: { posts: true } } },
    })

    if (!existing) {
      throw new NotFoundError(`Category with ID '${id}' not found`)
    }

    await prisma.blogCategory.delete({ where: { id } })
    this.logger.info(`Category deleted: '${existing.name}' (ID: ${id})`)
    this.triggerSitemapAutoUpdate(existing.slug, "CATEGORY_DELETED")
  }

  public async getTags(): Promise<BlogTagDTO[]> {
    const tags = await prisma.blogTag.findMany({
      orderBy: { name: "asc" },
    })

    // Compute tag count from blog posts
    const postsWithTags = await prisma.blogPost.findMany({
      select: { tags: true },
    })

    const tagCounts = new Map<string, number>()
    for (const post of postsWithTags) {
      for (const tag of post.tags || []) {
        const key = tag.toLowerCase()
        tagCounts.set(key, (tagCounts.get(key) || 0) + 1)
      }
    }

    return tags.map((t) => ({
      id: t.id,
      slug: t.slug,
      name: t.name,
      description: t.description,
      postCount: tagCounts.get(t.name.toLowerCase()) || 0,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }))
  }

  public async createTag(data: CreateBlogTagDTO): Promise<BlogTagDTO> {
    const slug = data.slug ? this.slugify(data.slug) : this.slugify(data.name)

    const created = await prisma.blogTag.upsert({
      where: { slug },
      update: { name: data.name, description: data.description || null },
      create: { name: data.name, slug, description: data.description || null },
    })

    return {
      id: created.id,
      slug: created.slug,
      name: created.name,
      description: created.description,
      postCount: 0,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    }
  }

  public async deleteTag(id: string): Promise<void> {
    await prisma.blogTag.delete({ where: { id } })
  }

  // =========================================================================
  // PUBLIC DISCOVERY & SEO ENDPOINTS (For Astro SSR / Frontend Web / Crawlers)
  // =========================================================================

  /**
   * Get public paginated blog posts (status = PUBLISHED, publishedAt <= now)
   */
  public async getPublicPosts(query: PublicBlogQueryDTO) {
    const {
      page = 1,
      limit = 6,
      category,
      tag,
      search,
      featured,
      sortBy = "publishedAt",
      sortOrder = "desc",
    } = query
    const pageNum = Number(page) || 1
    const limitNum = Number(limit) || 6
    const offset = (pageNum - 1) * limitNum
    const now = new Date()

    const where: any = {
      status: "PUBLISHED",
      OR: [{ publishedAt: { lte: now } }, { publishedAt: null }],
    }

    if (category && category.toLowerCase() !== "all") {
      where.category = {
        OR: [
          { slug: { equals: category.toLowerCase(), mode: "insensitive" } },
          { name: { equals: category, mode: "insensitive" } },
        ],
      }
    }

    if (tag) {
      where.tags = { has: tag }
    }

    if (typeof featured === "boolean") {
      where.featured = featured
    }

    if (search && search.trim()) {
      const q = search.trim()
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { summary: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
        { tags: { has: q } },
      ]
    }

    const [total, posts] = await Promise.all([
      prisma.blogPost.count({ where }),
      prisma.blogPost.findMany({
        where,
        skip: offset,
        take: limitNum,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: {
            select: { id: true, slug: true, name: true, color: true },
          },
          author: {
            select: { id: true, name: true, avatar: true, headline: true },
          },
        },
      }),
    ])

    const totalPages = Math.ceil(total / limitNum) || 1

    return {
      data: posts.map((p) => this.mapToListItemDTO(p)),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrevious: pageNum > 1,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1,
      },
    }
  }

  /**
   * Get public featured posts
   */
  public async getFeaturedPosts(): Promise<BlogPostListItemDTO[]> {
    const now = new Date()
    const posts = await prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        featured: true,
        OR: [{ publishedAt: { lte: now } }, { publishedAt: null }],
      },
      take: 4,
      orderBy: { publishedAt: "desc" },
      include: {
        category: {
          select: { id: true, slug: true, name: true, color: true },
        },
        author: {
          select: { id: true, name: true, avatar: true, headline: true },
        },
      },
    })

    return posts.map((p) => this.mapToListItemDTO(p))
  }

  /**
   * Get single published blog post by slug with adjacent navigation, related articles, and SEO schema
   */
  public async getPublicPostBySlug(
    slug: string,
    incrementView: boolean = true
  ): Promise<PublicBlogPostDetail> {
    const now = new Date()

    const post = await prisma.blogPost.findFirst({
      where: {
        slug,
        status: "PUBLISHED",
        OR: [{ publishedAt: { lte: now } }, { publishedAt: null }],
      },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            headline: true,
            twitterUrl: true,
            linkedinUrl: true,
            githubUrl: true,
          },
        },
      },
    })

    if (!post) {
      // Check if a 301 redirect exists for this blog post slug
      const redirect = await this.redirectService.resolve(`/blog/${slug}`)
      if (redirect.redirected && redirect.destination) {
        return {
          post: null as any,
          prevPost: null,
          nextPost: null,
          relatedPosts: [],
          breadcrumbs: [],
          jsonLd: {},
          redirected: true,
          destination: redirect.destination,
          statusCode: redirect.statusCode || 301,
        }
      }

      throw new NotFoundError(
        `Blog post '${slug}' not found or is not published`
      )
    }

    // Atomically increment views
    if (incrementView) {
      prisma.blogPost
        .update({
          where: { id: post.id },
          data: { views: { increment: 1 } },
        })
        .catch((err) =>
          this.logger.warn(`Failed to increment views for ${post.id}:`, err)
        )
      post.views += 1
    }

    // Find Adjacent Posts (Previous & Next by publishedAt)
    const [prevPostRaw, nextPostRaw, relatedRaw] = await Promise.all([
      prisma.blogPost.findFirst({
        where: {
          status: "PUBLISHED",
          publishedAt: { lt: post.publishedAt || now },
        },
        orderBy: { publishedAt: "desc" },
        select: {
          slug: true,
          title: true,
          summary: true,
          thumbnail: true,
          publishedAt: true,
          category: { select: { name: true } },
        },
      }),
      prisma.blogPost.findFirst({
        where: {
          status: "PUBLISHED",
          publishedAt: { gt: post.publishedAt || now },
        },
        orderBy: { publishedAt: "asc" },
        select: {
          slug: true,
          title: true,
          summary: true,
          thumbnail: true,
          publishedAt: true,
          category: { select: { name: true } },
        },
      }),
      prisma.blogPost.findMany({
        where: {
          id: { not: post.id },
          status: "PUBLISHED",
          publishedAt: { lte: now },
          OR: [
            ...(post.categoryId ? [{ categoryId: post.categoryId }] : []),
            ...(post.tags.length > 0 ? [{ tags: { hasSome: post.tags } }] : []),
          ],
        },
        take: 3,
        orderBy: { publishedAt: "desc" },
        select: {
          id: true,
          slug: true,
          title: true,
          summary: true,
          thumbnail: true,
          readTime: true,
          publishedAt: true,
          tags: true,
          category: { select: { name: true } },
        },
      }),
    ])

    const postDTO = this.mapToBlogPostDTO(post)
    const siteUrl = "https://fi.amanillah.com"
    const canonicalUrl = post.canonicalUrl || `${siteUrl}/blog/${post.slug}`

    const breadcrumbs = [
      { name: "Home", url: `${siteUrl}/` },
      { name: "Blog", url: `${siteUrl}/blog` },
      ...(post.category
        ? [
            {
              name: post.category.name,
              url: `${siteUrl}/blog?category=${encodeURIComponent(post.category.slug)}`,
            },
          ]
        : []),
      { name: post.title, url: canonicalUrl },
    ]

    const seoPreview = this.generateSeoPreview({
      title: post.title,
      slug: post.slug,
      summary: post.summary,
      content: post.content,
      thumbnail: post.thumbnail,
      category: post.category?.name,
      tags: post.tags,
      seo: postDTO.seo
        ? {
            ...postDTO.seo,
            metaKeywords: postDTO.seo.metaKeywords || [],
          }
        : undefined,
      siteUrl,
    })

    return {
      post: postDTO,
      prevPost: prevPostRaw
        ? {
            slug: prevPostRaw.slug,
            title: prevPostRaw.title,
            summary: prevPostRaw.summary,
            thumbnail: prevPostRaw.thumbnail,
            publishedAt: prevPostRaw.publishedAt?.toISOString() || null,
            category: prevPostRaw.category?.name || null,
          }
        : null,
      nextPost: nextPostRaw
        ? {
            slug: nextPostRaw.slug,
            title: nextPostRaw.title,
            summary: nextPostRaw.summary,
            thumbnail: nextPostRaw.thumbnail,
            publishedAt: nextPostRaw.publishedAt?.toISOString() || null,
            category: nextPostRaw.category?.name || null,
          }
        : null,
      relatedPosts: relatedRaw.map((r) => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        summary: r.summary,
        thumbnail: r.thumbnail,
        readTime: r.readTime || "5 MIN READ",
        publishedAt: r.publishedAt?.toISOString() || null,
        category: r.category?.name || null,
        tags: r.tags || [],
      })),
      breadcrumbs,
      jsonLd: seoPreview.previews.jsonLd,
    }
  }

  /**
   * Get public categories with active published counts
   */
  public async getPublicCategories(): Promise<
    Array<{ id?: string; name: string; slug: string; color?: string | null; count: number }>
  > {
    const now = new Date()
    const categories = await prisma.blogCategory.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        order: true,
        _count: {
          select: {
            posts: {
              where: {
                status: "PUBLISHED",
                publishedAt: { lte: now },
              },
            },
          },
        },
      },
    })

    const totalPublished = await prisma.blogPost.count({
      where: { status: "PUBLISHED", publishedAt: { lte: now } },
    })

    // Rank categories by most published posts first (descending), secondary sort by order/name
    const sortedCategories = categories
      .map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        color: c.color,
        order: c.order,
        count: c._count.posts,
      }))
      .sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count
        }
        return a.order - b.order || a.name.localeCompare(b.name)
      })

    return [
      { id: "all", name: "All", slug: "all", color: "#3b82f6", count: totalPublished },
      ...sortedCategories.map(({ id, name, slug, color, count }) => ({
        id,
        name,
        slug,
        color,
        count,
      })),
    ]
  }

  /**
   * Get public tags with published counts
   */
  public async getPublicTags(): Promise<
    Array<{ name: string; slug: string; count: number }>
  > {
    const now = new Date()
    const posts = await prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { lte: now },
      },
      select: { tags: true },
    })

    const counts = new Map<string, number>()
    for (const p of posts) {
      for (const t of p.tags || []) {
        counts.set(t, (counts.get(t) || 0) + 1)
      }
    }

    return Array.from(counts.entries())
      .map(([name, count]) => ({
        name,
        slug: this.slugify(name),
        count,
      }))
      .sort((a, b) => b.count - a.count)
  }

  /**
   * Get RSS feed and sitemap structured data
   */
  public async getRssFeedData() {
    const now = new Date()
    const posts = await prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { lte: now },
      },
      orderBy: { publishedAt: "desc" },
      include: {
        category: { select: { name: true } },
      },
    })

    return {
      title: "Fi Amanillah — Engineering & Architecture Blog",
      description:
        "Deep dives into high-throughput systems, distributed microservices, database optimization, Redis streaming, and modern DevOps pipelines.",
      siteUrl: config.site.webUrl || "http://localhost:4321",
      items: posts.map((post) => ({
        id: post.id,
        title: post.title,
        description: post.summary,
        link: `/blog/${post.slug}/`,
        pubDate:
          post.publishedAt?.toISOString() || post.createdAt.toISOString(),
        categories: [post.category?.name || "Technology", ...(post.tags || [])],
        author: `${post.authorName || "Fi Amanillah"} (${post.authorRole || "Author"})`,
      })),
    }
  }

  /**
   * Get full aggregated reaction counts and active user reaction state
   */
  public async getPostReactions(
    slug: string,
    userId?: string,
    ipAddress?: string
  ) {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true, likesCount: true },
    })

    if (!post) {
      throw new NotFoundError(`Blog post '${slug}' not found`)
    }

    const grouped = await prisma.blogReaction.groupBy({
      by: ["reactionType"],
      where: { postId: post.id },
      _count: { _all: true },
    })

    const reactionCounts: Record<string, number> = {
      like: 0,
      fire: 0,
      insightful: 0,
      fast: 0,
      rocket: 0,
    }

    grouped.forEach((g) => {
      reactionCounts[g.reactionType] = g._count._all
    })

    // Total positive engagements = base likes + all emoji reactions
    const emojiReactionsSum =
      reactionCounts.fire +
      reactionCounts.insightful +
      reactionCounts.fast +
      reactionCounts.rocket

    const baseLikes = Math.max(post.likesCount || 0, reactionCounts.like)
    const totalLikes = baseLikes + emojiReactionsSum
    const totalReactionsCount =
      reactionCounts.like + emojiReactionsSum

    // Determine current user/guest active reactions
    const userReactions = await prisma.blogReaction.findMany({
      where: {
        postId: post.id,
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(ipAddress ? [{ userId: null, ipAddress }] : []),
        ],
      },
      select: { reactionType: true },
    })

    const userReactionsMap: Record<string, boolean> = {
      like: userReactions.some((r) => r.reactionType === "like"),
      fire: userReactions.some((r) => r.reactionType === "fire"),
      insightful: userReactions.some((r) => r.reactionType === "insightful"),
      fast: userReactions.some((r) => r.reactionType === "fast"),
      rocket: userReactions.some((r) => r.reactionType === "rocket"),
    }

    return {
      slug,
      likesCount: totalLikes,
      reactionsCount: totalReactionsCount,
      reactions: {
        likes: totalLikes,
        fire: reactionCounts.fire,
        insightful: reactionCounts.insightful,
        fast: reactionCounts.fast,
        rocket: reactionCounts.rocket,
      },
      userReactions: userReactionsMap,
      userLiked: userReactionsMap.like,
    }
  }

  /**
   * Handle user / guest reaction to a blog post
   */
  public async reactToPost(
    slug: string,
    reactionType: string = "like",
    userId?: string,
    ipAddress?: string
  ) {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true, likesCount: true },
    })

    if (!post) {
      throw new NotFoundError(`Blog post '${slug}' not found`)
    }

    let isReacted = true

    // 1. Authenticated user reaction toggle
    if (userId) {
      const existingReaction = await prisma.blogReaction.findUnique({
        where: {
          postId_userId_reactionType: {
            postId: post.id,
            userId,
            reactionType,
          },
        },
      })

      if (existingReaction) {
        await prisma.blogReaction.delete({ where: { id: existingReaction.id } })
        isReacted = false
        if (reactionType === "like") {
          await prisma.blogPost.update({
            where: { id: post.id },
            data: { likesCount: { decrement: 1 } },
          })
        }
      } else {
        await prisma.blogReaction.create({
          data: {
            postId: post.id,
            userId,
            reactionType,
            ipAddress,
          },
        })
        isReacted = true
        if (reactionType === "like") {
          await prisma.blogPost.update({
            where: { id: post.id },
            data: { likesCount: { increment: 1 } },
          })
        }
      }
    } else if (ipAddress) {
      // 2. Guest reaction toggle by IP address
      const existingGuestReaction = await prisma.blogReaction.findFirst({
        where: {
          postId: post.id,
          userId: null,
          ipAddress,
          reactionType,
        },
      })

      if (existingGuestReaction) {
        await prisma.blogReaction.delete({
          where: { id: existingGuestReaction.id },
        })
        isReacted = false
        if (reactionType === "like") {
          await prisma.blogPost.update({
            where: { id: post.id },
            data: { likesCount: { decrement: 1 } },
          })
        }
      } else {
        await prisma.blogReaction.create({
          data: {
            postId: post.id,
            userId: null,
            reactionType,
            ipAddress,
          },
        })
        isReacted = true
        if (reactionType === "like") {
          await prisma.blogPost.update({
            where: { id: post.id },
            data: { likesCount: { increment: 1 } },
          })
        }
      }
    } else {
      // 3. Fallback guest increment
      if (reactionType === "like") {
        await prisma.blogPost.update({
          where: { id: post.id },
          data: { likesCount: { increment: 1 } },
        })
      }
      isReacted = true
    }

    // Retrieve fresh aggregated reaction stats
    const stats = await this.getPostReactions(slug, userId, ipAddress)

    return {
      reacted: isReacted,
      reactionType,
      ...stats,
    }
  }

  // =========================================================================
  // SEED LOCAL POSTS INGESTION HELPER
  // =========================================================================

  /**
   * Helper endpoint to synchronize or import local JSON posts from repository disk into PostgreSQL
   */
  public async seedLocalPosts(): Promise<{
    imported: number
    message: string
  }> {
    const categoriesData = [
      {
        name: "WebSockets",
        slug: "websockets",
        description:
          "Real-time communication, pub/sub architectures, and bidirectional streams",
        color: "blue",
        order: 1,
      },
      {
        name: "Architecture",
        slug: "architecture",
        description:
          "Distributed systems, microservices design, and high-throughput scaling",
        color: "emerald",
        order: 2,
      },
      {
        name: "Database",
        slug: "database",
        description:
          "PostgreSQL, Redis, caching layers, and database query optimization",
        color: "amber",
        order: 3,
      },
      {
        name: "Performance",
        slug: "performance",
        description:
          "Latency reduction, load testing, memory profiling, and edge computing",
        color: "purple",
        order: 4,
      },
      {
        name: "DevOps",
        slug: "devops",
        description:
          "Docker, CI/CD automation, VPS provisioning, and cloud orchestration",
        color: "rose",
        order: 5,
      },
      {
        name: "Security",
        slug: "security",
        description:
          "API security, authentication, artifact signing, and zero-trust systems",
        color: "cyan",
        order: 6,
      },
    ]

    const categoryMap = new Map<string, string>()
    for (const cat of categoriesData) {
      const catRecord = await prisma.blogCategory.upsert({
        where: { slug: cat.slug },
        update: {
          name: cat.name,
          description: cat.description,
          color: cat.color,
          order: cat.order,
        },
        create: cat,
      })
      categoryMap.set(cat.name.toLowerCase(), catRecord.id)
    }

    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } })
    const blogPostsDir = path.resolve(
      process.cwd(),
      "../../apps/web/src/data/blog-posts"
    )

    let count = 0
    try {
      let postsToImport: any[] = []
      try {
        const files = await fs.readdir(blogPostsDir)
        for (const file of files) {
          if (!file.endsWith(".json")) continue
          const raw = await fs.readFile(path.join(blogPostsDir, file), "utf-8")
          postsToImport.push(JSON.parse(raw))
        }
      } catch {
        // Fallback default starter blog posts for Docker/production environments
        postsToImport = [
          {
            slug: "building-realtime-bidding-engine-socketio-redis",
            title: "Architecting a Sub-50ms Real-Time Bidding & Dispatch Engine",
            subtitle: "Distributed WebSockets, Redis Pub/Sub, and Event Streams",
            summary: "A deep dive into engineering low-latency bidding architectures using Bun, Socket.IO, and Redis Streams with strict concurrency controls.",
            content: "# Architecting a Sub-50ms Real-Time Bidding Engine\n\nReal-time bidding platforms demand microsecond precision and absolute consistency across distributed nodes...\n\n```typescript\nconst stream = redis.xread('BLOCK', 0, 'STREAMS', 'bids:stream', '$')\n```",
            thumbnail: "https://assets.fi.amanillah.com/general/2026/08/bidding-architecture.png",
            category: "Architecture",
            tags: ["Redis", "WebSockets", "Bun", "Distributed Systems", "PostgreSQL"],
            readTime: "7 MIN READ",
            featured: true,
            date: "JAN 2026",
            publishedAt: "2026-01-20T00:00:00.000Z",
            keyTakeaways: [
              "Sub-50ms broadcast latency achieved using Redis Streams and Socket.IO adapter",
              "Optimistic locking guarantees zero double-assignments across competing workers",
              "Bun runtime cut baseline memory usage by 45% compared to Node.js"
            ]
          }
        ]
      }

      for (const post of postsToImport) {
        const categoryId = categoryMap.get(post.category?.toLowerCase()) || null
        const wordCount = post.content
          ? post.content.split(/\s+/).filter(Boolean).length
          : 0
        const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200))
        const publishedAt = post.publishedAt
          ? new Date(post.publishedAt)
          : new Date("2026-01-01T00:00:00.000Z")

        await prisma.blogPost.upsert({
          where: { slug: post.slug },
          update: {
            title: post.title,
            subtitle: post.subtitle || null,
            summary: post.summary,
            content: post.content,
            thumbnail: post.thumbnail,
            status: "PUBLISHED",
            featured: Boolean(post.featured),
            readTime: post.readTime || `${readTimeMinutes} MIN READ`,
            readTimeMinutes,
            wordCount,
            date: post.date || "JAN 2026",
            publishedAt,
            modifiedAt: post.modifiedAt ? new Date(post.modifiedAt) : publishedAt,
            views: post.views
              ? (parseInt(String(post.views).replace(/[^0-9]/g, "")) || 0) *
                (String(post.views).includes("k") ? 1000 : 1)
              : 1250,
            likesCount: 42,
            commentsCount: 3,
            keyTakeaways: post.keyTakeaways || [],
            tags: post.tags || [],
            categoryId,
            authorId: admin?.id || null,
            authorName: post.author?.name || admin?.name || "Fi Amanillah",
            authorRole:
              post.author?.role ||
              admin?.headline ||
              "Full Stack Developer",
            authorAvatar: post.author?.avatar || admin?.avatar || "/fi.png",
            authorTwitter: post.author?.twitter || admin?.twitterUrl,
            authorLinkedin: post.author?.linkedin || admin?.linkedinUrl,
            authorGithub: post.author?.github || admin?.githubUrl,
            metaTitle: post.seo?.metaTitle || `${post.title} | Fi Amanillah`,
            metaDescription: post.seo?.metaDescription || post.summary,
            metaKeywords: post.seo?.keywords || post.tags || [],
            ogTitle: post.seo?.metaTitle || post.title,
            ogDescription: post.seo?.metaDescription || post.summary,
            ogImage: post.seo?.ogImage || post.thumbnail,
            ogType: post.seo?.ogType || "article",
            canonicalUrl: post.seo?.canonicalUrl || null,
            articleType: post.seo?.articleType || "TechArticle",
            noIndex: Boolean(post.seo?.noIndex),
          },
          create: {
            slug: post.slug,
            title: post.title,
            subtitle: post.subtitle || null,
            summary: post.summary,
            content: post.content,
            thumbnail: post.thumbnail,
            status: "PUBLISHED",
            featured: Boolean(post.featured),
            readTime: post.readTime || `${readTimeMinutes} MIN READ`,
            readTimeMinutes,
            wordCount,
            date: post.date || "JAN 2026",
            publishedAt,
            modifiedAt: post.modifiedAt ? new Date(post.modifiedAt) : publishedAt,
            views: post.views
              ? (parseInt(String(post.views).replace(/[^0-9]/g, "")) || 0) *
                (String(post.views).includes("k") ? 1000 : 1)
              : 1250,
            likesCount: 42,
            commentsCount: 3,
            keyTakeaways: post.keyTakeaways || [],
            tags: post.tags || [],
            categoryId,
            authorId: admin?.id || null,
            authorName: post.author?.name || admin?.name || "Fi Amanillah",
            authorRole:
              post.author?.role ||
              admin?.headline ||
              "Full Stack Developer",
            authorAvatar: post.author?.avatar || admin?.avatar || "/fi.png",
            authorTwitter: post.author?.twitter || admin?.twitterUrl,
            authorLinkedin: post.author?.linkedin || admin?.linkedinUrl,
            authorGithub: post.author?.github || admin?.githubUrl,
            metaTitle: post.seo?.metaTitle || `${post.title} | Fi Amanillah`,
            metaDescription: post.seo?.metaDescription || post.summary,
            metaKeywords: post.seo?.keywords || post.tags || [],
            ogTitle: post.seo?.metaTitle || post.title,
            ogDescription: post.seo?.metaDescription || post.summary,
            ogImage: post.seo?.ogImage || post.thumbnail,
            ogType: post.seo?.ogType || "article",
            canonicalUrl: post.seo?.canonicalUrl || null,
            articleType: post.seo?.articleType || "TechArticle",
            noIndex: Boolean(post.seo?.noIndex),
          },
        })
        count++
      }
    } catch (err: any) {
      this.logger.warn("Could not read local blog directory:", err)
    }

    this.triggerSitemapAutoUpdate("local-seed", "SEEDED")
    return {
      imported: count,
      message: `Successfully synchronized ${count} blog posts into PostgreSQL database.`,
    }
  }
}
