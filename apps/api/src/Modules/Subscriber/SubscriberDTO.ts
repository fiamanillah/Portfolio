// src/Modules/Subscriber/SubscriberDTO.ts
import {
  subscribeSchema as sharedSubscribeSchema,
  unsubscribeSchema as sharedUnsubscribeSchema,
  updateSubscriberSchema as sharedUpdateSubscriberSchema,
  changeEmailSchema as sharedChangeEmailSchema,
} from "@workspace/shared";

export * from "@workspace/shared";

export const subscribeSchema = {
  body: sharedSubscribeSchema,
};

export const unsubscribeSchema = {
  body: sharedUnsubscribeSchema,
};

export const updateSubscriberSchema = {
  body: sharedUpdateSubscriberSchema,
};

export const changeEmailSchema = {
  body: sharedChangeEmailSchema,
};

export type SubscribeDTO = import("@workspace/shared").SubscribePayload;
export type UnsubscribeDTO = import("@workspace/shared").UnsubscribePayload;
export type UpdateSubscriberDTO = import("@workspace/shared").UpdateSubscriberPayload;
export type ChangeEmailDTO = import("@workspace/shared").ChangeEmailPayload;
