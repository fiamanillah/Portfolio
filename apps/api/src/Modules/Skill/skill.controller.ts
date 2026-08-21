// src/Modules/Skill/skill.controller.ts
import { Request, Response, NextFunction } from "express";
import { BaseController } from "@/core/BaseController";
import { SkillService } from "./skill.service";
import { HTTPStatusCode } from "@/types/HTTPStatusCode";
import {
  CreateSkillDTO,
  UpdateSkillDTO,
  ListSkillsQueryDTO,
  PublicSkillQueryDTO,
  BulkSkillStatusDTO,
  BulkSkillDeleteDTO,
  ReorderSkillsDTO,
  CreateSkillCategoryDTO,
  UpdateSkillCategoryDTO,
  ReorderSkillCategoriesDTO,
} from "./SkillDTO";

export class SkillController extends BaseController {
  constructor(private skillService: SkillService) {
    super();
  }

  // =========================================================================
  // PUBLIC DISCOVERY ENDPOINTS
  // =========================================================================

  /**
   * GET /skills/v1/public - Fetch published skills grouped by categories for web/SSR
   */
  public async getPublicSkills(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = (req as any).validatedQuery || req.query;
      const sections = await this.skillService.getPublicSkills(
        query as PublicSkillQueryDTO
      );
      this.sendResponse(
        req,
        res,
        "Public skill sections retrieved successfully",
        HTTPStatusCode.OK,
        sections
      );
    } catch (error) {
      next(error);
    }
  }

  // =========================================================================
  // ADMIN DASHBOARD ENDPOINTS
  // =========================================================================

  /**
   * GET /skills/v1/admin/stats - Retrieve aggregated overview KPIs & metrics
   */
  public async getStats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await this.skillService.getStats();
      this.sendResponse(
        req,
        res,
        "Skill statistics retrieved successfully",
        HTTPStatusCode.OK,
        stats
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /skills/v1/admin/list - List skills with filters & pagination
   */
  public async getAllAdmin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = (req as any).validatedQuery || req.query;
      const result = await this.skillService.getAllAdmin(
        query as ListSkillsQueryDTO
      );
      this.sendPaginatedResponse(
        req,
        res,
        result.pagination,
        "Admin skills retrieved successfully",
        result.data
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /skills/v1/admin/:id - Get skill by ID
   */
  public async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const skill = await this.skillService.getById(id as string);
      this.sendResponse(
        req,
        res,
        "Skill retrieved successfully",
        HTTPStatusCode.OK,
        skill
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /skills/v1/admin/create - Create new skill
   */
  public async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const payload: CreateSkillDTO = req.body;
      const skill = await this.skillService.create(payload);
      this.sendResponse(
        req,
        res,
        "Skill created successfully",
        HTTPStatusCode.CREATED,
        skill
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /skills/v1/admin/:id - Update skill
   */
  public async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const payload: UpdateSkillDTO = req.body;
      const skill = await this.skillService.update(id as string, payload);
      this.sendResponse(
        req,
        res,
        "Skill updated successfully",
        HTTPStatusCode.OK,
        skill
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /skills/v1/admin/:id - Delete skill
   */
  public async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.skillService.delete(id as string);
      this.sendResponse(
        req,
        res,
        "Skill deleted successfully",
        HTTPStatusCode.OK,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /skills/v1/admin/:id/duplicate - Duplicate skill
   */
  public async duplicate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const skill = await this.skillService.duplicate(id as string);
      this.sendResponse(
        req,
        res,
        "Skill duplicated successfully",
        HTTPStatusCode.CREATED,
        skill
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /skills/v1/admin/bulk-status - Bulk update status
   */
  public async bulkUpdateStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const payload: BulkSkillStatusDTO = req.body;
      const result = await this.skillService.bulkUpdateStatus(payload);
      this.sendResponse(
        req,
        res,
        `Status updated for ${result.count} skills`,
        HTTPStatusCode.OK,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /skills/v1/admin/bulk-delete - Bulk delete skills
   */
  public async bulkDelete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const payload: BulkSkillDeleteDTO = req.body;
      const result = await this.skillService.bulkDelete(payload);
      this.sendResponse(
        req,
        res,
        `Successfully deleted ${result.count} skills`,
        HTTPStatusCode.OK,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /skills/v1/admin/reorder - Reorder skills
   */
  public async reorder(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const payload: ReorderSkillsDTO = req.body;
      const result = await this.skillService.reorder(payload);
      this.sendResponse(
        req,
        res,
        "Skills reordered successfully",
        HTTPStatusCode.OK,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /skills/v1/admin/seed-default - Seed default categories and skills
   */
  public async seedDefault(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await this.skillService.seedDefault();
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
  // CATEGORY MANAGEMENT ENDPOINTS
  // =========================================================================

  /**
   * GET /skills/v1/admin/categories - List all categories
   */
  public async listCategories(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const categories = await this.skillService.listCategories();
      this.sendResponse(
        req,
        res,
        "Skill categories retrieved successfully",
        HTTPStatusCode.OK,
        categories
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /skills/v1/admin/categories/:id - Get category by ID
   */
  public async getCategoryById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const category = await this.skillService.getCategoryById(id as string);
      this.sendResponse(
        req,
        res,
        "Category retrieved successfully",
        HTTPStatusCode.OK,
        category
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /skills/v1/admin/categories - Create category
   */
  public async createCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const payload: CreateSkillCategoryDTO = req.body;
      const category = await this.skillService.createCategory(payload);
      this.sendResponse(
        req,
        res,
        "Category created successfully",
        HTTPStatusCode.CREATED,
        category
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /skills/v1/admin/categories/:id - Update category
   */
  public async updateCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const payload: UpdateSkillCategoryDTO = req.body;
      const category = await this.skillService.updateCategory(id as string, payload);
      this.sendResponse(
        req,
        res,
        "Category updated successfully",
        HTTPStatusCode.OK,
        category
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /skills/v1/admin/categories/:id - Delete category
   */
  public async deleteCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.skillService.deleteCategory(id as string);
      this.sendResponse(
        req,
        res,
        "Category deleted successfully",
        HTTPStatusCode.OK,
        result
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /skills/v1/admin/categories/reorder - Reorder categories
   */
  public async reorderCategories(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const payload: ReorderSkillCategoriesDTO = req.body;
      const result = await this.skillService.reorderCategories(payload);
      this.sendResponse(
        req,
        res,
        "Categories reordered successfully",
        HTTPStatusCode.OK,
        result
      );
    } catch (error) {
      next(error);
    }
  }
}
