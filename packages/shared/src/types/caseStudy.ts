// packages/shared/src/types/caseStudy.ts
import type { z } from "zod";
import type {
  caseStudyStatusEnumSchema,
  caseStudyTypeEnumSchema,
  caseStudyMetadataItemSchema,
  contextBlockSchema,
  architectureItemSchema,
  architectureLayerSchema,
  featureItemSchema,
  performanceMetricSchema,
  postMortemEntrySchema,
  postMortemSectionSchema,
  caseStudyAuthorSchema,
  caseStudySeoSchema,
  createCaseStudySchema,
  updateCaseStudySchema,
  listCaseStudiesQuerySchema,
  publicCaseStudyQuerySchema,
  bulkCaseStudyStatusSchema,
  bulkCaseStudyDeleteSchema,
  reorderCaseStudiesSchema,
} from "../schemas/caseStudy.schema";

export type CaseStudyStatus = z.infer<typeof caseStudyStatusEnumSchema>;
export type CaseStudyType = z.infer<typeof caseStudyTypeEnumSchema>;
export type CaseStudyMetadataItem = z.infer<typeof caseStudyMetadataItemSchema>;
export type ContextBlock = z.infer<typeof contextBlockSchema>;
export type ArchitectureItem = z.infer<typeof architectureItemSchema>;
export type ArchitectureLayer = z.infer<typeof architectureLayerSchema>;
export type FeatureItem = z.infer<typeof featureItemSchema>;
export type PerformanceMetric = z.infer<typeof performanceMetricSchema>;
export type PostMortemEntry = z.infer<typeof postMortemEntrySchema>;
export type PostMortemSection = z.infer<typeof postMortemSectionSchema>;
export type CaseStudyAuthor = z.infer<typeof caseStudyAuthorSchema>;
export type CaseStudySeo = z.infer<typeof caseStudySeoSchema>;

export type CreateCaseStudyDTO = z.infer<typeof createCaseStudySchema>;
export type UpdateCaseStudyDTO = z.infer<typeof updateCaseStudySchema>;
export type ListCaseStudiesQueryDTO = z.infer<typeof listCaseStudiesQuerySchema>;
export type PublicCaseStudyQueryDTO = z.infer<typeof publicCaseStudyQuerySchema>;
export type BulkCaseStudyStatusDTO = z.infer<typeof bulkCaseStudyStatusSchema>;
export type BulkCaseStudyDeleteDTO = z.infer<typeof bulkCaseStudyDeleteSchema>;
export type ReorderCaseStudiesDTO = z.infer<typeof reorderCaseStudiesSchema>;

export interface CaseStudyDTO {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  description: string;
  projectType: CaseStudyType;
  status: CaseStudyStatus;
  projectStatus: string;
  order: number;
  featured: boolean;
  pinned: boolean;
  techStack: string[];
  liveUrl?: string | null;
  githubUrl?: string | null;
  image: string;
  imageLabel?: string | null;
  role?: string | null;
  timeline?: string | null;
  client?: string | null;
  impact?: string | null;
  highlights: string[];
  views: number;
  likesCount: number;
  publishedAt?: string | null;
  authorId?: string | null;
  authorName?: string | null;
  authorRole?: string | null;
  authorAvatar?: string | null;
  authorTwitter?: string | null;
  authorLinkedin?: string | null;
  authorGithub?: string | null;
  author?: CaseStudyAuthor;
  metadata: CaseStudyMetadataItem[];
  contextBlocks: ContextBlock[];
  architectureLayers: ArchitectureLayer[];
  features: FeatureItem[];
  metrics: PerformanceMetric[];
  postMortem: PostMortemSection[];
  seo?: CaseStudySeo;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string[];
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  twitterCard?: string | null;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterImage?: string | null;
  canonicalUrl?: string | null;
  structuredData?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export interface CaseStudyListItemDTO {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  description: string;
  projectType: CaseStudyType;
  status: CaseStudyStatus;
  projectStatus: string;
  order: number;
  featured: boolean;
  pinned: boolean;
  techStack: string[];
  liveUrl?: string | null;
  githubUrl?: string | null;
  image: string;
  imageLabel?: string | null;
  role?: string | null;
  timeline?: string | null;
  client?: string | null;
  impact?: string | null;
  highlights: string[];
  metadata?: CaseStudyMetadataItem[];
  contextBlocks?: ContextBlock[];
  architectureLayers?: ArchitectureLayer[];
  features?: FeatureItem[];
  metrics?: PerformanceMetric[];
  postMortem?: PostMortemSection[];
  views: number;
  likesCount: number;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CaseStudyStatsDTO {
  totalCaseStudies: number;
  publishedCount: number;
  draftCount: number;
  archivedCount: number;
  featuredCount: number;
  totalViews: number;
  totalLikes: number;
  topCaseStudies: Array<{
    id: string;
    slug: string;
    title: string;
    views: number;
    likesCount: number;
  }>;
  techStackBreakdown: Array<{
    name: string;
    count: number;
  }>;
}

export interface SingleCaseStudyPublicResponse {
  caseStudy: CaseStudyDTO;
  prevCaseStudy: CaseStudyListItemDTO | null;
  nextCaseStudy: CaseStudyListItemDTO | null;
  relatedCaseStudies: CaseStudyListItemDTO[];
}
