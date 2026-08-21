// src/Modules/Skill/SkillModule.ts
import { BaseModule } from "@/core/BaseModule";
import { AppLogger } from "@workspace/logger";
import { validateRequest } from "@/middleware/validation";
import { authenticate, requireRole } from "@/middleware/auth";
import { Role } from "@workspace/db";
import { SkillService } from "./skill.service";
import { SkillController } from "./skill.controller";
import {
  createSkillSchema,
  updateSkillSchema,
  listSkillsQuerySchema,
  publicSkillQuerySchema,
  bulkSkillStatusSchema,
  bulkSkillDeleteSchema,
  reorderSkillsSchema,
  createSkillCategorySchema,
  updateSkillCategorySchema,
  reorderSkillCategoriesSchema,
} from "./SkillDTO";

export class SkillModule extends BaseModule {
  public name: string = "SkillModule";
  public version: string = "1.0.0";
  public basePath: string = "/skills/v1/";
  public dependencies?: string[] | undefined;

  protected logger = new AppLogger("SkillModule");

  protected async setupUseCases(): Promise<void> {
    const prisma = this.context.getService("prisma");
    const skillService = new SkillService(prisma);
    this.registerService("SkillService", skillService);
  }

  protected async setupControllers(): Promise<void> {
    const skillService = this.getService<SkillService>("SkillService");
    this.registerController(
      "SkillController",
      new SkillController(skillService)
    );
  }

  protected async setupRoutes(): Promise<void> {
    const controller = this.getController<SkillController>("SkillController");

    // Guard for admin/moderator dashboard endpoints
    const adminGuard = [
      authenticate,
      requireRole(Role.ADMIN, Role.MODERATOR),
    ];

    // =========================================================================
    // 1. PUBLIC DISCOVERY ROUTES (Frontend, Astro Homepage, SSR)
    // =========================================================================

    // GET /skills/v1/public - List published skills grouped by category
    this.router.get(
      "/public",
      validateRequest({ query: publicSkillQuerySchema }),
      controller.getPublicSkills.bind(controller)
    );

    // =========================================================================
    // 2. ADMIN DASHBOARD ROUTES (Authenticated & RBAC)
    // =========================================================================

    // GET /skills/v1/admin/stats - Aggregated overview KPI metrics
    this.router.get(
      "/admin/stats",
      ...adminGuard,
      controller.getStats.bind(controller)
    );

    // GET /skills/v1/admin/list - Searchable & filterable paginated list
    this.router.get(
      "/admin/list",
      ...adminGuard,
      validateRequest({ query: listSkillsQuerySchema }),
      controller.getAllAdmin.bind(controller)
    );

    // POST /skills/v1/admin/create - Create new skill
    this.router.post(
      "/admin/create",
      ...adminGuard,
      validateRequest({ body: createSkillSchema }),
      controller.create.bind(controller)
    );

    // POST /skills/v1/admin/bulk-status - Bulk update status
    this.router.post(
      "/admin/bulk-status",
      ...adminGuard,
      validateRequest({ body: bulkSkillStatusSchema }),
      controller.bulkUpdateStatus.bind(controller)
    );

    // POST /skills/v1/admin/bulk-delete - Bulk delete skills
    this.router.post(
      "/admin/bulk-delete",
      ...adminGuard,
      validateRequest({ body: bulkSkillDeleteSchema }),
      controller.bulkDelete.bind(controller)
    );

    // POST /skills/v1/admin/reorder - Reorder skills
    this.router.post(
      "/admin/reorder",
      ...adminGuard,
      validateRequest({ body: reorderSkillsSchema }),
      controller.reorder.bind(controller)
    );

    // POST /skills/v1/admin/seed-default - Re-seed default skills & categories
    this.router.post(
      "/admin/seed-default",
      ...adminGuard,
      controller.seedDefault.bind(controller)
    );

    // =========================================================================
    // 3. CATEGORY MANAGEMENT ROUTES
    // =========================================================================

    // GET /skills/v1/admin/categories - List categories
    this.router.get(
      "/admin/categories",
      ...adminGuard,
      controller.listCategories.bind(controller)
    );

    // POST /skills/v1/admin/categories - Create category
    this.router.post(
      "/admin/categories",
      ...adminGuard,
      validateRequest({ body: createSkillCategorySchema }),
      controller.createCategory.bind(controller)
    );

    // POST /skills/v1/admin/categories/reorder - Reorder categories
    this.router.post(
      "/admin/categories/reorder",
      ...adminGuard,
      validateRequest({ body: reorderSkillCategoriesSchema }),
      controller.reorderCategories.bind(controller)
    );

    // GET /skills/v1/admin/categories/:id - Get category by ID
    this.router.get(
      "/admin/categories/:id",
      ...adminGuard,
      controller.getCategoryById.bind(controller)
    );

    // PATCH /skills/v1/admin/categories/:id - Update category
    this.router.patch(
      "/admin/categories/:id",
      ...adminGuard,
      validateRequest({ body: updateSkillCategorySchema }),
      controller.updateCategory.bind(controller)
    );

    // DELETE /skills/v1/admin/categories/:id - Delete category
    this.router.delete(
      "/admin/categories/:id",
      ...adminGuard,
      controller.deleteCategory.bind(controller)
    );

    // =========================================================================
    // 4. INDIVIDUAL SKILL ROUTES
    // =========================================================================

    // GET /skills/v1/admin/:id - Get single skill by ID
    this.router.get(
      "/admin/:id",
      ...adminGuard,
      controller.getById.bind(controller)
    );

    // PATCH /skills/v1/admin/:id - Update skill
    this.router.patch(
      "/admin/:id",
      ...adminGuard,
      validateRequest({ body: updateSkillSchema }),
      controller.update.bind(controller)
    );

    // DELETE /skills/v1/admin/:id - Delete skill
    this.router.delete(
      "/admin/:id",
      ...adminGuard,
      controller.delete.bind(controller)
    );

    // POST /skills/v1/admin/:id/duplicate - Duplicate skill
    this.router.post(
      "/admin/:id/duplicate",
      ...adminGuard,
      controller.duplicate.bind(controller)
    );

    this.logger.info("✔ Skill routes configured (/skills/v1/*)");
  }
}
