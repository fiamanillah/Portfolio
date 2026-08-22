// src/Modules/Booking/booking.service.ts
import axios from "axios"
import { prisma, BookingStatus } from "@workspace/db"
import { AppLogger } from "@workspace/logger"
import { config } from "@/core/config"
import { GoogleCalendarService } from "@/services/GoogleCalendarService"
import { PlunkVerifyService } from "@/services/PlunkVerifyService"
import {
  CreateBookingInput,
  AdminQueryBookingsInput,
  AvailabilityDayInput,
} from "./BookingDTO"
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  BadRequestError,
  ExternalServiceError,
} from "@/core/errors/AppError"
import { TimeSlot } from "@workspace/shared"
import { renderBookingConfirmationEmail } from "@/templates/emails/bookingConfirmation"
import { renderBookingNotificationEmail } from "@/templates/emails/bookingNotification"
import {
  renderBookingCancellationEmail,
  renderHostCancellationNotificationEmail,
} from "@/templates/emails/bookingCancellation"
import {
  generateIcsContent,
  generateCalendarDeeplinks,
} from "@/utils/icsGenerator"

export class BookingService {
  private logger = new AppLogger("BookingService")
  private googleCalendarService = new GoogleCalendarService()

  public getGoogleCalendarService() {
    return this.googleCalendarService
  }

  private isPlaceholderKey(key?: string): boolean {
    return PlunkVerifyService.isPlaceholderKey(key)
  }

  /**
   * Stage 1: Honeypot Trap Evaluation (Bot Defense)
   */
  public isHoneypotTriggered(hp_field?: string): boolean {
    if (hp_field && hp_field.trim().length > 0) {
      this.logger.warn("⚡ Honeypot trap triggered by automated booking bot")
      return true
    }
    return false
  }

  /**
   * Stage 2: Cloudflare Turnstile Verification
   */
  public async verifyTurnstileToken(
    token?: string,
    clientIp?: string
  ): Promise<boolean> {
    const secretKey = config.turnstile.secretKey

    if (this.isPlaceholderKey(secretKey)) {
      this.logger.warn(
        "⚠️ TURNSTILE_SECRET_KEY missing or placeholder. Bypassing Turnstile verification in dev mode."
      )
      return true
    }

    if (!token) {
      this.logger.warn("CAPTCHA token missing from booking payload")
      return false
    }

    try {
      const response = await axios.post(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        new URLSearchParams({
          secret: secretKey,
          response: token,
          ...(clientIp ? { remoteip: clientIp } : {}),
        }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          timeout: 5000,
        }
      )

      const data = response.data
      if (!data.success) {
        this.logger.warn("Cloudflare Turnstile token verification failed", {
          errorCodes: data["error-codes"],
        })
        return false
      }

      this.logger.info("✔ Cloudflare Turnstile booking verification successful")
      return true
    } catch (error) {
      this.logger.error("Error connecting to Cloudflare Turnstile API", { error })
      throw new ExternalServiceError(
        "Failed to verify security token with Cloudflare"
      )
    }
  }

  /**
   * Stage 3: Plunk Email Verification (Disposable check, typo check, MX records check)
   */
  public async verifyEmailWithPlunk(email: string): Promise<void> {
    await PlunkVerifyService.verifyEmail(email)
  }

  /**
   * Stage 4: Input Sanitization (XSS Prevention)
   */
  public sanitizeInput(text?: string | null): string {
    if (!text) return ""
    return text
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;")
      .trim()
  }

