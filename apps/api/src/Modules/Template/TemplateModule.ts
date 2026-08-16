// src/Modules/Template/TemplateModule.ts
import { BaseModule } from "@/core/BaseModule"
import { AppLogger } from "@workspace/logger"
import { validateRequest } from "@/middleware/validation"
import { TemplateService } from "./template.service"
import { TemplateController } from "./template.controller"
import {
  createTemplateSchema,
  updateTemplateSchema,
  previewTemplateSchema,
  sendTestEmailSchema,
  listTemplatesQuerySchema,
} from "./TemplateDTO"

export class TemplateModule extends BaseModule {
  public name: string = "TemplateModule"
  public version: string = "1.0.0"
  public basePath: string = "/templates/v1/"
  public dependencies?: string[] | undefined

  protected logger = new AppLogger("TemplateModule")

  protected async setupUseCases(): Promise<void> {
    const templateService = new TemplateService()
    this.registerService("TemplateService", templateService)
  }

  protected async setupControllers(): Promise<void> {
    const templateService = this.getService<TemplateService>("TemplateService")
    this.registerController(
      "TemplateController",
      new TemplateController(templateService)
    )
  }

  protected async onAfterInit(): Promise<void> {
    // Auto-seed and initialize system email templates on startup
    const templateService = this.getService<TemplateService>("TemplateService")
    await templateService.initializeSystemTemplates()
  }

  protected async setupRoutes(): Promise<void> {
    const controller =
      this.getController<TemplateController>("TemplateController")

    // ── Template KPI & Discovery Endpoints ──────────────────────────
    // GET /templates/v1/stats - Summary counts and metrics
    this.router.get("/stats", controller.getStats.bind(controller))

    // GET /templates/v1/remote - List remote templates directly from Plunk
    this.router.get("/remote", controller.getRemoteTemplates.bind(controller))

    // POST /templates/v1/sync - Synchronize all templates to Plunk
    this.router.post("/sync", controller.syncAllTemplates.bind(controller))

    // POST /templates/v1/preview - Render live preview with Liquid interpolation
    this.router.post(
      "/preview",
      validateRequest({ body: previewTemplateSchema }),
      controller.previewTemplate.bind(controller)
    )

    // POST /templates/v1/send-test - Send test email
    this.router.post(
      "/send-test",
      validateRequest({ body: sendTestEmailSchema }),
      controller.sendTestEmail.bind(controller)
    )

    // ── Standard CRUD & Actions Endpoints ────────────────────────────
    // GET /templates/v1 - List all templates (DB + sync status)
    this.router.get(
      "/",
      validateRequest({ query: listTemplatesQuerySchema }),
      controller.getAllTemplates.bind(controller)
    )

    // POST /templates/v1 - Create a new email template
    this.router.post(
      "/",
      validateRequest({ body: createTemplateSchema }),
      controller.createTemplate.bind(controller)
    )

    // POST /templates/v1/:id/duplicate - Duplicate template
    this.router.post(
      "/:id/duplicate",
      controller.duplicateTemplate.bind(controller)
    )

    // POST /templates/v1/:id/reset - Reset codebase template to default
    this.router.post("/:id/reset", controller.resetTemplate.bind(controller))

    // POST /templates/v1/:id/sync - Sync single template to Plunk
    this.router.post(
      "/:id/sync",
      controller.syncSingleTemplate.bind(controller)
    )

    // GET /templates/v1/:idOrSlug - Get single template by ID or slug
    this.router.get("/:idOrSlug", controller.getTemplate.bind(controller))

    // PATCH /templates/v1/:id - Update template
    this.router.patch(
      "/:id",
      validateRequest({ body: updateTemplateSchema }),
      controller.updateTemplate.bind(controller)
    )

    // DELETE /templates/v1/:id - Delete template
    this.router.delete("/:id", controller.deleteTemplate.bind(controller))

    this.logger.info("✔ Template routes configured (/templates/v1/*)")
  }
}
