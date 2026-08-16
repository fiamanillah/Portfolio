import {
  Code,
  Copy,
  Eye,
  FileCode2,
  Layers,
  Plus,
  Search,
  Sparkles,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

const templates = [
  {
    id: "tpl_1",
    name: "Newsletter Welcome",
    slug: "newsletter-welcome",
    type: "EMAIL",
    status: "ACTIVE",
    subject: "Welcome to the engineering journal 🚀",
    variables: ["userName", "confirmationUrl", "unsubscribeUrl"],
    lastUpdated: "2 days ago",
  },
  {
    id: "tpl_2",
    name: "Comment Reply Notification",
    slug: "comment-reply",
    type: "NOTIFICATION",
    status: "ACTIVE",
    subject: "New reply on your discussion comment",
    variables: ["authorName", "postTitle", "commentSnippet", "articleUrl"],
    lastUpdated: "5 days ago",
  },
  {
    id: "tpl_3",
    name: "Password Reset Flow",
    slug: "auth-password-reset",
    type: "SYSTEM_AUTH",
    status: "ACTIVE",
    subject: "Secure link to reset your account password",
    variables: ["userName", "resetToken", "expiryMinutes"],
    lastUpdated: "1 week ago",
  },
  {
    id: "tpl_4",
    name: "Weekly Digest Announcement",
    slug: "weekly-digest",
    type: "CAMPAIGN",
    status: "DRAFT",
    subject: "Weekly Highlights: Distributed Systems & Microservices",
    variables: ["articlesList", "featuredPost", "subscriberName"],
    lastUpdated: "Just now",
  },
]

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Template Engine
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Build and manage LiquidJS/HTML templates for emails, push notifications, and auth flows.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm">
            <Plus className="size-4 mr-1.5" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search templates by name or slug..."
            className="pl-8 h-9 text-xs"
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">
            All (4)
          </Badge>
          <Badge variant="secondary" className="cursor-pointer">
            Email (2)
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">
            Auth (1)
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">
            Campaign (1)
          </Badge>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        {templates.map((tpl) => (
          <Card key={tpl.id} className="flex flex-col justify-between border-border/80 bg-card/70">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileCode2 className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">{tpl.name}</CardTitle>
                    <code className="text-xs text-muted-foreground font-mono">
                      {tpl.slug}
                    </code>
                  </div>
                </div>
                <Badge
                  variant={tpl.status === "ACTIVE" ? "default" : "secondary"}
                  className="text-[10px]"
                >
                  {tpl.status}
                </Badge>
              </div>
              <CardDescription className="pt-2 text-xs">
                <span className="font-semibold text-foreground/80">Subject: </span>
                {tpl.subject}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="rounded-lg border border-border/60 bg-muted/40 p-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-2">
                  <Code className="size-3.5" />
                  <span>Dynamic Variables</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tpl.variables.map((v) => (
                    <Badge
                      key={v}
                      variant="outline"
                      className="font-mono text-[10px] bg-background/80"
                    >
                      {`{{ ${v} }}`}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex items-center justify-between border-t border-border/60 pt-4 text-xs text-muted-foreground">
              <span>Updated {tpl.lastUpdated}</span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                  <Eye className="size-3.5" />
                  Preview
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                  <Copy className="size-3.5" />
                  Edit
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
