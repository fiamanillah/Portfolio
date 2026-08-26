import fs from "fs"
import path from "path"
import { Request, Response } from "express"
import { BaseController } from "@/core/BaseController"
import { MediaService } from "./media.service"
import { HTTPStatusCode } from "@/types/HTTPStatusCode"
import { BadRequestError } from "@/core/errors/AppError"
import { UploadMediaBody, uploadMediaBodySchema } from "./MediaDTO"
import {
  PresignedUploadRequestDTO,
  ConfirmPresignedUploadDTO,
  UpdateMediaFileDTO,
  ListMediaQueryDTO,
  BulkDeleteMediaDTO,
  BulkUpdateMediaDTO,
} from "@workspace/shared"

export class MediaController extends BaseController {
  constructor(private readonly mediaService: MediaService) {
    super()
  }

  /**
   * POST /media/v1/upload
   * Handles multipart/form-data single or multiple file uploads
   */
  public async upload(req: Request, res: Response): Promise<void> {
    const parsed = uploadMediaBodySchema.safeParse(req.body || {})
    const options: UploadMediaBody = parsed.success
      ? parsed.data
      : (req.body || {})
    const uploaderId = req.user?.id

    if (req.file) {
      // Single file upload
      const result = await this.mediaService.uploadSingle(
        req.file,
        options,
        uploaderId
      )
      this.sendResponse(
        req,
        res,
        "File uploaded successfully",
        HTTPStatusCode.CREATED,
        result
      )
      return
    }

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      // Multiple files upload
      const results = await this.mediaService.uploadMultiple(
        req.files as Express.Multer.File[],
        options,
        uploaderId
      )
      this.sendResponse(
        req,
        res,
        `${results.length} files uploaded successfully`,
        HTTPStatusCode.CREATED,
        results
      )
      return
    }

