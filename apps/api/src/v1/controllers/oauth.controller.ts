import { Request, Response } from "express";
import { OAuthService } from "../services/oauth.service";

export async function authorize(req: Request, res: Response) {
  const provider = req.params.provider as string;
  const redirect_uri = req.query.redirect_uri as string;
  const service = new OAuthService(req.tenantDb!, req.tenantId!);

  try {
    const url = await service.getAuthorizeUrl(provider, redirect_uri);
    res.json({ url });
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function callback(req: Request, res: Response) {
  const provider = req.params.provider as string;
  const code = req.query.code as string;
  const service = new OAuthService(req.tenantDb!, req.tenantId!);

  try {
    const result = await service.handleCallback(provider, code);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}
