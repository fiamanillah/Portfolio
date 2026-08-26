export interface ContextBlock {
  label: string
  body: string
}

export interface ArchitectureItem {
  title: string
  subtitle: string
}

export interface ArchitectureLayer {
  name: string
  description: string
  items: ArchitectureItem[]
}

export interface FeatureItem {
  title: string
  description: string
  mediaType: string
  mediaLabel: string
  media: string
  tags?: string[]
  highlights?: string[]
  codeLang?: string
}

export interface PerformanceMetric {
  value: string
  label: string
}

export interface PostMortemEntry {
  heading: string
  detail: string
  code?: string
}

export interface PostMortemSection {
  title: string
  entries: PostMortemEntry[]
}

export interface CaseStudyMetadata {
  label: string
  value: string
}

export interface CaseStudyDetail {
  slug: string
  title: string
  subtitle?: string
  description: string
  projectType?: string
  status: string
  projectStatus?: string
  order?: number
  featured?: boolean
  pinned?: boolean
  techStack: string[]
  liveUrl?: string
  githubUrl?: string
  image: string
  imageLabel?: string
  role?: string
  timeline?: string
  client?: string
  impact?: string
  highlights?: string[]
  views?: number
  likesCount?: number
  publishedAt?: string
  metadata?: CaseStudyMetadata[]
  contextBlocks: ContextBlock[]
  architectureLayers: ArchitectureLayer[]
  features: FeatureItem[]
  metrics: PerformanceMetric[]
  postMortem: PostMortemSection[]
  createdAt?: string
  updatedAt?: string
}
