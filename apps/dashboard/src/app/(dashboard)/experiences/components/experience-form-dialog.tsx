"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Badge } from "@workspace/ui/components/badge"
import { toast } from "@workspace/ui/components/sonner"
import {
  Plus,
  Trash2,
  Briefcase,
  Layers,
  Sparkles,
  Cpu,
  BarChart3,
  X,
  Loader2,
} from "lucide-react"
import type {
  ExperienceDTO,
  CreateExperienceDTO,
  UpdateExperienceDTO,
  ExperienceStatus,
  ExperienceStatItem,
} from "@workspace/shared"
import { ExperienceApi } from "@/lib/api"

interface ExperienceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  experience: ExperienceDTO | null
  onSuccess: () => void
}

const COMMON_TECH_SUGGESTIONS = [
  "TypeScript",
  "JavaScript",
  "React",
  "Next.js",
  "Node.js",
  "Express.js",
  "Prisma ORM",
  "PostgreSQL",
  "Redis",
  "RabbitMQ",
  "Docker",
  "WebSockets",
  "Stripe",
  "Paystack",
  "AWS S3",
  "MinIO",
  "Linux VPS",
  "Tailwind CSS",
  "GraphQL",
  "Bun",
]

const EMPLOYMENT_TYPES = [
  "Full-Time",
  "Part-Time",
  "Contract",
  "Freelance",
  "Internship",
  "Consultant",
]

