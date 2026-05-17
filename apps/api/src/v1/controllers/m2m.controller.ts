import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { M2MService } from "../services/m2m.service";
import { getKeyPair } from "../../lib/keys";
import * as schema from "../../db/schema";

/**
 * BUG-140 (codex r30): privilege-escalation gate. Pre-fix any
 * authenticated user could POST `/v1/m2m-tokens` for any project,
 * receive a client secret, exchange it at `/v1/oauth/token` for an
 * M2M token, and then satisfy `requireM2M` on `/v1/users/:id/unlock`
 * (BUG-138). Net effect: any session = admin.
 *
 * The fix requires one of:
 *   1. An existing M2M token (admin → admin chain of trust).
 *   2. A session whose user is the **owner** of the target project.
 *
 * Listing / revoke routes get the same gate so admins can't be
 * surveilled or have their tokens nuked by random users.
 */
async function assertProjectOwnerOrM2M(req: Request, projectId: string): Promise<void> {
  if (req.m2m) {
    // BUG-142 (codex r31): M2M tokens are scoped to one project; an
    // M2M token from project A can no longer act on project B.
    // BUG-147 dev shim: see requireProjectAccess — dev-shim clientId
    // is a wildcard so tests using X-User-Id keep working.
    const isDevShim = req.m2m.clientId.startsWith("dev-shim");
    if (!isDevShim && req.m2m.projectId !== projectId) {
      throw new ProjectAuthError(
        "M2M token is scoped to a different project. Mint a token for this project.",
      );
    }
    return; // chain-of-trust within the same project (or dev shim).
  }
  const userId = req.user?.id;
  if (!userId) {
    throw new ProjectAuthError("Authentication required.");
  }
  const project = await req.tenantDb!.query.projects.findFirst({
    where: eq(schema.projects.id, projectId),
  });
  if (!project) {
    throw new ProjectAuthError("Project not found.");
  }
  if (project.ownerUserId !== userId) {
    throw new ProjectAuthError("Only the project owner or an M2M token can manage M2M tokens.");
  }
}

class ProjectAuthError extends Error {}

function handleAuthError(err: unknown, res: Response): boolean {
  if (err instanceof ProjectAuthError) {
    res.status(403).json({ error: { message: err.message } });
    return true;
  }
  return false;
}

