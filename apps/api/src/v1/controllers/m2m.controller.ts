import { Request, Response } from "express";
import { M2MService } from "../services/m2m.service";
import { getKeyPair } from "../../lib/keys";

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

  const m2mService = new M2MService(req.tenantDb!);
  const tokens = await m2mService.list(projectId);
  res.json({ data: tokens });
}

export async function revokeM2MToken(req: Request, res: Response) {
  const id = req.params.id as string;
  const m2mService = new M2MService(req.tenantDb!);

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
    res
      .status(400)
      .json({
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
  const accessToken = await m2mService.generateJwt(client_id, grantedScopes, keyPair.privateKey);

  res.json({
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: 3600,
    scope: grantedScopes.join(" "),
  });
}
