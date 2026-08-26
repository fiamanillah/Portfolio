// packages/shared/src/types/media.ts

export type MediaSource =
  | "API"
  | "BLOG_EDITOR"
  | "USER_AVATAR"
  | "TEMPLATE"
  | "CONTACT_ATTACHMENT"
  | "MEDIA_LIBRARY"
  | "SYSTEM"
  | (string & {});

export type MediaFolder =
  | "general"
  | "blogs"
  | "avatars"
  | "templates"
  | "attachments"
  | "documents"
  | (string & {});

export interface MediaFileDTO {
  id: string;
  key: string;
  bucket: string;
  fileName: string;
  fileExtension: string | null;
  mimeType: string;
  size: number;
  sizeFormatted: string;
  url: string;
  etag: string | null;
  source: string;
  folder: string;
  entityType: string | null;
  entityId: string | null;
  tags: string[];
  altText: string | null;
  caption: string | null;
  metadata: Record<string, unknown> | null;
  isPublic: boolean;
  uploaderId: string | null;
  uploader?: {
    id: string;
    name: string;
    email: string;
    username: string;
    avatar: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface PresignedUploadRequestDTO {
  fileName: string;
  mimeType: string;
  size: number;
  folder?: string;
  source?: string;
  entityType?: string;
  entityId?: string;
  tags?: string[];
  altText?: string;
  caption?: string;
  metadata?: Record<string, unknown>;
  isPublic?: boolean;
  expiresInSeconds?: number;
}

export interface PresignedUploadResponseDTO {
  id: string;
  key: string;
  bucket: string;
  uploadUrl: string;
  publicUrl: string;
  fileName: string;
  mimeType: string;
  expiresInSeconds: number;
  fields?: Record<string, string>;
  headers?: Record<string, string>;
}

export interface ConfirmPresignedUploadDTO {
  id?: string;
  key: string;
  size?: number;
  etag?: string;
  altText?: string;
  caption?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateMediaFileDTO {
  fileName?: string;
  altText?: string | null;
  caption?: string | null;
  folder?: string;
  tags?: string[];
  metadata?: Record<string, unknown> | null;
  isPublic?: boolean;
}

export interface ListMediaQueryDTO {
  page?: number;
  limit?: number;
  search?: string;
  folder?: string;
  source?: string;
  mimeType?: string;
  entityType?: string;
  entityId?: string;
  tag?: string;
  uploaderId?: string;
  isPublic?: boolean;
  sortBy?: "createdAt" | "size" | "fileName" | "updatedAt";
  sortOrder?: "asc" | "desc";
  startDate?: string;
  endDate?: string;
}

export interface MediaFolderStat {
  folder: string;
  count: number;
  sizeBytes: number;
  sizeFormatted: string;
}

export interface MediaMimeStat {
  category: "image" | "video" | "audio" | "document" | "archive" | "other";
  mimeType: string;
  count: number;
  sizeBytes: number;
}

export interface MediaStatsDTO {
  totalFiles: number;
  totalSizeBytes: number;
  totalSizeFormatted: string;
  folders: MediaFolderStat[];
  categories: {
    images: { count: number; sizeBytes: number; sizeFormatted: string };
    videos: { count: number; sizeBytes: number; sizeFormatted: string };
    documents: { count: number; sizeBytes: number; sizeFormatted: string };
    audio: { count: number; sizeBytes: number; sizeFormatted: string };
    archives: { count: number; sizeBytes: number; sizeFormatted: string };
    other: { count: number; sizeBytes: number; sizeFormatted: string };
  };
  sources: Record<string, number>;
}

export interface BulkDeleteMediaDTO {
  ids?: string[];
  keys?: string[];
}

export interface BulkUpdateMediaDTO {
  ids: string[];
  folder?: string;
  tags?: string[];
  isPublic?: boolean;
}
