import Link from "next/link"
import {
  Users,
  FileCode2,
  MessageSquareQuote,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Mail,
  CheckCircle2,
  Clock,
  Sparkles,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

const stats = [
  {
    title: "Total Subscribers",
    value: "1,248",
    change: "+14.2%",
    description: "from last month",
    icon: Users,
    variant: "default",
  },
  {
    title: "Active Templates",
    value: "12",
    change: "+2 new",
    description: "email & notification formats",
    icon: FileCode2,
    variant: "secondary",
  },
  {
    title: "Recent Comments",
    value: "38",
    change: "3 pending",
    description: "across 6 published articles",
    icon: MessageSquareQuote,
    variant: "outline",
  },
  {
    title: "System Telemetry",
    value: "99.98%",
    change: "Healthy",
    description: "average uptime across services",
    icon: Activity,
    variant: "default",
  },
]

const recentSubscribers = [
  {
    id: "sub_1",
    email: "alex.rivera@techcorp.io",
    status: "ACTIVE",
    subscribedAt: "10 minutes ago",
    source: "Blog: Docker Guide",
  },
  {
    id: "sub_2",
    email: "sarah.c@cloudscale.dev",
    status: "ACTIVE",
    subscribedAt: "1 hour ago",
    source: "Portfolio Home",
  },
  {
    id: "sub_3",
    email: "dev.marcus@matrix.org",
    status: "UNCONFIRMED",
    subscribedAt: "3 hours ago",
    source: "API Documentation",
  },
  {
    id: "sub_4",
    email: "elena.v@quantum.ai",
    status: "ACTIVE",
    subscribedAt: "5 hours ago",
    source: "Blog: Prisma Optimization",
  },
]

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              System Overview
            </h1>
            <Badge variant="secondary" className="font-mono text-xs text-primary">
              Live Feed
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back! Here is a summary of your portfolio traffic, subscribers, and content activity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/settings">
              <Sparkles className="size-4 mr-1 text-primary" />
              Configure System
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/subscribers">
              <Mail className="size-4 mr-1" />
              Manage Audience
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden border-border/80 bg-card/60 backdrop-blur-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <stat.icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center text-primary font-medium">
                  <TrendingUp className="size-3 mr-0.5" />
                  {stat.change}
                </span>
                <span>{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid: Recent Activity & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Recent Subscribers Table */}
        <Card className="lg:col-span-4 border-border/80">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Recent Subscribers
              </CardTitle>
              <CardDescription>
                Audience members who recently subscribed to your newsletter.
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
              <Link href="/subscribers">
                View All
                <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Subscriber</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Source</TableHead>
                  <TableHead className="pr-6 text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSubscribers.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="pl-6 font-medium font-mono text-xs">
                      {sub.email}
                    </TableCell>
                    <TableCell>
                      {sub.status === "ACTIVE" ? (
                        <Badge variant="default" className="gap-1 text-[10px]">
                          <CheckCircle2 className="size-2.5" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1 text-[10px]">
                          <Clock className="size-2.5" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                      {sub.source}
                    </TableCell>
                    <TableCell className="pr-6 text-right text-xs text-muted-foreground">
                      {sub.subscribedAt}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick System Actions & Health */}
        <div className="space-y-6 lg:col-span-3">
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
              <CardDescription>
                Common administrative management tasks.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button variant="outline" className="justify-start gap-2 h-11" asChild>
                <Link href="/templates">
                  <FileCode2 className="size-4 text-primary" />
                  <div className="flex flex-col items-start text-xs">
                    <span className="font-semibold text-foreground">Create Email Template</span>
                    <span className="text-muted-foreground">Design a new transactional template</span>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="justify-start gap-2 h-11" asChild>
                <Link href="/comments">
                  <MessageSquareQuote className="size-4 text-primary" />
                  <div className="flex flex-col items-start text-xs">
                    <span className="font-semibold text-foreground">Review Pending Comments</span>
                    <span className="text-muted-foreground">Moderate 3 discussion comments</span>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="justify-start gap-2 h-11" asChild>
                <Link href="/settings">
                  <Activity className="size-4 text-primary" />
                  <div className="flex flex-col items-start text-xs">
                    <span className="font-semibold text-foreground">System Diagnostics</span>
                    <span className="text-muted-foreground">Inspect API connection and database status</span>
                  </div>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
