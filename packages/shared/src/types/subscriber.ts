// packages/shared/src/types/subscriber.ts
import { z } from "zod";
import {
  subscriberStatusEnumSchema,
  subscribeSchema,
  unsubscribeSchema,
  updateSubscriberSchema,
  changeEmailSchema,
} from "../schemas/subscriber.schema";

export type SubscriberStatus = z.infer<typeof subscriberStatusEnumSchema>;
export type SubscribePayload = z.infer<typeof subscribeSchema>;
export type UnsubscribePayload = z.infer<typeof unsubscribeSchema>;
export type UpdateSubscriberPayload = z.infer<typeof updateSubscriberSchema>;
export type ChangeEmailPayload = z.infer<typeof changeEmailSchema>;
