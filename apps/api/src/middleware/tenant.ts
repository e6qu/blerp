/* eslint-disable @typescript-eslint/no-namespace */
import { Request, Response, NextFunction } from "express";
import { getTenantDb } from "../db/router";

// Extend Express Request to include tenantDb
declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      tenantDb?: Awaited<ReturnType<typeof getTenantDb>>;
    }
  }
}

export async function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
  const tenantId = req.header("X-Tenant-Id");

  if (!tenantId) {
    res.status(400).json({ error: "X-Tenant-Id header is required" });
    return;
  }

  try {
    req.tenantId = tenantId;
    req.tenantDb = await getTenantDb(tenantId);
    next();
  } catch (error) {
    next(error);
  }
}
