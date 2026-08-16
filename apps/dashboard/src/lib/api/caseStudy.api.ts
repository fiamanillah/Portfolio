// apps/dashboard/src/lib/api/caseStudy.api.ts
import type {
  CaseStudyDTO,
  CaseStudyListItemDTO,
  CaseStudyStatsDTO,
  CreateCaseStudyDTO,
  UpdateCaseStudyDTO,
  ListCaseStudiesQueryDTO,
  BulkCaseStudyStatusDTO,
  BulkCaseStudyDeleteDTO,
  ReorderCaseStudiesDTO,
} from "@workspace/shared";
import { request } from "./client";

export const CaseStudyApi = {
  /**
   * 1. Get case study statistics & KPI metrics
   */
  async getStats() {
    return await request<CaseStudyStatsDTO>("/case-studies/v1/admin/stats", {
      method: "GET",
    });
  },

  /**
   * 2. List all case studies with admin filters and pagination
   */
  async getAll(query: Partial<ListCaseStudiesQueryDTO> = {}) {
    const params = new URLSearchParams();
    if (query.page) params.append("page", String(query.page));
    if (query.limit) params.append("limit", String(query.limit));
    if (query.search) params.append("search", query.search);
    if (query.status) params.append("status", query.status);
    if (query.tech) params.append("tech", query.tech);
    if (query.featured !== undefined)
      params.append("featured", String(query.featured));
    if (query.sortBy) params.append("sortBy", query.sortBy);
    if (query.sortOrder) params.append("sortOrder", query.sortOrder);

    const queryString = params.toString() ? `?${params.toString()}` : "";
    return await request<CaseStudyListItemDTO[]>(
      `/case-studies/v1/admin/list${queryString}`,
      {
        method: "GET",
      }
    );
  },

  /**
   * 3. Get single case study by ID
   */
  async getById(id: string) {
    return await request<CaseStudyDTO>(`/case-studies/v1/admin/${id}`, {
      method: "GET",
    });
  },

  /**
   * 4. Create new case study
   */
  async create(payload: CreateCaseStudyDTO) {
    return await request<CaseStudyDTO>("/case-studies/v1/admin/create", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * 5. Update existing case study
   */
  async update(id: string, payload: UpdateCaseStudyDTO) {
    return await request<CaseStudyDTO>(`/case-studies/v1/admin/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  /**
   * 6. Delete case study
   */
  async delete(id: string) {
    return await request<{ id: string }>(`/case-studies/v1/admin/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * 7. Duplicate case study into draft
   */
  async duplicate(id: string) {
    return await request<CaseStudyDTO>(
      `/case-studies/v1/admin/${id}/duplicate`,
      {
        method: "POST",
      }
    );
  },

  /**
   * 8. Bulk update status
   */
  async bulkUpdateStatus(payload: BulkCaseStudyStatusDTO) {
    return await request<{ count: number }>(
      "/case-studies/v1/admin/bulk-status",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },

  /**
   * 9. Bulk delete case studies
   */
  async bulkDelete(payload: BulkCaseStudyDeleteDTO) {
    return await request<{ count: number }>(
      "/case-studies/v1/admin/bulk-delete",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },

  /**
   * 10. Reorder case studies
   */
  async reorder(payload: ReorderCaseStudiesDTO) {
    return await request<{ updated: number }>(
      "/case-studies/v1/admin/reorder",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },

  /**
   * 11. Sync / seed local JSON case studies into PostgreSQL
   */
  async seedLocal() {
    return await request<{ imported: number; message: string }>(
      "/case-studies/v1/admin/seed-local",
      {
        method: "POST",
      }
    );
  },
};
