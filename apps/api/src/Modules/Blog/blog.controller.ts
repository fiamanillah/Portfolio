// src/Modules/Blog/blog.controller.ts
import { Request, Response, NextFunction } from "express";
import { BaseController } from "@/core/BaseController";
import { BlogService } from "./blog.service";
import { HTTPStatusCode } from "@/types/HTTPStatusCode";
import {
  CreateBlogPostDTO,
  UpdateBlogPostDTO,
  CreateBlogCategoryDTO,
  UpdateBlogCategoryDTO,
  CreateBlogTagDTO,
  UpdateBlogTagDTO,
  ListBlogPostsQueryDTO,
  PublicBlogQueryDTO,
  BulkBlogStatusDTO,
  BulkBlogDeleteDTO,
  SeoPreviewDTO,
} from "./BlogDTO";

export class BlogController extends BaseController {
  constructor(private blogService: BlogService) {
    super();
  }

  // =========================================================================
  // ADMIN DASHBOARD ENDPOINTS
  // =========================================================================

  /**
   * GET /blogs/v1/admin/stats - Retrieve aggregated overview KPIs & metrics
   */
  public async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await this.blogService.getStats();
      this.sendResponse(req, res, "Blog statistics retrieved successfully", HTTPStatusCode.OK, stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /blogs/v1/admin/posts - List posts with rich admin filters & pagination
   */
  public async getAllAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = (req as any).validatedQuery || req.query;
      const result = await this.blogService.getAllAdmin(query as ListBlogPostsQueryDTO);
      this.sendPaginatedResponse(req, res, result.pagination, "Admin blog posts retrieved successfully", result.data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /blogs/v1/admin/posts/:id - Get complete post details by ID for editing
   */
  public async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const post = await this.blogService.getById(id);
      this.sendResponse(req, res, "Blog post retrieved successfully", HTTPStatusCode.OK, post);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /blogs/v1/admin/posts - Create a new blog post
   */
  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload: CreateBlogPostDTO = req.body;
      const created = await this.blogService.create(payload, req.user);
      this.sendCreatedResponse(req, res, created, "Blog post created successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /blogs/v1/admin/posts/:id - Update an existing blog post
   */
  public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const payload: UpdateBlogPostDTO = req.body;
      const updated = await this.blogService.update(id, payload, req.user);
      this.sendResponse(req, res, "Blog post updated successfully", HTTPStatusCode.OK, updated);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /blogs/v1/admin/posts/:id - Delete a blog post
   */
  public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await this.blogService.delete(id);
      this.sendResponse(req, res, "Blog post deleted successfully", HTTPStatusCode.OK, { id });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /blogs/v1/admin/posts/:id/duplicate - Duplicate post into a new draft copy
   */
  public async duplicate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const duplicated = await this.blogService.duplicate(id, req.user);
      this.sendCreatedResponse(req, res, duplicated, "Blog post duplicated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /blogs/v1/admin/posts/bulk-status - Bulk update status for multiple posts
   */
  public async bulkUpdateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ids, status }: BulkBlogStatusDTO = req.body;
      const result = await this.blogService.bulkUpdateStatus(ids, status);
      this.sendResponse(req, res, `Successfully updated ${result.count} blog posts to status '${status}'`, HTTPStatusCode.OK, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /blogs/v1/admin/posts/bulk-delete - Bulk delete multiple posts
   */
  public async bulkDelete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ids }: BulkBlogDeleteDTO = req.body;
      const result = await this.blogService.bulkDelete(ids);
      this.sendResponse(req, res, `Successfully deleted ${result.count} blog posts`, HTTPStatusCode.OK, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /blogs/v1/admin/posts/seo-preview - Generate real-time SERP snippet & SEO health check
   */
  public async generateSeoPreview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload: SeoPreviewDTO = req.body;
      const analysis = this.blogService.generateSeoPreview(payload);
      this.sendResponse(req, res, "SEO preview & diagnostic analysis generated successfully", HTTPStatusCode.OK, analysis);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /blogs/v1/admin/seed-local - Synchronize or import repository JSON blog posts into PostgreSQL
   */
  public async seedLocalPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.blogService.seedLocalPosts();
      this.sendResponse(req, res, result.message, HTTPStatusCode.OK, result);
    } catch (error) {
      next(error);
    }
  }

  // =========================================================================
  // CATEGORY & TAG MANAGEMENT ENDPOINTS
  // =========================================================================

  /**
   * GET /blogs/v1/admin/categories - List all categories
   */
  public async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await this.blogService.getCategories();
      this.sendResponse(req, res, "Categories retrieved successfully", HTTPStatusCode.OK, categories);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /blogs/v1/admin/categories - Create a new category
   */
  public async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload: CreateBlogCategoryDTO = req.body;
      const created = await this.blogService.createCategory(payload);
      this.sendCreatedResponse(req, res, created, "Category created successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /blogs/v1/admin/categories/:id - Update category
   */
  public async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const payload: UpdateBlogCategoryDTO = req.body;
      const updated = await this.blogService.updateCategory(id, payload);
      this.sendResponse(req, res, "Category updated successfully", HTTPStatusCode.OK, updated);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /blogs/v1/admin/categories/:id - Delete category
   */
  public async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await this.blogService.deleteCategory(id);
      this.sendResponse(req, res, "Category deleted successfully", HTTPStatusCode.OK, { id });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /blogs/v1/admin/tags - List all tags
   */
  public async getTags(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tags = await this.blogService.getTags();
      this.sendResponse(req, res, "Tags retrieved successfully", HTTPStatusCode.OK, tags);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /blogs/v1/admin/tags - Create a new tag
   */
  public async createTag(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload: CreateBlogTagDTO = req.body;
      const created = await this.blogService.createTag(payload);
      this.sendCreatedResponse(req, res, created, "Tag created successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /blogs/v1/admin/tags/:id - Delete a tag
   */
  public async deleteTag(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await this.blogService.deleteTag(id);
      this.sendResponse(req, res, "Tag deleted successfully", HTTPStatusCode.OK, { id });
    } catch (error) {
      next(error);
    }
  }

  // =========================================================================
  // PUBLIC DISCOVERY & SEO ENDPOINTS (For Astro SSR / Frontend Web / Crawlers)
  // =========================================================================

  /**
   * GET /blogs/v1/public - Get published blog posts
   */
  public async getPublicPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = (req as any).validatedQuery || req.query;
      const result = await this.blogService.getPublicPosts(query as PublicBlogQueryDTO);
      this.sendPaginatedResponse(req, res, result.pagination, "Published blog posts retrieved successfully", result.data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /blogs/v1/public/featured - Get featured published posts
   */
  public async getFeaturedPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const posts = await this.blogService.getFeaturedPosts();
      this.sendResponse(req, res, "Featured blog posts retrieved successfully", HTTPStatusCode.OK, posts);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /blogs/v1/public/slug/:slug - Get post by slug with adjacent, related, and SEO JSON-LD
   */
  public async getPublicPostBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
      const incrementView = req.query.noView !== "true";
      const result = await this.blogService.getPublicPostBySlug(slug, incrementView);
      this.sendResponse(req, res, "Blog post details retrieved successfully", HTTPStatusCode.OK, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /blogs/v1/public/categories - Get categories with published post counts
   */
  public async getPublicCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await this.blogService.getPublicCategories();
      this.sendResponse(req, res, "Public categories retrieved successfully", HTTPStatusCode.OK, categories);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /blogs/v1/public/tags - Get tags with published post counts
   */
  public async getPublicTags(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tags = await this.blogService.getPublicTags();
      this.sendResponse(req, res, "Public tags retrieved successfully", HTTPStatusCode.OK, tags);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /blogs/v1/public/rss-feed - Get formatted RSS and Sitemap feed data
   */
  public async getRssFeedData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const feed = await this.blogService.getRssFeedData();
      this.sendResponse(req, res, "RSS feed data retrieved successfully", HTTPStatusCode.OK, feed);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /blogs/v1/public/slug/:slug/react - React to blog post (like, fire, etc.)
   */
  public async reactToPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
      const reactionType = req.body.reactionType || "like";
      const ipAddress = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;
      const result = await this.blogService.reactToPost(slug, reactionType, req.user?.id, ipAddress);
      this.sendResponse(req, res, "Reaction updated successfully", HTTPStatusCode.OK, result);
    } catch (error) {
      next(error);
    }
  }
}
