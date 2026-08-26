"use client"

import * as React from "react"
import { Tag, Plus, X } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { FieldError } from "@workspace/ui/components/field"
import type { CaseStudySeo } from "@workspace/shared"

interface SeoMetaCardProps {
  title: string
  slug: string
  description: string
  seo: CaseStudySeo
  onUpdate: <K extends keyof CaseStudySeo>(field: K, value: CaseStudySeo[K]) => void
  errors?: Record<string, string>
}

export function SeoMetaCard({
  title,
  slug,
  description,
  seo,
  onUpdate,
  errors = {},
}: SeoMetaCardProps) {
  const [keywordInput, setKeywordInput] = React.useState("")

  const handleAddKeyword = () => {
    const kw = keywordInput.trim()
    if (kw && !(seo.metaKeywords || []).includes(kw)) {
      onUpdate("metaKeywords", [...(seo.metaKeywords || []), kw])
      setKeywordInput("")
    }
  }

  const handleRemoveKeyword = (kwToRemove: string) => {
    onUpdate(
      "metaKeywords",
      (seo.metaKeywords || []).filter((k) => k !== kwToRemove)
    )
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-bold">
          Search Engine Optimization (SEO)
        </CardTitle>
        <CardDescription className="text-xs">
          Configure search engine title, description tags, keywords, and canonical URLs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="seo-meta-title" className="text-xs">Meta Title</Label>
            <span className="font-mono text-[10px] text-muted-foreground">
              {(seo.metaTitle || "").length}/60 chars
            </span>
          </div>
          <Input
            id="seo-meta-title"
            placeholder={title || "Title | Case Study"}
            value={seo.metaTitle || ""}
            onChange={(e) => onUpdate("metaTitle", e.target.value)}
            className={`text-xs h-8 ${
              errors["seo.metaTitle"] || errors.metaTitle
                ? "border-destructive focus:border-destructive"
                : ""
            }`}
          />
          {(errors["seo.metaTitle"] || errors.metaTitle) && (
            <FieldError errors={errors["seo.metaTitle"] || errors.metaTitle} />
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="seo-meta-desc" className="text-xs">Meta Description</Label>
            <span className="font-mono text-[10px] text-muted-foreground">
              {(seo.metaDescription || "").length}/160 chars
            </span>
          </div>
          <Textarea
            id="seo-meta-desc"
            placeholder={description || "Case study overview description..."}
            rows={3}
            value={seo.metaDescription || ""}
            onChange={(e) => onUpdate("metaDescription", e.target.value)}
            className={`text-xs leading-relaxed ${
              errors["seo.metaDescription"] || errors.metaDescription
                ? "border-destructive focus:border-destructive"
                : ""
            }`}
          />
          {(errors["seo.metaDescription"] || errors.metaDescription) && (
            <FieldError
              errors={errors["seo.metaDescription"] || errors.metaDescription}
            />
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="seo-canonical" className="text-xs">Canonical URL</Label>
          <Input
            id="seo-canonical"
            placeholder={`https://fi.amanillah.com/case-study/${slug || "my-study"}`}
            value={seo.canonicalUrl || ""}
            onChange={(e) => onUpdate("canonicalUrl", e.target.value)}
            className={`text-xs font-mono h-8 ${
              errors["seo.canonicalUrl"] || errors.canonicalUrl
                ? "border-destructive focus:border-destructive"
                : ""
            }`}
          />
          {(errors["seo.canonicalUrl"] || errors.canonicalUrl) && (
            <FieldError
              errors={errors["seo.canonicalUrl"] || errors.canonicalUrl}
            />
          )}
          <p className="text-[10px] text-muted-foreground">
            Optional. If entered, must start with https:// (e.g. https://fi.amanillah.com/case-study/my-study)
          </p>
        </div>

        <div className="space-y-2 pt-2 border-t border-border/40">
          <Label className="text-xs font-mono text-muted-foreground uppercase flex items-center gap-1.5">
            <Tag className="size-3 text-muted-foreground" /> Meta Keywords ({seo.metaKeywords?.length || 0})
          </Label>
          <div className="flex gap-2">
            <Input
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddKeyword()
                }
              }}
              placeholder="Add target keyword..."
              className="h-8 text-xs"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={handleAddKeyword}
            >
              <Plus className="size-3" /> Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {(seo.metaKeywords || []).map((kw) => (
              <Badge
                key={kw}
                variant="secondary"
                className="flex items-center gap-1 px-2 py-0.5 text-xs font-mono"
              >
                <span>{kw}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveKeyword(kw)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
