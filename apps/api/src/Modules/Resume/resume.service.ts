// apps/api/src/Modules/Resume/resume.service.ts
import path from "path"
import { prisma, Resume } from "@workspace/db"
import { AppLogger } from "@workspace/logger"
import {
  BadRequestError,
  NotFoundError,
} from "@/core/errors/AppError"
import {
  ResumeDTO,
  ResumeStatsDTO,
  CreateResumeDTO,
  UpdateResumeDTO,
  ResumeQueryDTO,
} from "./ResumeDTO"
import { StorageService } from "@/services/StorageService"

export class ResumeService {
  private logger = new AppLogger("ResumeService")

  constructor(
    private readonly db: typeof prisma = prisma,
    private readonly storage: StorageService = new StorageService()
  ) {}

  /**
   * Helper: formats database entity into shared DTO
   */
  public sanitizeResume(resume: Resume): ResumeDTO {
    return {
      id: resume.id,
      title: resume.title,
      version: resume.version,
      fileName: resume.fileName,
      fileUrl: resume.fileUrl,
      fileKey: resume.fileKey,
      fileSize: Number(resume.fileSize),
      mimeType: resume.mimeType,
      isActive: resume.isActive,
      description: resume.description,
      downloadCount: resume.downloadCount,
      createdAt: resume.createdAt.toISOString(),
      updatedAt: resume.updatedAt.toISOString(),
    }
  }

