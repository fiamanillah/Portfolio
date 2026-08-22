// apps/api/src/tests/templates.test.ts
import { describe, it, expect } from "bun:test"
import { renderEmailLayout } from "@/templates/emails/baseLayout"
import {
  getContactConfirmationLiquidBody,
  renderContactConfirmationEmail,
} from "@/templates/emails/contactConfirmation"
import {
  getContactNotificationLiquidBody,
  renderContactNotificationEmail,
} from "@/templates/emails/contactNotification"
import {
  getSubscriptionConfirmationLiquidBody,
  renderSubscriptionConfirmationEmail,
} from "@/templates/emails/subscriptionConfirmation"
import { getNewsletterBroadcastLiquidBody } from "@/templates/emails/newsletterBroadcast"
import {
  getOtpVerificationLiquidBody,
  renderOtpEmail,
} from "@/templates/emails/otpVerification"
import {
  getBookingConfirmationLiquidBody,
  renderBookingConfirmationEmail,
} from "@/templates/emails/bookingConfirmation"
import {
  getBookingNotificationLiquidBody,
  renderBookingNotificationEmail,
} from "@/templates/emails/bookingNotification"
import {
  getBookingCancellationLiquidBody,
  getHostCancellationNotificationLiquidBody,
  renderBookingCancellationEmail,
  renderHostCancellationNotificationEmail,
} from "@/templates/emails/bookingCancellation"
import { SYSTEM_TEMPLATES } from "@/templates/emails/defaultTemplates"
import { TemplateRenderer } from "@/services/TemplateRenderer"

