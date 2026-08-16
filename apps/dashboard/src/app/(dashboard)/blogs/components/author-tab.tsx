"use client"

import * as React from "react"
import { Input } from "@workspace/ui/components/input"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"

interface AuthorTabProps {
  authorName: string
  setAuthorName: (val: string) => void
  authorRole: string
  setAuthorRole: (val: string) => void
  authorAvatar: string
  setAuthorAvatar: (val: string) => void
  authorTwitter: string
  setAuthorTwitter: (val: string) => void
  authorLinkedin: string
  setAuthorLinkedin: (val: string) => void
  authorGithub: string
  setAuthorGithub: (val: string) => void
}

export function AuthorTab({
  authorName,
  setAuthorName,
  authorRole,
  setAuthorRole,
  authorAvatar,
  setAuthorAvatar,
  authorTwitter,
  setAuthorTwitter,
  authorLinkedin,
  setAuthorLinkedin,
  authorGithub,
  setAuthorGithub,
}: AuthorTabProps) {
  return (
    <div className="space-y-6">
      {/* Live Preview Card */}
      <div className="p-4 rounded-xl border border-border/80 bg-muted/20 flex items-center gap-4">
        <Avatar className="h-14 w-14 border-2 border-primary/20">
          <AvatarImage src={authorAvatar} alt={authorName} />
          <AvatarFallback>{(authorName || "FA").slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-bold text-sm text-foreground">{authorName || "Author Name"}</div>
          <div className="text-xs text-muted-foreground">{authorRole || "Engineer Title"}</div>
          <div className="text-[11px] text-primary font-mono mt-0.5">{authorTwitter}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Author Name
          </label>
          <Input
            placeholder="Fi Amanillah"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="bg-card text-xs"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Author Role / Title
          </label>
          <Input
            placeholder="Full Stack & DevOps Engineer"
            value={authorRole}
            onChange={(e) => setAuthorRole(e.target.value)}
            className="bg-card text-xs"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Author Avatar URL
        </label>
        <Input
          placeholder="/fi.png or https://..."
          value={authorAvatar}
          onChange={(e) => setAuthorAvatar(e.target.value)}
          className="bg-card text-xs"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-border">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Twitter / X Handle
          </label>
          <Input
            placeholder="@fiamanillah"
            value={authorTwitter}
            onChange={(e) => setAuthorTwitter(e.target.value)}
            className="bg-card text-xs"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            LinkedIn Profile URL
          </label>
          <Input
            placeholder="https://linkedin.com/in/fiamanillah"
            value={authorLinkedin}
            onChange={(e) => setAuthorLinkedin(e.target.value)}
            className="bg-card text-xs"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            GitHub Profile URL
          </label>
          <Input
            placeholder="https://github.com/fiamanillah"
            value={authorGithub}
            onChange={(e) => setAuthorGithub(e.target.value)}
            className="bg-card text-xs"
          />
        </div>
      </div>
    </div>
  )
}
