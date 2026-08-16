import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadObjectCommand,
  CreateBucketCommand,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { config } from "@/core/config"
import { AppLogger } from "@workspace/logger"
import {
  AppError,
  BadRequestError,
  NotFoundError,
  PayloadTooLargeError,
} from "@/core/errors/AppError"
import crypto from "crypto"
import path from "path"
import fs from "fs"
import { Readable } from "stream"

export interface UploadBufferOptions {
  buffer: Buffer
  fileName: string
  mimeType: string
  folder?: string
  key?: string
  tags?: string[] | Record<string, string>
  metadata?: Record<string, string>
  isPublic?: boolean
  cacheControl?: string
  contentDisposition?: string
}

export interface UploadResult {
  key: string
  bucket: string
  url: string
  etag: string | null
  size: number
  mimeType: string
  fileName: string
}

export interface PresignedUploadOptions {
  fileName: string
  mimeType: string
  size?: number
  folder?: string
  key?: string
  expiresInSeconds?: number
  metadata?: Record<string, string>
  tags?: string[] | Record<string, string>
  isPublic?: boolean
}

export interface PresignedUploadResult {
  uploadUrl: string
  key: string
  publicUrl: string
  bucket: string
  expiresInSeconds: number
  headers: Record<string, string>
}

export interface PresignedDownloadOptions {
  key: string
  expiresInSeconds?: number
  downloadFileName?: string
}

export class StorageService {
  private s3: S3Client
  private bucket: string
  private publicDomain: string
  private maxFileSize: number
  private logger = new AppLogger("StorageService")

  constructor(
    s3Client?: S3Client,
    bucketName?: string,
    publicDomainUrl?: string
  ) {
    this.bucket = bucketName || config.storage.bucket
    this.publicDomain = (
      publicDomainUrl ||
      config.storage.publicDomain ||
      ""
    ).replace(/\/$/, "")
    this.maxFileSize = config.storage.maxFileSize || 52428800 // 50 MB

    if (s3Client) {
      this.s3 = s3Client
    } else {
      this.s3 = new S3Client({
        region: config.storage.region || "auto",
        endpoint: config.storage.endpoint,
        credentials:
          config.storage.accessKeyId && config.storage.secretAccessKey
            ? {
                accessKeyId: config.storage.accessKeyId,
                secretAccessKey: config.storage.secretAccessKey,
              }
            : undefined,
        forcePathStyle:
          config.storage.endpoint?.includes("localhost") ||
          config.storage.endpoint?.includes("127.0.0.1"),
      })
    }
  }

  public getClient(): S3Client {
    return this.s3
  }

  public getBucket(): string {
    return this.bucket
  }

  /**
   * Generates a clean, collision-free, URL-friendly S3 / R2 object key.
   * Format: `${folder}/${year}/${month}/${slugifiedName}-${randomHex8}.${ext}`
   */
  public generateObjectKey(
    folder: string = "general",
    fileName: string
  ): string {
    const cleanFolder = (folder || "general")
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "")
    const ext = path.extname(fileName).toLowerCase() || ""
    const baseName = path.basename(fileName, ext)
    const sanitizedBase = this.sanitizeFileName(baseName).slice(0, 50) || "file"

