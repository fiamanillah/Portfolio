// src/Modules/Blog/BlogDTO.ts
import {
  blogStatusEnumSchema,
  blogArticleTypeEnumSchema,
  blogAuthorSchema,
  blogSeoSchema,
  createBlogPostSchema as sharedCreateBlogPostSchema,
  updateBlogPostSchema as sharedUpdateBlogPostSchema,
  createBlogCategorySchema as sharedCreateBlogCategorySchema,
  updateBlogCategorySchema as sharedUpdateBlogCategorySchema,
  createBlogTagSchema as sharedCreateBlogTagSchema,
  updateBlogTagSchema as sharedUpdateBlogTagSchema,
  listBlogPostsQuerySchema as sharedListBlogPostsQuerySchema,
  publicBlogQuerySchema as sharedPublicBlogQuerySchema,
  bulkBlogStatusSchema as sharedBulkBlogStatusSchema,
  bulkBlogDeleteSchema as sharedBulkBlogDeleteSchema,
  seoPreviewSchema as sharedSeoPreviewSchema,
  reactToBlogSchema as sharedReactToBlogSchema,
} from "@workspace/shared"

export * from "@workspace/shared"

export const BlogStatusEnum = blogStatusEnumSchema
export const BlogArticleTypeEnum = blogArticleTypeEnumSchema
export const BlogAuthorSchema = blogAuthorSchema
export const BlogSeoSchema = blogSeoSchema

export const createBlogPostSchema = sharedCreateBlogPostSchema
export const updateBlogPostSchema = sharedUpdateBlogPostSchema
export const createBlogCategorySchema = sharedCreateBlogCategorySchema
export const updateBlogCategorySchema = sharedUpdateBlogCategorySchema
export const createBlogTagSchema = sharedCreateBlogTagSchema
export const updateBlogTagSchema = sharedUpdateBlogTagSchema
export const listBlogPostsQuerySchema = sharedListBlogPostsQuerySchema
export const publicBlogQuerySchema = sharedPublicBlogQuerySchema
export const bulkBlogStatusSchema = sharedBulkBlogStatusSchema
export const bulkBlogDeleteSchema = sharedBulkBlogDeleteSchema
export const seoPreviewSchema = sharedSeoPreviewSchema
export const reactToBlogSchema = sharedReactToBlogSchema

export type CreateBlogPostDTO = import("@workspace/shared").CreateBlogPostDTO
export type UpdateBlogPostDTO = import("@workspace/shared").UpdateBlogPostDTO
export type CreateBlogCategoryDTO =
  import("@workspace/shared").CreateBlogCategoryDTO
export type UpdateBlogCategoryDTO =
  import("@workspace/shared").UpdateBlogCategoryDTO
export type CreateBlogTagDTO = import("@workspace/shared").CreateBlogTagDTO
export type UpdateBlogTagDTO = import("@workspace/shared").UpdateBlogTagDTO
export type ListBlogPostsQueryDTO =
  import("@workspace/shared").ListBlogPostsQueryDTO
export type PublicBlogQueryDTO = import("@workspace/shared").PublicBlogQueryDTO
export type BulkBlogStatusDTO = import("@workspace/shared").BulkBlogStatusDTO
export type BulkBlogDeleteDTO = import("@workspace/shared").BulkBlogDeleteDTO
export type SeoPreviewDTO = import("@workspace/shared").SeoPreviewDTO
