// apps/dashboard/src/lib/api/blog.api.ts
import type {
  BlogPostDTO,
  BlogPostListItemDTO,
  BlogCategoryDTO,
  BlogTagDTO,
  BlogStatsDTO,
  SeoAnalysisResult,
  CreateBlogPostDTO,
  UpdateBlogPostDTO,
  CreateBlogCategoryDTO,
  UpdateBlogCategoryDTO,
  CreateBlogTagDTO,
  UpdateBlogTagDTO,
  ListBlogPostsQueryDTO,
  BulkBlogStatusDTO,
  BulkBlogDeleteDTO,
  SeoPreviewDTO,
} from "@workspace/shared";
import { request } from "./client";

export const BlogApi = {
  /**
   * 1. Get blog statistics & overview metrics
   */
  async getStats() {
    return await request<BlogStatsDTO>("/blogs/v1/admin/stats", {
      method: "GET",
    });
  },

  /**
   * 2. List all blog posts with admin filters and pagination
   */
  async getAll(query: ListBlogPostsQueryDTO = {}) {
    const params = new URLSearchParams();
    if (query.page) params.append("page", String(query.page));
    if (query.limit) params.append("limit", String(query.limit));
    if (query.search) params.append("search", query.search);
    if (query.status) params.append("status", query.status);
    if (query.categoryId) params.append("categoryId", query.categoryId);
    if (query.category) params.append("category", query.category);
    if (query.tag) params.append("tag", query.tag);
    if (query.featured !== undefined) params.append("featured", String(query.featured));
    if (query.sortBy) params.append("sortBy", query.sortBy);
    if (query.sortOrder) params.append("sortOrder", query.sortOrder);
    if (query.startDate) params.append("startDate", query.startDate);
    if (query.endDate) params.append("endDate", query.endDate);

    const queryString = params.toString() ? `?${params.toString()}` : "";
    return await request<BlogPostListItemDTO[]>(`/blogs/v1/admin/posts${queryString}`, {
      method: "GET",
    });
  },

  /**
   * 3. Get single blog post by ID
   */
  async getById(id: string) {
    return await request<BlogPostDTO>(`/blogs/v1/admin/posts/${id}`, {
      method: "GET",
    });
  },

  /**
   * 4. Create new blog post
   */
  async create(payload: CreateBlogPostDTO) {
    return await request<BlogPostDTO>("/blogs/v1/admin/posts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * 5. Update existing blog post
   */
  async update(id: string, payload: UpdateBlogPostDTO) {
    return await request<BlogPostDTO>(`/blogs/v1/admin/posts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  /**
   * 6. Delete blog post
   */
  async delete(id: string) {
    return await request<{ id: string }>(`/blogs/v1/admin/posts/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * 7. Duplicate blog post into draft
   */
  async duplicate(id: string) {
    return await request<BlogPostDTO>(`/blogs/v1/admin/posts/${id}/duplicate`, {
      method: "POST",
    });
  },

  /**
   * 8. Bulk update status
   */
  async bulkUpdateStatus(payload: BulkBlogStatusDTO) {
    return await request<{ count: number }>("/blogs/v1/admin/posts/bulk-status", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * 9. Bulk delete posts
   */
  async bulkDelete(payload: BulkBlogDeleteDTO) {
    return await request<{ count: number }>("/blogs/v1/admin/posts/bulk-delete", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * 10. Generate real-time SEO preview & diagnostic health check
   */
  async generateSeoPreview(payload: SeoPreviewDTO) {
    return await request<SeoAnalysisResult>("/blogs/v1/admin/posts/seo-preview", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * 11. Sync / seed local JSON posts into PostgreSQL
   */
  async seedLocal() {
    return await request<{ imported: number; message: string }>("/blogs/v1/admin/seed-local", {
      method: "POST",
    });
  },

  /**
   * 12. List all categories
   */
  async getCategories() {
    return await request<BlogCategoryDTO[]>("/blogs/v1/admin/categories", {
      method: "GET",
    });
  },

  /**
   * 13. Create category
   */
  async createCategory(payload: CreateBlogCategoryDTO) {
    return await request<BlogCategoryDTO>("/blogs/v1/admin/categories", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * 14. Update category
   */
  async updateCategory(id: string, payload: UpdateBlogCategoryDTO) {
    return await request<BlogCategoryDTO>(`/blogs/v1/admin/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  /**
   * 15. Delete category
   */
  async deleteCategory(id: string) {
    return await request<{ id: string }>(`/blogs/v1/admin/categories/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * 16. List all tags
   */
  async getTags() {
    return await request<BlogTagDTO[]>("/blogs/v1/admin/tags", {
      method: "GET",
    });
  },

  /**
   * 17. Create tag
   */
  async createTag(payload: CreateBlogTagDTO) {
    return await request<BlogTagDTO>("/blogs/v1/admin/tags", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * 18. Update tag
   */
  async updateTag(id: string, payload: UpdateBlogTagDTO) {
    return await request<BlogTagDTO>(`/blogs/v1/admin/tags/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  /**
   * 19. Delete tag
   */
  async deleteTag(id: string) {
    return await request<{ id: string }>(`/blogs/v1/admin/tags/${id}`, {
      method: "DELETE",
    });
  },
};
