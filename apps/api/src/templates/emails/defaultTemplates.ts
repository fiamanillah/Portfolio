// src/templates/emails/defaultTemplates.ts
import { getContactConfirmationLiquidBody } from "./contactConfirmation"
import { getContactNotificationLiquidBody } from "./contactNotification"
import { getSubscriptionConfirmationLiquidBody } from "./subscriptionConfirmation"
import { getNewsletterBroadcastLiquidBody } from "./newsletterBroadcast"
import { getOtpVerificationLiquidBody } from "./otpVerification"
import { getBookingConfirmationLiquidBody } from "./bookingConfirmation"
import { getBookingNotificationLiquidBody } from "./bookingNotification"
import {
  getBookingCancellationLiquidBody,
  getHostCancellationNotificationLiquidBody,
} from "./bookingCancellation"

export interface DefaultTemplateSeed {
  slug: string
  name: string
  description: string
  subject: string
  body: string
  fromName: string
  replyTo: string
  type: "TRANSACTIONAL" | "HEADLESS" | "MARKETING"
  isSystem: boolean
  sampleData: Record<string, any>
}

export const SYSTEM_TEMPLATES: DefaultTemplateSeed[] = [
  {
    slug: "booking-confirmation",
    name: "Booking Attendee Confirmation",
    description:
      "Confirmation email sent to attendee with meeting time, calendar invites and cancellation link.",
    subject:
      "[Confirmed] {{ meetingType | default: '1-on-1 Consultation' }} — Fi Amanillah",
    body: getBookingConfirmationLiquidBody(),
    fromName: "Fi Amanillah",
    replyTo: "fi@amanillah.com",
    type: "HEADLESS",
    isSystem: true,
    sampleData: {
      guestName: "Alex Mercer",
      guestEmail: "alex.mercer@example.com",
      meetingType: "Full Stack Architecture & Cloud Scaling",
      formattedStartTime: "Mon, Aug 24, 2026, 6:30 PM",
      durationMinutes: 30,
      timezone: "Asia/Dhaka",
      googleMeetLink: "https://meet.google.com/abc-defg-hij",
      googleCalUrl: "https://calendar.google.com/calendar/render?action=TEMPLATE",
      outlookCalUrl: "https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose",
      icsDownloadUrl: "https://fi.amanillah.com/api/v1/booking/ics?token=sample_uuid",
      cancelUrl: "https://fi.amanillah.com/#book-call?cancelToken=sample_uuid",
      guestNotes: "Looking forward to discussing database migration strategies.",
    },
  },
  {
    slug: "booking-notification",
    name: "Booking Host Admin Notification",
    description:
      "Instant notification email dispatched to portfolio owner whenever a new consultation is booked.",
    subject:
      "[New Booking] {{ guestName }} booked \"{{ meetingType }}\"",
    body: getBookingNotificationLiquidBody(),
    fromName: "Fi Amanillah Portfolio",
    replyTo: "fi@amanillah.com",
    type: "TRANSACTIONAL",
    isSystem: true,
    sampleData: {
      guestName: "Alex Mercer",
      guestEmail: "alex.mercer@example.com",
      meetingType: "Full Stack Architecture & Cloud Scaling",
      formattedStartTime: "Mon, Aug 24, 2026, 6:30 PM",
      durationMinutes: 30,
      timezone: "Asia/Dhaka",
      googleMeetLink: "https://meet.google.com/abc-defg-hij",
      bookingsPageUrl: "https://admin.fi.amanillah.com/bookings",
      guestNotes: "Looking forward to discussing database migration strategies.",
    },
  },
  {
    slug: "booking-cancellation",
    name: "Booking Cancellation Notice",
    description:
      "Cancellation notice dispatched to guest when a scheduled meeting is cancelled.",
    subject:
      "[Cancelled] {{ meetingType | default: '1-on-1 Consultation' }} — Fi Amanillah",
    body: getBookingCancellationLiquidBody(),
    fromName: "Fi Amanillah",
    replyTo: "fi@amanillah.com",
    type: "HEADLESS",
    isSystem: true,
    sampleData: {
      guestName: "Alex Mercer",
      guestEmail: "alex.mercer@example.com",
      meetingType: "Full Stack Architecture & Cloud Scaling",
      formattedStartTime: "Mon, Aug 24, 2026, 6:30 PM",
      durationMinutes: 30,
      timezone: "Asia/Dhaka",
      reason: "Conflict with another scheduled session.",
      rescheduleUrl: "https://fi.amanillah.com/#book-call",
    },
  },
  {
    slug: "booking-cancellation-admin",
    name: "Booking Host Cancellation Alert",
    description:
      "Instant notification email dispatched to portfolio owner whenever an appointment is cancelled.",
    subject:
      "[Cancelled Booking] {{ guestName }} cancelled \"{{ meetingType }}\"",
    body: getHostCancellationNotificationLiquidBody(),
    fromName: "Fi Amanillah Portfolio",
    replyTo: "fi@amanillah.com",
    type: "TRANSACTIONAL",
    isSystem: true,
    sampleData: {
      guestName: "Alex Mercer",
      guestEmail: "alex.mercer@example.com",
      meetingType: "Full Stack Architecture & Cloud Scaling",
      formattedStartTime: "Mon, Aug 24, 2026, 6:30 PM",
      durationMinutes: 30,
      timezone: "Asia/Dhaka",
      reason: "Conflict with another scheduled session.",
      bookingsPageUrl: "https://admin.fi.amanillah.com/bookings",
    },
  },
  {
    slug: "contact-confirmation",
    name: "Contact Form Confirmation",
    description:
      "Confirmation email sent automatically to users who submit the contact form with a summary copy of their message.",
    subject: "[Confirmation] Thank you for getting in touch - Fi Amanillah",
    body: getContactConfirmationLiquidBody(),
    fromName: "Fi Amanillah",
    replyTo: "fi@amanillah.com",
    type: "HEADLESS",
    isSystem: true,
    sampleData: {
      name: "Alex Mercer",
      email: "alex.mercer@example.com",
      subject: "Collaboration on Distributed Systems",
      message:
        "Hi Fi, I came across your engineering blog and was impressed by your microservices write-up. Would love to discuss a potential advisory role.",
      subscribed: true,
      unsubscribeUrl:
        "https://fi.amanillah.com/unsubscribe?token=sample_token_123",
      manageUrl: "https://fi.amanillah.com/manage",
    },
  },
  {
    slug: "contact-notification",
    name: "Contact Form Admin Notification",
    description:
      "Internal alert sent to portfolio administrator whenever a visitor submits a contact form message.",
    subject:
      "[Portfolio Contact] {{ subject | default: 'New Submission' }} — from {{ name }}",
    body: getContactNotificationLiquidBody(),
    fromName: "Portfolio Notification",
    replyTo: "fi@amanillah.com",
    type: "TRANSACTIONAL",
    isSystem: true,
    sampleData: {
      name: "Alex Mercer",
      email: "alex.mercer@example.com",
      subject: "Collaboration on Distributed Systems",
      message:
        "Hi Fi, I came across your engineering blog and was impressed by your microservices write-up. Would love to discuss a potential advisory role.",
      subscribed: true,
    },
  },
  {
    slug: "subscriber-welcome",
    name: "Subscriber Welcome & Confirmation",
    description:
      "Welcome email sent to newly subscribed visitors with unsubscribe link and engineering blog highlights.",
    subject: "You are subscribed — Fi Amanillah",
    body: getSubscriptionConfirmationLiquidBody(),
    fromName: "Fi Amanillah",
    replyTo: "fi@amanillah.com",
    type: "HEADLESS",
    isSystem: true,
    sampleData: {
      name: "Sarah Connor",
      email: "sarah@cyberdyne.io",
      unsubscribeUrl:
        "https://fi.amanillah.com/unsubscribe?token=sample_token_456",
      manageUrl: "https://fi.amanillah.com/manage",
    },
  },
  {
    slug: "newsletter-broadcast",
    name: "Newsletter Article Broadcast",
    description:
      "Campaign template for announcing new engineering articles, project launches, and system design case studies.",
    subject:
      "{{ title | default: 'New Post: Scaling Real-Time WebSockets' }} — Fi Amanillah",
    body: getNewsletterBroadcastLiquidBody(),
    fromName: "Fi Amanillah",
    replyTo: "fi@amanillah.com",
    type: "MARKETING",
    isSystem: true,
    sampleData: {
      name: "Developer",
      badgeLabel: "Article",
      title: "Building Resilient Distributed Systems",
      subtitle: "A practical guide to fault-tolerance and event sourcing",
      previewText:
        "Exploring event-driven architecture, CQRS, and zero-downtime database migrations.",
      tag: "Architecture",
      articleTitle: "Event Sourcing and CQRS at Scale in Node.js & Go",
      articleExcerpt:
        "How we decoupled message brokers and achieved sub-millisecond query latencies across geographically distributed clusters.",
      articleUrl: "https://fi.amanillah.com/blog/event-sourcing-at-scale",
      unsubscribeUrl:
        "https://fi.amanillah.com/unsubscribe?token=sample_token_789",
      manageUrl: "https://fi.amanillah.com/manage",
    },
  },
  {
    slug: "auth-otp-verification",
    name: "Account Email Verification OTP",
    description:
      "Single-use 6-digit verification passcode dispatched to newly registering visitors to activate their account.",
    subject: "[{{ code }}] Your Email Verification Code — Fi Amanillah",
    body: getOtpVerificationLiquidBody(),
    fromName: "Fi Amanillah",
    replyTo: "fi@amanillah.com",
    type: "HEADLESS",
    isSystem: true,
    sampleData: {
      name: "Alex Mercer",
      email: "alex.mercer@example.com",
      code: "839201",
      purpose: "REGISTER_EMAIL_VERIFY",
      expiresInMinutes: 10,
    },
  },
  {
    slug: "auth-password-reset",
    name: "Password Reset Passcode OTP",
    description:
      "Security passcode dispatched when a user initiates a password reset request.",
    subject: "[{{ code }}] Password Reset Code — Fi Amanillah",
    body: getOtpVerificationLiquidBody(),
    fromName: "Fi Amanillah",
    replyTo: "fi@amanillah.com",
    type: "HEADLESS",
    isSystem: true,
    sampleData: {
      name: "Alex Mercer",
      email: "alex.mercer@example.com",
      code: "472910",
      purpose: "PASSWORD_RESET",
      expiresInMinutes: 10,
    },
  },
]
