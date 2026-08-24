// src/Modules/Redirect/RedirectModule.ts
import { BaseModule } from "@/core/BaseModule"
import { AppLogger } from "@workspace/logger"
import { validateRequest } from "@/middleware/validation"
import { authenticate, requireRole } from "@/middleware/auth"
import { Role } from "@workspace/db"
import { RedirectService } from "./redirect.service"
import { RedirectController } from "./redirect.controller"
import {
  createRedirectSchema,
  updateRedirectSchema,
  queryRedirectsSchema,
  resolveRedirectSchema,
  bulkDeleteRedirectsSchema,
} from "./RedirectDTO"

export class RedirectModule extends BaseModule {
  public name: string = "RedirectModule"
  public version: string = "1.0.0"
  public basePath: string = "/redirects/v1/"
  public dependencies?: string[] | undefined

  protected logger = new AppLogger("RedirectModule")

  protected async setupUseCases(): Promise<void> {
    const redirectService = new RedirectService()
    this.registerService("RedirectService", redirectService)
  }

  protected async setupControllers(): Promise<void> {
    const redirectService =
      this.getService<RedirectService>("RedirectService")
    this.registerController(
      "RedirectController",
      new RedirectController(redirectService)
    )
  }

  protected async setupRoutes(): Promise<void> {
    const controller =
      this.getController<RedirectController>("RedirectController")

    // Guard for admin dashboard operations
    const adminGuard = [
      authenticate,
      requireRole(Role.ADMIN, Role.MODERATOR),
    ]

    // =========================================================================
    // 1. PUBLIC RESOLUTION ROUTE (For Astro Frontend / Middleware / Crawlers)
    // =========================================================================

    // GET /redirects/v1/resolve?path=/old-url
    this.router.get(
      "/resolve",
      validateRequest({ query: resolveRedirectSchema }),
      controller.resolvePath.bind(controller)
    )

    // =========================================================================
    // 2. ADMIN DASHBOARD MANAGEMENT ROUTES
    // =========================================================================

    // GET /redirects/v1/admin/stats - Overview analytics and KPI counters
    this.router.get(
      "/admin/stats",
      ...adminGuard,
      controller.getStats.bind(controller)
    )

    // GET /redirects/v1/admin - Paginated redirects list with search & filters
    this.router.get(
      "/admin",
      ...adminGuard,
      validateRequest({ query: queryRedirectsSchema }),
      controller.getAllAdmin.bind(controller)
    )

    // POST /redirects/v1/admin - Create a manual redirect rule
    this.router.post(
      "/admin",
      ...adminGuard,
      validateRequest({ body: createRedirectSchema }),
      controller.create.bind(controller)
    )

    // PATCH /redirects/v1/admin/:id - Update redirect rule
    this.router.patch(
      "/admin/:id",
      ...adminGuard,
      validateRequest({ body: updateRedirectSchema }),
      controller.update.bind(controller)
    )

    // DELETE /redirects/v1/admin/:id - Delete redirect rule
    this.router.delete(
      "/admin/:id",
      ...adminGuard,
      controller.delete.bind(controller)
    )

    // POST /redirects/v1/admin/bulk-delete - Bulk delete redirect rules
    this.router.post(
      "/admin/bulk-delete",
      ...adminGuard,
      validateRequest({ body: bulkDeleteRedirectsSchema }),
      controller.bulkDelete.bind(controller)
    )
  }
}
