import { Request, Response } from "express";
import { randomBytes } from "crypto";
import { AuthService } from "../services/auth.service";

export async function createSignup(req: Request, res: Response) {
  // BUG-114 (codex r20): pass password through to the service so a
  // password sign-up actually installs a credential. OpenAPI already
  // documented the field; only the controller was dropping it.
  const { email, strategy, password } = req.body;
  const authService = new AuthService(req.tenantDb!, req.tenantId!);

  try {
    const signup = await authService.createSignup({ email, strategy, password });
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
    const result = await authService.attemptSignup(id, String(code), email, {
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
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
  const { password, identifier, code, strategy } = req.body;
  const authService = new AuthService(req.tenantDb!, req.tenantId!);

  try {
    // BUG-119 (codex r21): explicit-strategy routing wins over the
    // legacy code-vs-password heuristic. Before this, a caller using
    // an email-code first factor (`{ strategy: "email_code", code,
    // identifier }`) was misrouted to attemptSecondFactor and 400'd
    // because no second factor was pending. Honor an explicit
    // `strategy: "second_factor"` / `"first_factor"` flag, then fall
    // back to: (a) password present → first factor; (b) bare code with
    // no identifier → second factor; (c) code WITH identifier → first
    // factor (email-code/magic-link).
    const isExplicitSecondFactor = strategy === "second_factor";
    const isExplicitFirstFactor = strategy === "first_factor";
    const looksLikeSecondFactor =
      !isExplicitFirstFactor && (isExplicitSecondFactor || (code && !password && !identifier));

    if (looksLikeSecondFactor) {
      const result = await authService.attemptSecondFactor(signinId, String(code), {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });
      res.status(200).json(result);
      return;
    }

    if (!identifier) {
      res.status(400).json({ error: { message: "identifier is required" } });
      return;
    }
    const result = await authService.attemptSignin(signinId, identifier, password, {
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: { message: (error as Error).message } });
  }
}

export async function createTestingToken(req: Request, res: Response) {
  if (process.env.NODE_ENV === "production") {
    res.status(403).json({ error: { message: "Testing tokens are not available in production" } });
    return;
  }

  const { user_id } = req.body as { user_id?: string };
  if (!user_id) {
    res.status(400).json({ error: { message: "user_id is required" } });
    return;
  }

  const token = `test_${randomBytes(32).toString("hex")}`;
  const expiresIn = 3600;

  res.status(201).json({
    token,
    user_id,
    expires_in: expiresIn,
    expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
  });
}
