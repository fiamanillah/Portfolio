// apps/web/src/lib/api/experienceApi.ts

import { getApiBaseUrl } from "./baseUrl"

const API_BASE_URL = getApiBaseUrl()

export interface ExperienceItem {
  id?: string
  year: string
  period: string
  company: string
  companyUrl?: string | null
  companyLogo?: string | null
  role: string
  title: string[]
  location: string
  type: string
  description: string
  highlights: string[]
  technologies: string[]
  stats: Array<{ label: string; value: string }>
  learned: string
  isCurrent?: boolean
}

export const defaultExperiences: ExperienceItem[] = [
  {
    year: "2025",
    period: "PRESENT // 14 MO",
    company: "Softvence Agency",
    companyUrl: "https://softvence.agency",
    role: "FULL STACK DEVELOPER",
    title: ["FULL STACK", "DEVELOPER"],
    location: "Dhaka, Bangladesh · Remote-Friendly",
    type: "Full-Time",
    description:
      "Architected type-safe backend systems with TypeScript, Express.js, and Prisma ORM, integrated with React.js frontends to deliver responsive, high-performance applications.",
    highlights: [
      "Decoupled intensive background tasks like email and AI processing using RabbitMQ message brokers",
      "Improved database query latency and API response times by implementing Redis caching",
      "Built granular role-based access control (RBAC), real-time WebSockets, and Stripe/Paystack tiered subscription billing",
      "Containerized multi-service environments with Docker and managed VPS deployments with AWS S3/MinIO media storage",
    ],
    technologies: [
      "TypeScript",
      "Express.js",
      "Prisma ORM",
      "PostgreSQL",
      "Redis",
      "RabbitMQ",
      "WebSockets",
      "Stripe",
      "Paystack",
      "Docker",
      "AWS S3",
      "MinIO",
      "Linux VPS",
    ],
    stats: [
      { label: "Background Queues", value: "RabbitMQ" },
      { label: "Billing Systems", value: "Stripe & Paystack" },
      { label: "Storage Providers", value: "AWS S3 / MinIO" },
    ],
    learned:
      "Mastered decoupling intensive background jobs and optimizing database access patterns to ensure seamless scalability and real-time reliability under load.",
    isCurrent: true,
  },
]

export const ExperienceApi = {
  /**
   * Fetch published experiences from the backend API with robust fallback
   */
  async fetchPublicExperiences(): Promise<ExperienceItem[]> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 4000)

      const res = await fetch(`${API_BASE_URL}/experiences/v1/public`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (!res.ok) {
        return defaultExperiences
      }

      const json = await res.json()
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const rawItems = json.data as Array<{
          id: string
          year?: string
          period?: string
          company: string
          companyUrl?: string | null
          companyLogo?: string | null
          role: string
          title?: string[] | null
          location?: string
          employmentType?: string
          description: string
          highlights?: string[]
          technologies?: string[]
          stats?: Array<{ label: string; value: string }>
          learned?: string | null
          isCurrent?: boolean
        }>
        const items = rawItems.map((item) => ({
          id: item.id,
          year: item.year || "2025",
          period: item.period || "PRESENT",
          company: item.company,
          companyUrl: item.companyUrl,
          companyLogo: item.companyLogo,
          role: item.role,
          title:
            Array.isArray(item.title) && item.title.length > 0
              ? item.title
              : item.role
                ? item.role.split(" ")
                : ["DEVELOPER"],
          location: item.location || "Remote",
          type: item.employmentType || "Full-Time",
          description: item.description,
          highlights: Array.isArray(item.highlights) ? item.highlights : [],
          technologies: Array.isArray(item.technologies)
            ? item.technologies
            : [],
          stats: Array.isArray(item.stats) ? item.stats : [],
          learned: item.learned || "",
          isCurrent: item.isCurrent ?? false,
        }))

        return items.length > 0 ? items : defaultExperiences
      }

      return defaultExperiences
    } catch {
      return defaultExperiences
    }
  },
}
