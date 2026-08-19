// apps/api/src/Modules/Resume/ResumeDTO.ts
import {
  createResumeSchema as sharedCreateResumeSchema,
  updateResumeSchema as sharedUpdateResumeSchema,
  resumeQuerySchema as sharedResumeQuerySchema,
} from "@workspace/shared"

export * from "@workspace/shared"

export const createResumeSchema = {
  body: sharedCreateResumeSchema,
}

export const updateResumeSchema = {
  body: sharedUpdateResumeSchema,
}

export const resumeQuerySchema = {
  query: sharedResumeQuerySchema,
}

export type CreateResumeDTO = import("@workspace/shared").CreateResumeInput
export type UpdateResumeDTO = import("@workspace/shared").UpdateResumeInput
export type ResumeQueryDTO = import("@workspace/shared").ResumeQueryInput
