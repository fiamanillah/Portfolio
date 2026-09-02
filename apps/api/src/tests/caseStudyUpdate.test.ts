// apps/api/src/tests/caseStudyUpdate.test.ts
import { describe, it, expect } from "bun:test"
import { updateCaseStudySchema } from "../Modules/CaseStudy/CaseStudyDTO"
import { updateProfileSchema } from "@workspace/shared"

describe("Case Study & Profile Field Clearing Schemas", () => {
  describe("updateCaseStudySchema", () => {
    it("should accept null for githubUrl and liveUrl to clear them", () => {
      const parsed = updateCaseStudySchema.safeParse({
        githubUrl: null,
        liveUrl: null,
      })
      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.githubUrl).toBeNull()
        expect(parsed.data.liveUrl).toBeNull()
      }
    })

    it("should accept empty string for githubUrl and liveUrl", () => {
      const parsed = updateCaseStudySchema.safeParse({
        githubUrl: "",
        liveUrl: "",
      })
      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.githubUrl).toBe("")
        expect(parsed.data.liveUrl).toBe("")
      }
    })

    it("should accept null for optional text metadata fields", () => {
      const parsed = updateCaseStudySchema.safeParse({
        subtitle: null,
        imageLabel: null,
        role: null,
        timeline: null,
        client: null,
        impact: null,
      })
      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.subtitle).toBeNull()
        expect(parsed.data.imageLabel).toBeNull()
        expect(parsed.data.role).toBeNull()
        expect(parsed.data.timeline).toBeNull()
        expect(parsed.data.client).toBeNull()
        expect(parsed.data.impact).toBeNull()
      }
    })

    it("should validate valid URLs when provided", () => {
      const parsed = updateCaseStudySchema.safeParse({
        githubUrl: "https://github.com/my-user/my-repo",
        liveUrl: "https://example.com",
      })
      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.githubUrl).toBe("https://github.com/my-user/my-repo")
        expect(parsed.data.liveUrl).toBe("https://example.com")
      }
    })

    it("should reject invalid non-URL strings for githubUrl", () => {
      const parsed = updateCaseStudySchema.safeParse({
        githubUrl: "not-a-valid-url",
      })
      expect(parsed.success).toBe(false)
    })
  })

  describe("updateProfileSchema", () => {
    it("should accept null for public social links and bio to allow clearing", () => {
      const parsed = updateProfileSchema.safeParse({
        githubUrl: null,
        website: null,
        twitterUrl: null,
        linkedinUrl: null,
        bio: null,
        headline: null,
        location: null,
      })
      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.githubUrl).toBeNull()
        expect(parsed.data.website).toBeNull()
        expect(parsed.data.twitterUrl).toBeNull()
        expect(parsed.data.linkedinUrl).toBeNull()
        expect(parsed.data.bio).toBeNull()
        expect(parsed.data.headline).toBeNull()
        expect(parsed.data.location).toBeNull()
      }
    })
  })

  describe("JSON Serialization & cleanUrl behavior", () => {
    function cleanUrl(url?: string | null): string | null {
      if (!url || typeof url !== "string") return null
      const trimmed = url.trim()
      return trimmed || null
    }

    it("should return null for empty or whitespace URL", () => {
      expect(cleanUrl("")).toBeNull()
      expect(cleanUrl("   ")).toBeNull()
      expect(cleanUrl(null)).toBeNull()
      expect(cleanUrl(undefined)).toBeNull()
    })

    it("should return trimmed URL for valid URL", () => {
      expect(cleanUrl("  https://github.com/test  ")).toBe(
        "https://github.com/test"
      )
    })

    it("should preserve null in JSON payload (not omit key)", () => {
      const payload = {
        title: "Test Case Study",
        githubUrl: cleanUrl(""),
      }
      const json = JSON.stringify(payload)
      const parsedBack = JSON.parse(json)

      expect("githubUrl" in parsedBack).toBe(true)
      expect(parsedBack.githubUrl).toBeNull()
    })
  })
})
