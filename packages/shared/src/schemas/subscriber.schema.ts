// packages/shared/src/schemas/subscriber.schema.ts
import { z } from "zod";

export const subscriberStatusEnumSchema = z.enum(["subscribed", "unsubscribed", "pending"]);

export const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional(),
  source: z.string().optional().default("hero_section"),
  captchaToken: z.string().optional(),
  hp_field: z.string().optional(),
});

export const unsubscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
  captchaToken: z.string().optional(),
  hp_field: z.string().optional(),
});

export const updateSubscriberSchema = z.object({
  name: z.string().optional(),
  status: z.enum(["subscribed", "unsubscribed", "pending"]).optional(),
  source: z.string().optional(),
});

export const changeEmailSchema = z.object({
  oldEmail: z.string().email("Invalid current email address").optional(),
  token: z.string().optional(),
  newEmail: z.string().email("Invalid new email address"),
  captchaToken: z.string().optional(),
  hp_field: z.string().optional(),
});

export const adminSubscriberQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(20).optional(),
  search: z.string().optional(),
  status: z.enum(["ALL", "subscribed", "unsubscribed", "pending"]).optional(),
  source: z.string().optional(),
  sortBy: z.enum(["subscribedAt", "updatedAt", "email", "name", "status", "source"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});


export const adminCreateSubscriberSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional(),
  status: z.enum(["subscribed", "unsubscribed", "pending"]).default("subscribed"),
  source: z.string().optional().default("admin_portal"),
  sendWelcomeEmail: z.boolean().optional().default(false),
});

export const adminBulkUpdateStatusSchema = z.object({
  subscriberIds: z.array(z.string().uuid("Invalid subscriber ID")).min(1, "At least one subscriber ID must be provided"),
  status: z.enum(["subscribed", "unsubscribed", "pending"]),
});

export const adminBulkDeleteSchema = z.object({
  subscriberIds: z.array(z.string().uuid("Invalid subscriber ID")).min(1, "At least one subscriber ID must be provided"),
});

