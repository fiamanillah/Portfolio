// src/Modules/Skill/SkillDTO.ts
export {
  skillStatusEnumSchema,
  createSkillCategorySchema,
  updateSkillCategorySchema,
  reorderSkillCategoriesSchema,
  createSkillSchema,
  updateSkillSchema,
  listSkillsQuerySchema,
  publicSkillQuerySchema,
  bulkSkillStatusSchema,
  bulkSkillDeleteSchema,
  reorderSkillsSchema,
} from "@workspace/shared";

export type {
  SkillStatus,
  CreateSkillCategoryDTO,
  UpdateSkillCategoryDTO,
  ReorderSkillCategoriesDTO,
  CreateSkillDTO,
  UpdateSkillDTO,
  ListSkillsQueryDTO,
  PublicSkillQueryDTO,
  BulkSkillStatusDTO,
  BulkSkillDeleteDTO,
  ReorderSkillsDTO,
  SkillCategoryDTO,
  SkillDTO,
  SkillListItemDTO,
  SkillSectionPublicDTO,
  SkillStatsDTO,
} from "@workspace/shared";
