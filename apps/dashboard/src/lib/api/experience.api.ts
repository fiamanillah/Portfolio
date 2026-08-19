// apps/dashboard/src/lib/api/experience.api.ts
import type {
  ExperienceDTO,
  ExperienceListItemDTO,
  ExperienceStatsDTO,
  CreateExperienceDTO,
  UpdateExperienceDTO,
  ListExperiencesQueryDTO,
  BulkExperienceStatusDTO,
  BulkExperienceDeleteDTO,
  ReorderExperiencesDTO,
} from "@workspace/shared";
import { request } from "./client";

export const ExperienceApi = {
  /**
   * 1. Get experience statistics & KPI metrics
   */
  async getStats() {
    return await request<ExperienceStatsDTO>("/experiences/v1/admin/stats", {
      method: "GET",
    });
  },

  /**
   * 2. List all experiences with admin filters and pagination
   */
  async getAll(query: Partial<ListExperiencesQueryDTO> = {}) {
    const params = new URLSearchParams();
    if (query.page) params.append("page", String(query.page));
    if (query.limit) params.append("limit", String(query.limit));
    if (query.search) params.append("search", query.search);
    if (query.status) params.append("status", query.status);
    if (query.employmentType) params.append("employmentType", query.employmentType);
    if (query.tech) params.append("tech", query.tech);
    if (query.featured !== undefined)
      params.append("featured", String(query.featured));
    if (query.sortBy) params.append("sortBy", query.sortBy);
    if (query.sortOrder) params.append("sortOrder", query.sortOrder);

    const queryString = params.toString() ? `?${params.toString()}` : "";
    return await request<ExperienceListItemDTO[]>(
      `/experiences/v1/admin/list${queryString}`,
      {
        method: "GET",
      }
    );
  },

  /**
   * 3. Get single experience by ID
   */
  async getById(id: string) {
    return await request<ExperienceDTO>(`/experiences/v1/admin/${id}`, {
      method: "GET",
    });
  },

  /**
   * 4. Create new experience
   */
  async create(payload: CreateExperienceDTO) {
    return await request<ExperienceDTO>("/experiences/v1/admin/create", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * 5. Update existing experience
   */
  async update(id: string, payload: UpdateExperienceDTO) {
    return await request<ExperienceDTO>(`/experiences/v1/admin/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  /**
   * 6. Delete experience
   */
  async delete(id: string) {
    return await request<{ id: string }>(`/experiences/v1/admin/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * 7. Duplicate experience into draft
   */
  async duplicate(id: string) {
    return await request<ExperienceDTO>(
      `/experiences/v1/admin/${id}/duplicate`,
      {
        method: "POST",
      }
    );
  },

  /**
   * 8. Bulk update status
   */
  async bulkUpdateStatus(payload: BulkExperienceStatusDTO) {
    return await request<{ count: number }>(
      "/experiences/v1/admin/bulk-status",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },

  /**
   * 9. Bulk delete experiences
   */
  async bulkDelete(payload: BulkExperienceDeleteDTO) {
    return await request<{ count: number }>(
      "/experiences/v1/admin/bulk-delete",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },

  /**
   * 10. Reorder experiences
   */
  async reorder(payload: ReorderExperiencesDTO) {
    return await request<{ updated: number }>(
      "/experiences/v1/admin/reorder",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },

  /**
   * 11. Re-seed default experience
   */
  async seedDefault() {
    return await request<{ created: number; message: string }>(
      "/experiences/v1/admin/seed-default",
      {
        method: "POST",
      }
    );
  },
};
