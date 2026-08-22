"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import {
  CalendarCheck,
  Calendar as CalendarIcon,
  Clock,
  Video,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Settings,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  CalendarX,
  AlertTriangle,
  Mail,
  User,
  Sparkles,
  Link2,
  Unlink,
} from "lucide-react"

import type {
  Booking,
  BookingAvailability,
  GoogleCalendarStatus,
  BookingStats,
  AvailabilityDayInput,
} from "@workspace/shared"
import { bookingApi } from "@/lib/api"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { toast } from "@workspace/ui/components/sonner"

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]

export default function BookingsPage() {
  const searchParams = useSearchParams()

  // State
  const [bookings, setBookings] = React.useState<Booking[]>([])
  const [stats, setStats] = React.useState<BookingStats>({
    total: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0,
  })
  const [googleStatus, setGoogleStatus] = React.useState<GoogleCalendarStatus>({
    connected: false,
  })
  const [availability, setAvailability] = React.useState<BookingAvailability[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("ALL")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalCount, setTotalCount] = React.useState(0)

  // Dialog States
  const [isAvailabilityOpen, setIsAvailabilityOpen] = React.useState(false)
  const [isCancelOpen, setIsCancelOpen] = React.useState(false)
  const [selectedBooking, setSelectedBooking] = React.useState<Booking | null>(null)
  const [cancelReason, setCancelReason] = React.useState("")
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  // Editable availability schedule
  const [editableSchedule, setEditableSchedule] = React.useState<AvailabilityDayInput[]>([])

  // Handle Google OAuth callback feedback
  React.useEffect(() => {
    const syncResult = searchParams.get("google_sync")
    if (syncResult === "success") {
      toast.success("Google Calendar connected successfully!")
    } else if (syncResult === "error") {
      toast.error("Failed to connect Google Calendar. Please check your credentials.")
    }
  }, [searchParams])

  // Fetch all initial data
  const fetchData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const [bookingsRes, statsRes, googleRes, availRes] = await Promise.all([
        bookingApi.getBookings({
          page: currentPage,
          limit: 10,
          search: searchQuery || undefined,
          status: statusFilter !== "ALL" ? (statusFilter as any) : undefined,
        }),
        bookingApi.getStats(),
        bookingApi.getGoogleStatus(),
        bookingApi.getAvailability(),
      ])

      if (bookingsRes.success && bookingsRes.data) {
        setBookings(bookingsRes.data)
        if (bookingsRes.pagination) {
          setTotalPages(bookingsRes.pagination.totalPages || 1)
          setTotalCount(bookingsRes.pagination.total || 0)
        }
      }

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data)
      }

      if (googleRes.success && googleRes.data) {
        setGoogleStatus(googleRes.data)
      }

      if (availRes.success && availRes.data) {
        setAvailability(availRes.data)
        // Initialize editable schedule
        const sorted = [...availRes.data].sort((a, b) => a.dayOfWeek - b.dayOfWeek)
        setEditableSchedule(
          sorted.map((item) => ({
            dayOfWeek: item.dayOfWeek,
            startTime: item.startTime,
            endTime: item.endTime,
            isActive: item.isActive,
            slotDuration: item.slotDuration || 30,
            bufferTime: item.bufferTime ?? 15,
            timezone: item.timezone || "UTC",
          }))
        )
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to load bookings data")
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, searchQuery, statusFilter])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  // Google Calendar OAuth flow
  const handleConnectGoogle = async () => {
    try {
      setIsProcessing(true)
      const res = await bookingApi.getGoogleAuthUrl()
      if (res.success && res.data?.url) {
        window.location.href = res.data.url
      } else {
        toast.error(res.message || "Failed to generate Google OAuth URL.")
      }
    } catch (err: any) {
      toast.error(err?.message || "Error starting Google connection")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDisconnectGoogle = async () => {
    if (!confirm("Are you sure you want to disconnect your Google Calendar?")) return
    try {
      setIsProcessing(true)
      const res = await bookingApi.disconnectGoogle()
      if (res.success) {
        toast.success("Google Calendar disconnected.")
        setGoogleStatus({ connected: false })
      } else {
        toast.error(res.message || "Failed to disconnect.")
      }
    } catch (err: any) {
      toast.error(err?.message || "Error disconnecting Google Calendar")
    } finally {
      setIsProcessing(false)
    }
  }

  // Cancel Booking
  const handleConfirmCancel = async () => {
    if (!selectedBooking) return
    try {
      setIsProcessing(true)
      const res = await bookingApi.cancelBooking(selectedBooking.id, cancelReason)
      if (res.success) {
        toast.success("Meeting cancelled and Google Calendar event updated.")
        setIsCancelOpen(false)
        setSelectedBooking(null)
        setCancelReason("")
        fetchData()
      } else {
        toast.error(res.message || "Failed to cancel meeting")
      }
    } catch (err: any) {
      toast.error(err?.message || "Error cancelling meeting")
    } finally {
      setIsProcessing(false)
    }
  }

  // Save Availability Schedule
  const handleSaveAvailability = async () => {
    try {
      setIsProcessing(true)
      const res = await bookingApi.updateAvailability(editableSchedule)
      if (res.success) {
        toast.success("Weekly availability schedule saved.")
        setIsAvailabilityOpen(false)
        fetchData()
      } else {
        toast.error(res.message || "Failed to update availability")
      }
    } catch (err: any) {
      toast.error(err?.message || "Error saving availability")
    } finally {
      setIsProcessing(false)
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success("Link copied to clipboard!")
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatDateTime = (dateStr: string | Date) => {
    const d = new Date(dateStr)
    return d.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meeting Bookings</h1>
          <p className="text-muted-foreground">
            Manage consultations, real-time Google Calendar availability, and client meetings.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAvailabilityOpen(true)}
            className="gap-2"
          >
            <Settings className="size-4" />
            Working Hours & Rules
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Meetings</CardTitle>
            <CalendarCheck className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcoming}</div>
            <p className="text-xs text-muted-foreground">Scheduled in the future</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <CalendarIcon className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All-time appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Past sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Google Calendar</CardTitle>
            {googleStatus.connected ? (
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
              </span>
            ) : (
              <AlertTriangle className="size-4 text-amber-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">
                {googleStatus.connected ? "Active Sync" : "Not Connected"}
              </span>
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {googleStatus.connected ? googleStatus.email : "Click connect below"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Google Calendar Sync Card ───────────────────────────── */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Video className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold">Google Calendar & Meet Integration</h3>
                {googleStatus.connected ? (
                  <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500">
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-500">
                    Offline
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {googleStatus.connected
                  ? `Syncing busy blocks & generating Google Meet video links for account ${googleStatus.email}`
                  : "Connect your Google account to enable live free/busy availability and automatic Google Meet creation."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {googleStatus.connected ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnectGoogle}
                disabled={isProcessing}
                className="gap-2 text-destructive hover:bg-destructive/10"
              >
                <Unlink className="size-4" />
                Disconnect
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleConnectGoogle}
                disabled={isProcessing}
                className="gap-2"
              >
                <Link2 className="size-4" />
                Connect Google Calendar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Search & Filter Controls ────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by guest name, email, or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Bookings Table ──────────────────────────────────────── */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead>Meeting Type / Agenda</TableHead>
                <TableHead>Scheduled Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Video Call (Google Meet)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    <RefreshCw className="mx-auto size-6 animate-spin" />
                    <p className="mt-2 text-sm">Loading bookings...</p>
                  </TableCell>
                </TableRow>
              ) : bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    <CalendarX className="mx-auto size-8 opacity-40" />
                    <p className="mt-2 text-sm font-medium">No bookings found</p>
                    <p className="text-xs text-muted-foreground">
                      Bookings made by visitors on your portfolio will appear here.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{b.guestName}</span>
                        <span className="text-xs text-muted-foreground">{b.guestEmail}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col max-w-[220px]">
                        <span className="truncate text-sm font-medium">{b.meetingType}</span>
                        {b.guestNotes && (
                          <span className="truncate text-xs text-muted-foreground" title={b.guestNotes}>
                            {b.guestNotes}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Clock className="size-3.5 text-muted-foreground" />
                        <span>{formatDateTime(b.startTime)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-mono">{b.durationMinutes} mins</span>
                    </TableCell>
                    <TableCell>
                      {b.googleMeetLink ? (
                        <div className="flex items-center gap-1.5">
                          <a
                            href={b.googleMeetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                          >
                            <Video className="size-3.5" />
                            Join Meet
                            <ExternalLink className="size-3" />
                          </a>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6"
                            onClick={() => copyToClipboard(b.googleMeetLink!, b.id)}
                            title="Copy Meet Link"
                          >
                            {copiedId === b.id ? (
                              <Check className="size-3 text-emerald-500" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No link</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          b.status === "CONFIRMED"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                            : b.status === "CANCELLED"
                            ? "border-destructive/30 bg-destructive/10 text-destructive"
                            : "border-muted-foreground/30 text-muted-foreground"
                        }
                      >
                        {b.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {b.status === "CONFIRMED" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => {
                            setSelectedBooking(b)
                            setIsCancelOpen(true)
                          }}
                        >
                          <Trash2 className="mr-1 size-3.5" />
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── Weekly Working Hours & Availability Dialog ──────────── */}
      <Dialog open={isAvailabilityOpen} onOpenChange={setIsAvailabilityOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Weekly Availability & Meeting Rules</DialogTitle>
            <DialogDescription>
              Configure the days and time windows you are open for consultation bookings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="divide-y divide-border rounded-lg border border-border">
              {editableSchedule.map((day, idx) => (
                <div key={day.dayOfWeek} className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={day.isActive}
                      onCheckedChange={(checked) => {
                        const copy = [...editableSchedule]
                        copy[idx].isActive = checked
                        setEditableSchedule(copy)
                      }}
                    />
                    <span className="w-24 text-sm font-medium">
                      {DAY_NAMES[day.dayOfWeek]}
                    </span>
                  </div>

                  {day.isActive ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={day.startTime}
                        onChange={(e) => {
                          const copy = [...editableSchedule]
                          copy[idx].startTime = e.target.value
                          setEditableSchedule(copy)
                        }}
                        className="w-28 text-xs font-mono"
                      />
                      <span className="text-xs text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={day.endTime}
                        onChange={(e) => {
                          const copy = [...editableSchedule]
                          copy[idx].endTime = e.target.value
                          setEditableSchedule(copy)
                        }}
                        className="w-28 text-xs font-mono"
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Unavailable</span>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Default Slot Duration</Label>
                <Select
                  value={String(editableSchedule[0]?.slotDuration || 30)}
                  onValueChange={(val) => {
                    const dur = parseInt(val)
                    setEditableSchedule((prev) =>
                      prev.map((d) => ({ ...d, slotDuration: dur }))
                    )
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 Minutes</SelectItem>
                    <SelectItem value="30">30 Minutes</SelectItem>
                    <SelectItem value="45">45 Minutes</SelectItem>
                    <SelectItem value="60">60 Minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Buffer Between Meetings</Label>
                <Select
                  value={String(editableSchedule[0]?.bufferTime ?? 15)}
                  onValueChange={(val) => {
                    const buf = parseInt(val)
                    setEditableSchedule((prev) =>
                      prev.map((d) => ({ ...d, bufferTime: buf }))
                    )
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Buffer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 Minutes (Back-to-back)</SelectItem>
                    <SelectItem value="10">10 Minutes</SelectItem>
                    <SelectItem value="15">15 Minutes</SelectItem>
                    <SelectItem value="30">30 Minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAvailabilityOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAvailability} disabled={isProcessing}>
              Save Availability Rules
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Cancel Booking Dialog ────────────────────────────────── */}
      <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel the meeting with{" "}
              <strong>{selectedBooking?.guestName}</strong> on{" "}
              {selectedBooking && formatDateTime(selectedBooking.startTime)}?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label className="text-xs">Reason for cancellation (optional)</Label>
            <Input
              placeholder="e.g., Scheduling conflict, personal emergency..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Cancelling will update the Google Calendar event and release this slot for other visitors.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelOpen(false)}>
              Keep Meeting
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
              disabled={isProcessing}
            >
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
