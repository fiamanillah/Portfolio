// src/Modules/CaseStudy/caseStudy.service.ts
import { prisma, CaseStudyStatus, CaseStudy, Role } from "@workspace/db";
import { AppLogger } from "@workspace/logger";
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
} from "@/core/errors/AppError";
import { AuthenticatedUserPayload } from "@/types/express";
import {
  CaseStudyDTO,
  CaseStudyListItemDTO,
  CaseStudyStatsDTO,
  SingleCaseStudyPublicResponse,
  CreateCaseStudyDTO,
  UpdateCaseStudyDTO,
  ListCaseStudiesQueryDTO,
  PublicCaseStudyQueryDTO,
  BulkCaseStudyStatusDTO,
  BulkCaseStudyDeleteDTO,
  ReorderCaseStudiesDTO,
} from "./CaseStudyDTO";
import fs from "fs/promises";
import path from "path";
import { config } from "@/core/config";

export class CaseStudyService {
  private logger = new AppLogger("CaseStudyService");

  constructor(private readonly db: typeof prisma = prisma) {}

  /**
   * Automatically trigger background sitemap & SEO cache refresh
   */
  private triggerSitemapAutoUpdate(slug: string, action: string): void {
    const allowed = config.security.cors.allowedOrigins;
    const origin =
      typeof allowed === "string"
        ? allowed.split(",")[0]?.trim()
        : "http://localhost:4321";
    const webUrl = config.site.webUrl || origin || "http://localhost:4321";

    this.logger.info(
      `✔ [Sitemap / SEO Sync] Auto-updating sitemap for case study: '${slug}' (action: ${action})`
    );

    setTimeout(async () => {
      try {
        const sitemapUrl = `${webUrl.replace(/\/$/, "")}/sitemap.xml`;
        const res = await fetch(sitemapUrl, {
          method: "GET",
          headers: { "User-Agent": "Portfolio-API-Sitemap-Ping/1.0" },
        }).catch(() => null);

        if (res?.ok) {
          this.logger.info(
            `✔ [Sitemap / SEO Sync] Dynamic sitemap cache prewarmed: ${sitemapUrl} (status: ${res.status})`
          );
        }
      } catch (err) {
        this.logger.warn(`Failed to auto-ping sitemap for '${slug}':`, err);
      }
    }, 100);
  }

  // =========================================================================
  // UTILITY & SLUG HELPERS
  // =========================================================================

  /**
   * Generate clean URL-friendly slug
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /**
   * Ensure unique slug in database
   */
  private async ensureUniqueSlug(
    baseSlug: string,
    excludeId?: string
  ): Promise<string> {
    let slug = this.slugify(baseSlug);
    if (!slug) slug = `case-study-${Date.now()}`;

    let count = 0;
    let finalSlug = slug;

    while (true) {
      const existing = await this.db.caseStudy.findUnique({
        where: { slug: finalSlug },
        select: { id: true },
      });

      if (!existing || (excludeId && existing.id === excludeId)) {
        return finalSlug;
      }

      count++;
      finalSlug = `${slug}-${count}`;
    }
  }

  /**
   * Format raw DB record into CaseStudyDTO
   */
  private mapToCaseStudyDTO(cs: any): CaseStudyDTO {
    return {
      id: cs.id,
      slug: cs.slug,
      title: cs.title,
      subtitle: cs.subtitle || null,
      description: cs.description,
      projectType: (cs.projectType as any) || "CASE_STUDY",
      status: cs.status as CaseStudyStatus,
      projectStatus: cs.projectStatus || "Status: Completed",
      order: cs.order,
      featured: Boolean(cs.featured),
      pinned: Boolean(cs.pinned),
      techStack: Array.isArray(cs.techStack) ? cs.techStack : [],
      liveUrl: cs.liveUrl || null,
      githubUrl: cs.githubUrl || null,
      image: cs.image,
      imageLabel: cs.imageLabel || null,
      role: cs.role || null,
      timeline: cs.timeline || null,
      client: cs.client || null,
      impact: cs.impact || null,
      highlights: Array.isArray(cs.highlights) ? cs.highlights : [],
      views: cs.views ?? 0,
      likesCount: cs.likesCount ?? 0,
      publishedAt: cs.publishedAt ? cs.publishedAt.toISOString() : null,
      authorId: cs.authorId || null,
      authorName: cs.authorName || cs.author?.name || null,
      authorRole: cs.authorRole || cs.author?.headline || null,
      authorAvatar: cs.authorAvatar || cs.author?.avatar || null,
      authorTwitter: cs.authorTwitter || cs.author?.twitterUrl || null,
      authorLinkedin: cs.authorLinkedin || cs.author?.linkedinUrl || null,
      authorGithub: cs.authorGithub || cs.author?.githubUrl || null,
      author: cs.author
        ? {
            id: cs.author.id,
            name: cs.authorName || cs.author.name,
            role: cs.authorRole || cs.author.headline || null,
            avatar: cs.authorAvatar || cs.author.avatar || null,
            twitter: cs.authorTwitter || cs.author.twitterUrl || null,
            linkedin: cs.authorLinkedin || cs.author.linkedinUrl || null,
            github: cs.authorGithub || cs.author.githubUrl || null,
          }
        : undefined,
      metadata: Array.isArray(cs.metadata) ? cs.metadata : [],
      contextBlocks: Array.isArray(cs.contextBlocks) ? cs.contextBlocks : [],
      architectureLayers: Array.isArray(cs.architectureLayers)
        ? cs.architectureLayers
        : [],
      features: Array.isArray(cs.features) ? cs.features : [],
      metrics: Array.isArray(cs.metrics) ? cs.metrics : [],
      postMortem: Array.isArray(cs.postMortem) ? cs.postMortem : [],
      seo: {
        metaTitle: cs.metaTitle || null,
        metaDescription: cs.metaDescription || null,
        metaKeywords: Array.isArray(cs.metaKeywords) ? cs.metaKeywords : [],
        ogTitle: cs.ogTitle || null,
        ogDescription: cs.ogDescription || null,
        ogImage: cs.ogImage || null,
        twitterCard: (cs.twitterCard as any) || "summary_large_image",
        twitterTitle: cs.twitterTitle || null,
        twitterDescription: cs.twitterDescription || null,
        twitterImage: cs.twitterImage || null,
        canonicalUrl: cs.canonicalUrl || null,
        structuredData: cs.structuredData || null,
      },
      metaTitle: cs.metaTitle || null,
      metaDescription: cs.metaDescription || null,
      metaKeywords: Array.isArray(cs.metaKeywords) ? cs.metaKeywords : [],
      ogTitle: cs.ogTitle || null,
      ogDescription: cs.ogDescription || null,
      ogImage: cs.ogImage || null,
      twitterCard: cs.twitterCard || "summary_large_image",
      twitterTitle: cs.twitterTitle || null,
      twitterDescription: cs.twitterDescription || null,
      twitterImage: cs.twitterImage || null,
      canonicalUrl: cs.canonicalUrl || null,
      structuredData: cs.structuredData || null,
      createdAt: cs.createdAt.toISOString(),
      updatedAt: cs.updatedAt.toISOString(),
    };
  }

