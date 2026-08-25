// packages/shared/src/types/skill.ts
import type { z } from "zod";
import type {
  skillStatusEnumSchema,
  createSkillSchema,
  updateSkillSchema,
  listSkillsQuerySchema,
  publicSkillQuerySchema,
  bulkSkillStatusSchema,
  bulkSkillDeleteSchema,
  reorderSkillsSchema,
  createSkillCategorySchema,
  updateSkillCategorySchema,
  reorderSkillCategoriesSchema,
} from "../schemas/skill.schema";

export type SkillStatus = z.infer<typeof skillStatusEnumSchema>;

export type CreateSkillCategoryDTO = z.input<typeof createSkillCategorySchema>;
export type UpdateSkillCategoryDTO = z.input<typeof updateSkillCategorySchema>;
export type ReorderSkillCategoriesDTO = z.input<typeof reorderSkillCategoriesSchema>;

export type CreateSkillDTO = z.input<typeof createSkillSchema>;
export type UpdateSkillDTO = z.input<typeof updateSkillSchema>;
export type ListSkillsQueryDTO = z.infer<typeof listSkillsQuerySchema>;
export type PublicSkillQueryDTO = z.infer<typeof publicSkillQuerySchema>;
export type BulkSkillStatusDTO = z.infer<typeof bulkSkillStatusSchema>;
export type BulkSkillDeleteDTO = z.infer<typeof bulkSkillDeleteSchema>;
export type ReorderSkillsDTO = z.infer<typeof reorderSkillsSchema>;

export interface SkillCategoryDTO {
  id: string;
  slug: string;
  code: string;
  title: string;
  badge: string;
  ordinal?: string | null;
  suffix?: string | null;
  icon?: string | null;
  color?: string | null;
  description?: string | null;
  order: number;
  status: SkillStatus;
  skillsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SkillDTO {
  id: string;
  name: string;
  leftLabel?: string | null;
  rightLabel?: string | null;
  level: number;
  icon?: string | null;
  tags: string[];
  featured: boolean;
  order: number;
  status: SkillStatus;
  categoryId?: string | null;
  category?: {
    id: string;
    slug: string;
    code: string;
    title: string;
    badge: string;
    color?: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface SkillListItemDTO {
  id: string;
  name: string;
  leftLabel?: string | null;
  rightLabel?: string | null;
  level: number;
  icon?: string | null;
  tags: string[];
  featured: boolean;
  order: number;
  status: SkillStatus;
  categoryId?: string | null;
  categoryName?: string | null;
  categoryCode?: string | null;
  categoryBadge?: string | null;
  categoryColor?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SkillPublicItemDTO {
  title: string;
  left: string;
  right: string;
  level?: number;
  tags?: string[];
  icon?: string | null;
}

export interface SkillSectionPublicDTO {
  code: string;
  ordinal: string;
  suffix: string;
  label: string;
  badge: string;
  icon?: string | null;
  color?: string | null;
  items: SkillPublicItemDTO[];
}

export interface SkillStatsDTO {
  totalSkills: number;
  publishedCount: number;
  draftCount: number;
  archivedCount: number;
  totalCategories: number;
  featuredCount: number;
  categoryBreakdown: Array<{
    id: string;
    code: string;
    name: string;
    count: number;
  }>;
  topTags: Array<{
    name: string;
    count: number;
  }>;
}
