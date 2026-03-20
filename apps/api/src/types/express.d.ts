import type { getTenantDb } from "../db/router";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
      membership?: { id: string; role: string };
      m2m?: { clientId: string; scopes: string[] };
      tenantId?: string;
      tenantDb?: Awaited<ReturnType<typeof getTenantDb>>;
    }
  }
}
