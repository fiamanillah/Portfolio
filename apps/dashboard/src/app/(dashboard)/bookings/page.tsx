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
  Globe,
  RotateCcw,
  Sliders,
  CalendarDays,
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

const TIMEZONE_OPTIONS = [
  { label: "UTC (Coordinated Universal Time)", value: "UTC" },
  { label: "America/New_York (Eastern Time)", value: "America/New_York" },
  { label: "America/Chicago (Central Time)", value: "America/Chicago" },
  { label: "America/Denver (Mountain Time)", value: "America/Denver" },
  { label: "America/Los_Angeles (Pacific Time)", value: "America/Los_Angeles" },
  { label: "Europe/London (GMT/BST)", value: "Europe/London" },
  { label: "Europe/Paris (CET/CEST)", value: "Europe/Paris" },
  { label: "Europe/Berlin (CET/CEST)", value: "Europe/Berlin" },
  { label: "Asia/Dubai (GST)", value: "Asia/Dubai" },
  { label: "Asia/Dhaka (BST)", value: "Asia/Dhaka" },
  { label: "Asia/Kolkata (IST)", value: "Asia/Kolkata" },
  { label: "Asia/Bangkok (ICT)", value: "Asia/Bangkok" },
  { label: "Asia/Singapore (SGT)", value: "Asia/Singapore" },
  { label: "Asia/Tokyo (JST)", value: "Asia/Tokyo" },
  { label: "Australia/Sydney (AEST/AEDT)", value: "Australia/Sydney" },
]

const DEFAULT_START_TIME = "09:00"
const DEFAULT_END_TIME = "17:00"

