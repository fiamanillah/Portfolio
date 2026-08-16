// src/Modules/Subscriber/subscriber.controller.ts
import { Request, Response, NextFunction } from "express"
import { BaseController } from "@/core/BaseController"
import { SubscriberService, SubscriberPayload } from "./subscriber.service"
import { BadRequestError } from "@/core/errors/AppError"
import { HTTPStatusCode } from "@/types/HTTPStatusCode"

export class SubscriberController extends BaseController {
  constructor(private subscriberService: SubscriberService) {
    super()
  }

  /**
   * POST /subscriber/v1/subscribe — Public subscription endpoint with 5-stage defense system
   */
  public async subscribe(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const payload = req.body as SubscriberPayload
      const clientIp =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.socket.remoteAddress

      // ── Stage 2: Honeypot Silent Trap Check ────────────────────────
      if (this.subscriberService.isHoneypotTriggered(payload.hp_field)) {
        // Return fake success response immediately to stop bot retries
        this.sendResponse(req, res, "Thank you for subscribing to updates!")
        return
      }

      // ── Stage 3: Turnstile CAPTCHA Verification ────────────────────
      const isCaptchaValid = await this.subscriberService.verifyTurnstileToken(
        payload.captchaToken,
        clientIp
      )

      if (!isCaptchaValid) {
        throw new BadRequestError(
          "Security check failed. Please refresh and try again."
        )
      }

      // ── Stage 4 & 5: Sanitization, Plunk Verification, Persistence & Sync ──
      const result = await this.subscriberService.subscribe({
        email: payload.email,
        name: payload.name,
        source: payload.source || "hero_section",
      })

      this.sendResponse(
        req,
        res,
        result.message || "Thank you for subscribing!",
        HTTPStatusCode.OK,
        result
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /subscriber/v1/unsubscribe — Public unsubscription endpoint (by email in body)
   */
  public async unsubscribe(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, hp_field, captchaToken } = req.body
      const clientIp =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.socket.remoteAddress

      // Honeypot trap check
      if (this.subscriberService.isHoneypotTriggered(hp_field)) {
        this.sendResponse(req, res, "You have been unsubscribed.")
        return
      }

      // Turnstile verification
      const isCaptchaValid = await this.subscriberService.verifyTurnstileToken(
        captchaToken,
        clientIp
      )
      if (!isCaptchaValid) {
        throw new BadRequestError(
          "Security check failed. Please refresh and try again."
        )
      }

      const result = await this.subscriberService.unsubscribe(email)
      this.sendResponse(
        req,
        res,
        result.message || "You have been unsubscribed.",
        HTTPStatusCode.OK,
        result
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /subscriber/v1/unsubscribe?token= — One-click unsubscribe from email link
   */
  public async unsubscribeByToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.query.token as string
      if (!token) {
        throw new BadRequestError("Missing unsubscribe token.")
      }
      const result = await this.subscriberService.unsubscribeByToken(token)
      this.sendResponse(
        req,
        res,
        result.message || "You have been unsubscribed.",
        HTTPStatusCode.OK,
        result
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /subscriber/v1/change-email — Change subscription email address
   */
  public async changeEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { hp_field, captchaToken } = req.body
      const clientIp =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.socket.remoteAddress

      // Honeypot trap check
      if (this.subscriberService.isHoneypotTriggered(hp_field)) {
        this.sendResponse(req, res, "Subscription email successfully updated.")
        return
      }

      // Turnstile verification
      const isCaptchaValid = await this.subscriberService.verifyTurnstileToken(
        captchaToken,
        clientIp
      )
      if (!isCaptchaValid) {
        throw new BadRequestError(
          "Security check failed. Please refresh and try again."
        )
      }

      const result = await this.subscriberService.changeSubscriptionEmail(
        req.body
      )
      this.sendResponse(
        req,
        res,
        `Subscription email successfully updated to ${result.newEmail}.`,
        HTTPStatusCode.OK,
        result
      )
    } catch (error) {
      next(error)
    }
  }

  /**
  /**
   * GET /subscriber/v1/list or /subscriber/v1/admin/list — CRUD Read All (Paginated, Searched, Filtered, Sorted)
   */
  public async getAllSubscribers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt((req.query.page as string) || "1")
      const limit = parseInt((req.query.limit as string) || "20")
      const search = req.query.search as string | undefined
      const status = req.query.status as string | undefined
      const source = req.query.source as string | undefined
      const sortBy = req.query.sortBy as string | undefined
      const sortOrder = req.query.sortOrder as "asc" | "desc" | undefined

      const result = await this.subscriberService.getAllSubscribers({
        page,
        limit,
        search,
        status,
        source,
        sortBy,
        sortOrder,
      })

      res.status(HTTPStatusCode.OK).json({
        success: true,
        message: "Subscribers retrieved successfully.",
        data: result.data,
        pagination: result.pagination,
        stats: result.stats,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /subscriber/v1/admin/stats — Get KPI metrics for subscriber audience
   */
  public async getStats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await this.subscriberService.getSubscriberStats()
      this.sendResponse(
        req,
        res,
        "Subscriber statistics retrieved successfully.",
        HTTPStatusCode.OK,
        stats
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /subscriber/v1/admin/create — Admin manually create a subscriber
   */
  public async adminCreateSubscriber(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const created = await this.subscriberService.adminCreateSubscriber(
        req.body
      )
      this.sendResponse(
        req,
        res,
        `Subscriber ${created.email} added successfully.`,
        HTTPStatusCode.CREATED,
        created
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /subscriber/v1/:id — CRUD Read One
   */
  public async getSubscriberById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string
      const subscriber = await this.subscriberService.getSubscriberById(id)
      this.sendResponse(
        req,
        res,
        "Subscriber retrieved successfully.",
        HTTPStatusCode.OK,
        subscriber
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * PATCH /subscriber/v1/:id — CRUD Update
   */
  public async updateSubscriber(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string
      const updated = await this.subscriberService.updateSubscriber(
        id,
        req.body
      )
      this.sendResponse(
        req,
        res,
        "Subscriber updated successfully.",
        HTTPStatusCode.OK,
        updated
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * DELETE /subscriber/v1/:id — CRUD Delete
   */
  public async deleteSubscriber(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string
      await this.subscriberService.deleteSubscriber(id)
      this.sendResponse(req, res, "Subscriber deleted successfully.")
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /subscriber/v1/admin/bulk-status — Bulk update status
   */
  public async bulkUpdateStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { subscriberIds, status } = req.body
      const result = await this.subscriberService.bulkUpdateStatus(
        subscriberIds,
        status
      )
      this.sendResponse(
        req,
        res,
        `Successfully updated ${result.count} subscribers to '${status}'.`,
        HTTPStatusCode.OK,
        result
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /subscriber/v1/admin/bulk-delete — Bulk delete subscribers
   */
  public async bulkDelete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { subscriberIds } = req.body
      const result =
        await this.subscriberService.bulkDeleteSubscribers(subscriberIds)
      this.sendResponse(
        req,
        res,
        `Successfully deleted ${result.count} subscribers.`,
        HTTPStatusCode.OK,
        result
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /subscriber/v1/admin/:id/resend — Resend welcome email
   */
  public async resendWelcomeEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string
      const result = await this.subscriberService.resendWelcomeEmail(id)
      this.sendResponse(
        req,
        res,
        `Welcome email resent to ${result.email}.`,
        HTTPStatusCode.OK,
        result
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /subscriber/v1/admin/export — Export subscribers
   */
  public async exportSubscribers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const search = req.query.search as string | undefined
      const status = req.query.status as string | undefined
      const source = req.query.source as string | undefined
      const sortBy = req.query.sortBy as string | undefined
      const sortOrder = req.query.sortOrder as "asc" | "desc" | undefined

      const data = await this.subscriberService.exportSubscribers({
        search,
        status,
        source,
        sortBy,
        sortOrder,
      })

      this.sendResponse(
        req,
        res,
        "Subscribers exported successfully.",
        HTTPStatusCode.OK,
        data
      )
    } catch (error) {
      next(error)
    }
  }
}