  /**
   * Format raw DB record into CaseStudyListItemDTO
   */
  private mapToListItemDTO(cs: any): CaseStudyListItemDTO {
    return {
      id: cs.id,
      slug: cs.slug,
      title: cs.title,
      subtitle: cs.subtitle || null,
      description: cs.description,
      projectType: (cs.projectType as any) || "CASE_STUDY",
      status: cs.status as CaseStudyStatus,
      projectStatus: cs.projectStatus || "Status: Completed",
      order: cs.order,
      featured: Boolean(cs.featured),
      pinned: Boolean(cs.pinned),
      techStack: Array.isArray(cs.techStack) ? cs.techStack : [],
      liveUrl: cs.liveUrl || null,
      githubUrl: cs.githubUrl || null,
      image: cs.image,
      imageLabel: cs.imageLabel || null,
      role: cs.role || null,
      timeline: cs.timeline || null,
      client: cs.client || null,
      impact: cs.impact || null,
      highlights: Array.isArray(cs.highlights) ? cs.highlights : [],
      metadata: Array.isArray(cs.metadata) ? cs.metadata : [],
      contextBlocks: Array.isArray(cs.contextBlocks) ? cs.contextBlocks : [],
      architectureLayers: Array.isArray(cs.architectureLayers)
        ? cs.architectureLayers
        : [],
      features: Array.isArray(cs.features) ? cs.features : [],
      metrics: Array.isArray(cs.metrics) ? cs.metrics : [],
      postMortem: Array.isArray(cs.postMortem) ? cs.postMortem : [],
      views: cs.views ?? 0,
      likesCount: cs.likesCount ?? 0,
      publishedAt: cs.publishedAt ? cs.publishedAt.toISOString() : null,
      createdAt: cs.createdAt.toISOString(),
      updatedAt: cs.updatedAt.toISOString(),
    };
  }

  // =========================================================================
  // ADMIN DASHBOARD METHODS
  // =========================================================================

  /**
   * Retrieve aggregated overview KPI statistics
   */
  public async getStats(): Promise<CaseStudyStatsDTO> {
    const [totalCaseStudies, publishedCount, draftCount, archivedCount, featuredCount] =
      await Promise.all([
        this.db.caseStudy.count(),
        this.db.caseStudy.count({ where: { status: CaseStudyStatus.PUBLISHED } }),
        this.db.caseStudy.count({ where: { status: CaseStudyStatus.DRAFT } }),
        this.db.caseStudy.count({ where: { status: CaseStudyStatus.ARCHIVED } }),
        this.db.caseStudy.count({ where: { featured: true } }),
      ]);

    const aggregateViews = await this.db.caseStudy.aggregate({
      _sum: {
        views: true,
        likesCount: true,
      },
    });

    const topCaseStudies = await this.db.caseStudy.findMany({
      orderBy: [{ views: "desc" }, { likesCount: "desc" }],
      take: 5,
      select: {
        id: true,
        slug: true,
        title: true,
        views: true,
        likesCount: true,
      },
    });

    // Tech stack distribution
    const allStudies = await this.db.caseStudy.findMany({
      select: { techStack: true },
    });

    const techCountMap = new Map<string, number>();
    for (const study of allStudies) {
      for (const tech of study.techStack || []) {
        const normalized = tech.trim();
        if (normalized) {
          techCountMap.set(normalized, (techCountMap.get(normalized) || 0) + 1);
        }
      }
    }

    const techStackBreakdown = Array.from(techCountMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalCaseStudies,
      publishedCount,
      draftCount,
      archivedCount,
      featuredCount,
      totalViews: aggregateViews._sum.views || 0,
      totalLikes: aggregateViews._sum.likesCount || 0,
      topCaseStudies,
      techStackBreakdown,
    };
  }

