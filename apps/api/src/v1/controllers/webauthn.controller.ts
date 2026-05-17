import { Request, Response } from "express";
import { WebAuthnService } from "../services/webauthn.service";

interface PasskeyRow {
  id: string;
  name: string;
  createdAt: Date | null;
  lastUsedAt: Date | null;
}

// snake_case projection that matches the OpenAPI PasskeyCredential schema and
// omits server-only credential material (publicKey, counter, credentialId).
function mapPasskey(row: PasskeyRow) {
  return {
    id: row.id,
    friendly_name: row.name,
    transports: [] as string[],
    created_at: row.createdAt ? row.createdAt.toISOString() : null,
    last_used_at: row.lastUsedAt ? row.lastUsedAt.toISOString() : null,
  };
}

// The WebAuthn service throws Error("Passkey not found") for both
// missing-id and not-owner-of-passkey. The OpenAPI contract for the
// PATCH and DELETE routes documents this as 404, so map it explicitly
// instead of letting the generic catch downgrade it to 400.
function sendPasskeyError(res: Response, error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown error";
  if (/passkey not found/i.test(message)) {
    res.status(404).json({ error: { message } });
    return;
  }
  res.status(400).json({ error: { message } });
}

export async function getRegistrationOptions(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const service = new WebAuthnService(req.tenantDb!);
  try {
    const options = await service.generateRegistrationOptions(userId);
    res.json(options);
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function verifyRegistration(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { name, ...credential } = (req.body ?? {}) as Record<string, unknown> & { name?: string };
  const service = new WebAuthnService(req.tenantDb!);
  try {
    const result = await service.verifyRegistration(userId, credential, name);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function listPasskeys(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const service = new WebAuthnService(req.tenantDb!);
  try {
    const passkeys = await service.listPasskeys(userId);
    res.json({ data: passkeys.map(mapPasskey) });
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function renamePasskey(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const passkeyId = req.params.passkey_id as string;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: { message: "Name is required" } });

  const service = new WebAuthnService(req.tenantDb!);
  try {
    const passkey = await service.renamePasskey(userId, passkeyId, name);
    if (!passkey) return res.status(404).json({ error: { message: "Passkey not found" } });
    res.json(mapPasskey(passkey));
  } catch (error) {
    sendPasskeyError(res, error);
  }
}

export async function deletePasskey(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const passkeyId = req.params.passkey_id as string;
  const service = new WebAuthnService(req.tenantDb!);
  try {
    await service.deletePasskey(userId, passkeyId);
    res.status(204).send();
  } catch (error) {
    sendPasskeyError(res, error);
  }
}
