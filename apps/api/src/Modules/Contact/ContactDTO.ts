// src/Modules/Contact/ContactDTO.ts
import { contactSubmissionSchema as sharedContactSubmissionSchema } from "@workspace/shared";

export * from "@workspace/shared";

export const contactSubmissionSchema = {
  body: sharedContactSubmissionSchema,
};

export type ContactSubmissionDTO = import("@workspace/shared").ContactSubmissionPayload;
