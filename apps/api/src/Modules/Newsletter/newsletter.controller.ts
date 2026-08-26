// src/Modules/Newsletter/newsletter.controller.ts
import { Request, Response, NextFunction } from "express";
import { BaseController } from "@/core/BaseController";
import { HTTPStatusCode } from "@/types/HTTPStatusCode";
import { NewsletterService } from "./newsletter.service";
import type {
  ListNewslettersQueryDTO,
  ListNewsletterLogsQueryDTO,
} from "@workspace/shared";

export class NewsletterController extends BaseController {
  constructor(private newsletterService: NewsletterService) {
    super();
  }

  private getId(req: Request): string {
    return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  }

  /**
   * GET /newsletter/v1/stats
   */
  public async getStats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = await this.newsletterService.getStats();
      this.sendResponse(
        req,
        res,
        "Newsletter statistics retrieved successfully",
        HTTPStatusCode.OK,
        data
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /newsletter/v1
   */
  public async list(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = (req.validatedQuery || req.query) as ListNewslettersQueryDTO;
      const result = await this.newsletterService.list(query);
      this.sendPaginatedResponse(
        req,
        res,
        result.pagination,
        "Newsletters retrieved successfully",
        result.items
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /newsletter/v1/calculate-recipients
   */
  public async calculateRecipients(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = await this.newsletterService.calculateRecipients(req.body);
      this.sendResponse(
        req,
        res,
        "Recipients calculated successfully",
        HTTPStatusCode.OK,
        data
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /newsletter/v1/spam-check
   */
  public async spamCheck(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = this.newsletterService.spamCheck(req.body);
      this.sendResponse(
        req,
        res,
        "Spam and deliverability analysis completed",
        HTTPStatusCode.OK,
        data
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /newsletter/v1/send-test
   */
  public async sendTest(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data = await this.newsletterService.sendTest(req.body);
      this.sendResponse(
        req,
        res,
        `Test newsletter sent to ${data.successful} recipient(s).`,
        HTTPStatusCode.OK,
        data
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /newsletter/v1
   */
  public async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const payload = req.body;
      const data = await this.newsletterService.create(payload);
      this.sendResponse(
        req,
        res,
        "Newsletter created successfully",
        HTTPStatusCode.CREATED,
        data
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /newsletter/v1/:id
   */
  public async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = this.getId(req);
      const data = await this.newsletterService.getById(id);
      this.sendResponse(
        req,
        res,
        "Newsletter retrieved successfully",
        HTTPStatusCode.OK,
        data
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /newsletter/v1/:id
   */
  public async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = this.getId(req);
      const payload = req.body;
      const data = await this.newsletterService.update(id, payload);
      this.sendResponse(
        req,
        res,
        "Newsletter updated successfully",
        HTTPStatusCode.OK,
        data
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /newsletter/v1/:id
   */
  public async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = this.getId(req);
      const data = await this.newsletterService.delete(id);
      this.sendResponse(
        req,
        res,
        "Newsletter deleted successfully",
        HTTPStatusCode.OK,
        data
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /newsletter/v1/:id/schedule
   */
  public async schedule(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = this.getId(req);
      const payload = req.body;
      const data = await this.newsletterService.schedule(id, payload);
      this.sendResponse(
        req,
        res,
        "Newsletter scheduled successfully",
        HTTPStatusCode.OK,
        data
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /newsletter/v1/:id/send
   */
  public async sendNow(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = this.getId(req);
      const data = await this.newsletterService.sendNow(id);
      this.sendResponse(
        req,
        res,
        "Newsletter dispatch initiated",
        HTTPStatusCode.OK,
        data
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /newsletter/v1/:id/cancel
   */
  public async cancel(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = this.getId(req);
      const data = await this.newsletterService.cancel(id);
      this.sendResponse(
        req,
        res,
        "Newsletter schedule cancelled",
        HTTPStatusCode.OK,
        data
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /newsletter/v1/:id/duplicate
   */
  public async duplicate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = this.getId(req);
      const data = await this.newsletterService.duplicate(id);
      this.sendResponse(
        req,
        res,
        "Newsletter duplicated successfully",
        HTTPStatusCode.CREATED,
        data
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /newsletter/v1/:id/sync-plunk
   */
  public async syncWithPlunk(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = this.getId(req);
      const data = await this.newsletterService.syncWithPlunk(id);
      this.sendResponse(
        req,
        res,
        "Newsletter synced with Plunk",
        HTTPStatusCode.OK,
        data
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /newsletter/v1/:id/logs
   */
  public async getLogs(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = this.getId(req);
      const query = (req.validatedQuery || req.query) as ListNewsletterLogsQueryDTO;
      const result = await this.newsletterService.getLogs(
        id,
        query
      );
      this.sendPaginatedResponse(
        req,
        res,
        result.pagination,
        "Delivery logs retrieved successfully",
        result.items
      );
    } catch (error) {
      next(error);
    }
  }
}