  /**
   * 1. GET ACTIVE RESUME (Public)
   * Returns the currently active resume version (or the latest version if none explicitly active).
   */
  public async getActiveResume(): Promise<ResumeDTO | null> {
    const active = await this.db.resume.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: "desc" },
    })

    if (active) {
      return this.sanitizeResume(active)
    }

    // Fallback: return the most recently uploaded version
    const latest = await this.db.resume.findFirst({
      orderBy: { createdAt: "desc" },
    })

    return latest ? this.sanitizeResume(latest) : null
  }

  /**
   * 2. LIST ALL RESUME VERSIONS (Admin)
   */
  public async listResumes(query: ResumeQueryDTO): Promise<{
    data: ResumeDTO[]
    pagination: {
      total: number
      page: number
      limit: number
      totalPages: number
      hasNext: boolean
      hasPrevious: boolean
    }
    stats: ResumeStatsDTO
  }> {
    const page = query.page || 1
    const limit = query.limit || 20
    const skip = (page - 1) * limit

    const where: any = {}

    if (query.search && query.search.trim()) {
      const s = query.search.trim()
      where.OR = [
        { title: { contains: s, mode: "insensitive" } },
        { version: { contains: s, mode: "insensitive" } },
        { fileName: { contains: s, mode: "insensitive" } },
        { description: { contains: s, mode: "insensitive" } },
      ]
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive
    }

    const allowedSort = ["createdAt", "updatedAt", "version", "downloadCount", "title"]
    const sortField = allowedSort.includes(query.sortBy || "")
      ? (query.sortBy as string)
      : "createdAt"
    const sortDirection = query.sortOrder === "asc" ? "asc" : "desc"

    const [total, resumes, allResumes] = await Promise.all([
      this.db.resume.count({ where }),
      this.db.resume.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortField]: sortDirection },
      }),
      this.db.resume.findMany({
        select: {
          id: true,
          version: true,
          isActive: true,
          downloadCount: true,
          updatedAt: true,
        },
      }),
    ])

    const totalPages = Math.ceil(total / limit) || 1
    const activeVersion = allResumes.find((r) => r.isActive)
    const totalDownloads = allResumes.reduce((acc, curr) => acc + (curr.downloadCount || 0), 0)
    const latestUpdate = allResumes.length > 0
      ? new Date(Math.max(...allResumes.map((r) => new Date(r.updatedAt).getTime()))).toISOString()
      : null

    return {
      data: resumes.map((r) => this.sanitizeResume(r)),
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
      stats: {
        totalVersions: allResumes.length,
        activeVersion: activeVersion ? activeVersion.version : null,
        activeResumeId: activeVersion ? activeVersion.id : null,
        totalDownloads,
        latestUpdatedAt: latestUpdate,
      },
    }
  }

  /**
   * 3. GET SINGLE RESUME BY ID
   */
  public async getResumeById(id: string): Promise<ResumeDTO> {
    const resume = await this.db.resume.findUnique({
      where: { id },
    })

    if (!resume) {
      throw new NotFoundError("Resume version not found.")
    }

    return this.sanitizeResume(resume)
  }

  /**
   * 4. UPLOAD & CREATE NEW RESUME VERSION (Admin)
   */
  public async uploadResumeVersion(
    file: Express.Multer.File,
    input: CreateResumeDTO,
    userId?: string
  ): Promise<ResumeDTO> {
    if (!file || !file.buffer) {
      throw new BadRequestError("Please select a valid resume document (.pdf, .doc, .docx).")
    }

    const ext = path.extname(file.originalname).toLowerCase()
    const allowedExts = [".pdf", ".doc", ".docx"]

    if (!allowedExts.includes(ext) && !file.mimetype.includes("pdf") && !file.mimetype.includes("word") && !file.mimetype.includes("document")) {
      throw new BadRequestError("Resume must be a PDF or Word document (.pdf, .doc, .docx).")
    }

    this.logger.info("Uploading new resume version to S3/R2", {
      version: input.version,
      fileName: file.originalname,
      size: file.size,
    })

    // Determine if this version should be active
    const totalCount = await this.db.resume.count()
    const shouldBeActive = input.isActive || totalCount === 0

    if (shouldBeActive) {
      await this.db.resume.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      })
    }

    // Upload to S3 / Cloudflare R2 under resumes/ folder
    const uploadResult = await this.storage.uploadBuffer({
      buffer: file.buffer,
      fileName: file.originalname || `resume-${input.version}.pdf`,
      mimeType: file.mimetype || "application/pdf",
      folder: "resumes",
      tags: ["resume", "cv", input.version],
      metadata: {
        source: "RESUME_VERSION",
        version: input.version,
        title: input.title,
        uploaderId: userId || "",
      },
      isPublic: true,
      contentDisposition: `inline; filename="${file.originalname || "resume.pdf"}"`,
    })

    // Track in MediaFile table
    await this.db.mediaFile.create({
      data: {
        key: uploadResult.key,
        bucket: uploadResult.bucket,
        fileName: file.originalname || "resume.pdf",
        fileExtension: uploadResult.key.split(".").pop() || ext.replace(".", "") || "pdf",
        mimeType: uploadResult.mimeType || "application/pdf",
        size: BigInt(uploadResult.size),
        url: uploadResult.url,
        etag: uploadResult.etag,
        source: "RESUME_VERSION",
        folder: "resumes",
        tags: ["resume", "cv", input.version],
        isPublic: true,
        uploaderId: userId || null,
      },
    })

    // Create Resume record
    const created = await this.db.resume.create({
      data: {
        title: input.title,
        version: input.version,
        fileName: file.originalname || "resume.pdf",
        fileUrl: uploadResult.url,
        fileKey: uploadResult.key,
        fileSize: BigInt(uploadResult.size),
        mimeType: uploadResult.mimeType || "application/pdf",
        isActive: shouldBeActive,
        description: input.description || null,
        downloadCount: 0,
      },
    })

    this.logger.info("✔ New resume version created successfully", {
      id: created.id,
      version: created.version,
      isActive: created.isActive,
    })

    return this.sanitizeResume(created)
  }

  /**
   * 5. UPDATE RESUME VERSION METADATA (Admin)
   */
  public async updateResumeVersion(
    id: string,
    input: UpdateResumeDTO
  ): Promise<ResumeDTO> {
    const existing = await this.db.resume.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new NotFoundError("Resume version not found.")
    }

    if (input.isActive === true) {
      await this.db.resume.updateMany({
        where: { id: { not: id }, isActive: true },
        data: { isActive: false },
      })
    }

    const updated = await this.db.resume.update({
      where: { id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.version !== undefined ? { version: input.version } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      },
    })

    this.logger.info("✔ Resume version updated successfully", { id, version: updated.version })
    return this.sanitizeResume(updated)
  }

  /**
   * 6. SET ACTIVE RESUME VERSION (Admin)
   */
  public async setActiveResume(id: string): Promise<ResumeDTO> {
    const existing = await this.db.resume.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new NotFoundError("Resume version not found.")
    }

    await this.db.resume.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    })

    const updated = await this.db.resume.update({
      where: { id },
      data: { isActive: true },
    })

    this.logger.info("✔ Active resume version updated", { id, version: updated.version })
    return this.sanitizeResume(updated)
  }

  /**
   * 7. DELETE RESUME VERSION (Admin)
   */
  public async deleteResumeVersion(id: string): Promise<{ success: boolean; message: string }> {
    const existing = await this.db.resume.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new NotFoundError("Resume version not found.")
    }

    // 1. Delete from S3 / R2 storage
    if (existing.fileKey) {
      try {
        await this.storage.deleteObject(existing.fileKey)
      } catch (err: any) {
        this.logger.warn(`Failed to delete resume object from storage: ${err.message}`)
      }
      await this.db.mediaFile.deleteMany({
        where: { key: existing.fileKey },
      })
    }

    // 2. Delete database record
    await this.db.resume.delete({
      where: { id },
    })

    // 3. If deleted version was active, make the latest version active
    if (existing.isActive) {
      const nextLatest = await this.db.resume.findFirst({
        orderBy: { createdAt: "desc" },
      })
      if (nextLatest) {
        await this.db.resume.update({
          where: { id: nextLatest.id },
          data: { isActive: true },
        })
      }
    }

    this.logger.info("✔ Resume version deleted successfully", { id, version: existing.version })
    return {
      success: true,
      message: `Resume version ${existing.version} deleted successfully.`,
    }
  }

  /**
   * 8. TRACK DOWNLOAD & GET REDIRECT URL (Public)
   */
  public async trackDownload(id?: string): Promise<{ fileUrl: string; fileName: string }> {
    let resume: Resume | null = null

    if (id) {
      resume = await this.db.resume.findUnique({
        where: { id },
      })
    } else {
      resume = await this.db.resume.findFirst({
        where: { isActive: true },
        orderBy: { updatedAt: "desc" },
      })
      if (!resume) {
        resume = await this.db.resume.findFirst({
          orderBy: { createdAt: "desc" },
        })
      }
    }

    if (!resume) {
      throw new NotFoundError("No active resume document available for download.")
    }

    // Increment download count asynchronously
    await this.db.resume.update({
      where: { id: resume.id },
      data: { downloadCount: { increment: 1 } },
    })

    return {
      fileUrl: resume.fileUrl,
      fileName: resume.fileName,
    }
  }
}
