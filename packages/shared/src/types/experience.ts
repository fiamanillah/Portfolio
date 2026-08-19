// packages/shared/src/types/experience.ts
import type { z } from "zod";
import type {
  experienceStatusEnumSchema,
  experienceStatItemSchema,
  createExperienceSchema,
  updateExperienceSchema,
  listExperiencesQuerySchema,
  publicExperienceQuerySchema,
  bulkExperienceStatusSchema,
  bulkExperienceDeleteSchema,
  reorderExperiencesSchema,
} from "../schemas/experience.schema";

export type ExperienceStatus = z.infer<typeof experienceStatusEnumSchema>;
export type ExperienceStatItem = z.infer<typeof experienceStatItemSchema>;

export type CreateExperienceDTO = z.infer<typeof createExperienceSchema>;
export type UpdateExperienceDTO = z.infer<typeof updateExperienceSchema>;
export type ListExperiencesQueryDTO = z.infer<typeof listExperiencesQuerySchema>;
export type PublicExperienceQueryDTO = z.infer<typeof publicExperienceQuerySchema>;
export type BulkExperienceStatusDTO = z.infer<typeof bulkExperienceStatusSchema>;
export type BulkExperienceDeleteDTO = z.infer<typeof bulkExperienceDeleteSchema>;
export type ReorderExperiencesDTO = z.infer<typeof reorderExperiencesSchema>;

export interface ExperienceDTO {
  id: string;
  company: string;
  companyUrl?: string | null;
  companyLogo?: string | null;
  role: string;
  title: string[];
  location: string;
  employmentType: string;
  period: string;
  year: string;
  startDate?: string | null;
  endDate?: string | null;
  isCurrent: boolean;
  description: string;
  highlights: string[];
  technologies: string[];
  stats: ExperienceStatItem[];
  learned?: string | null;
  status: ExperienceStatus;
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExperienceListItemDTO {
  id: string;
  company: string;
  companyUrl?: string | null;
  companyLogo?: string | null;
  role: string;
  title: string[];
  location: string;
  employmentType: string;
  period: string;
  year: string;
  startDate?: string | null;
  endDate?: string | null;
  isCurrent: boolean;
  description: string;
  highlights: string[];
  technologies: string[];
  stats: ExperienceStatItem[];
  learned?: string | null;
  status: ExperienceStatus;
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExperienceStatsDTO {
  totalExperiences: number;
  publishedCount: number;
  draftCount: number;
  archivedCount: number;
  currentRolesCount: number;
  totalCompaniesCount: number;
  totalTechnologiesCount: number;
  topTechnologies: Array<{
    name: string;
    count: number;
  }>;
}
