import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

export async function createSignup(req: Request, res: Response) {
  const { email, strategy } = req.body;
  const authService = new AuthService(req.tenantDb!, req.tenantId!);

  try {
    const signup = await authService.createSignup({ email, strategy });
    res.status(201).json(signup);
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function attemptSignup(req: Request, res: Response) {
  const id = req.params.id as string;
  const { code, email } = req.body;
  const authService = new AuthService(req.tenantDb!, req.tenantId!);

  try {
    const result = await authService.attemptSignup(id, String(code), email);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function createSignin(req: Request, res: Response) {
  const { identifier, strategy } = req.body;
  const authService = new AuthService(req.tenantDb!, req.tenantId!);

  try {
    const signin = await authService.createSignin({ identifier, strategy });
    res.status(201).json(signin);
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function attemptSignin(req: Request, res: Response) {
  const signinId = req.params.signin_id as string;
  const { password, identifier } = req.body;
  const authService = new AuthService(req.tenantDb!, req.tenantId!);

  try {
    if (!identifier) {
      res.status(400).json({ error: { message: "identifier is required" } });
      return;
    }
    const result = await authService.attemptSignin(signinId, identifier, password);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}
