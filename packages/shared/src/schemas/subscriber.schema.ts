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
  status: z.enum(["subscribed", "unsubscribed"]).optional(),
});

export const changeEmailSchema = z.object({
  oldEmail: z.string().email("Invalid current email address").optional(),
  token: z.string().optional(),
  newEmail: z.string().email("Invalid new email address"),
  captchaToken: z.string().optional(),
  hp_field: z.string().optional(),
});