    throw new BadRequestError(
      "No file provided in form-data. Use 'file' or 'files' field."
    )
  }

  /**
   * POST /media/v1/presigned-url
   * Generates a pre-signed PUT upload URL for direct client-to-R2 upload
   */
  public async createPresignedUrl(req: Request, res: Response): Promise<void> {
    const dto = (req.validatedBody || req.body) as PresignedUploadRequestDTO
    const uploaderId = req.user?.id

    const result = await this.mediaService.createPresignedUpload(
      dto,
      uploaderId
    )
    this.sendResponse(
      req,
      res,
      "Presigned upload URL generated successfully",
      HTTPStatusCode.CREATED,
      result
    )
  }

  /**
   * POST /media/v1/confirm-presigned
   * Verifies and indexes direct presigned upload in DB
   */
  public async confirmPresigned(req: Request, res: Response): Promise<void> {
    const dto = (req.validatedBody || req.body) as ConfirmPresignedUploadDTO
    const uploaderId = req.user?.id

    const result = await this.mediaService.confirmPresignedUpload(
      dto,
      uploaderId
    )
    this.sendResponse(
      req,
      res,
      "Upload verified and registered successfully",
      HTTPStatusCode.OK,
      result
    )
  }

  /**
   * GET /media/v1/files
   * Search and filter media library with pagination
   */
  public async list(req: Request, res: Response): Promise<void> {
    const query = (req.validatedQuery || req.query) as ListMediaQueryDTO
    const result = await this.mediaService.listMedia(query)

    this.sendPaginatedResponse(
      req,
      res,
      result.pagination,
      "Media files retrieved successfully",
      result.data
    )
  }

  /**
   * GET /media/v1/files/:id
   * Get single media file by ID
   */
  public async getById(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string
    const file = await this.mediaService.getMediaById(id)

    this.sendResponse(
      req,
      res,
      "Media file retrieved successfully",
      HTTPStatusCode.OK,
      file
    )
  }

  /**
   * GET /media/v1/key/*key or GET /media/v1/by-key?key=...
   * Get single media file by S3 Key
   */
  public async getByKey(req: Request, res: Response): Promise<void> {
    const params = req.params as Record<string, string | string[] | undefined>
    const rawKey = params.key ?? params[0] ?? (req.query.key as string | undefined)
    const key = Array.isArray(rawKey) ? rawKey.join("/") : String(rawKey || "")

    if (!key) {
      throw new BadRequestError(
        "Object key is required in request path or query"
      )
    }

    const file = await this.mediaService.getMediaByKey(key)
    this.sendResponse(
      req,
      res,
      "Media file retrieved successfully",
      HTTPStatusCode.OK,
      file
    )
  }

  /**
   * PATCH /media/v1/files/:id
   * Update media metadata, tags, alt text, caption, or folder
   */
  public async update(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string
    const dto = (req.validatedBody || req.body) as UpdateMediaFileDTO
    const currentUserId = req.user?.id
    const userRole = req.user?.role

    const updated = await this.mediaService.updateMedia(
      id,
      dto,
      currentUserId,
      userRole
    )
    this.sendResponse(
      req,
      res,
      "Media file updated successfully",
      HTTPStatusCode.OK,
      updated
    )
  }

  /**
   * DELETE /media/v1/files/:id
   * Delete media file from Cloudflare R2 / S3 and Database
   */
  public async delete(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string
    const currentUserId = req.user?.id
    const userRole = req.user?.role

    const result = await this.mediaService.deleteMedia(
      id,
      currentUserId,
      userRole
    )
    this.sendResponse(req, res, result.message, HTTPStatusCode.OK)
  }

  /**
   * POST /media/v1/files/bulk-delete
   * Bulk delete media files from R2 and Database
   */
  public async bulkDelete(req: Request, res: Response): Promise<void> {
    const dto = (req.validatedBody || req.body) as BulkDeleteMediaDTO
    const currentUserId = req.user?.id
    const userRole = req.user?.role

    const result = await this.mediaService.bulkDeleteMedia(
      dto,
      currentUserId,
      userRole
    )
    this.sendResponse(
      req,
      res,
      `Successfully deleted ${result.count} media assets`,
      HTTPStatusCode.OK,
      result
    )
  }

  /**
   * POST /media/v1/files/bulk-update
   * Bulk update folder, tags, or visibility for media assets
   */
  public async bulkUpdate(req: Request, res: Response): Promise<void> {
    const dto = (req.validatedBody || req.body) as BulkUpdateMediaDTO
    const currentUserId = req.user?.id
    const userRole = req.user?.role

    const result = await this.mediaService.bulkUpdateMedia(
      dto,
      currentUserId,
      userRole
    )
    this.sendResponse(
      req,
      res,
      `Successfully updated ${result.count} media assets`,
      HTTPStatusCode.OK,
      result
    )
  }

  /**
   * GET /media/v1/stats
   * Aggregated storage KPI analytics
   */
  public async getStats(req: Request, res: Response): Promise<void> {
    const stats = await this.mediaService.getMediaStats()
    this.sendResponse(
      req,
      res,
      "Storage stats retrieved successfully",
      HTTPStatusCode.OK,
      stats
    )
  }

  /**
   * GET /media/v1/download/:id
   * Get secure download URL or redirect to file
   */
  public async getDownload(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string
    const expiresIn = parseInt(req.query.expiresIn as string) || 900

    const result = await this.mediaService.getDownloadUrl(id, expiresIn)

    if (req.query.redirect === "true") {
      res.redirect(result.downloadUrl)
      return
    }

    this.sendResponse(
      req,
      res,
      "Download URL generated successfully",
      HTTPStatusCode.OK,
      result
    )
  }

  /**
   * GET /media/v1/stream/*key
   * Stream object directly (Cloudflare R2 or local storage fallback)
   */
  public async streamByKey(req: Request, res: Response): Promise<void> {
    const params = req.params as Record<string, string | string[] | undefined>
    const rawKey = params.key ?? params[0] ?? (req.query.key as string | undefined)
    const key = Array.isArray(rawKey) ? rawKey.join("/") : String(rawKey || "")

    if (!key) {
      throw new BadRequestError("Object key is required")
    }

    const uploadsRoot = path.resolve(process.cwd(), "uploads")
    const safeKey = path
      .normalize(key)
      .replace(/^(\.\.[\/\\])+/, "")
      .replace(/^[\/\\]+/, "")

    const localPath = path.resolve(uploadsRoot, safeKey)
    if (localPath.startsWith(uploadsRoot) && fs.existsSync(localPath)) {
      const ext = path.extname(safeKey).toLowerCase()
      const mimeTypes: Record<string, string> = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
        ".pdf": "application/pdf",
        ".txt": "text/plain",
      }
      res.setHeader(
        "Content-Type",
        mimeTypes[ext] || "application/octet-stream"
      )
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable")
      fs.createReadStream(localPath).pipe(res)
      return
    }

    try {
      const storageService = this.mediaService.getStorageService()
      const { stream, contentType, contentLength, etag } =
        await storageService.getObjectStream(key)

      res.setHeader("Content-Type", contentType)
      if (contentLength) res.setHeader("Content-Length", contentLength)
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable")
      if (etag) res.setHeader("ETag", etag)

      const streamObj = stream as unknown as {
        pipe?: (destination: Response) => void
        transformToByteArray?: () => Promise<Uint8Array>
        [Symbol.asyncIterator]?: () => AsyncIterator<Uint8Array | Buffer>
      }

      if (typeof streamObj.pipe === "function") {
        streamObj.pipe(res)
      } else if (typeof streamObj.transformToByteArray === "function") {
        const bytes = await streamObj.transformToByteArray()
        res.end(Buffer.from(bytes))
      } else if (streamObj[Symbol.asyncIterator]) {
        const chunks: Buffer[] = []
        for await (const chunk of streamObj as AsyncIterable<Uint8Array>) {
          chunks.push(Buffer.from(chunk))
        }
        res.end(Buffer.concat(chunks))
      } else {
        throw new Error("Unable to stream object: incompatible stream body")
      }
    } catch {
      res.status(404).json({ success: false, message: "Media asset not found" })
    }
  }

  /**
   * POST /media/v1/cleanup
   * Triggers orphan and unreferenced media cleanup in Cloudflare R2 and PostgreSQL DB
   */
  public async cleanupOrphans(req: Request, res: Response): Promise<void> {
    const options = req.body || {}
    const result = await this.mediaService.cleanOrphanedMedia(options)
    this.sendResponse(req, res, result.message, HTTPStatusCode.OK, result)
  }
}
