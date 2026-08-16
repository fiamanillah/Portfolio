// src/Modules/Blog/BlogModule.ts
import { BaseModule } from "@/core/BaseModule";
import { AppLogger } from "@workspace/logger";
import { validateRequest } from "@/middleware/validation";
import { authenticate, optionalAuth, requireRole } from "@/middleware/auth";
import { Role } from "@workspace/db";
import { BlogService } from "./blog.service";
import { BlogController } from "./blog.controller";
import {
  createBlogPostSchema,
  updateBlogPostSchema,
  createBlogCategorySchema,
  updateBlogCategorySchema,
  createBlogTagSchema,
  listBlogPostsQuerySchema,
  publicBlogQuerySchema,
  bulkBlogStatusSchema,
  bulkBlogDeleteSchema,
  seoPreviewSchema,
  reactToBlogSchema,
} from "./BlogDTO";

export class BlogModule extends BaseModule {
  public name: string = "BlogModule";
  public version: string = "1.0.0";
  public basePath: string = "/blogs/v1/";
  public dependencies?: string[] | undefined;

  protected logger = new AppLogger("BlogModule");

  protected async setupUseCases(): Promise<void> {
    const blogService = new BlogService();
    this.registerService("BlogService", blogService);
  }

  protected async setupControllers(): Promise<void> {
    const blogService = this.getService<BlogService>("BlogService");
    this.registerController("BlogController", new BlogController(blogService));
  }

  protected async setupRoutes(): Promise<void> {
    const controller = this.getController<BlogController>("BlogController");

    // Guard for admin/editor endpoints
    const adminGuard = [
      authenticate,
      requireRole(Role.ADMIN, Role.MODERATOR, Role.AUTHOR),
    ];

    // =========================================================================
    // 1. PUBLIC DISCOVERY & SEO ROUTES (Frontend, SSR, RSS, Crawlers)
    // =========================================================================

    // GET /blogs/v1/public - List published articles
    this.router.get(
      "/public",
      validateRequest({ query: publicBlogQuerySchema }),
      controller.getPublicPosts.bind(controller)
    );

    // GET /blogs/v1/public/featured - List featured articles
    this.router.get("/public/featured", controller.getFeaturedPosts.bind(controller));

    // GET /blogs/v1/public/categories - Categories with published counts
    this.router.get("/public/categories", controller.getPublicCategories.bind(controller));

    // GET /blogs/v1/public/tags - Tags with published counts
    this.router.get("/public/tags", controller.getPublicTags.bind(controller));

    // GET /blogs/v1/public/rss-feed - RSS / Sitemap feed payload
    this.router.get("/public/rss-feed", controller.getRssFeedData.bind(controller));

    // GET /blogs/v1/public/slug/:slug - Post details with breadcrumbs & JSON-LD
    this.router.get("/public/slug/:slug", controller.getPublicPostBySlug.bind(controller));

    // POST /blogs/v1/public/slug/:slug/react - Add reaction / like
    this.router.post(
      "/public/slug/:slug/react",
      optionalAuth,
      validateRequest({ body: reactToBlogSchema }),
      controller.reactToPost.bind(controller)
    );

    // =========================================================================
    // 2. ADMIN DASHBOARD & EDITORIAL ROUTES (Authenticated & RBAC)
    // =========================================================================

    // GET /blogs/v1/admin/stats - Aggregated KPI metrics
    this.router.get("/admin/stats", ...adminGuard, controller.getStats.bind(controller));

    // GET /blogs/v1/admin/posts - Paginated searchable posts list
    this.router.get(
      "/admin/posts",
      ...adminGuard,
      validateRequest({ query: listBlogPostsQuerySchema }),
      controller.getAllAdmin.bind(controller)
    );

    // POST /blogs/v1/admin/posts - Create blog post
    this.router.post(
      "/admin/posts",
      ...adminGuard,
      validateRequest({ body: createBlogPostSchema }),
      controller.create.bind(controller)
    );

    // POST /blogs/v1/admin/posts/bulk-status - Bulk status update
    this.router.post(
      "/admin/posts/bulk-status",
      ...adminGuard,
      validateRequest({ body: bulkBlogStatusSchema }),
      controller.bulkUpdateStatus.bind(controller)
    );

    // POST /blogs/v1/admin/posts/bulk-delete - Bulk delete posts
    this.router.post(
      "/admin/posts/bulk-delete",
      ...adminGuard,
      validateRequest({ body: bulkBlogDeleteSchema }),
      controller.bulkDelete.bind(controller)
    );

    // POST /blogs/v1/admin/posts/seo-preview - Real-time SERP preview & SEO score
    this.router.post(
      "/admin/posts/seo-preview",
      ...adminGuard,
      validateRequest({ body: seoPreviewSchema }),
      controller.generateSeoPreview.bind(controller)
    );

    // POST /blogs/v1/admin/seed-local - Sync repository local JSON posts to DB
    this.router.post(
      "/admin/seed-local",
      ...adminGuard,
      controller.seedLocalPosts.bind(controller)
    );

    // GET /blogs/v1/admin/posts/:id - Get post by ID
    this.router.get("/admin/posts/:id", ...adminGuard, controller.getById.bind(controller));

    // PATCH /blogs/v1/admin/posts/:id - Update post
    this.router.patch(
      "/admin/posts/:id",
      ...adminGuard,
      validateRequest({ body: updateBlogPostSchema }),
      controller.update.bind(controller)
    );

    // DELETE /blogs/v1/admin/posts/:id - Delete post
    this.router.delete("/admin/posts/:id", ...adminGuard, controller.delete.bind(controller));

    // POST /blogs/v1/admin/posts/:id/duplicate - Duplicate post
    this.router.post("/admin/posts/:id/duplicate", ...adminGuard, controller.duplicate.bind(controller));

    // =========================================================================
    // 3. CATEGORIES & TAGS MANAGEMENT ROUTES
    // =========================================================================

    // GET /blogs/v1/admin/categories - List categories
    this.router.get("/admin/categories", ...adminGuard, controller.getCategories.bind(controller));

    // POST /blogs/v1/admin/categories - Create category
    this.router.post(
      "/admin/categories",
      ...adminGuard,
      validateRequest({ body: createBlogCategorySchema }),
      controller.createCategory.bind(controller)
    );

    // PATCH /blogs/v1/admin/categories/:id - Update category
    this.router.patch(
      "/admin/categories/:id",
      ...adminGuard,
      validateRequest({ body: updateBlogCategorySchema }),
      controller.updateCategory.bind(controller)
    );

    // DELETE /blogs/v1/admin/categories/:id - Delete category
    this.router.delete("/admin/categories/:id", ...adminGuard, controller.deleteCategory.bind(controller));

    // GET /blogs/v1/admin/tags - List tags
    this.router.get("/admin/tags", ...adminGuard, controller.getTags.bind(controller));

    // POST /blogs/v1/admin/tags - Create tag
    this.router.post(
      "/admin/tags",
      ...adminGuard,
      validateRequest({ body: createBlogTagSchema }),
      controller.createTag.bind(controller)
    );

    // DELETE /blogs/v1/admin/tags/:id - Delete tag
    this.router.delete("/admin/tags/:id", ...adminGuard, controller.deleteTag.bind(controller));

    this.logger.info("✔ Blog routes configured (/blogs/v1/*)");
  }
}
