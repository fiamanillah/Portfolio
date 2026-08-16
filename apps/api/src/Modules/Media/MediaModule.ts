// apps/api/src/Modules/Media/MediaModule.ts
import { BaseModule } from "@/core/BaseModule";
import { AppLogger } from "@workspace/logger";
import { validateRequest } from "@/middleware/validation";
import { authenticate, requireRole } from "@/middleware/auth";
import { Role } from "@workspace/db";
import { MediaService } from "./media.service";
import { MediaController } from "./media.controller";
import { StorageService } from "@/services/StorageService";
import {
  presignedUrlSchema,
  confirmPresignedSchema,
  updateMediaSchema,
  listMediaQuerySchema,
  bulkDeleteMediaSchema,
  bulkUpdateMediaSchema,
  mediaIdParamSchema,
  cleanupMediaSchema,
} from "./MediaDTO";
import multer from "multer";
import { config } from "@/core/config";

export class MediaModule extends BaseModule {
  public name: string = "MediaModule";
  public version: string = "1.0.0";
  public basePath: string = "/media/v1/";
  public dependencies?: string[] | undefined;

  protected logger = new AppLogger("MediaModule");

  protected async setupUseCases(): Promise<void> {
    let s3Client;
    try {
      s3Client = this.context.getService("storage");
    } catch {
      // Fallback if not registered in context
      this.logger.debug("Storage provider not found in context, creating default S3 client");
    }

    const storageService = new StorageService(s3Client);
    const mediaService = new MediaService(storageService);

    this.registerService("StorageService", storageService);
    this.registerService("MediaService", mediaService);
  }

  protected async setupControllers(): Promise<void> {
    const mediaService = this.getService<MediaService>("MediaService");
    this.registerController("MediaController", new MediaController(mediaService));
  }

  protected async setupRoutes(): Promise<void> {
    const controller = this.getController<MediaController>("MediaController");

    // Guard for admin/moderator/author access
    const staffGuard = [
      authenticate,
      requireRole(Role.ADMIN, Role.MODERATOR, Role.AUTHOR),
    ];

    // Multer memory storage configuration for direct buffer uploads
    const upload = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: config.storage.maxFileSize || 52428800, // 50MB
        files: 10, // Up to 10 files per batch
      },
    });

    // =========================================================================
    // 1. UPLOAD & PRESIGNED DIRECT URL ROUTES
    // =========================================================================

    // POST /media/v1/upload - Server-proxied multipart form upload (supports single or multiple)
    this.router.post(
      "/upload",
      ...staffGuard,
      upload.fields([
        { name: "file", maxCount: 1 },
        { name: "files", maxCount: 10 },
      ]),
      (req, res, next) => {
        // Normalize req.file if passed inside req.files['file']
        const filesObj = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        if (filesObj) {
          if (filesObj.file && filesObj.file.length > 0) {
            req.file = filesObj.file[0];
          }
          if (filesObj.files && filesObj.files.length > 0) {
            req.files = filesObj.files;
          }
        }
        next();
      },
      controller.upload.bind(controller)
    );

    // POST /media/v1/presigned-url - Generate presigned PUT URL for direct client-to-R2 upload
    this.router.post(
      "/presigned-url",
      ...staffGuard,
      validateRequest({ body: presignedUrlSchema }),
      controller.createPresignedUrl.bind(controller)
    );

    // POST /media/v1/confirm-presigned - Confirm and index direct presigned upload in DB
    this.router.post(
      "/confirm-presigned",
      ...staffGuard,
      validateRequest({ body: confirmPresignedSchema }),
      controller.confirmPresigned.bind(controller)
    );

    // =========================================================================
    // 2. MEDIA LIBRARY MANAGEMENT & METRICS
    // =========================================================================

    // GET /media/v1/stats - Storage metrics & distribution
    this.router.get(
      "/stats",
      ...staffGuard,
      controller.getStats.bind(controller)
    );

    // GET /media/v1/files - Paginated, searchable media asset library
    this.router.get(
      "/files",
      ...staffGuard,
      validateRequest({ query: listMediaQuerySchema }),
      controller.list.bind(controller)
    );

    // POST /media/v1/files/bulk-delete - Bulk delete assets from R2 & DB
    this.router.post(
      "/files/bulk-delete",
      ...staffGuard,
      validateRequest({ body: bulkDeleteMediaSchema }),
      controller.bulkDelete.bind(controller)
    );

    // POST /media/v1/files/bulk-update - Bulk update folder, tags, or visibility
    this.router.post(
      "/files/bulk-update",
      ...staffGuard,
      validateRequest({ body: bulkUpdateMediaSchema }),
      controller.bulkUpdate.bind(controller)
    );

    // GET /media/v1/files/:id - Get asset metadata by ID
    this.router.get(
      "/files/:id",
      ...staffGuard,
      validateRequest({ params: mediaIdParamSchema }),
      controller.getById.bind(controller)
    );

    // PATCH /media/v1/files/:id - Update asset metadata & tags
    this.router.patch(
      "/files/:id",
      ...staffGuard,
      validateRequest({ params: mediaIdParamSchema, body: updateMediaSchema }),
      controller.update.bind(controller)
    );

    // DELETE /media/v1/files/:id - Delete single asset
    this.router.delete(
      "/files/:id",
      ...staffGuard,
      validateRequest({ params: mediaIdParamSchema }),
      controller.delete.bind(controller)
    );

    // GET /media/v1/download/:id - Get secure download URL or redirect
    this.router.get(
      "/download/:id",
      ...staffGuard,
      validateRequest({ params: mediaIdParamSchema }),
      controller.getDownload.bind(controller)
    );

    // GET /media/v1/by-key - Get asset metadata by key query param
    this.router.get(
      "/by-key",
      ...staffGuard,
      controller.getByKey.bind(controller)
    );

    // GET /media/v1/key/*key - Get asset metadata by S3 object key path
    this.router.get(
      "/key/*key",
      ...staffGuard,
      controller.getByKey.bind(controller)
    );

    // GET /media/v1/stream/*key - Stream media asset publicly
    this.router.get(
      "/stream/*key",
      controller.streamByKey.bind(controller)
    );

    // POST /media/v1/cleanup - Purge orphaned & unreferenced media from Cloudflare R2 / S3
    this.router.post(
      "/cleanup",
      authenticate,
      requireRole(Role.ADMIN),
      validateRequest({ body: cleanupMediaSchema }),
      controller.cleanupOrphans.bind(controller)
    );

    this.logger.info("✔ Media routes configured (/media/v1/*)");
  }
}
