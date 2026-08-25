import Link from "next/link"
import {
  Layers,
  CalendarCheck,
  FileText,
  Cpu,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Clock,
  Briefcase,
  Mail,
  ShieldCheck,
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

const careerKpis = [
  {
    title: "Experience Track Record",
    value: "3+ Years",
    detail: "Full-Stack & Backend Architecture",
    icon: Briefcase,
    badge: "Verified",
  },
  {
    title: "Production Case Studies",
    value: "4 Systems",
    detail: "Microservices & Distributed APIs",
    icon: Layers,
    badge: "Published",
  },
  {
    title: "Client & Project Calls",
    value: "Active",
    detail: "Available for contract & full-time",
    icon: CalendarCheck,
    badge: "Open",
  },
  {
    title: "Core Technologies",
    value: "25+ Tools",
    detail: "Nest, Go, Redis, RabbitMQ, Docker",
    icon: Cpu,
    badge: "Production",
  },
]

const recentInquiries = [
  {
    id: "inq_1",
    client: "Fintech Venture",
    service: "Microservices & Queue Architecture",
    type: "Contract Consulting",
    status: "CONFIRMED",
    time: "Tomorrow, 3:00 PM UTC",
  },
  {
    id: "inq_2",
    client: "Healthcare SaaS",
    service: "Real-time Chat & WebSocket Pipeline",
    type: "Full-Stack Build",
    status: "SCHEDULED",
    time: "Thu, 5:30 PM UTC",
  },
  {
    id: "inq_3",
    client: "E-Commerce Group",
    service: "PostgreSQL & Redis Cache Optimization",
    type: "Performance Audit",
    status: "CONFIRMED",
    time: "Fri, 2:00 PM UTC",
  },
  {
    id: "inq_4",
    client: "Enterprise Tech Lead",
    service: "Full-Stack Senior Role Interview",
    type: "Career Interview",
    status: "COMPLETED",
    time: "Yesterday",
  },
]

const featuredSystems = [
  {
    title: "Mickanic API & Billing Engine",
    role: "Full-Stack Architect",
    stack: "Nest.js · Redis · RabbitMQ · Stripe",
    impact: "Multi-tenant credit system with asynchronous worker queues & event billing.",
    link: "/case-studies",
  },
  {
    title: "Moja Cares Real-Time Platform",
    role: "Lead Backend Developer",
    stack: "TypeScript · WebSockets · Express · PostgreSQL",
    impact: "Secure provider-patient messaging with sub-100ms real-time delivery.",
    link: "/case-studies",
  },
  {
    title: "Containerized VPS Orchestration",
    role: "DevOps & Systems",
    stack: "Docker · Linux VPS · Nginx · CI/CD",
    impact: "Zero-downtime deployment pipelines with isolated service containers.",
    link: "/case-studies",
  },
]

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-8">
      {/* Executive Welcome Banner */}
      <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Executive Overview
            </h1>
            <Badge
              variant="secondary"
              className="border border-primary/30 bg-primary/10 font-mono text-xs text-primary"
            >
              Fi Amanillah // Portfolio Hub
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Centralized hub for managing architectural case studies, client consultations, verified skills, and career records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="outline" size="sm" asChild>
            <a
              href="https://github.com/fiamanillah"
              target="_blank"
              rel="noopener noreferrer"
              className="gap-1.5"
            >
              <ExternalLink className="size-3.5 text-primary" />
              <span>GitHub</span>
            </a>
          </Button>

          <Button variant="outline" size="sm" asChild>
            <Link href="/resume" className="gap-1.5">
              <FileText className="size-3.5 text-primary" />
              <span>Resume</span>
            </Link>
          </Button>

          <Button size="sm" asChild className="bg-primary text-primary-foreground hover:brightness-110">
            <Link href="/bookings" className="gap-1.5">
              <CalendarCheck className="size-3.5" />
              <span>Manage Bookings</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Career & Architecture KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {careerKpis.map((kpi) => (
          <Card
            key={kpi.title}
            className="relative overflow-hidden border-border/80 bg-card/60 backdrop-blur-xs transition-all duration-200 hover:border-primary/40"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div className="flex size-8 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
                <kpi.icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {kpi.value}
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>{kpi.detail}</span>
                <span className="font-mono text-[10px] font-semibold text-primary">
                  [{kpi.badge}]
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid: Client Inquiries + Featured Architectures */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Client & Recruiter Inquiries / Consultations Table (7 Cols) */}
        <Card className="border-border/80 lg:col-span-7">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Client & Recruiter Consultations
              </CardTitle>
              <CardDescription>
                Upcoming advisory sessions, contract inquiries, and interview schedule.
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
              <Link href="/bookings">
                View All
                <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Organization / Scope</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6 text-right">Schedule</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentInquiries.map((inq) => (
                  <TableRow key={inq.id} className="hover:bg-muted/40">
                    <TableCell className="pl-6">
                      <div className="font-medium text-foreground text-xs">
                        {inq.client}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {inq.service}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {inq.type}
                    </TableCell>
                    <TableCell>
                      {inq.status === "CONFIRMED" ? (
                        <Badge variant="default" className="gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                          <CheckCircle2 className="size-2.5" />
                          Confirmed
                        </Badge>
                      ) : inq.status === "SCHEDULED" ? (
                        <Badge variant="secondary" className="gap-1 text-[10px] text-primary border-primary/20 bg-primary/10">
                          <Clock className="size-2.5" />
                          Scheduled
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 text-[10px] text-muted-foreground">
                          Completed
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="pr-6 text-right font-mono text-[11px] text-muted-foreground">
                      {inq.time}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Featured Case Studies & Quick Hub Actions (5 Cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Featured Production Architectures */}
          <Card className="border-border/80">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Featured Case Studies
                </CardTitle>
                <CardDescription>
                  High-impact systems & technical deep dives.
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
                <Link href="/case-studies">
                  Manage
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {featuredSystems.map((sys) => (
                <div
                  key={sys.title}
                  className="rounded-md border border-border bg-card/40 p-3 text-xs transition-colors hover:border-primary/40 hover:bg-card/70"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                      {sys.title}
                    </span>
                    <span className="font-mono text-[10px] text-primary">
                      {sys.role}
                    </span>
                  </div>
                  <p className="mt-1 text-muted-foreground leading-relaxed">
                    {sys.impact}
                  </p>
                  <div className="mt-2 font-mono text-[10px] text-muted-foreground/80">
                    {sys.stack}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Hub Navigation */}
          <Card className="border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground">
                Quick Content Management
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="h-9 justify-start gap-2 text-xs" asChild>
                <Link href="/case-studies">
                  <Layers className="size-3.5 text-primary" />
                  <span>Case Studies</span>
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="h-9 justify-start gap-2 text-xs" asChild>
                <Link href="/experiences">
                  <Briefcase className="size-3.5 text-primary" />
                  <span>Experiences</span>
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="h-9 justify-start gap-2 text-xs" asChild>
                <Link href="/skills">
                  <Cpu className="size-3.5 text-primary" />
                  <span>Skills & Stack</span>
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="h-9 justify-start gap-2 text-xs" asChild>
                <Link href="/blogs">
                  <FileText className="size-3.5 text-primary" />
                  <span>Blog Posts</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
