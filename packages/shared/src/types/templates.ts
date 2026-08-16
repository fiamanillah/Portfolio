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

export interface EmailTemplate {
  id: string;
  slug?: string;
  name: string;
  subject: string;
  body: string;
  type: EmailTemplateType;
  description?: string | null;
  from?: string | null;
  fromName?: string | null;
  replyTo?: string | null;
  plunkId?: string | null;
  variables: Record<string, any>;
  isActive: boolean;
  isSystem?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SystemTemplateDefinition {
  name: string;
  subject: string;
  body: string;
  type: EmailTemplateType;
  description: string;
  variables: Record<string, any>;
}
