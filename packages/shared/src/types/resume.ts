// packages/shared/src/types/resume.ts
import { z } from "zod";
import {
  createResumeSchema,
  updateResumeSchema,
  resumeQuerySchema,
} from "../schemas/resume.schema";

export interface ResumeDTO {
  id: string;
  title: string;
  version: string;
  fileName: string;
  fileUrl: string;
  fileKey: string;
  fileSize: number;
  mimeType: string;
  isActive: boolean;
  description: string | null;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeStatsDTO {
  totalVersions: number;
  activeVersion: string | null;
  activeResumeId: string | null;
  totalDownloads: number;
  latestUpdatedAt: string | null;
}

export type CreateResumeInput = z.infer<typeof createResumeSchema>;
export type UpdateResumeInput = z.infer<typeof updateResumeSchema>;
export type ResumeQueryInput = z.infer<typeof resumeQuerySchema>;