describe("Flat White-Themed Email Templates & Templating System", () => {
  const emojiRegex =
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}]/u

  describe("Base Email Layout (baseLayout.ts)", () => {
    it("should render a clean white-themed layout with 0 border-radius", () => {
      const { html, listUnsubscribeHeader } = renderEmailLayout({
        title: "Test System Notification",
        subtitle: "A subtitle description",
        badgeLabel: "System",
        contentHtml: "<p>This is test content.</p>",
        previewText: "Test preview snippet",
        unsubscribeUrl: "https://fi.amanillah.com/unsubscribe?token=123",
      })

      expect(html).toContain("<!DOCTYPE html>")
      expect(html).toContain("Fi Amanillah")
      expect(html).toContain("fi.amanillah.com")
      expect(html).toContain("https://assets.fi.amanillah.com/general/2026/08/logo-25d8b825.png")
      expect(html).toContain('alt="Fi Amanillah"')
      expect(html).toContain("This is test content.")
      expect(html).toContain("background-color: #f8fafc")
      expect(html).toContain("background-color: #ffffff")
      expect(html).toContain("border: 1px solid #e2e8f0")
      expect(html).toContain("border-radius: 0")

      // Should not contain non-zero border-radii
      expect(html).not.toMatch(/border-radius:\s*[1-9]/)
      // Should not contain thick borders
      expect(html).not.toMatch(/border-(left|right|top|bottom):\s*[2-9]/)
      // Should not contain emojis
      expect(html).not.toMatch(emojiRegex)

      expect(listUnsubscribeHeader).toBe(
        "<https://fi.amanillah.com/unsubscribe?token=123>"
      )
    })
  })

  describe("Contact Confirmation Template (contactConfirmation.ts)", () => {
    it("should render concrete runtime email without emojis and with 0 border-radius", () => {
      const res = renderContactConfirmationEmail({
        name: "Alex Mercer",
        email: "alex@example.com",
        subject: "Advisory Role",
        message: "Hello Fi, let us collaborate on distributed architectures.",
        subscribed: true,
        unsubscribeUrl: "https://fi.amanillah.com/unsubscribe?token=abc",
      })

      expect(res.subject).toBe(
        "[Confirmation] Thank you for getting in touch - Fi Amanillah"
      )
      expect(res.html).toContain("Alex Mercer")
      expect(res.html).toContain("Advisory Role")
      expect(res.html).toContain("collaborate on distributed architectures")
      expect(res.html).toContain("[SUBSCRIBED]")
      expect(res.html).toContain("border-radius: 0")
      expect(res.html).not.toMatch(/border-radius:\s*[1-9]/)
      expect(res.html).not.toMatch(/border-(left|right|top|bottom):\s*[2-9]/)
      expect(res.html).not.toMatch(emojiRegex)
      expect(res.subject).not.toMatch(emojiRegex)
    })

    it("should render valid Liquid body template for Plunk synchronization", async () => {
      const liquidBody = getContactConfirmationLiquidBody()
      expect(liquidBody).toContain("{{ name | default:")
      expect(liquidBody).toContain("{{ message | default:")

      const rendered = await TemplateRenderer.renderTemplate(
        "Subject",
        liquidBody,
        {
          name: "John Doe",
          subject: "Project Inquiry",
          message: "Testing liquid interpolation",
          subscribed: false,
        }
      )

      expect(rendered.success).toBe(true)
      expect(rendered.body).toContain("John Doe")
      expect(rendered.body).toContain("Project Inquiry")
      expect(rendered.body).toContain("Testing liquid interpolation")
      expect(rendered.body).not.toContain("[SUBSCRIBED]")
      expect(rendered.body).not.toMatch(emojiRegex)
    })
  })

  describe("Contact Notification Template (contactNotification.ts)", () => {
    it("should render admin notification with uniform borders and clean reply button", () => {
      const res = renderContactNotificationEmail({
        name: "Sarah Connor",
        email: "sarah@cyberdyne.io",
        subject: "Critical Infrastructure",
        message: "Need urgent consultation regarding server resilience.",
        subscribed: true,
      })

      expect(res.subject).toContain("Sarah Connor")
      expect(res.subject).toContain("Critical Infrastructure")
      expect(res.html).toContain("sarah@cyberdyne.io")
      expect(res.html).toContain("Yes, Opted In")
      expect(res.html).toContain("Reply to Sarah Connor -&gt;")
      expect(res.html).toContain("border-radius: 0")
      expect(res.html).not.toMatch(/border-radius:\s*[1-9]/)
      expect(res.html).not.toMatch(/border-(left|right|top|bottom):\s*[2-9]/)
      expect(res.html).not.toMatch(emojiRegex)
    })

    it("should render valid Liquid body for notification sync", async () => {
      const liquidBody = getContactNotificationLiquidBody()
      const rendered = await TemplateRenderer.renderTemplate(
        "Subject",
        liquidBody,
        {
          name: "Dev Lead",
          email: "lead@example.com",
          subject: "Architecture Review",
          message: "Looking forward to your feedback.",
          subscribed: false,
        }
      )

      expect(rendered.success).toBe(true)
      expect(rendered.body).toContain("Dev Lead")
      expect(rendered.body).toContain("Architecture Review")
      expect(rendered.body).toContain("lead@example.com")
      expect(rendered.body).not.toMatch(emojiRegex)
    })
  })

  describe("Subscription Confirmation Template (subscriptionConfirmation.ts)", () => {
    it("should render subscriber confirmation email with clean styling", () => {
      const res = renderSubscriptionConfirmationEmail({
        email: "subscriber@domain.com",
        name: "Elena Rostova",
        unsubscribeUrl: "https://fi.amanillah.com/unsub",
      })

      expect(res.subject).toBe("You are subscribed — Fi Amanillah")
      expect(res.html).toContain("Elena Rostova")
      expect(res.html).toContain("subscriber@domain.com")
      expect(res.html).toContain("Read Engineering Blog -&gt;")
      expect(res.html).toContain("border-radius: 0")
      expect(res.html).not.toMatch(/border-radius:\s*[1-9]/)
      expect(res.html).not.toMatch(/border-(left|right|top|bottom):\s*[2-9]/)
      expect(res.html).not.toMatch(emojiRegex)
    })

    it("should render valid Liquid body template for subscriber confirmation", async () => {
      const liquidBody = getSubscriptionConfirmationLiquidBody()
      const rendered = await TemplateRenderer.renderTemplate(
        "Subject",
        liquidBody,
        {
          email: "test@example.com",
          name: "Marcus",
        }
      )

      expect(rendered.success).toBe(true)
      expect(rendered.body).toContain("Marcus")
      expect(rendered.body).toContain("test@example.com")
      expect(rendered.body).not.toMatch(emojiRegex)
    })
  })

  describe("Newsletter Broadcast Template (newsletterBroadcast.ts)", () => {
    it("should render newsletter broadcast with 0 border-radius and clean card", async () => {
      const liquidBody = getNewsletterBroadcastLiquidBody()
      const rendered = await TemplateRenderer.renderTemplate(
        "{{ title }} — Fi Amanillah",
        liquidBody,
        {
          name: "Community Member",
          title: "Microservices with Zero Downtime",
          tag: "Systems",
          articleTitle: "Building Event-Driven Engines in Go",
          articleExcerpt:
            "A comprehensive breakdown of stream processing at scale.",
          articleUrl: "https://fi.amanillah.com/blog/event-driven-go",
          unsubscribeUrl: "https://fi.amanillah.com/unsubscribe",
        }
      )

      expect(rendered.success).toBe(true)
      expect(rendered.subject).toBe(
        "Microservices with Zero Downtime — Fi Amanillah"
      )
      expect(rendered.body).toContain("Community Member")
      expect(rendered.body).toContain("Systems")
      expect(rendered.body).toContain("Building Event-Driven Engines in Go")
      expect(rendered.body).toContain("Read Article -&gt;")
      expect(rendered.body).toContain("border-radius: 0")
      expect(rendered.body).not.toMatch(/border-radius:\s*[1-9]/)
      expect(rendered.body).not.toMatch(/border-(left|right|top|bottom):\s*[2-9]/)
      expect(rendered.body).not.toMatch(emojiRegex)
    })
  })

  describe("OTP Verification Template (otpVerification.ts)", () => {
    it("should render registration OTP email cleanly", () => {
      const res = renderOtpEmail({
        email: "alex@example.com",
        code: "948201",
        purpose: "REGISTER_EMAIL_VERIFY",
        expiresInMinutes: 10,
      })

      expect(res.subject).toBe(
        "[948201] Your Email Verification Code — Fi Amanillah"
      )
      expect(res.html).toContain("948201")
      expect(res.html).toContain("SECURITY PASSCODE")
      expect(res.html).toContain("10 minutes")
      expect(res.html).toContain("border-radius: 0")
      expect(res.html).not.toMatch(/border-radius:\s*[1-9]/)
      expect(res.html).not.toMatch(/border-(left|right|top|bottom):\s*[2-9]/)
      expect(res.html).not.toMatch(emojiRegex)
    })

    it("should render password reset OTP email cleanly", () => {
      const res = renderOtpEmail({
        email: "alex@example.com",
        code: "123456",
        purpose: "PASSWORD_RESET",
        expiresInMinutes: 15,
      })

      expect(res.subject).toBe("[123456] Password Reset Code — Fi Amanillah")
      expect(res.html).toContain("123456")
      expect(res.html).toContain("Reset Your Password")
      expect(res.html).toContain("15 minutes")
      expect(res.html).not.toMatch(emojiRegex)
    })

    it("should render valid Liquid body for OTP templates", async () => {
      const liquidBody = getOtpVerificationLiquidBody()
      const rendered = await TemplateRenderer.renderTemplate(
        "[{{ code }}] Verification",
        liquidBody,
        {
          name: "Developer",
          code: "582910",
          purpose: "REGISTER_EMAIL_VERIFY",
          expiresInMinutes: 10,
        }
      )

      expect(rendered.success).toBe(true)
      expect(rendered.subject).toBe("[582910] Verification")
      expect(rendered.body).toContain("582910")
      expect(rendered.body).not.toMatch(emojiRegex)
    })
  })

  describe("Booking Email Templates", () => {
    it("should render booking confirmation email cleanly with Meet and cancel links", () => {
      const res = renderBookingConfirmationEmail({
        guestName: "Alex Rivera",
        guestEmail: "alex@example.com",
        meetingType: "1-on-1 Consultation",
        startTime: new Date("2026-08-25T14:00:00Z"),
        endTime: new Date("2026-08-25T14:30:00Z"),
        durationMinutes: 30,
        timezone: "UTC",
        googleMeetLink: "https://meet.google.com/abc-defg-hij",
        cancellationToken: "550e8400-e29b-41d4-a716-446655440000",
        guestNotes: "Looking forward to speaking about cloud architecture.",
        webUrl: "https://fi.amanillah.com",
      })

      expect(res.subject).toContain("1-on-1 Consultation")
      expect(res.subject).toContain("Fi Amanillah")
      expect(res.html).toContain("Alex Rivera")
      expect(res.html).toContain("https://meet.google.com/abc-defg-hij")
      expect(res.html).toContain("550e8400-e29b-41d4-a716-446655440000")
      expect(res.html).toContain("border-radius: 0")
      expect(res.html).not.toMatch(emojiRegex)
    })

    it("should render booking host notification email cleanly", () => {
      const res = renderBookingNotificationEmail({
        guestName: "Elena Rostova",
        guestEmail: "elena@example.com",
        meetingType: "Architecture Review",
        startTime: new Date("2026-08-25T15:00:00Z"),
        endTime: new Date("2026-08-25T15:45:00Z"),
        durationMinutes: 45,
        timezone: "UTC",
        googleMeetLink: "https://meet.google.com/xyz-uvwx-rst",
        bookingId: "booking_123",
        dashboardUrl: "https://admin.fi.amanillah.com",
      })

      expect(res.subject).toContain("Elena Rostova")
      expect(res.subject).toContain("Architecture Review")
      expect(res.html).toContain("Elena Rostova")
      expect(res.html).toContain("elena@example.com")
      expect(res.html).toContain("https://admin.fi.amanillah.com/bookings")
      expect(res.html).toContain("border-radius: 0")
    })

    it("should render booking cancellation email cleanly", () => {
      const res = renderBookingCancellationEmail({
        guestName: "Alex Rivera",
        guestEmail: "alex@example.com",
        meetingType: "1-on-1 Consultation",
        startTime: new Date("2026-08-25T14:00:00Z"),
        endTime: new Date("2026-08-25T14:30:00Z"),
        durationMinutes: 30,
        timezone: "UTC",
        reason: "Scheduling conflict.",
        webUrl: "https://fi.amanillah.com",
      })

      expect(res.subject).toContain("[Cancelled]")
      expect(res.subject).toContain("1-on-1 Consultation")
      expect(res.html).toContain("Alex Rivera")
      expect(res.html).toContain("Scheduling conflict.")
      expect(res.html).toContain("Schedule New Session")
      expect(res.html).toContain("border-radius: 0")
      expect(res.html).not.toMatch(emojiRegex)
    })

    it("should render host booking cancellation notification email cleanly", () => {
      const res = renderHostCancellationNotificationEmail({
        guestName: "Alex Rivera",
        guestEmail: "alex@example.com",
        meetingType: "1-on-1 Consultation",
        startTime: new Date("2026-08-25T14:00:00Z"),
        endTime: new Date("2026-08-25T14:30:00Z"),
        durationMinutes: 30,
        timezone: "UTC",
        reason: "Client had an urgent conflict.",
        cancelledBy: "guest",
        bookingId: "booking_123",
        dashboardUrl: "https://admin.fi.amanillah.com",
      })

      expect(res.subject).toContain("[Cancelled Booking]")
      expect(res.subject).toContain("Alex Rivera")
      expect(res.html).toContain("Alex Rivera")
      expect(res.html).toContain("alex@example.com")
      expect(res.html).toContain("Client had an urgent conflict.")
      expect(res.html).toContain("https://admin.fi.amanillah.com/bookings")
      expect(res.html).toContain("border-radius: 0")
      expect(res.html).not.toMatch(emojiRegex)
    })
  })

  describe("System Default Templates Definitions (defaultTemplates.ts)", () => {
    it("should ensure all 10 SYSTEM_TEMPLATES render without error", async () => {
      expect(SYSTEM_TEMPLATES.length).toBe(10)

      for (const tpl of SYSTEM_TEMPLATES) {
        expect(tpl.subject).not.toMatch(emojiRegex)
        expect(tpl.name).not.toMatch(emojiRegex)
        expect(tpl.description).not.toMatch(emojiRegex)

        const rendered = await TemplateRenderer.renderTemplate(
          tpl.subject,
          tpl.body,
          tpl.sampleData
        )

        expect(rendered.success).toBe(true)
        expect(rendered.subject.length).toBeGreaterThan(0)
        expect(rendered.body.length).toBeGreaterThan(0)
        expect(rendered.body).toContain("border-radius: 0")
        expect(rendered.body).not.toMatch(/border-radius:\s*[1-9]/)
        expect(rendered.body).not.toMatch(
          /border-(left|right|top|bottom):\s*[2-9]/
        )
        expect(rendered.body).not.toMatch(emojiRegex)
      }
    })
  })
})
