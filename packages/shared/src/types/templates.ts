// packages/shared/src/types/templates.ts
import { z } from "zod";
import {
  templateTypeEnumSchema,
  createTemplateSchema,
  updateTemplateSchema,
  previewTemplateSchema,
  sendTestEmailSchema,
  listTemplatesQuerySchema,
} from "../schemas/template.schema";

export type EmailTemplateType = z.infer<typeof templateTypeEnumSchema>;
export type CreateTemplateDTO = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateDTO = z.infer<typeof updateTemplateSchema>;
export type PreviewTemplateDTO = z.infer<typeof previewTemplateSchema>;
export type SendTestEmailDTO = z.infer<typeof sendTestEmailSchema>;
export type ListTemplatesQueryDTO = z.infer<typeof listTemplatesQuerySchema>;

export type TemplateSource = "ALL" | "CODEBASE" | "CUSTOM";
export type TemplateSyncStatus = "ALL" | "SYNCED" | "LOCAL";

export interface EmailTemplate {
  id: string;
  slug: string;
  name: string;
  subject: string;
  body: string;
  type: EmailTemplateType;
  description?: string | null;
  from?: string | null;
  fromName?: string | null;
  replyTo?: string | null;
  plunkId?: string | null;
  variables?: Record<string, unknown> | string[];
  isActive?: boolean;
  isSystem?: boolean;
  syncedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  sampleData?: Record<string, unknown>;
}

export interface TemplateStats {
  total: number;
  systemCount: number;
  customCount: number;
  plunkSyncedCount: number;
  typesCount: Record<string, number>;
}

export interface AdminTemplateQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: EmailTemplateType | "ALL";
  source?: TemplateSource;
  syncStatus?: TemplateSyncStatus;
  isSystem?: boolean;
  sortBy?: "name" | "slug" | "type" | "createdAt" | "updatedAt" | "syncedAt";
  sortOrder?: "asc" | "desc";
}

export interface SystemTemplateDefinition {
  slug: string;
  name: string;
  subject: string;
  body: string;
  type: EmailTemplateType;
  description: string;
  from?: string;
  fromName?: string;
  replyTo?: string;
  isSystem: boolean;
  sampleData: Record<string, unknown>;
}
