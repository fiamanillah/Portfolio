// packages/shared/src/types/subscriber.ts
import { z } from "zod";
import {
  subscriberStatusEnumSchema,
  subscribeSchema,
  unsubscribeSchema,
  updateSubscriberSchema,
  changeEmailSchema,
  adminSubscriberQuerySchema,
  adminCreateSubscriberSchema,
  adminBulkUpdateStatusSchema,
  adminBulkDeleteSchema,
} from "../schemas/subscriber.schema";

export type SubscriberStatus = z.infer<typeof subscriberStatusEnumSchema>;
export type SubscribePayload = z.infer<typeof subscribeSchema>;
export type UnsubscribePayload = z.infer<typeof unsubscribeSchema>;
export type UpdateSubscriberPayload = z.infer<typeof updateSubscriberSchema>;
export type ChangeEmailPayload = z.infer<typeof changeEmailSchema>;
export type AdminSubscriberQuery = z.infer<typeof adminSubscriberQuerySchema>;
export type AdminCreateSubscriberPayload = z.infer<typeof adminCreateSubscriberSchema>;
export type AdminBulkUpdateStatusPayload = z.infer<typeof adminBulkUpdateStatusSchema>;
export type AdminBulkDeletePayload = z.infer<typeof adminBulkDeleteSchema>;

export interface SubscriberItem {
  id: string;
  email: string;
  name: string | null;
  status: "subscribed" | "unsubscribed" | "pending" | string;
  source: string;
  subscribedAt: string | Date;
  updatedAt: string | Date;
}

export interface SubscriberStats {
  total: number;
  subscribed: number;
  unsubscribed: number;
  pending: number;
  recentSubscribers7d: number;
  confirmationRate: number;
}

