import { Request, Response, NextFunction } from "express";
import * as schema from "../db/schema";
import { eq, and } from "drizzle-orm";
import * as jose from "jose";
import { getKeyPair } from "../lib/keys";
import { logger } from "../lib/logger";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.header("Authorization");
  const userId = req.header("X-User-Id");
  const organizationId = req.params.organization_id as string;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);

    if (token.includes(".")) {
      try {
        const { publicKey } = await getKeyPair();
        const { payload } = await jose.jwtVerify(token, publicKey, {
          issuer: "blerp",
          audience: "blerp-api",
        });

        // M2M token: has client_id + scope
        if (payload.client_id && payload.scope) {
          req.m2m = {
            clientId: payload.client_id as string,
            scopes: (payload.scope as string).split(" "),
          };
          next();
          return;
        }

        // User session token: has sub (user ID)
        if (payload.sub) {
          req.user = { id: payload.sub };
          if (organizationId) {
            const db = req.tenantDb!;
            const membership = await db.query.memberships.findFirst({
              where: and(
                eq(schema.memberships.userId, payload.sub),
                eq(schema.memberships.organizationId, organizationId),
              ),
            });
            if (membership) {
              req.membership = { id: membership.id, role: membership.role };
            }
          }
          next();
          return;
        }
      } catch {
        // Bearer token provided but JWT verification failed — reject
        res.status(401).json({ error: "Invalid or expired token" });
        return;
      }
    }
  }

  // X-User-Id fallback: only allowed in non-production environments
  if (userId) {
    if (process.env.NODE_ENV === "production") {
      res.status(401).json({ error: "X-User-Id header is not allowed in production" });
      return;
    }

    logger.warn(
      { userId, path: req.path },
      "Request authenticated via X-User-Id header (dev-mode fallback)",
    );
    req.user = { id: userId };

    if (organizationId) {
      const db = req.tenantDb!;
      const membership = await db.query.memberships.findFirst({
        where: and(
          eq(schema.memberships.userId, userId),
          eq(schema.memberships.organizationId, organizationId),
        ),
      });

      if (membership) {
        req.membership = { id: membership.id, role: membership.role };
      }
    }

    next();
    return;
  }

  res.status(401).json({ error: "Authorization header is required" });
}

/**
 * BUG-138 (codex r29): admin-only gate. Run AFTER `authMiddleware` —
 * accepts only M2M tokens (Clerk-style backend / secret-key auth) and
 * rejects user session JWTs. Without this, any signed-in user could
 * hit admin endpoints (BUG-137's unlock was the trigger).
 *
 * Future: this should also accept session tokens whose user holds a
 * tenant-level "admin" role, but no such role exists today.
 */
export function requireM2M(req: Request, res: Response, next: NextFunction): void {
  if (req.m2m) {
    next();
    return;
  }
  res.status(403).json({
    error: {
      message:
        "Admin-only endpoint — requires an M2M / secret-key token (backend SDK), not a user session.",
    },
  });
}
