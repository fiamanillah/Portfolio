// src/Modules/Redirect/redirect.service.ts
import { prisma, RedirectEntityType, type Redirect } from "@workspace/db"
import { AppLogger } from "@workspace/logger"
import {
  BadRequestError,
  NotFoundError,
  ConflictError,
} from "@/core/errors/AppError"
import { CacheManager } from "@workspace/cache"
import { config } from "@/core/config"
import type {
  CreateRedirectDTO,
  UpdateRedirectDTO,
  QueryRedirectsDTO,
  RedirectDTO,
  ResolvedRedirectDTO,
  RedirectStatsDTO,
} from "./RedirectDTO"

export class RedirectService {
  private logger = new AppLogger("RedirectService")
  private cache: CacheManager

  constructor() {
    this.cache = new CacheManager({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      db: config.redis.db,
      keyPrefix: "redirect:",
      url: config.redis.url,
      defaultTTLSeconds: 86400, // 24 hours default TTL
    })
  }

  /**
   * Helper to normalize URLs and paths:
   * - Trims whitespace
   * - Ensures single leading slash for internal paths
   * - Removes trailing slashes (except root "/")
   * - Preserves external full URLs (https://...)
   */
  public normalizePath(rawPath: string): string {
    if (!rawPath) return "/"
    let normalized = rawPath.trim()

    // External URL handling
    if (/^https?:\/\//i.test(normalized)) {
      try {
        const parsed = new URL(normalized)
        if (parsed.pathname.length > 1 && parsed.pathname.endsWith("/")) {
          parsed.pathname = parsed.pathname.slice(0, -1)
        }
        let res = parsed.toString()
        if (parsed.pathname === "/" && !normalized.endsWith("/")) {
          res = res.replace(/\/$/, "")
        }
        return res
      } catch {
        return normalized
      }
    }

    // Ensure leading slash
    if (!normalized.startsWith("/")) {
      normalized = `/${normalized}`
    }

    // Replace consecutive slashes
    normalized = normalized.replace(/\/+/g, "/")

    // Strip trailing slash if longer than "/"
    if (normalized.length > 1 && normalized.endsWith("/")) {
      normalized = normalized.slice(0, -1)
    }

    return normalized
  }

  /**
   * Resolve an incoming path against active redirects (cached in Redis)
   */
  public async resolve(rawPath: string): Promise<ResolvedRedirectDTO> {
    const normalizedPath = this.normalizePath(rawPath)
    const cacheKey = `path:${normalizedPath}`

    try {
      const cached = await this.cache.get<{
        targetPath: string
        statusCode: number
        id: string
      } | null>(cacheKey)

      if (cached !== null) {
        if (cached && cached.targetPath) {
          // Asynchronously record hit
          this.recordHitAsync(cached.id)
          return {
            redirected: true,
            destination: cached.targetPath,
            statusCode: cached.statusCode,
            permanent: [301, 308].includes(cached.statusCode),
          }
        }
        // Negative cache hit
        return { redirected: false }
      }
    } catch (err) {
      this.logger.warn(`Redis cache read failed for path '${normalizedPath}':`, err)
    }

    // Database fallback lookup
    const redirect = await prisma.redirect.findFirst({
      where: {
        sourcePath: normalizedPath,
        isActive: true,
      },
    })

    if (!redirect) {
      // Cache negative lookup for 60 seconds to mitigate DB spam
      await this.cache
        .set(cacheKey, null, { ttlSeconds: 60 })
        .catch(() => {})
      return { redirected: false }
    }

    // Cache successful redirect in Redis
    await this.cache
      .set(
        cacheKey,
        {
          id: redirect.id,
          targetPath: redirect.targetPath,
          statusCode: redirect.statusCode,
        },
        { ttlSeconds: 86400 }
      )
      .catch(() => {})

    // Asynchronously record hit
    this.recordHitAsync(redirect.id)

    return {
      redirected: true,
      destination: redirect.targetPath,
      statusCode: redirect.statusCode,
      permanent: [301, 308].includes(redirect.statusCode),
    }
  }

