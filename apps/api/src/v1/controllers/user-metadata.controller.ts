/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { validateMetadata } from "../../lib/metadata";

function mapUser(user: any) {
  if (!user) return user;
  const { publicMetadata, privateMetadata, unsafeMetadata, ...rest } = user;
  return {
    ...rest,
    metadata_public: publicMetadata,
    metadata_private: privateMetadata,
    metadata_unsafe: unsafeMetadata,
  };
}

export async function updateMetadata(req: Request, res: Response) {
  const id = req.params.user_id as string;
  const { public_metadata, private_metadata, unsafe_metadata } = req.body;
  const service = new AuthService(req.tenantDb!, req.tenantId!);

  try {
    // Validate Monite-specific structures
    if (public_metadata) validateMetadata(public_metadata);
    if (private_metadata) validateMetadata(private_metadata);
    if (unsafe_metadata) validateMetadata(unsafe_metadata);

    const user = await service.updateUserMetadata(id, {
      publicMetadata: public_metadata,
      privateMetadata: private_metadata,
      unsafeMetadata: unsafe_metadata,
    });
    res.status(200).json(mapUser(user));
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}
