import { Request } from "express";
import { AuthenticatedUserPayload } from "@workspace/shared";

export type { AuthenticatedUserPayload };

declare global {
  namespace Express {
    interface Request {
      id: string;
      timedout?: boolean;
      abortSignal: AbortSignal;
      validatedBody?: any;
      validatedQuery?: any;
      validatedParams?: any;
      user?: AuthenticatedUserPayload;
    }
  }
}
