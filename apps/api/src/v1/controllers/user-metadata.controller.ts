import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { validateMetadata, Metadata } from "../../lib/metadata";
import { mapUser, type UserWithRelations } from "./user.controller";

// BUG-128 (codex r24): import mapUser instead of duplicating it. The
// prior local copy had drifted from user.controller's version, so
// PATCH /v1/users/:id/metadata responses silently omitted
// password_enabled / totp_enabled / backup_code_enabled /
// two_factor_enabled. A single shared mapper prevents future drift.

export async function updateMetadata(req: Request, res: Response) {
  const id = req.params.user_id as string;
  const { public_metadata, private_metadata, unsafe_metadata } = req.body;
  const service = new AuthService(req.tenantDb!, req.tenantId!);

  try {
    if (public_metadata) validateMetadata(public_metadata as Metadata);
    if (private_metadata) validateMetadata(private_metadata as Metadata);
    if (unsafe_metadata) validateMetadata(unsafe_metadata as Metadata);

    const user = await service.updateUserMetadata(id, {
      publicMetadata: public_metadata as Metadata,
      privateMetadata: private_metadata as Metadata,
      unsafeMetadata: unsafe_metadata as Metadata,
    });
    if (!user) throw new Error("User not found");

    res.status(200).json(mapUser(user as UserWithRelations));
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}
