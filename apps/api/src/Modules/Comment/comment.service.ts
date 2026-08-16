// src/Modules/Comment/comment.service.ts
import {
  PrismaClient,
  CommentStatus,
  CommentReportReason,
  CommentReportStatus,
  Role,
} from "@workspace/db";
import { AppLogger } from "@workspace/logger";
import {
  NotFoundError,
  BadRequestError,
  AuthorizationError,
} from "@/core/errors/AppError";
import type {
  CreateCommentDTO,
  UpdateCommentStatusDTO,
  ReportCommentDTO,
  ResolveCommentReportDTO,
  ListPublicCommentsQueryDTO,
  ListAdminCommentsQueryDTO,
  ListAdminReportsQueryDTO,
  BulkCommentStatusDTO,
  BulkCommentDeleteDTO,
  BlogComment,
  CommentAuthor,
  CommentAdminListItemDTO,
  CommentReportDTO,
  CommentModerationStatsDTO,
  PaginatedCommentsResponse,
  PaginatedAdminCommentsResponse,
  PaginatedAdminReportsResponse,
} from "./CommentDTO";

export class CommentService {
  private logger = new AppLogger("CommentService");

  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Helper to format author details from User relation or guest fields
   */
  private formatAuthor(author: any, guestName?: string | null, guestEmail?: string | null, guestAvatar?: string | null): CommentAuthor {
    if (author) {
      return {
        id: author.id,
        name: author.name,
        username: author.username,
        email: author.email,
        avatar: author.avatar || null,
        role: author.role || null,
        badge: author.badge || (author.role === Role.ADMIN ? "Admin" : author.role === Role.AUTHOR ? "Author" : null),
      };
    }

    return {
      name: guestName || "Anonymous Guest",
      email: guestEmail || undefined,
      avatar: guestAvatar || "/fi.png",
      badge: "Guest",
      role: "Reader",
    };
  }

  /**
   * Helper to format a single comment entity to BlogComment DTO
   */
  private formatComment(
    comment: any,
    currentUserId?: string,
    userReactionsSet?: Set<string>,
    postSlug?: string,
    postTitle?: string
  ): BlogComment {
    const isLiked = currentUserId && userReactionsSet
      ? userReactionsSet.has(comment.id)
      : false;

    const formattedReplies: BlogComment[] = (comment.replies || []).map((reply: any) => {
      const isReplyLiked = currentUserId && userReactionsSet
        ? userReactionsSet.has(reply.id)
        : false;

      return {
        id: reply.id,
        postId: reply.postId,
        postSlug: postSlug || comment.post?.slug || "",
        postTitle: postTitle || comment.post?.title || "",
        slug: postSlug || comment.post?.slug || "",
        author: this.formatAuthor(reply.author, reply.guestName, reply.guestEmail, reply.guestAvatar),
        content: reply.content,
        status: reply.status,
        createdAt: reply.createdAt.toISOString(),
        updatedAt: reply.updatedAt.toISOString(),
        likes: reply.likesCount || 0,
        isLiked: isReplyLiked,
        parentId: reply.parentId,
        isPinned: reply.isPinned,
        reportsCount: reply._count?.reports || (reply.reports ? reply.reports.length : 0),
      };
    });

    return {
      id: comment.id,
      postId: comment.postId,
      postSlug: postSlug || comment.post?.slug || "",
      postTitle: postTitle || comment.post?.title || "",
      slug: postSlug || comment.post?.slug || "",
      author: this.formatAuthor(comment.author, comment.guestName, comment.guestEmail, comment.guestAvatar),
      content: comment.content,
      status: comment.status,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      likes: comment.likesCount || 0,
      isLiked,
      isPinned: comment.isPinned,
      parentId: comment.parentId,
      replies: formattedReplies,
      repliesCount: formattedReplies.length,
      reportsCount: comment._count?.reports || (comment.reports ? comment.reports.length : 0),
    };
  }

  // =========================================================================
  // 1. PUBLIC DISCOVERY & ENGAGEMENT METHODS
  // =========================================================================

