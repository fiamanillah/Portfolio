// apps/dashboard/src/lib/api/booking.api.ts
import { request, ApiResponse } from "./client"
import {
  Booking,
  BookingAvailability,
  TimeSlot,
  GoogleCalendarStatus,
  BookingStats,
  CreateBookingInput,
  AdminQueryBookingsInput,
  AvailabilityDayInput,
} from "@workspace/shared"

export const bookingApi = {
  /**
   * Public: Query available slots for a date
   */
  async getAvailableSlots(
    date: string,
    timezone: string = "UTC",
    duration: number = 30
  ): Promise<ApiResponse<TimeSlot[]>> {
    return request<TimeSlot[]>(
      `/booking/v1/slots?date=${encodeURIComponent(date)}&timezone=${encodeURIComponent(timezone)}&duration=${duration}`
    )
  },

  /**
   * Public: Book a meeting
   */
  async bookMeeting(data: CreateBookingInput): Promise<ApiResponse<Booking>> {
    return request<Booking>("/booking/v1/book", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  /**
   * Public: Cancel booking via token
   */
  async cancelBookingByToken(
    token: string,
    reason?: string
  ): Promise<ApiResponse<Booking>> {
    return request<Booking>("/booking/v1/cancel", {
      method: "POST",
      body: JSON.stringify({ cancellationToken: token, reason }),
    })
  },

  /**
   * Admin: List bookings with filters and pagination
   */
  async getBookings(
    params: AdminQueryBookingsInput = {}
  ): Promise<ApiResponse<Booking[]>> {
    const query = new URLSearchParams()
    if (params.page) query.append("page", String(params.page))
    if (params.limit) query.append("limit", String(params.limit))
    if (params.search) query.append("search", params.search)
    if (params.status) query.append("status", params.status)
    if (params.startDate) query.append("startDate", params.startDate)
    if (params.endDate) query.append("endDate", params.endDate)

    return request<Booking[]>(`/booking/v1/admin/list?${query.toString()}`)
  },

  /**
   * Admin: Get booking statistics
   */
  async getStats(): Promise<ApiResponse<BookingStats>> {
    return request<BookingStats>("/booking/v1/admin/stats")
  },

  /**
   * Admin: Get weekly availability schedule
   */
  async getAvailability(): Promise<ApiResponse<BookingAvailability[]>> {
    return request<BookingAvailability[]>("/booking/v1/admin/availability")
  },

  /**
   * Admin: Update weekly availability schedule
   */
  async updateAvailability(
    schedule: AvailabilityDayInput[]
  ): Promise<ApiResponse<BookingAvailability[]>> {
    return request<BookingAvailability[]>("/booking/v1/admin/availability", {
      method: "PUT",
      body: JSON.stringify({ schedule }),
    })
  },

  /**
   * Admin: Cancel meeting by ID
   */
  async cancelBooking(
    id: string,
    reason?: string
  ): Promise<ApiResponse<Booking>> {
    return request<Booking>(`/booking/v1/admin/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    })
  },

  /**
   * Admin: Get Google OAuth Authorization URL
   */
  async getGoogleAuthUrl(): Promise<ApiResponse<{ url: string }>> {
    return request<{ url: string }>("/booking/v1/admin/google/auth")
  },

  /**
   * Admin: Get Google Calendar connection status
   */
  async getGoogleStatus(): Promise<ApiResponse<GoogleCalendarStatus>> {
    return request<GoogleCalendarStatus>("/booking/v1/admin/google/status")
  },

  /**
   * Admin: Disconnect Google Calendar
   */
  async disconnectGoogle(): Promise<ApiResponse<{ connected: boolean }>> {
    return request<{ connected: boolean }>("/booking/v1/admin/google/disconnect", {
      method: "POST",
    })
  },
}
