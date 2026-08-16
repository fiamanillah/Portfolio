import {
  subscribeSchema as sharedSubscribeSchema,
  unsubscribeSchema as sharedUnsubscribeSchema,
  updateSubscriberSchema as sharedUpdateSubscriberSchema,
  changeEmailSchema as sharedChangeEmailSchema,
  adminSubscriberQuerySchema as sharedAdminSubscriberQuerySchema,
  adminCreateSubscriberSchema as sharedAdminCreateSubscriberSchema,
  adminBulkUpdateStatusSchema as sharedAdminBulkUpdateStatusSchema,
  adminBulkDeleteSchema as sharedAdminBulkDeleteSchema,
} from "@workspace/shared"

export * from "@workspace/shared"

export const subscribeSchema = {
  body: sharedSubscribeSchema,
}

export const unsubscribeSchema = {
  body: sharedUnsubscribeSchema,
}

export const updateSubscriberSchema = {
  body: sharedUpdateSubscriberSchema,
}

export const changeEmailSchema = {
  body: sharedChangeEmailSchema,
}

export const adminSubscriberQuerySchema = {
  query: sharedAdminSubscriberQuerySchema,
}

export const adminCreateSubscriberSchema = {
  body: sharedAdminCreateSubscriberSchema,
}

export const adminBulkUpdateStatusSchema = {
  body: sharedAdminBulkUpdateStatusSchema,
}

export const adminBulkDeleteSchema = {
  body: sharedAdminBulkDeleteSchema,
}

export type SubscribeDTO = import("@workspace/shared").SubscribePayload
export type UnsubscribeDTO = import("@workspace/shared").UnsubscribePayload
export type UpdateSubscriberDTO =
  import("@workspace/shared").UpdateSubscriberPayload
export type ChangeEmailDTO = import("@workspace/shared").ChangeEmailPayload
export type AdminSubscriberQueryDTO =
  import("@workspace/shared").AdminSubscriberQuery
export type AdminCreateSubscriberDTO =
  import("@workspace/shared").AdminCreateSubscriberPayload
export type AdminBulkUpdateStatusDTO =
  import("@workspace/shared").AdminBulkUpdateStatusPayload
export type AdminBulkDeleteDTO =
  import("@workspace/shared").AdminBulkDeletePayload