  /**
   * Asynchronously increment hit counter and update lastHitAt timestamp
   */
  private recordHitAsync(redirectId: string): void {
    prisma.redirect
      .update({
        where: { id: redirectId },
        data: {
          hitCount: { increment: 1 },
          lastHitAt: new Date(),
        },
      })
      .catch((err) => {
        this.logger.warn(`Failed to update hit count for redirect ${redirectId}:`, err)
      })
  }

  /**
   * Automatically track slug changes when content (BlogPost, CaseStudy, Category) is updated.
   * Handles:
   * 1. 301 Permanent Redirect creation
   * 2. Existing redirect chain flattening (A -> oldSlug becomes A -> newSlug)
   * 3. Loop prevention (if newSlug was previously an oldSlug pointing to current, resolves loop)
   * 4. Redis cache invalidation
   */
  public async trackEntitySlugChange(params: {
    entityType: RedirectEntityType
    entityId?: string
    oldPath: string
    newPath: string
    notes?: string
  }): Promise<void> {
    const oldPath = this.normalizePath(params.oldPath)
    const newPath = this.normalizePath(params.newPath)

    if (oldPath === newPath) {
      return // No change in path
    }

    this.logger.info(
      `⚡ Tracking slug change for ${params.entityType} [${params.entityId || "N/A"}]: '${oldPath}' -> '${newPath}'`
    )

    try {
      // 1. Remove any existing redirect where sourcePath is newPath (since newPath is now an active live entity)
      await prisma.redirect.deleteMany({
        where: {
          sourcePath: newPath,
        },
      })

      // 2. Flatten any existing redirect chains pointing to oldPath (e.g. previous old slugs)
      // If previous redirects pointed to oldPath, update them to point directly to newPath
      const chainedRedirects = await prisma.redirect.findMany({
        where: {
          targetPath: oldPath,
        },
      })

      if (chainedRedirects.length > 0) {
        await prisma.redirect.updateMany({
          where: {
            targetPath: oldPath,
          },
          data: {
            targetPath: newPath,
            statusCode: 301,
          },
        })

        // Invalidate cache for chained source paths
        for (const chained of chainedRedirects) {
          await this.cache.del(`path:${chained.sourcePath}`).catch(() => {})
        }
        this.logger.info(
          `✔ Flattened ${chainedRedirects.length} chained redirects pointing to '${oldPath}' -> '${newPath}'`
        )
      }

      // 3. Upsert the direct redirect from oldPath -> newPath
      await prisma.redirect.upsert({
        where: { sourcePath: oldPath },
        create: {
          sourcePath: oldPath,
          targetPath: newPath,
          statusCode: 301,
          entityType: params.entityType,
          entityId: params.entityId || null,
          autoGenerated: true,
          isActive: true,
          notes:
            params.notes ||
            `Auto-generated 301 on ${params.entityType.toLowerCase().replace(/_/g, " ")} update`,
        },
        update: {
          targetPath: newPath,
          statusCode: 301,
          entityType: params.entityType,
          entityId: params.entityId || null,
          isActive: true,
          notes:
            params.notes ||
            `Auto-updated 301 target to '${newPath}' on ${params.entityType.toLowerCase().replace(/_/g, " ")} update`,
        },
      })

      // 4. Invalidate Redis caches
      await this.cache.del(`path:${oldPath}`).catch(() => {})
      await this.cache.del(`path:${newPath}`).catch(() => {})

      this.logger.info(
        `✔ Successfully registered 301 Permanent Redirect: '${oldPath}' -> '${newPath}'`
      )
    } catch (err) {
      this.logger.error(
        `Failed to track slug change from '${oldPath}' to '${newPath}':`,
        { error: err }
      )
    }
  }

