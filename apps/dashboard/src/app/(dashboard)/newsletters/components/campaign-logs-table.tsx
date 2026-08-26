// apps/dashboard/src/app/(dashboard)/newsletters/components/campaign-logs-table.tsx
"use client"

import * as React from "react"
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  Mail,
} from "lucide-react"
import type { NewsletterSendLogItem, SendLogStatus } from "@workspace/shared"
import { NewsletterApi } from "@/lib/api"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { Badge } from "@workspace/ui/components/badge"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/components/card"

interface CampaignLogsTableProps {
  newsletterId: string
}

export function CampaignLogsTable({ newsletterId }: CampaignLogsTableProps) {
  const [logs, setLogs] = React.useState<NewsletterSendLogItem[]>([])
  const [counts, setCounts] = React.useState({
    total: 0,
    sent: 0,
    failed: 0,
    pending: 0,
  })
  const [isLoading, setIsLoading] = React.useState(true)

  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(50)
  const [totalPages, setTotalPages] = React.useState(1)

  const fetchLogs = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await NewsletterApi.getLogs(newsletterId, {
        page,
        limit: pageSize,
        search: search.trim() || undefined,
        status:
          statusFilter !== "ALL" ? (statusFilter as SendLogStatus) : undefined,
      })

      if (res.success && res.data) {
        setLogs(res.data)
        if (res.pagination?.totalPages) {
          setTotalPages(res.pagination.totalPages)
        }
        if (res.meta?.counts) {
          setCounts({
            total: res.meta.counts.total ?? 0,
            sent: res.meta.counts.sent ?? 0,
            failed: res.meta.counts.failed ?? 0,
            pending: res.meta.counts.pending ?? 0,
          })
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false)
    }
  }, [newsletterId, page, pageSize, search, statusFilter])

  React.useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  return (
    <div className="space-y-4">
      {/* KPI Counters Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border-border/60 bg-card/40 p-3">
          <div className="text-[11px] font-semibold text-muted-foreground uppercase">
            Total Recipients
          </div>
          <div className="text-xl font-bold text-foreground">
            {counts.total.toLocaleString()}
          </div>
        </Card>

        <Card className="border-emerald-500/20 bg-emerald-500/5 p-3">
          <div className="text-[11px] font-semibold text-emerald-600 uppercase dark:text-emerald-400">
            Delivered (Sent)
          </div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {counts.sent.toLocaleString()}
          </div>
        </Card>

        <Card className="border-rose-500/20 bg-rose-500/5 p-3">
          <div className="text-[11px] font-semibold text-rose-600 uppercase dark:text-rose-400">
            Failed Sends
          </div>
          <div className="text-xl font-bold text-rose-600 dark:text-rose-400">
            {counts.failed.toLocaleString()}
          </div>
        </Card>

        <Card className="border-amber-500/20 bg-amber-500/5 p-3">
          <div className="text-[11px] font-semibold text-amber-600 uppercase dark:text-amber-400">
            Pending in Queue
          </div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
            {counts.pending.toLocaleString()}
          </div>
        </Card>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col gap-3 rounded-lg border border-border/80 bg-card/60 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-2.5 left-3 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search logs by email address or error..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="h-8 pl-8 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val)
              setPage(1)
            }}
          >
            <SelectTrigger className="h-8 w-[130px] text-xs">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs">
                All Statuses
              </SelectItem>
              <SelectItem value="SENT" className="text-xs">
                Sent
              </SelectItem>
              <SelectItem value="FAILED" className="text-xs">
                Failed
              </SelectItem>
              <SelectItem value="PENDING" className="text-xs">
                Pending
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            disabled={isLoading}
            className="h-8 gap-1 text-xs"
          >
            <RefreshCw
              className={`size-3 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Delivery Logs Table */}
      <div className="rounded-lg border border-border/80 bg-card/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Recipient</TableHead>
              <TableHead className="text-xs">Delivery Status</TableHead>
              <TableHead className="text-xs">Sent At</TableHead>
              <TableHead className="text-xs">Error / Diagnostic</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-xs">
                  <RefreshCw className="mx-auto size-4 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : logs.length > 0 ? (
              logs.map((log) => {
                const StatusIcon =
                  log.status === "SENT"
                    ? CheckCircle2
                    : log.status === "FAILED"
                      ? XCircle
                      : Clock

                const statusColor =
                  log.status === "SENT"
                    ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/10"
                    : log.status === "FAILED"
                      ? "text-rose-500 border-rose-500/30 bg-rose-500/10"
                      : "text-amber-500 border-amber-500/30 bg-amber-500/10"

                return (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="font-mono text-xs font-semibold text-foreground">
                        {log.email}
                      </div>
                      {log.name && (
                        <div className="text-[11px] text-muted-foreground">
                          {log.name}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`gap-1 font-mono text-[10px] uppercase ${statusColor}`}
                      >
                        <StatusIcon className="size-3" />
                        <span>{log.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {log.sentAt ? new Date(log.sentAt).toLocaleString() : "—"}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate text-xs text-rose-500">
                      {log.error || (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-xs text-muted-foreground"
                >
                  No delivery logs recorded yet for this campaign.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 text-xs"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="h-8 text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