    const date = new Date()
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, "0")
    const randomSuffix = crypto.randomBytes(4).toString("hex")

    return `${cleanFolder}/${year}/${month}/${sanitizedBase}-${randomSuffix}${ext}`
  }

  /**
   * Sanitizes filename into URL-safe characters.
   */
  public sanitizeFileName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
  }

  /**
   * Formats full public CDN URL for a key.
   */
  public formatPublicUrl(key: string): string {
    const cleanKey = key.replace(/^\/+/, "")
    if (this.publicDomain) {
      return `${this.publicDomain}/${cleanKey}`
    }
    if (config.storage.endpoint) {
      return `${config.storage.endpoint.replace(/\/$/, "")}/${this.bucket}/${cleanKey}`
    }
    return `https://${this.bucket}.r2.cloudflarestorage.com/${cleanKey}`
  }

  /**
   * Extracts the S3 / R2 storage key from a full public CDN URL or stream path.
   */
  public extractKeyFromUrl(urlOrKey?: string | null): string | null {
    if (!urlOrKey || typeof urlOrKey !== "string") return null
    const clean = urlOrKey.trim()
    if (!clean) return null

    // If already a relative storage key
    if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
      return clean.replace(/^\/+/, "")
    }

    try {
      const parsed = new URL(clean)
      let pathname = parsed.pathname.replace(/^\/+/, "")

      // Handle stream proxy prefix /media/v1/stream/
      if (pathname.startsWith("media/v1/stream/")) {
        pathname = pathname.replace(/^media\/v1\/stream\//, "")
      }

      // Handle bucket prefix
      if (this.bucket && pathname.startsWith(`${this.bucket}/`)) {
        pathname = pathname.slice(this.bucket.length + 1)
      }

      return pathname || null
    } catch {
      return null
    }
  }

  /**
   * Formats raw bytes into human-readable string (KB, MB, GB).
   */
  public formatBytes(bytes: number | bigint): string {
    const num = typeof bytes === "bigint" ? Number(bytes) : bytes
    if (num === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(num) / Math.log(k))
    return `${parseFloat((num / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  /**
   * Validates MIME type against allowed list if configured.
   */
  public validateMimeType(mimeType: string): void {
    if (
      config.storage.allowedMimeTypes &&
      config.storage.allowedMimeTypes.length > 0
    ) {
      const isAllowed = config.storage.allowedMimeTypes.some((allowed) => {
        if (allowed.endsWith("/*")) {
          return mimeType.startsWith(allowed.replace("/*", ""))
        }
        return mimeType.toLowerCase() === allowed.toLowerCase()
      })

      if (!isAllowed) {
        throw new BadRequestError(
          `Unsupported file MIME type "${mimeType}". Allowed types: ${config.storage.allowedMimeTypes.join(", ")}`
        )
      }
    }
  }

  /**
   * Formats tags for S3 / Cloudflare R2 object metadata.
   */
  private formatTagsMetadata(
    tags?: string[] | Record<string, string>
  ): string | undefined {
    if (!tags) return undefined
    if (Array.isArray(tags)) {
      if (tags.length === 0) return undefined
      return tags.join(",")
    }
    const entries = Object.entries(tags)
    if (entries.length === 0) return undefined
    return entries.map(([k, v]) => `${k}=${v}`).join(";")
  }

  /**
   * 1. UPLOAD BUFFER DIRECTLY:
   * Uploads a Buffer to Cloudflare R2 / S3 with metadata, content-type and cache control.
   */
  public async uploadBuffer(
    options: UploadBufferOptions
  ): Promise<UploadResult> {
    const {
      buffer,
      fileName,
      mimeType,
      folder = "general",
      metadata = {},
      tags,
      isPublic = true,
      cacheControl = "public, max-age=31536000, immutable",
      contentDisposition,
    } = options

    if (buffer.length > this.maxFileSize) {
      throw new PayloadTooLargeError(
        `File size (${this.formatBytes(buffer.length)}) exceeds the maximum allowed limit of ${this.formatBytes(this.maxFileSize)}.`
      )
    }

    this.validateMimeType(mimeType)

    const key = options.key || this.generateObjectKey(folder, fileName)

    this.logger.debug(`Uploading file buffer to S3/R2 [${key}]`, {
      size: buffer.length,
      mimeType,
      bucket: this.bucket,
    })

    const tagsMetadata = tags
      ? Array.isArray(tags)
        ? tags.join(",")
        : Object.entries(tags)
            .map(([k, v]) => `${k}=${v}`)
            .join(";")
      : undefined

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      CacheControl: isPublic ? cacheControl : "private, no-cache",
      ContentDisposition:
        contentDisposition || `inline; filename="${path.basename(fileName)}"`,
      Metadata: {
        "original-name": encodeURIComponent(fileName),
        "uploaded-at": new Date().toISOString(),
        ...(tagsMetadata ? { tags: encodeURIComponent(tagsMetadata) } : {}),
        ...metadata,
      },
    })

    let response: any
    try {
      response = await this.s3.send(command)
    } catch (err: any) {
      if (
        err.name === "NoSuchBucket" ||
        err.name === "NotFound" ||
        err.$metadata?.httpStatusCode === 404
      ) {
        this.logger.warn(
          `⚠️ Bucket "${this.bucket}" does not exist in R2/S3. Attempting to create bucket automatically...`
        )
        try {
          await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }))
          this.logger.info(
            `✔ Auto-created R2/S3 bucket "${this.bucket}". Retrying upload...`
          )
          response = await this.s3.send(command)
        } catch (createErr: any) {
          this.logger.warn(
            `⚠️ Could not auto-create R2 bucket "${this.bucket}" (${createErr.message || createErr.name}).`
          )

          // If in development mode and bucket creation failed due to token scope,
          // save to local filesystem fallback so the user/developer is never blocked
          if (!config.server.isProduction) {
            const localDir = path.resolve(
              process.cwd(),
              "uploads",
              path.dirname(key)
            )
            fs.mkdirSync(localDir, { recursive: true })
            const localFilePath = path.resolve(process.cwd(), "uploads", key)
            fs.writeFileSync(localFilePath, buffer)

            this.logger.info(
              `📁 [Dev Fallback] Saved asset to local upload storage: ${localFilePath}`
            )

            const fallbackUrl = this.publicDomain
              ? `${this.publicDomain}/${key}`
              : `http://localhost:${config.server.port}/media/v1/stream/${key}`

            return {
              key,
              bucket: this.bucket,
              url: fallbackUrl,
              etag: crypto.createHash("md5").update(buffer).digest("hex"),
              size: buffer.length,
              mimeType,
              fileName,
            }
          }

          throw err
        }
      } else {
        throw err
      }
    }

    const result: UploadResult = {
      key,
      bucket: this.bucket,
      url: this.formatPublicUrl(key),
      etag: response?.ETag
        ? response.ETag.replace(/"/g, "")
        : crypto.createHash("md5").update(buffer).digest("hex"),
      size: buffer.length,
      mimeType,
      fileName,
    }

    this.logger.info(`✔ File uploaded successfully to R2/S3: ${key}`, {
      size: this.formatBytes(buffer.length),
      url: result.url,
    })

    return result
  }

  /**
   * 2. GENERATE PRESIGNED UPLOAD URL:
   * Generates a pre-signed PUT URL allowing frontends/clients to upload directly to R2/S3.
   */
  public async createPresignedUploadUrl(
    options: PresignedUploadOptions
  ): Promise<PresignedUploadResult> {
    const {
      fileName,
      mimeType,
      size,
      folder = "general",
      expiresInSeconds = config.storage.defaultPresignedExpiresIn || 900,
      metadata = {},
      tags,
      isPublic = true,
    } = options

    if (size && size > this.maxFileSize) {
      throw new PayloadTooLargeError(
        `File size (${this.formatBytes(size)}) exceeds maximum limit of ${this.formatBytes(this.maxFileSize)}.`
      )
    }

    this.validateMimeType(mimeType)

    const key = options.key || this.generateObjectKey(folder, fileName)

    const tagsMetadata = tags
      ? Array.isArray(tags)
        ? tags.join(",")
        : Object.entries(tags)
            .map(([k, v]) => `${k}=${v}`)
            .join(";")
      : undefined

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: mimeType,
      CacheControl: isPublic
        ? "public, max-age=31536000, immutable"
        : "private, no-cache",
      ContentDisposition: `inline; filename="${path.basename(fileName)}"`,
      Metadata: {
        "original-name": encodeURIComponent(fileName),
        "uploaded-at": new Date().toISOString(),
        ...(tagsMetadata ? { tags: encodeURIComponent(tagsMetadata) } : {}),
        ...metadata,
      },
    })

    const uploadUrl = await getSignedUrl(this.s3, command, {
      expiresIn: expiresInSeconds,
    })
    const publicUrl = this.formatPublicUrl(key)

    this.logger.info(`Generated presigned PUT upload URL for key: ${key}`, {
      expiresInSeconds,
      mimeType,
    })

    return {
      uploadUrl,
      key,
      publicUrl,
      bucket: this.bucket,
      expiresInSeconds,
      headers: {
        "Content-Type": mimeType,
      },
    }
  }

  /**
   * 3. GENERATE PRESIGNED DOWNLOAD URL:
   * Generates a temporary secure GET download URL for private or protected assets.
   */
  public async createPresignedDownloadUrl(
    options: PresignedDownloadOptions
  ): Promise<{ downloadUrl: string; expiresInSeconds: number }> {
    const { key, expiresInSeconds = 900, downloadFileName } = options

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ResponseContentDisposition: downloadFileName
        ? `attachment; filename="${encodeURIComponent(downloadFileName)}"`
        : undefined,
    })

    const downloadUrl = await getSignedUrl(this.s3, command, {
      expiresIn: expiresInSeconds,
    })

    return {
      downloadUrl,
      expiresInSeconds,
    }
  }

  /**
   * 4. CHECK OBJECT EXISTS:
   */
  public async objectExists(key: string): Promise<boolean> {
    try {
      await this.s3.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        })
      )
      return true
    } catch (err: any) {
      if (err.name === "NotFound" || err.$metadata?.httpStatusCode === 404) {
        return false
      }
      throw err
    }
  }

  /**
   * 5. GET OBJECT METADATA:
   */
  public async getObjectMetadata(key: string) {
    const res = await this.s3.send(
      new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    )

    return {
      key,
      size: res.ContentLength || 0,
      mimeType: res.ContentType || "application/octet-stream",
      etag: res.ETag ? res.ETag.replace(/"/g, "") : null,
      lastModified: res.LastModified,
      metadata: res.Metadata || {},
    }
  }

  /**
   * 6. GET OBJECT STREAM (FOR PROXY STREAMING / DOWNLOAD):
   */
  public async getObjectStream(key: string): Promise<{
    stream: Readable
    contentType: string
    contentLength: number
    etag?: string
    lastModified?: Date
  }> {
    const res = await this.s3.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    )

    if (!res.Body) {
      throw new NotFoundError(
        `Object stream for "${key}" is empty or not found`
      )
    }

    return {
      stream: res.Body as Readable,
      contentType: res.ContentType || "application/octet-stream",
      contentLength: res.ContentLength || 0,
      etag: res.ETag ? res.ETag.replace(/"/g, "") : undefined,
      lastModified: res.LastModified,
    }
  }

  /**
   * 7. DELETE SINGLE OBJECT:
   */
  public async deleteObject(key: string): Promise<void> {
    this.logger.debug(`Deleting object from R2/S3 [${key}]`)
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    )
    this.logger.info(`✔ Deleted object from R2/S3: ${key}`)
  }

  /**
   * 8. BULK DELETE OBJECTS:
   */
  public async deleteObjects(
    keys: string[]
  ): Promise<{ deleted: string[]; errors: string[] }> {
    if (!keys || keys.length === 0) return { deleted: [], errors: [] }

    this.logger.info(`Bulk deleting ${keys.length} objects from R2/S3`)

    const command = new DeleteObjectsCommand({
      Bucket: this.bucket,
      Delete: {
        Objects: keys.map((Key) => ({ Key })),
        Quiet: false,
      },
    })

    const response = await this.s3.send(command)

    const deleted = (response.Deleted || []).map((d) => d.Key!).filter(Boolean)
    const errors = (response.Errors || []).map((e) => `${e.Key}: ${e.Message}`)

    if (errors.length > 0) {
      this.logger.warn(`Some objects failed to delete from S3/R2`, { errors })
    }

    return { deleted, errors }
  }
}
