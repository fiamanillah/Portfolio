// src/Modules/Experience/experience.controller.ts
import { Request, Response, NextFunction } from "express";
import { BaseController } from "@/core/BaseController";
import { ExperienceService } from "./experience.service";
import { HTTPStatusCode } from "@/types/HTTPStatusCode";
import {
  CreateExperienceDTO,
  UpdateExperienceDTO,
  ListExperiencesQueryDTO,
  PublicExperienceQueryDTO,
  BulkExperienceStatusDTO,
  BulkExperienceDeleteDTO,
  ReorderExperiencesDTO,
} from "./ExperienceDTO";

export class ExperienceController extends BaseController {
  constructor(private experienceService: ExperienceService) {
    super();
  }

  // =========================================================================
  // ADMIN DASHBOARD ENDPOINTS
  // =========================================================================

  /**
   * GET /experiences/v1/admin/stats - Retrieve aggregated overview KPIs & metrics
   */
  public async getStats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await this.experienceService.getStats();
      this.sendResponse(
        req,
        res,
        "Experience statistics retrieved successfully",
        HTTPStatusCode.OK,
        stats
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /experiences/v1/admin/list - List experiences with admin filters & pagination
   */
  public async getAllAdmin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = (req.validatedQuery || req.query) as ListExperiencesQueryDTO;
      const result = await this.experienceService.getAllAdmin(
        query
      );
      this.sendPaginatedResponse(
        req,
        res,
        result.pagination,
        "Admin experiences retrieved successfully",
        result.data
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /experiences/v1/admin/:id - Get complete experience details by ID
   */
  public async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const experience = await this.experienceService.getById(id);
      this.sendResponse(
        req,
        res,
        "Experience retrieved successfully",
        HTTPStatusCode.OK,
        experience
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /experiences/v1/admin/create - Create a new experience
   */
  public async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const payload: CreateExperienceDTO = req.body;
      const experience = await this.experienceService.create(payload);
      this.sendResponse(
        req,
        res,
        "Experience created successfully",
        HTTPStatusCode.CREATED,
        experience
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /experiences/v1/admin/:id - Update an existing experience
   */
  public async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const payload: UpdateExperienceDTO = req.body;
      const experience = await this.experienceService.update(id, payload);
      this.sendResponse(
        req,
        res,
        "Experience updated successfully",
        HTTPStatusCode.OK,
        experience
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /experiences/v1/admin/:id - Delete an experience
   */
  public async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.experienceService.delete(id);
      this.sendResponse(
        req,
        res,
        "Experience deleted successfully",
        HTTPStatusCode.OK,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /experiences/v1/admin/:id/duplicate - Duplicate an experience into draft
   */
  public async duplicate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const duplicated = await this.experienceService.duplicate(id);
      this.sendResponse(
        req,
        res,
        "Experience duplicated successfully",
        HTTPStatusCode.CREATED,
        duplicated
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /experiences/v1/admin/bulk-status - Bulk update experience statuses
   */
  public async bulkUpdateStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const payload: BulkExperienceStatusDTO = req.body;
      const result = await this.experienceService.bulkUpdateStatus(payload);
      this.sendResponse(
        req,
        res,
        `Successfully updated status for ${result.count} experiences`,
        HTTPStatusCode.OK,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /experiences/v1/admin/bulk-delete - Bulk delete experiences
   */
  public async bulkDelete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const payload: BulkExperienceDeleteDTO = req.body;
      const result = await this.experienceService.bulkDelete(payload);
      this.sendResponse(
        req,
        res,
        `Successfully deleted ${result.count} experiences`,
        HTTPStatusCode.OK,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /experiences/v1/admin/reorder - Reorder experiences
   */
  public async reorder(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const payload: ReorderExperiencesDTO = req.body;
      const result = await this.experienceService.reorder(payload);
      this.sendResponse(
        req,
        res,
        "Experiences reordered successfully",
        HTTPStatusCode.OK,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /experiences/v1/admin/seed-default - Re-seed default experiences
   */
  public async seedDefault(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await this.experienceService.seedDefault();
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
  // PUBLIC DISCOVERY ENDPOINTS
  // =========================================================================

  /**
   * GET /experiences/v1/public - List published experiences for portfolio website
   */
  public async getPublicExperiences(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = (req.validatedQuery || req.query) as PublicExperienceQueryDTO;
      const experiences = await this.experienceService.getPublicExperiences(
        query
      );
      this.sendResponse(
        req,
        res,
        "Public experiences retrieved successfully",
        HTTPStatusCode.OK,
        experiences
      );
    } catch (error) {
      next(error);
    }
  }
}