  /**
   * Calculate available time slots for a specific date
   */
  public async getAvailableSlots(
    dateStr: string, // YYYY-MM-DD
    _userTimezone: string = "UTC",
    requestedDuration: number = 30
  ): Promise<TimeSlot[]> {
    const [year, month, day] = dateStr.split("-").map(Number)
    const targetDate = new Date(Date.UTC(year, month - 1, day))
    const dayOfWeek = targetDate.getUTCDay()

    // 1. Fetch configured availability for this day of week
    const availability = await prisma.bookingAvailability.findUnique({
      where: { dayOfWeek },
    })

    if (!availability || !availability.isActive) {
      return []
    }

    const slotDuration = requestedDuration || availability.slotDuration || 30
    const bufferTime = availability.bufferTime || 0

    // 2. Parse start and end hours for candidate slots
    const [startHour, startMin] = availability.startTime.split(":").map(Number)
    const [endHour, endMin] = availability.endTime.split(":").map(Number)

    const dayStart = new Date(Date.UTC(year, month - 1, day, startHour, startMin, 0))
    const dayEnd = new Date(Date.UTC(year, month - 1, day, endHour, endMin, 0))

    // 3. Fetch existing confirmed/pending bookings for this date range in DB
    const rangeStart = new Date(Date.UTC(year, month - 1, day, 0, 0, 0))
    const rangeEnd = new Date(Date.UTC(year, month - 1, day, 23, 59, 59))

    const existingBookings = await prisma.booking.findMany({
      where: {
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
        startTime: { lte: rangeEnd },
        endTime: { gte: rangeStart },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    })

    // 4. Fetch Google Calendar busy blocks
    const busyIntervals = await this.googleCalendarService.getBusyIntervals(
      rangeStart,
      rangeEnd
    )

    // 5. Generate candidate slots and test availability
    const slots: TimeSlot[] = []
    const now = new Date()
    const minimumBookingTime = new Date(now.getTime() + 60 * 60 * 1000)

    let currentSlotStart = new Date(dayStart)

    while (
      currentSlotStart.getTime() + slotDuration * 60 * 1000 <=
      dayEnd.getTime()
    ) {
      const currentSlotEnd = new Date(
        currentSlotStart.getTime() + slotDuration * 60 * 1000
      )

      // Past check
      const isPast = currentSlotStart.getTime() < minimumBookingTime.getTime()

      // DB conflict check (with buffer)
      const hasDbConflict = existingBookings.some((booking) => {
        const bStart = new Date(booking.startTime).getTime() - bufferTime * 60 * 1000
        const bEnd = new Date(booking.endTime).getTime() + bufferTime * 60 * 1000
        return (
          currentSlotStart.getTime() < bEnd && currentSlotEnd.getTime() > bStart
        )
      })

      // Google Calendar busy check
      const hasGoogleConflict = busyIntervals.some((busy) => {
        const busyStart = busy.start.getTime()
        const busyEnd = busy.end.getTime()
        return (
          currentSlotStart.getTime() < busyEnd &&
          currentSlotEnd.getTime() > busyStart
        )
      })

      const isAvailable = !isPast && !hasDbConflict && !hasGoogleConflict

      const formatTime = (d: Date) => {
        const hours = d.getUTCHours().toString().padStart(2, "0")
        const mins = d.getUTCMinutes().toString().padStart(2, "0")
        return `${hours}:${mins}`
      }

      slots.push({
        startTime: currentSlotStart.toISOString(),
        endTime: currentSlotEnd.toISOString(),
        available: isAvailable,
        label: `${formatTime(currentSlotStart)} - ${formatTime(currentSlotEnd)} UTC`,
      })

      currentSlotStart = new Date(
        currentSlotStart.getTime() + slotDuration * 60 * 1000
      )
    }

    return slots
  }

  /**
   * Create a new booking with 5-stage defense system & confirmation email delivery
   */
  public async createBooking(input: CreateBookingInput, clientIp?: string) {
    // ── Stage 1: Honeypot Silent Trap Check ────────────────────────
    if (this.isHoneypotTriggered(input.hp_field)) {
      this.logger.info("Fake booking response returned for honeypot trigger")
      return {
        id: "simulated-booking-id",
        guestName: input.guestName,
        guestEmail: input.guestEmail,
        guestNotes: input.guestNotes || null,
        meetingType: input.meetingType || "1-on-1 Consultation",
        startTime: new Date(input.startTime),
        endTime: new Date(new Date(input.startTime).getTime() + 30 * 60 * 1000),
        durationMinutes: input.durationMinutes || 30,
        timezone: input.timezone || "UTC",
        status: BookingStatus.CONFIRMED,
        googleEventId: null,
        googleMeetLink: "https://meet.google.com/sim-ulated-link",
        cancellationToken: "simulated-token",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }

    // ── Stage 2: Turnstile CAPTCHA Verification ────────────────────
    const isCaptchaValid = await this.verifyTurnstileToken(
      input.captchaToken,
      clientIp
    )
    if (!isCaptchaValid) {
      throw new BadRequestError(
        "Security verification failed. Please refresh the page and try again."
      )
    }

    // ── Stage 3: Email Verification (MX, Typo & Disposable check) ──
    const cleanEmail = input.guestEmail.trim().toLowerCase()
    await this.verifyEmailWithPlunk(cleanEmail)

    // ── Stage 4: Input Sanitization ────────────────────────────────
    const sanitizedName = this.sanitizeInput(input.guestName)
    const sanitizedNotes = input.guestNotes
      ? this.sanitizeInput(input.guestNotes)
      : null
    const meetingType = input.meetingType || "1-on-1 Consultation"

    const startTime = new Date(input.startTime)
    if (isNaN(startTime.getTime())) {
      throw new ValidationError("Invalid start time provided.")
    }

    if (startTime.getTime() < Date.now()) {
      throw new ValidationError("Cannot book an appointment in the past.")
    }

    const duration = input.durationMinutes || 30
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000)

    // 1. Atomically check and reserve the slot in PostgreSQL using a transaction
    const booking = await prisma.$transaction(async (tx) => {
      const conflict = await tx.booking.findFirst({
        where: {
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING] },
          startTime: { lt: endTime },
          endTime: { gt: startTime },
        },
      })

      if (conflict) {
        throw new ConflictError(
          "This time slot has just been reserved. Please select another available time."
        )
      }

      return await tx.booking.create({
        data: {
          guestName: sanitizedName,
          guestEmail: cleanEmail,
          guestNotes: sanitizedNotes,
          meetingType,
          startTime,
          endTime,
          durationMinutes: duration,
          timezone: input.timezone || "UTC",
          status: BookingStatus.CONFIRMED,
        },
      })
    })

