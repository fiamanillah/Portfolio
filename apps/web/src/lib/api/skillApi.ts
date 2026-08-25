// apps/web/src/lib/api/skillApi.ts

const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.PUBLIC_API_URL) ||
  (typeof process !== "undefined" && process.env?.PUBLIC_API_URL) ||
  (typeof process !== "undefined" && process.env?.INTERNAL_API_URL) ||
  "http://localhost:3040"

export interface SkillItem {
  title: string
  left: string
  right: string
  level?: number
  tags?: string[]
  icon?: string | null
}

export interface SkillSection {
  code: string
  ordinal: string
  suffix: string
  label: string
  badge: string
  icon?: string | null
  color?: string | null
  items: SkillItem[]
}

export const defaultSkillSections: SkillSection[] = [
  {
    code: "Frontend",
    ordinal: "01",
    suffix: "ST",
    label: "Frontend & Languages",
    badge: "Frontend & Languages",
    icon: "◈",
    color: "cyan",
    items: [
      { title: "HTML / CSS / JS", left: "Core Web", right: "DOM Styling", level: 5, tags: ["Core Web", "DOM", "CSS3", "ESNext"] },
      { title: "Typescript / Go", left: "Languages", right: "Go Basic", level: 4, tags: ["TypeScript", "Golang", "Type System"] },
      { title: "React / Next.js", left: "Core Stack", right: "SSR Ready", level: 5, tags: ["React 19", "Next.js", "App Router", "SSR"] },
      { title: "Tailwind / Shadcn UI", left: "Atomic CSS", right: "Systemic Design", level: 5, tags: ["TailwindCSS", "Shadcn", "Design Systems"] },
      { title: "Redux / WebSockets", left: "State Mgmt", right: "Realtime", level: 4, tags: ["Redux Toolkit", "WebSockets", "Socket.io", "RTK Query"] },
    ],
  },
  {
    code: "Backend",
    ordinal: "02",
    suffix: "ND",
    label: "Backend & Data Layer",
    badge: "Backend & Data Layer",
    icon: "◉",
    color: "indigo",
    items: [
      { title: "Node / Express", left: "Runtime", right: "API Design", level: 5, tags: ["Node.js", "Express", "REST APIs"] },
      { title: "Nest.js", left: "Architecture", right: "Scalable API", level: 4, tags: ["NestJS", "TypeScript", "Microservices"] },
      { title: "PostgreSQL / MySQL", left: "Relational", right: "Data Integrity", level: 5, tags: ["PostgreSQL", "MySQL", "ACID", "Indexing"] },
      { title: "MongoDB / Redis", left: "NoSQL", right: "Caching Layer", level: 4, tags: ["MongoDB", "Redis", "PubSub", "In-Memory"] },
      { title: "Prisma / Mongoose", left: "ORMs", right: "Modeling", level: 5, tags: ["Prisma", "Mongoose", "Migrations"] },
    ],
  },
  {
    code: "Infra",
    ordinal: "03",
    suffix: "RD",
    label: "Operational Flow",
    badge: "Operational Flow",
    icon: "✦",
    color: "gold",
    items: [
      { title: "Docker / Nginx", left: "Containers", right: "Reverse Proxy", level: 4, tags: ["Docker", "Docker Compose", "Nginx", "Reverse Proxy"] },
      { title: "Linux / VPS", left: "SysAdmin", right: "Self-Managed", level: 4, tags: ["Linux", "Ubuntu", "Bash", "Systemd", "VPS"] },
      { title: "AWS / GCP / Git", left: "Cloud Infrastructure", right: "CI/CD", level: 4, tags: ["AWS S3", "GCP", "Git", "GitHub Actions", "CI/CD"] },
      { title: "Proxmox / KVM", left: "Hypervisor", right: "Virtualization", level: 3, tags: ["Proxmox", "KVM", "Virtualization"] },
      { title: "RabbitMQ / BullMQ", left: "Message Brokers", right: "Event Driven", level: 4, tags: ["RabbitMQ", "BullMQ", "Event-Driven", "Task Queues"] },
    ],
  },
]

export const SkillApi = {
  /**
   * Fetch published skill categories and skills from the live backend API
   */
  async fetchPublicSkills(): Promise<SkillSection[]> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 4000)

      const res = await fetch(`${API_BASE_URL}/skills/v1/public`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (!res.ok) {
        return defaultSkillSections
      }

      const json = await res.json()
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const sections = json.data
          .map((sec: any) => ({
            code: sec.code || "Skill",
            ordinal: sec.ordinal || "01",
            suffix: sec.suffix || "ST",
            label: sec.label || sec.title || "Skills",
            badge: sec.badge || "Skills",
            icon: sec.icon || null,
            color: sec.color || "blue",
            items: Array.isArray(sec.items)
              ? sec.items.map((item: any) => ({
                  title: item.title || item.name,
                  left: item.left || item.leftLabel || "Core Stack",
                  right: item.right || item.rightLabel || "Proficient",
                  level: item.level,
                  tags: Array.isArray(item.tags) ? item.tags : [],
                  icon: item.icon || null,
                }))
              : [],
          }))
          .filter((sec: SkillSection) => sec.items.length > 0)

        return sections.length > 0 ? sections : defaultSkillSections
      }

      return defaultSkillSections
    } catch {
      return defaultSkillSections
    }
  },
}

