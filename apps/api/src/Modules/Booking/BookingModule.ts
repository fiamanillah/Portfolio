// src/Modules/Booking/BookingModule.ts
import rateLimit from "express-rate-limit"
import { BaseModule } from "@/core/BaseModule"
import { AppLogger } from "@workspace/logger"
import { config } from "@/core/config"
import { Role } from "@workspace/db"
import { validateRequest } from "@/middleware/validation"
import { authenticate, requireRole } from "@/middleware/auth"
import { BookingService } from "./booking.service"
import { BookingController } from "./booking.controller"
import {
  getAvailableSlotsSchema,
  createBookingSchema,
  cancelBookingSchema,
  getBookingDetailsSchema,
  adminQueryBookingsSchema,
  updateAvailabilityScheduleSchema,
} from "./BookingDTO"

export class BookingModule extends BaseModule {
  public name: string = "BookingModule"
  public version: string = "1.0.0"
  public basePath: string = "/booking/v1/"
  public dependencies?: string[] | undefined

  protected logger = new AppLogger("BookingModule")

  protected async setupUseCases(): Promise<void> {
    this.registerService("BookingService", new BookingService())
  }

  protected async setupControllers(): Promise<void> {
    const bookingService = this.getService<BookingService>("BookingService")
    this.registerController(
      "BookingController",
      new BookingController(bookingService)
    )
  }

  protected async setupRoutes(): Promise<void> {
    const controller =
      this.getController<BookingController>("BookingController")

    // Rate Limiter: Public booking rate limit
    const bookingLimiter = rateLimit({
      windowMs: config.booking.rateLimitWindowMs,
      max: config.booking.rateLimitMax,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message:
          "Booking rate limit reached. Please wait a few minutes before trying again.",
        code: "RATE_LIMIT_EXCEEDED",
      },
    })

    // ── Public Booking Endpoints ─────────────────────────────────────────

    // GET /booking/v1/slots?date=YYYY-MM-DD&timezone=UTC
    this.router.get(
      "/slots",
      validateRequest({ query: getAvailableSlotsSchema }),
      controller.getAvailableSlots.bind(controller)
    )

    // GET /booking/v1/details?token=UUID
    this.router.get(
      "/details",
      validateRequest({ query: getBookingDetailsSchema }),
      controller.getBookingDetailsByToken.bind(controller)
    )

    // GET /booking/v1/ics?token=UUID
    this.router.get(
      "/ics",
      controller.getBookingIcs.bind(controller)
    )

    // POST /booking/v1/book
    this.router.post(
      "/book",
      bookingLimiter,
      validateRequest({ body: createBookingSchema }),
      controller.bookMeeting.bind(controller)
    )

    // POST /booking/v1/cancel
    this.router.post(
      "/cancel",
      validateRequest({ body: cancelBookingSchema }),
      controller.cancelBookingByToken.bind(controller)
    )

    // GET /booking/v1/google/callback (OAuth Redirect Callback)
    this.router.get(
      "/google/callback",
      controller.handleGoogleCallback.bind(controller)
    )

    // ── Admin Protected Endpoints (RBAC: ADMIN) ──────────────────────────

    // GET /booking/v1/admin/list
    this.router.get(
      "/admin/list",
      authenticate,
      requireRole(Role.ADMIN),
      validateRequest({ query: adminQueryBookingsSchema }),
      controller.adminGetBookings.bind(controller)
    )

    // GET /booking/v1/admin/stats
    this.router.get(
      "/admin/stats",
      authenticate,
      requireRole(Role.ADMIN),
      controller.adminGetStats.bind(controller)
    )

    // GET /booking/v1/admin/availability
    this.router.get(
      "/admin/availability",
      authenticate,
      requireRole(Role.ADMIN),
      controller.adminGetAvailability.bind(controller)
    )

    // PUT /booking/v1/admin/availability
    this.router.put(
      "/admin/availability",
      authenticate,
      requireRole(Role.ADMIN),
      validateRequest({ body: updateAvailabilityScheduleSchema }),
      controller.adminUpdateAvailability.bind(controller)
    )

    // POST /booking/v1/admin/:id/cancel
    this.router.post(
      "/admin/:id/cancel",
      authenticate,
      requireRole(Role.ADMIN),
      controller.adminCancelBooking.bind(controller)
    )

    // GET /booking/v1/admin/google/auth
    this.router.get(
      "/admin/google/auth",
      authenticate,
      requireRole(Role.ADMIN),
      controller.adminGetGoogleAuthUrl.bind(controller)
    )

    // GET /booking/v1/admin/google/status
    this.router.get(
      "/admin/google/status",
      authenticate,
      requireRole(Role.ADMIN),
      controller.adminGetGoogleStatus.bind(controller)
    )

    // POST /booking/v1/admin/google/disconnect
    this.router.post(
      "/admin/google/disconnect",
      authenticate,
      requireRole(Role.ADMIN),
      controller.adminDisconnectGoogle.bind(controller)
    )

    this.logger.info(
      "✔ Booking module routes registered (Public slots/booking & Admin management + Google Calendar sync)"
    )
  }
}
