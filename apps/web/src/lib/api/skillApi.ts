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
        return []
      }

      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
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

      return []
    } catch {
      return []
    }
  },
}
