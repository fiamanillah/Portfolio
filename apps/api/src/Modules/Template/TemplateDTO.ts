// src/Modules/Template/TemplateDTO.ts
import {
  templateTypeEnumSchema,
  createTemplateSchema as sharedCreateTemplateSchema,
  updateTemplateSchema as sharedUpdateTemplateSchema,
  previewTemplateSchema as sharedPreviewTemplateSchema,
  sendTestEmailSchema as sharedSendTestEmailSchema,
  listTemplatesQuerySchema as sharedListTemplatesQuerySchema,
} from "@workspace/shared"

export * from "@workspace/shared"

export const TemplateTypeEnum = templateTypeEnumSchema

export const createTemplateSchema = sharedCreateTemplateSchema
export const updateTemplateSchema = sharedUpdateTemplateSchema
export const previewTemplateSchema = sharedPreviewTemplateSchema
export const sendTestEmailSchema = sharedSendTestEmailSchema
export const listTemplatesQuerySchema = sharedListTemplatesQuerySchema

export type CreateTemplateDTO = import("@workspace/shared").CreateTemplateDTO
export type UpdateTemplateDTO = import("@workspace/shared").UpdateTemplateDTO
export type PreviewTemplateDTO = import("@workspace/shared").PreviewTemplateDTO
export type SendTestEmailDTO = import("@workspace/shared").SendTestEmailDTO
export type ListTemplatesQueryDTO =
  import("@workspace/shared").ListTemplatesQueryDTO
