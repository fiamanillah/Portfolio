export interface ProjectLink {
  live?: string
  github?: string
  caseStudy?: string
}

export interface MetricItem {
  value: string
  label: string
}

export interface Project {
  id: string
  slug?: string
  title: string
  subtitle?: string
  description: string
  role: string
  impact: string
  tech: string[]
  links: ProjectLink
  img: string
  index: string
  status: "Completed" | "Live" | "In Progress" | "Archived"
  year: string
  hasCaseStudy: boolean
  featured?: boolean
  metrics?: MetricItem[]
  highlights?: string[]
}

// Global empty fallback for static safety (all project and case study records are loaded dynamically from the API/DB)
export const projectsData: Project[] = []

export function getCaseStudies(): Project[] {
  return []
}

export function getProjectsWithoutCaseStudy(): Project[] {
  return []
}

export function getAllProjects(): Project[] {
  return []
}
