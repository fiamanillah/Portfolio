// apps/api/src/Modules/Resume/ResumeModule.ts
import multer from "multer"
import { BaseModule } from "@/core/BaseModule"
import { AppLogger } from "@workspace/logger"
import { Role } from "@workspace/db"
import { ResumeService } from "./resume.service"
import { ResumeController } from "./resume.controller"
import { StorageService } from "@/services/StorageService"
import { validateRequest } from "@/middleware/validation"
import { authenticate, requireRole } from "@/middleware/auth"
import {
  updateResumeSchema,
  resumeQuerySchema,
} from "./ResumeDTO"

export class ResumeModule extends BaseModule {
  public name: string = "ResumeModule"
  public version: string = "1.0.0"
  public basePath: string = "/resume/v1/"
  public dependencies?: string[] | undefined

  protected logger = new AppLogger("ResumeModule")

  protected async setupUseCases(): Promise<void> {
    const prisma = this.context.getService("prisma")
    let storageClient
    try {
      storageClient = this.context.getService("storage")
    } catch {
      // Fallback if not registered
    }
    const storage = new StorageService(storageClient)
    this.registerService("ResumeService", new ResumeService(prisma, storage))
  }

  protected async setupControllers(): Promise<void> {
    const resumeService = this.getService<ResumeService>("ResumeService")
    this.registerController("ResumeController", new ResumeController(resumeService))
  }

  protected async setupRoutes(): Promise<void> {
    const controller = this.getController<ResumeController>("ResumeController")

    const upload = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 26214400, // 25MB
      },
    })

    // ── Public Routes ──────────────────────────────────────────────────────────

    // GET /resume/v1/public/active - Get current active resume metadata
    this.router.get(
      "/public/active",
      controller.getActiveResume.bind(controller)
    )

    // GET /resume/v1/public/download - Track & download active resume
    this.router.get(
      "/public/download",
      controller.downloadResume.bind(controller)
    )

    // GET /resume/v1/public/:id/download - Track & download specific resume version
    this.router.get(
      "/public/:id/download",
      controller.downloadResume.bind(controller)
    )

    // ── Admin Management Routes ────────────────────────────────────────────────

    // GET /resume/v1/admin - List all resume versions
    this.router.get(
      "/admin",
      authenticate,
      requireRole(Role.ADMIN),
      validateRequest(resumeQuerySchema),
      controller.listResumes.bind(controller)
    )

    // POST /resume/v1/admin - Upload & create new resume version
    this.router.post(
      "/admin",
      authenticate,
      requireRole(Role.ADMIN),
      upload.single("file"),
      controller.createResume.bind(controller)
    )

    // GET /resume/v1/admin/:id - Get single resume version details
    this.router.get(
      "/admin/:id",
      authenticate,
      requireRole(Role.ADMIN),
      controller.getResume.bind(controller)
    )

    // PATCH /resume/v1/admin/:id - Update resume version metadata
    this.router.patch(
      "/admin/:id",
      authenticate,
      requireRole(Role.ADMIN),
      validateRequest(updateResumeSchema),
      controller.updateResume.bind(controller)
    )

    // PATCH /resume/v1/admin/:id/activate - Set specific version as active
    this.router.patch(
      "/admin/:id/activate",
      authenticate,
      requireRole(Role.ADMIN),
      controller.setActiveResume.bind(controller)
    )

    // DELETE /resume/v1/admin/:id - Delete resume version and purge storage
    this.router.delete(
      "/admin/:id",
      authenticate,
      requireRole(Role.ADMIN),
      controller.deleteResume.bind(controller)
    )

    this.logger.info("✔ Resume routes initialized under /resume/v1/*")
  }
}
