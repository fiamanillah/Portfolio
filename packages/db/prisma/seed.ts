import { prisma, Role, ExperienceStatus, SkillStatus } from "../src/index"
import { loadEnv } from "@workspace/env/loader"
import fs from "node:fs/promises"
import path from "node:path"

// Capture explicit CLI / shell environment variables before dotenv loading
const cliAdminEmail = process.env.DEFAULT_ADMIN_EMAIL || process.env.ADMIN_EMAIL
const cliAdminPassword =
  process.env.DEFAULT_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD
const cliAdminName = process.env.DEFAULT_ADMIN_NAME || process.env.ADMIN_NAME
const cliAdminUsername =
  process.env.DEFAULT_ADMIN_USERNAME || process.env.ADMIN_USERNAME
const cliAdminHeadline =
  process.env.DEFAULT_ADMIN_HEADLINE || process.env.ADMIN_HEADLINE
const cliAdminBadge = process.env.DEFAULT_ADMIN_BADGE || process.env.ADMIN_BADGE

// Ensure environment variables from root/local .env are loaded
loadEnv()

async function main() {
  const startTime = performance.now()
  console.log("🌱 Starting fast database seeding...")

  // =========================================================================
  // 1. Resolve Admin & Demo Credentials from Environment
  // =========================================================================
  const adminEmail = (
    cliAdminEmail ||
    process.env.DEFAULT_ADMIN_EMAIL ||
    process.env.ADMIN_EMAIL ||
    "admin@example.com"
  )
    .trim()
    .toLowerCase()

  const adminPassword =
    cliAdminPassword ||
    process.env.DEFAULT_ADMIN_PASSWORD ||
    process.env.ADMIN_PASSWORD ||
    "change-me-immediately"

  const adminName = (
    cliAdminName ||
    process.env.DEFAULT_ADMIN_NAME ||
    process.env.ADMIN_NAME ||
    "Portfolio Administrator"
  ).trim()

  const defaultUsername = adminEmail
    .split("@")[0]
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .toLowerCase()

  const adminUsername = (
    cliAdminUsername ||
    process.env.DEFAULT_ADMIN_USERNAME ||
    process.env.ADMIN_USERNAME ||
    defaultUsername ||
    "admin"
  ).trim()

  const adminHeadline =
    cliAdminHeadline ||
    process.env.DEFAULT_ADMIN_HEADLINE ||
    process.env.ADMIN_HEADLINE ||
    "Portfolio System Administrator"

  const adminBadge =
    cliAdminBadge ||
    process.env.DEFAULT_ADMIN_BADGE ||
    process.env.ADMIN_BADGE ||
    "Admin"

  const isCustomAdminAuthor = adminEmail === "fi@amanillah.dev"

  // Hash passwords concurrently
  const [adminPasswordHash, demoPasswordHash] = await Promise.all([
    Bun.password.hash(adminPassword, {
      algorithm: "bcrypt",
      cost: 10,
    }),
    Bun.password.hash("password123", {
      algorithm: "bcrypt",
      cost: 10,
    }),
  ])

  const defaultPasswordHash =
    adminPassword === "change-me-immediately"
      ? adminPasswordHash
      : await Bun.password.hash("change-me-immediately", {
          algorithm: "bcrypt",
          cost: 10,
        })

  // Verify if username is taken by a different user
  const existingUsernameUser = await prisma.user.findUnique({
    where: { username: adminUsername },
    select: { id: true, email: true },
  })

  const finalAdminUsername =
    existingUsernameUser && existingUsernameUser.email !== adminEmail
      ? `${adminUsername}_${Math.floor(1000 + Math.random() * 9000)}`
      : adminUsername

  // =========================================================================
  // 2. Concurrently Upsert Users
  // =========================================================================
  const userPromises: Promise<any>[] = []

  // Default Admin User
  const defaultAdminPromise = prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      username: finalAdminUsername,
      password: adminPasswordHash,
      role: Role.ADMIN,
      headline: adminHeadline,
      badge: adminBadge,
      isEmailVerified: true,
    },
    create: {
      name: adminName,
      username: finalAdminUsername,
      email: adminEmail,
      password: adminPasswordHash,
      role: Role.ADMIN,
      headline: adminHeadline,
      badge: adminBadge,
      isEmailVerified: true,
      subscribedToNewsletter: true,
      twoFactorEnabled: false,
    },
  })
  userPromises.push(defaultAdminPromise)

  // Author Persona: Fi Amanillah (if distinct from default admin)
  let fiUserPromise: Promise<any>
  if (!isCustomAdminAuthor) {
    fiUserPromise = prisma.user.upsert({
      where: { email: "fi@amanillah.dev" },
      update: {
        name: "Fi Amanillah",
        username: "fiamanillah",
        password: defaultPasswordHash,
        role: Role.ADMIN,
        headline: "Author & Lead Architect",
        badge: "Author",
        bio: "Full Stack Developer building high-throughput distributed systems.",
        location: "Singapore / Remote",
        website: "https://amanillah.dev",
        githubUrl: "https://github.com/fiamanillah",
        twitterUrl: "https://twitter.com/fiamanillah",
        linkedinUrl: "https://linkedin.com/in/fiamanillah",
        pronouns: "he/him",
        customStatus: "⚡ Optimizing distributed queues",
        avatar: "/fi.png",
        isEmailVerified: true,
        subscribedToNewsletter: true,
        twoFactorEnabled: true,
      },
      create: {
        name: "Fi Amanillah",
        username: "fiamanillah",
        email: "fi@amanillah.dev",
        password: defaultPasswordHash,
        role: Role.ADMIN,
        headline: "Author & Lead Architect",
        badge: "Author",
        bio: "Full Stack Developer building high-throughput distributed systems.",
        location: "Singapore / Remote",
        website: "https://amanillah.dev",
        githubUrl: "https://github.com/fiamanillah",
        twitterUrl: "https://twitter.com/fiamanillah",
        linkedinUrl: "https://linkedin.com/in/fiamanillah",
        pronouns: "he/him",
        customStatus: "⚡ Optimizing distributed queues",
        avatar: "/fi.png",
        isEmailVerified: true,
        subscribedToNewsletter: true,
        twoFactorEnabled: true,
      },
    })
    userPromises.push(fiUserPromise)
  } else {
    fiUserPromise = defaultAdminPromise
  }

  // Demo User: Alex Chen (Moderator)
  const alexUserPromise = prisma.user.upsert({
    where: { email: "alex@chen.io" },
    update: {
      name: "Alex Chen",
      username: "alexchen_dev",
      password: demoPasswordHash,
      role: Role.MODERATOR,
      headline: "Senior Frontend Engineer",
      badge: "Core Contributor",
      bio: "React & TypeScript enthusiast. Building reactive UI systems and design infrastructure.",
      location: "San Francisco, CA",
      website: "https://alexchen.dev",
      githubUrl: "https://github.com/alexchen",
      twitterUrl: "https://twitter.com/alexchen_dev",
      linkedinUrl: "https://linkedin.com/in/alexchen",
      pronouns: "they/them",
      customStatus: "🎨 Crafting fluid micro-interactions",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      isEmailVerified: true,
      subscribedToNewsletter: true,
    },
    create: {
      name: "Alex Chen",
      username: "alexchen_dev",
      email: "alex@chen.io",
      password: demoPasswordHash,
      role: Role.MODERATOR,
      headline: "Senior Frontend Engineer",
      badge: "Core Contributor",
      bio: "React & TypeScript enthusiast. Building reactive UI systems and design infrastructure.",
      location: "San Francisco, CA",
      website: "https://alexchen.dev",
      githubUrl: "https://github.com/alexchen",
      twitterUrl: "https://twitter.com/alexchen_dev",
      linkedinUrl: "https://linkedin.com/in/alexchen",
      pronouns: "they/them",
      customStatus: "🎨 Crafting fluid micro-interactions",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      isEmailVerified: true,
      subscribedToNewsletter: true,
    },
  })
  userPromises.push(alexUserPromise)

  // Demo User: Sarah Lin (Standard User)
  const sarahUserPromise = prisma.user.upsert({
    where: { email: "sarah@cloudops.net" },
    update: {
      name: "Sarah Lin",
      username: "sarahlin_sre",
      password: demoPasswordHash,
      role: Role.USER,
      headline: "Staff SRE & Distributed Systems",
      badge: "SRE Lead",
      bio: "Passionate about Kubernetes, Redis Streams, and sub-second latency topologies.",
      location: "Seattle, WA",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      isEmailVerified: true,
      subscribedToNewsletter: true,
    },
    create: {
      name: "Sarah Lin",
      username: "sarahlin_sre",
      email: "sarah@cloudops.net",
      password: demoPasswordHash,
      role: Role.USER,
      headline: "Staff SRE & Distributed Systems",
      badge: "SRE Lead",
      bio: "Passionate about Kubernetes, Redis Streams, and sub-second latency topologies.",
      location: "Seattle, WA",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      isEmailVerified: true,
      subscribedToNewsletter: true,
    },
  })
  userPromises.push(sarahUserPromise)

  // =========================================================================
  // 3. Concurrently Seed Subscribers
  // =========================================================================
  const sampleSubscribers = [
    {
      email: "alex.rivera@techcorp.io",
      name: "Alex Rivera",
      status: "subscribed",
      source: "blog_post",
      subscribedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      email: "sarah.c@cloudscale.dev",
      name: "Sarah Connor",
      status: "subscribed",
      source: "hero_section",
      subscribedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
      email: "dev.marcus@matrix.org",
      name: "Marcus Vance",
      status: "pending",
      source: "api_docs",
      subscribedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },
    {
      email: "elena.v@quantum.ai",
      name: "Elena Rostova",
      status: "subscribed",
      source: "blog_post",
      subscribedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    },
    {
      email: "jordan.taylor@enterprise.net",
      name: "Jordan Taylor",
      status: "unsubscribed",
      source: "newsletter_modal",
      subscribedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    },
    {
      email: "maya.patel@synthetix.io",
      name: "Maya Patel",
      status: "subscribed",
      source: "hero_section",
      subscribedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      email: "lucas.silva@bytecraft.br",
      name: "Lucas Silva",
      status: "subscribed",
      source: "project_showcase",
      subscribedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      email: "chloe.dupont@atelier.fr",
      name: "Chloe Dupont",
      status: "pending",
      source: "newsletter_modal",
      subscribedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      email: "daniel.kim@hyperlink.kr",
      name: "Daniel Kim",
      status: "subscribed",
      source: "admin_portal",
      subscribedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
    {
      email: "nathan.drake@uncharted.io",
      name: "Nathan Drake",
      status: "unsubscribed",
      source: "blog_post",
      subscribedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
  ]

  const subscribersPromise = Promise.all(
    sampleSubscribers.map((sub) =>
      prisma.subscriber.upsert({
        where: { email: sub.email },
        update: {
          name: sub.name,
          status: sub.status,
          source: sub.source,
        },
        create: sub,
      })
    )
  )

  // =========================================================================
  // 4. Concurrently Seed Blog Categories
  // =========================================================================
  const categoriesData = [
    {
      name: "WebSockets",
      slug: "websockets",
      description:
        "Real-time communication, pub/sub architectures, and bidirectional streams",
      color: "blue",
      order: 1,
    },
    {
      name: "System Architecture",
      slug: "architecture",
      description:
        "Distributed systems, event-driven architectures, and high-throughput scaling",
      color: "amber",
      order: 2,
    },
    {
      name: "Database & Storage",
      slug: "database",
      description:
        "PostgreSQL, Redis, caching layers, and database query optimization",
      color: "emerald",
      order: 3,
    },
    {
      name: "DevOps & Cloud",
      slug: "devops-cloud",
      description:
        "Docker, CI/CD pipelines, cloud infrastructure, and VPS deployments",
      color: "rose",
      order: 4,
    },
    {
      name: "Security",
      slug: "security",
      description:
        "API security, authentication, artifact signing, and zero-trust systems",
      color: "red",
      order: 5,
    },
    {
      name: "AI & Intelligence",
      slug: "ai-intelligence",
      description:
        "AI breakthroughs, LLMs, neural networks, agentic computing, and research",
      color: "purple",
      order: 6,
    },
    {
      name: "Software Engineering",
      slug: "software-engineering",
      description:
        "Modern full-stack engineering, TypeScript ecosystems, clean design, and frameworks",
      color: "cyan",
      order: 7,
    },
  ]

  const categoriesPromise = Promise.all(
    categoriesData.map((cat) =>
      prisma.blogCategory.upsert({
        where: { slug: cat.slug },
        update: {
          name: cat.name,
          description: cat.description,
          color: cat.color,
          order: cat.order,
        },
        create: cat,
      })
    )
  )

  // =========================================================================
  // 5. Concurrently Seed Booking Availability (Mon-Fri 09:00 - 17:00)
  // =========================================================================
  const bookingAvailabilityPromise = Promise.all(
    Array.from({ length: 7 }, (_, day) => {
      const isWeekday = day >= 1 && day <= 5
      return prisma.bookingAvailability.upsert({
        where: { dayOfWeek: day },
        update: {
          isActive: isWeekday,
          startTime: "09:00",
          endTime: "17:00",
          slotDuration: 30,
          bufferTime: 15,
          timezone: "UTC",
        },
        create: {
          dayOfWeek: day,
          isActive: isWeekday,
          startTime: "09:00",
          endTime: "17:00",
          slotDuration: 30,
          bufferTime: 15,
          timezone: "UTC",
        },
      })
    })
  )

  // =========================================================================
  // 6. Concurrently Seed Professional History / Experiences
  // =========================================================================
  const initialExperiences = [
    {
      company: "Softvence Agency",
      companyUrl: "https://softvence.agency",
      role: "FULL STACK DEVELOPER",
      title: ["FULL STACK", "DEVELOPER"],
      location: "Dhaka, Bangladesh · Remote-Friendly",
      employmentType: "Full-Time",
      period: "PRESENT // 14 MO",
      year: "2025",
      isCurrent: true,
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
      status: ExperienceStatus.PUBLISHED,
      featured: true,
      order: 0,
    },
  ]

  const experiencesPromise = (async () => {
    const existing = await prisma.experience.findMany({
      select: { id: true, company: true, role: true },
    })
    const existingMap = new Map(
      existing.map((e) => [`${e.company}:${e.role}`, e.id])
    )

    return Promise.all(
      initialExperiences.map((exp) => {
        const key = `${exp.company}:${exp.role}`
        const existingId = existingMap.get(key)
        if (existingId) {
          return prisma.experience.update({
            where: { id: existingId },
            data: exp,
          })
        }
        return prisma.experience.create({
          data: exp,
        })
      })
    )
  })()

  // =========================================================================
  // 7. Concurrently Seed Skill Categories and Skills
  // =========================================================================
  const initialSkillCategories = [
    {
      slug: "frontend",
      code: "Frontend",
      ordinal: "01",
      suffix: "ST",
      title: "Frontend & Languages",
      badge: "Frontend & Languages",
      icon: "◈",
      color: "cyan",
      order: 1,
      skills: [
        {
          name: "HTML / CSS / JS",
          leftLabel: "Core Web",
          rightLabel: "DOM Styling",
          level: 5,
          tags: ["Core Web", "DOM", "CSS3", "ESNext"],
          order: 1,
        },
        {
          name: "Typescript / Go",
          leftLabel: "Languages",
          rightLabel: "Go Basic",
          level: 4,
          tags: ["TypeScript", "Golang", "Type System"],
          order: 2,
        },
        {
          name: "React / Next.js",
          leftLabel: "Core Stack",
          rightLabel: "SSR Ready",
          level: 5,
          tags: ["React 19", "Next.js", "App Router", "SSR"],
          order: 3,
        },
        {
          name: "Tailwind / Shadcn UI",
          leftLabel: "Atomic CSS",
          rightLabel: "Systemic Design",
          level: 5,
          tags: ["TailwindCSS", "Shadcn", "Design Systems"],
          order: 4,
        },
        {
          name: "Redux / WebSockets",
          leftLabel: "State Mgmt",
          rightLabel: "Realtime",
          level: 4,
          tags: ["Redux Toolkit", "WebSockets", "Socket.io", "RTK Query"],
          order: 5,
        },
      ],
    },
    {
      slug: "backend",
      code: "Backend",
      ordinal: "02",
      suffix: "ND",
      title: "Backend & Data Layer",
      badge: "Backend & Data Layer",
      icon: "◉",
      color: "indigo",
      order: 2,
      skills: [
        {
          name: "Node / Express",
          leftLabel: "Runtime",
          rightLabel: "API Design",
          level: 5,
          tags: ["Node.js", "Express", "REST APIs"],
          order: 1,
        },
        {
          name: "Nest.js",
          leftLabel: "Architecture",
          rightLabel: "Scalable API",
          level: 4,
          tags: ["NestJS", "TypeScript", "Microservices"],
          order: 2,
        },
        {
          name: "PostgreSQL / MySQL",
          leftLabel: "Relational",
          rightLabel: "Data Integrity",
          level: 5,
          tags: ["PostgreSQL", "MySQL", "ACID", "Indexing"],
          order: 3,
        },
        {
          name: "MongoDB / Redis",
          leftLabel: "NoSQL",
          rightLabel: "Caching Layer",
          level: 4,
          tags: ["MongoDB", "Redis", "PubSub", "In-Memory"],
          order: 4,
        },
        {
          name: "Prisma / Mongoose",
          leftLabel: "ORMs",
          rightLabel: "Modeling",
          level: 5,
          tags: ["Prisma", "Mongoose", "Migrations"],
          order: 5,
        },
      ],
    },
    {
      slug: "infra",
      code: "Infra",
      ordinal: "03",
      suffix: "RD",
      title: "Operational Flow",
      badge: "Operational Flow",
      icon: "✦",
      color: "gold",
      order: 3,
      skills: [
        {
          name: "Docker / Nginx",
          leftLabel: "Containers",
          rightLabel: "Reverse Proxy",
          level: 4,
          tags: ["Docker", "Docker Compose", "Nginx", "Reverse Proxy"],
          order: 1,
        },
        {
          name: "Linux / VPS",
          leftLabel: "SysAdmin",
          rightLabel: "Self-Managed",
          level: 4,
          tags: ["Linux", "Ubuntu", "Bash", "Systemd", "VPS"],
          order: 2,
        },
        {
          name: "AWS / GCP / Git",
          leftLabel: "Cloud Infrastructure",
          rightLabel: "CI/CD",
          level: 4,
          tags: ["AWS S3", "GCP", "Git", "GitHub Actions", "CI/CD"],
          order: 3,
        },
        {
          name: "Proxmox / KVM",
          leftLabel: "Hypervisor",
          rightLabel: "Virtualization",
          level: 3,
          tags: ["Proxmox", "KVM", "Virtualization"],
          order: 4,
        },
        {
          name: "RabbitMQ / BullMQ",
          leftLabel: "Message Brokers",
          rightLabel: "Event Driven",
          level: 4,
          tags: ["RabbitMQ", "BullMQ", "Event-Driven", "Task Queues"],
          order: 5,
        },
      ],
    },
  ]

  const skillsPromise = (async () => {
    const categoryRecords = await Promise.all(
      initialSkillCategories.map((cat) => {
        const { skills, ...catData } = cat
        return prisma.skillCategory.upsert({
          where: { slug: catData.slug },
          update: {
            ...catData,
            status: SkillStatus.PUBLISHED,
          },
          create: {
            ...catData,
            status: SkillStatus.PUBLISHED,
          },
        })
      })
    )

    const catMap = new Map(categoryRecords.map((c) => [c.slug, c.id]))
    const categoryIds = Array.from(catMap.values())

    const existingSkills = await prisma.skill.findMany({
      where: { categoryId: { in: categoryIds } },
      select: { id: true, name: true, categoryId: true },
    })
    const existingSkillMap = new Map(
      existingSkills.map((s) => [`${s.categoryId}:${s.name}`, s.id])
    )

    const allSkills = initialSkillCategories.flatMap((cat) => {
      const catId = catMap.get(cat.slug)!
      return cat.skills.map((s) => ({
        ...s,
        categoryId: catId,
        status: SkillStatus.PUBLISHED,
      }))
    })

    const seededSkills = await Promise.all(
      allSkills.map((skill) => {
        const key = `${skill.categoryId}:${skill.name}`
        const existingId = existingSkillMap.get(key)
        if (existingId) {
          return prisma.skill.update({
            where: { id: existingId },
            data: skill,
          })
        }
        return prisma.skill.create({
          data: skill,
        })
      })
    )

    return {
      categoriesCount: categoryRecords.length,
      skillsCount: seededSkills.length,
    }
  })()

  // =========================================================================
  // 8. Case Studies Data
  // =========================================================================
  const SEED_CASE_STUDIES = [
    {
      slug: "mickanic",
      title: "Mickanic — Real-Time Bidding & Service Marketplace Platform",
      subtitle: "Real-Time Bidding & Service Marketplace Platform",
      description:
        "I architected a service-based marketplace using Next.js 16 and Bun, integrating real-time bidding, Socket.io messaging, and tiered Stripe subscriptions, backed by PostgreSQL and RabbitMQ.",
      projectType: "CASE_STUDY" as const,
      status: "PUBLISHED" as const,
      projectStatus: "Status: Completed",
      order: 1,
      featured: true,
      pinned: true,
      techStack: [
        "Next.js 16",
        "Bun",
        "PostgreSQL",
        "Prisma",
        "RabbitMQ",
        "Redis",
        "Socket.io",
        "Stripe",
        "Docker",
        "Redux Toolkit",
        "Tailwind CSS 4",
      ],
      liveUrl: "https://mickanic.ca/",
      githubUrl: null,
      image: "/assets/images/mickanic-cover.png",
      imageLabel: "Mickanic_Architecture_Overview.png",
      role: "Full Stack Developer",
      timeline: "2025 - 2026",
      client: "Mickanic",
      impact:
        "Engineered contractor credit/bidding engine with Stripe billing, real-time Socket.io messaging with Redis, and Docker Compose deployment.",
      highlights: [
        "Real-Time Socket.IO messaging with typing indicators",
        "Event-driven RabbitMQ worker queue for async notifications",
        "Tiered Stripe contractor subscription billing",
      ],
      views: 2840,
      likesCount: 98,
      publishedAt: new Date("2026-01-15T00:00:00.000Z"),
      metadata: [
        { label: "Role", value: "Full Stack Developer" },
        { label: "Timeline", value: "2025 - 2026" },
        { label: "Client / Company", value: "Mickanic" },
        { label: "Tech Stack", value: "Next.js 16, Bun, PostgreSQL, RabbitMQ" },
      ],
      contextBlocks: [
        {
          label: "The Problem",
          body: "Drivers needed a platform to post vehicle-service jobs, while mechanics needed a centralized place to browse jobs, submit bids, and manage subscriptions. A seamless way to connect and communicate was required for the Mickanic platform.",
        },
        {
          label: "The Solution",
          body: "I developed a service-based marketplace connecting consumers and contractors. The solution features a Next.js frontend and a Bun-powered API, featuring real-time Socket.io messaging and RabbitMQ background workers.",
        },
      ],
      architectureLayers: [
        {
          name: "Client / UI",
          description:
            "Frontend application catering to Admin, Consumer, and Contractor roles.",
          items: [
            {
              title: "Next.js 16 & React 19",
              subtitle: "App Router framework",
            },
            { title: "Tailwind CSS 4", subtitle: "Utility-first styling" },
            {
              title: "Redux Toolkit Query",
              subtitle: "State & API data fetching",
            },
          ],
        },
        {
          name: "API & Compute",
          description: "High-performance backend API and WebSocket server.",
          items: [
            {
              title: "Bun",
              subtitle: "JavaScript runtime and package manager",
            },
            { title: "Express", subtitle: "Backend API framework" },
            { title: "Socket.IO", subtitle: "Real-time communication" },
          ],
        },
        {
          name: "Data Layer",
          description: "Relational database, caching, and object storage.",
          items: [
            {
              title: "PostgreSQL",
              subtitle: "Primary database via Prisma ORM",
            },
            { title: "Redis", subtitle: "In-memory caching store" },
            { title: "MinIO", subtitle: "S3-compatible object storage" },
          ],
        },
        {
          name: "Infra / Delivery",
          description:
            "Containerized orchestration and asynchronous task queues.",
          items: [
            {
              title: "Docker Compose",
              subtitle: "Multi-container orchestration",
            },
            { title: "RabbitMQ", subtitle: "Asynchronous message broker" },
            {
              title: "Stripe",
              subtitle: "Payment and subscription processing",
            },
          ],
        },
      ],
      features: [
        {
          title: "Real-Time Bidding & Messaging",
          description:
            "Implemented a real-time messaging system between consumers and contractors using Socket.IO. The frontend utilizes Redux Toolkit Query alongside real-time hooks to manage conversations and typing indicators without full page reloads.",
          mediaType: "Image / Video",
          mediaLabel: "Messaging Interface",
          media: "/assets/images/mickanic-chat.png",
          tags: ["Socket.IO", "RTK Query", "Optimistic UI"],
          highlights: [
            "Instant bid updates & chat sync across active browser clients",
            "Optimistic state updates via Redux Toolkit Query handlers",
            "Typing indicators & read receipt state management",
          ],
        },
        {
          title: "Tiered Subscription Engine",
          description:
            "Integrated tiered subscription plans (Basic, Premium, Pro) for contractors, which govern job application limits, lead costs, and platform visibility. Stripe is used for handling the subscription and payment workflows.",
          mediaType: "Image / Video",
          mediaLabel: "Subscription Plans",
          media: "/assets/images/mickanic-billing.png",
          tags: ["Stripe API", "Webhooks", "Tiered Access"],
          highlights: [
            "Dynamic job bidding quota management based on tier levels",
            "Stripe Customer Portal integration for effortless plan upgrades",
            "Idempotent webhook handlers for subscription lifecycle events",
          ],
        },
        {
          title: "Event-Driven Background Processing",
          description:
            "Offloaded heavy processing like email delivery and web-push notifications to a background worker using RabbitMQ. This ensures the main API remains responsive during high-traffic events, with an hourly email limit of 150 strictly enforced.",
          mediaType: "Architecture / Infra",
          mediaLabel: "Docker Worker Architecture",
          media: "/assets/images/mickanic-cover.png",
          tags: ["Docker", "Bun Runtime", "RabbitMQ"],
          highlights: [
            "Isolated background containerized execution via Docker Compose",
            "Bun runtime execution for fast startup & minimal memory overhead",
            "Rate-limited queue consumer processing strictly 150 emails/hour",
          ],
        },
      ],
      metrics: [
        {
          value: "3",
          label: "Distinct user roles (Admin, Consumer, Contractor)",
        },
        { value: "150", label: "Hourly email sending limit via RabbitMQ" },
        {
          value: "3",
          label: "Contractor subscription tiers (Basic, Premium, Pro)",
        },
        { value: "100%", label: "Type safety with Prisma and TypeScript" },
      ],
      postMortem: [
        {
          title: "Technical Challenges",
          entries: [
            {
              heading: "Real-Time State Synchronization",
              detail:
                "Keeping the optimistic UI in sync with backend state was complex. We leveraged Redux Toolkit Query to cache data and refresh active conversations automatically upon receiving Socket.IO events.",
            },
            {
              heading: "Asynchronous Notification Delivery",
              detail:
                "Blocking the main thread for transactional emails degraded performance. Implementing RabbitMQ allowed us to queue tasks like contact_auto_reply, handling them via a dedicated Bun email worker.",
            },
          ],
        },
        {
          title: "Lessons Learned",
          entries: [
            {
              heading: "Infrastructure Orchestration",
              detail:
                "Bundling PostgreSQL, Redis, and RabbitMQ within a single docker-compose.yml file simplified local development and ensured parity across environments.",
            },
            {
              heading: "Schema-Driven Type Safety",
              detail:
                "Using Prisma allowed us to define a single schema for users, contractors, jobs, and bids. Generating the client directly from the schema ensured reliable database operations.",
            },
          ],
        },
      ],
    },
    {
      slug: "moja-cares",
      title: "Moja Cares — Healthcare Management & Patient Care Portal",
      subtitle: "Healthcare Management & Patient Care Portal",
      description:
        "Comprehensive healthcare management portal featuring multi-role RBAC, real-time clinical team chats, automated alerts, AI-powered document insight extraction, and Paystack billing integration.",
      projectType: "CASE_STUDY" as const,
      status: "PUBLISHED" as const,
      projectStatus: "Status: Live",
      order: 2,
      featured: true,
      pinned: false,
      techStack: [
        "TypeScript",
        "Express",
        "Prisma",
        "PostgreSQL",
        "Redis",
        "RabbitMQ",
        "WebSockets",
        "OpenAI API",
        "AWS S3",
        "Paystack",
      ],
      liveUrl: "https://dev.mojacares.com/",
      githubUrl: null,
      image: "/assets/images/moja-cares-cover.png",
      imageLabel: "Moja_Cares_Dashboard_Overview.png",
      role: "Full Stack Developer",
      timeline: "2026",
      client: "Moja Cares",
      impact:
        "Architected OpenAI API health insights worker, WebSocket patient-care chat, SES/Postmark alert dispatch, and Paystack billing.",
      highlights: [
        "OpenAI worker for automated clinical record insight extraction",
        "Redis Pub/Sub adapter scaling WebSockets across cluster nodes",
        "Paystack billing & subscription webhooks integration",
      ],
      views: 1920,
      likesCount: 74,
      publishedAt: new Date("2026-01-15T00:00:00.000Z"),
      metadata: [
        { label: "Role", value: "Full Stack Developer" },
        { label: "Timeline", value: "2026" },
        { label: "Client / Company", value: "Moja Cares" },
        {
          label: "Tech Stack",
          value: "Express, TypeScript, OpenAI API, WebSockets",
        },
      ],
      contextBlocks: [
        {
          label: "The Problem",
          body: "Healthcare providers and clinical care teams needed a unified digital platform to handle multi-role patient access, stream real-time patient status updates, manage team communication, and analyze unstructured clinical documents without manual data entry bottlenecks.",
        },
        {
          label: "The Solution",
          body: "I architected the Moja Cares portal with a high-throughput Express API, WebSocket infrastructure for real-time care team chat, asynchronous message queues for transactional alerts, an automated OpenAI worker for medical document processing, and Paystack subscription management.",
        },
      ],
      architectureLayers: [
        {
          name: "Client / UI",
          description:
            "Multi-role responsive web application for Admins, Doctors, Nurses, and Patients.",
          items: [
            { title: "Next.js & React", subtitle: "App Router & SSR" },
            { title: "Tailwind CSS", subtitle: "Utility-first styling system" },
            {
              title: "Zustand & SWR",
              subtitle: "Optimistic state & data hydration",
            },
          ],
        },
        {
          name: "API & Compute",
          description:
            "High-performance backend services and WebSocket communication nodes.",
          items: [
            {
              title: "Express (Node.js)",
              subtitle: "Primary REST API aggregation",
            },
            {
              title: "WebSockets",
              subtitle: "Full-duplex clinical chat nodes",
            },
            {
              title: "OpenAI Worker",
              subtitle: "Background document analysis pipeline",
            },
          ],
        },
        {
          name: "Data Layer",
          description:
            "Relational database state, ephemeral memory caching, and object storage.",
          items: [
            {
              title: "PostgreSQL",
              subtitle: "Relational medical records via Prisma",
            },
            {
              title: "Redis",
              subtitle: "Session cache & socket event pub/sub",
            },
            { title: "AWS S3", subtitle: "Secure patient document storage" },
          ],
        },
        {
          name: "Infra / Delivery",
          description:
            "Event brokering, notification dispatch, and payment gateways.",
          items: [
            {
              title: "RabbitMQ",
              subtitle: "Asynchronous worker queue orchestration",
            },
            {
              title: "AWS SES / Postmark",
              subtitle: "Transactional alert dispatch",
            },
            {
              title: "Paystack API",
              subtitle: "Subscription & medical billing webhooks",
            },
          ],
        },
      ],
      features: [
        {
          title: "Real-Time Clinical Team Chat",
          description:
            "Implemented persistent WebSocket channels allowing doctors, nurses, and care administrators to exchange encrypted patient updates instantly with typing indicators and read receipts.",
          mediaType: "Image / Video",
          mediaLabel: "Clinical Team Messaging",
          media: "/assets/images/moja-cares-chat.png",
          tags: ["WebSockets", "Redis Pub/Sub", "Encrypted Messaging"],
          highlights: [
            "Sub-50ms message latency across distributed care nodes",
            "Role-restricted multi-party channels (Admins, Doctors, Nurses)",
            "Presence tracking & real-time typing indicators",
          ],
        },
        {
          title: "AI-Powered Document Insight Extraction",
          description:
            "Developed an automated background pipeline leveraging the OpenAI API to extract critical medical markers, risk flags, and summary points from uploaded health records.",
          mediaType: "Image / Video",
          mediaLabel: "AI Document Analysis",
          media: "/assets/images/moja-cares-insights.png",
          tags: ["OpenAI API", "AWS S3", "Async Worker"],
          highlights: [
            "Automated extraction of vital medical markers & risk alerts",
            "Direct pre-signed AWS S3 upload pipeline avoiding API bottlenecks",
            "Structured JSON schema response parsing with fallback validation",
          ],
        },
        {
          title: "Automated Alert Dispatch & Queuing",
          description:
            "Offloaded instant SMS and email notifications to background RabbitMQ workers consumed by standalone microservices to ensure reliable alert delivery under peak clinical loads.",
          mediaType: "Architecture / Infra",
          mediaLabel: "Alert Worker Architecture",
          media: "/assets/images/moja-cares-cover.png",
          tags: ["RabbitMQ", "Microservices", "Event-Driven"],
          highlights: [
            "Guaranteed persistent message delivery for high-priority alerts",
            "Non-blocking API throughput under heavy emergency care events",
            "Dead-letter exchange setup for failed notification retries",
          ],
        },
      ],
      metrics: [
        {
          value: "4",
          label: "Distinct user roles (Admin, Doctor, Nurse, Patient)",
        },
        { value: "<50ms", label: "WebSocket real-time chat latency" },
        {
          value: "10k+",
          label: "Clinical health insights extracted via AI worker",
        },
        { value: "99.9%", label: "Uptime for asynchronous alert delivery" },
      ],
      postMortem: [
        {
          title: "Technical Challenges",
          entries: [
            {
              heading: "Handling Large Medical Document Processing",
              detail:
                "Parsing heavy medical PDF records caused API response stalls. Solved by decoupling document uploads directly to AWS S3, then dispatching asynchronous AI processing jobs over RabbitMQ.",
            },
            {
              heading: "Real-Time Multi-Party Socket Sync",
              detail:
                "Syncing care team chat state across multiple server instances required unified pub/sub. Implemented Redis Pub/Sub adapter for WebSockets to guarantee message delivery across nodes.",
            },
          ],
        },
        {
          title: "Lessons Learned",
          entries: [
            {
              heading: "Asynchronous First Architecture",
              detail:
                "Offloading document intelligence and email dispatches to dedicated background workers protected core patient API latency during peak clinic hours.",
            },
            {
              heading: "Strict Type Safety",
              detail:
                "Defining centralized Prisma schemas and TypeScript contracts eliminated schema drift between care team APIs, socket payloads, and billing webhooks.",
            },
          ],
        },
      ],
    },
    {
      slug: "express-monorepo-template",
      title: "Express Class Monorepo Template",
      subtitle: "Production-ready backend architecture starter",
      description:
        "A modular, class-based Express monorepo template built with TypeScript, Bun, Docker Compose, and automated API documentation for rapid backend deployment.",
      projectType: "PROJECT" as const,
      status: "PUBLISHED" as const,
      projectStatus: "Status: Completed",
      order: 3,
      featured: false,
      pinned: false,
      techStack: [
        "TypeScript",
        "Express",
        "Bun",
        "Docker",
        "Turborepo",
        "Swagger",
      ],
      liveUrl: null,
      githubUrl: "https://github.com/fiamanillah",
      image: "/assets/images/mickanic-cover.png",
      imageLabel: "Monorepo_Architecture_Template.png",
      role: "Open Source Creator",
      timeline: "2026",
      client: "Open Source",
      impact:
        "Standardized backend boilerplate across personal and client projects, reducing initial project setup time by over 70%.",
      highlights: [
        "Strict ESLint & Prettier configuration with monorepo Turborepo pipelines",
        "Class-based controller & service routing architecture",
        "Dockerized development and production compose files",
      ],
      views: 1120,
      likesCount: 45,
      publishedAt: new Date("2026-02-01T00:00:00.000Z"),
      metadata: [
        { label: "Role", value: "Open Source Creator" },
        { label: "Timeline", value: "2026" },
        { label: "Client / Company", value: "Open Source" },
        { label: "Tech Stack", value: "TypeScript, Bun, Docker, Express" },
      ],
      contextBlocks: [],
      architectureLayers: [],
      features: [],
      metrics: [],
      postMortem: [],
    },
    {
      slug: "microservice-alert-worker",
      title: "RabbitMQ Microservice Dispatcher",
      subtitle: "High-throughput asynchronous message consumer",
      description:
        "A lightweight, failure-resilient background queue dispatcher service designed to decouple email, SMS, and web-push notifications from core REST APIs.",
      projectType: "PROJECT" as const,
      status: "PUBLISHED" as const,
      projectStatus: "Status: Live",
      order: 4,
      featured: false,
      pinned: false,
      techStack: ["Node.js", "RabbitMQ", "Redis", "TypeScript", "AWS SES"],
      liveUrl: null,
      githubUrl: "https://github.com/fiamanillah",
      image: "/assets/images/moja-cares-cover.png",
      imageLabel: "Microservice_Alert_Worker.png",
      role: "Full Stack Developer",
      timeline: "2025",
      client: "System Utility",
      impact:
        "Processed thousands of asynchronous notification events daily with automatic retry strategies and dead-letter queue routing.",
      highlights: [
        "Dead-letter exchange handling for failed message redelivery",
        "Rate-limited SMTP dispatching with Redis token buckets",
      ],
      views: 950,
      likesCount: 38,
      publishedAt: new Date("2025-11-10T00:00:00.000Z"),
      metadata: [
        { label: "Role", value: "Full Stack Developer" },
        { label: "Timeline", value: "2025" },
        { label: "Client / Company", value: "System Utility" },
        { label: "Tech Stack", value: "Node.js, RabbitMQ, Redis, TypeScript" },
      ],
      contextBlocks: [],
      architectureLayers: [],
      features: [],
      metrics: [],
      postMortem: [],
    },
  ]

  // =========================================================================
  // 9. Await Phase 1 Promises
  // =========================================================================
  const [
    [defaultAdminUser, authorPersonaUser, alexUser, sarahUser],
    subscribers,
    blogCategories,
    bookingAvailability,
    experiences,
    skillsSummary,
  ] = await Promise.all([
    Promise.all(userPromises),
    subscribersPromise,
    categoriesPromise,
    bookingAvailabilityPromise,
    experiencesPromise,
    skillsPromise,
  ])

  const authorUser = authorPersonaUser || defaultAdminUser

  // Build category lookup map (with lowercase and synonym normalization)
  const categoryMap = new Map<string, string>()
  for (const cat of blogCategories) {
    categoryMap.set(cat.slug.toLowerCase(), cat.id)
    categoryMap.set(cat.name.toLowerCase(), cat.id)
  }
  // Common category aliases
  if (categoryMap.has("devops-cloud")) {
    categoryMap.set("devops", categoryMap.get("devops-cloud")!)
  }
  if (categoryMap.has("database")) {
    categoryMap.set("database & storage", categoryMap.get("database")!)
  }
  if (categoryMap.has("architecture")) {
    categoryMap.set("system architecture", categoryMap.get("architecture")!)
  }

  // =========================================================================
  // 10. Load and Concurrently Seed Blog Posts & Case Studies
  // =========================================================================
  let rawBlogPosts: any[] = []
  const localDataJson = path.resolve(__dirname, "data/blog-posts.json")
  const webBlogPostsDir = path.resolve(
    __dirname,
    "../../../apps/web/src/data/blog-posts"
  )

  try {
    const fileContent = await fs.readFile(localDataJson, "utf-8")
    rawBlogPosts = JSON.parse(fileContent)
  } catch {
    try {
      const files = await fs.readdir(webBlogPostsDir)
      const jsonFiles = files.filter((f) => f.endsWith(".json"))
      const contents = await Promise.all(
        jsonFiles.map((file) =>
          fs.readFile(path.join(webBlogPostsDir, file), "utf-8")
        )
      )
      rawBlogPosts = contents.map((c) => JSON.parse(c))
    } catch (err) {
      console.warn("⚠️ Could not load blog posts from data directory:", err)
    }
  }

  // Deduplicate and upsert all unique blog tags concurrently
  const uniqueTags = new Map<string, string>()
  for (const post of rawBlogPosts) {
    for (const tag of post.tags || []) {
      const tagSlug = tag
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
      if (tagSlug && !uniqueTags.has(tagSlug)) {
        uniqueTags.set(tagSlug, tag)
      }
    }
  }

  await Promise.all(
    Array.from(uniqueTags.entries()).map(([slug, name]) =>
      prisma.blogTag.upsert({
        where: { slug },
        update: { name },
        create: { name, slug },
      })
    )
  )

  // Concurrently seed blog posts
  const blogPostsPromise = Promise.all(
    rawBlogPosts.map((post) => {
      const categoryId = categoryMap.get(post.category?.toLowerCase()) || null
      const wordCount = post.content
        ? post.content.split(/\s+/).filter(Boolean).length
        : 0
      const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200))
      const publishedAt = post.publishedAt
        ? new Date(post.publishedAt)
        : new Date("2025-08-01T00:00:00.000Z")

      const postData = {
        title: post.title,
        subtitle: post.subtitle || null,
        summary: post.summary,
        content: post.content,
        thumbnail: post.thumbnail,
        status: "PUBLISHED" as const,
        featured: Boolean(post.featured),
        readTime: post.readTime || `${readTimeMinutes} MIN READ`,
        readTimeMinutes,
        wordCount,
        date: post.date || "AUG 2025",
        publishedAt,
        modifiedAt: post.modifiedAt ? new Date(post.modifiedAt) : publishedAt,
        views: post.views
          ? (parseInt(post.views.replace(/[^0-9]/g, "")) || 0) *
            (post.views.includes("k") ? 1000 : 1)
          : 1250,
        likesCount: 42,
        commentsCount: 3,
        keyTakeaways: post.keyTakeaways || [],
        tags: post.tags || [],
        categoryId,
        authorId: authorUser.id,
        authorName: post.author?.name || authorUser.name,
        authorRole: post.author?.role || authorUser.headline,
        authorAvatar: post.author?.avatar || authorUser.avatar,
        authorTwitter: post.author?.twitter || authorUser.twitterUrl,
        authorLinkedin: post.author?.linkedin || authorUser.linkedinUrl,
        authorGithub: post.author?.github || authorUser.githubUrl,
        metaTitle: post.seo?.metaTitle || `${post.title} | Fi Amanillah`,
        metaDescription: post.seo?.metaDescription || post.summary,
        metaKeywords: post.seo?.keywords || post.tags || [],
        ogTitle: post.seo?.metaTitle || post.title,
        ogDescription: post.seo?.metaDescription || post.summary,
        ogImage: post.seo?.ogImage || post.thumbnail,
        ogType: post.seo?.ogType || "article",
        canonicalUrl: post.seo?.canonicalUrl || null,
        articleType: post.seo?.articleType || "TechArticle",
        noIndex: Boolean(post.seo?.noIndex),
      }

      return prisma.blogPost.upsert({
        where: { slug: post.slug },
        update: postData,
        create: {
          slug: post.slug,
          ...postData,
        },
      })
    })
  )

  // Concurrently seed case studies
  const caseStudiesPromise = Promise.all(
    SEED_CASE_STUDIES.map((cs) => {
      const caseStudyData = {
        title: cs.title,
        subtitle: cs.subtitle,
        description: cs.description,
        projectType: cs.projectType,
        status: cs.status,
        projectStatus: cs.projectStatus,
        order: cs.order,
        featured: cs.featured,
        pinned: cs.pinned,
        techStack: cs.techStack,
        liveUrl: cs.liveUrl,
        githubUrl: cs.githubUrl,
        image: cs.image,
        imageLabel: cs.imageLabel,
        role: cs.role,
        timeline: cs.timeline,
        client: cs.client,
        impact: cs.impact,
        highlights: cs.highlights || [],
        views: cs.views,
        likesCount: cs.likesCount,
        publishedAt: cs.publishedAt,
        authorId: authorUser.id,
        authorName: authorUser.name,
        authorRole: authorUser.headline,
        authorAvatar: authorUser.avatar,
        authorTwitter: authorUser.twitterUrl,
        authorLinkedin: authorUser.linkedinUrl,
        authorGithub: authorUser.githubUrl,
        metadata: cs.metadata,
        contextBlocks: cs.contextBlocks,
        architectureLayers: cs.architectureLayers,
        features: cs.features,
        metrics: cs.metrics,
        postMortem: cs.postMortem,
        metaTitle: `${cs.title} | ${cs.projectType === "CASE_STUDY" ? "Technical Case Study" : "Project Showcase"}`,
        metaDescription: cs.description,
        metaKeywords: cs.techStack,
        ogTitle: cs.title,
        ogDescription: cs.description,
        ogImage: cs.image,
        twitterCard: "summary_large_image",
        canonicalUrl: `https://fi.amanillah.com/case-study/${cs.slug}`,
      }

      return prisma.caseStudy.upsert({
        where: { slug: cs.slug },
        update: caseStudyData,
        create: {
          slug: cs.slug,
          ...caseStudyData,
        },
      })
    })
  )

  const [seededPosts, seededCaseStudies] = await Promise.all([
    blogPostsPromise,
    caseStudiesPromise,
  ])

  const elapsedSeconds = ((performance.now() - startTime) / 1000).toFixed(2)

  console.log(`
====================================================
✅ Database Seeded Successfully in ${elapsedSeconds}s!
====================================================
  • Default Admin:     ${defaultAdminUser.email} (${defaultAdminUser.role})
  • Author Persona:    ${authorUser.email} (${authorUser.role})
  • Demo Moderator:    ${alexUser.email} (${alexUser.role})
  • Demo User:         ${sarahUser.email} (${sarahUser.role})
  • Subscribers:       ${subscribers.length} records
  • Blog Categories:   ${blogCategories.length} categories
  • Unique Blog Tags:  ${uniqueTags.size} tags
  • Blog Posts:        ${seededPosts.length} posts migrated
  • Case Studies:      ${seededCaseStudies.length} case studies migrated
  • Experiences:       ${experiences.length} experiences
  • Skills:            ${skillsSummary.skillsCount} skills across ${skillsSummary.categoriesCount} categories
  • Availability:      ${bookingAvailability.length} days initialized
====================================================
  `)
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
