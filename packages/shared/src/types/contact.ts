// packages/shared/src/types/contact.ts
import { z } from "zod";
import { contactSubmissionSchema } from "../schemas/contact.schema";

export type ContactSubmissionPayload = z.infer<typeof contactSubmissionSchema>;
