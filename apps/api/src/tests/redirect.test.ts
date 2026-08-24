// apps/api/src/tests/redirect.test.ts
import { describe, it, expect } from "bun:test"
import { RedirectService } from "../Modules/Redirect/redirect.service"
import {
  createRedirectSchema,
  updateRedirectSchema,
  queryRedirectsSchema,
  resolveRedirectSchema,
  bulkDeleteRedirectsSchema,
} from "../Modules/Redirect/RedirectDTO"

describe("RedirectService & Redirection Engine", () => {
  const service = new RedirectService()

  describe("Path Normalization (normalizePath)", () => {
    it("should ensure leading slash on relative paths", () => {
      expect(service.normalizePath("blog/my-old-post")).toBe("/blog/my-old-post")
    })

    it("should remove trailing slashes from paths", () => {
      expect(service.normalizePath("/blog/my-old-post/")).toBe("/blog/my-old-post")
      expect(service.normalizePath("/case-study/portfolio///")).toBe("/case-study/portfolio")
    })

    it("should collapse multiple consecutive slashes", () => {
      expect(service.normalizePath("///blog////category///tech///")).toBe("/blog/category/tech")
    })

    it("should preserve root path '/'", () => {
      expect(service.normalizePath("/")).toBe("/")
      expect(service.normalizePath("")).toBe("/")
      expect(service.normalizePath("   ")).toBe("/")
    })

    it("should handle external destination URLs cleanly", () => {
      expect(service.normalizePath("https://external.example.com/deep/path/")).toBe(
        "https://external.example.com/deep/path"
      )
      expect(service.normalizePath("http://sub.domain.org")).toBe("http://sub.domain.org")
    })
  })

  describe("Validation Schemas (RedirectDTO)", () => {
    it("should validate and coerce createRedirectSchema", () => {
      const valid = createRedirectSchema.safeParse({
        sourcePath: "  /old-path/ ",
        targetPath: "/new-path  ",
        statusCode: 301,
        entityType: "BLOG_POST",
      })

      expect(valid.success).toBe(true)
      if (valid.success) {
        expect(valid.data.sourcePath).toBe("/old-path/")
        expect(valid.data.targetPath).toBe("/new-path")
        expect(valid.data.statusCode).toBe(301)
        expect(valid.data.entityType).toBe("BLOG_POST")
      }
    })

    it("should reject invalid HTTP redirect status codes", () => {
      const invalid = createRedirectSchema.safeParse({
        sourcePath: "/old-path",
        targetPath: "/new-path",
        statusCode: 200,
      })

      expect(invalid.success).toBe(false)
    })

    it("should validate resolveRedirectSchema", () => {
      const parsed = resolveRedirectSchema.safeParse({
        path: "/blog/my-legacy-slug",
      })
      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.path).toBe("/blog/my-legacy-slug")
      }
    })

    it("should validate updateRedirectSchema correctly", () => {
      const parsed = updateRedirectSchema.safeParse({
        targetPath: "/blog/updated-target",
        statusCode: 308,
        isActive: false,
        notes: "Updated target destination",
      })
      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.targetPath).toBe("/blog/updated-target")
        expect(parsed.data.statusCode).toBe(308)
        expect(parsed.data.isActive).toBe(false)
      }
    })

    it("should apply sensible defaults in queryRedirectsSchema", () => {
      const parsed = queryRedirectsSchema.parse({})
      expect(parsed.page).toBe(1)
      expect(parsed.limit).toBe(20)
      expect(parsed.sortBy).toBe("createdAt")
      expect(parsed.sortOrder).toBe("desc")
    })

    it("should validate bulkDeleteRedirectsSchema", () => {
      const valid = {
        ids: ["123e4567-e89b-12d3-a456-426614174000"],
      }
      expect(bulkDeleteRedirectsSchema.safeParse(valid).success).toBe(true)

      const invalid = { ids: [] }
      expect(bulkDeleteRedirectsSchema.safeParse(invalid).success).toBe(false)
    })
  })
})
