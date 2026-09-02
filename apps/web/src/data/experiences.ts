// apps/web/src/data/experiences.ts

/**
 * Interface representing a single professional career milestone / experience record.
 * You can edit, add, or reorder experiences directly in this file.
 */
export interface ExperienceItem {
  id?: string
  /** Year milestone shown prominently on desktop timeline (e.g. "2025") */
  year: string
  /** Human-readable period string (e.g. "MAY 2025 — PRESENT") */
  period: string
  /** ISO date string for start date (e.g. "2025-05-01T00:00:00.000Z") */
  startDate?: string | null
  /** ISO date string for end date, or null if currently active */
  endDate?: string | null
  /** Company or Organization name */
  company: string
  /** Optional company website URL */
  companyUrl?: string | null
  /** Optional company logo image URL */
  companyLogo?: string | null
  /** Role title (e.g. "Full Stack Developer") */
  role: string
  /** Segmented title array for styling (e.g. ["Full Stack", "Developer"]) */
  title: string[]
  /** Location and work arrangement (e.g. "Dhaka, Bangladesh · Remote-Friendly") */
  location: string
  /** Employment type: "Full-Time" | "Part-Time" | "Contract" | "Freelance" */
  type: string
  /** High-level summary of your engineering scope and responsibilities */
  description: string
  /** Bullet points of key accomplishments and technical implementations */
  highlights: string[]
  /** Core technologies and tools used during this role */
  technologies: string[]
  /** Impact metrics and key performance indicators (optional) */
  stats?: Array<{ label: string; value: string }>
  /** Architectural or engineering takeaway learned during this tenure (optional) */
  learned?: string
  /** Whether this is your current active role (adds pulsing live badge and animation) */
  isCurrent?: boolean
}

/**
 * Career Milestones & Professional History
 *
 * TO ADD A NEW EXPERIENCE:
 * Duplicate one of the objects below and adjust the details.
 * Items will display in the order listed here.
 */
export const experiences: ExperienceItem[] = [
  {
    year: "2025",
    period: "MAY 2025 — PRESENT",
    startDate: "2025-05-01T00:00:00.000Z",
    endDate: null,
    company: "Softvence Agency",
    companyUrl: "https://softvence.agency",
    role: "Full Stack Developer",
    title: ["Full Stack", "Developer"],
    location: "Dhaka, Bangladesh · Remote-Friendly",
    type: "Full-Time",
    description:
      "Architected type-safe backend systems and high-performance React frontends, implementing decoupled event-driven architectures, real-time messaging, and multi-tier subscription billing.",
    highlights: [
      "Architected type-safe backend systems with TypeScript, Express.js, and Prisma ORM, integrated with React.js frontends to deliver responsive, high-performance applications.",
      "Improved API response times and system reliability by implementing Redis caching and RabbitMQ message brokers to decouple background tasks including AI processing and email dispatch.",
      "Built granular role-based access control (RBAC), real-time bidirectional messaging via WebSockets, and tiered subscription billing using Stripe and Paystack APIs.",
      "Containerized multi-service environments (API servers, workers, databases) with Docker; managed deployments on Linux VPS with AWS S3/MinIO for media storage.",
    ],
    technologies: [
      "TypeScript",
      "Express.js",
      "React.js",
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
    isCurrent: true,
  },
  {
    year: "2024",
    period: "OCT 2024 — MAY 2025",
    startDate: "2024-10-01T00:00:00.000Z",
    endDate: "2025-05-01T00:00:00.000Z",
    company: "Gold Sky Overseas",
    companyUrl: null,
    role: "Web Developer",
    title: ["Web", "Developer"],
    location: "Dhaka, Bangladesh",
    type: "Full-Time",
    description:
      "Developed responsive client-facing web applications, modular UI components, and integrated third-party service workflows for diverse client deliveries.",
    highlights: [
      "Developed dynamic client-facing web applications, responsive user interfaces, and custom feature modules for diverse third-party client projects using Next.js, React.js, and Tailwind CSS.",
      "Integrated secure third-party APIs, authentication workflows, and interactive booking or form-handling pipelines to streamline digital operations for incoming client projects.",
      "Optimized front-end rendering performance, cross-browser compatibility, and modular component architectures to elevate user experience and ensure scalability across multiple concurrent client deliveries.",
    ],
    technologies: [
      "Next.js",
      "React.js",
      "TypeScript",
      "JavaScript",
      "Tailwind CSS",
      "RESTful APIs",
      "Auth Workflows",
      "HTML5/CSS3",
      "Git",
    ],
    isCurrent: false,
  },
]