export function ExperienceFormDialog({
  open,
  onOpenChange,
  experience,
  onSuccess,
}: ExperienceFormDialogProps) {
  const isEdit = !!experience
  const [activeTab, setActiveTab] = React.useState("basics")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Form States
  const [company, setCompany] = React.useState("")
  const [companyUrl, setCompanyUrl] = React.useState("")
  const [role, setRole] = React.useState("")
  const [titleLines, setTitleLines] = React.useState<string[]>([])
  const [newTitleLine, setNewTitleLine] = React.useState("")
  const [location, setLocation] = React.useState("")
  const [employmentType, setEmploymentType] = React.useState("Full-Time")
  const [year, setYear] = React.useState("")
  const [period, setPeriod] = React.useState("")
  const [isCurrent, setIsCurrent] = React.useState(false)
  const [status, setStatus] = React.useState<ExperienceStatus>("PUBLISHED")
  const [featured, setFeatured] = React.useState(true)
  const [order, setOrder] = React.useState(0)

  // Rich Content States
  const [description, setDescription] = React.useState("")
  const [highlights, setHighlights] = React.useState<string[]>([])
  const [newHighlight, setNewHighlight] = React.useState("")
  const [technologies, setTechnologies] = React.useState<string[]>([])
  const [newTech, setNewTech] = React.useState("")
  const [stats, setStats] = React.useState<ExperienceStatItem[]>([])
  const [newStatLabel, setNewStatLabel] = React.useState("")
  const [newStatValue, setNewStatValue] = React.useState("")
  const [learned, setLearned] = React.useState("")

  // Reset or Populate form on open/change
  React.useEffect(() => {
    if (experience) {
      setCompany(experience.company || "")
      setCompanyUrl(experience.companyUrl || "")
      setRole(experience.role || "")
      setTitleLines(experience.title || [])
      setLocation(experience.location || "")
      setEmploymentType(experience.employmentType || "Full-Time")
      setYear(experience.year || "")
      setPeriod(experience.period || "")
      setIsCurrent(experience.isCurrent ?? false)
      setStatus(experience.status || "PUBLISHED")
      setFeatured(experience.featured ?? true)
      setOrder(experience.order ?? 0)
      setDescription(experience.description || "")
      setHighlights(experience.highlights || [])
      setTechnologies(experience.technologies || [])
      setStats(experience.stats || [])
      setLearned(experience.learned || "")
    } else {
      setCompany("")
      setCompanyUrl("")
      setRole("")
      setTitleLines([])
      setLocation("Dhaka, Bangladesh · Remote-Friendly")
      setEmploymentType("Full-Time")
      setYear(new Date().getFullYear().toString())
      setPeriod("PRESENT // 1 MO")
      setIsCurrent(true)
      setStatus("PUBLISHED")
      setFeatured(true)
      setOrder(0)
      setDescription("")
      setHighlights([])
      setTechnologies([])
      setStats([])
      setLearned("")
    }
    setActiveTab("basics")
  }, [experience, open])

  // Handlers for dynamic lists
  const handleAddTitleLine = () => {
    if (newTitleLine.trim()) {
      setTitleLines([...titleLines, newTitleLine.trim()])
      setNewTitleLine("")
    }
  }

  const handleRemoveTitleLine = (index: number) => {
    setTitleLines(titleLines.filter((_, i) => i !== index))
  }

  const handleAutoSplitRole = () => {
    if (!role.trim()) return
    const parts = role.trim().split(" ")
    if (parts.length >= 2) {
      setTitleLines([parts.slice(0, -1).join(" "), parts[parts.length - 1] || ""])
    } else {
      setTitleLines([role.trim()])
    }
  }

  const handleAddHighlight = () => {
    if (newHighlight.trim()) {
      setHighlights([...highlights, newHighlight.trim()])
      setNewHighlight("")
    }
  }

  const handleRemoveHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index))
  }

  const handleAddTech = (techToAdd: string) => {
    const trimmed = techToAdd.trim()
    if (trimmed && !technologies.includes(trimmed)) {
      setTechnologies([...technologies, trimmed])
      setNewTech("")
    }
  }

  const handleRemoveTech = (techToRemove: string) => {
    setTechnologies(technologies.filter((t) => t !== techToRemove))
  }

  const handleAddStat = () => {
    if (newStatLabel.trim() && newStatValue.trim()) {
      setStats([
        ...stats,
        { label: newStatLabel.trim(), value: newStatValue.trim() },
      ])
      setNewStatLabel("")
      setNewStatValue("")
    }
  }

  const handleRemoveStat = (index: number) => {
    setStats(stats.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!company.trim()) {
      toast.error("Company name is required")
      setActiveTab("basics")
      return
    }
    if (!role.trim()) {
      toast.error("Role is required")
      setActiveTab("basics")
      return
    }
    if (!period.trim() || !year.trim()) {
      toast.error("Year and Period are required")
      setActiveTab("basics")
      return
    }
    if (!description.trim()) {
      toast.error("Description is required")
      setActiveTab("description")
      return
    }

    setIsSubmitting(true)
    try {
      // Ensure title has at least split role if empty
      let finalTitle = titleLines.length > 0 ? titleLines : []
      if (finalTitle.length === 0) {
        const parts = role.trim().split(" ")
        finalTitle =
          parts.length >= 2
            ? [parts.slice(0, -1).join(" "), parts[parts.length - 1] || ""]
            : [role.trim()]
      }

      const payload: CreateExperienceDTO = {
        company: company.trim(),
        companyUrl: companyUrl.trim() || undefined,
        role: role.trim(),
        title: finalTitle,
        location: location.trim() || "Remote",
        employmentType,
        year: year.trim(),
        period: period.trim(),
        isCurrent,
        description: description.trim(),
        highlights,
        technologies,
        stats,
        learned: learned.trim() || undefined,
        status,
        featured,
        order: Number(order) || 0,
      }

      if (isEdit && experience) {
        const res = await ExperienceApi.update(experience.id, payload)
        if (res.success) {
          toast.success("Experience updated successfully")
          onOpenChange(false)
          onSuccess()
        } else {
          toast.error(res.message || "Failed to update experience")
        }
      } else {
        const res = await ExperienceApi.create(payload)
        if (res.success) {
          toast.success("Experience created successfully")
          onOpenChange(false)
          onSuccess()
        } else {
          toast.error(res.message || "Failed to create experience")
        }
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-[92vw] sm:max-w-none md:min-w-[780px] lg:min-w-[920px] xl:min-w-[1040px] max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-2xl border-border/80 bg-background/95 backdrop-blur-md shadow-2xl">
        <DialogHeader className="border-b border-border/60 pb-4">
          <DialogTitle className="flex items-center gap-2 font-mono text-xl font-bold uppercase">
            <Briefcase className="h-5 w-5 text-primary" />
            {isEdit ? "Edit Professional History" : "Add Professional History"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEdit
              ? `Manage and customize details for ${experience?.company || "this experience"}.`
              : "Create a new career milestone, technical role, and achievements for your portfolio."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 font-mono text-xs h-10">
              <TabsTrigger value="basics" className="flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" />
                1. Basics
              </TabsTrigger>
              <TabsTrigger value="description" className="flex items-center gap-1.5">
                <Layers className="h-4 w-4" />
                2. Highlights
              </TabsTrigger>
              <TabsTrigger value="technologies" className="flex items-center gap-1.5">
                <Cpu className="h-4 w-4" />
                3. Tech Stack
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4" />
                4. Stats & Quote
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: BASICS */}
            <TabsContent value="basics" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company" className="font-mono text-xs uppercase">
                    Company Name *
                  </Label>
                  <Input
                    id="company"
                    placeholder="e.g. Softvence Agency"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyUrl" className="font-mono text-xs uppercase">
                    Company Website
                  </Label>
                  <Input
                    id="companyUrl"
                    type="url"
                    placeholder="https://example.com"
                    value={companyUrl}
                    onChange={(e) => setCompanyUrl(e.target.value)}
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="role" className="font-mono text-xs uppercase">
                      Job Role / Position *
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleAutoSplitRole}
                      className="h-6 text-[10px] font-mono text-primary hover:text-primary"
                    >
                      ⚡ Auto-generate Split Title
                    </Button>
                  </div>
                  <Input
                    id="role"
                    placeholder="e.g. FULL STACK DEVELOPER"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                  />
                </div>

                {/* Split title lines */}
                <div className="space-y-2 sm:col-span-2 rounded-md border border-border/60 bg-muted/20 p-3">
                  <Label className="font-mono text-[11px] text-muted-foreground uppercase">
                    Title Display Lines (Shows stacked on website)
                  </Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {titleLines.map((line, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="flex items-center gap-1 font-mono text-xs"
                      >
                        {line}
                        <button
                          type="button"
                          onClick={() => handleRemoveTitleLine(idx)}
                          className="hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. FULL STACK"
                      value={newTitleLine}
                      onChange={(e) => setNewTitleLine(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddTitleLine()
                        }
                      }}
                      className="h-8 text-xs"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleAddTitleLine}
                      className="h-8 font-mono text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Line
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year" className="font-mono text-xs uppercase">
                    Display Year *
                  </Label>
                  <Input
                    id="year"
                    placeholder="e.g. 2025"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="period" className="font-mono text-xs uppercase">
                    Period String *
                  </Label>
                  <Input
                    id="period"
                    placeholder="e.g. PRESENT // 14 MO"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employmentType" className="font-mono text-xs uppercase">
                    Employment Type
                  </Label>
                  <Select value={employmentType} onValueChange={setEmploymentType}>
                    <SelectTrigger id="employmentType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYMENT_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 sm:col-span-2 md:col-span-1">
                  <Label htmlFor="location" className="font-mono text-xs uppercase">
                    Location *
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g. Dhaka, Bangladesh · Remote-Friendly"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="font-mono text-xs uppercase">
                    Publish Status
                  </Label>
                  <Select
                    value={status}
                    onValueChange={(val: ExperienceStatus) => setStatus(val)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUBLISHED">Published (Visible on site)</SelectItem>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order" className="font-mono text-xs uppercase">
                    Sort Order Priority
                  </Label>
                  <Input
                    id="order"
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                  />
                </div>

                {/* Toggles row */}
                <div className="flex items-center justify-between rounded-lg border border-border p-3.5">
                  <div className="space-y-0.5">
                    <Label className="font-mono text-xs uppercase">Current Position</Label>
                    <p className="text-[11px] text-muted-foreground">
                      Mark as active role in progress
                    </p>
                  </div>
                  <Switch checked={isCurrent} onCheckedChange={setIsCurrent} />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border p-3.5">
                  <div className="space-y-0.5">
                    <Label className="font-mono text-xs uppercase">Featured on Site</Label>
                    <p className="text-[11px] text-muted-foreground">
                      Highlight in prominent portfolio sections
                    </p>
                  </div>
                  <Switch checked={featured} onCheckedChange={setFeatured} />
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: DESCRIPTION & HIGHLIGHTS */}
            <TabsContent value="description" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="description" className="font-mono text-xs uppercase">
                  Role Summary / Overview Description *
                </Label>
                <Textarea
                  id="description"
                  rows={4}
                  placeholder="Architected type-safe backend systems with TypeScript, Express.js..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-3">
                <Label className="font-mono text-xs uppercase">
                  Key Achievements & Highlights (Bullet List)
                </Label>

                <div className="space-y-2">
                  {highlights.map((h, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 rounded-md border border-border/80 bg-muted/20 p-2.5"
                    >
                      <span className="mt-0.5 font-mono text-xs font-bold text-primary">
                        +
                      </span>
                      <p className="flex-1 text-xs text-foreground leading-relaxed">
                        {h}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveHighlight(idx)}
                        className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Improved database query latency by 40% with Redis caching"
                    value={newHighlight}
                    onChange={(e) => setNewHighlight(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddHighlight()
                      }
                    }}
                    className="text-xs"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAddHighlight}
                    className="font-mono text-xs shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: TECHNOLOGIES */}
            <TabsContent value="technologies" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="font-mono text-xs uppercase">Selected Tech Stack</Label>
                <div className="flex flex-wrap gap-2 min-h-[60px] rounded-lg border border-border/80 bg-muted/20 p-3">
                  {technologies.length > 0 ? (
                    technologies.map((tech) => (
                      <Badge
                        key={tech}
                        variant="default"
                        className="flex items-center gap-1.5 font-mono text-xs py-1"
                      >
                        {tech}
                        <button
                          type="button"
                          onClick={() => handleRemoveTech(tech)}
                          className="hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      No technologies selected yet. Add custom tags or click recommendations below.
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Type a technology (e.g. TypeScript, GraphQL)..."
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddTech(newTech)
                    }
                  }}
                  className="text-xs"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleAddTech(newTech)}
                  className="font-mono text-xs shrink-0"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Tag
                </Button>
              </div>

              <div className="space-y-2 pt-2">
                <Label className="font-mono text-[11px] text-muted-foreground uppercase">
                  Quick Add Popular Technologies:
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_TECH_SUGGESTIONS.map((sug) => {
                    const isSelected = technologies.includes(sug)
                    return (
                      <button
                        key={sug}
                        type="button"
                        onClick={() =>
                          isSelected ? handleRemoveTech(sug) : handleAddTech(sug)
                        }
                        className={`rounded border px-2 py-1 font-mono text-[11px] transition-colors ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary font-bold"
                            : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
                        }`}
                      >
                        {isSelected ? `✓ ${sug}` : `+ ${sug}`}
                      </button>
                    )
                  })}
                </div>
              </div>
            </TabsContent>

            {/* TAB 4: STATS & QUOTE */}
            <TabsContent value="stats" className="space-y-4 pt-4">
              <div className="space-y-3">
                <Label className="font-mono text-xs uppercase">
                  Key Statistics / Impact Metrics (Key-Value Pairs)
                </Label>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {stats.map((st, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-md border border-border/80 bg-muted/20 p-2.5"
                    >
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-bold text-foreground">
                          {st.value}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground uppercase">
                          {st.label}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveStat(idx)}
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Input
                    placeholder="Metric Value (e.g. RabbitMQ or 40% Faster)"
                    value={newStatValue}
                    onChange={(e) => setNewStatValue(e.target.value)}
                    className="text-xs"
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder="Metric Label (e.g. Background Queues)"
                      value={newStatLabel}
                      onChange={(e) => setNewStatLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddStat()
                        }
                      }}
                      className="text-xs"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleAddStat}
                      className="font-mono text-xs shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-border">
                <Label htmlFor="learned" className="font-mono text-xs uppercase">
                  Key Takeaway / Learned Quote (Optional)
                </Label>
                <Textarea
                  id="learned"
                  rows={3}
                  placeholder='e.g. "Mastered decoupling intensive background jobs and optimizing database access patterns..."'
                  value={learned}
                  onChange={(e) => setLearned(e.target.value)}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex items-center justify-between sm:justify-between pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="font-mono font-bold">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                "Update Experience"
              ) : (
                "Create Experience"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
