// apps/api/src/Modules/Media/media.service.ts
import crypto from "crypto"
import { prisma, Role, MediaFile } from "@workspace/db"
import { AppLogger } from "@workspace/logger"
import {
  BadRequestError,
  NotFoundError,
  AuthorizationError,
} from "@/core/errors/AppError"
import { StorageService } from "@/services/StorageService"
import {
  MediaFileDTO,
  PresignedUploadRequestDTO,
  PresignedUploadResponseDTO,
  ConfirmPresignedUploadDTO,
  UpdateMediaFileDTO,
  ListMediaQueryDTO,
  MediaStatsDTO,
  BulkDeleteMediaDTO,
  BulkUpdateMediaDTO,
} from "@workspace/shared"
import {
  UploadMediaBody,
  UploadMediaOptions,
  CleanupMediaBody,
} from "./MediaDTO"
import path from "path"

export class MediaService {
  private logger = new AppLogger("MediaService")

  constructor(
    private readonly storage: StorageService = new StorageService(),
    private readonly db: typeof prisma = prisma
  ) {}

  public getStorageService(): StorageService {
    return this.storage
  }

  /**
   * Serializes a Prisma MediaFile model into MediaFileDTO
   */
  public serializeMedia(
    file: MediaFile & {
      uploader?: {
        id: string
        name: string | null
        email: string
        username: string | null
        avatar: string | null
      } | null
    }
  ): MediaFileDTO {
    const sizeNumber = Number(file.size)

    return {
      id: file.id,
      key: file.key,
      bucket: file.bucket,
      fileName: file.fileName,
      fileExtension: file.fileExtension,
      mimeType: file.mimeType,
      size: sizeNumber,
      sizeFormatted: this.storage.formatBytes(file.size),
      url: file.url,
      etag: file.etag,
      source: file.source,
      folder: file.folder,
      entityType: file.entityType,
      entityId: file.entityId,
      tags: file.tags,
      altText: file.altText,
      caption: file.caption,
      metadata: (file.metadata as Record<string, any>) || null,
      isPublic: file.isPublic,
      uploaderId: file.uploaderId,
      uploader: file.uploader
        ? {
            id: file.uploader.id,
            name: file.uploader.name || "",
            email: file.uploader.email,
            username: file.uploader.username || "",
            avatar: file.uploader.avatar,
          }
        : null,
      createdAt: file.createdAt.toISOString(),
      updatedAt: file.updatedAt.toISOString(),
    }
  }

