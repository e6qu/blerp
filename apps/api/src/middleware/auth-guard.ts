import { Request, Response, NextFunction } from "express";
import * as schema from "../db/schema";
import { eq, and } from "drizzle-orm";

export function authGuard(options: { type: "publishable" | "secret" | "any" }) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      res
        .status(401)
        .json({
          error: { code: "unauthorized", message: "Missing or invalid authorization header" },
        });
      return;
    }

    const key = authHeader.split(" ")[1];
    const isPublishable = key.startsWith("pk_");
    const isSecret = key.startsWith("sk_");

    if (options.type === "publishable" && !isPublishable) {
      res
        .status(401)
        .json({ error: { code: "unauthorized", message: "Publishable key required" } });
      return;
    }

    if (options.type === "secret" && !isSecret) {
      res.status(401).json({ error: { code: "unauthorized", message: "Secret key required" } });
      return;
    }

    // Validate key against DB
    const db = req.tenantDb!;
    const keyRecord = await db.query.apiKeys.findFirst({
      where: and(
        eq(schema.apiKeys.key, key),
        // environment logic here
      ),
    });

    if (!keyRecord) {
      // For demo purposes, if it's a test key, allow it
      if (
        process.env.NODE_ENV !== "production" &&
        (key === "pk_test_123" || key === "sk_test_123")
      ) {
        return next();
      }

      res.status(401).json({ error: { code: "unauthorized", message: "Invalid API key" } });
      return;
    }

    next();
  };
}
