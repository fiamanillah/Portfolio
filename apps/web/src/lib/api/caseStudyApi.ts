import type {
  CaseStudyDetail,
  ContextBlock as WebContextBlock,
  ArchitectureLayer as WebArchitectureLayer,
  FeatureItem as WebFeatureItem,
  PerformanceMetric as WebPerformanceMetric,
  PostMortemSection as WebPostMortemSection,
  CaseStudyMetadata,
} from "@/data/caseStudies"
import type { CaseStudyDTO } from "@workspace/shared"
import { RedirectApi } from "./redirectApi"
import { getApiBaseUrl } from "./baseUrl"

const API_BASE_URL = getApiBaseUrl()

export interface PublicCaseStudyQuery {
  page?: number
  limit?: number
  tech?: string
  search?: string
  featured?: boolean
  sortBy?: "order" | "publishedAt" | "views" | "likesCount"
  sortOrder?: "asc" | "desc"
}

export interface PaginatedCaseStudiesResponse {
  caseStudies: CaseStudyDetail[]
  totalCount: number
  totalPages: number
  currentPage: number
  hasMore: boolean
}

export interface SingleCaseStudyResponse {
  caseStudy?: CaseStudyDetail
  prevCaseStudy: CaseStudyDetail | null
  nextCaseStudy: CaseStudyDetail | null
  relatedCaseStudies: CaseStudyDetail[]
  redirected?: boolean
  destination?: string
  statusCode?: number
}

/**
 * Format raw API Case Study DTO into frontend CaseStudyDetail interface
 */
export function mapApiCaseStudyToDetail(
  dto: CaseStudyDTO | Record<string, unknown>
): CaseStudyDetail {
  const metadata: CaseStudyMetadata[] = Array.isArray(dto.metadata)
    ? dto.metadata.map((m: { label: string; value: string }) => ({
        label: m.label,
        value: m.value,
      }))
    : [
        {
          label: "Role",
          value: (dto.role as string) || "Full Stack Developer",
        },
        { label: "Timeline", value: (dto.timeline as string) || "2026" },
        {
          label: "Client / Company",
          value: (dto.client as string) || (dto.title as string),
        },
        {
          label: "Tech Stack",
          value: Array.isArray(dto.techStack)
            ? dto.techStack.slice(0, 4).join(", ")
            : "TypeScript, Bun, PostgreSQL",
        },
      ]

  const contextBlocks: WebContextBlock[] = Array.isArray(dto.contextBlocks)
    ? dto.contextBlocks.map((b: { label: string; body: string }) => ({
        label: b.label,
        body: b.body,
      }))
    : []

  const architectureLayers: WebArchitectureLayer[] = Array.isArray(
    dto.architectureLayers
  )
    ? (
        dto.architectureLayers as Array<{
          name: string
          description?: string
          items?: Array<{ title: string; subtitle?: string | null }>
        }>
      ).map((l) => ({
        name: l.name,
        description: l.description || "",
        items: Array.isArray(l.items)
          ? l.items.map((it) => ({
              title: it.title,
              subtitle: it.subtitle || "",
            }))
          : [],
      }))
    : []

  const features: WebFeatureItem[] = Array.isArray(dto.features)
    ? (
        dto.features as Array<{
          title: string
          description: string
          mediaType?: string
          mediaLabel?: string
          media?: string
          tags?: string[]
          highlights?: string[]
          codeLang?: string
        }>
      ).map((f) => ({
        title: f.title,
        description: f.description,
        mediaType: f.mediaType || "Image / Video",
        mediaLabel: f.mediaLabel || "Feature Screenshot",
        media: f.media || "/placeholder.png",
        tags: Array.isArray(f.tags) ? f.tags : [],
        highlights: Array.isArray(f.highlights) ? f.highlights : [],
        codeLang: f.codeLang || undefined,
      }))
    : []

  const metrics: WebPerformanceMetric[] = Array.isArray(dto.metrics)
    ? (dto.metrics as Array<{ value: string; label: string }>).map((m) => ({
        value: m.value,
        label: m.label,
      }))
    : []

  const postMortem: WebPostMortemSection[] = Array.isArray(dto.postMortem)
    ? (
        dto.postMortem as Array<{
          title: string
          entries?: Array<{
            heading: string
            detail: string
            code?: string | null
          }>
        }>
      ).map((pm) => ({
        title: pm.title,
        entries: Array.isArray(pm.entries)
          ? pm.entries.map((e) => ({
              heading: e.heading,
              detail: e.detail,
              code: e.code || undefined,
            }))
          : [],
      }))
    : []

  return {
    slug: (dto.slug as string) || "",
    title: (dto.title as string) || "",
    subtitle: (dto.subtitle as string) || undefined,
    description: (dto.description as string) || "",
    projectType:
      (dto.projectType as
        | "Full-Stack"
        | "Frontend"
        | "Backend"
        | "Mobile"
        | "DevOps"
        | "AI/ML"
        | "System Architecture") || "Full-Stack",
    status:
      (dto.status as
        | "Published"
        | "In Development"
        | "Case Study Coming Soon"
        | "Archived"
        | "Draft") || "Published",
    projectStatus: (dto.projectStatus as string) || "Active Production",
    order: typeof dto.order === "number" ? dto.order : 0,
    featured: Boolean(dto.featured),
    pinned: Boolean(dto.pinned),
    techStack: Array.isArray(dto.techStack) ? (dto.techStack as string[]) : [],
    liveUrl: (dto.liveUrl as string) || undefined,
    githubUrl: (dto.githubUrl as string) || undefined,
    image: (dto.image as string) || "/placeholder.png",
    imageLabel: (dto.imageLabel as string) || undefined,
    role: (dto.role as string) || undefined,
    timeline: (dto.timeline as string) || undefined,
    client: (dto.client as string) || undefined,
    impact: (dto.impact as string) || undefined,
    highlights: Array.isArray(dto.highlights)
      ? (dto.highlights as string[])
      : [],
    views: typeof dto.views === "number" ? dto.views : 0,
    likesCount: typeof dto.likesCount === "number" ? dto.likesCount : 0,
    publishedAt: (dto.publishedAt as string) || undefined,
    metadata,
    contextBlocks,
    architectureLayers,
    features,
    metrics,
    postMortem,
  }
}

