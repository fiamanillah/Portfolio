// src/Modules/Booking/booking.controller.ts
import { Request, Response, NextFunction } from "express"
import { BaseController } from "@/core/BaseController"
import { config } from "@/core/config"
import { BookingService } from "./booking.service"
import { HTTPStatusCode } from "@/types/HTTPStatusCode"
import {
  GetAvailableSlotsInput,
  CreateBookingInput,
  CancelBookingInput,
  AdminQueryBookingsInput,
  UpdateAvailabilityScheduleInput,
} from "./BookingDTO"

export class BookingController extends BaseController {
  constructor(private bookingService: BookingService) {
    super()
  }

  /**
   * GET /booking/v1/slots
   * Public: Query available time slots for a given date
   */
  public async getAvailableSlots(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = (req.validatedQuery || req.query) as unknown as GetAvailableSlotsInput
      const duration = query.duration ? Number(query.duration) : 30
      const slots = await this.bookingService.getAvailableSlots(
        query.date,
        query.timezone,
        duration
      )

      this.sendResponse(
        req,
        res,
        "Available time slots retrieved successfully.",
        HTTPStatusCode.OK,
        slots
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /booking/v1/book
   * Public: Book a meeting slot
   */
  public async bookMeeting(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const input = (req.validatedBody || req.body) as CreateBookingInput
      const clientIp =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.socket.remoteAddress ||
        req.ip
      const booking = await this.bookingService.createBooking(input, clientIp)

      this.sendCreatedResponse(
        req,
        res,
        booking,
        "Meeting booked successfully! A calendar invite and Google Meet link have been created."
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /booking/v1/cancel
   * Public: Cancel a booking via secure token
   */
  public async cancelBookingByToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const input = (req.validatedBody || req.body) as CancelBookingInput
      const token = input.cancellationToken || (req.query.token as string)

      if (!token) {
        res.status(HTTPStatusCode.BAD_REQUEST).json({
          success: false,
          message: "Cancellation token is required.",
        })
        return
      }

      const cancelled = await this.bookingService.cancelBookingByToken(
        token,
        input.reason
      )

      this.sendResponse(
        req,
        res,
        "Meeting has been cancelled successfully.",
        HTTPStatusCode.OK,
        cancelled
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /booking/v1/details
   * Public: Get booking summary by cancellation token
   */
  public async getBookingDetailsByToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = (req.validatedQuery?.token || req.query.token) as string

      if (!token) {
        res.status(HTTPStatusCode.BAD_REQUEST).json({
          success: false,
          message: "Booking token is required.",
        })
        return
      }

      const booking = await this.bookingService.getBookingByToken(token)

      this.sendResponse(
        req,
        res,
        "Booking details retrieved successfully.",
        HTTPStatusCode.OK,
        booking
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /booking/v1/ics
   * Public: Download RFC 5545 .ics calendar invitation by token
   */
  public async getBookingIcs(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = ((req.query.token || req.params.token) as string)?.trim()

      if (!token) {
        res.status(HTTPStatusCode.BAD_REQUEST).json({
          success: false,
          message: "Booking token is required to download calendar invite.",
        })
        return
      }

      const { filename, content } =
        await this.bookingService.getBookingIcsByToken(token)

      res.setHeader("Content-Type", "text/calendar; charset=utf-8; method=REQUEST")
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`)
      res.status(HTTPStatusCode.OK).send(content)
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /booking/v1/admin/list
   * Admin: List all bookings
   */
  public async adminGetBookings(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = (req.validatedQuery || req.query) as unknown as AdminQueryBookingsInput
      const { bookings, pagination } =
        await this.bookingService.adminGetBookings(query)

      res.status(HTTPStatusCode.OK).json({
        success: true,
        message: "Bookings retrieved successfully.",
        data: bookings,
        pagination,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /booking/v1/admin/stats
   * Admin: Booking summary statistics
   */
  public async adminGetStats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await this.bookingService.adminGetStats()
      this.sendResponse(
        req,
        res,
        "Booking stats retrieved successfully.",
        HTTPStatusCode.OK,
        stats
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /booking/v1/admin/availability
   * Admin: Get weekly availability configuration
   */
  public async adminGetAvailability(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const availability = await this.bookingService.adminGetAvailability()
      this.sendResponse(
        req,
        res,
        "Availability schedule retrieved successfully.",
        HTTPStatusCode.OK,
        availability
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * PUT /booking/v1/admin/availability
   * Admin: Update weekly availability configuration
   */
  public async adminUpdateAvailability(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { schedule } = (req.validatedBody || req.body) as UpdateAvailabilityScheduleInput
      const updated = await this.bookingService.adminUpdateAvailability(schedule)

      this.sendResponse(
        req,
        res,
        "Availability schedule updated successfully.",
        HTTPStatusCode.OK,
        updated
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /booking/v1/admin/:id/cancel
   * Admin: Cancel meeting by ID
   */
  public async adminCancelBooking(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = String(req.params.id)
      const { reason } = req.body || {}
      const updated = await this.bookingService.adminCancelBooking(id, reason)

      this.sendResponse(
        req,
        res,
        "Booking cancelled successfully.",
        HTTPStatusCode.OK,
        updated
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /booking/v1/admin/google/auth
   * Admin: Get Google OAuth Authorization URL
   */
  public async adminGetGoogleAuthUrl(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id
      const googleService = this.bookingService.getGoogleCalendarService()
      const authUrl = googleService.getAuthUrl(userId)

      this.sendResponse(
        req,
        res,
        "Google OAuth authorization URL generated.",
        HTTPStatusCode.OK,
        { url: authUrl }
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /booking/v1/google/callback
   * Public / Callback: Process Google OAuth Callback and redirect to dashboard
   */
  public async handleGoogleCallback(
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const code = typeof req.query.code === "string" ? req.query.code : ""
      const state = typeof req.query.state === "string" ? req.query.state : req.user?.id || "system-admin"

      if (!code) {
        res.status(HTTPStatusCode.BAD_REQUEST).send("Missing OAuth code parameter.")
        return
      }

      const googleService = this.bookingService.getGoogleCalendarService()
      await googleService.handleCallback(code, state)

      // Redirect back to Admin Dashboard bookings page with success flag
      const dashboardUrl = config.site.dashboardUrl

      res.redirect(`${dashboardUrl}/bookings?google_sync=success`)
    } catch (error) {
      this.logger.error("Error processing Google OAuth callback", { error })
      const dashboardUrl = config.site.dashboardUrl
      res.redirect(`${dashboardUrl}/bookings?google_sync=error`)
    }
  }

  /**
   * GET /booking/v1/admin/google/status
   * Admin: Check Google Calendar connection status
   */
  public async adminGetGoogleStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const googleService = this.bookingService.getGoogleCalendarService()
      const status = await googleService.getStatus()

      this.sendResponse(
        req,
        res,
        "Google Calendar status retrieved.",
        HTTPStatusCode.OK,
        status
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /booking/v1/admin/google/disconnect
   * Admin: Disconnect Google Calendar
   */
  public async adminDisconnectGoogle(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const googleService = this.bookingService.getGoogleCalendarService()
      await googleService.disconnect(req.user?.id)

      this.sendResponse(
        req,
        res,
        "Google Calendar disconnected successfully.",
        HTTPStatusCode.OK,
        { connected: false }
      )
    } catch (error) {
      next(error)
    }
  }
}
