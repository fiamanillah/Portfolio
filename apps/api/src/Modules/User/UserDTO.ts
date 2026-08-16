// src/Modules/User/UserDTO.ts
import {
  updateProfileSchema as sharedUpdateProfileSchema,
  changePasswordSchema as sharedChangePasswordSchema,
  updateSubscriptionSchema as sharedUpdateSubscriptionSchema,
  adminUpdateUserRoleSchema as sharedAdminUpdateUserRoleSchema,
  adminUserQuerySchema as sharedAdminUserQuerySchema,
} from "@workspace/shared";

export * from "@workspace/shared";

export const updateProfileSchema = {
  body: sharedUpdateProfileSchema,
};

export const changePasswordSchema = {
  body: sharedChangePasswordSchema,
};

export const updateSubscriptionSchema = {
  body: sharedUpdateSubscriptionSchema,
};

export const adminUpdateUserRoleSchema = {
  body: sharedAdminUpdateUserRoleSchema,
};

export const adminUserQuerySchema = {
  query: sharedAdminUserQuerySchema,
};

export type UpdateProfileDTO = import("@workspace/shared").UpdateProfileInput;
export type ChangePasswordDTO = import("@workspace/shared").ChangePasswordInput;
export type UpdateSubscriptionDTO = import("@workspace/shared").UpdateSubscriptionInput;
export type AdminUpdateUserRoleDTO = import("@workspace/shared").AdminUpdateUserRoleInput;
export type AdminUserQueryDTO = import("@workspace/shared").AdminUserQueryInput;