  /**
   * Get paginated comments for a published article by slug
   */
  public async getPublicComments(
    slug: string,
    query: ListPublicCommentsQueryDTO,
    currentUserId?: string
  ): Promise<PaginatedCommentsResponse> {
    const post = await this.prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true, slug: true, title: true },
    });

    if (!post) {
      throw new NotFoundError(`Blog post with slug '${slug}' not found`);
    }

    const page: number = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit: number = Number(query.limit) > 0 ? Number(query.limit) : 10;
    const skip: number = (page - 1) * limit;

    // Build sort order
    let orderBy: any = [{ isPinned: "desc" }];
    if (query.sortBy === "newest") {
      orderBy.push({ createdAt: "desc" });
    } else if (query.sortBy === "oldest") {
      orderBy.push({ createdAt: "asc" });
    } else if (query.sortBy === "top") {
      orderBy.push({ likesCount: "desc" }, { createdAt: "desc" });
    } else {
      orderBy.push({ createdAt: "desc" });
    }

    // Fetch top-level comments (parentId is null)
    const [totalTopLevel, comments] = await Promise.all([
      this.prisma.comment.count({
        where: {
          postId: post.id,
          parentId: null,
          status: CommentStatus.APPROVED,
        },
      }),
      this.prisma.comment.findMany({
        where: {
          postId: post.id,
          parentId: null,
          status: CommentStatus.APPROVED,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              avatar: true,
              role: true,
              badge: true,
            },
          },
          replies: {
            where: {
              status: CommentStatus.APPROVED,
            },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  email: true,
                  avatar: true,
                  role: true,
                  badge: true,
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
          _count: {
            select: {
              reports: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    // Check which comments the current user has liked
    let userReactionsSet = new Set<string>();
    if (currentUserId) {
      const allCommentIds = (comments as any[]).flatMap((c) => [
        c.id,
        ...(c.replies ? c.replies.map((r: any) => r.id) : []),
      ]);

      if (allCommentIds.length > 0) {
        const reactions = await this.prisma.commentReaction.findMany({
          where: {
            commentId: { in: allCommentIds },
            userId: currentUserId,
          },
          select: { commentId: true },
        });
        userReactionsSet = new Set(reactions.map((r) => r.commentId));
      }
    }

    const formattedComments = comments.map((c) =>
      this.formatComment(c, currentUserId, userReactionsSet, post.slug, post.title)
    );

    const totalPages = Math.ceil(totalTopLevel / limit) || 1;
    const hasMore = page < totalPages;

    return {
      comments: formattedComments,
      totalCount: totalTopLevel,
      hasMore,
      currentPage: page,
      totalPages,
    };
  }

  /**
   * Create a new top-level comment or threaded reply
   */
  public async createComment(
    dto: CreateCommentDTO,
    user?: { id: string; name: string; username: string; email: string; role?: Role; avatar?: string | null },
    ipAddress?: string,
    userAgent?: string
  ): Promise<BlogComment> {
    const post = await this.prisma.blogPost.findUnique({
      where: { slug: dto.slug },
      select: { id: true, slug: true, title: true, status: true },
    });

    if (!post) {
      throw new NotFoundError(`Blog post with slug '${dto.slug}' not found`);
    }

    // Validate parent comment if this is a reply
    if (dto.parentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: dto.parentId },
        select: { id: true, postId: true, status: true },
      });

      if (!parentComment) {
        throw new NotFoundError("Parent comment to reply to was not found");
      }

      if (parentComment.postId !== post.id) {
        throw new BadRequestError("Parent comment belongs to a different blog post");
      }
    }

    // Moderation status: Authenticated users are APPROVED by default; guests APPROVED with standard monitoring
    const status = CommentStatus.APPROVED;

    const created = await this.prisma.$transaction(async (tx) => {
      const comment = await tx.comment.create({
        data: {
          postId: post.id,
          parentId: dto.parentId || null,
          authorId: user?.id || null,
          guestName: user ? null : dto.guestName || "Anonymous Guest",
          guestEmail: user ? null : dto.guestEmail || null,
          content: dto.content,
          status,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              avatar: true,
              role: true,
              badge: true,
            },
          },
        },
      });

      // Increment commentsCount on BlogPost
      await tx.blogPost.update({
        where: { id: post.id },
        data: {
          commentsCount: { increment: 1 },
        },
      });

      return comment;
    });

    this.logger.info(`✔ Comment created on post '${post.slug}' (ID: ${created.id}, Parent: ${dto.parentId || "none"})`);

    return this.formatComment(created, user?.id, undefined, post.slug, post.title);
  }

  /**
   * Toggle reaction / like on a comment
   */
  public async toggleCommentReaction(
    commentId: string,
    user?: { id: string },
    reactionType: string = "like",
    ipAddress?: string
  ): Promise<{ likes: number; isLiked: boolean }> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, likesCount: true },
    });

    if (!comment) {
      throw new NotFoundError("Comment not found");
    }

    const userId = user?.id;

    if (!userId && !ipAddress) {
      throw new BadRequestError("User ID or IP address required to react to a comment");
    }

    // Check existing reaction
    const existing = await this.prisma.commentReaction.findFirst({
      where: userId
        ? { commentId, userId, reactionType }
        : { commentId, ipAddress, reactionType },
    });

    if (existing) {
      // Remove reaction
      await this.prisma.$transaction([
        this.prisma.commentReaction.delete({
          where: { id: existing.id },
        }),
        this.prisma.comment.update({
          where: { id: commentId },
          data: {
            likesCount: { decrement: 1 },
          },
        }),
      ]);

      const updated = await this.prisma.comment.findUnique({
        where: { id: commentId },
        select: { likesCount: true },
      });

      return {
        likes: Math.max(0, updated?.likesCount || 0),
        isLiked: false,
      };
    } else {
      // Add reaction
      await this.prisma.$transaction([
        this.prisma.commentReaction.create({
          data: {
            commentId,
            userId: userId || null,
            ipAddress: ipAddress || null,
            reactionType,
          },
        }),
        this.prisma.comment.update({
          where: { id: commentId },
          data: {
            likesCount: { increment: 1 },
          },
        }),
      ]);

      const updated = await this.prisma.comment.findUnique({
        where: { id: commentId },
        select: { likesCount: true },
      });

      return {
        likes: updated?.likesCount || 1,
        isLiked: true,
      };
    }
  }

  /**
   * Report an inappropriate comment
   */
  public async reportComment(
    commentId: string,
    dto: ReportCommentDTO,
    user?: { id: string; name: string; email: string },
  ): Promise<{ reportId: string; message: string }> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, status: true },
    });

    if (!comment) {
      throw new NotFoundError("Comment not found");
    }

    // Prevent duplicate spam reporting by same user
    if (user?.id) {
      const existingReport = await this.prisma.commentReport.findFirst({
        where: {
          commentId,
          reporterId: user.id,
          status: CommentReportStatus.PENDING,
        },
      });

      if (existingReport) {
        return {
          reportId: existingReport.id,
          message: "You have already reported this comment. Our moderation team is reviewing it.",
        };
      }
    }

    const report = await this.prisma.commentReport.create({
      data: {
        commentId,
        reporterId: user?.id || null,
        reporterName: user?.name || dto.reporterName || "Anonymous Reader",
        reporterEmail: user?.email || dto.reporterEmail || null,
        reason: dto.reason as CommentReportReason,
        details: dto.details || null,
        status: CommentReportStatus.PENDING,
      },
    });

    this.logger.info(`⚠ Comment ${commentId} reported for '${dto.reason}' (Report ID: ${report.id})`);

    return {
      reportId: report.id,
      message: "Thank you for reporting. Our moderation team has been notified and will review this comment promptly.",
    };
  }

  /**
   * Delete user's own comment
   */
  public async deleteOwnComment(commentId: string, userId: string): Promise<{ success: boolean; id: string }> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        authorId: true,
        postId: true,
        _count: {
          select: { replies: true },
        },
      },
    });

    if (!comment) {
      throw new NotFoundError("Comment not found");
    }

    if (comment.authorId !== userId) {
      throw new AuthorizationError("You can only delete your own comments");
    }

    await this.prisma.$transaction(async (tx) => {
      // Cascade deletes child replies and reactions
      await tx.comment.delete({
        where: { id: commentId },
      });

      // Recalculate post commentsCount
      const remainingCount = await tx.comment.count({
        where: {
          postId: comment.postId,
          status: CommentStatus.APPROVED,
        },
      });

      await tx.blogPost.update({
        where: { id: comment.postId },
        data: { commentsCount: remainingCount },
      });
    });

    this.logger.info(`✔ Comment ${commentId} deleted by its author`);
    return { success: true, id: commentId };
  }

  // =========================================================================
  // 2. ADMIN DASHBOARD & MODERATION METHODS
  // =========================================================================

  /**
   * Get comprehensive moderation statistics
   */
  public async getModerationStats(): Promise<CommentModerationStatsDTO> {
    const [
      totalComments,
      pendingCount,
      approvedCount,
      spamCount,
      rejectedCount,
      totalReports,
      pendingReportsCount,
    ] = await Promise.all([
      this.prisma.comment.count(),
      this.prisma.comment.count({ where: { status: CommentStatus.PENDING } }),
      this.prisma.comment.count({ where: { status: CommentStatus.APPROVED } }),
      this.prisma.comment.count({ where: { status: CommentStatus.SPAM } }),
      this.prisma.comment.count({ where: { status: CommentStatus.REJECTED } }),
      this.prisma.commentReport.count(),
      this.prisma.commentReport.count({ where: { status: CommentReportStatus.PENDING } }),
    ]);

    return {
      totalComments,
      pendingCount,
      approvedCount,
      spamCount,
      rejectedCount,
      totalReports,
      pendingReportsCount,
    };
  }

  /**
   * List all comments with admin filters, search, and reports count
   */
  public async getAdminComments(
    query: ListAdminCommentsQueryDTO
  ): Promise<PaginatedAdminCommentsResponse> {
    const page: number = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit: number = Number(query.limit) > 0 ? Number(query.limit) : 20;
    const skip: number = (page - 1) * limit;

    const where: any = {};

    if (query.status) {
      where.status = query.status as CommentStatus;
    }

    if (query.postId) {
      where.postId = query.postId;
    }

    if (query.postSlug) {
      where.post = { slug: query.postSlug };
    }

    if (query.reportedOnly) {
      where.reports = { some: {} };
    }

    if (query.search) {
      const search = query.search.trim();
      where.OR = [
        { content: { contains: search, mode: "insensitive" } },
        { guestName: { contains: search, mode: "insensitive" } },
        { guestEmail: { contains: search, mode: "insensitive" } },
        {
          author: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { username: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          },
        },
        {
          post: {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { slug: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    const orderBy: any = {};
    if (query.sortBy === "likesCount") {
      orderBy.likesCount = query.sortOrder || "desc";
    } else if (query.sortBy === "updatedAt") {
      orderBy.updatedAt = query.sortOrder || "desc";
    } else {
      orderBy.createdAt = query.sortOrder || "desc";
    }

    const [total, comments] = await Promise.all([
      this.prisma.comment.count({ where }),
      this.prisma.comment.findMany({
        where,
        include: {
          post: {
            select: { id: true, slug: true, title: true },
          },
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              avatar: true,
              role: true,
              badge: true,
            },
          },
          parent: {
            include: {
              author: {
                select: { name: true, username: true },
              },
            },
          },
          _count: {
            select: {
              replies: true,
              reports: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    const formatted: CommentAdminListItemDTO[] = (comments as any[]).map((c) => ({
      id: c.id,
      postId: c.postId,
      postSlug: c.post.slug,
      postTitle: c.post.title,
      author: this.formatAuthor(c.author, c.guestName, c.guestEmail, c.guestAvatar),
      content: c.content,
      status: c.status,
      isPinned: c.isPinned,
      likesCount: c.likesCount,
      parentId: c.parentId,
      parentAuthorName: c.parent?.author?.name || c.parent?.guestName || null,
      repliesCount: c._count.replies,
      reportsCount: c._count.reports,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      comments: formatted,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Get single comment by ID with thread context and all submitted reports
   */
  public async getAdminCommentById(id: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        post: {
          select: { id: true, slug: true, title: true },
        },
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            avatar: true,
            role: true,
            badge: true,
          },
        },
        parent: {
          include: {
            author: {
              select: { id: true, name: true, username: true },
            },
          },
        },
        replies: {
          include: {
            author: {
              select: { id: true, name: true, username: true, avatar: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        reports: {
          include: {
            reporter: {
              select: { id: true, name: true, email: true, username: true, avatar: true },
            },
            reviewedBy: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!comment) {
      throw new NotFoundError(`Comment with ID '${id}' not found`);
    }

    return {
      ...comment,
      author: this.formatAuthor(comment.author, comment.guestName, comment.guestEmail, comment.guestAvatar),
      reports: (comment.reports as any[]).map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
      replies: (comment.replies as any[]).map((r) => ({
        ...r,
        author: this.formatAuthor(r.author, r.guestName, r.guestEmail, r.guestAvatar),
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
    };
  }

  /**
   * Update comment status or pin state
   */
  public async updateCommentStatus(
    id: string,
    dto: UpdateCommentStatusDTO
  ) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      select: { id: true, postId: true, status: true },
    });

    if (!comment) {
      throw new NotFoundError(`Comment with ID '${id}' not found`);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.comment.update({
        where: { id },
        data: {
          ...(dto.status ? { status: dto.status as CommentStatus } : {}),
          ...(dto.isPinned !== undefined ? { isPinned: dto.isPinned } : {}),
          ...(dto.content ? { content: dto.content } : {}),
        },
        include: {
          author: {
            select: { id: true, name: true, username: true, email: true, avatar: true },
          },
        },
      });

      // Recalculate post commentsCount
      const remainingCount = await tx.comment.count({
        where: {
          postId: comment.postId,
          status: CommentStatus.APPROVED,
        },
      });

      await tx.blogPost.update({
        where: { id: comment.postId },
        data: { commentsCount: remainingCount },
      });

      return result;
    });

    this.logger.info(`✔ Comment ${id} updated status to '${dto.status || comment.status}'`);
    return updated;
  }

  /**
   * Delete comment by Admin
   */
  public async deleteCommentAdmin(id: string): Promise<{ success: boolean; id: string }> {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      select: { id: true, postId: true },
    });

    if (!comment) {
      throw new NotFoundError(`Comment with ID '${id}' not found`);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.comment.delete({
        where: { id },
      });

      const remainingCount = await tx.comment.count({
        where: {
          postId: comment.postId,
          status: CommentStatus.APPROVED,
        },
      });

      await tx.blogPost.update({
        where: { id: comment.postId },
        data: { commentsCount: remainingCount },
      });
    });

    this.logger.info(`✔ Comment ${id} deleted by Admin`);
    return { success: true, id };
  }

  /**
   * Bulk update status for multiple comments
   */
  public async bulkUpdateStatus(dto: BulkCommentStatusDTO): Promise<{ count: number }> {
    const result = await this.prisma.comment.updateMany({
      where: { id: { in: dto.commentIds } },
      data: { status: dto.status as CommentStatus },
    });

    this.logger.info(`✔ Bulk updated status for ${result.count} comments to '${dto.status}'`);
    return { count: result.count };
  }

  /**
   * Bulk delete multiple comments
   */
  public async bulkDelete(dto: BulkCommentDeleteDTO): Promise<{ count: number }> {
    const result = await this.prisma.comment.deleteMany({
      where: { id: { in: dto.commentIds } },
    });

    this.logger.info(`✔ Bulk deleted ${result.count} comments`);
    return { count: result.count };
  }

  // =========================================================================
  // 3. COMMENT REPORTS MODERATION WORKFLOW
  // =========================================================================

  /**
   * List all user-flagged comment reports
   */
  public async getAdminReports(
    query: ListAdminReportsQueryDTO
  ): Promise<PaginatedAdminReportsResponse> {
    const page: number = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit: number = Number(query.limit) > 0 ? Number(query.limit) : 20;
    const skip: number = (page - 1) * limit;

    const where: any = {};

    if (query.status) {
      where.status = query.status as CommentReportStatus;
    }

    if (query.reason) {
      where.reason = query.reason as CommentReportReason;
    }

    if (query.commentId) {
      where.commentId = query.commentId;
    }

    if (query.search) {
      const search = query.search.trim();
      where.OR = [
        { details: { contains: search, mode: "insensitive" } },
        { reporterName: { contains: search, mode: "insensitive" } },
        { reporterEmail: { contains: search, mode: "insensitive" } },
        {
          comment: {
            OR: [
              { content: { contains: search, mode: "insensitive" } },
              { post: { title: { contains: search, mode: "insensitive" } } },
            ],
          },
        },
      ];
    }

    const orderBy: any = {};
    if (query.sortBy === "status") {
      orderBy.status = query.sortOrder || "desc";
    } else if (query.sortBy === "reason") {
      orderBy.reason = query.sortOrder || "desc";
    } else {
      orderBy.createdAt = query.sortOrder || "desc";
    }

    const [total, reports] = await Promise.all([
      this.prisma.commentReport.count({ where }),
      this.prisma.commentReport.findMany({
        where,
        include: {
          comment: {
            include: {
              post: {
                select: { id: true, slug: true, title: true },
              },
              author: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
              avatar: true,
            },
          },
          reviewedBy: {
            select: { id: true, name: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    const formatted: CommentReportDTO[] = (reports as any[]).map((r) => ({
      id: r.id,
      commentId: r.commentId,
      comment: r.comment
        ? {
            id: r.comment.id,
            content: r.comment.content,
            postId: r.comment.postId,
            postSlug: r.comment.post?.slug,
            postTitle: r.comment.post?.title,
            author: this.formatAuthor(
              r.comment.author,
              r.comment.guestName,
              r.comment.guestEmail,
              r.comment.guestAvatar
            ),
            status: r.comment.status,
            createdAt: r.comment.createdAt.toISOString(),
          }
        : undefined,
      reporterId: r.reporterId,
      reporter: r.reporter,
      reporterName: r.reporterName,
      reporterEmail: r.reporterEmail,
      reason: r.reason,
      details: r.details,
      status: r.status,
      reviewedById: r.reviewedById,
      reviewedBy: r.reviewedBy,
      resolutionNotes: r.resolutionNotes,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      reports: formatted,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Resolve a comment report with moderation actions
   */
  public async resolveReport(
    reportId: string,
    dto: ResolveCommentReportDTO,
    adminUserId: string
  ) {
    const report = await this.prisma.commentReport.findUnique({
      where: { id: reportId },
      include: { comment: true },
    });

    if (!report) {
      throw new NotFoundError(`Report with ID '${reportId}' not found`);
    }

    const updatedReport = await this.prisma.$transaction(async (tx) => {
      // Execute optional action on the offending comment
      if (dto.action && dto.action !== "NO_ACTION" && report.comment) {
        if (dto.action === "DELETE_COMMENT") {
          await tx.comment.delete({
            where: { id: report.commentId },
          });

          const remainingCount = await tx.comment.count({
            where: {
              postId: report.comment.postId,
              status: CommentStatus.APPROVED,
            },
          });

          await tx.blogPost.update({
            where: { id: report.comment.postId },
            data: { commentsCount: remainingCount },
          });
        } else if (dto.action === "MARK_SPAM") {
          await tx.comment.update({
            where: { id: report.commentId },
            data: { status: CommentStatus.SPAM },
          });
        } else if (dto.action === "REJECT_COMMENT") {
          await tx.comment.update({
            where: { id: report.commentId },
            data: { status: CommentStatus.REJECTED },
          });
        } else if (dto.action === "APPROVE_COMMENT") {
          await tx.comment.update({
            where: { id: report.commentId },
            data: { status: CommentStatus.APPROVED },
          });
        }
      }

      // Update report status & resolution notes
      const resolved = await tx.commentReport.update({
        where: { id: reportId },
        data: {
          status: dto.status as CommentReportStatus,
          reviewedById: adminUserId,
          resolutionNotes: dto.resolutionNotes || null,
        },
        include: {
          reviewedBy: {
            select: { id: true, name: true },
          },
        },
      });

      return resolved;
    });

    this.logger.info(`✔ Report ${reportId} resolved as '${dto.status}' (Action: ${dto.action || "NONE"})`);
    return updatedReport;
  }

  /**
   * Delete report record
   */
  public async deleteReport(reportId: string): Promise<{ success: boolean; id: string }> {
    await this.prisma.commentReport.delete({
      where: { id: reportId },
    });
    return { success: true, id: reportId };
  }
}
