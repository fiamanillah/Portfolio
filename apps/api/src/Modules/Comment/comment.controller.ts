// src/Modules/Comment/comment.controller.ts
import { Request, Response, NextFunction } from "express"
import { BaseController } from "@/core/BaseController"
import { AppLogger } from "@workspace/logger"
import { HTTPStatusCode } from "@/types/HTTPStatusCode"
import { CommentService } from "./comment.service"
import {
  CreateCommentDTO,
  UpdateCommentStatusDTO,
  ReportCommentDTO,
  ResolveCommentReportDTO,
  ListPublicCommentsQueryDTO,
  ListAdminCommentsQueryDTO,
  ListAdminReportsQueryDTO,
  BulkCommentStatusDTO,
  BulkCommentDeleteDTO,
} from "./CommentDTO"

export class CommentController extends BaseController {
  protected logger = new AppLogger("CommentController")

  constructor(private readonly commentService: CommentService) {
    super()
  }

  private getParam(param: string | string[] | undefined): string {
    if (Array.isArray(param)) return param[0] || ""
    return param || ""
  }

  // =========================================================================
  // 1. PUBLIC ACTIONS
  // =========================================================================

  /**
   * GET /comments/v1/public/post/:slug - Get comments for blog post
   */
  public async getPublicComments(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const slug = this.getParam(req.params.slug)
      const query = (req.validatedQuery ||
        req.query) as ListPublicCommentsQueryDTO
      const currentUserId = req.user?.id

      const result = await this.commentService.getPublicComments(
        slug,
        query,
        currentUserId
      )
      this.sendResponse(
        req,
        res,
        "Comments retrieved successfully",
        HTTPStatusCode.OK,
        result
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /comments/v1/public/post/:slug - Create comment or reply
   */
  public async createComment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const slug = this.getParam(req.params.slug)
      const body = (req.validatedBody || req.body) as CreateCommentDTO
      const user = req.user
      const ipAddress =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.socket.remoteAddress ||
        req.ip ||
        ""
      const userAgent = req.headers["user-agent"]

      const comment = await this.commentService.createComment(
        { ...body, slug: slug || body.slug },
        user,
        ipAddress,
        userAgent
      )

      this.sendCreatedResponse(req, res, comment, "Comment posted successfully")
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /comments/v1/public/:id/react - Toggle reaction on comment
   */
  public async toggleReaction(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const commentId = this.getParam(req.params.id)
      const reactionType = req.body?.reactionType || "like"
      const user = req.user
      const ipAddress =
        (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress

      const result = await this.commentService.toggleCommentReaction(
        commentId,
        user,
        reactionType,
        ipAddress
      )

      this.sendResponse(req, res, "Reaction updated", HTTPStatusCode.OK, result)
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /comments/v1/public/:id/report - Report comment
   */
  public async reportComment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const commentId = this.getParam(req.params.id)
      const body = (req.validatedBody || req.body) as ReportCommentDTO
      const user = req.user

      const result = await this.commentService.reportComment(
        commentId,
        body,
        user
      )
      this.sendResponse(req, res, result.message, HTTPStatusCode.OK, result)
    } catch (error) {
      next(error)
    }
  }

  /**
   * DELETE /comments/v1/public/:id - Delete own comment
   */
  public async deleteOwnComment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const commentId = this.getParam(req.params.id)
      const userId = req.user!.id

      const result = await this.commentService.deleteOwnComment(
        commentId,
        userId
      )
      this.sendResponse(
        req,
        res,
        "Comment deleted successfully",
        HTTPStatusCode.OK,
        result
      )
    } catch (error) {
      next(error)
    }
  }

  // =========================================================================
  // 2. ADMIN MODERATION ACTIONS
  // =========================================================================

  /**
   * GET /comments/v1/admin/stats - Moderation overview metrics
   */
  public async getStats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await this.commentService.getModerationStats()
      this.sendResponse(
        req,
        res,
        "Moderation stats retrieved",
        HTTPStatusCode.OK,
        stats
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /comments/v1/admin/comments - List comments with filters
   */
  public async getAdminComments(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = (req.validatedQuery ||
        req.query) as ListAdminCommentsQueryDTO
      const result = await this.commentService.getAdminComments(query)
      this.sendPaginatedResponse(
        req,
        res,
        {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
          hasNext: result.page < result.totalPages,
          hasPrevious: result.page > 1,
        },
        "Comments list retrieved",
        result.comments
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /comments/v1/admin/comments/:id - Single comment details + reports
   */
  public async getAdminCommentById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = this.getParam(req.params.id)
      const comment = await this.commentService.getCommentByIdAdmin(id)
      this.sendResponse(
        req,
        res,
        "Comment details retrieved",
        HTTPStatusCode.OK,
        comment
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * PATCH /comments/v1/admin/comments/:id/status - Update comment status or pin
   */
  public async updateCommentStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = this.getParam(req.params.id)
      const body = (req.validatedBody || req.body) as UpdateCommentStatusDTO
      const updated = await this.commentService.updateCommentStatus(id, body)
      this.sendResponse(
        req,
        res,
        "Comment status updated successfully",
        HTTPStatusCode.OK,
        updated
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * DELETE /comments/v1/admin/comments/:id - Delete comment permanently
   */
  public async deleteCommentAdmin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = this.getParam(req.params.id)
      const result = await this.commentService.deleteCommentAdmin(id)
      this.sendResponse(
        req,
        res,
        "Comment removed permanently",
        HTTPStatusCode.OK,
        result
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /comments/v1/admin/comments/bulk-status - Bulk change status
   */
  public async bulkUpdateStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const body = (req.validatedBody || req.body) as BulkCommentStatusDTO
      const result = await this.commentService.bulkUpdateStatus(body)
      this.sendResponse(
        req,
        res,
        `Updated ${result.count} comments`,
        HTTPStatusCode.OK,
        result
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /comments/v1/admin/comments/bulk-delete - Bulk delete comments
   */
  public async bulkDelete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const body = (req.validatedBody || req.body) as BulkCommentDeleteDTO
      const result = await this.commentService.bulkDelete(body)
      this.sendResponse(
        req,
        res,
        `Deleted ${result.count} comments`,
        HTTPStatusCode.OK,
        result
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /comments/v1/admin/reports - List flagged comment reports
   */
  public async getAdminReports(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = (req.validatedQuery ||
        req.query) as ListAdminReportsQueryDTO
      const result = await this.commentService.getAdminReports(query)
      this.sendPaginatedResponse(
        req,
        res,
        {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
          hasNext: result.page < result.totalPages,
          hasPrevious: result.page > 1,
        },
        "Reports retrieved successfully",
        result.reports
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * PATCH /comments/v1/admin/reports/:id - Resolve report with action
   */
  public async resolveReport(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = this.getParam(req.params.id)
      const body = (req.validatedBody || req.body) as ResolveCommentReportDTO
      const adminId = req.user!.id
      const result = await this.commentService.resolveReport(id, body, adminId)
      this.sendResponse(
        req,
        res,
        "Report resolution applied successfully",
        HTTPStatusCode.OK,
        result
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * DELETE /comments/v1/admin/reports/:id - Delete report record
   */
  public async deleteReport(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = this.getParam(req.params.id)
      const result = await this.commentService.deleteReport(id)
      this.sendResponse(
        req,
        res,
        "Report deleted successfully",
        HTTPStatusCode.OK,
        result
      )
    } catch (error) {
      next(error)
    }
  }
}
