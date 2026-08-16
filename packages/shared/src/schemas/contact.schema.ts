// packages/shared/src/schemas/contact.schema.ts
import { z } from "zod";

export const contactSubmissionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().optional().default("Website Contact Form"),
  message: z.string().min(5, "Message must be at least 5 characters"),
  subscribe: z.boolean().optional().default(false),
  captchaToken: z.string().optional(),
  hp_field: z.string().optional(),
});
