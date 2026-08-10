// src/Modules/Contact/ContactDTO.ts
import { z } from "zod";

export const contactSubmissionSchema = {
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    subject: z.string().optional().default("Website Contact Form"),
    message: z.string().min(5, "Message must be at least 5 characters"),
    captchaToken: z.string().optional(),
    hp_field: z.string().optional(),
  }),
};

export type ContactSubmissionDTO = z.infer<typeof contactSubmissionSchema.body>;
