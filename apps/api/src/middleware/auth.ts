// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "@/core/config";
import { AuthenticationError, AuthorizationError } from "@/core/errors/AppError";
import { prisma, Role } from "@workspace/db";
import { AuthenticatedUserPayload } from "@/types/express";

export interface JwtTokenPayload {
  userId: string;
  email: string;
  role: Role;
  username: string;
  iat?: number;
  exp?: number;
  iss?: string;
}

/**
 * Extracts bearer token from Authorization header or cookie.
 */
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    if (token) return token;
  }

  // Cookie fallback
  if (req.cookies?.auth_token) {
    return req.cookies.auth_token;
  }
  if (req.cookies?.token) {
    return req.cookies.token;
  }

  return null;
}

/**
 * Middleware that strictly enforces JWT authentication.
 */
export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);
    if (!token) {
      throw new AuthenticationError("Authentication token is missing. Please sign in.");
    }

    const secret = config.security.jwt.secret || "portfolio-auth-jwt-secret";
    let decoded: JwtTokenPayload;

    try {
      decoded = jwt.verify(token, secret, {
        issuer: config.security.jwt.issuer,
      }) as JwtTokenPayload;
    } catch (err: any) {
      if (err?.name === "TokenExpiredError") {
        throw new AuthenticationError("Authentication session expired. Please sign in again.");
      }
      throw new AuthenticationError("Invalid or corrupted authentication token.");
    }

    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        avatar: true,
        isEmailVerified: true,
      },
    });

    if (!user) {
      throw new AuthenticationError("User account no longer exists.");
    }

    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
    };

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Non-blocking optional authentication middleware.
 * Attaches req.user if a valid token is provided; otherwise proceeds as guest.
 */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);
    if (!token) {
      return next();
    }

    const secret = config.security.jwt.secret || "portfolio-auth-jwt-secret";
    const decoded = jwt.verify(token, secret, {
      issuer: config.security.jwt.issuer,
    }) as JwtTokenPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        avatar: true,
        isEmailVerified: true,
      },
    });

    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
      };
    }

    next();
  } catch {
    // Silently continue for optional auth
    next();
  }
}

/**
 * Role-Based Access Control (RBAC) Guard.
 * Usage: requireRole(Role.ADMIN), requireRole(Role.ADMIN, Role.MODERATOR)
 */
export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthenticationError("Authentication required to perform this action."));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AuthorizationError(
          `Forbidden: Insufficient privileges. Required role: ${allowedRoles.join(" or ")}.`
        )
      );
    }

    next();
  };
}

/**
 * Resource ownership guard: Allows action if caller is ADMIN or target userId matches req.user.id.
 */
export function requireSelfOrAdmin(idParamKey: string = "id") {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthenticationError("Authentication required."));
    }

    const targetId = req.params[idParamKey];
    if (req.user.role === Role.ADMIN || req.user.id === targetId) {
      return next();
    }

    return next(new AuthorizationError("Forbidden: You can only modify your own account resources."));
  };
}