  /**
   * 1. DIRECT MULTIPART SINGLE FILE UPLOAD:
   * Optimized with automatic content-hash deduplication to prevent duplicate R2 writes & storage costs.
   */
  public async uploadSingle(
    file: Express.Multer.File,
    options: UploadMediaOptions = {},
    uploaderId?: string
  ): Promise<MediaFileDTO> {
    if (!file || !file.buffer) {
      throw new BadRequestError("No file payload provided for upload")
    }

    const fileName = file.originalname || "unnamed-file"
    const mimeType = file.mimetype || "application/octet-stream"
    const ext = path.extname(fileName).replace(/^\./, "").toLowerCase() || null
    const folder = options.folder || "general"
    const source = options.source || "API"
    const isPublic =
      typeof options.isPublic === "boolean"
        ? options.isPublic
        : typeof options.isPublic === "string"
          ? options.isPublic === "true" || options.isPublic === "1"
          : true
    const allowDuplicate =
      typeof options.allowDuplicate === "boolean"
        ? options.allowDuplicate
        : typeof options.allowDuplicate === "string"
          ? options.allowDuplicate === "true" || options.allowDuplicate === "1"
          : false
    const tags = Array.isArray(options.tags)
      ? options.tags
      : typeof options.tags === "string"
        ? (options.tags as string)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : []

    this.logger.info("Processing single file upload", {
      fileName,
      mimeType,
      size: file.size,
      folder,
      source,
      uploaderId,
      isPublic,
    })

    const bufferLength = file.buffer.length
    const md5Hash = crypto.createHash("md5").update(file.buffer).digest("hex")
    if (!allowDuplicate) {
      const existingFile = await this.db.mediaFile.findFirst({
        where: {
          OR: [
            { etag: md5Hash },
            { etag: `"${md5Hash}"` },
            { metadata: { path: ["contentHash"], equals: md5Hash } },
          ],
          size: BigInt(bufferLength),
          folder,
        },
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
              avatar: true,
            },
          },
        },
      })

      if (existingFile) {
        this.logger.info(
          `✔ [Deduplication] Reusing identical existing media asset "${existingFile.key}" to save R2 storage & API Class A write costs.`,
          { key: existingFile.key, size: bufferLength }
        )
        return this.serializeMedia(existingFile)
      }
    }

    // Upload to S3 / Cloudflare R2
    const uploadResult = await this.storage.uploadBuffer({
      buffer: file.buffer,
      fileName,
      mimeType,
      folder,
      tags,
      metadata: {
        source,
        contentHash: md5Hash,
        ...(options.entityType ? { entityType: options.entityType } : {}),
        ...(options.entityId ? { entityId: options.entityId } : {}),
        ...(uploaderId ? { uploaderId } : {}),
      },
      isPublic,
    })

    // Save record to DB
    const mediaRecord = await this.db.mediaFile.create({
      data: {
        key: uploadResult.key,
        bucket: uploadResult.bucket,
        fileName,
        fileExtension: ext,
        mimeType,
        size: BigInt(uploadResult.size || bufferLength),
        url: uploadResult.url,
        etag: uploadResult.etag || md5Hash,
        source,
        folder,
        entityType: options.entityType || null,
        entityId: options.entityId || null,
        tags,
        altText: options.altText || null,
        caption: options.caption || null,
        metadata: {
          ...((options.metadata as any) || {}),
          contentHash: md5Hash,
        },
        isPublic,
        uploaderId: uploaderId || null,
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            avatar: true,
          },
        },
      },
    })

    this.logger.info("✔ Media file saved to database", {
      id: mediaRecord.id,
      key: mediaRecord.key,
    })
    return this.serializeMedia(mediaRecord)
  }

  /**
   * 2. DIRECT MULTIPART MULTI-FILE UPLOAD:
   */
  public async uploadMultiple(
    files: Express.Multer.File[],
    options: UploadMediaOptions = {},
    uploaderId?: string
  ): Promise<MediaFileDTO[]> {
    if (!files || files.length === 0) {
      throw new BadRequestError("No files provided for batch upload")
    }

    this.logger.info(`Processing batch upload of ${files.length} files`)
    const results: MediaFileDTO[] = []

    for (const file of files) {
      const saved = await this.uploadSingle(file, options, uploaderId)
      results.push(saved)
    }

    return results
  }

  /**
   * 3. GENERATE PRESIGNED UPLOAD URL & REGISTER PENDING RECORD:
   */
  public async createPresignedUpload(
    dto: PresignedUploadRequestDTO,
    uploaderId?: string
  ): Promise<PresignedUploadResponseDTO> {
    const folder = dto.folder || "general"
    const source = dto.source || "API"
    const ext =
      path.extname(dto.fileName).replace(/^\./, "").toLowerCase() || null
    const isPublic = dto.isPublic ?? true

    // Generate unique key
    const key = this.storage.generateObjectKey(folder, dto.fileName)

    const presigned = await this.storage.createPresignedUploadUrl({
      fileName: dto.fileName,
      mimeType: dto.mimeType,
      size: dto.size,
      folder,
      key,
      expiresInSeconds: dto.expiresInSeconds || 900,
      tags: dto.tags,
      isPublic,
      metadata: {
        source,
        ...(dto.entityType ? { entityType: dto.entityType } : {}),
        ...(dto.entityId ? { entityId: dto.entityId } : {}),
        ...(uploaderId ? { uploaderId } : {}),
      },
    })

    // Create preliminary media tracking record
    const record = await this.db.mediaFile.create({
      data: {
        key,
        bucket: presigned.bucket,
        fileName: dto.fileName,
        fileExtension: ext,
        mimeType: dto.mimeType,
        size: BigInt(dto.size),
        url: presigned.publicUrl,
        source,
        folder,
        entityType: dto.entityType || null,
        entityId: dto.entityId || null,
        tags: dto.tags || [],
        altText: dto.altText || null,
        caption: dto.caption || null,
        metadata: (dto.metadata as any) || {},
        isPublic,
        uploaderId: uploaderId || null,
      },
    })

    return {
      id: record.id,
      key: presigned.key,
      bucket: presigned.bucket,
      uploadUrl: presigned.uploadUrl,
      publicUrl: presigned.publicUrl,
      fileName: dto.fileName,
      mimeType: dto.mimeType,
      expiresInSeconds: presigned.expiresInSeconds,
      headers: presigned.headers,
    }
  }

  /**
   * 4. CONFIRM DIRECT PRESIGNED UPLOAD:
   * Verifies object in R2/S3 and updates record metadata/etag/size.
   */
  public async confirmPresignedUpload(
    dto: ConfirmPresignedUploadDTO,
    uploaderId?: string
  ): Promise<MediaFileDTO> {
    this.logger.info("Confirming presigned upload", {
      key: dto.key,
      id: dto.id,
    })

    // Verify object in S3/R2
    let s3Meta
    try {
      s3Meta = await this.storage.getObjectMetadata(dto.key)
    } catch {
      throw new NotFoundError(
        `Uploaded object "${dto.key}" was not found in storage bucket.`
      )
    }

    const actualSize = dto.size || s3Meta.size
    const actualEtag = dto.etag || s3Meta.etag

    // Look for record by key or id
    const existing = await this.db.mediaFile.findFirst({
      where: dto.id ? { id: dto.id } : { key: dto.key },
    })

    let updatedRecord
    if (existing) {
      updatedRecord = await this.db.mediaFile.update({
        where: { id: existing.id },
        data: {
          size: BigInt(actualSize),
          etag: actualEtag,
          mimeType: s3Meta.mimeType || existing.mimeType,
          ...(dto.altText !== undefined ? { altText: dto.altText } : {}),
          ...(dto.caption !== undefined ? { caption: dto.caption } : {}),
          ...(dto.tags !== undefined ? { tags: dto.tags } : {}),
          ...(dto.metadata !== undefined
            ? { metadata: dto.metadata as any }
            : {}),
          ...(uploaderId && !existing.uploaderId ? { uploaderId } : {}),
        },
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
              avatar: true,
            },
          },
        },
      })
    } else {
      // Create new record if presigned was generated without preliminary record
      const fileName = path.basename(dto.key)
      const ext =
        path.extname(fileName).replace(/^\./, "").toLowerCase() || null
      const folder = dto.key.includes("/") ? dto.key.split("/")[0] : "general"

      updatedRecord = await this.db.mediaFile.create({
        data: {
          key: dto.key,
          bucket: this.storage.getBucket(),
          fileName,
          fileExtension: ext,
          mimeType: s3Meta.mimeType,
          size: BigInt(actualSize),
          url: this.storage.formatPublicUrl(dto.key),
          etag: actualEtag,
          source: "DIRECT_PRESIGNED",
          folder,
          tags: dto.tags || [],
          altText: dto.altText || null,
          caption: dto.caption || null,
          metadata: (dto.metadata as any) || {},
          isPublic: true,
          uploaderId: uploaderId || null,
        },
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
              avatar: true,
            },
          },
        },
      })
    }

    this.logger.info("✔ Presigned upload confirmed and verified", {
      id: updatedRecord.id,
    })
    return this.serializeMedia(updatedRecord)
  }

  /**
   * 5. LIST MEDIA FILES WITH SEARCH & FILTERS:
   */
  public async listMedia(query: ListMediaQueryDTO) {
    const page = Math.max(1, query.page || 1)
    const limit = Math.min(100, Math.max(1, query.limit || 20))
    const skip = (page - 1) * limit

    const where: any = {}

    if (query.search && query.search.trim()) {
      const search = query.search.trim()
      where.OR = [
        { fileName: { contains: search, mode: "insensitive" } },
        { altText: { contains: search, mode: "insensitive" } },
        { caption: { contains: search, mode: "insensitive" } },
        { key: { contains: search, mode: "insensitive" } },
      ]
    }

    if (query.folder && query.folder !== "ALL") {
      where.folder = query.folder
    }

    if (query.source && query.source !== "ALL") {
      where.source = query.source
    }

    if (query.mimeType) {
      if (query.mimeType.endsWith("/*")) {
        where.mimeType = { startsWith: query.mimeType.replace("/*", "") }
      } else {
        where.mimeType = query.mimeType
      }
    }

    if (query.entityType) {
      where.entityType = query.entityType
    }

    if (query.entityId) {
      where.entityId = query.entityId
    }

    if (query.tag) {
      where.tags = { has: query.tag }
    }

    if (query.uploaderId) {
      where.uploaderId = query.uploaderId
    }

    if (query.isPublic !== undefined) {
      where.isPublic = query.isPublic
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {}
      if (query.startDate) where.createdAt.gte = new Date(query.startDate)
      if (query.endDate) where.createdAt.lte = new Date(query.endDate)
    }

    const sortField = ["createdAt", "size", "fileName", "updatedAt"].includes(
      query.sortBy || ""
    )
      ? query.sortBy!
      : "createdAt"
    const sortOrder = query.sortOrder === "asc" ? "asc" : "desc"

    const [total, files] = await Promise.all([
      this.db.mediaFile.count({ where }),
      this.db.mediaFile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortField]: sortOrder },
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
              avatar: true,
            },
          },
        },
      }),
    ])

    const totalPages = Math.ceil(total / limit) || 1

    return {
      data: files.map((f) => this.serializeMedia(f)),
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
   * 6. GET MEDIA BY ID:
   */
  public async getMediaById(id: string): Promise<MediaFileDTO> {
    const file = await this.db.mediaFile.findUnique({
      where: { id },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            avatar: true,
          },
        },
      },
    })

    if (!file) {
      throw new NotFoundError("Media file not found.")
    }

    return this.serializeMedia(file)
  }

  /**
   * 7. GET MEDIA BY KEY:
   */
  public async getMediaByKey(key: string): Promise<MediaFileDTO> {
    const file = await this.db.mediaFile.findUnique({
      where: { key },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            avatar: true,
          },
        },
      },
    })

    if (!file) {
      throw new NotFoundError(`Media file with key "${key}" not found.`)
    }

    return this.serializeMedia(file)
  }

  /**
   * 8. UPDATE MEDIA METADATA:
   */
  public async updateMedia(
    id: string,
    dto: UpdateMediaFileDTO,
    currentUserId?: string,
    userRole?: Role
  ): Promise<MediaFileDTO> {
    const existing = await this.db.mediaFile.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new NotFoundError("Media file not found.")
    }

    // RBAC: Non-admin can only update their own uploaded media
    if (
      userRole !== Role.ADMIN &&
      userRole !== Role.MODERATOR &&
      existing.uploaderId !== currentUserId
    ) {
      throw new AuthorizationError(
        "You do not have permission to update this media asset."
      )
    }

    const updated = await this.db.mediaFile.update({
      where: { id },
      data: {
        ...(dto.fileName !== undefined ? { fileName: dto.fileName } : {}),
        ...(dto.altText !== undefined ? { altText: dto.altText } : {}),
        ...(dto.caption !== undefined ? { caption: dto.caption } : {}),
        ...(dto.folder !== undefined ? { folder: dto.folder } : {}),
        ...(dto.tags !== undefined ? { tags: dto.tags } : {}),
        ...(dto.metadata !== undefined
          ? { metadata: dto.metadata as any }
          : {}),
        ...(dto.isPublic !== undefined ? { isPublic: dto.isPublic } : {}),
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            avatar: true,
          },
        },
      },
    })

    this.logger.info("✔ Media file updated", { id })
    return this.serializeMedia(updated)
  }

  /**
   * 9. DELETE MEDIA ASSET (R2/S3 + DB):
   */
  public async deleteMedia(
    id: string,
    currentUserId?: string,
    userRole?: Role
  ): Promise<{ success: true; message: string }> {
    const existing = await this.db.mediaFile.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new NotFoundError("Media file not found.")
    }

    // RBAC: Non-admin can only delete their own uploaded media
    if (
      userRole !== Role.ADMIN &&
      userRole !== Role.MODERATOR &&
      existing.uploaderId !== currentUserId
    ) {
      throw new AuthorizationError(
        "You do not have permission to delete this media asset."
      )
    }

    // 1. Delete object from R2 / S3
    try {
      await this.storage.deleteObject(existing.key)
    } catch (err: any) {
      this.logger.warn(
        `Failed to delete object from S3/R2 (${existing.key}), proceeding with DB deletion`,
        {
          error: err.message,
        }
      )
    }

    // 2. Delete record from database
    await this.db.mediaFile.delete({
      where: { id },
    })

    this.logger.info("✔ Media asset permanently deleted", {
      id,
      key: existing.key,
    })
    return {
      success: true,
      message: `Media asset "${existing.fileName}" deleted successfully.`,
    }
  }

  /**
   * 10. BULK DELETE MEDIA ASSETS:
   */
  public async bulkDeleteMedia(
    dto: BulkDeleteMediaDTO,
    currentUserId?: string,
    userRole?: Role
  ): Promise<{ success: true; count: number; deletedIds: string[] }> {
    const where: any = {}

    if (dto.ids && dto.ids.length > 0) {
      where.id = { in: dto.ids }
    } else if (dto.keys && dto.keys.length > 0) {
      where.key = { in: dto.keys }
    }

    // If caller is not admin, limit deletion to their own uploads
    if (
      userRole !== Role.ADMIN &&
      userRole !== Role.MODERATOR &&
      currentUserId
    ) {
      where.uploaderId = currentUserId
    }

    const files = await this.db.mediaFile.findMany({
      where,
      select: { id: true, key: true },
    })

    if (files.length === 0) {
      return { success: true, count: 0, deletedIds: [] }
    }

    const keys = files.map((f) => f.key)
    const ids = files.map((f) => f.id)

    // 1. Bulk delete from S3/R2
    try {
      await this.storage.deleteObjects(keys)
    } catch (err: any) {
      this.logger.warn(
        "Bulk S3 deletion encountered errors, continuing DB cleanup",
        { error: err.message }
      )
    }

    // 2. Bulk delete from DB
    await this.db.mediaFile.deleteMany({
      where: { id: { in: ids } },
    })

    this.logger.info(`✔ Bulk deleted ${ids.length} media assets`)
    return { success: true, count: ids.length, deletedIds: ids }
  }

  /**
   * 10b. BULK UPDATE MEDIA ASSETS (Move folder, add tags, visibility):
   */
  public async bulkUpdateMedia(
    dto: BulkUpdateMediaDTO,
    currentUserId?: string,
    userRole?: Role
  ): Promise<{ success: true; count: number; updatedIds: string[] }> {
    const where: any = { id: { in: dto.ids } }

    // RBAC: Non-admin can only update their own uploaded media
    if (
      userRole !== Role.ADMIN &&
      userRole !== Role.MODERATOR &&
      currentUserId
    ) {
      where.uploaderId = currentUserId
    }

    const data: any = {}
    if (dto.folder !== undefined) {
      data.folder = dto.folder
    }
    if (dto.tags !== undefined) {
      data.tags = dto.tags
    }
    if (dto.isPublic !== undefined) {
      data.isPublic = dto.isPublic
    }

    const updateResult = await this.db.mediaFile.updateMany({
      where,
      data,
    })

    this.logger.info(`✔ Bulk updated ${updateResult.count} media assets`)
    return { success: true, count: updateResult.count, updatedIds: dto.ids }
  }

  /**
   * 11. STORAGE KPI ANALYTICS & STATS:
   */
  public async getMediaStats(): Promise<MediaStatsDTO> {
    const [
      totalFiles,
      totalSizeResult,
      folderGroups,
      filesForMime,
      sourceGroups,
    ] = await Promise.all([
      this.db.mediaFile.count(),
      this.db.mediaFile.aggregate({
        _sum: { size: true },
      }),
      this.db.mediaFile.groupBy({
        by: ["folder"],
        _count: { id: true },
        _sum: { size: true },
      }),
      this.db.mediaFile.findMany({
        select: { mimeType: true, size: true },
      }),
      this.db.mediaFile.groupBy({
        by: ["source"],
        _count: { id: true },
      }),
    ])

    const totalSizeBytes = totalSizeResult._sum.size
      ? Number(totalSizeResult._sum.size)
      : 0

    // Folder statistics
    const folders = folderGroups.map((g) => {
      const sizeBytes = g._sum.size ? Number(g._sum.size) : 0
      return {
        folder: g.folder,
        count: g._count.id,
        sizeBytes,
        sizeFormatted: this.storage.formatBytes(sizeBytes),
      }
    })

    // Categories breakdown
    const categories = {
      images: { count: 0, sizeBytes: 0, sizeFormatted: "0 B" },
      videos: { count: 0, sizeBytes: 0, sizeFormatted: "0 B" },
      documents: { count: 0, sizeBytes: 0, sizeFormatted: "0 B" },
      audio: { count: 0, sizeBytes: 0, sizeFormatted: "0 B" },
      archives: { count: 0, sizeBytes: 0, sizeFormatted: "0 B" },
      other: { count: 0, sizeBytes: 0, sizeFormatted: "0 B" },
    }

    for (const f of filesForMime) {
      const mime = f.mimeType.toLowerCase()
      const sz = Number(f.size)

      if (mime.startsWith("image/")) {
        categories.images.count++
        categories.images.sizeBytes += sz
      } else if (mime.startsWith("video/")) {
        categories.videos.count++
        categories.videos.sizeBytes += sz
      } else if (mime.startsWith("audio/")) {
        categories.audio.count++
        categories.audio.sizeBytes += sz
      } else if (
        mime.includes("pdf") ||
        mime.includes("document") ||
        mime.includes("word") ||
        mime.includes("text")
      ) {
        categories.documents.count++
        categories.documents.sizeBytes += sz
      } else if (
        mime.includes("zip") ||
        mime.includes("tar") ||
        mime.includes("gzip") ||
        mime.includes("rar")
      ) {
        categories.archives.count++
        categories.archives.sizeBytes += sz
      } else {
        categories.other.count++
        categories.other.sizeBytes += sz
      }
    }

    // Format category sizes
    categories.images.sizeFormatted = this.storage.formatBytes(
      categories.images.sizeBytes
    )
    categories.videos.sizeFormatted = this.storage.formatBytes(
      categories.videos.sizeBytes
    )
    categories.documents.sizeFormatted = this.storage.formatBytes(
      categories.documents.sizeBytes
    )
    categories.audio.sizeFormatted = this.storage.formatBytes(
      categories.audio.sizeBytes
    )
    categories.archives.sizeFormatted = this.storage.formatBytes(
      categories.archives.sizeBytes
    )
    categories.other.sizeFormatted = this.storage.formatBytes(
      categories.other.sizeBytes
    )

    // Sources breakdown
    const sources: Record<string, number> = {}
    for (const s of sourceGroups) {
      sources[s.source] = s._count.id
    }

    return {
      totalFiles,
      totalSizeBytes,
      totalSizeFormatted: this.storage.formatBytes(totalSizeBytes),
      folders,
      categories,
      sources,
    }
  }

  /**
   * 12. GENERATE DOWNLOAD OR STREAMING URL FOR ASSET:
   */
  public async getDownloadUrl(id: string, expiresInSeconds: number = 900) {
    const file = await this.db.mediaFile.findUnique({
      where: { id },
    })

    if (!file) {
      throw new NotFoundError("Media file not found.")
    }

    if (file.isPublic && file.url) {
      return { downloadUrl: file.url, isPublic: true, expiresInSeconds: 0 }
    }

    const { downloadUrl } = await this.storage.createPresignedDownloadUrl({
      key: file.key,
      expiresInSeconds,
      downloadFileName: file.fileName,
    })

    return { downloadUrl, isPublic: false, expiresInSeconds }
  }

  /**
   * 13. LINK MEDIA TO ENTITY (Helper for blogs, users, projects):
   */
  public async linkMediaToEntity(
    mediaKeyOrUrl: string,
    entityType: string,
    entityId: string
  ): Promise<void> {
    const key = this.storage.extractKeyFromUrl(mediaKeyOrUrl)
    if (!key) return

    await this.db.mediaFile.updateMany({
      where: { key },
      data: {
        entityType,
        entityId,
      },
    })
  }

  /**
   * 14. ORPHAN & TRASH MEDIA CLEANUP ENGINE:
   * Scans and permanently purges orphaned, abandoned, and unreferenced files from Cloudflare R2 / S3 storage
   * and the PostgreSQL database.
   */
  public async cleanOrphanedMedia(
    options: {
      olderThanDays?: number
      type?: "all" | "avatars" | "blog" | "temp"
      dryRun?: boolean
    } = {}
  ) {
    const { olderThanDays = 0, type = "all", dryRun = false } = options
    const thresholdDate = new Date(
      Date.now() - olderThanDays * 24 * 60 * 60 * 1000
    )

    this.logger.info("Starting orphaned media cleanup job", {
      olderThanDays,
      type,
      dryRun,
      thresholdDate: thresholdDate.toISOString(),
    })

    const orphanedKeys: string[] = []
    const orphanedMediaIds: string[] = []
    let freedBytes = BigInt(0)

    // 1. AVATARS CLEANUP:
    // Find all media marked as USER_AVATAR or in avatars/ folder that do not match any current active User.avatar
    if (type === "all" || type === "avatars") {
      const activeUsers = await this.db.user.findMany({
        where: { avatar: { not: null } },
        select: { id: true, avatar: true },
      })
      const activeAvatarKeys = new Set(
        activeUsers
          .map((u) => this.storage.extractKeyFromUrl(u.avatar))
          .filter(Boolean) as string[]
      )

      const avatarMedia = await this.db.mediaFile.findMany({
        where: {
          OR: [{ folder: "avatars" }, { source: "USER_AVATAR" }],
          createdAt: { lte: thresholdDate },
        },
      })

      for (const m of avatarMedia) {
        if (!activeAvatarKeys.has(m.key)) {
          orphanedKeys.push(m.key)
          orphanedMediaIds.push(m.id)
          freedBytes += m.size
        }
      }
    }

    // 2. TEMPORARY & UNCONFIRMED PRESIGNED UPLOADS CLEANUP:
    if (type === "all" || type === "temp") {
      const tempMedia = await this.db.mediaFile.findMany({
        where: {
          source: "PRESIGNED",
          entityId: null,
          createdAt: { lte: thresholdDate },
        },
      })

      for (const m of tempMedia) {
        orphanedKeys.push(m.key)
        orphanedMediaIds.push(m.id)
        freedBytes += m.size
      }
    }

    // 3. BLOG POST COVER / UNREFERENCED BLOG MEDIA CLEANUP:
    if (type === "all" || type === "blog") {
      const blogPosts = await this.db.blogPost.findMany({
        select: { id: true, thumbnail: true, content: true },
      })
      const activeThumbnails = new Set(
        blogPosts
          .map((p) => this.storage.extractKeyFromUrl(p.thumbnail))
          .filter(Boolean) as string[]
      )
      const postIds = new Set(blogPosts.map((p) => p.id))

      const blogMedia = await this.db.mediaFile.findMany({
        where: {
          OR: [
            { folder: "blog" },
            { source: "BLOG_COVER" },
            { entityType: "BlogPost" },
          ],
          createdAt: { lte: thresholdDate },
        },
      })

      for (const m of blogMedia) {
        const isThumbnail = activeThumbnails.has(m.key)
        const hasValidPost = m.entityId ? postIds.has(m.entityId) : false
        if (!isThumbnail && !hasValidPost) {
          orphanedKeys.push(m.key)
          orphanedMediaIds.push(m.id)
          freedBytes += m.size
        }
      }
    }

    // Remove duplicates
    const uniqueKeys = Array.from(new Set(orphanedKeys))
    const uniqueIds = Array.from(new Set(orphanedMediaIds))

    this.logger.info(
      `Orphan scan completed: found ${uniqueKeys.length} orphaned file(s) totaling ${this.storage.formatBytes(freedBytes)}`,
      { count: uniqueKeys.length, dryRun }
    )

    if (!dryRun && uniqueKeys.length > 0) {
      // Chunk deletions in batches of 500
      const batchSize = 500
      for (let i = 0; i < uniqueKeys.length; i += batchSize) {
        const chunk = uniqueKeys.slice(i, i + batchSize)
        try {
          await this.storage.deleteObjects(chunk)
        } catch (err: any) {
          this.logger.warn(
            `Failed to delete batch from S3/R2 storage: ${err.message}`
          )
        }
      }

      // Purge from DB
      await this.db.mediaFile.deleteMany({
        where: { id: { in: uniqueIds } },
      })

      this.logger.info(
        `✔ Successfully purged ${uniqueKeys.length} orphaned files from storage and database.`
      )
    }

    return {
      success: true,
      dryRun,
      count: uniqueKeys.length,
      keys: uniqueKeys,
      freedBytes: Number(freedBytes),
      freedFormatted: this.storage.formatBytes(freedBytes),
      message: dryRun
        ? `Dry run: ${uniqueKeys.length} orphaned file(s) (${this.storage.formatBytes(freedBytes)}) identified for cleanup.`
        : `Successfully deleted ${uniqueKeys.length} orphaned file(s) and reclaimed ${this.storage.formatBytes(freedBytes)} of storage space.`,
    }
  }
}