    // 2. Sync with Google Calendar (Create Event + Google Meet Room)
    let googleResult: { googleEventId?: string; googleMeetLink?: string } | null = null
    try {
      googleResult = await this.googleCalendarService.createCalendarEvent({
        guestName: sanitizedName,
        guestEmail: cleanEmail,
        startTime,
        endTime,
        notes: sanitizedNotes,
        meetingType,
      })

      if (googleResult?.googleEventId || googleResult?.googleMeetLink) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            googleEventId: googleResult.googleEventId || null,
            googleMeetLink: googleResult.googleMeetLink || null,
          },
        })
        booking.googleEventId = googleResult.googleEventId || null
        booking.googleMeetLink = googleResult.googleMeetLink || null
      }
    } catch (gcalErr) {
      this.logger.warn("Google Calendar sync encountered an issue, proceeding with DB booking", {
        error: gcalErr,
      })
    }

    this.logger.info(
      `✔ Booking confirmed: ${booking.guestName} (${booking.guestEmail}) at ${booking.startTime.toISOString()}`,
      {
        bookingId: booking.id,
        googleEventId: booking.googleEventId,
      }
    )

    // 3. Send Transactional Confirmation Email to Guest & Admin Notification
    this.sendBookingConfirmationEmails(booking).catch((err) => {
      this.logger.error("Failed to send booking confirmation email(s)", {
        error: err instanceof Error ? err.message : err,
      })
    })

    return booking
  }

  /**
   * Send confirmation email to attendee and notification to host
   */
  public async sendBookingConfirmationEmails(booking: {
    id: string
    guestName: string
    guestEmail: string
    meetingType: string
    startTime: Date
    endTime: Date
    durationMinutes: number
    timezone: string
    googleMeetLink?: string | null
    guestNotes?: string | null
    cancellationToken: string
  }): Promise<void> {
    const secretKey = config.plunk.secretKey
    const adminEmail = config.booking.adminEmail || config.contact.recipientEmail
    const webUrl = config.site.webUrl || "https://fi.amanillah.com"
    const senderEmail = config.contact.recipientEmail || "fi@amanillah.com"
    const senderName = "Fi Amanillah"
    const hostSenderName = "Fi Amanillah Portfolio"

    // Check if synced templates exist in DB
    let guestTemplateId: string | undefined
    let hostTemplateId: string | undefined
    try {
      const dbGuestTmpl = await prisma.emailTemplate.findUnique({
        where: { slug: "booking-confirmation" },
      })
      if (dbGuestTmpl?.plunkId) {
        guestTemplateId = dbGuestTmpl.plunkId
      }
      const dbHostTmpl = await prisma.emailTemplate.findUnique({
        where: { slug: "booking-notification" },
      })
      if (dbHostTmpl?.plunkId) {
        hostTemplateId = dbHostTmpl.plunkId
      }
    } catch {
      // fallback to rendered HTML
    }

    // 1. Render Guest Confirmation Email
    const guestEmailContent = renderBookingConfirmationEmail({
      bookingId: booking.id,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      meetingType: booking.meetingType,
      startTime: booking.startTime,
      endTime: booking.endTime,
      durationMinutes: booking.durationMinutes,
      timezone: booking.timezone,
      googleMeetLink: booking.googleMeetLink,
      cancellationToken: booking.cancellationToken,
      guestNotes: booking.guestNotes,
      webUrl,
    })

    // 2. Render Host Notification Email
    const hostEmailContent = renderBookingNotificationEmail({
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      meetingType: booking.meetingType,
      startTime: booking.startTime,
      endTime: booking.endTime,
      durationMinutes: booking.durationMinutes,
      timezone: booking.timezone,
      googleMeetLink: booking.googleMeetLink,
      guestNotes: booking.guestNotes,
      bookingId: booking.id,
      dashboardUrl: process.env.PUBLIC_DASHBOARD_URL || "http://localhost:3001",
    })

    // 3. Generate RFC 5545 iCalendar (.ics) Payload for Native Mail RSVP Banners
    const icsContent = generateIcsContent({
      uid: booking.id,
      sequence: 0,
      method: "REQUEST",
      status: "CONFIRMED",
      startTime: booking.startTime,
      endTime: booking.endTime,
      summary: `${booking.meetingType} with Fi Amanillah`,
      description: `1-on-1 Consultation Session.\n\nGoogle Meet: ${booking.googleMeetLink || "Online Room"}\nNotes: ${booking.guestNotes || "None"}`,
      location: booking.googleMeetLink || "Google Meet Video Call",
      organizerName: senderName,
      organizerEmail: senderEmail,
      attendeeName: booking.guestName,
      attendeeEmail: booking.guestEmail,
    })
    const base64Ics = Buffer.from(icsContent, "utf-8").toString("base64")

    const calendarLinks = generateCalendarDeeplinks({
      title: `${booking.meetingType} with Fi Amanillah`,
      startTime: booking.startTime,
      endTime: booking.endTime,
      description: `1-on-1 Consultation Session.\n\nGoogle Meet: ${booking.googleMeetLink || "Online Room"}\nNotes: ${booking.guestNotes || "None"}`,
      location: booking.googleMeetLink || "Google Meet Video Call",
    })

    if (this.isPlaceholderKey(secretKey)) {
      this.logger.info("ℹ️ [SIMULATED BOOKING EMAIL DELIVERY]")
      this.logger.info(`Guest To: ${booking.guestEmail}`)
      this.logger.info(`Guest Subject: ${guestEmailContent.subject}`)
      this.logger.info(`Host To: ${adminEmail}`)
      this.logger.info(`Host Subject: ${hostEmailContent.subject}`)
      return
    }

    // 1. Send Guest Confirmation Email with Attached invite.ics
    try {
      const guestPayload: Record<string, any> = {
        to: booking.guestEmail,
        from: senderEmail,
        name: senderName,
        reply: adminEmail,
        subject: guestEmailContent.subject,
        body: guestEmailContent.html,
        attachments: [
          {
            filename: "invite.ics",
            content: base64Ics,
            contentType: "text/calendar; method=REQUEST; charset=UTF-8",
          },
        ],
        data: {
          guestName: booking.guestName,
          meetingType: booking.meetingType,
          durationMinutes: booking.durationMinutes,
          timezone: booking.timezone,
          googleMeetLink: booking.googleMeetLink || "",
          cancellationToken: booking.cancellationToken,
          cancelUrl: `${webUrl}/#book-call?cancelToken=${booking.cancellationToken}`,
          icsDownloadUrl: `${webUrl}/api/v1/booking/ics?token=${booking.cancellationToken}`,
          googleCalUrl: calendarLinks.googleCalendarUrl,
          outlookCalUrl: calendarLinks.outlookLiveUrl,
          guestNotes: booking.guestNotes || "",
        },
      }

      if (guestTemplateId && !this.isPlaceholderKey(guestTemplateId)) {
        guestPayload.template = guestTemplateId
      }

      const guestRes = await axios.post(
        `${config.plunk.apiUrl}/v1/send`,
        guestPayload,
        {
          headers: {
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      )

      if (guestRes.data?.success) {
        this.logger.info(
          `✔ Booking confirmation email delivered to guest ${booking.guestEmail}`,
          {
            contact: guestRes.data?.data?.contact,
            event: guestRes.data?.data?.event,
            timestamp: guestRes.data?.data?.timestamp,
          }
        )
      } else {
        this.logger.warn(
          `⚠️ Plunk /v1/send returned non-success for guest ${booking.guestEmail}`,
          { response: guestRes.data }
        )
      }
    } catch (error: any) {
      const errorDetails = axios.isAxiosError(error)
        ? {
            status: error.response?.status,
            statusText: error.response?.statusText,
            responseData: error.response?.data,
            message: error.message,
          }
        : { message: error?.message || String(error) }

      this.logger.error(
        `❌ Failed to send booking confirmation email to guest (${booking.guestEmail})`,
        { errorDetails }
      )
    }

    // 2. Send Host Admin Notification Email
    try {
      const hostPayload: Record<string, any> = {
        to: adminEmail,
        from: senderEmail,
        name: hostSenderName,
        reply: booking.guestEmail,
        subject: hostEmailContent.subject,
        body: hostEmailContent.html,
        attachments: [
          {
            filename: "invite.ics",
            content: base64Ics,
            contentType: "text/calendar; method=REQUEST; charset=UTF-8",
          },
        ],
        data: {
          guestName: booking.guestName,
          guestEmail: booking.guestEmail,
          meetingType: booking.meetingType,
          durationMinutes: booking.durationMinutes,
          timezone: booking.timezone,
          googleMeetLink: booking.googleMeetLink || "",
          guestNotes: booking.guestNotes || "",
          bookingId: booking.id,
          dashboardUrl: process.env.PUBLIC_DASHBOARD_URL || "http://localhost:3001",
        },
      }

      if (hostTemplateId && !this.isPlaceholderKey(hostTemplateId)) {
        hostPayload.template = hostTemplateId
      }

      const hostRes = await axios.post(
        `${config.plunk.apiUrl}/v1/send`,
        hostPayload,
        {
          headers: {
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      )

      if (hostRes.data?.success) {
        this.logger.info(
          `✔ Host booking notification email delivered to ${adminEmail}`,
          {
            contact: hostRes.data?.data?.contact,
            event: hostRes.data?.data?.event,
            timestamp: hostRes.data?.data?.timestamp,
          }
        )
      } else {
        this.logger.warn(
          `⚠️ Plunk /v1/send returned non-success for host notification (${adminEmail})`,
          { response: hostRes.data }
        )
      }
    } catch (error: any) {
      const errorDetails = axios.isAxiosError(error)
        ? {
            status: error.response?.status,
            statusText: error.response?.statusText,
            responseData: error.response?.data,
            message: error.message,
          }
        : { message: error?.message || String(error) }

      this.logger.error(
        `❌ Failed to send host booking notification email to ${adminEmail}`,
        { errorDetails }
      )
    }
  }

  /**
   * Fetch public booking summary details by cancellation token
   */
  public async getBookingByToken(cancellationToken: string) {
    const booking = await prisma.booking.findUnique({
      where: { cancellationToken },
      select: {
        id: true,
        guestName: true,
        guestEmail: true,
        meetingType: true,
        startTime: true,
        endTime: true,
        durationMinutes: true,
        timezone: true,
        status: true,
        googleMeetLink: true,
        guestNotes: true,
        cancellationToken: true,
        createdAt: true,
      },
    })

    if (!booking) {
      throw new NotFoundError("Booking not found or invalid cancellation token.")
    }

    return booking
  }

  /**
   * Generate downloadable .ics calendar file content by cancellation token
   */
  public async getBookingIcsByToken(cancellationToken: string): Promise<{
    filename: string
    content: string
  }> {
    const booking = await this.getBookingByToken(cancellationToken)
    const isCancelled = booking.status === BookingStatus.CANCELLED

    const ics = generateIcsContent({
      uid: booking.id,
      sequence: isCancelled ? 1 : 0,
      method: isCancelled ? "CANCEL" : "REQUEST",
      status: isCancelled ? "CANCELLED" : "CONFIRMED",
      startTime: booking.startTime,
      endTime: booking.endTime,
      summary: `${isCancelled ? "CANCELLED: " : ""}${booking.meetingType} with Fi Amanillah`,
      description: `1-on-1 Consultation Session.\n\nGoogle Meet: ${booking.googleMeetLink || "Online Room"}\nNotes: ${booking.guestNotes || "None"}`,
      location: booking.googleMeetLink || "Google Meet Video Call",
      organizerName: "Fi Amanillah",
      organizerEmail: config.contact.recipientEmail || "fi@amanillah.com",
      attendeeName: booking.guestName,
      attendeeEmail: booking.guestEmail,
    })

    return {
      filename: `consultation-fi-amanillah-${booking.id.slice(0, 8)}.ics`,
      content: ics,
    }
  }

  /**
   * Send cancellation emails to both attendee and host
   */
  public async sendBookingCancellationEmails(
    booking: {
      id: string
      guestName: string
      guestEmail: string
      meetingType: string
      startTime: Date
      endTime: Date
      durationMinutes: number
      timezone: string
    },
    cancelledBy: "guest" | "host",
    reason?: string
  ): Promise<void> {
    const secretKey = config.plunk.secretKey
    const adminEmail = config.booking.adminEmail || config.contact.recipientEmail
    const webUrl = config.site.webUrl || "https://fi.amanillah.com"
    const senderEmail = config.contact.recipientEmail || "fi@amanillah.com"
    const senderName = "Fi Amanillah"
    const hostSenderName = "Fi Amanillah Portfolio"

    // Check if synced templates exist in DB
    let guestTemplateId: string | undefined
    let hostTemplateId: string | undefined
    try {
      const dbGuestTmpl = await prisma.emailTemplate.findUnique({
        where: { slug: "booking-cancellation" },
      })
      if (dbGuestTmpl?.plunkId) {
        guestTemplateId = dbGuestTmpl.plunkId
      }
      const dbHostTmpl = await prisma.emailTemplate.findUnique({
        where: { slug: "booking-cancellation-admin" },
      })
      if (dbHostTmpl?.plunkId) {
        hostTemplateId = dbHostTmpl.plunkId
      }
    } catch {
      // fallback to direct HTML
    }

    const guestEmailContent = renderBookingCancellationEmail({
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      meetingType: booking.meetingType,
      startTime: booking.startTime,
      endTime: booking.endTime,
      durationMinutes: booking.durationMinutes,
      timezone: booking.timezone,
      reason,
      cancelledBy,
      webUrl,
    })

    const hostEmailContent = renderHostCancellationNotificationEmail({
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      meetingType: booking.meetingType,
      startTime: booking.startTime,
      endTime: booking.endTime,
      durationMinutes: booking.durationMinutes,
      timezone: booking.timezone,
      reason,
      cancelledBy,
      bookingId: booking.id,
      dashboardUrl: process.env.PUBLIC_DASHBOARD_URL || "https://admin.fi.amanillah.com",
    })

    // Generate RFC 5545 Cancellation .ics payload
    const cancelIcsContent = generateIcsContent({
      uid: booking.id,
      sequence: 1,
      method: "CANCEL",
      status: "CANCELLED",
      startTime: booking.startTime,
      endTime: booking.endTime,
      summary: `CANCELLED: ${booking.meetingType} with Fi Amanillah`,
      description: `The meeting session has been cancelled.${reason ? `\nReason: ${reason}` : ""}`,
      organizerName: senderName,
      organizerEmail: senderEmail,
      attendeeName: booking.guestName,
      attendeeEmail: booking.guestEmail,
    })
    const base64CancelIcs = Buffer.from(cancelIcsContent, "utf-8").toString("base64")

    if (this.isPlaceholderKey(secretKey)) {
      this.logger.info("ℹ️ [SIMULATED BOOKING CANCELLATION EMAIL DELIVERY]")
      this.logger.info(`Guest To: ${booking.guestEmail}`)
      this.logger.info(`Guest Subject: ${guestEmailContent.subject}`)
      this.logger.info(`Host To: ${adminEmail}`)
      this.logger.info(`Host Subject: ${hostEmailContent.subject}`)
      return
    }

    // 1. Send Guest Cancellation Email with cancel.ics
    try {
      const guestPayload: Record<string, any> = {
        to: booking.guestEmail,
        from: senderEmail,
        name: senderName,
        reply: adminEmail,
        subject: guestEmailContent.subject,
        body: guestEmailContent.html,
        attachments: [
          {
            filename: "cancel.ics",
            content: base64CancelIcs,
            contentType: "text/calendar; method=CANCEL; charset=UTF-8",
          },
        ],
        data: {
          guestName: booking.guestName,
          meetingType: booking.meetingType,
          durationMinutes: booking.durationMinutes,
          timezone: booking.timezone,
          reason: reason || "",
          rescheduleUrl: `${webUrl}/#book-call`,
        },
      }

      if (guestTemplateId && !this.isPlaceholderKey(guestTemplateId)) {
        guestPayload.template = guestTemplateId
      }

      await axios.post(
        `${config.plunk.apiUrl}/v1/send`,
        guestPayload,
        {
          headers: {
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      )
      this.logger.info(
        `✔ Booking cancellation email delivered to guest ${booking.guestEmail}`
      )
    } catch (error: any) {
      const errorDetails = axios.isAxiosError(error)
        ? {
            status: error.response?.status,
            statusText: error.response?.statusText,
            responseData: error.response?.data,
            message: error.message,
          }
        : { message: error?.message || String(error) }

      this.logger.error(
        `❌ Failed to send booking cancellation email to guest (${booking.guestEmail})`,
        { errorDetails }
      )
    }

    // 2. Send Host Admin Cancellation Alert
    try {
      const hostPayload: Record<string, any> = {
        to: adminEmail,
        from: senderEmail,
        name: hostSenderName,
        reply: booking.guestEmail,
        subject: hostEmailContent.subject,
        body: hostEmailContent.html,
        attachments: [
          {
            filename: "cancel.ics",
            content: base64CancelIcs,
            contentType: "text/calendar; method=CANCEL; charset=UTF-8",
          },
        ],
        data: {
          guestName: booking.guestName,
          guestEmail: booking.guestEmail,
          meetingType: booking.meetingType,
          durationMinutes: booking.durationMinutes,
          timezone: booking.timezone,
          reason: reason || "",
          bookingId: booking.id,
          dashboardUrl: process.env.PUBLIC_DASHBOARD_URL || "https://admin.fi.amanillah.com",
        },
      }

      if (hostTemplateId && !this.isPlaceholderKey(hostTemplateId)) {
        hostPayload.template = hostTemplateId
      }

      await axios.post(
        `${config.plunk.apiUrl}/v1/send`,
        hostPayload,
        {
          headers: {
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      )
      this.logger.info(
        `✔ Host booking cancellation notification delivered to ${adminEmail}`
      )
    } catch (error: any) {
      const errorDetails = axios.isAxiosError(error)
        ? {
            status: error.response?.status,
            statusText: error.response?.statusText,
            responseData: error.response?.data,
            message: error.message,
          }
        : { message: error?.message || String(error) }

      this.logger.error(
        `❌ Failed to send host booking cancellation notification to ${adminEmail}`,
        { errorDetails }
      )
    }
  }

  /**
   * Cancel booking using guest cancellation token
   */
  public async cancelBookingByToken(cancellationToken: string, _reason?: string) {
    const booking = await prisma.booking.findUnique({
      where: { cancellationToken },
    })

    if (!booking) {
      throw new NotFoundError("Booking not found or invalid cancellation token.")
    }

    if (booking.status === BookingStatus.CANCELLED) {
      return booking
    }

    if (booking.googleEventId) {
      await this.googleCalendarService.deleteCalendarEvent(booking.googleEventId)
    }

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.CANCELLED,
      },
    })

    this.logger.info(`✔ Booking cancelled by guest: ${booking.id}`)

    // Dispatch cancellation email
    this.sendBookingCancellationEmails(booking, "guest", _reason).catch((err) => {
      this.logger.error("Failed to send booking cancellation email", {
        error: err instanceof Error ? err.message : err,
      })
    })

    return updated
  }

  /**
   * Admin cancel booking by ID
   */
  public async adminCancelBooking(id: string, _reason?: string) {
    const booking = await prisma.booking.findUnique({
      where: { id },
    })

    if (!booking) {
      throw new NotFoundError("Booking not found.")
    }

    if (booking.googleEventId) {
      await this.googleCalendarService.deleteCalendarEvent(booking.googleEventId)
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
      },
    })

    this.logger.info(`✔ Booking cancelled by admin: ${id}`)

    // Dispatch cancellation email
    this.sendBookingCancellationEmails(booking, "host", _reason).catch((err) => {
      this.logger.error("Failed to send booking cancellation email", {
        error: err instanceof Error ? err.message : err,
      })
    })

    return updated
  }

  /**
   * Admin query bookings with search, pagination, and status filters
   */
  public async adminGetBookings(query: AdminQueryBookingsInput) {
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 10
    const skip = (page - 1) * limit

    const where: any = {}

    if (query.status) {
      where.status = query.status as BookingStatus
    }

    if (query.search) {
      where.OR = [
        { guestName: { contains: query.search, mode: "insensitive" } },
        { guestEmail: { contains: query.search, mode: "insensitive" } },
        { meetingType: { contains: query.search, mode: "insensitive" } },
      ]
    }

    if (query.startDate || query.endDate) {
      const startTimeFilter: { gte?: Date; lte?: Date } = {}
      if (query.startDate) startTimeFilter.gte = new Date(query.startDate)
      if (query.endDate) startTimeFilter.lte = new Date(query.endDate)
      if (Object.keys(startTimeFilter).length > 0) {
        where.startTime = startTimeFilter
      }
    }

    const [total, bookings] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startTime: "desc" },
      }),
    ])

    return {
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Admin dashboard booking statistics
   */
  public async adminGetStats() {
    const now = new Date()

    const [total, upcoming, completed, cancelled] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({
        where: {
          status: BookingStatus.CONFIRMED,
          startTime: { gte: now },
        },
      }),
      prisma.booking.count({
        where: {
          OR: [
            { status: BookingStatus.COMPLETED },
            {
              status: BookingStatus.CONFIRMED,
              endTime: { lt: now },
            },
          ],
        },
      }),
      prisma.booking.count({
        where: { status: BookingStatus.CANCELLED },
      }),
    ])

    return {
      total,
      upcoming,
      completed,
      cancelled,
    }
  }

  /**
   * Get weekly availability schedule
   */
  public async adminGetAvailability() {
    const schedule = await prisma.bookingAvailability.findMany({
      orderBy: { dayOfWeek: "asc" },
    })
    return schedule
  }

  /**
   * Update weekly availability schedule
   */
  public async adminUpdateAvailability(schedule: AvailabilityDayInput[]) {
    const results = []

    for (const item of schedule) {
      const updated = await prisma.bookingAvailability.upsert({
        where: { dayOfWeek: item.dayOfWeek },
        update: {
          startTime: item.startTime,
          endTime: item.endTime,
          isActive: item.isActive,
          slotDuration: item.slotDuration || 30,
          bufferTime: item.bufferTime ?? 15,
          timezone: item.timezone || "UTC",
        },
        create: {
          dayOfWeek: item.dayOfWeek,
          startTime: item.startTime,
          endTime: item.endTime,
          isActive: item.isActive,
          slotDuration: item.slotDuration || 30,
          bufferTime: item.bufferTime ?? 15,
          timezone: item.timezone || "UTC",
        },
      })
      results.push(updated)
    }

    this.logger.info("✔ Booking availability schedule updated")
    return results
  }
}
