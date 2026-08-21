// apps/web/src/lib/api/skillApi.ts

const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.PUBLIC_API_URL) ||
  "http://localhost:3030"

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
    items: [
      { title: "HTML / CSS / JS", left: "Core Web", right: "DOM Styling" },
      { title: "Typescript / Go", left: "Languages", right: "Go Basic" },
      { title: "React / Next.js", left: "Core Stack", right: "SSR Ready" },
      {
        title: "Tailwind / Shadcn UI",
        left: "Atomic CSS",
        right: "Systemic Design",
      },
      { title: "Redux / WebSockets", left: "State Mgmt", right: "Realtime" },
    ],
  },
  {
    code: "Backend",
    ordinal: "02",
    suffix: "ND",
    label: "Backend & Data Layer",
    badge: "Backend & Data Layer",
    items: [
      { title: "Node / Express", left: "Runtime", right: "API Design" },
      { title: "Nest.js", left: "Architecture", right: "Scalable API" },
      {
        title: "PostgreSQL / MySQL",
        left: "Relational",
        right: "Data Integrity",
      },
      { title: "MongoDB / Redis", left: "NoSQL", right: "Caching Layer" },
      { title: "Prisma / Mongoose", left: "ORMs", right: "Modeling" },
    ],
  },
  {
    code: "Infra",
    ordinal: "03",
    suffix: "RD",
    label: "Operational Flow",
    badge: "Operational Flow",
    items: [
      { title: "Docker / Nginx", left: "Containers", right: "Reverse Proxy" },
      { title: "Linux / VPS", left: "SysAdmin", right: "Self-Managed" },
      {
        title: "AWS / GCP / Git",
        left: "Cloud Infrastructure",
        right: "CI/CD",
      },
      { title: "Proxmox / KVM", left: "Hypervisor", right: "Virtualization" },
      {
        title: "RabbitMQ / BullMQ",
        left: "Message Brokers",
        right: "Event Driven",
      },
    ],
  },
]

export const SkillApi = {
  /**
   * Fetch published skill categories and skills for the portfolio homepage
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
        return json.data.map((sec: any) => ({
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
      }

      return defaultSkillSections
    } catch {
      return defaultSkillSections
    }
  },
}