  /**
   * Create a new redirect manually from Dashboard
   */
  public async create(dto: CreateRedirectDTO): Promise<RedirectDTO> {
    const sourcePath = this.normalizePath(dto.sourcePath)
    const targetPath = this.normalizePath(dto.targetPath)

    if (sourcePath === targetPath) {
      throw new BadRequestError("Source path and target path cannot be identical")
    }

    const existing = await prisma.redirect.findUnique({
      where: { sourcePath },
    })

    if (existing) {
      throw new ConflictError(
        `A redirect rule for source path '${sourcePath}' already exists (pointing to '${existing.targetPath}')`
      )
    }

    // Check for direct circular loop (targetPath -> sourcePath)
    const reverseRedirect = await prisma.redirect.findUnique({
      where: { sourcePath: targetPath },
    })

    if (reverseRedirect && reverseRedirect.targetPath === sourcePath) {
      throw new BadRequestError(
        `Cannot create redirect: '${targetPath}' already redirects back to '${sourcePath}'. This would cause an infinite redirect loop.`
      )
    }

    // Flatten any previous redirects targeting sourcePath
    await prisma.redirect.updateMany({
      where: { targetPath: sourcePath },
      data: { targetPath: targetPath, statusCode: dto.statusCode || 301 },
    })

    const created = await prisma.redirect.create({
      data: {
        sourcePath,
        targetPath,
        statusCode: dto.statusCode || 301,
        entityType: (dto.entityType as RedirectEntityType) || RedirectEntityType.CUSTOM,
        entityId: dto.entityId || null,
        autoGenerated: false,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
        notes: dto.notes?.trim() || null,
      },
    })

    // Invalidate cache
    await this.cache.del(`path:${sourcePath}`).catch(() => {})

    return this.mapToDTO(created)
  }

  /**
   * Update an existing redirect
   */
  public async update(id: string, dto: UpdateRedirectDTO): Promise<RedirectDTO> {
    const existing = await prisma.redirect.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new NotFoundError(`Redirect with ID '${id}' not found`)
    }

    let sourcePath = existing.sourcePath
    if (dto.sourcePath !== undefined) {
      sourcePath = this.normalizePath(dto.sourcePath)
    }

    let targetPath = existing.targetPath
    if (dto.targetPath !== undefined) {
      targetPath = this.normalizePath(dto.targetPath)
    }

    if (sourcePath === targetPath) {
      throw new BadRequestError("Source path and target destination cannot be identical")
    }

    // If sourcePath changed, verify uniqueness
    if (dto.sourcePath && sourcePath !== existing.sourcePath) {
      const conflict = await prisma.redirect.findUnique({
        where: { sourcePath },
      })
      if (conflict && conflict.id !== id) {
        throw new ConflictError(
          `Another redirect with source path '${sourcePath}' already exists`
        )
      }
    }

    const updated = await prisma.redirect.update({
      where: { id },
      data: {
        sourcePath,
        targetPath,
        ...(dto.statusCode !== undefined && { statusCode: dto.statusCode }),
        ...(dto.entityType !== undefined && {
          entityType: dto.entityType as RedirectEntityType,
        }),
        ...(dto.entityId !== undefined && { entityId: dto.entityId }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.notes !== undefined && { notes: dto.notes?.trim() || null }),
      },
    })

    // Invalidate cache for both old and new paths
    await this.cache.del(`path:${existing.sourcePath}`).catch(() => {})
    await this.cache.del(`path:${sourcePath}`).catch(() => {})

