// src/Modules/Experience/ExperienceModule.ts
import { BaseModule } from "@/core/BaseModule";
import { AppLogger } from "@workspace/logger";
import { validateRequest } from "@/middleware/validation";
import { authenticate, requireRole } from "@/middleware/auth";
import { Role } from "@workspace/db";
import { ExperienceService } from "./experience.service";
import { ExperienceController } from "./experience.controller";
import {
  createExperienceSchema,
  updateExperienceSchema,
  listExperiencesQuerySchema,
  publicExperienceQuerySchema,
  bulkExperienceStatusSchema,
  bulkExperienceDeleteSchema,
  reorderExperiencesSchema,
} from "./ExperienceDTO";

export class ExperienceModule extends BaseModule {
  public name: string = "ExperienceModule";
  public version: string = "1.0.0";
  public basePath: string = "/experiences/v1/";
  public dependencies?: string[] | undefined;

  protected logger = new AppLogger("ExperienceModule");

  protected async setupUseCases(): Promise<void> {
    const prisma = this.context.getService("prisma");
    const experienceService = new ExperienceService(prisma);
    this.registerService("ExperienceService", experienceService);
  }

  protected async setupControllers(): Promise<void> {
    const experienceService =
      this.getService<ExperienceService>("ExperienceService");
    this.registerController(
      "ExperienceController",
      new ExperienceController(experienceService)
    );
  }

  protected async setupRoutes(): Promise<void> {
    const controller =
      this.getController<ExperienceController>("ExperienceController");

    // Guard for admin/moderator dashboard endpoints
    const adminGuard = [
      authenticate,
      requireRole(Role.ADMIN, Role.MODERATOR),
    ];

    // =========================================================================
    // 1. PUBLIC DISCOVERY ROUTES (Frontend, SSR, Crawlers)
    // =========================================================================

    // GET /experiences/v1/public - List published experiences for portfolio website
    this.router.get(
      "/public",
      validateRequest({ query: publicExperienceQuerySchema }),
      controller.getPublicExperiences.bind(controller)
    );

    // =========================================================================
    // 2. ADMIN DASHBOARD ROUTES (Authenticated & RBAC)
    // =========================================================================

    // GET /experiences/v1/admin/stats - Aggregated overview KPI metrics
    this.router.get(
      "/admin/stats",
      ...adminGuard,
      controller.getStats.bind(controller)
    );

    // GET /experiences/v1/admin/list - Searchable & filterable paginated list
    this.router.get(
      "/admin/list",
      ...adminGuard,
      validateRequest({ query: listExperiencesQuerySchema }),
      controller.getAllAdmin.bind(controller)
    );

    // POST /experiences/v1/admin/create - Create new experience
    this.router.post(
      "/admin/create",
      ...adminGuard,
      validateRequest({ body: createExperienceSchema }),
      controller.create.bind(controller)
    );

    // POST /experiences/v1/admin/bulk-status - Bulk update status
    this.router.post(
      "/admin/bulk-status",
      ...adminGuard,
      validateRequest({ body: bulkExperienceStatusSchema }),
      controller.bulkUpdateStatus.bind(controller)
    );

    // POST /experiences/v1/admin/bulk-delete - Bulk delete experiences
    this.router.post(
      "/admin/bulk-delete",
      ...adminGuard,
      validateRequest({ body: bulkExperienceDeleteSchema }),
      controller.bulkDelete.bind(controller)
    );

    // POST /experiences/v1/admin/reorder - Reorder experiences
    this.router.post(
      "/admin/reorder",
      ...adminGuard,
      validateRequest({ body: reorderExperiencesSchema }),
      controller.reorder.bind(controller)
    );

    // POST /experiences/v1/admin/seed-default - Re-seed default experiences
    this.router.post(
      "/admin/seed-default",
      ...adminGuard,
      controller.seedDefault.bind(controller)
    );

    // GET /experiences/v1/admin/:id - Get single experience by ID
    this.router.get(
      "/admin/:id",
      ...adminGuard,
      controller.getById.bind(controller)
    );

    // PATCH /experiences/v1/admin/:id - Update experience
    this.router.patch(
      "/admin/:id",
      ...adminGuard,
      validateRequest({ body: updateExperienceSchema }),
      controller.update.bind(controller)
    );

    // DELETE /experiences/v1/admin/:id - Delete experience
    this.router.delete(
      "/admin/:id",
      ...adminGuard,
      controller.delete.bind(controller)
    );

    // POST /experiences/v1/admin/:id/duplicate - Duplicate experience
    this.router.post(
      "/admin/:id/duplicate",
      ...adminGuard,
      controller.duplicate.bind(controller)
    );

    this.logger.info("✔ Experience routes configured (/experiences/v1/*)");
  }
}
