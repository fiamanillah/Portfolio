// src/templates/emails/defaultTemplates.ts
import { getContactConfirmationLiquidBody } from "./contactConfirmation"
import { getContactNotificationLiquidBody } from "./contactNotification"
import { getSubscriptionConfirmationLiquidBody } from "./subscriptionConfirmation"
import { getNewsletterBroadcastLiquidBody } from "./newsletterBroadcast"
import { getOtpVerificationLiquidBody } from "./otpVerification"

export interface SystemTemplateDefinition {
  slug: string
  name: string
  description: string
  subject: string
  body: string
  from?: string
  fromName?: string
  replyTo?: string
  type: "TRANSACTIONAL" | "MARKETING" | "HEADLESS"
  isSystem: boolean
  sampleData: Record<string, any>
}

export const SYSTEM_TEMPLATES: SystemTemplateDefinition[] = [
  {
    slug: "contact-confirmation",
    name: "Contact Form Confirmation",
    description:
      "Confirmation email sent automatically to users who submit the contact form with a summary copy of their message.",
    subject: "[Confirmation] Thank you for getting in touch! - Fi Amanillah",
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
    subject: "You're subscribed — Fi Amanillah",
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
      badgeLabel: "New Article",
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
