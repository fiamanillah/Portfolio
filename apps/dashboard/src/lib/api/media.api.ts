// apps/dashboard/src/lib/api/media.api.ts
import type {
  MediaFileDTO,
  MediaStatsDTO,
  ListMediaQueryDTO,
  UpdateMediaFileDTO,
  BulkDeleteMediaDTO,
  BulkUpdateMediaDTO,
  PresignedUploadRequestDTO,
  PresignedUploadResponseDTO,
  ConfirmPresignedUploadDTO,
} from "@workspace/shared";
import { request, API_BASE_URL, getStoredAccessToken, type ApiResponse } from "./client";

export interface CleanupMediaOptions {
  olderThanDays?: number;
  type?: "all" | "avatars" | "blog" | "temp";
  dryRun?: boolean;
}

export interface CleanupMediaResult {
  success: boolean;
  dryRun: boolean;
  count: number;
  keys: string[];
  freedBytes: number;
  freedFormatted: string;
  message: string;
}

export interface UploadOptions {
  folder?: string;
  tags?: string[];
  altText?: string;
  caption?: string;
  isPublic?: boolean;
  source?: string;
  allowDuplicate?: boolean;
  onProgress?: (percent: number) => void;
}

export const MediaApi = {
  /**
   * 1. Get storage stats & category distribution
   */
  async getStats(): Promise<ApiResponse<MediaStatsDTO>> {
    return await request<MediaStatsDTO>("/media/v1/stats", {
      method: "GET",
    });
  },

  /**
   * 2. List media files with search, filters, sorting, and pagination
   */
  async getAll(query: ListMediaQueryDTO = {}): Promise<ApiResponse<MediaFileDTO[]>> {
    const params = new URLSearchParams();
    if (query.page) params.append("page", String(query.page));
    if (query.limit) params.append("limit", String(query.limit));
    if (query.search) params.append("search", query.search);
    if (query.folder && query.folder !== "all") params.append("folder", query.folder);
    if (query.source && query.source !== "all") params.append("source", query.source);
    if (query.mimeType && query.mimeType !== "all") params.append("mimeType", query.mimeType);
    if (query.entityType) params.append("entityType", query.entityType);
    if (query.entityId) params.append("entityId", query.entityId);
    if (query.tag) params.append("tag", query.tag);
    if (query.uploaderId) params.append("uploaderId", query.uploaderId);
    if (query.isPublic !== undefined) params.append("isPublic", String(query.isPublic));
    if (query.sortBy) params.append("sortBy", query.sortBy);
    if (query.sortOrder) params.append("sortOrder", query.sortOrder);
    if (query.startDate) params.append("startDate", query.startDate);
    if (query.endDate) params.append("endDate", query.endDate);

    const queryString = params.toString() ? `?${params.toString()}` : "";
    return await request<MediaFileDTO[]>(`/media/v1/files${queryString}`, {
      method: "GET",
    });
  },

  /**
   * 3. Get single media file metadata by ID
   */
  async getById(id: string): Promise<ApiResponse<MediaFileDTO>> {
    return await request<MediaFileDTO>(`/media/v1/files/${id}`, {
      method: "GET",
    });
  },

  /**
   * 4. Upload single or multiple files (with optional real-time progress)
   */
  async upload(
    fileOrFiles: File | File[],
    options: UploadOptions = {}
  ): Promise<ApiResponse<MediaFileDTO | MediaFileDTO[]>> {
    const token = getStoredAccessToken();
    const formData = new FormData();

    if (Array.isArray(fileOrFiles)) {
      fileOrFiles.forEach((file) => {
        formData.append("files", file);
      });
    } else {
      formData.append("file", fileOrFiles);
    }

    if (options.folder) formData.append("folder", options.folder);
    if (options.source) formData.append("source", options.source);
    if (options.altText) formData.append("altText", options.altText);
    if (options.caption) formData.append("caption", options.caption);
    if (options.isPublic !== undefined) formData.append("isPublic", String(options.isPublic));
    if (options.allowDuplicate !== undefined)
      formData.append("allowDuplicate", String(options.allowDuplicate));
    if (options.tags && options.tags.length > 0) {
      formData.append("tags", JSON.stringify(options.tags));
    }

    if (options.onProgress && typeof window !== "undefined") {
      return new Promise<ApiResponse<MediaFileDTO | MediaFileDTO[]>>((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${API_BASE_URL}/media/v1/upload`);
        if (token) {
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        }

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && options.onProgress) {
            const percent = Math.round((event.loaded / event.total) * 100);
            options.onProgress(percent);
          }
        };

        xhr.onload = () => {
          try {
            const json = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve({
                success: true,
                data: (json.data !== undefined ? json.data : json) as MediaFileDTO | MediaFileDTO[],
                message: json.message,
              });
            } else {
              const errMsg = json.message || json.error || `Upload failed (${xhr.status})`;
              resolve({
                success: false,
                error: errMsg,
                message: errMsg,
              });
            }
          } catch {
            resolve({
              success: false,
              error: `Upload failed (${xhr.status})`,
              message: `Upload failed (${xhr.status})`,
            });
          }
        };

        xhr.onerror = () => {
          resolve({
            success: false,
            error: "Network error during upload",
            message: "Network error during upload",
          });
        };

        xhr.send(formData);
      });
    }

    return await request<MediaFileDTO | MediaFileDTO[]>("/media/v1/upload", {
      method: "POST",
      body: formData,
    });
  },

  /**
   * 5. Generate presigned PUT URL for direct R2 upload
   */
  async createPresignedUrl(
    payload: PresignedUploadRequestDTO
  ): Promise<ApiResponse<PresignedUploadResponseDTO>> {
    return await request<PresignedUploadResponseDTO>("/media/v1/presigned-url", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * 6. Confirm presigned upload and register in database
   */
  async confirmPresigned(
    payload: ConfirmPresignedUploadDTO
  ): Promise<ApiResponse<MediaFileDTO>> {
    return await request<MediaFileDTO>("/media/v1/confirm-presigned", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * 7. Update media metadata (Title, alt text, caption, folder, tags, visibility)
   */
  async update(
    id: string,
    payload: UpdateMediaFileDTO
  ): Promise<ApiResponse<MediaFileDTO>> {
    return await request<MediaFileDTO>(`/media/v1/files/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  /**
   * 8. Permanently delete single media asset
   */
  async delete(id: string): Promise<ApiResponse<{ message: string }>> {
    return await request<{ message: string }>(`/media/v1/files/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * 9. Bulk delete media assets
   */
  async bulkDelete(
    payload: BulkDeleteMediaDTO
  ): Promise<ApiResponse<{ count: number; deletedIds: string[] }>> {
    return await request<{ count: number; deletedIds: string[] }>(
      "/media/v1/files/bulk-delete",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },

  /**
   * 10. Bulk update media assets (move folder, assign tags, change visibility)
   */
  async bulkUpdate(
    payload: BulkUpdateMediaDTO
  ): Promise<ApiResponse<{ count: number; updatedIds: string[] }>> {
    return await request<{ count: number; updatedIds: string[] }>(
      "/media/v1/files/bulk-update",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },

  /**
   * 11. Generate secure temporary download link
   */
  async getDownloadUrl(
    id: string,
    expiresIn: number = 900
  ): Promise<ApiResponse<{ downloadUrl: string; fileName: string }>> {
    return await request<{ downloadUrl: string; fileName: string }>(
      `/media/v1/download/${id}?expiresIn=${expiresIn}`,
      { method: "GET" }
    );
  },

  /**
   * 12. Trigger Cloudflare R2 / S3 storage orphan cleanup
   */
  async cleanupOrphans(
    options: CleanupMediaOptions = {}
  ): Promise<ApiResponse<CleanupMediaResult>> {
    return await request<CleanupMediaResult>("/media/v1/cleanup", {
      method: "POST",
      body: JSON.stringify(options),
    });
  },
};