export async function createM2MToken(req: Request, res: Response) {
  const { name, scopes, project_id } = req.body as {
    name?: string;
    scopes?: string[];
    project_id?: string;
  };

  if (!name) {
    res.status(400).json({ error: { message: "name is required" } });
    return;
  }
  if (!project_id) {
    res.status(400).json({ error: { message: "project_id is required" } });
    return;
  }

  try {
    await assertProjectOwnerOrM2M(req, project_id);
  } catch (err) {
    if (handleAuthError(err, res)) return;
    throw err;
  }

  // BUG-145 (codex r32): chain-of-trust on admin scopes.
  // BUG-186 (codex r51): widen the gate to tenant-wide scopes too.
  // BUG-187 (codex r52): generalise the M2M branch — an M2M minter
  // must hold EVERY requested scope, not just the privileged ones.
  // Pre-r52 a `webhooks:read` token could call `POST /v1/m2m-tokens`
  // for its own project and grant itself `webhooks:write` /
  // `org:write` / `members:write`, because the project-bound
  // scopes weren't on the privileged-scope list. Full chain-of-
  // trust closes that — every scope only flows down the tree.
  //
  // For plain session minters (project owners), only the tenant-wide
  // / `:admin` set is gated (BUG-186) — project-bound scopes still
  // mintable by the project owner because those controllers scope by
  // project at the row level (BUG-161 audit, BUG-162 webhooks, etc.).
  // Dev-shim sessions carry the full scope list so test surfaces are
  // unaffected.
  const TENANT_WIDE_PREFIXES = [
    "users:",
    "signup_restrictions:",
    "redirect_urls:",
    "usage:",
  ] as const;
  function isPrivilegedScope(scope: string): boolean {
    if (scope.endsWith(":admin")) return true;
    return TENANT_WIDE_PREFIXES.some((p) => scope.startsWith(p));
  }
  const requestedScopes = scopes ?? [];

  if (req.m2m) {
    // BUG-187 (codex r52): full chain-of-trust — every requested
    // scope must already be held by the minting M2M.
    const missing = requestedScopes.filter((s) => !req.m2m!.scopes.includes(s));
    if (missing.length > 0) {
      res.status(403).json({
        error: {
          message: `Cannot grant scopes the caller does not hold: ${missing.join(", ")}.`,
        },
      });
      return;
    }
  } else {
    // Plain session minter (project owner): only tenant-wide / :admin
    // scopes are gated (BUG-186); project-bound scopes are OK.
    const privilegedScopes = requestedScopes.filter(isPrivilegedScope);
    if (privilegedScopes.length > 0) {
      res.status(403).json({
        error: {
          message:
            "Privileged scopes (tenant-wide or `:admin`) can only be granted by an existing M2M " +
            "token that already holds them. " +
            `Requested: ${privilegedScopes.join(", ")}.`,
        },
      });
      return;
    }
  }

  const m2mService = new M2MService(req.tenantDb!);
  try {
    const token = await m2mService.create(project_id, { name, scopes });
    res.status(201).json(token);
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function listM2MTokens(req: Request, res: Response) {
  const projectId = (req.query.project_id as string) ?? req.tenantId;
  if (!projectId) {
    res.status(400).json({ error: { message: "project_id is required" } });
    return;
  }

  try {
    await assertProjectOwnerOrM2M(req, projectId);
  } catch (err) {
    if (handleAuthError(err, res)) return;
    throw err;
  }

  const m2mService = new M2MService(req.tenantDb!);
  const tokens = await m2mService.list(projectId);
  res.json({ data: tokens });
}

export async function revokeM2MToken(req: Request, res: Response) {
  const id = req.params.id as string;
  const m2mService = new M2MService(req.tenantDb!);
  // Look up the token first to find its project so we can authorise.
  const token = await m2mService.findById(id);
  if (!token) {
    res.status(404).json({ error: { message: "M2M token not found." } });
    return;
  }
  try {
    await assertProjectOwnerOrM2M(req, token.projectId);
  } catch (err) {
    if (handleAuthError(err, res)) return;
    throw err;
  }
  // BUG-187 (codex r52): a low-scope M2M caller must not be able to
  // revoke a higher-scope peer token. Without this check, a
  // `webhooks:read` token could DoS / privilege-downgrade an admin
  // token by revoking it. The dev-shim has every scope so it's
  // unaffected. Project-owner sessions can revoke any token in
  // their project (full project authority).
  if (req.m2m && !req.m2m.clientId.startsWith("dev-shim")) {
    const targetScopes = (token.scopes as string[]) ?? [];
    const missing = targetScopes.filter((s) => !req.m2m!.scopes.includes(s));
    if (missing.length > 0) {
      res.status(403).json({
        error: {
          message: `Cannot revoke a token whose scopes the caller does not hold: ${missing.join(", ")}.`,
        },
      });
      return;
    }
  }
  await m2mService.revoke(id);
  res.status(204).send();
}

export async function clientCredentialsGrant(req: Request, res: Response) {
  const { grant_type, client_id, client_secret, scope } = req.body as {
    grant_type?: string;
    client_id?: string;
    client_secret?: string;
    scope?: string;
  };

  if (grant_type !== "client_credentials") {
    res.status(400).json({ error: "unsupported_grant_type" });
    return;
  }

  if (!client_id || !client_secret) {
    res.status(400).json({
      error: "invalid_request",
      error_description: "client_id and client_secret are required",
    });
    return;
  }

  const m2mService = new M2MService(req.tenantDb!);
  const tokenRecord = await m2mService.authenticate(client_id, client_secret);

  if (!tokenRecord) {
    res.status(401).json({ error: "invalid_client" });
    return;
  }

  const requestedScopes = scope ? scope.split(" ") : tokenRecord.scopes;
  const grantedScopes = requestedScopes.filter((s: string) => tokenRecord.scopes.includes(s));

  const keyPair = await getKeyPair();
  // BUG-142 (codex r31): pass the token's project so it gets baked
  // into the JWT and downstream checks can enforce project scoping.
  // BUG-149 (codex r34): also pass the tenant so the JWT is bound to
  // the tenant it was minted in. Without this, a tenant-A token could
  // be replayed with X-Tenant-Id: tenantB.
  const accessToken = await m2mService.generateJwt(
    client_id,
    tokenRecord.projectId,
    req.tenantId!,
    grantedScopes,
    keyPair.privateKey,
  );

  res.json({
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: 3600,
    scope: grantedScopes.join(" "),
  });
}
