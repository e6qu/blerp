import type { getTenantDb } from "../db/router";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
      membership?: { id: string; role: string };
      // BUG-142 (codex r31): bind M2M auth to its project so a token
      // minted for project A can't act on project B. Tokens issued
      // before this fix may not carry projectId; authMiddleware loads
      // it from the DB by clientId as a back-compat path.
      m2m?: { clientId: string; scopes: string[]; projectId: string };
      tenantId?: string;
      tenantDb?: Awaited<ReturnType<typeof getTenantDb>>;
    }
  }
}
