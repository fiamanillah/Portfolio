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

export const projectsData: Project[] = [
  {
    id: "mickanic",
    slug: "mickanic",
    title: "Mickanic",
    subtitle: "Real-Time Bidding & Service Marketplace Platform",
    description:
      "A high-performance REST API and bidding engine for a service-based freelance marketplace, utilizing decoupled microservices, containerized services, and tiered subscriptions.",
    role: "Full Stack Developer",
    impact:
      "Engineered contractor credit/bidding engine with Stripe billing, real-time Socket.io messaging with Redis, and Docker Compose deployment.",
    tech: [
      "TypeScript",
      "Express",
      "Prisma",
      "PostgreSQL",
      "RabbitMQ",
      "Redis",
      "Socket.io",
      "Stripe",
      "Docker",
      "Bun",
    ],
    links: {
      live: "https://mickanic.ca/",
      caseStudy: "/case-study/mickanic",
    },
    img: "/assets/images/mickanic-hero.png",
    index: "01",
    status: "Completed",
    year: "2025 - 2026",
    hasCaseStudy: true,
    featured: true,
    metrics: [
      { value: "3", label: "Distinct user roles" },
      { value: "150", label: "Hourly email sending limit" },
      { value: "100%", label: "Type safety with Prisma" },
    ],
    highlights: [
      "Real-Time Socket.IO messaging with typing indicators",
      "Event-driven RabbitMQ worker queue for async notifications",
      "Tiered Stripe contractor subscription billing",
    ],
  },
  {
    id: "moja-cares",
    slug: "moja-cares",
    title: "Moja Cares",
    subtitle: "Healthcare Management & Patient Care Portal",
    description:
      "Comprehensive healthcare management portal featuring multi-role RBAC, real-time clinical team chats, automated alerts, and AI-powered document insight extraction.",
    role: "Full Stack Developer",
    impact:
      "Architected OpenAI API health insights worker, WebSocket patient-care chat, SES/Postmark alert dispatch, and Paystack billing.",
    tech: [
      "TypeScript",
      "Express",
      "Prisma",
      "Redis",
      "RabbitMQ",
      "WebSockets",
      "OpenAI API",
      "AWS S3",
      "Paystack",
    ],
    links: {
      live: "https://dev.mojacares.com/",
      caseStudy: "/case-study/moja-cares",
    },
    img: "/assets/images/moja-cares-hero.png",
    index: "02",
    status: "Live",
    year: "2026",
    hasCaseStudy: true,
    featured: true,
    metrics: [
      { value: "4", label: "User roles (Admin, Doctor, Nurse, Patient)" },
      { value: "<50ms", label: "WebSocket chat latency" },
      { value: "10k+", label: "Extracted AI medical insights" },
    ],
    highlights: [
      "OpenAI worker for automated clinical record insight extraction",
      "Redis Pub/Sub adapter scaling WebSockets across cluster nodes",
      "Paystack billing & subscription webhooks integration",
    ],
  },
  {
    id: "express-monorepo-template",
    title: "Express Class Monorepo Template",
    subtitle: "Production-ready backend architecture starter",
    description:
      "A modular, class-based Express monorepo template built with TypeScript, Bun, Docker Compose, and automated API documentation for rapid backend deployment.",
    role: "Open Source Creator",
    impact:
      "Standardized backend boilerplate across personal and client projects, reducing initial project setup time by over 70%.",
    tech: ["TypeScript", "Express", "Bun", "Docker", "Turborepo", "Swagger"],
    links: {
      github: "https://github.com/fiamanillah",
    },
    img: "/assets/images/mickanic-cover.png",
    index: "03",
    status: "Completed",
    year: "2026",
    hasCaseStudy: false,
    featured: false,
    highlights: [
      "Strict ESLint & Prettier configuration with monorepo Turborepo pipelines",
      "Class-based controller & service routing architecture",
      "Dockerized development and production compose files",
    ],
  },
  {
    id: "microservice-alert-worker",
    title: "RabbitMQ Microservice Dispatcher",
    subtitle: "High-throughput asynchronous message consumer",
    description:
      "A lightweight, failure-resilient background queue dispatcher service designed to decouple email, SMS, and web-push notifications from core REST APIs.",
    role: "Full Stack Developer",
    impact:
      "Processed thousands of asynchronous notification events daily with automatic retry strategies and dead-letter queue routing.",
    tech: ["Node.js", "RabbitMQ", "Redis", "TypeScript", "AWS SES"],
    links: {
      github: "https://github.com/fiamanillah",
    },
    img: "/assets/images/moja-cares-cover.png",
    index: "04",
    status: "Live",
    year: "2025",
    hasCaseStudy: false,
    featured: false,
    highlights: [
      "Dead-letter exchange handling for failed message redelivery",
      "Rate-limited SMTP dispatching with Redis token buckets",
    ],
  },
]

export function getCaseStudies(): Project[] {
  return projectsData.filter((p) => p.hasCaseStudy)
}

export function getProjectsWithoutCaseStudy(): Project[] {
  return projectsData.filter((p) => !p.hasCaseStudy)
}

export function getAllProjects(): Project[] {
  return projectsData
}
