import mickanicData from "./case-studies/mickanic.json"
import mojaCaresData from "./case-studies/moja-cares.json"

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
  description: string
  status: string
  techStack: string[]
  liveUrl?: string
  githubUrl?: string
  image: string
  imageLabel?: string
  metadata?: CaseStudyMetadata[]
  contextBlocks: ContextBlock[]
  architectureLayers: ArchitectureLayer[]
  features: FeatureItem[]
  metrics: PerformanceMetric[]
  postMortem: PostMortemSection[]
}

export const caseStudiesRegistry: Record<string, CaseStudyDetail> = {
  mickanic: mickanicData as CaseStudyDetail,
  "moja-cares": mojaCaresData as CaseStudyDetail,
}

export function getCaseStudyDetail(slug: string): CaseStudyDetail | undefined {
  return caseStudiesRegistry[slug]
}

export function getAllCaseStudyDetails(): CaseStudyDetail[] {
  return Object.values(caseStudiesRegistry)
}
