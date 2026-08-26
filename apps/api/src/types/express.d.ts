import { Request } from "express"
import { AuthenticatedUserPayload } from "@workspace/shared"

export type { AuthenticatedUserPayload }

declare global {
  interface BigInt {
    toJSON(): number
  }

  namespace Express {
    interface Request {
      id: string
      timedout?: boolean
      abortSignal: AbortSignal
      validatedBody?: unknown
      validatedQuery?: unknown
      validatedParams?: unknown
      user?: AuthenticatedUserPayload
    }
  }
}
