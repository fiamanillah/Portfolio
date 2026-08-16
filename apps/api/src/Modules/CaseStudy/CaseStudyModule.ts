// src/Modules/CaseStudy/CaseStudyModule.ts
import { BaseModule } from "@/core/BaseModule";
import { AppLogger } from "@workspace/logger";
import { validateRequest } from "@/middleware/validation";
import { authenticate, optionalAuth, requireRole } from "@/middleware/auth";
import { Role } from "@workspace/db";
import { CaseStudyService } from "./caseStudy.service";
import { CaseStudyController } from "./caseStudy.controller";
import {
  createCaseStudySchema,
  updateCaseStudySchema,
  listCaseStudiesQuerySchema,
  publicCaseStudyQuerySchema,
  bulkCaseStudyStatusSchema,
  bulkCaseStudyDeleteSchema,
  reorderCaseStudiesSchema,
} from "./CaseStudyDTO";

export class CaseStudyModule extends BaseModule {
  public name: string = "CaseStudyModule";
  public version: string = "1.0.0";
  public basePath: string = "/case-studies/v1/";
  public dependencies?: string[] | undefined;

  protected logger = new AppLogger("CaseStudyModule");

  protected async setupUseCases(): Promise<void> {
    const prisma = this.context.getService("prisma");
    const caseStudyService = new CaseStudyService(prisma);
    this.registerService("CaseStudyService", caseStudyService);
  }

  protected async setupControllers(): Promise<void> {
    const caseStudyService =
      this.getService<CaseStudyService>("CaseStudyService");
    this.registerController(
      "CaseStudyController",
      new CaseStudyController(caseStudyService)
    );
  }

  protected async setupRoutes(): Promise<void> {
    const controller =
      this.getController<CaseStudyController>("CaseStudyController");

    // Guard for admin/editor endpoints
    const adminGuard = [
      authenticate,
      requireRole(Role.ADMIN, Role.MODERATOR, Role.AUTHOR),
    ];

    // =========================================================================
    // 1. PUBLIC DISCOVERY ROUTES (Frontend, SSR, Crawlers)
    // =========================================================================

    // GET /case-studies/v1/public - List published case studies
    this.router.get(
      "/public",
      validateRequest({ query: publicCaseStudyQuerySchema }),
      controller.getPublicCaseStudies.bind(controller)
    );

    // GET /case-studies/v1/public/featured - List featured case studies
    this.router.get(
      "/public/featured",
      controller.getFeaturedCaseStudies.bind(controller)
    );

    // GET /case-studies/v1/public/slug/:slug - Case study details by slug
    this.router.get(
      "/public/slug/:slug",
      controller.getPublicCaseStudyBySlug.bind(controller)
    );

    // POST /case-studies/v1/public/slug/:slug/react - Add reaction / like
    this.router.post(
      "/public/slug/:slug/react",
      optionalAuth,
      controller.reactToCaseStudy.bind(controller)
    );

    // =========================================================================
    // 2. ADMIN DASHBOARD & EDITORIAL ROUTES (Authenticated & RBAC)
    // =========================================================================

    // GET /case-studies/v1/admin/stats - Aggregated KPI metrics
    this.router.get(
      "/admin/stats",
      ...adminGuard,
      controller.getStats.bind(controller)
    );

    // GET /case-studies/v1/admin/list - Paginated searchable case studies list
    this.router.get(
      "/admin/list",
      ...adminGuard,
      validateRequest({ query: listCaseStudiesQuerySchema }),
      controller.getAllAdmin.bind(controller)
    );

    // POST /case-studies/v1/admin/create - Create case study
    this.router.post(
      "/admin/create",
      ...adminGuard,
      validateRequest({ body: createCaseStudySchema }),
      controller.create.bind(controller)
    );

    // POST /case-studies/v1/admin/bulk-status - Bulk status update
    this.router.post(
      "/admin/bulk-status",
      ...adminGuard,
      validateRequest({ body: bulkCaseStudyStatusSchema }),
      controller.bulkUpdateStatus.bind(controller)
    );

    // POST /case-studies/v1/admin/bulk-delete - Bulk delete case studies
    this.router.post(
      "/admin/bulk-delete",
      ...adminGuard,
      validateRequest({ body: bulkCaseStudyDeleteSchema }),
      controller.bulkDelete.bind(controller)
    );

    // POST /case-studies/v1/admin/reorder - Reorder case studies
    this.router.post(
      "/admin/reorder",
      ...adminGuard,
      validateRequest({ body: reorderCaseStudiesSchema }),
      controller.reorder.bind(controller)
    );

    // POST /case-studies/v1/admin/seed-local - Sync repository local JSON case studies to DB
    this.router.post(
      "/admin/seed-local",
      ...adminGuard,
      controller.seedLocalCaseStudies.bind(controller)
    );

    // GET /case-studies/v1/admin/:id - Get case study by ID
    this.router.get(
      "/admin/:id",
      ...adminGuard,
      controller.getById.bind(controller)
    );

    // PATCH /case-studies/v1/admin/:id - Update case study
    this.router.patch(
      "/admin/:id",
      ...adminGuard,
      validateRequest({ body: updateCaseStudySchema }),
      controller.update.bind(controller)
    );

    // DELETE /case-studies/v1/admin/:id - Delete case study
    this.router.delete(
      "/admin/:id",
      ...adminGuard,
      controller.delete.bind(controller)
    );

    // POST /case-studies/v1/admin/:id/duplicate - Duplicate case study
    this.router.post(
      "/admin/:id/duplicate",
      ...adminGuard,
      controller.duplicate.bind(controller)
    );

    this.logger.info("✔ Case study routes configured (/case-studies/v1/*)");
  }
}
