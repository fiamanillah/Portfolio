// src/Modules/Subscriber/SubscriberDTO.ts
import { z } from "zod";

export const subscribeSchema = {
  body: z.object({
    email: z.string().email("Invalid email address"),
    name: z.string().optional(),
    source: z.string().optional().default("hero_section"),
    captchaToken: z.string().optional(),
    hp_field: z.string().optional(),
  }),
};

export const unsubscribeSchema = {
  body: z.object({
    email: z.string().email("Invalid email address"),
  }),
};

export const updateSubscriberSchema = {
  body: z.object({
    name: z.string().optional(),
    status: z.enum(["subscribed", "unsubscribed"]).optional(),
  }),
};

export const changeEmailSchema = {
  body: z.object({
    oldEmail: z.string().email("Invalid current email address").optional(),
    token: z.string().optional(),
    newEmail: z.string().email("Invalid new email address"),
  }),
};

export type SubscribeDTO = z.infer<typeof subscribeSchema.body>;
export type UnsubscribeDTO = z.infer<typeof unsubscribeSchema.body>;
export type UpdateSubscriberDTO = z.infer<typeof updateSubscriberSchema.body>;
export type ChangeEmailDTO = z.infer<typeof changeEmailSchema.body>;

