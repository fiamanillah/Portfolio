// src/Modules/Contact/contact.controller.ts
import { Request, Response, NextFunction } from "express"
import { BaseController } from "@/core/BaseController"
import { ContactService, ContactSubmissionPayload } from "./contact.service"
import { BadRequestError } from "@/core/errors/AppError"

export class ContactController extends BaseController {
  constructor(private contactService: ContactService) {
    super()
  }

  public async submitContactForm(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const payload = req.body as ContactSubmissionPayload
      const clientIp =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.socket.remoteAddress

      // ── Stage 2: Honeypot Silent Trap Check ────────────────────────
      if (this.contactService.isHoneypotTriggered(payload.hp_field)) {
        // Return fake success response immediately so the bot stops retrying
        this.sendResponse(req, res, "Your message has been sent successfully.")
        return
      }

      // ── Stage 3: Turnstile CAPTCHA Token Verification ─────────────
      const isCaptchaValid = await this.contactService.verifyTurnstileToken(
        payload.captchaToken,
        clientIp
      )

      if (!isCaptchaValid) {
        throw new BadRequestError(
          "Security check failed. Please refresh and try submitting again."
        )
      }

      // ── Stage 4a: Input Sanitization ──────────────────────────────
      const sanitizedName = this.contactService.sanitizeInput(payload.name)
      const sanitizedSubject = this.contactService.sanitizeInput(
        payload.subject || "Website Inquiry"
      )
      const sanitizedMessage = this.contactService.sanitizeInput(
        payload.message
      )

      // ── Stage 4b: Plunk Email Hygiene & Disposable Check ──────────
      await this.contactService.verifyEmailWithPlunk(payload.email)

      // ── Stage 5a: Delivery of Admin Notification via Plunk ───────
      const formattedPayload = {
        name: sanitizedName,
        email: payload.email.trim(),
        subject: sanitizedSubject,
        message: sanitizedMessage,
        subscribe: Boolean(payload.subscribe),
      }

      // Save submission record & subscriber to Postgres DB & sync Plunk subscriber list
      await this.contactService.saveSubmissionAndSubscription({
        ...formattedPayload,
        ipAddress: clientIp,
      })

      // Fire-and-forget: Send admin notification and confirmation emails in background
      // This prevents Plunk API latency from blocking the user's response
      Promise.all([
        this.contactService.sendContactEmail(formattedPayload),
        this.contactService.sendConfirmationEmail(formattedPayload),
      ]).catch((emailErr) => {
        // Log but don't crash — the submission is already saved
        console.error("Background email delivery error:", emailErr)
      })

      this.sendResponse(
        req,
        res,
        "Thank you! Your message has been sent successfully. I will get back to you soon."
      )
    } catch (error) {
      next(error)
    }
  }
}
