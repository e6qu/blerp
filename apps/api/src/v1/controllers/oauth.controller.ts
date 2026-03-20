import { Request, Response } from "express";
import { OAuthService } from "../services/oauth.service";
import { RedirectService } from "../services/redirect.service";

export async function authorize(req: Request, res: Response) {
  const provider = req.params.provider as string;
  const redirect_uri = req.query.redirect_uri as string;
  const service = new OAuthService(req.tenantDb!);

  if (redirect_uri) {
    const redirectService = new RedirectService(req.tenantDb!);
    const allowed = await redirectService.isAllowed(redirect_uri);
    if (!allowed) {
      res.status(400).json({ error: { message: "redirect_uri is not in the allowed list" } });
      return;
    }
  }

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
  const service = new OAuthService(req.tenantDb!);

  try {
    const result = await service.handleCallback(provider, code);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}
