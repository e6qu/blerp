import { Request, Response, NextFunction } from "express";
import { getTenantDb } from "../db/router";

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
