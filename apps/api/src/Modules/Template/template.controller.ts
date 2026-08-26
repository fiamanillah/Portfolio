// src/Modules/Template/template.controller.ts
import { Request, Response, NextFunction } from "express"
import { BaseController } from "@/core/BaseController"
import { TemplateService } from "./template.service"
import { HTTPStatusCode } from "@/types/HTTPStatusCode"
import {
  CreateTemplateDTO,
  UpdateTemplateDTO,
  PreviewTemplateDTO,
  SendTestEmailDTO,
  ListTemplatesQueryDTO,
} from "./TemplateDTO"

export class TemplateController extends BaseController {
  constructor(private templateService: TemplateService) {
    super()
  }

  /**
   * GET /templates/v1/stats - Retrieve aggregated template metrics & counts
   */
  public async getStats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await this.templateService.getStats()
      this.sendResponse(
        req,
        res,
        "Template statistics retrieved successfully",
        HTTPStatusCode.OK,
        result
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /templates/v1 - Create a new email template
   */
  public async createTemplate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const payload: CreateTemplateDTO = req.body
      const result = await this.templateService.createTemplate(payload)
      this.sendCreatedResponse(
        req,
        res,
        result,
        "Email template created successfully"
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /templates/v1 - Get paginated list of email templates
   */
  public async getAllTemplates(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = (req.validatedQuery || req.query) as ListTemplatesQueryDTO
      const result = await this.templateService.getAllTemplates(query)
      this.sendPaginatedResponse(
        req,
        res,
        result.pagination,
        "Email templates retrieved successfully",
        result.data
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /templates/v1/remote - Fetch remote templates directly from Plunk API
   */
  public async getRemoteTemplates(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await this.templateService.getRemotePlunkTemplates(
        req.query
      )
      this.sendResponse(
        req,
        res,
        "Remote Plunk templates retrieved successfully",
        HTTPStatusCode.OK,
        result
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /templates/v1/:idOrSlug - Get single template details
   */
  public async getTemplate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const idOrSlug = Array.isArray(req.params.idOrSlug)
        ? req.params.idOrSlug[0]
        : req.params.idOrSlug
      const result = await this.templateService.getTemplateByIdOrSlug(idOrSlug)
      this.sendResponse(
        req,
        res,
        "Email template retrieved successfully",
        HTTPStatusCode.OK,
        result
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * PATCH /templates/v1/:id - Update email template
   */
  public async updateTemplate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
      const payload: UpdateTemplateDTO = req.body
      const result = await this.templateService.updateTemplate(id, payload)
      this.sendResponse(
        req,
        res,
        "Email template updated successfully",
        HTTPStatusCode.OK,
        result
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /templates/v1/:id/reset - Reset a codebase system template to default layout
   */
  public async resetTemplate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
      const result = await this.templateService.resetSystemTemplate(id)
      this.sendResponse(
        req,
        res,
        "Template reset to codebase default successfully",
        HTTPStatusCode.OK,
        result
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /templates/v1/:id/sync - Sync single template with Plunk
   */
  public async syncSingleTemplate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
      const result = await this.templateService.syncTemplateToPlunk(id!)
      this.sendResponse(
        req,
        res,
        "Template synced with Plunk successfully",
        HTTPStatusCode.OK,
        result
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * DELETE /templates/v1/:id - Delete email template
   */
  public async deleteTemplate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
      const force = req.query.force === "true"
      const result = await this.templateService.deleteTemplate(id, force)
      this.sendResponse(req, res, result.message, HTTPStatusCode.OK, result)
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /templates/v1/:id/duplicate - Duplicate email template
   */
  public async duplicateTemplate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
      const result = await this.templateService.duplicateTemplate(id)
      this.sendCreatedResponse(
        req,
        res,
        result,
        "Email template duplicated successfully"
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /templates/v1/sync - Push sync all templates to Plunk API
   */
  public async syncAllTemplates(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await this.templateService.syncAllToPlunk()
      this.sendResponse(
        req,
        res,
        "Template synchronization with Plunk completed",
        HTTPStatusCode.OK,
        result
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /templates/v1/preview - Render Liquid template preview
   */
  public async previewTemplate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const payload: PreviewTemplateDTO = req.body
      const result = await this.templateService.renderPreview(payload)
      this.sendResponse(
        req,
        res,
        "Template preview rendered successfully",
        HTTPStatusCode.OK,
        result
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /templates/v1/send-test - Send test email using template
   */
  public async sendTestEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const payload: SendTestEmailDTO = req.body
      const result = await this.templateService.sendTestEmail(payload)
      this.sendResponse(req, res, result.message, HTTPStatusCode.OK, result)
    } catch (error) {
      next(error)
    }
  }
}
