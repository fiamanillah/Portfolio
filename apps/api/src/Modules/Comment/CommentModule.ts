// src/Modules/Comment/CommentModule.ts
import { BaseModule } from "@/core/BaseModule";
import { AppLogger } from "@workspace/logger";
import { validateRequest } from "@/middleware/validation";
import { authenticate, optionalAuth, requireRole } from "@/middleware/auth";
import { Role } from "@workspace/db";
import { CommentService } from "./comment.service";
import { CommentController } from "./comment.controller";
import {
  createCommentSchema,
  updateCommentStatusSchema,
  reportCommentSchema,
  resolveCommentReportSchema,
  listPublicCommentsQuerySchema,
  listAdminCommentsQuerySchema,
  listAdminReportsQuerySchema,
  bulkCommentStatusSchema,
  bulkCommentDeleteSchema,
} from "./CommentDTO";

export class CommentModule extends BaseModule {
  public name: string = "CommentModule";
  public version: string = "1.0.0";
  public basePath: string = "/comments/v1/";
  public dependencies?: string[] | undefined;

  protected logger = new AppLogger("CommentModule");

  protected async setupUseCases(): Promise<void> {
    const prisma = this.context.getService("prisma");
    const commentService = new CommentService(prisma);
    this.registerService("CommentService", commentService);
  }

  protected async setupControllers(): Promise<void> {
    const commentService = this.getService<CommentService>("CommentService");
    this.registerController("CommentController", new CommentController(commentService));
  }

  protected async setupRoutes(): Promise<void> {
    const controller = this.getController<CommentController>("CommentController");

    // Guard for admin/moderation endpoints
    const adminGuard = [
      authenticate,
      requireRole(Role.ADMIN, Role.MODERATOR),
    ];

    // =========================================================================
    // 1. PUBLIC DISCOVERY & ENGAGEMENT ROUTES
    // =========================================================================

    // GET /comments/v1/public/post/:slug - Get comments for blog post
    this.router.get(
      "/public/post/:slug",
      optionalAuth,
      validateRequest({ query: listPublicCommentsQuerySchema }),
      controller.getPublicComments.bind(controller)
    );

    // POST /comments/v1/public/post/:slug - Create comment or reply
    this.router.post(
      "/public/post/:slug",
      optionalAuth,
      validateRequest({ body: createCommentSchema }),
      controller.createComment.bind(controller)
    );

    // POST /comments/v1/public/:id/react - Toggle reaction on comment
    this.router.post(
      "/public/:id/react",
      optionalAuth,
      controller.toggleReaction.bind(controller)
    );

    // POST /comments/v1/public/:id/report - Report comment
    this.router.post(
      "/public/:id/report",
      optionalAuth,
      validateRequest({ body: reportCommentSchema }),
      controller.reportComment.bind(controller)
    );

    // DELETE /comments/v1/public/:id - Delete own comment
    this.router.delete(
      "/public/:id",
      authenticate,
      controller.deleteOwnComment.bind(controller)
    );

    // =========================================================================
    // 2. ADMIN MODERATION & MANAGEMENT ROUTES (RBAC Protected)
    // =========================================================================

    // GET /comments/v1/admin/stats - Moderation statistics
    this.router.get(
      "/admin/stats",
      ...adminGuard,
      controller.getStats.bind(controller)
    );

    // GET /comments/v1/admin/comments - Paginated searchable comments list
    this.router.get(
      "/admin/comments",
      ...adminGuard,
      validateRequest({ query: listAdminCommentsQuerySchema }),
      controller.getAdminComments.bind(controller)
    );

    // GET /comments/v1/admin/comments/:id - Get single comment with reports
    this.router.get(
      "/admin/comments/:id",
      ...adminGuard,
      controller.getAdminCommentById.bind(controller)
    );

    // PATCH /comments/v1/admin/comments/:id/status - Update comment status / pin
    this.router.patch(
      "/admin/comments/:id/status",
      ...adminGuard,
      validateRequest({ body: updateCommentStatusSchema }),
      controller.updateCommentStatus.bind(controller)
    );

    // DELETE /comments/v1/admin/comments/:id - Admin permanent delete
    this.router.delete(
      "/admin/comments/:id",
      ...adminGuard,
      controller.deleteCommentAdmin.bind(controller)
    );

    // POST /comments/v1/admin/comments/bulk-status - Bulk status change
    this.router.post(
      "/admin/comments/bulk-status",
      ...adminGuard,
      validateRequest({ body: bulkCommentStatusSchema }),
      controller.bulkUpdateStatus.bind(controller)
    );

    // POST /comments/v1/admin/comments/bulk-delete - Bulk delete
    this.router.post(
      "/admin/comments/bulk-delete",
      ...adminGuard,
      validateRequest({ body: bulkCommentDeleteSchema }),
      controller.bulkDelete.bind(controller)
    );

    // GET /comments/v1/admin/reports - List flagged comments reports queue
    this.router.get(
      "/admin/reports",
      ...adminGuard,
      validateRequest({ query: listAdminReportsQuerySchema }),
      controller.getAdminReports.bind(controller)
    );

    // PATCH /comments/v1/admin/reports/:id - Resolve report with action
    this.router.patch(
      "/admin/reports/:id",
      ...adminGuard,
      validateRequest({ body: resolveCommentReportSchema }),
      controller.resolveReport.bind(controller)
    );

    // DELETE /comments/v1/admin/reports/:id - Delete report record
    this.router.delete(
      "/admin/reports/:id",
      ...adminGuard,
      controller.deleteReport.bind(controller)
    );

    this.logger.info("✔ Comment routes configured (/comments/v1/*)");
  }
}
