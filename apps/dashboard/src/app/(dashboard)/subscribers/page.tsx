"use client"

import * as React from "react"
import {
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Filter,
  Mail,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  XCircle,
} from "lucide-react"

import type {
  SubscriberItem,
  SubscriberStats,
  AdminCreateSubscriberPayload,
  UpdateSubscriberPayload,
} from "@workspace/shared"
import { SubscriberApi } from "@/lib/api"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { toast } from "@workspace/ui/components/sonner"
import { getSubscriberColumns } from "./columns"
import { SubscribersDataTable } from "./data-table"

const DEFAULT_SOURCES = [
  "hero_section",
  "blog_post",
  "newsletter_modal",
  "admin_portal",
  "api_docs",
  "project_showcase",
]

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = React.useState<SubscriberItem[]>([])
  const [stats, setStats] = React.useState<SubscriberStats>({
    total: 0,
    subscribed: 0,
    unsubscribed: 0,
    pending: 0,
    recentSubscribers7d: 0,
    confirmationRate: 100,
  })
  const [isLoading, setIsLoading] = React.useState(true)

  // Query state
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("ALL")
  const [sourceFilter, setSourceFilter] = React.useState("ALL")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(20)
  const [totalCount, setTotalCount] = React.useState(0)

  // Dialog states
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = React.useState(false)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [isExporting, setIsExporting] = React.useState(false)

  // Selected item for dialogs
  const [selectedSubscriber, setSelectedSubscriber] =
    React.useState<SubscriberItem | null>(null)
  const [bulkSelectedIds, setBulkSelectedIds] = React.useState<string[]>([])

  // Form states
  const [addForm, setAddForm] = React.useState<AdminCreateSubscriberPayload>({
    email: "",
    name: "",
    status: "subscribed",
    source: "admin_portal",
    sendWelcomeEmail: true,
  })

  const [editForm, setEditForm] = React.useState<UpdateSubscriberPayload>({
    name: "",
    status: "subscribed",
    source: "admin_portal",
  })

  // Debounced search term
  const [debouncedSearch, setDebouncedSearch] = React.useState(searchQuery)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1) // Reset to page 1 on new search
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch Subscribers List & Stats
  const fetchSubscribers = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await SubscriberApi.list({
        page: currentPage,
        limit: pageSize,
        search: debouncedSearch || undefined,
        status: statusFilter !== "ALL" ? (statusFilter as "subscribed" | "unsubscribed" | "pending") : undefined,
        source: sourceFilter !== "ALL" ? sourceFilter : undefined,
        sortBy: "subscribedAt",
        sortOrder: "desc",
      })

      if (res.success && res.data) {
        setSubscribers(res.data)
        setTotalCount(res.pagination?.total || res.data.length)
        if (res.stats) {
          setStats(res.stats)
        }
      } else {
        toast.error("Failed to load subscribers", {
          description:
            res.error || "Please ensure the backend API is connected.",
        })
      }
    } catch (err: unknown) {
      toast.error("Error fetching audience data", {
        description: err instanceof Error ? err.message : "Network issue occurred.",
      })
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, pageSize, debouncedSearch, statusFilter, sourceFilter])

  React.useEffect(() => {
    fetchSubscribers()
  }, [fetchSubscribers])

  // Row Action Handlers
  const handleViewDetails = (sub: SubscriberItem) => {
    setSelectedSubscriber(sub)
    setIsDetailsOpen(true)
  }

  const handleEditOpen = (sub: SubscriberItem) => {
    setSelectedSubscriber(sub)
    setEditForm({
      name: sub.name || "",
      status: (sub.status?.toLowerCase() as "subscribed" | "unsubscribed" | "pending") || "subscribed",
      source: sub.source || "admin_portal",
    })
    setIsEditOpen(true)
  }

  const handleDeletePrompt = (sub: SubscriberItem) => {
    setSelectedSubscriber(sub)
    setIsDeleteOpen(true)
  }

  const handleToggleStatus = async (
    sub: SubscriberItem,
    newStatus: "subscribed" | "unsubscribed" | "pending"
  ) => {
    try {
      const res = await SubscriberApi.update(sub.id, { status: newStatus })
      if (res.success) {
        toast.success(`Subscriber status updated`, {
          description: `${sub.email} is now marked as ${newStatus}.`,
        })
        fetchSubscribers()
      } else {
        toast.error("Status update failed", {
          description: res.error,
        })
      }
    } catch (err: unknown) {
      toast.error("Error updating subscriber", {
        description: err instanceof Error ? err.message : undefined,
      })
    }
  }

  const handleResendEmail = async (sub: SubscriberItem) => {
    try {
      const res = await SubscriberApi.resendWelcome(sub.id)
      if (res.success) {
        toast.success("Welcome email delivered", {
          description: `Confirmation instructions resent to ${sub.email}.`,
        })
      } else {
        toast.error("Failed to resend email", {
          description: res.error,
        })
      }
    } catch (err: unknown) {
      toast.error("Error resending email", {
        description: err instanceof Error ? err.message : undefined,
      })
    }
  }

  // Add Subscriber Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addForm.email || !addForm.email.includes("@")) {
      toast.error("Invalid Email", {
        description: "Please provide a valid email address.",
      })
      return
    }

    try {
      setIsProcessing(true)
      const res = await SubscriberApi.create(addForm)
      if (res.success) {
        toast.success("Subscriber added successfully", {
          description: `${addForm.email} has been added to your audience.`,
        })
        setIsAddOpen(false)
        setAddForm({
          email: "",
          name: "",
          status: "subscribed",
          source: "admin_portal",
          sendWelcomeEmail: true,
        })
        fetchSubscribers()
      } else {
        toast.error("Failed to add subscriber", {
          description: res.error || "Email might already exist.",
        })
      }
    } catch (err: unknown) {
      toast.error("Error creating subscriber", {
        description: err instanceof Error ? err.message : undefined,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Edit Subscriber Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubscriber) return

    try {
      setIsProcessing(true)
      const res = await SubscriberApi.update(selectedSubscriber.id, editForm)
      if (res.success) {
        toast.success("Subscriber updated", {
          description: `Changes for ${selectedSubscriber.email} saved.`,
        })
        setIsEditOpen(false)
        fetchSubscribers()
      } else {
        toast.error("Update failed", {
          description: res.error,
        })
      }
    } catch (err: unknown) {
      toast.error("Error saving changes", {
        description: err instanceof Error ? err.message : undefined,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Delete Single Subscriber Submit
  const handleDeleteConfirm = async () => {
    if (!selectedSubscriber) return

    try {
      setIsProcessing(true)
      const res = await SubscriberApi.delete(selectedSubscriber.id)
      if (res.success) {
        toast.success("Subscriber removed", {
          description: `Successfully deleted ${selectedSubscriber.email}.`,
        })
        setIsDeleteOpen(false)
        fetchSubscribers()
      } else {
        toast.error("Deletion failed", {
          description: res.error,
        })
      }
    } catch (err: unknown) {
      toast.error("Error deleting subscriber", {
        description: err instanceof Error ? err.message : undefined,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Bulk Status Change
  const handleBulkStatusChange = async (
    ids: string[],
    status: "subscribed" | "unsubscribed" | "pending"
  ) => {
    try {
      const res = await SubscriberApi.bulkUpdateStatus({
        subscriberIds: ids,
        status,
      })
      if (res.success) {
        toast.success(`Bulk update successful`, {
          description: `Updated status to '${status}' for ${res.data?.count || ids.length} subscribers.`,
        })
        fetchSubscribers()
      } else {
        toast.error("Bulk update failed", {
          description: res.error,
        })
      }
    } catch (err: unknown) {
      toast.error("Error during bulk update", {
        description: err instanceof Error ? err.message : undefined,
      })
    }
  }

  // Bulk Delete Prompt
  const handleBulkDeletePrompt = (ids: string[]) => {
    setBulkSelectedIds(ids)
    setIsBulkDeleteOpen(true)
  }

  // Bulk Delete Confirm
  const handleBulkDeleteConfirm = async () => {
    try {
      setIsProcessing(true)
      const res = await SubscriberApi.bulkDelete({
        subscriberIds: bulkSelectedIds,
      })
      if (res.success) {
        toast.success("Bulk deletion completed", {
          description: `Removed ${res.data?.count || bulkSelectedIds.length} subscribers from the database.`,
        })
        setIsBulkDeleteOpen(false)
        setBulkSelectedIds([])
        fetchSubscribers()
      } else {
        toast.error("Bulk deletion failed", {
          description: res.error,
        })
      }
    } catch (err: unknown) {
      toast.error("Error deleting subscribers", {
        description: err instanceof Error ? err.message : undefined,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // CSV Export
  const handleExportCSV = async () => {
    try {
      setIsExporting(true)
      toast.info("Preparing CSV export...")
      const res = await SubscriberApi.export({
        search: debouncedSearch || undefined,
        status: statusFilter !== "ALL" ? (statusFilter as "subscribed" | "unsubscribed" | "pending") : undefined,
        source: sourceFilter !== "ALL" ? sourceFilter : undefined,
      })

      if (res.success && res.data) {
        const rows = res.data
        if (rows.length === 0) {
          toast.warning("No subscribers to export.")
          return
        }

        const headers = [
          "ID",
          "Email",
          "Name",
          "Status",
          "Source",
          "Subscribed At",
          "Updated At",
        ]
        const csvContent = [
          headers.join(","),
          ...rows.map((r) =>
            [
              `"${r.id}"`,
              `"${r.email}"`,
              `"${(r.name || "").replace(/"/g, '""')}"`,
              `"${r.status}"`,
              `"${r.source}"`,
              `"${new Date(r.subscribedAt).toISOString()}"`,
              `"${new Date(r.updatedAt).toISOString()}"`,
            ].join(",")
          ),
        ].join("\n")

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        const dateStr = new Date().toISOString().split("T")[0]
        link.setAttribute("href", url)
        link.setAttribute("download", `subscribers_export_${dateStr}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        toast.success("CSV export downloaded successfully", {
          description: `Exported ${rows.length} subscriber records.`,
        })
      } else {
        toast.error("Failed to generate CSV export", { description: res.error })
      }
    } catch (err: unknown) {
      toast.error("Export error", { description: err instanceof Error ? err.message : undefined })
    } finally {
      setIsExporting(false)
    }
  }

  // Memoized Columns with Action Callbacks
  const columns = React.useMemo(() => {
    return getSubscriberColumns({
      onViewDetails: handleViewDetails,
      onEdit: handleEditOpen,
      onDelete: handleDeletePrompt,
      onToggleStatus: handleToggleStatus,
      onResendEmail: handleResendEmail,
    })
  }, [])

  return (
    <div className="space-y-6">
      {/* Page Header Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Subscribers Management
            </h1>
            <Badge
              variant="outline"
              className="border-primary/30 font-mono text-xs text-primary"
            >
              Audience Control
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time subscriber audience directory, Plunk sync metrics, double
            opt-in tracking, and batch controls.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={isExporting || isLoading}
            className="gap-1.5 text-xs"
          >
            <Download className="size-3.5" />
            {isExporting ? "Exporting..." : "Export CSV"}
          </Button>

          <Button
            size="sm"
            onClick={() => setIsAddOpen(true)}
            className="gap-1.5 text-xs shadow-xs"
          >
            <UserPlus className="size-3.5" />
            Add Subscriber
          </Button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Subscribers */}
        <Card className="relative overflow-hidden border-border/80 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Subscribers
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total.toLocaleString()}
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="size-3" />
              <span>+{stats.recentSubscribers7d} this week</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Active & Confirmed */}
        <Card className="border-border/80 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active & Subscribed
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.subscribed.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {stats.confirmationRate}% confirmation rate
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Pending Double Opt-in */}
        <Card className="border-border/80 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Confirmation
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <Clock className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {stats.pending.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Awaiting double opt-in click
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Unsubscribed */}
        <Card className="border-border/80 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unsubscribed
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
              <UserX className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {stats.unsubscribed.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {stats.total > 0
                ? ((stats.unsubscribed / stats.total) * 100).toFixed(1)
                : 0}
              % churn rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-border/80">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Audience Directory
              </CardTitle>
              <CardDescription className="text-xs">
                Search, filter, inspect and manage subscribers synchronized with
                Plunk contacts.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          <SubscribersDataTable
            columns={columns}
            data={subscribers}
            isLoading={isLoading}
            totalCount={totalCount}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            sourceFilter={sourceFilter}
            onSourceFilterChange={setSourceFilter}
            onBulkStatusChange={handleBulkStatusChange}
            onBulkDelete={handleBulkDeletePrompt}
            onAddNew={() => setIsAddOpen(true)}
            onRefresh={fetchSubscribers}
            availableSources={DEFAULT_SOURCES}
          />
        </CardContent>
      </Card>

      {/* ── Dialog: Add Subscriber ────────────────────────────────────────── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleAddSubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <UserPlus className="size-4 text-primary" />
                <span>Add New Subscriber</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Manually register a subscriber into your audience database and
                sync with Plunk.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <div className="space-y-1.5">
                <Label htmlFor="add-email" className="text-xs">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="add-email"
                  type="email"
                  placeholder="subscriber@example.com"
                  value={addForm.email}
                  onChange={(e) =>
                    setAddForm({ ...addForm, email: e.target.value })
                  }
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="add-name" className="text-xs">
                  Full Name (Optional)
                </Label>
                <Input
                  id="add-name"
                  type="text"
                  placeholder="Jane Doe"
                  value={addForm.name || ""}
                  onChange={(e) =>
                    setAddForm({ ...addForm, name: e.target.value })
                  }
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Subscription Status</Label>
                  <Select
                    value={addForm.status}
                    onValueChange={(val) =>
                      setAddForm({ ...addForm, status: val as "subscribed" | "unsubscribed" | "pending" })
                    }
                  >
                    <SelectTrigger className="h-9 w-full text-xs">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="subscribed" className="text-xs">
                        Subscribed (Active)
                      </SelectItem>
                      <SelectItem value="pending" className="text-xs">
                        Pending Confirmation
                      </SelectItem>
                      <SelectItem value="unsubscribed" className="text-xs">
                        Unsubscribed
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Acquisition Channel</Label>
                  <Select
                    value={addForm.source || "admin_portal"}
                    onValueChange={(val) =>
                      setAddForm({ ...addForm, source: val })
                    }
                  >
                    <SelectTrigger className="h-9 w-full text-xs">
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEFAULT_SOURCES.map((src) => (
                        <SelectItem
                          key={src}
                          value={src}
                          className="text-xs capitalize"
                        >
                          {src.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <Checkbox
                  id="send-welcome"
                  checked={addForm.sendWelcomeEmail}
                  onCheckedChange={(checked) =>
                    setAddForm({ ...addForm, sendWelcomeEmail: !!checked })
                  }
                />
                <Label
                  htmlFor="send-welcome"
                  className="cursor-pointer text-xs font-normal text-muted-foreground"
                >
                  Send welcome email with unsubscribe link immediately
                </Label>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddOpen(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isProcessing}>
                {isProcessing ? "Adding..." : "Add Subscriber"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Edit Subscriber ───────────────────────────────────────── */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <UserCheck className="size-4 text-primary" />
                <span>Edit Subscriber Profile</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Update metadata for subscriber{" "}
                <span className="font-semibold text-foreground">
                  {selectedSubscriber?.email}
                </span>
                .
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-name" className="text-xs">
                  Full Name
                </Label>
                <Input
                  id="edit-name"
                  type="text"
                  placeholder="Jane Doe"
                  value={editForm.name || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Status</Label>
                  <Select
                    value={editForm.status || "subscribed"}
                    onValueChange={(val) =>
                      setEditForm({ ...editForm, status: val as "subscribed" | "unsubscribed" | "pending" })
                    }
                  >
                    <SelectTrigger className="h-9 w-full text-xs">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="subscribed" className="text-xs">
                        Subscribed
                      </SelectItem>
                      <SelectItem value="pending" className="text-xs">
                        Pending
                      </SelectItem>
                      <SelectItem value="unsubscribed" className="text-xs">
                        Unsubscribed
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Source</Label>
                  <Select
                    value={editForm.source || "admin_portal"}
                    onValueChange={(val) =>
                      setEditForm({ ...editForm, source: val })
                    }
                  >
                    <SelectTrigger className="h-9 w-full text-xs">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEFAULT_SOURCES.map((src) => (
                        <SelectItem
                          key={src}
                          value={src}
                          className="text-xs capitalize"
                        >
                          {src.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditOpen(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isProcessing}>
                {isProcessing ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Subscriber Details & Audit ────────────────────────────── */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Mail className="size-4 text-primary" />
              <span>Subscriber Overview & Audit</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Complete subscriber profile and audit timeline records.
            </DialogDescription>
          </DialogHeader>

          {selectedSubscriber && (
            <div className="space-y-4 py-2 text-xs">
              {/* Profile Card */}
              <div className="space-y-3 rounded-xl border border-border/80 bg-muted/40 p-4">
                <div className="flex items-center justify-between">
                  <div className="grid">
                    <span className="text-sm font-semibold text-foreground">
                      {selectedSubscriber.name || "Anonymous Subscriber"}
                    </span>
                    <span className="mt-0.5 font-mono text-muted-foreground">
                      {selectedSubscriber.email}
                    </span>
                  </div>
                  <Badge
                    variant={
                      selectedSubscriber.status === "subscribed"
                        ? "default"
                        : selectedSubscriber.status === "pending"
                          ? "secondary"
                          : "outline"
                    }
                    className="font-mono text-[10px] capitalize"
                  >
                    {selectedSubscriber.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-border/60 pt-2 text-muted-foreground">
                  <div>
                    <span className="text-[10px] font-semibold text-foreground/70 uppercase">
                      Subscriber ID
                    </span>
                    <p className="truncate font-mono text-[11px]">
                      {selectedSubscriber.id}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-foreground/70 uppercase">
                      Acquisition Channel
                    </span>
                    <p className="capitalize">
                      {selectedSubscriber.source.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-foreground/70 uppercase">
                      Subscribed On
                    </span>
                    <p>
                      {new Date(
                        selectedSubscriber.subscribedAt
                      ).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-foreground/70 uppercase">
                      Last Updated
                    </span>
                    <p>
                      {new Date(selectedSubscriber.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sync Integration Status */}
              <div className="space-y-1.5 rounded-xl border border-border/80 p-3">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <Sparkles className="size-3.5 text-primary" />
                  <span>Plunk Contacts Sync</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  State is synchronized bidirectionally with Plunk Contacts API.
                  Unsubscribe tokens are cryptographically signed using
                  HMAC-SHA256.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDetailsOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Single Delete Confirmation ───────────────────────────── */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base text-destructive">
              <Trash2 className="size-4" />
              <span>Confirm Subscriber Deletion</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete subscriber{" "}
              <span className="font-semibold text-foreground">
                {selectedSubscriber?.email}
              </span>
              ? This will remove them from the audience and sync unsubscribe
              with Plunk.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 pt-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? "Deleting..." : "Permanently Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Bulk Delete Confirmation ─────────────────────────────── */}
      <Dialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base text-destructive">
              <Trash2 className="size-4" />
              <span>Bulk Delete {bulkSelectedIds.length} Subscribers</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-foreground">
                {bulkSelectedIds.length} selected subscribers
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 pt-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsBulkDeleteOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleBulkDeleteConfirm}
              disabled={isProcessing}
            >
              {isProcessing
                ? "Deleting..."
                : `Delete ${bulkSelectedIds.length} Records`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
