import { Request, Response } from "express";
import { sessionStore } from "../../lib/session";
import { UnauthorizedError, NotFoundError } from "../../lib/errors";

export async function listSessions(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    throw new UnauthorizedError();
  }

  const sessions = await sessionStore.listForUser(userId);
  res.json({ data: sessions });
}

export async function revokeSession(req: Request, res: Response) {
  const sessionId = (req.params.session_id || req.params.id) as string;
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError();
  }

  const session = await sessionStore.get(sessionId);
  if (!session || session.userId !== userId) {
    throw new NotFoundError("Session");
  }

  await sessionStore.revoke(sessionId);
  res.status(204).send();
}
