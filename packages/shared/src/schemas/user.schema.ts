// packages/shared/src/schemas/user.schema.ts
import { z } from "zod";

export const roleEnumSchema = z.enum(["ADMIN", "MODERATOR", "AUTHOR", "USER"]);

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .transform((v) => v.trim())
    .optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .transform((v) => v.trim().toLowerCase())
    .optional(),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
  avatar: z.string().optional(),
  role: z.string().max(100, "Headline/Role cannot exceed 100 characters").optional(),
  headline: z.string().max(120, "Headline cannot exceed 120 characters").optional(),
  location: z.string().max(100).optional(),
  website: z.string().max(200).optional(),
  githubUrl: z.string().max(200).optional(),
  twitterUrl: z.string().max(200).optional(),
  linkedinUrl: z.string().max(200).optional(),
  pronouns: z.string().max(50).optional(),
  customStatus: z.string().max(150).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export const updateSubscriptionSchema = z.object({
  subscribedToNewsletter: z.boolean(),
});

export const adminUpdateUserRoleSchema = z.object({
  role: roleEnumSchema,
  badge: z.string().max(50).optional(),
});

export const adminUserQuerySchema = z.object({
  page: z.union([z.string(), z.number()]).optional().transform((val) => {
    if (typeof val === "number") return val;
    return val ? Math.max(1, parseInt(val, 10)) : 1;
  }),
  limit: z.union([z.string(), z.number()]).optional().transform((val) => {
    if (typeof val === "number") return val;
    return val ? Math.min(100, Math.max(1, parseInt(val, 10))) : 20;
  }),
  search: z.string().optional(),
  role: z.enum(["ALL", "ADMIN", "MODERATOR", "AUTHOR", "USER"]).optional(),
  sortBy: z.enum(["createdAt", "name", "email", "username", "role"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

