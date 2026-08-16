import {
  Check,
  CheckCircle2,
  Clock,
  Filter,
  MessageSquare,
  Search,
  Trash2,
  X,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"

const comments = [
  {
    id: "cm_1",
    authorName: "Sarah Connor",
    authorInitials: "SC",
    authorEmail: "s.connor@skyline.org",
    postTitle: "Building Resilient Distributed Systems with RabbitMQ",
    content:
      "This writeup really helped clarify queue durability vs message persistence! Are you planning to cover dead-letter exchange handling in the next part?",
    status: "PENDING",
    createdAt: "25 minutes ago",
  },
  {
    id: "cm_2",
    authorName: "Liam Vance",
    authorInitials: "LV",
    authorEmail: "liam.vance@kernel.dev",
    postTitle: "Astro vs Next.js for Developer Portfolios",
    content:
      "Great breakdown of the island architecture. The speed benchmark difference between SSR and static islands is noticeable.",
    status: "APPROVED",
    createdAt: "2 hours ago",
  },
  {
    id: "cm_3",
    authorName: "Devin Zhao",
    authorInitials: "DZ",
    authorEmail: "devin@zhao.tech",
    postTitle: "PostgreSQL Index Optimization with Prisma",
    content:
      "One tip: adding composite indices on [status, createdAt] reduced our query time by 80% on high-volume tables.",
    status: "PENDING",
    createdAt: "4 hours ago",
  },
]

export default function CommentsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Comments Moderation
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review, approve, and moderate reader discussions across published articles.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <CheckCircle2 className="size-4 mr-1.5 text-primary" />
            Approve All Pending
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search comments by author or post..."
            className="pl-8 h-9 text-xs"
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="cursor-pointer">
            Pending (2)
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">
            Approved (1)
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">
            Spam (0)
          </Badge>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((cm) => (
          <Card key={cm.id} className="border-border/80 bg-card/60">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="size-9">
                    <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                      {cm.authorInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{cm.authorName}</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        ({cm.authorEmail})
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      On article: <strong className="text-foreground">{cm.postTitle}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {cm.status === "PENDING" ? (
                    <Badge variant="secondary" className="gap-1 text-[10px]">
                      <Clock className="size-3" />
                      Pending Moderation
                    </Badge>
                  ) : (
                    <Badge variant="default" className="gap-1 text-[10px]">
                      <Check className="size-3" />
                      Approved
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">{cm.createdAt}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm bg-muted/30 p-3 rounded-lg border border-border/50 leading-relaxed text-foreground/90">
                &ldquo;{cm.content}&rdquo;
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="size-3.5" />
                  Delete
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                  <X className="size-3.5" />
                  Reject
                </Button>
                <Button size="sm" className="h-8 gap-1 text-xs">
                  <Check className="size-3.5" />
                  Approve
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
