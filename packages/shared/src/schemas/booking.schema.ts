// packages/shared/src/schemas/booking.schema.ts
import { z } from "zod"

export const getAvailableSlotsSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  timezone: z.string().optional().default("UTC"),
  duration: z.coerce.number().min(15).max(120).default(30).optional(),
})

export const createBookingSchema = z.object({
  guestName: z.string().min(2, "Name must be at least 2 characters"),
  guestEmail: z.string().email("Invalid email address"),
  guestNotes: z.string().max(1000, "Notes cannot exceed 1000 characters").optional().nullable(),
  meetingType: z.string().optional().default("1-on-1 Consultation"),
  startTime: z.string().datetime({ message: "Start time must be a valid ISO 8601 string" }),
  durationMinutes: z.number().min(15).max(120).optional().default(30),
  timezone: z.string().optional().default("UTC"),
  captchaToken: z.string().optional(),
  hp_field: z.string().optional(),
})

export const cancelBookingSchema = z.object({
  cancellationToken: z.string().uuid("Invalid cancellation token").optional(),
  reason: z.string().max(500, "Reason cannot exceed 500 characters").optional(),
})

export const getBookingDetailsSchema = z.object({
  token: z.string().uuid("Invalid booking cancellation token format"),
})

export const adminQueryBookingsSchema = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(10).optional(),
  search: z.string().optional(),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "RESCHEDULED", "COMPLETED"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export const availabilityDaySchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be HH:MM"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be HH:MM"),
  isActive: z.boolean(),
  slotDuration: z.number().min(15).max(120).default(30),
  bufferTime: z.number().min(0).max(60).default(15),
  timezone: z.string().default("UTC"),
})

export const updateAvailabilityScheduleSchema = z.object({
  schedule: z.array(availabilityDaySchema).min(1),
})

export type GetAvailableSlotsInput = z.infer<typeof getAvailableSlotsSchema>
export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>
export type GetBookingDetailsInput = z.infer<typeof getBookingDetailsSchema>
export type AdminQueryBookingsInput = z.infer<typeof adminQueryBookingsSchema>
export type AvailabilityDayInput = z.infer<typeof availabilityDaySchema>
export type UpdateAvailabilityScheduleInput = z.infer<typeof updateAvailabilityScheduleSchema>
