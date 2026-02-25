import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

export async function createSignup(req: Request, res: Response) {
  const { email, strategy } = req.body;
  const authService = new AuthService(req.tenantDb!);

  try {
    const signup = await authService.createSignup({ email, strategy });
    res.status(201).json(signup);
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function attemptSignup(req: Request, res: Response) {
  const id = req.params.id as string;
  const code = req.body.code as string;
  const authService = new AuthService(req.tenantDb!);

  try {
    const result = await authService.attemptSignup(id, String(code));
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}
