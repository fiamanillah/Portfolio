"use client"

import * as React from "react"
import { Tag, Plus, X, Sparkles } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"

interface HeroTechStackCardProps {
  techStack: string[]
  setTechStack: (tech: string[]) => void
}

const POPULAR_TECHS = [
  "TypeScript",
  "Bun",
  "Node.js",
  "Next.js",
  "Astro",
  "React",
  "PostgreSQL",
  "Prisma",
  "Redis",
  "Docker",
  "RabbitMQ",
  "Socket.IO",
  "Tailwind CSS",
  "Cloudflare R2",
  "GraphQL",
  "WebSockets",
]

export function HeroTechStackCard({
  techStack,
  setTechStack,
}: HeroTechStackCardProps) {
  const [techInput, setTechInput] = React.useState("")

  const handleAddTech = (techToAdd?: string) => {
    const target = (techToAdd || techInput).trim()
    if (target && !techStack.includes(target)) {
      setTechStack([...techStack, target])
      if (!techToAdd) setTechInput("")
    }
  }

  const handleRemoveTech = (techToRemove: string) => {
    setTechStack(techStack.filter((t) => t !== techToRemove))
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-bold">
          Technology Stack
        </CardTitle>
        <CardDescription className="text-xs">
          Technologies, frameworks, databases, and message brokers used in this architecture.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Add technology (e.g. Bun, PostgreSQL, Redis)..."
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleAddTech()
              }
            }}
            className="text-xs h-9"
          />
          <Button
            type="button"
            onClick={() => handleAddTech()}
            size="sm"
            className="h-9 px-3 text-xs"
          >
            <Plus className="mr-1 size-3.5" /> Add
          </Button>
        </div>

        {/* Selected Tags */}
        <div className="space-y-1.5">
          <span className="font-mono text-[10px] text-muted-foreground uppercase">
            Active Stack ({techStack.length})
          </span>
          <div className="flex flex-wrap gap-1.5 min-h-[32px] rounded-lg border border-border/60 bg-muted/20 p-2">
            {techStack.map((tech) => (
              <Badge
                key={tech}
                variant="secondary"
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium"
              >
                <span>{tech}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTech(tech)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
            {!techStack.length && (
              <p className="text-xs text-muted-foreground self-center">
                No technologies added yet. Select suggestions below or type your own.
              </p>
            )}
          </div>
        </div>

        {/* Quick Suggestions */}
        <div className="space-y-1.5 pt-1">
          <span className="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
            <Sparkles className="size-2.5 text-primary" /> Popular suggestions:
          </span>
          <div className="flex flex-wrap gap-1">
            {POPULAR_TECHS.map((tech) => {
              const isSelected = techStack.includes(tech)
              return (
                <Badge
                  key={tech}
                  variant={isSelected ? "default" : "outline"}
                  className={`cursor-pointer text-[10px] transition-colors ${
                    isSelected
                      ? "bg-primary/20 text-primary border-primary/30"
                      : "hover:border-primary/50 hover:bg-muted/60"
                  }`}
                  onClick={() =>
                    isSelected ? handleRemoveTech(tech) : handleAddTech(tech)
                  }
                >
                  {isSelected ? "✓ " : "+ "}
                  {tech}
                </Badge>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
