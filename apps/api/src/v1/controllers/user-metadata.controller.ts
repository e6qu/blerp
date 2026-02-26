import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

export async function updateMetadata(req: Request, res: Response) {
  const id = req.params.user_id as string;
  const { public_metadata, private_metadata, unsafe_metadata } = req.body;
  const service = new AuthService(req.tenantDb!, req.tenantId!);

  try {
    const user = await service.updateUserMetadata(id, {
      publicMetadata: public_metadata,
      privateMetadata: private_metadata,
      unsafeMetadata: unsafe_metadata,
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}
