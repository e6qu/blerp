import { Request, Response } from "express";
import { IdentityService } from "../services/identity.service";

interface OAuthAccountRow {
  id: string;
  userId: string;
  provider: string;
  providerUserId: string;
  emailAddress: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  createdAt?: Date | null;
}

interface EmailAddressRow {
  id: string;
  userId: string;
  emailAddress: string;
  verificationStatus: string;
  verificationStrategy?: string | null;
  createdAt?: Date | null;
}

// snake_case projection for the OAuthAccount wire shape — without it the
// dashboard would read `account.provider_user_id` as undefined (BUG-52).
// The Drizzle column is `imageUrl` (DB `image_url`); the previous version
// of this mapper read a nonexistent `avatarUrl` and always emitted null,
// dropping every stored profile image (codex BUG-55).
function mapOAuthAccount(row: OAuthAccountRow) {
  return {
    id: row.id,
    user_id: row.userId,
    provider: row.provider,
    provider_user_id: row.providerUserId,
    email_address: row.emailAddress,
    first_name: row.firstName ?? null,
    last_name: row.lastName ?? null,
    image_url: row.imageUrl ?? null,
    created_at: row.createdAt ? row.createdAt.toISOString() : null,
  };
}

function mapEmailIdentity(row: EmailAddressRow) {
  return {
    id: row.id,
    user_id: row.userId,
    email_address: row.emailAddress,
    verification: {
      status: row.verificationStatus,
      strategy: row.verificationStrategy ?? undefined,
    },
    created_at: row.createdAt ? row.createdAt.toISOString() : null,
  };
}

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
    if (!identity) {
      res.status(500).json({ error: { message: "OAuth account created but lookup failed" } });
      return;
    }
    res.status(201).json(mapOAuthAccount(identity));
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function listIdentities(req: Request, res: Response) {
  const userId = req.params.user_id as string;
  const service = new IdentityService(req.tenantDb!);

  try {
    const identities = await service.listUserIdentities(userId);
    res.json({
      oauth_accounts: (identities.oauth_accounts as OAuthAccountRow[]).map(mapOAuthAccount),
      email_addresses: (identities.email_addresses as EmailAddressRow[]).map(mapEmailIdentity),
    });
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