function buildFullSchedule(existing?: BookingAvailability[]): AvailabilityDayInput[] {
  const map = new Map<number, BookingAvailability>()
  if (existing && Array.isArray(existing)) {
    existing.forEach((item) => map.set(item.dayOfWeek, item))
  }

  const defaultDuration = existing?.find((e) => e.slotDuration)?.slotDuration || 30
  const defaultBuffer = existing?.find((e) => e.bufferTime !== undefined)?.bufferTime ?? 15
  const defaultTz = existing?.find((e) => e.timezone)?.timezone || "UTC"

  return Array.from({ length: 7 }, (_, day) => {
    const found = map.get(day)
    if (found) {
      return {
        dayOfWeek: found.dayOfWeek,
        startTime: found.startTime || DEFAULT_START_TIME,
        endTime: found.endTime || DEFAULT_END_TIME,
        isActive: Boolean(found.isActive),
        slotDuration: found.slotDuration || defaultDuration,
        bufferTime: found.bufferTime ?? defaultBuffer,
        timezone: found.timezone || defaultTz,
      }
    }
    const isWeekday = day >= 1 && day <= 5
    return {
      dayOfWeek: day,
      startTime: DEFAULT_START_TIME,
      endTime: DEFAULT_END_TIME,
      isActive: isWeekday,
      slotDuration: defaultDuration,
      bufferTime: defaultBuffer,
      timezone: defaultTz,
    }
  })
}

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

  // Editable availability schedule (always guaranteed 7 days)
  const [editableSchedule, setEditableSchedule] = React.useState<AvailabilityDayInput[]>(() =>
    buildFullSchedule()
  )

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
          status: statusFilter !== "ALL" ? (statusFilter as "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED") : undefined,
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
        setEditableSchedule(buildFullSchedule(availRes.data))
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load bookings data")
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, searchQuery, statusFilter])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const applyPreset24_7 = () => {
    setEditableSchedule((prev) =>
      prev.map((day) => ({
        ...day,
        isActive: true,
        startTime: "00:00",
        endTime: "23:59",
      }))
    )
    toast.success("Applied 24/7 Availability (All 7 Days, 00:00 - 23:59)")
  }

  const applyPresetStandardWeekdays = () => {
    setEditableSchedule((prev) =>
      prev.map((day) => ({
        ...day,
        isActive: day.dayOfWeek >= 1 && day.dayOfWeek <= 5,
        startTime: "09:00",
        endTime: "17:00",
      }))
    )
    toast.success("Applied Standard Weekdays preset (Mon-Fri 09:00 - 17:00)")
  }

  const applyPresetExtendedWeekdays = () => {
    setEditableSchedule((prev) =>
      prev.map((day) => ({
        ...day,
        isActive: day.dayOfWeek >= 1 && day.dayOfWeek <= 5,
        startTime: "08:00",
        endTime: "19:00",
      }))
    )
    toast.success("Applied Extended Weekdays preset (Mon-Fri 08:00 - 19:00)")
  }

  const applyPresetAllDays = () => {
    setEditableSchedule((prev) =>
      prev.map((day) => ({
        ...day,
        isActive: true,
        startTime: "09:00",
        endTime: "17:00",
      }))
    )
    toast.success("Applied All 7 Days preset (09:00 - 17:00)")
  }

  const applyPresetCopyMonday = () => {
    const monday = editableSchedule.find((d) => d.dayOfWeek === 1)
    if (!monday) return
    setEditableSchedule((prev) =>
      prev.map((day) =>
        day.dayOfWeek >= 1 && day.dayOfWeek <= 5
          ? { ...day, startTime: monday.startTime, endTime: monday.endTime }
          : day
      )
    )
    toast.success(`Copied Monday's hours (${monday.startTime} - ${monday.endTime}) to all weekdays!`)
  }

  const setDay24Hours = (dayOfWeek: number) => {
    setEditableSchedule((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayOfWeek
          ? { ...day, isActive: true, startTime: "00:00", endTime: "23:59" }
          : day
      )
    )
  }

  const setDayStandardHours = (dayOfWeek: number) => {
    setEditableSchedule((prev) =>
      prev.map((day) =>
        day.dayOfWeek === dayOfWeek
          ? { ...day, isActive: true, startTime: "09:00", endTime: "17:00" }
          : day
      )
    )
  }

  const toggleAllDays = (active: boolean) => {
    setEditableSchedule((prev) => prev.map((day) => ({ ...day, isActive: active })))
  }

  const detectUserTimezone = () => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (detected) {
        setEditableSchedule((prev) => prev.map((day) => ({ ...day, timezone: detected })))
        toast.success(`Set timezone to ${detected}`)
      }
    } catch {
      toast.error("Could not detect local browser timezone")
    }
  }

  const is24_7AllWeek = React.useMemo(() => {
    return (
      editableSchedule.length === 7 &&
      editableSchedule.every(
        (day) =>
          day.isActive &&
          (day.startTime === "00:00" || day.startTime === "0:00") &&
          (day.endTime === "23:59" || day.endTime === "23:30")
      )
    )
  }, [editableSchedule])

  const handleConnectGoogle = async () => {
    try {
      setIsProcessing(true)
      const res = await bookingApi.getGoogleAuthUrl()
      if (res.success && res.data?.url) {
        window.location.href = res.data.url
      } else {
        toast.error(res.message || "Failed to generate Google OAuth URL.")
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error starting Google connection")
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
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error disconnecting Google Calendar")
    } finally {
      setIsProcessing(false)
    }
  }

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
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error cancelling meeting")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSaveAvailability = async () => {
    try {
      const scheduleToSave = editableSchedule.length > 0 ? editableSchedule : buildFullSchedule(availability)
      if (scheduleToSave.length === 0) {
        toast.error("Please configure at least one day in the schedule.")
        return
      }

      for (const day of scheduleToSave) {
        if (day.isActive && (!day.startTime || !day.endTime)) {
          toast.error(`Please provide valid start and end times for ${DAY_NAMES[day.dayOfWeek]}`)
          return
        }
      }

      setIsProcessing(true)
      const res = await bookingApi.updateAvailability(scheduleToSave)
      if (res.success && res.data) {
        toast.success("Weekly availability schedule saved.")
        setAvailability(res.data)
        setEditableSchedule(buildFullSchedule(res.data))
        setIsAvailabilityOpen(false)
        fetchData()
      } else {
        toast.error(res.message || "Failed to update availability")
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error saving availability")
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

  const activeDaysList = editableSchedule.filter((d) => d.isActive)
  const currentTz = editableSchedule[0]?.timezone || "UTC"
  const currentSlotDuration = editableSchedule[0]?.slotDuration || 30
  const currentBuffer = editableSchedule[0]?.bufferTime ?? 15

  const isSchedule24_7 =
    activeDaysList.length === 7 &&
    activeDaysList.every((d) => (d.startTime === "00:00" || d.startTime === "0:00") && (d.endTime === "23:59" || d.endTime === "23:30"))

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Video className="size-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold">Google Calendar & Meet</h3>
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
                <p className="text-xs text-muted-foreground mt-0.5">
                  {googleStatus.connected
                    ? `Syncing busy blocks & Meet links for ${googleStatus.email}`
                    : "Connect your Google account to enable live busy calendar checking & Meet invites."}
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
                  className="gap-2 text-destructive hover:bg-destructive/10 text-xs"
                >
                  <Unlink className="size-3.5" />
                  Disconnect
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleConnectGoogle}
                  disabled={isProcessing}
                  className="gap-2 text-xs"
                >
                  <Link2 className="size-3.5" />
                  Connect
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-foreground">
                <CalendarDays className="size-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold">Consultation Working Hours</h3>
                  {isSchedule24_7 ? (
                    <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/15 text-emerald-500 text-[11px] font-semibold gap-1">
                      <Sparkles className="size-3" />
                      24/7 Available
                    </Badge>
                  ) : availability.length > 0 ? (
                    <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-[11px]">
                      Configured
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-500 text-[11px]">
                      Default Template
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isSchedule24_7
                    ? `Open 24 hours / 7 days a week • ${currentSlotDuration}m slots • ${currentTz}`
                    : activeDaysList.length > 0
                    ? `${activeDaysList.length} days active (${activeDaysList.map((d) => DAY_NAMES[d.dayOfWeek].slice(0, 3)).join(", ")}) • ${currentSlotDuration}m slots • ${currentTz}`
                    : "No active days open for bookings. Click configure to enable slots."}
                </p>
              </div>
            </div>
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAvailabilityOpen(true)}
                className="gap-2 text-xs"
              >
                <Sliders className="size-3.5" />
                Manage Hours
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by guest name, email, or topic..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="RESCHEDULED">Rescheduled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg">Consultations & Meetings</CardTitle>
          <CardDescription>
            Showing {bookings.length} of {totalCount} total meeting records
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Attendee</TableHead>
                <TableHead>Type & Topic</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Meeting Link</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    <RefreshCw className="mx-auto mb-2 size-6 animate-spin" />
                    Loading meetings data...
                  </TableCell>
                </TableRow>
              ) : bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No bookings found matching your search or filters.
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <div className="font-medium">{b.guestName}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="size-3" />
                        {b.guestEmail}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-xs">{b.meetingType}</div>
                      {b.guestNotes ? (
                        <p className="max-w-[200px] truncate text-xs text-muted-foreground" title={b.guestNotes}>
                          {b.guestNotes}
                        </p>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No notes</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-medium">{formatDateTime(b.startTime)}</div>
                      <div className="text-xs text-muted-foreground">{b.timezone || "UTC"}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {b.durationMinutes} min
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {b.googleMeetLink ? (
                        <div className="flex items-center gap-1.5">
                          <a
                            href={b.googleMeetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <Video className="size-3.5 text-blue-500" />
                            Join Meet
                            <ExternalLink className="size-2.5" />
                          </a>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 text-muted-foreground"
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

      <Dialog open={isAvailabilityOpen} onOpenChange={setIsAvailabilityOpen}>
        <DialogContent className="sm:max-w-4xl lg:max-w-5xl min-w-[340px] sm:min-w-[680px] md:min-w-[800px] lg:min-w-[940px] max-h-[92vh] overflow-y-auto w-full">
          <DialogHeader>
            <div className="flex flex-wrap items-center justify-between gap-2 pr-6">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <CalendarDays className="size-5 text-primary" />
                Weekly Availability & Meeting Rules
              </DialogTitle>
              {is24_7AllWeek && (
                <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 text-xs font-semibold gap-1">
                  <Sparkles className="size-3" />
                  24/7 Mode Active
                </Badge>
              )}
            </div>
            <DialogDescription>
              Configure open days, 24/7 round-the-clock availability, meeting durations, and buffer periods.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="rounded-xl border bg-card/60 p-4 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                    <Sparkles className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold flex items-center gap-1.5">
                      24/7 Round-the-Clock Booking Mode
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Enable all 7 days open 24 hours (00:00 to 23:59) for continuous bookings worldwide.
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant={is24_7AllWeek ? "default" : "outline"}
                  size="sm"
                  className={
                    is24_7AllWeek
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs h-8 shrink-0"
                      : "border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400 gap-1.5 text-xs h-8 shrink-0"
                  }
                  onClick={applyPreset24_7}
                >
                  <Sparkles className="size-3.5" />
                  {is24_7AllWeek ? "24/7 Mode Enabled" : "Set 24/7 (All 7 Days)"}
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1">
                <span className="text-xs font-medium text-muted-foreground shrink-0">
                  Other Presets:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs px-2.5"
                    onClick={applyPresetStandardWeekdays}
                  >
                    Mon–Fri (09:00 - 17:00)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs px-2.5"
                    onClick={applyPresetExtendedWeekdays}
                  >
                    Mon–Fri (08:00 - 19:00)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs px-2.5"
                    onClick={applyPresetAllDays}
                  >
                    All 7 Days (09:00 - 17:00)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs px-2.5"
                    onClick={applyPresetCopyMonday}
                  >
                    Copy Mon to Weekdays
                  </Button>
                  <span className="text-muted-foreground mx-1 text-xs">|</span>
                  <button
                    type="button"
                    onClick={() => toggleAllDays(true)}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Enable All
                  </button>
                  <span className="text-xs text-muted-foreground">•</span>
                  <button
                    type="button"
                    onClick={() => toggleAllDays(false)}
                    className="text-xs text-muted-foreground hover:underline font-medium"
                  >
                    Disable All
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Daily Working Hours Schedule (Sunday – Saturday)
                </Label>
                <span className="text-xs text-muted-foreground">
                  {activeDaysList.length} of 7 days active
                </span>
              </div>

              <div className="divide-y divide-border rounded-xl border border-border bg-card">
                {editableSchedule.map((day) => {
                  const isDay24h =
                    day.isActive &&
                    (day.startTime === "00:00" || day.startTime === "0:00") &&
                    (day.endTime === "23:59" || day.endTime === "23:30")

                  return (
                    <div
                      key={day.dayOfWeek}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 gap-3 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <Switch
                          checked={day.isActive}
                          onCheckedChange={(checked) => {
                            setEditableSchedule((prev) =>
                              prev.map((d) =>
                                d.dayOfWeek === day.dayOfWeek ? { ...d, isActive: checked } : d
                              )
                            )
                          }}
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold w-24">
                            {DAY_NAMES[day.dayOfWeek]}
                          </span>
                          {day.isActive ? (
                            isDay24h ? (
                              <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] h-5 gap-1">
                                <Sparkles className="size-2.5" />
                                24 Hours
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] h-5">
                                Active
                              </Badge>
                            )
                          ) : (
                            <Badge variant="outline" className="border-muted bg-muted/60 text-muted-foreground text-[10px] h-5">
                              Closed
                            </Badge>
                          )}
                        </div>
                      </div>

                      {day.isActive ? (
                        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                          <div className="flex items-center gap-1 mr-1">
                            <Button
                              type="button"
                              variant={isDay24h ? "secondary" : "ghost"}
                              size="sm"
                              className="h-7 text-[11px] px-2 text-muted-foreground hover:text-foreground"
                              onClick={() => setDay24Hours(day.dayOfWeek)}
                              title="Set 24 hours (00:00 - 23:59)"
                            >
                              24h All-Day
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 text-[11px] px-2 text-muted-foreground hover:text-foreground"
                              onClick={() => setDayStandardHours(day.dayOfWeek)}
                              title="Set 09:00 - 17:00"
                            >
                              9am–5pm
                            </Button>
                          </div>

                          <div className="flex items-center gap-2">
                            <Input
                              type="time"
                              value={day.startTime}
                              onChange={(e) => {
                                const val = e.target.value
                                setEditableSchedule((prev) =>
                                  prev.map((d) =>
                                    d.dayOfWeek === day.dayOfWeek ? { ...d, startTime: val } : d
                                  )
                                )
                              }}
                              className="w-28 text-xs font-mono h-8"
                            />
                            <span className="text-xs text-muted-foreground">to</span>
                            <Input
                              type="time"
                              value={day.endTime}
                              onChange={(e) => {
                                const val = e.target.value
                                setEditableSchedule((prev) =>
                                  prev.map((d) =>
                                    d.dayOfWeek === day.dayOfWeek ? { ...d, endTime: val } : d
                                  )
                                )
                              }}
                              className="w-28 text-xs font-mono h-8"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 sm:justify-end">
                          <span className="text-xs text-muted-foreground italic mr-2">
                            Unavailable / Closed for bookings
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[11px] px-2 text-primary"
                            onClick={() => setDay24Hours(day.dayOfWeek)}
                          >
                            Open 24h
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[11px] px-2 text-primary"
                            onClick={() => setDayStandardHours(day.dayOfWeek)}
                          >
                            Open 9-5
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1.5 md:col-span-1 rounded-xl border bg-card p-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <Globe className="size-3.5 text-blue-500" />
                    Timezone
                  </Label>
                  <button
                    type="button"
                    onClick={detectUserTimezone}
                    className="text-[11px] text-primary hover:underline flex items-center gap-1"
                    title="Auto-detect browser timezone"
                  >
                    <RotateCcw className="size-2.5" />
                    Auto-Detect
                  </button>
                </div>
                <Select
                  value={currentTz}
                  onValueChange={(val) => {
                    setEditableSchedule((prev) => prev.map((d) => ({ ...d, timezone: val })))
                  }}
                >
                  <SelectTrigger className="w-full text-xs h-8">
                    <SelectValue placeholder="Select Timezone" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {TIMEZONE_OPTIONS.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value} className="text-xs">
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  Candidate slots are computed based on this reference timezone.
                </p>
              </div>

              <div className="space-y-1.5 rounded-xl border bg-card p-3">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Clock className="size-3.5 text-primary" />
                  Slot Duration
                </Label>
                <Select
                  value={String(currentSlotDuration)}
                  onValueChange={(val) => {
                    const dur = parseInt(val, 10) || 30
                    setEditableSchedule((prev) =>
                      prev.map((d) => ({ ...d, slotDuration: dur }))
                    )
                  }}
                >
                  <SelectTrigger className="text-xs h-8">
                    <SelectValue placeholder="Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 Minutes</SelectItem>
                    <SelectItem value="30">30 Minutes (Standard)</SelectItem>
                    <SelectItem value="45">45 Minutes</SelectItem>
                    <SelectItem value="60">60 Minutes (1 Hour)</SelectItem>
                    <SelectItem value="90">90 Minutes</SelectItem>
                    <SelectItem value="120">120 Minutes (2 Hours)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  Length of each individual consultation meeting.
                </p>
              </div>

              <div className="space-y-1.5 rounded-xl border bg-card p-3">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Sliders className="size-3.5 text-muted-foreground" />
                  Buffer Between Meetings
                </Label>
                <Select
                  value={String(currentBuffer)}
                  onValueChange={(val) => {
                    const buf = parseInt(val, 10) || 0
                    setEditableSchedule((prev) =>
                      prev.map((d) => ({ ...d, bufferTime: buf }))
                    )
                  }}
                >
                  <SelectTrigger className="text-xs h-8">
                    <SelectValue placeholder="Buffer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 Minutes (Back-to-back)</SelectItem>
                    <SelectItem value="5">5 Minutes</SelectItem>
                    <SelectItem value="10">10 Minutes</SelectItem>
                    <SelectItem value="15">15 Minutes (Recommended)</SelectItem>
                    <SelectItem value="20">20 Minutes</SelectItem>
                    <SelectItem value="30">30 Minutes</SelectItem>
                    <SelectItem value="45">45 Minutes</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  Cooldown buffer between consecutive bookings.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t mt-2">
            <Button variant="outline" onClick={() => setIsAvailabilityOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAvailability} disabled={isProcessing} className="gap-1.5">
              {isProcessing && <RefreshCw className="size-3.5 animate-spin" />}
              Save Availability Rules
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
