// src/Modules/Redirect/redirect.controller.ts
import { Request, Response, NextFunction } from "express"
import { BaseController } from "@/core/BaseController"
import { RedirectService } from "./redirect.service"
import { HTTPStatusCode } from "@/types/HTTPStatusCode"
import type {
  CreateRedirectDTO,
  UpdateRedirectDTO,
  QueryRedirectsDTO,
  BulkDeleteRedirectsDTO,
} from "./RedirectDTO"

export class RedirectController extends BaseController {
  constructor(private redirectService: RedirectService) {
    super()
  }

  // =========================================================================
  // PUBLIC / EDGE RESOLUTION ENDPOINT
  // =========================================================================

  /**
   * GET /redirects/v1/resolve?path=/old-url
   * Fast resolution endpoint for Astro frontend / Middleware
   */
  public async resolvePath(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const pathParam = (req.query.path as string) || (req.query.url as string) || "/"
      const result = await this.redirectService.resolve(pathParam)
      this.sendResponse(
        req,
        res,
        "Redirect resolution checked",
        HTTPStatusCode.OK,
        result
      )
    } catch (error) {
      next(error)
    }
  }

  // =========================================================================
  // ADMIN DASHBOARD ENDPOINTS
  // =========================================================================

  /**
   * GET /redirects/v1/admin/stats - Overview analytics and KPI counters
   */
  public async getStats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await this.redirectService.getStats()
      this.sendResponse(
        req,
        res,
        "Redirect analytics retrieved successfully",
        HTTPStatusCode.OK,
        stats
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /redirects/v1/admin - Paginated listing with search & filters
   */
  public async getAllAdmin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = (req.validatedQuery || req.query) as QueryRedirectsDTO
      const result = await this.redirectService.getAllAdmin(
        query
      )
      this.sendPaginatedResponse(
        req,
        res,
        result.pagination,
        "Redirects retrieved successfully",
        result.data
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /redirects/v1/admin - Create manual redirect
   */
  public async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const payload: CreateRedirectDTO = req.body
      const created = await this.redirectService.create(payload)
      this.sendResponse(
        req,
        res,
        "Redirect rule created successfully",
        HTTPStatusCode.CREATED,
        created
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * PATCH /redirects/v1/admin/:id - Update redirect
   */
  public async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
      const payload: UpdateRedirectDTO = req.body
      const updated = await this.redirectService.update(id, payload)
      this.sendResponse(
        req,
        res,
        "Redirect rule updated successfully",
        HTTPStatusCode.OK,
        updated
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * DELETE /redirects/v1/admin/:id - Delete redirect
   */
  public async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
      await this.redirectService.delete(id)
      this.sendResponse(
        req,
        res,
        "Redirect rule deleted successfully",
        HTTPStatusCode.OK,
        { id }
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /redirects/v1/admin/bulk-delete - Bulk delete redirects
   */
  public async bulkDelete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const payload: BulkDeleteRedirectsDTO = req.body
      const result = await this.redirectService.bulkDelete(payload.ids)
      this.sendResponse(
        req,
        res,
        `Successfully deleted ${result.count} redirects`,
        HTTPStatusCode.OK,
        result
      )
    } catch (error) {
      next(error)
    }
  }
}