    return this.mapToDTO(updated)
  }

  /**
   * Delete a redirect rule
   */
  public async delete(id: string): Promise<void> {
    const existing = await prisma.redirect.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new NotFoundError(`Redirect with ID '${id}' not found`)
    }

    await prisma.redirect.delete({
      where: { id },
    })

    await this.cache.del(`path:${existing.sourcePath}`).catch(() => {})
  }

  /**
   * Bulk delete redirects
   */
  public async bulkDelete(ids: string[]): Promise<{ count: number }> {
    const records = await prisma.redirect.findMany({
      where: { id: { in: ids } },
      select: { sourcePath: true },
    })

    const result = await prisma.redirect.deleteMany({
      where: { id: { in: ids } },
    })

    for (const rec of records) {
      await this.cache.del(`path:${rec.sourcePath}`).catch(() => {})
    }

    return { count: result.count }
  }

  /**
   * Get paginated redirects list for Admin Dashboard
   */
  public async getAllAdmin(query: QueryRedirectsDTO): Promise<{
    data: RedirectDTO[]
    pagination: {
      total: number
      page: number
      limit: number
      totalPages: number
      hasNext: boolean
      hasPrevious: boolean
    }
  }> {
    const page = query.page || 1
    const limit = query.limit || 20
    const skip = (page - 1) * limit

    const where: any = {}

    if (query.search && query.search.trim().length > 0) {
      const search = query.search.trim()
      where.OR = [
        { sourcePath: { contains: search, mode: "insensitive" } },
        { targetPath: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ]
    }

    if (query.entityType && query.entityType !== "ALL") {
      where.entityType = query.entityType as RedirectEntityType
    }

    if (query.statusCode) {
      where.statusCode = query.statusCode
    }

    if (query.isActive && query.isActive !== "all") {
      where.isActive = query.isActive === "true"
    }

    if (query.autoGenerated && query.autoGenerated !== "all") {
      where.autoGenerated = query.autoGenerated === "true"
    }

    const orderBy: any = {}
    const sortBy = query.sortBy || "createdAt"
    const sortOrder = query.sortOrder || "desc"
    orderBy[sortBy] = sortOrder

    const [total, records] = await Promise.all([
      prisma.redirect.count({ where }),
      prisma.redirect.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
    ])

    const totalPages = Math.ceil(total / limit) || 1

    return {
      data: records.map((r) => this.mapToDTO(r)),
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    }
  }

  /**
   * Get overview statistics for the redirects dashboard
   */
  public async getStats(): Promise<RedirectStatsDTO> {
    const [
      totalRedirects,
      activeRedirects,
      permanentCount,
      temporaryCount,
      autoGeneratedCount,
      customCount,
      hitsAggregate,
      groupedEntities,
    ] = await Promise.all([
      prisma.redirect.count(),
      prisma.redirect.count({ where: { isActive: true } }),
      prisma.redirect.count({ where: { statusCode: { in: [301, 308] } } }),
      prisma.redirect.count({ where: { statusCode: { in: [302, 307] } } }),
      prisma.redirect.count({ where: { autoGenerated: true } }),
      prisma.redirect.count({ where: { autoGenerated: false } }),
      prisma.redirect.aggregate({ _sum: { hitCount: true } }),
      prisma.redirect.groupBy({
        by: ["entityType"],
        _count: { _all: true },
      }),
    ])

    const entityBreakdown: Record<RedirectEntityType, number> = {
      BLOG_POST: 0,
      CASE_STUDY: 0,
      BLOG_CATEGORY: 0,
      STATIC_PAGE: 0,
      CUSTOM: 0,
    }

    for (const g of groupedEntities) {
      entityBreakdown[g.entityType] = g._count._all
    }

    return {
      totalRedirects,
      activeRedirects,
      permanentCount,
      temporaryCount,
      autoGeneratedCount,
      customCount,
      totalHits: hitsAggregate._sum.hitCount || 0,
      entityBreakdown,
    }
  }

  /**
   * Map Prisma entity to clean DTO
   */
  public mapToDTO(entity: Redirect): RedirectDTO {
    return {
      id: entity.id,
      sourcePath: entity.sourcePath,
      targetPath: entity.targetPath,
      statusCode: entity.statusCode,
      entityType: entity.entityType,
      entityId: entity.entityId,
      autoGenerated: entity.autoGenerated,
      isActive: entity.isActive,
      hitCount: entity.hitCount,
      lastHitAt: entity.lastHitAt ? entity.lastHitAt.toISOString() : null,
      notes: entity.notes,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    }
  }
}
