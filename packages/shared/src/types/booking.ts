// packages/shared/src/types/booking.ts

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "RESCHEDULED"
  | "COMPLETED"

export interface Booking {
  id: string
  guestName: string
  guestEmail: string
  guestNotes?: string | null
  meetingType: string
  startTime: string | Date
  endTime: string | Date
  durationMinutes: number
  timezone: string
  status: BookingStatus
  googleEventId?: string | null
  googleMeetLink?: string | null
  cancellationToken: string
  createdAt: string | Date
  updatedAt: string | Date
}

export interface BookingAvailability {
  id: string
  dayOfWeek: number // 0 (Sunday) to 6 (Saturday)
  startTime: string // "09:00"
  endTime: string // "17:00"
  isActive: boolean
  slotDuration: number // e.g. 30
  bufferTime: number // e.g. 15
  timezone: string
  createdAt: string | Date
  updatedAt: string | Date
}

export interface TimeSlot {
  startTime: string // ISO string
  endTime: string // ISO string
  available: boolean
  label?: string // e.g. "10:00 AM - 10:30 AM"
}

export interface GoogleCalendarStatus {
  connected: boolean
  email?: string | null
  calendarId?: string | null
  updatedAt?: string | Date | null
}

export interface BookingStats {
  total: number
  upcoming: number
  completed: number
  cancelled: number
}
