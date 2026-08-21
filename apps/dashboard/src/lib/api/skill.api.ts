// apps/dashboard/src/lib/api/skill.api.ts
import type {
  SkillDTO,
  SkillListItemDTO,
  SkillStatsDTO,
  SkillCategoryDTO,
  CreateSkillDTO,
  UpdateSkillDTO,
  ListSkillsQueryDTO,
  BulkSkillStatusDTO,
  BulkSkillDeleteDTO,
  ReorderSkillsDTO,
  CreateSkillCategoryDTO,
  UpdateSkillCategoryDTO,
  ReorderSkillCategoriesDTO,
} from "@workspace/shared";
import { request } from "./client";

export const SkillApi = {
  /**
   * 1. Get skill statistics & KPI metrics
   */
  async getStats() {
    return await request<SkillStatsDTO>("/skills/v1/admin/stats", {
      method: "GET",
    });
  },

  /**
   * 2. List all skills with admin filters and pagination
   */
  async getAll(query: Partial<ListSkillsQueryDTO> = {}) {
    const params = new URLSearchParams();
    if (query.page) params.append("page", String(query.page));
    if (query.limit) params.append("limit", String(query.limit));
    if (query.search) params.append("search", query.search);
    if (query.status) params.append("status", query.status);
    if (query.categoryId) params.append("categoryId", query.categoryId);
    if (query.tag) params.append("tag", query.tag);
    if (query.featured !== undefined)
      params.append("featured", String(query.featured));
    if (query.sortBy) params.append("sortBy", query.sortBy);
    if (query.sortOrder) params.append("sortOrder", query.sortOrder);

    const queryString = params.toString() ? `?${params.toString()}` : "";
    return await request<SkillListItemDTO[]>(
      `/skills/v1/admin/list${queryString}`,
      {
        method: "GET",
      }
    );
  },

  /**
   * 3. Get single skill by ID
   */
  async getById(id: string) {
    return await request<SkillDTO>(`/skills/v1/admin/${id}`, {
      method: "GET",
    });
  },

  /**
   * 4. Create new skill
   */
  async create(payload: CreateSkillDTO) {
    return await request<SkillDTO>("/skills/v1/admin/create", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * 5. Update existing skill
   */
  async update(id: string, payload: UpdateSkillDTO) {
    return await request<SkillDTO>(`/skills/v1/admin/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  /**
   * 6. Delete skill
   */
  async delete(id: string) {
    return await request<{ id: string }>(`/skills/v1/admin/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * 7. Duplicate skill
   */
  async duplicate(id: string) {
    return await request<SkillDTO>(`/skills/v1/admin/${id}/duplicate`, {
      method: "POST",
    });
  },

  /**
   * 8. Bulk update status
   */
  async bulkUpdateStatus(payload: BulkSkillStatusDTO) {
    return await request<{ count: number }>("/skills/v1/admin/bulk-status", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * 9. Bulk delete skills
   */
  async bulkDelete(payload: BulkSkillDeleteDTO) {
    return await request<{ count: number }>("/skills/v1/admin/bulk-delete", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * 10. Reorder skills
   */
  async reorder(payload: ReorderSkillsDTO) {
    return await request<{ updated: number }>("/skills/v1/admin/reorder", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * 11. Re-seed default skills & categories
   */
  async seedDefault() {
    return await request<{ createdCategories: number; createdSkills: number; message: string }>(
      "/skills/v1/admin/seed-default",
      {
        method: "POST",
      }
    );
  },

  // =========================================================================
  // CATEGORIES
  // =========================================================================

  /**
   * 12. List all skill categories
   */
  async listCategories() {
    return await request<SkillCategoryDTO[]>("/skills/v1/admin/categories", {
      method: "GET",
    });
  },

  /**
   * 13. Get single category by ID
   */
  async getCategoryById(id: string) {
    return await request<SkillCategoryDTO>(`/skills/v1/admin/categories/${id}`, {
      method: "GET",
    });
  },

  /**
   * 14. Create category
   */
  async createCategory(payload: CreateSkillCategoryDTO) {
    return await request<SkillCategoryDTO>("/skills/v1/admin/categories", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * 15. Update category
   */
  async updateCategory(id: string, payload: UpdateSkillCategoryDTO) {
    return await request<SkillCategoryDTO>(`/skills/v1/admin/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  /**
   * 16. Delete category
   */
  async deleteCategory(id: string) {
    return await request<{ id: string }>(`/skills/v1/admin/categories/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * 17. Reorder categories
   */
  async reorderCategories(payload: ReorderSkillCategoriesDTO) {
    return await request<{ updated: number }>(
      "/skills/v1/admin/categories/reorder",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },
};
