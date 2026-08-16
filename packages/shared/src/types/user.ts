// packages/shared/src/types/user.ts
import { z } from "zod";
import {
  roleEnumSchema,
  updateProfileSchema,
  changePasswordSchema,
  updateSubscriptionSchema,
  adminUpdateUserRoleSchema,
  adminUserQuerySchema,
} from "../schemas/user.schema";

export type Role = z.infer<typeof roleEnumSchema>;

export const ROLES: readonly Role[] = ["ADMIN", "MODERATOR", "AUTHOR", "USER"] as const;

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  role?: Role | string;
  headline?: string | null;
  badge?: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  githubUrl?: string | null;
  twitterUrl?: string | null;
  linkedinUrl?: string | null;
  pronouns?: string | null;
  customStatus?: string | null;
  isEmailVerified?: boolean;
  subscribedToNewsletter?: boolean;
  twoFactorEnabled?: boolean;
  joinedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string | null;
}

export interface UserProfile extends AuthUser {}

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
export type AdminUpdateUserRoleInput = z.infer<typeof adminUpdateUserRoleSchema>;
export type AdminUserQueryInput = z.infer<typeof adminUserQuerySchema>;
