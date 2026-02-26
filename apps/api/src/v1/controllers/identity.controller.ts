import { Request, Response } from "express";
import { IdentityService } from "../services/identity.service";

export async function linkOAuthIdentity(req: Request, res: Response) {
  const userId = req.params.user_id as string;
  const { provider, provider_user_id, email_address } = req.body;
  const service = new IdentityService(req.tenantDb!);

  try {
    const identity = await service.linkOAuthAccount(userId, {
      provider,
      providerUserId: provider_user_id,
      emailAddress: email_address,
    });
    res.status(201).json(identity);
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function listIdentities(req: Request, res: Response) {
  const userId = req.params.user_id as string;
  const service = new IdentityService(req.tenantDb!);

  try {
    const identities = await service.listUserIdentities(userId);
    res.json(identities);
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function unlinkOAuthIdentity(req: Request, res: Response) {
  const userId = req.params.user_id as string;
  const oauthAccountId = req.params.oauth_account_id as string;
  const service = new IdentityService(req.tenantDb!);

  try {
    await service.unlinkOAuthAccount(userId, oauthAccountId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}