  /**
   * List all case studies with filtering, pagination, and sorting for Admin
   */
  public async getAllAdmin(query: Partial<ListCaseStudiesQueryDTO> = {}) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.projectType) {
      where.projectType = query.projectType;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.featured !== undefined) {
      where.featured = query.featured;
    }

    if (query.tech) {
      where.techStack = {
        has: query.tech,
      };
    }

    if (query.search) {
      const searchTerms = query.search.trim();
      where.OR = [
        { title: { contains: searchTerms, mode: "insensitive" } },
        { subtitle: { contains: searchTerms, mode: "insensitive" } },
        { description: { contains: searchTerms, mode: "insensitive" } },
        { slug: { contains: searchTerms, mode: "insensitive" } },
        { client: { contains: searchTerms, mode: "insensitive" } },
        { role: { contains: searchTerms, mode: "insensitive" } },
      ];
    }

    const sortField = query.sortBy || "order";
    const sortDirection = query.sortOrder || "asc";
    const orderBy: any = {};
    orderBy[sortField] = sortDirection;

    const [total, records] = await Promise.all([
      this.db.caseStudy.count({ where }),
      this.db.caseStudy.findMany({
        where,
        orderBy: [orderBy, { createdAt: "desc" }],
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
              headline: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: records.map((r) => this.mapToListItemDTO(r)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  /**
   * Get single case study by ID
   */
  public async getById(id: string): Promise<CaseStudyDTO> {
    const record = await this.db.caseStudy.findUnique({
      where: { id },
      include: {
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
    });

    if (!record) {
      throw new NotFoundError(`Case study with ID '${id}' not found`);
    }

    return this.mapToCaseStudyDTO(record);
  }

  /**
   * Create a new Case Study
   */
  public async create(
    payload: CreateCaseStudyDTO,
    currentUser?: AuthenticatedUserPayload
  ): Promise<CaseStudyDTO> {
    // 1. Generate / Ensure Unique Slug
    const baseSlug = payload.slug?.trim() || payload.title;
    const finalSlug = await this.ensureUniqueSlug(baseSlug);

    // 2. Compute Order if not provided or 0
    let order = payload.order;
    if (order === undefined || order === 0) {
      const maxOrder = await this.db.caseStudy.aggregate({
        _max: { order: true },
      });
      order = (maxOrder._max.order || 0) + 1;
    }

    // 3. Resolve publishedAt
    let publishedAt: Date | null = null;
    if (payload.status === CaseStudyStatus.PUBLISHED) {
      publishedAt = payload.publishedAt ? new Date(payload.publishedAt) : new Date();
    } else if (payload.publishedAt) {
      publishedAt = new Date(payload.publishedAt);
    }

    // 4. Author Resolution
    let authorRole: string | null = payload.author?.role || null;
    let authorTwitter: string | null = payload.author?.twitter || null;
    let authorLinkedin: string | null = payload.author?.linkedin || null;
    let authorGithub: string | null = payload.author?.github || null;

    if (currentUser?.id && (!authorRole || !authorTwitter)) {
      const dbUser = await this.db.user.findUnique({
        where: { id: currentUser.id },
      });
      if (dbUser) {
        authorRole = authorRole || dbUser.headline;
        authorTwitter = authorTwitter || dbUser.twitterUrl;
        authorLinkedin = authorLinkedin || dbUser.linkedinUrl;
        authorGithub = authorGithub || dbUser.githubUrl;
      }
    }

    const authorId = payload.author?.id || currentUser?.id || null;
    const authorName = payload.author?.name || currentUser?.name || "Fi Amanillah";
    const authorAvatar = payload.author?.avatar || currentUser?.avatar || "/fi.png";

    // 5. Create in database
    const created = await this.db.caseStudy.create({
      data: {
        slug: finalSlug,
        title: payload.title.trim(),
        subtitle: payload.subtitle?.trim() || null,
        description: payload.description.trim(),
        projectType: (payload.projectType as any) || "CASE_STUDY",
        status: (payload.status as CaseStudyStatus) || CaseStudyStatus.DRAFT,
        projectStatus: payload.projectStatus?.trim() || "Status: Completed",
        order,
        featured: Boolean(payload.featured),
        pinned: Boolean(payload.pinned),
        techStack: payload.techStack || [],
        liveUrl: payload.liveUrl?.trim() || null,
        githubUrl: payload.githubUrl?.trim() || null,
        image: payload.image.trim(),
        imageLabel: payload.imageLabel?.trim() || null,
        role: payload.role?.trim() || null,
        timeline: payload.timeline?.trim() || null,
        client: payload.client?.trim() || null,
        impact: payload.impact?.trim() || null,
        highlights: payload.highlights || [],
        publishedAt,
        authorId,
        authorName,
        authorRole,
        authorAvatar,
        authorTwitter,
        authorLinkedin,
        authorGithub,
        metadata: (payload.metadata as any) || [],
        contextBlocks: (payload.contextBlocks as any) || [],
        architectureLayers: (payload.architectureLayers as any) || [],
        features: (payload.features as any) || [],
        metrics: (payload.metrics as any) || [],
        postMortem: (payload.postMortem as any) || [],
        metaTitle: payload.seo?.metaTitle?.trim() || `${payload.title} | Case Study`,
        metaDescription: payload.seo?.metaDescription?.trim() || payload.description,
        metaKeywords: payload.seo?.metaKeywords || payload.techStack || [],
        ogTitle: payload.seo?.ogTitle?.trim() || payload.title,
        ogDescription: payload.seo?.ogDescription?.trim() || payload.description,
        ogImage: payload.seo?.ogImage?.trim() || payload.image,
        twitterCard: payload.seo?.twitterCard || "summary_large_image",
        twitterTitle: payload.seo?.twitterTitle?.trim() || payload.title,
        twitterDescription: payload.seo?.twitterDescription?.trim() || payload.description,
        twitterImage: payload.seo?.twitterImage?.trim() || payload.image,
        canonicalUrl: payload.seo?.canonicalUrl?.trim() || `https://fi.amanillah.com/case-study/${finalSlug}`,
        structuredData: (payload.seo?.structuredData as any) || null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            headline: true,
          },
        },
      },
    });

    this.triggerSitemapAutoUpdate(created.slug, "CREATED");
    this.logger.info(`✔ Case study created: '${created.title}' (${created.id})`);
    return this.mapToCaseStudyDTO(created);
  }

  /**
   * Update an existing Case Study
   */
  public async update(
    id: string,
    payload: UpdateCaseStudyDTO
  ): Promise<CaseStudyDTO> {
    const existing = await this.db.caseStudy.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError(`Case study with ID '${id}' not found`);
    }

    // Slug update resolution
    let finalSlug = existing.slug;
    if (payload.slug && payload.slug.trim() !== existing.slug) {
      finalSlug = await this.ensureUniqueSlug(payload.slug.trim(), id);
    } else if (payload.title && !payload.slug && !existing.slug) {
      finalSlug = await this.ensureUniqueSlug(payload.title, id);
    }

    // PublishedAt resolution
    let publishedAt = existing.publishedAt;
    if (payload.status === CaseStudyStatus.PUBLISHED && !existing.publishedAt) {
      publishedAt = new Date();
    } else if (payload.publishedAt) {
      publishedAt = new Date(payload.publishedAt);
    }

    const updated = await this.db.caseStudy.update({
      where: { id },
      data: {
        slug: finalSlug,
        ...(payload.title !== undefined && { title: payload.title.trim() }),
        ...(payload.subtitle !== undefined && { subtitle: payload.subtitle?.trim() || null }),
        ...(payload.description !== undefined && { description: payload.description.trim() }),
        ...(payload.projectType !== undefined && { projectType: payload.projectType as any }),
        ...(payload.status !== undefined && { status: payload.status as CaseStudyStatus }),
        ...(payload.projectStatus !== undefined && { projectStatus: payload.projectStatus.trim() }),
        ...(payload.order !== undefined && { order: payload.order }),
        ...(payload.featured !== undefined && { featured: Boolean(payload.featured) }),
        ...(payload.pinned !== undefined && { pinned: Boolean(payload.pinned) }),
        ...(payload.techStack !== undefined && { techStack: payload.techStack }),
        ...(payload.liveUrl !== undefined && { liveUrl: payload.liveUrl?.trim() || null }),
        ...(payload.githubUrl !== undefined && { githubUrl: payload.githubUrl?.trim() || null }),
        ...(payload.image !== undefined && { image: payload.image.trim() }),
        ...(payload.imageLabel !== undefined && { imageLabel: payload.imageLabel?.trim() || null }),
        ...(payload.role !== undefined && { role: payload.role?.trim() || null }),
        ...(payload.timeline !== undefined && { timeline: payload.timeline?.trim() || null }),
        ...(payload.client !== undefined && { client: payload.client?.trim() || null }),
        ...(payload.impact !== undefined && { impact: payload.impact?.trim() || null }),
        ...(payload.highlights !== undefined && { highlights: payload.highlights }),
        ...(payload.views !== undefined && { views: payload.views }),
        ...(payload.likesCount !== undefined && { likesCount: payload.likesCount }),
        publishedAt,
        ...(payload.author && {
          authorName: payload.author.name,
          authorRole: payload.author.role || null,
          authorAvatar: payload.author.avatar || null,
          authorTwitter: payload.author.twitter || null,
          authorLinkedin: payload.author.linkedin || null,
          authorGithub: payload.author.github || null,
        }),
        ...(payload.metadata !== undefined && { metadata: payload.metadata as any }),
        ...(payload.contextBlocks !== undefined && { contextBlocks: payload.contextBlocks as any }),
        ...(payload.architectureLayers !== undefined && { architectureLayers: payload.architectureLayers as any }),
        ...(payload.features !== undefined && { features: payload.features as any }),
        ...(payload.metrics !== undefined && { metrics: payload.metrics as any }),
        ...(payload.postMortem !== undefined && { postMortem: payload.postMortem as any }),
        ...(payload.seo && {
          metaTitle: payload.seo.metaTitle?.trim() || null,
          metaDescription: payload.seo.metaDescription?.trim() || null,
          metaKeywords: payload.seo.metaKeywords || [],
          ogTitle: payload.seo.ogTitle?.trim() || null,
          ogDescription: payload.seo.ogDescription?.trim() || null,
          ogImage: payload.seo.ogImage?.trim() || null,
          twitterCard: payload.seo.twitterCard || "summary_large_image",
          twitterTitle: payload.seo.twitterTitle?.trim() || null,
          twitterDescription: payload.seo.twitterDescription?.trim() || null,
          twitterImage: payload.seo.twitterImage?.trim() || null,
          canonicalUrl: payload.seo.canonicalUrl?.trim() || null,
          structuredData: (payload.seo.structuredData as any) || null,
        }),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            headline: true,
          },
        },
      },
    });

    this.triggerSitemapAutoUpdate(updated.slug, "UPDATED");
    this.logger.info(`✔ Case study updated: '${updated.title}' (${updated.id})`);
    return this.mapToCaseStudyDTO(updated);
  }

  /**
   * Delete a Case Study
   */
  public async delete(id: string): Promise<{ id: string }> {
    const existing = await this.db.caseStudy.findUnique({
      where: { id },
      select: { id: true, title: true, slug: true },
    });

    if (!existing) {
      throw new NotFoundError(`Case study with ID '${id}' not found`);
    }

    await this.db.caseStudy.delete({
      where: { id },
    });

    this.triggerSitemapAutoUpdate(existing.slug || id, "DELETED");
    this.logger.info(`✔ Case study deleted: '${existing.title}' (${id})`);
    return { id };
  }

  /**
   * Duplicate an existing Case Study into a draft copy
   */
  public async duplicate(id: string): Promise<CaseStudyDTO> {
    const original = await this.db.caseStudy.findUnique({
      where: { id },
    });

    if (!original) {
      throw new NotFoundError(`Case study with ID '${id}' not found`);
    }

    const uniqueSlug = await this.ensureUniqueSlug(`${original.slug}-copy`);
    const maxOrder = await this.db.caseStudy.aggregate({
      _max: { order: true },
    });
    const nextOrder = (maxOrder._max.order || 0) + 1;

    const cloned = await this.db.caseStudy.create({
      data: {
        slug: uniqueSlug,
        title: `${original.title} (Copy)`,
        subtitle: original.subtitle,
        description: original.description,
        projectType: original.projectType,
        status: CaseStudyStatus.DRAFT,
        projectStatus: original.projectStatus,
        order: nextOrder,
        featured: false,
        pinned: false,
        techStack: original.techStack || [],
        liveUrl: original.liveUrl,
        githubUrl: original.githubUrl,
        image: original.image,
        imageLabel: original.imageLabel,
        role: original.role,
        timeline: original.timeline,
        client: original.client,
        impact: original.impact,
        highlights: original.highlights || [],
        views: 0,
        likesCount: 0,
        publishedAt: null,
        authorId: original.authorId,
        authorName: original.authorName,
        authorRole: original.authorRole,
        authorAvatar: original.authorAvatar,
        authorTwitter: original.authorTwitter,
        authorLinkedin: original.authorLinkedin,
        authorGithub: original.authorGithub,
        metadata: (original.metadata as any) || [],
        contextBlocks: (original.contextBlocks as any) || [],
        architectureLayers: (original.architectureLayers as any) || [],
        features: (original.features as any) || [],
        metrics: (original.metrics as any) || [],
        postMortem: (original.postMortem as any) || [],
        metaTitle: original.metaTitle ? `${original.metaTitle} (Copy)` : null,
        metaDescription: original.metaDescription,
        metaKeywords: original.metaKeywords || [],
        ogTitle: original.ogTitle,
        ogDescription: original.ogDescription,
        ogImage: original.ogImage,
        twitterCard: original.twitterCard,
        twitterTitle: original.twitterTitle,
        twitterDescription: original.twitterDescription,
        twitterImage: original.twitterImage,
        canonicalUrl: null,
      },
    });

    this.logger.info(`✔ Case study duplicated: '${cloned.title}' (${cloned.id})`);
    return this.mapToCaseStudyDTO(cloned);
  }

  /**
   * Bulk update status for multiple case studies
   */
  public async bulkUpdateStatus(
    payload: BulkCaseStudyStatusDTO
  ): Promise<{ count: number }> {
    const result = await this.db.caseStudy.updateMany({
      where: {
        id: { in: payload.ids },
      },
      data: {
        status: payload.status as CaseStudyStatus,
        ...(payload.status === CaseStudyStatus.PUBLISHED && {
          publishedAt: new Date(),
        }),
      },
    });

    this.logger.info(`✔ Bulk status updated for ${result.count} case studies to '${payload.status}'`);
    return { count: result.count };
  }

  /**
   * Bulk delete case studies
   */
  public async bulkDelete(
    payload: BulkCaseStudyDeleteDTO
  ): Promise<{ count: number }> {
    const result = await this.db.caseStudy.deleteMany({
      where: {
        id: { in: payload.ids },
      },
    });

    this.logger.info(`✔ Bulk deleted ${result.count} case studies`);
    return { count: result.count };
  }

  /**
   * Reorder case studies
   */
  public async reorder(
    payload: ReorderCaseStudiesDTO
  ): Promise<{ updated: number }> {
    const updates = payload.items.map((item) =>
      this.db.caseStudy.update({
        where: { id: item.id },
        data: { order: item.order },
      })
    );

    await this.db.$transaction(updates);
    this.logger.info(`✔ Reordered ${payload.items.length} case studies`);
    return { updated: payload.items.length };
  }

  /**
   * Seed / Sync initial default case studies into DB
   */
  public async seedLocalCaseStudies(): Promise<{ imported: number; message: string }> {
    const defaultStudies = [
      {
        slug: "mickanic",
        title: "Mickanic — Real-Time Bidding & Service Marketplace Platform",
        subtitle: "Real-Time Bidding & Service Marketplace Platform",
        description: "I architected a service-based marketplace using Next.js 16 and Bun, integrating real-time bidding, Socket.io messaging, and tiered Stripe subscriptions, backed by PostgreSQL and RabbitMQ.",
        projectType: "CASE_STUDY" as const,
        status: CaseStudyStatus.PUBLISHED,
        projectStatus: "Status: Completed",
        order: 1,
        featured: true,
        pinned: true,
        techStack: ["Next.js 16", "Bun", "PostgreSQL", "Prisma", "RabbitMQ", "Redis", "Socket.io", "Stripe", "Docker", "Redux Toolkit", "Tailwind CSS 4"],
        liveUrl: "https://mickanic.ca/",
        githubUrl: null,
        image: "/assets/images/mickanic-cover.png",
        imageLabel: "Mickanic_Architecture_Overview.png",
        role: "Full Stack Developer",
        timeline: "2025 - 2026",
        client: "Mickanic",
        impact: "Engineered contractor credit/bidding engine with Stripe billing, real-time Socket.io messaging with Redis, and Docker Compose deployment.",
        highlights: [
          "Real-Time Socket.IO messaging with typing indicators",
          "Event-driven RabbitMQ worker queue for async notifications",
          "Tiered Stripe contractor subscription billing",
        ],
        views: 2840,
        likesCount: 98,
        publishedAt: new Date("2026-01-15T00:00:00.000Z"),
        metadata: [
          { label: "Role", value: "Full Stack Developer" },
          { label: "Timeline", value: "2025 - 2026" },
          { label: "Client / Company", value: "Mickanic" },
          { label: "Tech Stack", value: "Next.js 16, Bun, PostgreSQL, RabbitMQ" },
        ],
        contextBlocks: [
          { label: "The Problem", body: "Drivers needed a platform to post vehicle-service jobs, while mechanics needed a centralized place to browse jobs, submit bids, and manage subscriptions. A seamless way to connect and communicate was required for the Mickanic platform." },
          { label: "The Solution", body: "I developed a service-based marketplace connecting consumers and contractors. The solution features a Next.js frontend and a Bun-powered API, featuring real-time Socket.io messaging and RabbitMQ background workers." },
        ],
        architectureLayers: [
          { name: "Client / UI", description: "Frontend application catering to Admin, Consumer, and Contractor roles.", items: [{ title: "Next.js 16 & React 19", subtitle: "App Router framework" }, { title: "Tailwind CSS 4", subtitle: "Utility-first styling" }, { title: "Redux Toolkit Query", subtitle: "State & API data fetching" }] },
          { name: "API & Compute", description: "High-performance backend API and WebSocket server.", items: [{ title: "Bun", subtitle: "JavaScript runtime and package manager" }, { title: "Express", subtitle: "Backend API framework" }, { title: "Socket.IO", subtitle: "Real-time communication" }] },
          { name: "Data Layer", description: "Relational database, caching, and object storage.", items: [{ title: "PostgreSQL", subtitle: "Primary database via Prisma ORM" }, { title: "Redis", subtitle: "In-memory caching store" }, { title: "MinIO", subtitle: "S3-compatible object storage" }] },
          { name: "Infra / Delivery", description: "Containerized orchestration and asynchronous task queues.", items: [{ title: "Docker Compose", subtitle: "Multi-container orchestration" }, { title: "RabbitMQ", subtitle: "Asynchronous message broker" }, { title: "Stripe", subtitle: "Payment and subscription processing" }] },
        ],
        features: [
          { title: "Real-Time Bidding & Messaging", description: "Implemented a real-time messaging system between consumers and contractors using Socket.IO. The frontend utilizes Redux Toolkit Query alongside real-time hooks to manage conversations and typing indicators without full page reloads.", mediaType: "Image / Video", mediaLabel: "Messaging Interface", media: "/assets/images/mickanic-chat.png", tags: ["Socket.IO", "RTK Query", "Optimistic UI"], highlights: ["Instant bid updates & chat sync across active browser clients", "Optimistic state updates via Redux Toolkit Query handlers", "Typing indicators & read receipt state management"] },
          { title: "Tiered Subscription Engine", description: "Integrated tiered subscription plans (Basic, Premium, Pro) for contractors, which govern job application limits, lead costs, and platform visibility. Stripe is used for handling the subscription and payment workflows.", mediaType: "Image / Video", mediaLabel: "Subscription Plans", media: "/assets/images/mickanic-billing.png", tags: ["Stripe API", "Webhooks", "Tiered Access"], highlights: ["Dynamic job bidding quota management based on tier levels", "Stripe Customer Portal integration for effortless plan upgrades", "Idempotent webhook handlers for subscription lifecycle events"] },
          { title: "Event-Driven Background Processing", description: "Offloaded heavy processing like email delivery and web-push notifications to a background worker using RabbitMQ. This ensures the main API remains responsive during high-traffic events, with an hourly email limit of 150 strictly enforced.", mediaType: "Architecture / Infra", mediaLabel: "Docker Worker Architecture", media: "/assets/images/mickanic-cover.png", tags: ["Docker", "Bun Runtime", "RabbitMQ"], highlights: ["Isolated background containerized execution via Docker Compose", "Bun runtime execution for fast startup & minimal memory overhead", "Rate-limited queue consumer processing strictly 150 emails/hour"] },
        ],
        metrics: [
          { value: "3", label: "Distinct user roles (Admin, Consumer, Contractor)" },
          { value: "150", label: "Hourly email sending limit via RabbitMQ" },
          { value: "3", label: "Contractor subscription tiers (Basic, Premium, Pro)" },
          { value: "100%", label: "Type safety with Prisma and TypeScript" },
        ],
        postMortem: [
          { title: "Technical Challenges", entries: [{ heading: "Real-Time State Synchronization", detail: "Keeping the optimistic UI in sync with backend state was complex. We leveraged Redux Toolkit Query to cache data and refresh active conversations automatically upon receiving Socket.IO events." }, { heading: "Asynchronous Notification Delivery", detail: "Blocking the main thread for transactional emails degraded performance. Implementing RabbitMQ allowed us to queue tasks like contact_auto_reply, handling them via a dedicated Bun email worker." }] },
          { title: "Lessons Learned", entries: [{ heading: "Infrastructure Orchestration", detail: "Bundling PostgreSQL, Redis, and RabbitMQ within a single docker-compose.yml file simplified local development and ensured parity across environments." }, { heading: "Schema-Driven Type Safety", detail: "Using Prisma allowed us to define a single schema for users, contractors, jobs, and bids. Generating the client directly from the schema ensured reliable database operations." }] },
        ],
      },
      {
        slug: "moja-cares",
        title: "Moja Cares — Healthcare Management & Patient Care Portal",
        subtitle: "Healthcare Management & Patient Care Portal",
        description: "Comprehensive healthcare management portal featuring multi-role RBAC, real-time clinical team chats, automated alerts, AI-powered document insight extraction, and Paystack billing integration.",
        projectType: "CASE_STUDY" as const,
        status: CaseStudyStatus.PUBLISHED,
        projectStatus: "Status: Live",
        order: 2,
        featured: true,
        pinned: false,
        techStack: ["TypeScript", "Express", "Prisma", "PostgreSQL", "Redis", "RabbitMQ", "WebSockets", "OpenAI API", "AWS S3", "Paystack"],
        liveUrl: "https://dev.mojacares.com/",
        githubUrl: null,
        image: "/assets/images/moja-cares-cover.png",
        imageLabel: "Moja_Cares_Dashboard_Overview.png",
        role: "Full Stack Developer",
        timeline: "2026",
        client: "Moja Cares",
        impact: "Architected OpenAI API health insights worker, WebSocket patient-care chat, SES/Postmark alert dispatch, and Paystack billing.",
        highlights: [
          "OpenAI worker for automated clinical record insight extraction",
          "Redis Pub/Sub adapter scaling WebSockets across cluster nodes",
          "Paystack billing & subscription webhooks integration",
        ],
        views: 1920,
        likesCount: 74,
        publishedAt: new Date("2026-01-15T00:00:00.000Z"),
        metadata: [
          { label: "Role", value: "Full Stack Developer" },
          { label: "Timeline", value: "2026" },
          { label: "Client / Company", value: "Moja Cares" },
          { label: "Tech Stack", value: "Express, TypeScript, OpenAI API, WebSockets" },
        ],
        contextBlocks: [
          { label: "The Problem", body: "Healthcare providers and clinical care teams needed a unified digital platform to handle multi-role patient access, stream real-time patient status updates, manage team communication, and analyze unstructured clinical documents without manual data entry bottlenecks." },
          { label: "The Solution", body: "I architected the Moja Cares portal with a high-throughput Express API, WebSocket infrastructure for real-time care team chat, asynchronous message queues for transactional alerts, an automated OpenAI worker for medical document processing, and Paystack subscription management." },
        ],
        architectureLayers: [
          { name: "Client / UI", description: "Multi-role responsive web application for Admins, Doctors, Nurses, and Patients.", items: [{ title: "Next.js & React", subtitle: "App Router & SSR" }, { title: "Tailwind CSS", subtitle: "Utility-first styling system" }, { title: "Zustand & SWR", subtitle: "Optimistic state & data hydration" }] },
          { name: "API & Compute", description: "High-performance backend services and WebSocket communication nodes.", items: [{ title: "Express (Node.js)", subtitle: "Primary REST API aggregation" }, { title: "WebSockets", subtitle: "Full-duplex clinical chat nodes" }, { title: "OpenAI Worker", subtitle: "Background document analysis pipeline" }] },
          { name: "Data Layer", description: "Relational database state, ephemeral memory caching, and object storage.", items: [{ title: "PostgreSQL", subtitle: "Relational medical records via Prisma" }, { title: "Redis", subtitle: "Session cache & socket event pub/sub" }, { title: "AWS S3", subtitle: "Secure patient document storage" }] },
          { name: "Infra / Delivery", description: "Event brokering, notification dispatch, and payment gateways.", items: [{ title: "RabbitMQ", subtitle: "Asynchronous worker queue orchestration" }, { title: "AWS SES / Postmark", subtitle: "Transactional alert dispatch" }, { title: "Paystack API", subtitle: "Subscription & medical billing webhooks" }] },
        ],
        features: [
          { title: "Real-Time Clinical Team Chat", description: "Implemented persistent WebSocket channels allowing doctors, nurses, and care administrators to exchange encrypted patient updates instantly with typing indicators and read receipts.", mediaType: "Image / Video", mediaLabel: "Clinical Team Messaging", media: "/assets/images/moja-cares-chat.png", tags: ["WebSockets", "Redis Pub/Sub", "Encrypted Messaging"], highlights: ["Sub-50ms message latency across distributed care nodes", "Role-restricted multi-party channels (Admins, Doctors, Nurses)", "Presence tracking & real-time typing indicators"] },
          { title: "AI-Powered Document Insight Extraction", description: "Developed an automated background pipeline leveraging the OpenAI API to extract critical medical markers, risk flags, and summary points from uploaded health records.", mediaType: "Image / Video", mediaLabel: "AI Document Analysis", media: "/assets/images/moja-cares-insights.png", tags: ["OpenAI API", "AWS S3", "Async Worker"], highlights: ["Automated extraction of vital medical markers & risk alerts", "Direct pre-signed AWS S3 upload pipeline avoiding API bottlenecks", "Structured JSON schema response parsing with fallback validation"] },
          { title: "Automated Alert Dispatch & Queuing", description: "Offloaded instant SMS and email notifications to background RabbitMQ workers consumed by standalone microservices to ensure reliable alert delivery under peak clinical loads.", mediaType: "Architecture / Infra", mediaLabel: "Alert Worker Architecture", media: "/assets/images/moja-cares-cover.png", tags: ["RabbitMQ", "Microservices", "Event-Driven"], highlights: ["Guaranteed persistent message delivery for high-priority alerts", "Non-blocking API throughput under heavy emergency care events", "Dead-letter exchange setup for failed notification retries"] },
        ],
        metrics: [
          { value: "4", label: "Distinct user roles (Admin, Doctor, Nurse, Patient)" },
          { value: "<50ms", label: "WebSocket real-time chat latency" },
          { value: "10k+", label: "Clinical health insights extracted via AI worker" },
          { value: "99.9%", label: "Uptime for asynchronous alert delivery" },
        ],
        postMortem: [
          { title: "Technical Challenges", entries: [{ heading: "Handling Large Medical Document Processing", detail: "Parsing heavy medical PDF records caused API response stalls. Solved by decoupling document uploads directly to AWS S3, then dispatching asynchronous AI processing jobs over RabbitMQ." }, { heading: "Real-Time Multi-Party Socket Sync", detail: "Syncing care team chat state across multiple server instances required unified pub/sub. Implemented Redis Pub/Sub adapter for WebSockets to guarantee message delivery across nodes." }] },
          { title: "Lessons Learned", entries: [{ heading: "Asynchronous First Architecture", detail: "Offloading document intelligence and email dispatches to dedicated background workers protected core patient API latency during peak clinic hours." }, { heading: "Strict Type Safety", detail: "Defining centralized Prisma schemas and TypeScript contracts eliminated schema drift between care team APIs, socket payloads, and billing webhooks." }] },
        ],
      },
      {
        slug: "express-monorepo-template",
        title: "Express Class Monorepo Template",
        subtitle: "Production-ready backend architecture starter",
        description: "A modular, class-based Express monorepo template built with TypeScript, Bun, Docker Compose, and automated API documentation for rapid backend deployment.",
        projectType: "PROJECT" as const,
        status: CaseStudyStatus.PUBLISHED,
        projectStatus: "Status: Completed",
        order: 3,
        featured: false,
        pinned: false,
        techStack: ["TypeScript", "Express", "Bun", "Docker", "Turborepo", "Swagger"],
        liveUrl: null,
        githubUrl: "https://github.com/fiamanillah",
        image: "/assets/images/mickanic-cover.png",
        imageLabel: "Monorepo_Architecture_Template.png",
        role: "Open Source Creator",
        timeline: "2026",
        client: "Open Source",
        impact: "Standardized backend boilerplate across personal and client projects, reducing initial project setup time by over 70%.",
        highlights: [
          "Strict ESLint & Prettier configuration with monorepo Turborepo pipelines",
          "Class-based controller & service routing architecture",
          "Dockerized development and production compose files",
        ],
        views: 1120,
        likesCount: 45,
        publishedAt: new Date("2026-02-01T00:00:00.000Z"),
        metadata: [
          { label: "Role", value: "Open Source Creator" },
          { label: "Timeline", value: "2026" },
          { label: "Client / Company", value: "Open Source" },
          { label: "Tech Stack", value: "TypeScript, Bun, Docker, Express" },
        ],
        contextBlocks: [],
        architectureLayers: [],
        features: [],
        metrics: [],
        postMortem: [],
      },
      {
        slug: "microservice-alert-worker",
        title: "RabbitMQ Microservice Dispatcher",
        subtitle: "High-throughput asynchronous message consumer",
        description: "A lightweight, failure-resilient background queue dispatcher service designed to decouple email, SMS, and web-push notifications from core REST APIs.",
        projectType: "PROJECT" as const,
        status: CaseStudyStatus.PUBLISHED,
        projectStatus: "Status: Live",
        order: 4,
        featured: false,
        pinned: false,
        techStack: ["Node.js", "RabbitMQ", "Redis", "TypeScript", "AWS SES"],
        liveUrl: null,
        githubUrl: "https://github.com/fiamanillah",
        image: "/assets/images/moja-cares-cover.png",
        imageLabel: "Microservice_Alert_Worker.png",
        role: "Full Stack Developer",
        timeline: "2025",
        client: "System Utility",
        impact: "Processed thousands of asynchronous notification events daily with automatic retry strategies and dead-letter queue routing.",
        highlights: [
          "Dead-letter exchange handling for failed message redelivery",
          "Rate-limited SMTP dispatching with Redis token buckets",
        ],
        views: 950,
        likesCount: 38,
        publishedAt: new Date("2025-11-10T00:00:00.000Z"),
        metadata: [
          { label: "Role", value: "Full Stack Developer" },
          { label: "Timeline", value: "2025" },
          { label: "Client / Company", value: "System Utility" },
          { label: "Tech Stack", value: "Node.js, RabbitMQ, Redis, TypeScript" },
        ],
        contextBlocks: [],
        architectureLayers: [],
        features: [],
        metrics: [],
        postMortem: [],
      },
    ];

    const adminUser = await this.db.user.findFirst({
      where: { role: Role.ADMIN },
    });

    let imported = 0;
    for (const cs of defaultStudies) {
      try {
        const caseStudyData = {
          title: cs.title,
          subtitle: cs.subtitle,
          description: cs.description,
          projectType: cs.projectType,
          status: cs.status,
          projectStatus: cs.projectStatus,
          order: cs.order,
          featured: cs.featured,
          pinned: cs.pinned,
          techStack: cs.techStack,
          liveUrl: cs.liveUrl,
          githubUrl: cs.githubUrl,
          image: cs.image,
          imageLabel: cs.imageLabel,
          role: cs.role,
          timeline: cs.timeline,
          client: cs.client,
          impact: cs.impact,
          highlights: cs.highlights || [],
          views: cs.views,
          likesCount: cs.likesCount,
          publishedAt: cs.publishedAt,
          authorId: adminUser?.id || null,
          authorName: adminUser?.name || "Fi Amanillah",
          authorRole: adminUser?.headline || "Author & Lead Architect",
          authorAvatar: adminUser?.avatar || "/fi.png",
          authorTwitter: adminUser?.twitterUrl || null,
          authorLinkedin: adminUser?.linkedinUrl || null,
          authorGithub: adminUser?.githubUrl || null,
          metadata: cs.metadata,
          contextBlocks: cs.contextBlocks,
          architectureLayers: cs.architectureLayers,
          features: cs.features,
          metrics: cs.metrics,
          postMortem: cs.postMortem,
          metaTitle: `${cs.title} | ${cs.projectType === "CASE_STUDY" ? "Technical Case Study" : "Project Showcase"}`,
          metaDescription: cs.description,
          metaKeywords: cs.techStack,
          ogTitle: cs.title,
          ogDescription: cs.description,
          ogImage: cs.image,
          twitterCard: "summary_large_image",
          canonicalUrl: `https://fi.amanillah.com/case-study/${cs.slug}`,
        };

        await this.db.caseStudy.upsert({
          where: { slug: cs.slug },
          update: caseStudyData,
          create: {
            slug: cs.slug,
            ...caseStudyData,
          },
        });

        imported++;
      } catch (err) {
        this.logger.warn(`Could not sync case study ${cs.slug}:`, err);
      }
    }

    return {
      imported,
      message: `Successfully synchronized ${imported} default case studies to the database.`,
    };
  }

  // =========================================================================
  // PUBLIC DISCOVERY & CONSUMPTION ENDPOINTS
  // =========================================================================

  /**
   * List published case studies for public web consumption
   */
  public async getPublicCaseStudies(query: Partial<PublicCaseStudyQueryDTO> = {}) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {
      status: CaseStudyStatus.PUBLISHED,
    };

    if (query.projectType) {
      where.projectType = query.projectType;
    }

    if (query.featured !== undefined) {
      where.featured = query.featured;
    }

    if (query.tech) {
      where.techStack = {
        has: query.tech,
      };
    }

    if (query.search) {
      const searchTerms = query.search.trim();
      where.OR = [
        { title: { contains: searchTerms, mode: "insensitive" } },
        { subtitle: { contains: searchTerms, mode: "insensitive" } },
        { description: { contains: searchTerms, mode: "insensitive" } },
        { client: { contains: searchTerms, mode: "insensitive" } },
        { role: { contains: searchTerms, mode: "insensitive" } },
      ];
    }

    const sortField = query.sortBy || "order";
    const sortDirection = query.sortOrder || "asc";
    const orderBy: any = {};
    orderBy[sortField] = sortDirection;

    const [total, records] = await Promise.all([
      this.db.caseStudy.count({ where }),
      this.db.caseStudy.findMany({
        where,
        orderBy: [orderBy, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: records.map((r) => this.mapToListItemDTO(r)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  /**
   * Retrieve featured published case studies
   */
  public async getFeaturedCaseStudies(): Promise<CaseStudyListItemDTO[]> {
    const records = await this.db.caseStudy.findMany({
      where: {
        status: CaseStudyStatus.PUBLISHED,
        featured: true,
      },
      orderBy: [{ order: "asc" }, { publishedAt: "desc" }],
      take: 6,
    });

    return records.map((r) => this.mapToListItemDTO(r));
  }

  /**
   * Retrieve single public case study by slug + adjacent prev/next and related studies
   */
  public async getPublicCaseStudyBySlug(
    slug: string,
    options: { incrementView?: boolean } = {}
  ): Promise<SingleCaseStudyPublicResponse> {
    const record = await this.db.caseStudy.findUnique({
      where: { slug },
      include: {
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
    });

    if (!record || record.status !== CaseStudyStatus.PUBLISHED) {
      throw new NotFoundError(`Case study '${slug}' not found or not published`);
    }

    // Increment views asynchronously
    if (options.incrementView !== false) {
      this.db.caseStudy
        .update({
          where: { id: record.id },
          data: { views: { increment: 1 } },
        })
        .catch((err) => this.logger.warn("Failed to increment views:", err));
    }

    // Fetch previous and next case studies by order
    const [prevStudy, nextStudy] = await Promise.all([
      this.db.caseStudy.findFirst({
        where: {
          status: CaseStudyStatus.PUBLISHED,
          order: { lt: record.order },
        },
        orderBy: { order: "desc" },
      }),
      this.db.caseStudy.findFirst({
        where: {
          status: CaseStudyStatus.PUBLISHED,
          order: { gt: record.order },
        },
        orderBy: { order: "asc" },
      }),
    ]);

    // Fetch related case studies sharing tech stack
    const relatedRecords = await this.db.caseStudy.findMany({
      where: {
        status: CaseStudyStatus.PUBLISHED,
        id: { not: record.id },
        ...(record.techStack && record.techStack.length > 0 && {
          techStack: {
            hasSome: record.techStack.slice(0, 3),
          },
        }),
      },
      orderBy: { views: "desc" },
      take: 3,
    });

    return {
      caseStudy: this.mapToCaseStudyDTO(record),
      prevCaseStudy: prevStudy ? this.mapToListItemDTO(prevStudy) : null,
      nextCaseStudy: nextStudy ? this.mapToListItemDTO(nextStudy) : null,
      relatedCaseStudies: relatedRecords.map((r) => this.mapToListItemDTO(r)),
    };
  }

  /**
   * React / like a case study
   */
  public async reactToCaseStudy(
    slug: string,
    reactionType: string = "like"
  ): Promise<{ likesCount: number }> {
    const existing = await this.db.caseStudy.findUnique({
      where: { slug },
      select: { id: true, likesCount: true },
    });

    if (!existing) {
      throw new NotFoundError(`Case study '${slug}' not found`);
    }

    const updated = await this.db.caseStudy.update({
      where: { id: existing.id },
      data: { likesCount: { increment: 1 } },
      select: { likesCount: true },
    });

    return { likesCount: updated.likesCount };
  }
}
