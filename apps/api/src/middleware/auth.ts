/* eslint-disable @typescript-eslint/no-namespace */
import { Request, Response, NextFunction } from "express";
import * as schema from "../db/schema";
import { eq, and } from "drizzle-orm";
import * as jose from "jose";
import { getKeyPair } from "../lib/keys";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
      membership?: { id: string; role: string };
      m2m?: { clientId: string; scopes: string[] };
    }
  }
}

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
        if (payload.client_id && payload.scope) {
          req.m2m = {
            clientId: payload.client_id as string,
            scopes: (payload.scope as string).split(" "),
          };
          next();
          return;
        }
      } catch {
        // Invalid/expired/forged JWT — fall through to user auth
      }
    }
  }

  if (!userId) {
    res.status(401).json({ error: "X-User-Id header is required" });
    return;
  }

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
}
