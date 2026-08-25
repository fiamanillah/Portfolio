// apps/web/src/lib/api/bookingApi.ts
import type { TimeSlot, Booking, CreateBookingInput } from "@workspace/shared"

const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.PUBLIC_API_URL) ||
  "http://localhost:3040"

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export const bookingApi = {
  /**
   * Fetch available time slots for a given day
   */
  async getAvailableSlots(
    date: string,
    timezone: string = "UTC",
    duration: number = 30
  ): Promise<ApiResponse<TimeSlot[]>> {
    try {
      const url = `${API_BASE_URL}/booking/v1/slots?date=${encodeURIComponent(date)}&timezone=${encodeURIComponent(timezone)}&duration=${duration}`
      const res = await fetch(url)
      const data = await res.json()
      return data
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || "Failed to fetch available slots.",
      }
    }
  },

  /**
   * Book a meeting slot
   */
  async bookMeeting(
    payload: CreateBookingInput
  ): Promise<ApiResponse<Booking>> {
    try {
      const url = `${API_BASE_URL}/booking/v1/book`
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      return data
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || "Failed to submit booking.",
      }
    }
  },

  /**
   * Fetch booking details by cancellation token
   */
  async getBookingDetails(token: string): Promise<ApiResponse<Booking>> {
    try {
      const url = `${API_BASE_URL}/booking/v1/details?token=${encodeURIComponent(token)}`
      const res = await fetch(url)
      const data = await res.json()
      return data
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || "Failed to retrieve booking details.",
      }
    }
  },

  /**
   * Cancel booking using cancellation token
   */
  async cancelBooking(
    token: string,
    reason?: string
  ): Promise<ApiResponse<Booking>> {
    try {
      const url = `${API_BASE_URL}/booking/v1/cancel`
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancellationToken: token, reason }),
      })
      const data = await res.json()
      return data
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || "Failed to cancel booking.",
      }
    }
  },
}
