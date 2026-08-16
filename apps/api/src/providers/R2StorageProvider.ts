import {
  S3Client,
  HeadBucketCommand,
  CreateBucketCommand,
  S3ServiceException,
} from "@aws-sdk/client-s3"
import { InfrastructureProvider } from "@/core/InfrastructureProvider"
import { errorMapperRegistry } from "@/core/errors/ErrorMapperRegistry"
import {
  AppError,
  NotFoundError,
  AuthorizationError,
  PayloadTooLargeError,
  RateLimitError,
  ExternalServiceError,
} from "@/core/errors/AppError"
import { HTTPStatusCode } from "@/types/HTTPStatusCode"
import { config } from "@/core/config"
import { AppLogger } from "@workspace/logger"

export interface StorageProviderOptions {
  endpoint?: string
  region?: string
  accessKeyId?: string
  secretAccessKey?: string
  bucket?: string
  forcePathStyle?: boolean
}

export class R2StorageProvider implements InfrastructureProvider<S3Client> {
  public name = "Cloudflare R2 / S3 Storage"
  private client: S3Client
  private logger = new AppLogger("R2StorageProvider")
  private bucket: string

  constructor(options?: StorageProviderOptions) {
    const endpoint = options?.endpoint || config.storage.endpoint
    const region = options?.region || config.storage.region || "auto"
    const accessKeyId = options?.accessKeyId || config.storage.accessKeyId
    const secretAccessKey =
      options?.secretAccessKey || config.storage.secretAccessKey
    this.bucket = options?.bucket || config.storage.bucket

    this.client = new S3Client({
      region,
      endpoint,
      credentials:
        accessKeyId && secretAccessKey
          ? {
              accessKeyId,
              secretAccessKey,
            }
          : undefined,
      forcePathStyle:
        options?.forcePathStyle ??
        (endpoint?.includes("localhost") || endpoint?.includes("127.0.0.1")),
    })

    // Register storage error translation into domain AppErrors
    errorMapperRegistry.register(this.mapStorageError.bind(this))
  }

  public getClient(): S3Client {
    return this.client
  }

  public getBucketName(): string {
    return this.bucket
  }

  public async connect(): Promise<void> {
    // Verify credentials & bucket if credentials exist
    if (config.storage.accessKeyId && config.storage.secretAccessKey) {
      try {
        await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }))
        this.logger.info(
          `✔ Connected and verified R2/S3 Bucket: "${this.bucket}"`
        )
      } catch (err: any) {
        if (
          err.name === "NotFound" ||
          err.$metadata?.httpStatusCode === 404 ||
          err.name === "NoSuchBucket"
        ) {
          this.logger.warn(
            `⚠️ Cloudflare R2 bucket "${this.bucket}" does not exist yet. Attempting auto-creation...`
          )
          try {
            await this.client.send(
              new CreateBucketCommand({ Bucket: this.bucket })
            )
            this.logger.info(
              `✔ Successfully auto-created Cloudflare R2 bucket: "${this.bucket}"`
            )
          } catch (createErr: any) {
            this.logger.warn(
              `⚠️ Could not auto-create bucket "${this.bucket}" (${createErr.message || createErr.name}). ` +
                `Please create bucket "${this.bucket}" in your Cloudflare R2 Dashboard (or set R2_BUCKET_NAME in .env).`
            )
          }
        } else {
          this.logger.warn(
            `⚠️ R2/S3 bucket "${this.bucket}" check returned ${err.name || "error"}: ${err.message}`
          )
        }
      }
    } else {
      this.logger.info(
        "ℹ️ R2/S3 Storage initialized without active cloud credentials (dev/mock mode)"
      )
    }
  }

  public async disconnect(): Promise<void> {
    this.client.destroy()
    this.logger.info("⛁ R2/S3 Storage client destroyed")
  }

  /**
   * Translates S3 / Cloudflare R2 SDK errors into standard domain AppErrors
   */
  private mapStorageError(err: unknown): AppError | null {
    if (err instanceof S3ServiceException) {
      const errorName = err.name
      const statusCode =
        err.$metadata?.httpStatusCode || HTTPStatusCode.BAD_GATEWAY

      switch (errorName) {
        case "NoSuchKey":
        case "NotFound":
          return new NotFoundError(
            "Requested object was not found in storage",
            {
              code: "OBJECT_NOT_FOUND",
              key: (err as any).Key,
            }
          )

        case "NoSuchBucket":
          return new AppError({
            statusCode: HTTPStatusCode.BAD_REQUEST,
            message: `Storage bucket "${this.bucket}" does not exist in Cloudflare R2. Please create the bucket "${this.bucket}" in your Cloudflare R2 Dashboard or update R2_BUCKET_NAME in your environment configuration.`,
            code: "BUCKET_NOT_FOUND",
            details: { bucket: this.bucket },
          })

        case "AccessDenied":
        case "InvalidAccessKeyId":
        case "SignatureDoesNotMatch":
          return new AuthorizationError(
            "Storage authorization failed. Please check your Cloudflare R2 credentials.",
            {
              s3Code: errorName,
            }
          )

        case "EntityTooLarge":
        case "MaxMessageSizeExceeded":
          return new PayloadTooLargeError(
            "File size exceeds maximum storage limit"
          )

        case "SlowDown":
        case "TooManyRequests":
          return new RateLimitError(
            "Object storage rate limit exceeded. Please retry momentarily."
          )

        default:
          return new ExternalServiceError(
            `Storage operation failed: ${err.message || errorName}`,
            {
              s3Code: errorName,
              statusCode,
              fault: err.$fault,
            }
          )
      }
    }

    return null
  }
}
