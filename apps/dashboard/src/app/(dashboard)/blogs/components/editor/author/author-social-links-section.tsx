"use client"

import * as React from "react"
import { Share2 } from "lucide-react"
import { Input } from "@workspace/ui/components/input"

interface AuthorSocialLinksSectionProps {
  authorTwitter: string
  setAuthorTwitter: (val: string) => void
  authorLinkedin: string
  setAuthorLinkedin: (val: string) => void
  authorGithub: string
  setAuthorGithub: (val: string) => void
}

export function AuthorSocialLinksSection({
  authorTwitter,
  setAuthorTwitter,
  authorLinkedin,
  setAuthorLinkedin,
  authorGithub,
  setAuthorGithub,
}: AuthorSocialLinksSectionProps) {
  return (
    <div className="space-y-3 pt-4 border-t border-border/80">
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <Share2 className="h-3.5 w-3.5 text-primary" /> Author Social Links
      </label>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-muted-foreground">Twitter / X</label>
          <Input
            placeholder="@fiamanillah"
            value={authorTwitter}
            onChange={(e) => setAuthorTwitter(e.target.value)}
            className="text-xs h-9 bg-background border-border/90 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-xs"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-muted-foreground">LinkedIn</label>
          <Input
            placeholder="https://linkedin.com/in/fiamanillah"
            value={authorLinkedin}
            onChange={(e) => setAuthorLinkedin(e.target.value)}
            className="text-xs h-9 bg-background border-border/90 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-xs"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-muted-foreground">GitHub</label>
          <Input
            placeholder="https://github.com/fiamanillah"
            value={authorGithub}
            onChange={(e) => setAuthorGithub(e.target.value)}
            className="text-xs h-9 bg-background border-border/90 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-xs"
          />
        </div>
      </div>
    </div>
  )
}
