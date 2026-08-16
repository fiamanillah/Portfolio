import {
  Download,
  Filter,
  Mail,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserX,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

const subscribersList = [
  {
    id: "sub_1",
    email: "alex.rivera@techcorp.io",
    status: "ACTIVE",
    createdAt: "2026-08-14",
    confirmedAt: "2026-08-14",
    source: "Blog: Docker Guide",
  },
  {
    id: "sub_2",
    email: "sarah.c@cloudscale.dev",
    status: "ACTIVE",
    createdAt: "2026-08-12",
    confirmedAt: "2026-08-12",
    source: "Portfolio Hero",
  },
  {
    id: "sub_3",
    email: "dev.marcus@matrix.org",
    status: "UNCONFIRMED",
    createdAt: "2026-08-10",
    confirmedAt: null,
    source: "API Documentation",
  },
  {
    id: "sub_4",
    email: "elena.v@quantum.ai",
    status: "ACTIVE",
    createdAt: "2026-08-08",
    confirmedAt: "2026-08-08",
    source: "Blog: Prisma Optimization",
  },
  {
    id: "sub_5",
    email: "jordan.taylor@enterprise.net",
    status: "UNSUBSCRIBED",
    createdAt: "2026-07-22",
    confirmedAt: "2026-07-22",
    source: "Newsletter Modal",
  },
]

export default function SubscribersPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Subscribers Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your newsletter audience, track confirmations, and export subscriber lists.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="size-4 mr-1.5" />
            Export CSV
          </Button>
          <Button size="sm">
            <Plus className="size-4 mr-1.5" />
            Add Subscriber
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/80">
          <CardHeader className="pb-2">
            <CardDescription>Total Subscribers</CardDescription>
            <CardTitle className="text-2xl font-bold">1,248</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            +32 subscribers joined this week
          </CardContent>
        </Card>
        <Card className="border-border/80">
          <CardHeader className="pb-2">
            <CardDescription>Confirmed & Active</CardDescription>
            <CardTitle className="text-2xl font-bold text-primary">1,192</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            95.5% confirmation rate
          </CardContent>
        </Card>
        <Card className="border-border/80">
          <CardHeader className="pb-2">
            <CardDescription>Unconfirmed</CardDescription>
            <CardTitle className="text-2xl font-bold">56</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Awaiting double opt-in confirmation
          </CardContent>
        </Card>
      </div>

      {/* Main Subscribers Table Card */}
      <Card className="border-border/80">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Audience Directory</CardTitle>
              <CardDescription>
                Filtered list of subscribers across all campaigns and channels.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Filter by email or source..."
                  className="pl-8 h-9 text-xs"
                />
              </div>
              <Button variant="outline" size="sm" className="h-9 gap-1 text-xs">
                <Filter className="size-3.5" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Email Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Source</TableHead>
                <TableHead className="hidden sm:table-cell">Joined Date</TableHead>
                <TableHead className="pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribersList.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="pl-6 font-medium font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <Mail className="size-3.5 text-muted-foreground" />
                      {sub.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    {sub.status === "ACTIVE" && (
                      <Badge variant="default" className="text-[10px]">
                        Active
                      </Badge>
                    )}
                    {sub.status === "UNCONFIRMED" && (
                      <Badge variant="secondary" className="text-[10px]">
                        Unconfirmed
                      </Badge>
                    )}
                    {sub.status === "UNSUBSCRIBED" && (
                      <Badge variant="outline" className="text-[10px] text-destructive border-destructive/30">
                        Unsubscribed
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                    {sub.source}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                    {sub.createdAt}
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreVertical className="size-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2 text-xs">
                          <UserCheck className="size-3.5" />
                          Resend Confirmation
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-xs">
                          <UserX className="size-3.5" />
                          Mark Unsubscribed
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 text-xs text-destructive">
                          <Trash2 className="size-3.5" />
                          Delete Record
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