export const CaseStudyApi = {
  /**
   * Fetch published case studies with pagination, filters, and search directly from API
   */
  async fetchPublicCaseStudies(
    query: PublicCaseStudyQuery = {}
  ): Promise<PaginatedCaseStudiesResponse> {
    try {
      const params = new URLSearchParams()
      if (query.page) params.set("page", String(query.page))
      if (query.limit) params.set("limit", String(query.limit))
      if (query.tech) params.set("tech", query.tech)
      if (query.search) params.set("search", query.search)
      if (query.featured !== undefined)
        params.set("featured", String(query.featured))
      if (query.sortBy) params.set("sortBy", query.sortBy)
      if (query.sortOrder) params.set("sortOrder", query.sortOrder)

      const res = await fetch(
        `${API_BASE_URL}/case-studies/v1/public?${params.toString()}`,
        {
          headers: { "Content-Type": "application/json" },
        }
      )

      if (res.ok) {
        const body = await res.json()
        if (body.success && Array.isArray(body.data)) {
          const caseStudies = body.data.map(mapApiCaseStudyToDetail)
          const pagination = body.pagination || {
            total: caseStudies.length,
            totalPages: 1,
            page: 1,
            hasNext: false,
          }
          return {
            caseStudies,
            totalCount: pagination.total ?? caseStudies.length,
            totalPages: pagination.totalPages ?? 1,
            currentPage: pagination.page ?? 1,
            hasMore: Boolean(pagination.hasNext),
          }
        }
      }
    } catch (err) {
      console.warn("Failed to fetch public case studies from backend API:", err)
    }

    return {
      caseStudies: [],
      totalCount: 0,
      totalPages: 1,
      currentPage: 1,
      hasMore: false,
    }
  },

  /**
   * Fetch all case studies for static generation, index, or sitemap directly from API
   */
  async fetchAllCaseStudies(): Promise<CaseStudyDetail[]> {
    try {
      const res = await fetch(
        `${API_BASE_URL}/case-studies/v1/public?limit=100`,
        {
          headers: { "Content-Type": "application/json" },
        }
      )

      if (res.ok) {
        const body = await res.json()
        if (body.success && Array.isArray(body.data)) {
          return body.data.map(mapApiCaseStudyToDetail)
        }
      }
    } catch (err) {
      console.warn("Failed to fetch all case studies from backend API:", err)
    }

    return []
  },

  /**
   * Fetch single case study details by slug with adjacent navigation directly from API
   */
  async fetchCaseStudyBySlug(
    slug: string,
    incrementView: boolean = true
  ): Promise<SingleCaseStudyResponse | null> {
    try {
      const url = `${API_BASE_URL}/case-studies/v1/public/slug/${encodeURIComponent(slug)}${incrementView ? "" : "?noView=true"}`
      const res = await fetch(url, {
        headers: { "Content-Type": "application/json" },
      })

      if (res.ok) {
        const body = await res.json()
        if (body.success && body.data) {
          const raw = body.data

          // If backend indicated a 301/308 redirect for this case study slug
          if (raw.redirected && raw.destination) {
            return {
              caseStudy: undefined,
              prevCaseStudy: null,
              nextCaseStudy: null,
              relatedCaseStudies: [],
              redirected: true,
              destination: raw.destination,
              statusCode: raw.statusCode || 301,
            }
          }

          const caseStudy = mapApiCaseStudyToDetail(raw.caseStudy || raw)
          const prevCaseStudy = raw.prevCaseStudy
            ? mapApiCaseStudyToDetail(raw.prevCaseStudy)
            : null
          const nextCaseStudy = raw.nextCaseStudy
            ? mapApiCaseStudyToDetail(raw.nextCaseStudy)
            : null
          const relatedCaseStudies = Array.isArray(raw.relatedCaseStudies)
            ? raw.relatedCaseStudies.map(mapApiCaseStudyToDetail)
            : []

          return {
            caseStudy,
            prevCaseStudy,
            nextCaseStudy,
            relatedCaseStudies,
          }
        }
      } else {
        // If 404, check fallback redirect resolver
        const directRedirect = await RedirectApi.resolveRedirect(
          `/case-study/${slug}`
        )
        if (directRedirect?.redirected && directRedirect.destination) {
          return {
            caseStudy: undefined,
            prevCaseStudy: null,
            nextCaseStudy: null,
            relatedCaseStudies: [],
            redirected: true,
            destination: directRedirect.destination,
            statusCode: directRedirect.statusCode || 301,
          }
        }
      }
    } catch (err) {
      console.warn(
        `Failed to fetch case study '${slug}' from backend API:`,
        err
      )
    }

    return null
  },

  /**
   * React / like a case study
   */
  async reactToCaseStudy(
    slug: string,
    reactionType: string = "like"
  ): Promise<{ likesCount: number } | null> {
    try {
      const res = await fetch(
        `${API_BASE_URL}/case-studies/v1/public/slug/${encodeURIComponent(slug)}/react`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reactionType }),
        }
      )

      if (res.ok) {
        const body = await res.json()
        if (body.success && body.data) {
          return { likesCount: body.data.likesCount }
        }
      }
    } catch (err) {
      console.error(`Failed to react to case study '${slug}':`, err)
    }
    return null
  },
}
