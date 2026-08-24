// apps/api/src/Modules/Redirect/RedirectDTO.ts
export {
  redirectEntityTypeEnum,
  createRedirectSchema,
  updateRedirectSchema,
  queryRedirectsSchema,
  resolveRedirectSchema,
  bulkDeleteRedirectsSchema,
} from "@workspace/shared";

export type {
  RedirectEntityType,
  CreateRedirectDTO,
  UpdateRedirectDTO,
  QueryRedirectsDTO,
  ResolveRedirectDTO,
  BulkDeleteRedirectsDTO,
  RedirectDTO,
  ResolvedRedirectDTO,
  RedirectStatsDTO,
} from "@workspace/shared";
