// src/Modules/CaseStudy/caseStudy.controller.ts
import { Request, Response, NextFunction } from "express";
import { BaseController } from "@/core/BaseController";
import { CaseStudyService } from "./caseStudy.service";
import { HTTPStatusCode } from "@/types/HTTPStatusCode";
import {
  CreateCaseStudyDTO,
  UpdateCaseStudyDTO,
  ListCaseStudiesQueryDTO,
  PublicCaseStudyQueryDTO,
  BulkCaseStudyStatusDTO,
  BulkCaseStudyDeleteDTO,
  ReorderCaseStudiesDTO,
} from "./CaseStudyDTO";

export class CaseStudyController extends BaseController {
  constructor(private caseStudyService: CaseStudyService) {
    super();
  }

  // =========================================================================
  // ADMIN DASHBOARD ENDPOINTS
  // =========================================================================

  /**
   * GET /case-studies/v1/admin/stats - Retrieve aggregated overview KPIs & metrics
   */
  public async getStats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await this.caseStudyService.getStats();
      this.sendResponse(
        req,
        res,
        "Case study statistics retrieved successfully",
        HTTPStatusCode.OK,
        stats
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /case-studies/v1/admin/list - List case studies with admin filters & pagination
   */
  public async getAllAdmin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = (req.validatedQuery || req.query) as ListCaseStudiesQueryDTO;
      const result = await this.caseStudyService.getAllAdmin(
        query
      );
      this.sendPaginatedResponse(
        req,
        res,
        result.pagination,
        "Admin case studies retrieved successfully",
        result.data
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /case-studies/v1/admin/:id - Get complete case study details by ID
   */
  public async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const caseStudy = await this.caseStudyService.getById(id);
      this.sendResponse(
        req,
        res,
        "Case study retrieved successfully",
        HTTPStatusCode.OK,
        caseStudy
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /case-studies/v1/admin/create - Create a new case study
   */
  public async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const payload: CreateCaseStudyDTO = req.body;
      const created = await this.caseStudyService.create(payload, req.user);
      this.sendCreatedResponse(
        req,
        res,
        created,
        "Case study created successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /case-studies/v1/admin/:id - Update existing case study
   */
  public async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const payload: UpdateCaseStudyDTO = req.body;
      const updated = await this.caseStudyService.update(id, payload);
      this.sendResponse(
        req,
        res,
        "Case study updated successfully",
        HTTPStatusCode.OK,
        updated
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /case-studies/v1/admin/:id - Delete case study
   */
  public async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const deleted = await this.caseStudyService.delete(id);
      this.sendResponse(
        req,
        res,
        "Case study deleted successfully",
        HTTPStatusCode.OK,
        deleted
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /case-studies/v1/admin/:id/duplicate - Duplicate case study into draft
   */
  public async duplicate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const cloned = await this.caseStudyService.duplicate(id);
      this.sendCreatedResponse(
        req,
        res,
        cloned,
        "Case study duplicated successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /case-studies/v1/admin/bulk-status - Bulk status update
   */
  public async bulkUpdateStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const payload: BulkCaseStudyStatusDTO = req.body;
      const result = await this.caseStudyService.bulkUpdateStatus(payload);
      this.sendResponse(
        req,
        res,
        `Updated status for ${result.count} case studies`,
        HTTPStatusCode.OK,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /case-studies/v1/admin/bulk-delete - Bulk delete case studies
   */
  public async bulkDelete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const payload: BulkCaseStudyDeleteDTO = req.body;
      const result = await this.caseStudyService.bulkDelete(payload);
      this.sendResponse(
        req,
        res,
        `Deleted ${result.count} case studies`,
        HTTPStatusCode.OK,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /case-studies/v1/admin/reorder - Reorder case studies
   */
  public async reorder(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const payload: ReorderCaseStudiesDTO = req.body;
      const result = await this.caseStudyService.reorder(payload);
      this.sendResponse(
        req,
        res,
        `Reordered ${result.updated} case studies`,
        HTTPStatusCode.OK,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /case-studies/v1/admin/seed-local - Sync repository local JSON case studies into DB
   */
  public async seedLocalCaseStudies(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await this.caseStudyService.seedLocalCaseStudies();
      this.sendResponse(
        req,
        res,
        result.message,
        HTTPStatusCode.OK,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  // =========================================================================
  // PUBLIC DISCOVERY ROUTES
  // =========================================================================

  /**
   * GET /case-studies/v1/public - List published case studies
   */
  public async getPublicCaseStudies(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = (req.validatedQuery || req.query) as PublicCaseStudyQueryDTO;
      const result = await this.caseStudyService.getPublicCaseStudies(
        query
      );
      this.sendPaginatedResponse(
        req,
        res,
        result.pagination,
        "Public case studies retrieved successfully",
        result.data
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /case-studies/v1/public/featured - List featured case studies
   */
  public async getFeaturedCaseStudies(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const featured = await this.caseStudyService.getFeaturedCaseStudies();
      this.sendResponse(
        req,
        res,
        "Featured case studies retrieved successfully",
        HTTPStatusCode.OK,
        featured
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /case-studies/v1/public/slug/:slug - Get single case study by slug
   */
  public async getPublicCaseStudyBySlug(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const slug = Array.isArray(req.params.slug)
        ? req.params.slug[0]
        : req.params.slug;
      const noView = req.query.noView === "true";
      const result = await this.caseStudyService.getPublicCaseStudyBySlug(slug, {
        incrementView: !noView,
      });

      this.sendResponse(
        req,
        res,
        "Case study retrieved successfully",
        HTTPStatusCode.OK,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /case-studies/v1/public/slug/:slug/react - React / like a case study
   */
  public async reactToCaseStudy(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const slug = Array.isArray(req.params.slug)
        ? req.params.slug[0]
        : req.params.slug;
      const reactionType = req.body?.reactionType || "like";
      const result = await this.caseStudyService.reactToCaseStudy(
        slug,
        reactionType
      );

      this.sendResponse(
        req,
        res,
        "Reaction recorded successfully",
        HTTPStatusCode.OK,
        result
      );
    } catch (error) {
      next(error);
    }
  }
}
