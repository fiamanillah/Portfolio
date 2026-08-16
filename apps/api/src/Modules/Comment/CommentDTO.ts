// src/Modules/Comment/CommentDTO.ts
import {
  commentStatusEnumSchema,
  commentReportReasonEnumSchema,
  commentReportStatusEnumSchema,
  postCommentSchema as sharedPostCommentSchema,
  createCommentSchema as sharedCreateCommentSchema,
  updateCommentStatusSchema as sharedUpdateCommentStatusSchema,
  postReactionSchema as sharedPostReactionSchema,
  reportCommentSchema as sharedReportCommentSchema,
  resolveCommentReportSchema as sharedResolveCommentReportSchema,
  listPublicCommentsQuerySchema as sharedListPublicCommentsQuerySchema,
  listAdminCommentsQuerySchema as sharedListAdminCommentsQuerySchema,
  listAdminReportsQuerySchema as sharedListAdminReportsQuerySchema,
  bulkCommentStatusSchema as sharedBulkCommentStatusSchema,
  bulkCommentDeleteSchema as sharedBulkCommentDeleteSchema,
} from "@workspace/shared";

export * from "@workspace/shared";

export const commentStatusEnum = commentStatusEnumSchema;
export const commentReportReasonEnum = commentReportReasonEnumSchema;
export const commentReportStatusEnum = commentReportStatusEnumSchema;

export const postCommentSchema = sharedPostCommentSchema;
export const createCommentSchema = sharedCreateCommentSchema;
export const updateCommentStatusSchema = sharedUpdateCommentStatusSchema;
export const postReactionSchema = sharedPostReactionSchema;
export const reportCommentSchema = sharedReportCommentSchema;
export const resolveCommentReportSchema = sharedResolveCommentReportSchema;
export const listPublicCommentsQuerySchema = sharedListPublicCommentsQuerySchema;
export const listAdminCommentsQuerySchema = sharedListAdminCommentsQuerySchema;
export const listAdminReportsQuerySchema = sharedListAdminReportsQuerySchema;
export const bulkCommentStatusSchema = sharedBulkCommentStatusSchema;
export const bulkCommentDeleteSchema = sharedBulkCommentDeleteSchema;

export type CreateCommentDTO = import("@workspace/shared").CreateCommentDTO;
export type UpdateCommentStatusDTO = import("@workspace/shared").UpdateCommentStatusDTO;
export type ReportCommentDTO = import("@workspace/shared").ReportCommentDTO;
export type ResolveCommentReportDTO = import("@workspace/shared").ResolveCommentReportDTO;
export type ListPublicCommentsQueryDTO = import("@workspace/shared").ListPublicCommentsQueryDTO;
export type ListAdminCommentsQueryDTO = import("@workspace/shared").ListAdminCommentsQueryDTO;
export type ListAdminReportsQueryDTO = import("@workspace/shared").ListAdminReportsQueryDTO;
export type BulkCommentStatusDTO = import("@workspace/shared").BulkCommentStatusDTO;
export type BulkCommentDeleteDTO = import("@workspace/shared").BulkCommentDeleteDTO;
