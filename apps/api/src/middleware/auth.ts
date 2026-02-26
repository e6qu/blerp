/* eslint-disable @typescript-eslint/no-namespace */
import { Request, Response, NextFunction } from "express";
import * as schema from "../db/schema";
import { eq, and } from "drizzle-orm";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
      membership?: { id: string; role: string };
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const userId = req.header("X-User-Id");
  const organizationId = req.params.organization_id as string;

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
